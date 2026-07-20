'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons } from './icons';
import { useTheme, useNotifications, useStore } from './app-shell';
import { clearTokens } from '../lib/auth';
import { aiApi, AICreditsStatus } from '../lib/api';

interface Crumb {
  label: string;
  href?: string;
}

interface TopbarProps {
  crumbs?: Crumb[];
  actions?: React.ReactNode;
  search?: boolean;
  onMenuToggle?: () => void;
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M2 4h12M2 8h12M2 12h12" />
      </g>
    </svg>
  );
}

function ThreeDotMenu() {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  function handleLogout() {
    setOpen(false);
    clearTokens();
    router.push('/auth/login');
  }

  const unread = notifications.filter(n => n.unread).length;
  const [aiCredits, setAiCredits] = useState<AICreditsStatus | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open || aiCredits) return;
    aiApi.getSuggestions().then((res) => { if (res.success) setAiCredits(res.data.ai_credits); });
  }, [open, aiCredits]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <style>{`
        @keyframes tdm-in {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .tdm-panel {
          animation: tdm-in 200ms cubic-bezier(0.16,1,0.3,1) forwards;
          transform-origin: top right;
        }
        .tdm-row {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 8px 10px; border: none;
          background: transparent; color: var(--fg);
          cursor: pointer; text-align: left; font-family: inherit;
          font-size: 13px; border-radius: 8px;
          transition: background 120ms;
        }
        .tdm-row:hover { background: var(--bg-3); }
        .tdm-row.danger { color: var(--bad); }
        .tdm-row.danger .tdm-icon { color: var(--bad) !important; }
        .tdm-notif-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 8px 10px; border-radius: 8px; cursor: pointer;
          transition: background 120ms;
        }
        .tdm-notif-item:hover { background: var(--bg-3); }
        .tdm-quick-btn {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 5px; padding: 10px 6px; border: 1px solid var(--line);
          border-radius: 10px; background: var(--bg-3); color: var(--fg-2);
          cursor: pointer; font-family: inherit; font-size: 10.5;
          transition: border-color 120ms, background 120ms, color 120ms;
        }
        .tdm-quick-btn:hover { border-color: var(--accent-line); color: var(--fg); background: var(--bg-4); }
        .tdm-quick-btn.active { border-color: var(--accent-line); background: var(--accent-soft); color: var(--accent); }
      `}</style>

      {/* Trigger */}
      <button
        className="icon-btn"
        onClick={() => { setOpen(o => !o); setNotifOpen(false); }}
        title="Menu"
        style={{ position: 'relative' }}
      >
        {Icons.dotsVertical}
        {unread > 0 && !open && (
          <span style={{
            position: 'absolute', top: 5, right: 5,
            width: 7, height: 7, borderRadius: 999,
            background: 'var(--bad)',
            boxShadow: '0 0 0 2px var(--bg)',
          }} />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="tdm-panel" style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 316,
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 18,
          boxShadow: '0 32px 72px -12px rgba(0,0,0,0.45), 0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.07)',
          zIndex: 300,
          overflow: 'hidden',
        }}>

          {/* ── Profile header ── */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.13) 0%, rgba(168,85,247,0.07) 100%)',
            borderBottom: '1px solid var(--line)',
            padding: '18px 16px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              {/* Avatar */}
              <div style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff', display: 'grid', placeItems: 'center',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.01em',
                boxShadow: '0 4px 14px rgba(99,102,241,0.45), 0 0 0 3px rgba(99,102,241,0.18)',
              }}>HM</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Hamisi Mwakapaga
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <span style={{
                    fontSize: 9.5, fontFamily: 'var(--mono)', fontWeight: 600,
                    padding: '2px 7px', borderRadius: 5,
                    background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.28)',
                    color: 'var(--accent)', letterSpacing: '0.04em',
                  }}>OWNER</span>
                  <span style={{ fontSize: 10.5, fontFamily: 'var(--mono)', color: 'var(--fg-4)' }}>admin</span>
                </div>
              </div>

              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                title="Settings"
                style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  border: '1px solid var(--line-2)', background: 'var(--bg-2)',
                  display: 'grid', placeItems: 'center',
                  color: 'var(--fg-3)', textDecoration: 'none',
                  transition: 'background 120ms, border-color 120ms',
                }}
              >{Icons.settings}</Link>
            </div>
          </div>

          {/* ── Quick actions row ── */}
          <div style={{ padding: '12px 12px 4px', display: 'flex', gap: 8 }}>
            <button
              className={`tdm-quick-btn three-dot-ai-row${theme === 'dark' ? '' : ''}`}
              onClick={() => { router.push('/ai'); setOpen(false); }}
            >
              <span style={{ color: 'var(--accent)', display: 'flex' }}>{Icons.sparkles}</span>
              <span>Ask AI</span>
            </button>
            <button
              className="tdm-quick-btn"
              onClick={() => { toggleTheme(); }}
            >
              <span style={{ color: 'var(--fg-3)', display: 'flex' }}>
                {theme === 'dark' ? Icons.sun : Icons.moon}
              </span>
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              className={`tdm-quick-btn${notifOpen ? ' active' : ''}`}
              onClick={() => setNotifOpen(o => !o)}
              style={{ position: 'relative' }}
            >
              <span style={{ color: notifOpen ? 'var(--accent)' : 'var(--fg-3)', display: 'flex', position: 'relative' }}>
                {Icons.bell}
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -2, right: -3,
                    width: 8, height: 8, borderRadius: 999,
                    background: 'var(--bad)', border: '1.5px solid var(--bg-3)',
                  }} />
                )}
              </span>
              <span>
                Alerts{unread > 0 ? ` (${unread})` : ''}
              </span>
            </button>
          </div>

          {/* ── Notifications drawer ── */}
          {notifOpen && (
            <div style={{ padding: '4px 12px 8px' }}>
              <div style={{
                border: '1px solid var(--line)', borderRadius: 12,
                overflow: 'hidden', background: 'var(--bg)',
              }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--fg-4)', fontSize: 12 }}>
                    No new notifications
                  </div>
                ) : notifications.map((n, i) => (
                  <div key={n.id} className="tdm-notif-item"
                    style={{
                      background: n.unread ? 'var(--accent-soft)' : undefined,
                      borderBottom: i < notifications.length - 1 ? '1px solid var(--line)' : 'none',
                      borderRadius: 0,
                    }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: n.color + '18', border: `1px solid ${n.color}2e`,
                      color: n.color, fontSize: 11, fontWeight: 700,
                      display: 'grid', placeItems: 'center', marginTop: 1,
                    }}>{n.icon}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: n.unread ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.sub}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)', flexShrink: 0, marginTop: 1 }}>{n.time}</span>
                  </div>
                ))}
                <div style={{ padding: '8px 12px', borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
                  <Link href="#" onClick={() => setOpen(false)} style={{ fontSize: 11.5, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    View all notifications {Icons.chevRight}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── AI Credits card ── */}
          <div style={{ padding: '4px 12px 12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.09) 0%, rgba(168,85,247,0.06) 100%)',
              border: '1px solid rgba(99,102,241,0.22)',
              borderRadius: 12, padding: '13px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ color: 'var(--accent)', display: 'flex' }}>{Icons.sparkles}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.01em' }}>Ziada AI</span>
                  </div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>
                    AI CREDITS · {new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase()}
                  </div>
                </div>
                <a
                  href="https://ngamia.cc"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 600, color: '#fff',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    padding: '5px 11px', borderRadius: 7,
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                  }}
                >Upgrade →</a>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>{(aiCredits?.used ?? 0).toLocaleString()} used</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                  {(aiCredits?.used ?? 0).toLocaleString()} <span style={{ color: 'var(--fg-4)', fontWeight: 400, fontSize: 10.5 }}>/ {(aiCredits?.allocated ?? 500).toLocaleString()}</span>
                </span>
              </div>

              <div style={{ height: 5, borderRadius: 999, background: 'var(--bg-4)', overflow: 'hidden', marginBottom: 6 }}>
                <div style={{
                  width: `${Math.min(aiCredits?.pct_used ?? 0, 100)}%`, height: '100%', borderRadius: 999,
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  boxShadow: '0 0 8px rgba(99,102,241,0.4)',
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)' }}>{(aiCredits?.remaining ?? 0).toLocaleString()} credits remaining</span>
                <Link href="/ai/usage" onClick={() => setOpen(false)} className="mono" style={{ fontSize: 10.5, color: 'var(--accent)', textDecoration: 'none' }}>
                  View usage →
                </Link>
              </div>
            </div>
          </div>

          {/* ── Navigation links ── */}
          <div style={{ padding: '0 8px', borderTop: '1px solid var(--line)' }}>
            <div style={{ padding: '6px 4px 4px' }}>
              {[
                { label: 'Dashboard',    href: '/',            icon: Icons.dashboard },
                { label: 'Point of Sale',href: '/pos',         icon: Icons.pos       },
                { label: 'Transactions', href: '/transactions',icon: Icons.txn       },
                { label: 'Help & docs',  href: '/help',        icon: Icons.help      },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="tdm-row">
                    <span style={{ color: 'var(--fg-4)', display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ flex: 1, color: 'var(--fg-2)', fontSize: 13 }}>{item.label}</span>
                    <span style={{ color: 'var(--fg-4)', display: 'flex' }}>{Icons.chevRight}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Log out ── */}
          <div style={{ padding: '4px 8px 10px', borderTop: '1px solid var(--line)' }}>
            <button
              className="tdm-row danger"
              onClick={handleLogout}
            >
              <span className="tdm-icon" style={{ display: 'flex', flexShrink: 0 }}>{Icons.logout}</span>
              <span style={{ flex: 1 }}>Log out</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export function Topbar({ crumbs, actions, search = true, onMenuToggle }: TopbarProps) {
  const { activeStore } = useStore();
  const raw: Crumb[] = crumbs || [
    { label: 'ziada', href: '/' },
    { label: 'Duka Kuu', href: '#' },
    { label: 'Dashboard' },
  ];
  // Every page's crumbs still hardcode "Duka Kuu" as a placeholder store
  // name — swap in the real one here rather than editing every page.
  const items: Crumb[] = activeStore
    ? raw.map(c => (c.label === 'Duka Kuu' ? { ...c, label: activeStore.name } : c))
    : raw;

  return (
    <header className="topbar">
      {/* Hamburger — shown only on mobile via CSS */}
      <button
        className="hamburger"
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
      >
        <HamburgerIcon />
      </button>

      <div className="crumb">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            {item.href
              ? <Link href={item.href}>{item.label}</Link>
              : <span className="here">{item.label}</span>}
          </React.Fragment>
        ))}
      </div>
      <div style={{ flex: 1 }}></div>

      {search && (
        <div className="search topbar-search">
          <span style={{ color: 'var(--fg-4)' }}>{Icons.search}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Search products, customers, transactions…
          </span>
          <span className="search-hint" style={{ marginLeft: 'auto', display: 'flex', gap: 3, flexShrink: 0 }}>
            <span className="kbd">⌘</span><span className="kbd">K</span>
          </span>
        </div>
      )}

      <Link href="/ai" className="btn btn-soft topbar-ai" style={{ padding: '6px 10px', fontSize: 12.5, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--accent)' }}>{Icons.sparkles}</span> Ask Ziada AI
      </Link>

      <div className="topbar-actions">
        {actions !== undefined ? actions : (
          <Link href="/pos" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.plus} New sale
          </Link>
        )}
      </div>

      <div style={{ marginLeft: 4 }}>
        <ThreeDotMenu />
      </div>
    </header>
  );
}
