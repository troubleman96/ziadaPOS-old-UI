'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { aiApi, AIConversationListItem, AICreditsStatus, AISuggestion, AIMessage } from '../../lib/api';
import { getCachedUser } from '../../lib/auth';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: boolean;
  ts: Date;
  sources?: string[];
}

// Fallback prompts shown before /ai/suggestions/ has loaded
const DEFAULT_PROMPTS: AISuggestion[] = [
  { icon: '📊', label: 'Nionyeshe uchambuzi wa mauzo wiki hii', key: 'sales' },
  { icon: '📦', label: 'Bidhaa zipi zinahitaji kununuliwa sasa?', key: 'stock' },
  { icon: '💳', label: 'Hali ya madeni ya wateja wangu', key: 'credit' },
  { icon: '💰', label: 'Uchambuzi wa faida mwezi huu', key: 'profit' },
];

function welcomeMessage(firstName: string): Message {
  return {
    id: 'm0', role: 'assistant', ts: new Date(),
    content: `Habari, **${firstName}**! Mimi ni Ziada AI — msaidizi wako wa biashara. 🏪

Ninajua duka lako vizuri: mapato ya leo, hali ya stoo, madeni ya wateja, na zaidi. Niambie unachohitaji — kwa Kiswahili au Kiingereza.

**Ninaweza kukusaidia na:**
- Uchambuzi wa mauzo na faida
- Hali ya stoo na mapendekezo ya ununuzi
- Usimamizi wa madeni ya wateja
- Ripoti na utabiri wa biashara
- Maswali yoyote kuhusu duka lako`,
    sources: ['Sales data', 'Inventory', 'Credits'],
  };
}

// ── Speech recognition typings ────────────────────────────────────────────────
// The Web Speech API isn't in TS's standard DOM lib, so declare the minimal
// surface we use (Chrome/Android expose it as `webkitSpeechRecognition`).
interface SpeechResultAlt { transcript: string }
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<SpeechResultAlt>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Track a CSS media query on the client. */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/**
 * Measure the on-screen keyboard inset via the VisualViewport API.
 * Returns how many px the keyboard is currently covering at the bottom.
 * `0` when no keyboard is up (or the API is unavailable).
 */
function useKeyboardInset() {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // Layout-viewport height minus the visible visual-viewport height and
        // any top offset = the space the keyboard (and any UA chrome) covers.
        const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        setInset(covered);
      });
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      cancelAnimationFrame(raf);
    };
  }, []);
  return inset;
}

// ── Components ────────────────────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '6px 0' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--accent)',
          animation: `thinkDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          display: 'inline-block',
        }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg, initials, onCopy, copied }: {
  msg: Message; initials: string; onCopy: (m: Message) => void; copied: boolean;
}) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'flex-start',
      padding: '12px 0',
      flexDirection: isUser ? 'row-reverse' : 'row',
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: isUser ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'var(--accent)',
        display: 'grid', placeItems: 'center',
        fontSize: 12, fontWeight: 600, color: '#fff',
      }}>
        {isUser ? initials : 'Z'}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '72%', minWidth: 0 }} className="ai-bubble-col">
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
          background: isUser ? 'var(--accent)' : 'var(--bg-2)',
          border: isUser ? 'none' : '1px solid var(--line)',
          color: isUser ? '#fff' : 'var(--fg)',
          fontSize: 13.5, lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
        }}>
          {msg.thinking ? <ThinkingDots /> : <MarkdownLite text={msg.content} />}
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
          <span>{msg.ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          {!isUser && !msg.thinking && (
            <button
              onClick={() => onCopy(msg)}
              className="ai-copy-btn"
              title={copied ? 'Copied' : 'Copy'}
              aria-label={copied ? 'Copied' : 'Copy message'}
            >
              {copied ? Icons.check : Icons.copy}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
          {msg.sources && msg.sources.length > 0 && (
            <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {msg.sources.map(s => <span key={s} style={{ padding: '1px 5px', border: '1px solid var(--line-2)', borderRadius: 4, color: 'var(--fg-3)' }}>{s}</span>)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MarkdownLite({ text }: { text: string }) {
  // Very lightweight markdown: bold, tables, bullets
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
          return <div key={i} style={{ fontWeight: 600, marginBottom: 4 }}>{line.slice(2, -2)}</div>;
        }
        if (line.startsWith('- ') || line.startsWith('🔴') || line.startsWith('🟡') || line.startsWith('⚠️') || line.startsWith('⏰')) {
          return <div key={i} style={{ paddingLeft: 4, marginBottom: 2 }}>{renderInline(line)}</div>;
        }
        if (line.startsWith('#')) {
          const level = (line.match(/^#+/) || [''])[0].length;
          return <div key={i} style={{ fontWeight: 600, fontSize: level === 1 ? 16 : 14, marginBottom: 4, marginTop: 6 }}>{line.replace(/^#+\s/, '')}</div>;
        }
        if (line.startsWith('|')) {
          return <TableRow key={i} line={line} />;
        }
        if (line === '') return <div key={i} style={{ height: 6 }} />;
        return <div key={i}>{renderInline(line)}</div>;
      })}
    </>
  );
}

function TableRow({ line }: { line: string }) {
  if (line.includes('---')) return null;
  const cells = line.split('|').filter(Boolean).map(s => s.trim());
  return (
    <div style={{ display: 'flex', gap: 1, marginBottom: 1 }}>
      {cells.map((c, i) => (
        <div key={i} style={{ flex: i === 0 ? '0 0 120px' : 1, padding: '3px 8px', background: 'var(--bg-3)', borderRadius: 3, fontSize: 12.5 }}>
          {renderInline(c)}
        </div>
      ))}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : p
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AIPage() {
  const user = getCachedUser();
  const firstName = user?.first_name || 'there';
  const initials = (((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase()) || 'U';

  const [messages, setMessages] = useState<Message[]>([welcomeMessage(firstName)]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [conversations, setConversations] = useState<AIConversationListItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(DEFAULT_PROMPTS);
  const [aiCredits, setAiCredits] = useState<AICreditsStatus | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // ── Mobile keyboard handling ──────────────────────────────────────────────
  const isMobile = useMediaQuery('(max-width: 900px)');
  const kbInset = useKeyboardInset();
  const kbOpen = isMobile && kbInset > 80;

  // While the keyboard is up on mobile, hide the bottom tab bar and drop the
  // shell's bottom padding so the composer can sit flush above the keyboard.
  useEffect(() => {
    document.body.classList.toggle('ai-kb-open', kbOpen);
    return () => document.body.classList.remove('ai-kb-open');
  }, [kbOpen]);

  // Shrink the chat column to the space the keyboard leaves so the composer
  // and the latest message stay visible instead of hiding behind the keyboard.
  const layoutStyle: React.CSSProperties = kbOpen
    ? { height: `calc(100dvh - var(--topbar-h) - ${kbInset}px)`, flex: 'none' }
    : {};

  // ── Speech recognition (voice input) ──────────────────────────────────────
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechBaseRef = useRef('');
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = 'sw-TZ';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      setInput((speechBaseRef.current + transcript).trimStart());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setSpeechSupported(true);
    return () => { try { rec.abort(); } catch { /* ignore */ } };
  }, []);

  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      speechBaseRef.current = input ? input + ' ' : '';
      try {
        rec.start();
        setListening(true);
      } catch { /* already started */ }
    }
  };

  const loadConversations = useCallback(() => {
    aiApi.getConversations().then((res) => { if (res.success) setConversations(res.data); });
  }, []);

  useEffect(() => {
    loadConversations();
    aiApi.getSuggestions().then((res) => {
      if (res.success) {
        if (res.data.suggestions.length) setSuggestions(res.data.suggestions);
        setAiCredits(res.data.ai_credits);
      }
    });
  }, [loadConversations]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keep the latest message in view when the keyboard opens/closes.
  useEffect(() => {
    if (kbOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [kbOpen]);

  const resetTextareaHeight = () => {
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); }
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), ts: new Date() };
    const thinkMsg: Message = { id: 'thinking', role: 'assistant', content: '', thinking: true, ts: new Date() };
    setMessages(m => [...m, userMsg, thinkMsg]);
    setInput('');
    resetTextareaHeight();
    setLoading(true);
    setSendError(null);

    let assistant: AIMessage;
    if (activeConversationId) {
      const result = await aiApi.continueChat(activeConversationId, text.trim());
      setLoading(false);
      if (!result.success) {
        setMessages(m => m.filter(x => x.id !== 'thinking'));
        setSendError(result.message);
        return;
      }
      assistant = result.data.message;
    } else {
      const result = await aiApi.startChat(text.trim());
      setLoading(false);
      if (!result.success) {
        setMessages(m => m.filter(x => x.id !== 'thinking'));
        setSendError(result.message);
        return;
      }
      assistant = result.data.message;
      setActiveConversationId(result.data.conversation_id);
    }

    const aiMsg: Message = {
      id: assistant.id,
      role: 'assistant',
      content: assistant.content,
      ts: new Date(assistant.created_at),
      sources: assistant.sources,
    };
    setMessages(m => m.filter(x => x.id !== 'thinking').concat(aiMsg));
    loadConversations();
  }, [loading, listening, activeConversationId, loadConversations]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const copyMessage = (m: Message) => {
    navigator.clipboard?.writeText(m.content).then(() => {
      setCopiedId(m.id);
      setTimeout(() => setCopiedId((cur) => (cur === m.id ? null : cur)), 1600);
    }).catch(() => { /* clipboard unavailable */ });
  };

  const exportChat = () => {
    const body = messages
      .filter((m) => !m.thinking)
      .map((m) => {
        const who = m.role === 'user' ? firstName : 'Ziada AI';
        return `### ${who} · ${m.ts.toLocaleString('en-GB')}\n\n${m.content}\n`;
      })
      .join('\n');
    const blob = new Blob([`# Ziada AI conversation\n\n${body}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ziada-ai-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const newChat = () => {
    setActiveConversationId(null);
    setSendError(null);
    setHistoryOpen(false);
    setMessages([welcomeMessage(firstName)]);
    setInput('');
    resetTextareaHeight();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const openConversation = async (id: string) => {
    setHistoryOpen(false);
    if (id === activeConversationId) return;
    setSendError(null);
    const res = await aiApi.getConversation(id);
    if (!res.success) return;
    setActiveConversationId(id);
    setMessages(res.data.messages.map((m) => ({
      id: m.id, role: m.role, content: m.content, ts: new Date(m.created_at), sources: m.sources,
    })));
  };

  const hasConversation = messages.filter((m) => !m.thinking).length > 1;

  return (
    <AppShell
      full
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Ziada AI' }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={newChat} className="btn btn-soft" style={{ padding: '6px 12px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.plus} New chat
          </button>
          <button onClick={exportChat} disabled={!hasConversation} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5, opacity: hasConversation ? 1 : 0.4 }} title="Export conversation as Markdown">
            {Icons.download} Export
          </button>
        </div>
      }
    >
      <style>{`
        @keyframes thinkDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .ai-layout { display: grid; grid-template-columns: 240px 1fr; flex: 1; min-height: 0; overflow: hidden; position: relative; }
        .ai-sidebar { display: flex; flex-direction: column; border-right: 1px solid var(--line); background: var(--bg-2); min-height: 0; overflow-y: auto; }
        .ai-main { display: flex; flex-direction: column; min-height: 0; min-width: 0; }
        .ai-messages { flex: 1; overflow-y: auto; padding: 24px 28px; -webkit-overflow-scrolling: touch; }
        .ai-input-bar { border-top: 1px solid var(--line); padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 0px)); background: var(--bg); flex-shrink: 0; }
        .ai-input-wrap { display: flex; gap: 10px; align-items: flex-end; border: 1px solid var(--line); border-radius: 12px; padding: 8px 8px 8px 16px; background: var(--bg-2); transition: border-color 120ms, box-shadow 120ms; }
        .ai-input-wrap:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
        .ai-chat-item { padding: 10px 14px; border-radius: 8px; cursor: pointer; transition: background 100ms; margin-bottom: 2px; }
        .ai-chat-item:hover { background: var(--bg-3); }
        .ai-chat-item.active { background: var(--accent-soft); border: 1px solid var(--accent-line); }
        .prompt-chip { padding: 8px 14px; border-radius: 20px; border: 1px solid var(--line); background: var(--bg-2); font-size: 12.5px; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: all 100ms; white-space: nowrap; color: var(--fg-2); }
        .prompt-chip:hover { border-color: var(--accent-line); background: var(--accent-soft); color: var(--fg); }
        .ai-copy-btn { display: inline-flex; align-items: center; gap: 4px; background: none; border: 0; padding: 0; cursor: pointer; color: var(--fg-4); font-family: var(--mono); font-size: 10px; transition: color 120ms; }
        .ai-copy-btn:hover { color: var(--accent); }
        .ai-copy-btn svg { width: 11px; height: 11px; }
        .ai-history-toggle { display: none; }
        .ai-mic-pulse { animation: aiMicPulse 1.4s ease-in-out infinite; }
        @keyframes aiMicPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.5); } 50% { box-shadow: 0 0 0 6px rgba(248,113,113,0); } }
        .ai-sidebar-backdrop { display: none; }

        @media (max-width: 900px) {
          .ai-layout { grid-template-columns: 1fr; }
          .ai-sidebar {
            position: fixed; top: var(--topbar-h); bottom: 0; left: 0;
            width: min(300px, 85vw); z-index: 170;
            transform: translateX(-100%);
            transition: transform 240ms cubic-bezier(0.25,0.46,0.45,0.94);
          }
          .ai-sidebar.open { transform: translateX(0); box-shadow: 12px 0 40px rgba(0,0,0,0.35); }
          .ai-sidebar-backdrop.open {
            display: block; position: fixed; inset: var(--topbar-h) 0 0 0;
            background: rgba(0,0,0,0.45); z-index: 165; animation: aiFade 200ms ease;
          }
          @keyframes aiFade { from { opacity: 0; } to { opacity: 1; } }
          .ai-history-toggle { display: inline-flex; }
          .ai-messages { padding: 18px 16px; }
          .ai-input-bar { padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0px)); }
          .ai-bubble-col { max-width: 84% !important; }
        }

        /* Keyboard-open state: reclaim the space taken by the bottom tab bar. */
        body.ai-kb-open .bottom-nav { display: none !important; }
        body.ai-kb-open .main { padding-bottom: 0 !important; }
      `}</style>

      <div className="ai-layout" style={layoutStyle}>
        {/* Backdrop for the mobile history drawer */}
        <div
          className={'ai-sidebar-backdrop' + (historyOpen ? ' open' : '')}
          onClick={() => setHistoryOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar: chat history */}
        <div className={'ai-sidebar' + (historyOpen ? ' open' : '')}>
          <div style={{ padding: '14px 14px 8px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
            <button onClick={newChat} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icons.plus} New chat
            </button>
          </div>

          {/* Context chip */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
            <div style={{ padding: '8px 10px', background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', borderRadius: 7 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--accent)', marginBottom: 3 }}>{Icons.sparkles} Store context loaded</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>Duka Kuu · May 2026 · Live data</div>
            </div>
          </div>

          {/* History */}
          <div style={{ padding: '10px 10px', flex: 1 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', padding: '4px 6px 8px' }}>RECENT CHATS</div>
            {conversations.length === 0 && (
              <div style={{ padding: '8px 6px', fontSize: 11.5, color: 'var(--fg-4)' }}>No conversations yet.</div>
            )}
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => openConversation(c.id)}
                className={'ai-chat-item' + (c.id === activeConversationId ? ' active' : '')}
              >
                <div style={{ fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.first_message_preview}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 4 }}>{new Date(c.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
              </div>
            ))}
          </div>

          {/* Capability strip */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginBottom: 8, letterSpacing: '0.06em' }}>CAN ACCESS</div>
            {['Sales & revenue', 'Inventory levels', 'Customer credits', 'Staff & shifts'].map(c => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <span className="dot-s" style={{ background: 'var(--good)', flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{c}</span>
              </div>
            ))}
            {aiCredits && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginBottom: 4 }}>AI CREDITS</div>
                <div className="mono" style={{ fontSize: 12, color: aiCredits.pct_used >= 90 ? 'var(--bad)' : 'var(--fg-2)' }}>
                  {aiCredits.remaining.toLocaleString()} / {aiCredits.allocated.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="ai-main">
          {/* Messages */}
          <div className="ai-messages">
            {/* Mobile-only history toggle */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 4 }}>
              <button
                className="btn btn-soft ai-history-toggle"
                onClick={() => setHistoryOpen(true)}
                style={{ padding: '6px 12px', fontSize: 12, alignItems: 'center', gap: 6 }}
              >
                {Icons.list} History
                {conversations.length > 0 && (
                  <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>{conversations.length}</span>
                )}
              </button>
            </div>

            {/* Suggested prompts — show when only the welcome message is present */}
            {messages.length <= 1 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, overflow: 'hidden', margin: '0 auto 12px', flexShrink: 0 }}>
                    <Image src="/ziada-final.jpeg" alt="Ziada AI" width={56} height={56} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>Ziada AI</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 4 }}>Msaidizi wako wa biashara • Your business assistant</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                  {suggestions.map((p) => (
                    <button key={p.label} className="prompt-chip" onClick={() => send(p.label)}>
                      <span>{p.icon}</span> {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                msg={m}
                initials={initials}
                onCopy={copyMessage}
                copied={copiedId === m.id}
              />
            ))}
            {sendError && (
              <div style={{ margin: '8px 0', padding: '10px 14px', borderRadius: 8, background: 'var(--bad-soft)', border: '1px solid rgba(248,113,113,0.25)', fontSize: 12.5, color: 'var(--bad)' }}>
                {sendError}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggested prompts bar (visible at bottom when not loading) */}
          {messages.length > 1 && !loading && !kbOpen && (
            <div style={{ padding: '6px 24px 0', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
              {suggestions.slice(0, 4).map((p) => (
                <button key={p.label} className="prompt-chip" style={{ fontSize: 11.5, padding: '5px 10px' }} onClick={() => send(p.label)}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="ai-input-bar">
            {listening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: 'var(--bad)' }}>
                <span className="dot-s ai-mic-pulse" style={{ background: 'var(--bad)', borderRadius: '50%', width: 8, height: 8, flexShrink: 0 }} />
                Inasikiliza… ongea sasa · Listening…
              </div>
            )}
            <div className="ai-input-wrap">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Uliza swali kuhusu duka lako…"
                rows={1}
                enterKeyHint="send"
                aria-label="Message Ziada AI"
                style={{
                  flex: 1, background: 'transparent', border: 0, outline: 0, resize: 'none',
                  color: 'var(--fg)', fontSize: 16, fontFamily: 'inherit', lineHeight: 1.5,
                  maxHeight: 120, overflowY: 'auto',
                  scrollbarWidth: 'thin', minWidth: 0,
                }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
              />
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                {speechSupported && (
                  <button
                    onClick={toggleListening}
                    className={'icon-btn' + (listening ? ' ai-mic-pulse' : '')}
                    title={listening ? 'Stop listening' : 'Voice input'}
                    aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                    aria-pressed={listening}
                    style={{ width: 34, height: 34, background: listening ? 'var(--bad-soft)' : undefined, borderColor: listening ? 'var(--bad)' : undefined }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <g stroke={listening ? 'var(--bad)' : 'currentColor'} strokeWidth="1.4" strokeLinecap="round">
                        <rect x="5.5" y="1.5" width="5" height="7" rx="2.5" />
                        <path d="M2.5 8a5.5 5.5 0 0 0 11 0" />
                        <path d="M8 13.5v1.5" />
                      </g>
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  className="btn btn-primary"
                  aria-label="Send message"
                  style={{ height: 34, padding: '0 14px', fontSize: 12.5, opacity: (!input.trim() || loading) ? 0.4 : 1 }}
                >
                  {loading ? '…' : 'Send'} <span className="mono" style={{ marginLeft: 3 }}>↵</span>
                </button>
              </div>
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 6, textAlign: 'center' }}>
              Ziada AI inaweza kukosea. Thibitisha habari muhimu. · AI can make mistakes. Verify important information.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
