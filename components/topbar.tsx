'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icons } from './icons';
import { useTheme, useNotifications } from './app-shell';

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

  const menuRow = (
    icon: React.ReactNode,
    label: React.ReactNode,
    onClick?: () => void,
    danger?: boolean,
    right?: React.ReactNode,
  ) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '8px 14px', border: 'none',
        background: 'transparent', color: danger ? 'var(--bad)' : 'var(--fg)',
        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 13,
      }}
    >
      <span style={{ color: danger ? 'var(--bad)' : 'var(--fg-3)', display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {right}
    </button>
  );

  const sectionLabel = (text: string) => (
    <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', padding: '10px 14px 4px', letterSpacing: '0.08em' }}>
      {text}
    </div>
  );

  const divider = () => <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
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
            position: 'absolute', top: 6, right: 6,
            width: 6, height: 6, borderRadius: 999,
            background: 'var(--bad)',
          }} />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          width: 272,
          background: 'var(--bg-2)', border: '1px solid var(--line)',
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          zIndex: 300, overflow: 'hidden',
        }}>

          {/* ── Appearance ── */}
          {sectionLabel('APPEARANCE')}
          {menuRow(
            theme === 'dark' ? Icons.sun : Icons.moon,
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
            () => { toggleTheme(); setOpen(false); },
          )}

          {divider()}

          {/* ── Notifications ── */}
          {sectionLabel('NOTIFICATIONS')}
          <button
            onClick={() => setNotifOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '8px 14px', border: 'none',
              background: notifOpen ? 'var(--bg-3)' : 'transparent',
              color: 'var(--fg)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
            }}
          >
            <span style={{ color: 'var(--fg-3)', display: 'flex', flexShrink: 0 }}>{Icons.bell}</span>
            <span style={{ flex: 1 }}>Notifications</span>
            {unread > 0 && (
              <span className="mono" style={{
                fontSize: 10, background: 'var(--bad)', color: '#fff',
                padding: '1px 6px', borderRadius: 999,
              }}>{unread}</span>
            )}
            <span style={{ color: 'var(--fg-4)', display: 'flex', transform: notifOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
              {Icons.chevDown}
            </span>
          </button>

          {notifOpen && (
            <div style={{ borderTop: '1px solid var(--line-2)' }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '9px 14px',
                    background: n.unread ? 'var(--bg-3)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                    background: n.color + '22', border: `1px solid ${n.color}44`,
                    color: n.color, fontSize: 10, fontWeight: 700,
                    display: 'grid', placeItems: 'center', marginTop: 1,
                  }}>{n.icon}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: n.unread ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.sub}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', flexShrink: 0, marginTop: 1 }}>{n.time}</span>
                </div>
              ))}
              <div style={{ padding: '6px 14px 10px' }}>
                <Link
                  href="#"
                  onClick={() => setOpen(false)}
                  style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}

          {divider()}

          {/* ── Profile ── */}
          {sectionLabel('PROFILE')}
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              borderRadius: 6, margin: '0 4px',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff', display: 'grid', placeItems: 'center',
                fontSize: 11, fontWeight: 600,
              }}>HM</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Hamisi Mwakapaga</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>Owner · admin</div>
              </div>
              <span style={{ color: 'var(--fg-4)', display: 'flex', flexShrink: 0 }}>{Icons.chevRight}</span>
            </div>
          </Link>

          {menuRow(
            Icons.logout,
            'Log out',
            () => setOpen(false),
            true,
          )}

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

      <button className="btn btn-soft topbar-ai" style={{ padding: '6px 10px', fontSize: 12.5 }}>
        <span style={{ color: 'var(--accent)' }}>{Icons.sparkles}</span> Ask Ziada AI
      </button>

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
