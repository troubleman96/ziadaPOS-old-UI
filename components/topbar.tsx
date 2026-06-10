'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons } from './icons';
import { useTheme, useNotifications } from './app-shell';
import { clearTokens } from '../lib/auth';

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

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <style>{`
        @keyframes tdm-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .tdm-panel {
          animation: tdm-in 180ms cubic-bezier(0.16,1,0.3,1) forwards;
          transform-origin: top right;
        }
        .tdm-row {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 8px 12px; border: none;
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
          padding: 8px 12px; border-radius: 8px; cursor: pointer;
          transition: background 120ms;
        }
        .tdm-notif-item:hover { background: var(--bg-3); }
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
          width: 300,
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          borderRadius: 16,
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.36), 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
          zIndex: 300,
          overflow: 'hidden',
        }}>

          {/* ── Ask AI — mobile only ── */}
          <div className="three-dot-ai-row" style={{ padding: '8px 8px 0' }}>
            <button className="tdm-row" onClick={() => { router.push('/ai'); setOpen(false); }}>
              <span className="tdm-icon" style={{ color: 'var(--accent)', display: 'flex', flexShrink: 0 }}>{Icons.sparkles}</span>
              <span style={{ flex: 1 }}>Ask Ziada AI</span>
              <span style={{ fontSize: 10.5, color: 'var(--fg-4)', fontFamily: 'var(--mono)' }}>⌘K</span>
            </button>
            <div style={{ height: 1, background: 'var(--line)', margin: '8px 4px' }} />
          </div>

          {/* ── Appearance ── */}
          <div style={{ padding: '8px 8px 0' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)', letterSpacing: '0.1em', padding: '2px 4px 6px' }}>APPEARANCE</div>
            <button
              className="tdm-row"
              onClick={() => { toggleTheme(); setOpen(false); }}
            >
              <span className="tdm-icon" style={{ color: 'var(--fg-3)', display: 'flex', flexShrink: 0 }}>
                {theme === 'dark' ? Icons.sun : Icons.moon}
              </span>
              <span style={{ flex: 1 }}>{theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            </button>
          </div>

          <div style={{ height: 1, background: 'var(--line)', margin: '8px 12px' }} />

          {/* ── Notifications ── */}
          <div style={{ padding: '0 8px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)', letterSpacing: '0.1em', padding: '2px 4px 6px' }}>NOTIFICATIONS</div>
            <button
              className="tdm-row"
              onClick={() => setNotifOpen(o => !o)}
              style={{ background: notifOpen ? 'var(--bg-3)' : undefined }}
            >
              <span className="tdm-icon" style={{ color: 'var(--fg-3)', display: 'flex', flexShrink: 0 }}>{Icons.bell}</span>
              <span style={{ flex: 1 }}>Notifications</span>
              {unread > 0 && (
                <span style={{
                  fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 600,
                  background: 'var(--bad)', color: '#fff',
                  padding: '1px 6px', borderRadius: 999, marginRight: 4,
                }}>{unread}</span>
              )}
              <span style={{ color: 'var(--fg-4)', display: 'flex', transform: notifOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }}>
                {Icons.chevDown}
              </span>
            </button>

            {notifOpen && (
              <div style={{ padding: '4px 0 4px' }}>
                {notifications.map((n) => (
                  <div key={n.id} className="tdm-notif-item"
                    style={{ background: n.unread ? 'var(--accent-soft)' : undefined }}
                  >
                    <span style={{
                      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                      background: n.color + '1a', border: `1px solid ${n.color}33`,
                      color: n.color, fontSize: 11, fontWeight: 700,
                      display: 'grid', placeItems: 'center', marginTop: 1,
                    }}>{n.icon}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: n.unread ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.sub}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', flexShrink: 0, marginTop: 2 }}>{n.time}</span>
                  </div>
                ))}
                <div style={{ padding: '4px 4px 2px' }}>
                  <Link href="#" onClick={() => setOpen(false)} style={{ fontSize: 12, color: 'var(--accent)' }}>
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--line)', margin: '8px 12px' }} />

          {/* ── AI Credits ── */}
          <div style={{ padding: '0 16px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)', letterSpacing: '0.1em' }}>AI CREDITS · JUN</div>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg)', fontWeight: 600 }}>
                2,418 <span style={{ color: 'var(--fg-4)', fontWeight: 400 }}>/ 5,000</span>
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: 'var(--bg-4)', overflow: 'hidden', margin: '8px 0 10px' }}>
              <div style={{
                width: '48%', height: '100%', borderRadius: 999,
                background: 'linear-gradient(90deg, var(--accent), #a855f7)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8 }}>
              <a href="#" className="mono" onClick={() => setOpen(false)} style={{ fontSize: 11, color: 'var(--fg-3)' }}>View usage</a>
              <a href="#" className="mono" onClick={() => setOpen(false)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: '#fff',
                background: 'linear-gradient(135deg, var(--accent), #a855f7)',
                padding: '4px 10px', borderRadius: 6, fontWeight: 500,
              }}>Upgrade →</a>
            </div>
          </div>

          {/* ── Profile ── */}
          <div style={{ borderTop: '1px solid var(--line)', padding: '8px 8px 4px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)', letterSpacing: '0.1em', padding: '2px 4px 6px' }}>PROFILE</div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              style={{ display: 'block', borderRadius: 10, overflow: 'hidden' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10,
                background: 'var(--bg-3)',
                cursor: 'pointer',
                transition: 'background 120ms',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  color: '#fff', display: 'grid', placeItems: 'center',
                  fontSize: 11.5, fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                }}>HM</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.01em' }}>Hamisi Mwakapaga</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 1 }}>Owner · admin</div>
                </div>
                <span style={{ color: 'var(--fg-4)', display: 'flex', flexShrink: 0 }}>{Icons.chevRight}</span>
              </div>
            </Link>
          </div>

          {/* ── Log out ── */}
          <div style={{ padding: '2px 8px 8px' }}>
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
  const items: Crumb[] = crumbs || [
    { label: 'ziada', href: '/' },
    { label: 'Duka Kuu', href: '#' },
    { label: 'Dashboard' },
  ];

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
