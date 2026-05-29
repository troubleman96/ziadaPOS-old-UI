'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';

interface SidenavProps {
  navOpen: boolean;
  onClose: () => void;
}

function StoreSwitcher() {
  return (
    <div style={{
      margin: '16px 12px 8px',
      padding: '10px 12px',
      borderRadius: 8,
      border: '1px solid var(--line)',
      background: 'var(--bg-3)',
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: 'var(--accent)', color: '#fff',
        display: 'grid', placeItems: 'center',
        fontSize: 12, fontWeight: 600,
        flexShrink: 0,
      }}>D</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Duka Kuu</span>
          <span className="pill" style={{ fontSize: 9, padding: '0 5px' }}>PRO</span>
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 1 }}>Kariakoo · 3 stores</div>
      </div>
      <span style={{ color: 'var(--fg-3)' }}>{Icons.chevDown}</span>
    </div>
  );
}

function NavBrand({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '16px 20px 8px',
    }}>
      <span style={{
        width: 26, height: 26, borderRadius: 7,
        background: 'var(--accent)', color: '#fff',
        display: 'grid', placeItems: 'center',
        fontSize: 13, fontWeight: 600,
      }}>Z</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>ziada</span>
      <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginLeft: 'auto', padding: '2px 5px', border: '1px solid var(--line)', borderRadius: 4 }}>v2.4</span>
      {/* Close button — visible only on mobile via CSS */}
      <button
        className="sidenav-close"
        onClick={onClose}
        aria-label="Close navigation"
        style={{ marginLeft: 4 }}
      >
        ×
      </button>
    </div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string | { color: string } | null;
  active?: boolean;
  href: string;
  onClick?: () => void;
}

function NavItem({ icon, label, badge, active, href, onClick }: NavItemProps) {
  return (
    <Link href={href} className={'nav-item' + (active ? ' active' : '')} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
      {badge != null && (
        typeof badge === 'string'
          ? <span className="nav-badge pill">{badge}</span>
          : <span className="nav-badge dot" style={{ background: (badge as { color: string }).color || 'var(--warn)' }}></span>
      )}
    </Link>
  );
}

function NavFooter() {
  return (
    <div style={{
      borderTop: '1px solid var(--line)',
      padding: 12,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{
        padding: '10px 12px',
        border: '1px solid var(--line)',
        borderRadius: 8,
        background: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>AI CREDITS · MAY</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-2)' }}>2,418 / 5,000</span>
        </div>
        <div style={{ height: 4, borderRadius: 999, background: 'var(--bg-3)', overflow: 'hidden' }}>
          <div style={{ width: '48%', height: '100%', background: 'var(--accent)' }}></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <a href="#" className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>View usage</a>
          <a href="#" className="mono" style={{ fontSize: 10.5, color: 'var(--accent)' }}>Upgrade</a>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 6px',
        borderRadius: 6,
        cursor: 'pointer',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 999,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          color: '#fff',
          display: 'grid', placeItems: 'center',
          fontSize: 11, fontWeight: 600,
          flexShrink: 0,
        }}>HM</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Hamisi Mwakapaga</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>Owner · admin</div>
        </div>
        <span style={{ color: 'var(--fg-4)' }}>{Icons.chevDown}</span>
      </div>
    </div>
  );
}

export function Sidenav({ navOpen, onClose }: SidenavProps) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  // Auto-close on navigation (route change)
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  const primary = [
    { id: 'dashboard', label: 'Dashboard',     icon: Icons.dashboard,  href: '/dashboard' },
    { id: 'pos',       label: 'Point of Sale',  icon: Icons.pos,        href: '/pos',          badge: '⌘N' },
    { id: 'txn',       label: 'Transactions',   icon: Icons.txn,        href: '/transactions' },
    { id: 'inventory', label: 'Inventory',      icon: Icons.inventory,  href: '/inventory',    badge: { color: 'var(--warn)' } },
    { id: 'credits',   label: 'Credits',        icon: Icons.credit,     href: '/credits',      badge: '14' },
  ];
  const insights = [
    { id: 'analytics', label: 'Analytics',  icon: Icons.analytics, href: '/analytics' },
    { id: 'reports',   label: 'Reports',    icon: Icons.reports,   href: '/reports' },
    { id: 'ai',        label: 'Ziada AI',   icon: Icons.ai,        href: '/ai',      badge: 'NEW' },
  ];
  const directory = [
    { id: 'customers', label: 'Customers', icon: Icons.customers, href: '/customers' },
    { id: 'suppliers', label: 'Suppliers', icon: Icons.suppliers, href: '/suppliers' },
    { id: 'stores',    label: 'Stores',    icon: Icons.store,     href: '/stores',   badge: '3' },
  ];
  const meta = [
    { id: 'settings', label: 'Settings',      icon: Icons.settings, href: '/settings' },
    { id: 'help',     label: 'Help & support', icon: Icons.help,     href: '/help' },
  ];

  return (
    <aside className={`sidenav${navOpen ? ' nav-open' : ''}`}>
      <NavBrand onClose={onClose} />
      <StoreSwitcher />
      <div className="sidenav-scroll">
        <div className="nav-section-label">Operate</div>
        {primary.map((i) => (
          <NavItem key={i.id} {...i} active={isActive(i.href)} onClick={onClose} />
        ))}
        <div className="nav-section-label">Insights</div>
        {insights.map((i) => (
          <NavItem key={i.id} {...i} active={isActive(i.href)} onClick={onClose} />
        ))}
        <div className="nav-section-label">Directory</div>
        {directory.map((i) => (
          <NavItem key={i.id} {...i} active={isActive(i.href)} onClick={onClose} />
        ))}
        <div className="nav-section-label">System</div>
        {meta.map((i) => (
          <NavItem key={i.id} {...i} active={isActive(i.href)} onClick={onClose} />
        ))}
      </div>
      <NavFooter />
    </aside>
  );
}
