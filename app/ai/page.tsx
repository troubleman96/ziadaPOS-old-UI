'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: boolean;
  ts: Date;
  sources?: string[];
}

interface Chat {
  id: string;
  title: string;
  lastMsg: string;
  ts: Date;
  messages: Message[];
}

// ── Canned AI responses (simulated) ───────────────────────────────────────────
const AI_RESPONSES: Record<string, string> = {
  default: `Nimesikia swali lako. Kwa mujibu wa data ya duka lako la **Duka Kuu**, hapa kuna jibu:

**Muhtasari wa sasa:**
- Leo umepata mapato ya **TZS 1,842,000** (ongezeko la 12% kuliko jana)
- Bidhaa 3 ziko chini ya kiwango cha chini: Sabuni ya OMO, Chai Bora, Mafuta Cooking 1L
- Madeni ya wateja: **TZS 330,000** kutoka kwa wateja 5

Je, ungependa nijieleze zaidi kuhusu jambo lolote kati ya hizi?`,

  sales: `**Uchambuzi wa Mauzo — Wiki hii**

Duka lako limefanya vizuri wiki hii! Hapa ni muhtasari:

| Siku | Mapato | Miamala |
|------|--------|---------|
| Jumatatu | TZS 1,240,000 | 58 |
| Jumanne | TZS 980,000 | 44 |
| Jumatano | TZS 1,580,000 | 71 |
| Alhamisi | TZS 1,820,000 | 86 |
| Ijumaa | TZS 2,140,000 | 98 |

**Ijumaa** ndiyo siku bora zaidi — 2× wastani wa siku za kawaida. Napendekeza uongeze wafanyakazi saa 14:00–16:00 siku za Ijumaa.

**Bidhaa bora:** Unga wa Sembe 10kg (TZS 342,000), Mafuta ya Cooking 5L (TZS 272,000), Soda Coca-Cola 500ml (TZS 180,000)`,

  stock: `**Hali ya Stoo — Leo**

Bidhaa zinazohitaji kununuliwa haraka:

🔴 **Nje ya Stoo:** Hakuna bidhaa kwa sasa
🟡 **Karibu Kumalizika:**
- Sabuni ya OMO 1kg → **Imebaki 3** (chini ya kiwango cha 15)
- Chai Bora 500g → **Imebaki 5** (chini ya 10)
- Mafuta Cooking 1L → **Imebaki 12** (chini ya 15)

**Mapendekezo ya Ununuzi:**
Ninapendekeza upeleke order kwa **Unilever EA** wiki hii. Kwa bei ya sasa, unahitaji TZS 450,000 kwa bidhaa zote 3.

Je, niandike order request kwa Unilever EA?`,

  credit: `**Hali ya Madeni — Wateja wa Credit**

Jumla ya madeni: **TZS 330,000** kutoka kwa wateja 5

⚠️ **Imepitwa tarehe (Overdue):**
- Asha Mwinyi — TZS 28,800 (imepitwa siku 14)
- Fatuma Ally — TZS 32,500 (imepitwa siku 6)

⏰ **Karibu kulipwa:**
- Mariam Said — TZS 18,500 (siku 2 zimebaki)
- Juma Kifupi — TZS 49,200 (siku 6 zimebaki)

**Ushauri:** Tuma ujumbe wa WhatsApp kwa Asha Mwinyi leo. Amekuwa hajibu simu. Jibu la karibuni kabla ya hatua zaidi.

Je, niandike ujumbe wa WhatsApp kwa Asha sasa?`,

  profit: `**Uchambuzi wa Faida — Mwezi huu**

Mapato ya jumla: **TZS 32,400,000**
Gharama za bidhaa: TZS 24,800,000 (76.5%)
**Faida ghafi: TZS 7,600,000 (23.5%)**

**Bidhaa zenye faida zaidi:**
1. Lotion Nivea 400ml — margin 34.4%
2. Soda Coca-Cola 500ml — margin 46.7%
3. Biskuti ya Glucose — margin 31.3%

**Bidhaa zenye faida kidogo:**
- Mafuta Cooking 1L — margin 17.6% ⚠️ (chini ya lengo la 18%)
- Sukari 2kg — margin 20% (ikianguka)

Napendekeza upandishe bei ya Mafuta Cooking 1L kutoka TZS 8,500 → TZS 9,200 ili urejeshe margin ya 23%.`,
};

const SUGGESTED_PROMPTS = [
  { icon: '📊', label: 'Nionyeshe uchambuzi wa mauzo wiki hii', key: 'sales' },
  { icon: '📦', label: 'Bidhaa zipi zinahitaji kununuliwa sasa?', key: 'stock' },
  { icon: '💳', label: 'Hali ya madeni ya wateja wangu', key: 'credit' },
  { icon: '💰', label: 'Uchambuzi wa faida mwezi huu', key: 'profit' },
  { icon: '📈', label: 'Toa ripoti ya leo kwa WhatsApp', key: 'default' },
  { icon: '🔮', label: 'Tabiri mauzo ya wiki ijayo', key: 'default' },
];

const CHAT_HISTORY: Chat[] = [
  { id: 'c1', title: 'Uchambuzi wa mauzo — Mei', lastMsg: 'Ijumaa ndiyo siku bora zaidi', ts: new Date(2026, 4, 24, 9, 14), messages: [] },
  { id: 'c2', title: 'Hali ya madeni ya wateja', lastMsg: 'Asha Mwinyi ana deni la...', ts: new Date(2026, 4, 23, 16, 30), messages: [] },
  { id: 'c3', title: 'Mapendekezo ya bidhaa mpya', lastMsg: 'Unga wa Sembe 20kg...', ts: new Date(2026, 4, 21, 11, 0), messages: [] },
  { id: 'c4', title: 'Ukaguzi wa bei — Unilever', lastMsg: 'Bei mpya zimeingia mnamo...', ts: new Date(2026, 4, 18, 14, 20), messages: [] },
];

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

function MessageBubble({ msg }: { msg: Message }) {
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
        {isUser ? 'HM' : 'Z'}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '72%', minWidth: 0 }}>
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
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 4, textAlign: isUser ? 'right' : 'left' }}>
          {msg.ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          {msg.sources && msg.sources.length > 0 && (
            <span style={{ marginLeft: 8 }}>
              {msg.sources.map(s => <span key={s} style={{ marginLeft: 4, padding: '1px 5px', border: '1px solid var(--line-2)', borderRadius: 4, color: 'var(--fg-3)' }}>{s}</span>)}
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm0', role: 'assistant', ts: new Date(),
      content: `Habari, **Hamisi**! Mimi ni Ziada AI — msaidizi wako wa biashara. 🏪

Ninajua duka lako vizuri: mapato ya leo, hali ya stoo, madeni ya wateja, na zaidi. Niambie unachohitaji — kwa Kiswahili au Kiingereza.

**Ninaweza kukusaidia na:**
- Uchambuzi wa mauzo na faida
- Hali ya stoo na mapendekezo ya ununuzi
- Usimamizi wa madeni ya wateja
- Ripoti na utabiri wa biashara
- Maswali yoyote kuhusu duka lako`,
      sources: ['Sales data', 'Inventory', 'Credits'],
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), ts: new Date() };
    const thinkMsg: Message = { id: 'thinking', role: 'assistant', content: '', thinking: true, ts: new Date() };
    setMessages(m => [...m, userMsg, thinkMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI thinking (1.5–2.5s)
    const delay = 1500 + Math.random() * 1000;
    await new Promise(r => setTimeout(r, delay));

    // Pick a response based on keywords
    const lower = text.toLowerCase();
    let key = 'default';
    if (lower.includes('mauzo') || lower.includes('sales') || lower.includes('wiki')) key = 'sales';
    else if (lower.includes('stoo') || lower.includes('stock') || lower.includes('bidhaa')) key = 'stock';
    else if (lower.includes('deni') || lower.includes('credit') || lower.includes('wateja')) key = 'credit';
    else if (lower.includes('faida') || lower.includes('profit') || lower.includes('margin')) key = 'profit';

    const aiMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: AI_RESPONSES[key] || AI_RESPONSES.default,
      ts: new Date(),
      sources: key === 'sales' ? ['Sales data'] : key === 'stock' ? ['Inventory'] : key === 'credit' ? ['Credits'] : ['All data'],
    };
    setMessages(m => m.filter(x => x.id !== 'thinking').concat(aiMsg));
    setLoading(false);
  }, [loading]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const newChat = () => {
    setMessages([{
      id: 'm0', role: 'assistant', ts: new Date(),
      content: `Habari! Mazungumzo mapya. Ninaweza kukusaidia na nini leo?`,
    }]);
  };

  return (
    <AppShell
      full
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Ziada AI' }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={newChat} className="btn btn-soft" style={{ padding: '6px 12px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.plus} New chat
          </button>
          <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5 }}>
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
        .ai-layout { display: grid; grid-template-columns: 240px 1fr; flex: 1; min-height: 0; overflow: hidden; }
        .ai-sidebar { display: flex; flex-direction: column; border-right: 1px solid var(--line); background: var(--bg-2); min-height: 0; overflow-y: auto; }
        .ai-main { display: flex; flex-direction: column; min-height: 0; }
        .ai-messages { flex: 1; overflow-y: auto; padding: 24px 28px; }
        .ai-input-bar { border-top: 1px solid var(--line); padding: 16px 24px; background: var(--bg); flex-shrink: 0; }
        .ai-chat-item { padding: 10px 14px; border-radius: 8px; cursor: pointer; transition: background 100ms; margin-bottom: 2px; }
        .ai-chat-item:hover { background: var(--bg-3); }
        .ai-chat-item.active { background: var(--accent-soft); border: 1px solid var(--accent-line); }
        .prompt-chip { padding: 8px 14px; border-radius: 20px; border: 1px solid var(--line); background: var(--bg-2); font-size: 12.5px; cursor: pointer; display: flex; align-items: center; gap: 7px; transition: all 100ms; white-space: nowrap; }
        .prompt-chip:hover { border-color: var(--accent-line); background: var(--accent-soft); color: var(--fg); }
        @media (max-width: 900px) { .ai-layout { grid-template-columns: 1fr; } .ai-sidebar { display: none; } }
      `}</style>

      <div className="ai-layout">
        {/* Sidebar: chat history */}
        <div className="ai-sidebar">
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
            {CHAT_HISTORY.map((c, i) => (
              <div key={c.id} className={'ai-chat-item' + (i === 0 ? ' active' : '')}>
                <div style={{ fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMsg}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 4 }}>{c.ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
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
          </div>
        </div>

        {/* Main chat area */}
        <div className="ai-main">
          {/* Messages */}
          <div className="ai-messages">
            {/* Suggested prompts — show when only 1 message */}
            {messages.length <= 1 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto 12px', fontSize: 24 }}>
                    ✦
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>Ziada AI</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 4 }}>Msaidizi wako wa biashara • Your business assistant</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button key={p.label} className="prompt-chip" onClick={() => send(p.label)}>
                      <span>{p.icon}</span> {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => <MessageBubble key={m.id} msg={m} />)}
            <div ref={endRef} />
          </div>

          {/* Suggested prompts bar (always visible at bottom when not loading) */}
          {messages.length > 1 && !loading && (
            <div style={{ padding: '6px 24px 0', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
              {SUGGESTED_PROMPTS.slice(0, 4).map((p) => (
                <button key={p.label} className="prompt-chip" style={{ fontSize: 11.5, padding: '5px 10px' }} onClick={() => send(p.label)}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="ai-input-bar">
            <div style={{
              display: 'flex', gap: 10, alignItems: 'flex-end',
              border: '1px solid var(--line)', borderRadius: 12, padding: '8px 8px 8px 16px',
              background: 'var(--bg-2)', transition: 'border-color 120ms',
            }}
            onFocus={() => {}} // handled by CSS :focus-within
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Uliza swali kuhusu duka lako… (Enter to send, Shift+Enter for new line)"
                rows={1}
                style={{
                  flex: 1, background: 'transparent', border: 0, outline: 0, resize: 'none',
                  color: 'var(--fg)', fontSize: 14, fontFamily: 'inherit', lineHeight: 1.5,
                  maxHeight: 120, overflowY: 'auto',
                  scrollbarWidth: 'thin',
                }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
              />
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                <button
                  onClick={() => setListening(!listening)}
                  className="icon-btn"
                  title="Voice input"
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
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  className="btn btn-primary"
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
