'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from './icons';
import { useTheme } from './app-shell';

interface Crumb {
  label: string;
  href?: string;
}

interface TopbarProps {
  crumbs?: Crumb[];
  actions?: React.ReactNode;
  search?: boolean;
}

export function Topbar({ crumbs, actions, search = true }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  const items: Crumb[] = crumbs || [
    { label: 'ziada', href: '/' },
    { label: 'Duka Kuu', href: '#' },
    { label: 'Dashboard' },
  ];

  return (
    <header className="topbar">
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
        <div className="search">
          <span style={{ color: 'var(--fg-4)' }}>{Icons.search}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Search products, customers, transactions…
          </span>
          <span className="search-hint" style={{ marginLeft: 'auto', display: 'flex', gap: 3, flexShrink: 0 }}>
            <span className="kbd">⌘</span><span className="kbd">K</span>
          </span>
        </div>
      )}

      <button className="btn btn-soft" style={{ padding: '6px 10px', fontSize: 12.5 }}>
        <span style={{ color: 'var(--accent)' }}>{Icons.sparkles}</span> Ask Ziada AI
      </button>

      {actions !== undefined ? actions : (
        <Link href="/pos" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.plus} New sale
        </Link>
      )}

      <div style={{ display: 'flex', gap: 6, marginLeft: 4 }}>
        <button className="icon-btn" title="Notifications" style={{ position: 'relative' }}>
          {Icons.bell}
          <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 999, background: 'var(--bad)' }}></span>
        </button>
        <button className="icon-btn" title="Toggle theme" onClick={toggleTheme}>
          <span className="mono" style={{ fontSize: 11 }}>{theme === 'dark' ? '◐' : '◑'}</span>
        </button>
      </div>
    </header>
  );
}
