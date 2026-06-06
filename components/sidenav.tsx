'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';
import { useStore } from './app-shell';
import { STORES } from '../lib/data';

interface SidenavProps {
  navOpen: boolean;
  onClose: () => void;
}

function StoreSwitcher({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const { activeStoreId, setActiveStoreId } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const activeStore = STORES.find(s => s.id === activeStoreId) ?? STORES[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: 'relative', margin: '12px 12px 8px' }}>
      {/* Trigger card */}
      <div
        role="button"
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '10px 12px',
          borderRadius: 8,
          border: `1px solid ${open ? 'var(--accent-line)' : 'var(--line)'}`,
          background: open ? 'var(--accent-soft)' : 'var(--bg-3)',
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: activeStore.color, color: '#fff',
          display: 'grid', placeItems: 'center',
          fontSize: 12, fontWeight: 600, flexShrink: 0,
        }}>{activeStore.shortName[0]}</div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeStore.shortName}
            </span>
            {activeStore.badge && (
              <span className="pill" style={{ fontSize: 9, padding: '0 5px', flexShrink: 0 }}>{activeStore.badge}</span>
            )}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 1 }}>
            {STORES.length} stores
          </div>
        </div>

        <span style={{
          color: 'var(--fg-3)', display: 'flex', flexShrink: 0,
          transition: 'transform 150ms',
          transform: open ? 'rotate(180deg)' : 'none',
        }}>
          {Icons.chevDown}
        </span>

        {/* Close button — visible only on mobile via CSS */}
        <button
          className="sidenav-close"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Close navigation"
        >×</button>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--bg-2)', border: '1px solid var(--line)',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          zIndex: 200, overflow: 'hidden',
        }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', padding: '10px 14px 6px', letterSpacing: '0.08em' }}>
            SWITCH STORE
          </div>

          {STORES.map((store) => {
            const isActive = store.id === activeStoreId;
            return (
              <button
                key={store.id}
                onClick={() => { setActiveStoreId(store.id); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 14px', border: 'none',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  color: 'var(--fg)', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                  background: store.color + '22',
                  border: `1.5px solid ${store.color}55`,
                  display: 'grid', placeItems: 'center',
                  color: store.color, fontSize: 11, fontWeight: 700,
                }}>{store.shortName[0]}</div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: isActive ? 500 : 400 }}>
                    {store.shortName}
                    {store.badge && (
                      <span className="mono" style={{
                        marginLeft: 5, fontSize: 9, background: 'var(--accent)',
                        color: '#fff', padding: '1px 4px', borderRadius: 3,
                      }}>{store.badge}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: 999, flexShrink: 0,
                      background: store.status === 'open' ? 'var(--good)' : 'var(--warn)',
                      display: 'inline-block',
                    }} />
                    <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>
                      {store.statusLabel} · {store.address.split(',')[0]}
                    </span>
                  </div>
                </div>

                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}

          <div style={{ borderTop: '1px solid var(--line)', padding: '6px 8px' }}>
            <Link
              href="/stores"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 8px', fontSize: 12,
                color: 'var(--fg-3)', borderRadius: 6,
                textDecoration: 'none',
              }}
            >
              <span style={{ opacity: 0.6, display: 'flex' }}>{Icons.store}</span>
              Manage stores
            </Link>
          </div>
        </div>
      )}
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


export function Sidenav({ navOpen, onClose }: SidenavProps) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

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
    { id: 'discounts', label: 'Discounts',  icon: Icons.discount,  href: '/discounts' },
    { id: 'ai',        label: 'Ziada AI',   icon: Icons.ai,        href: '/ai',      badge: 'NEW' },
  ];
  const directory = [
    { id: 'customers', label: 'Customers', icon: Icons.customers, href: '/customers' },
    { id: 'suppliers', label: 'Suppliers', icon: Icons.suppliers, href: '/suppliers' },
    { id: 'stores',    label: 'Stores',    icon: Icons.store,     href: '/stores',   badge: '3' },
  ];
  const tools = [
    { id: 'staff',    label: 'Staff',    icon: Icons.staff,    href: '/staff'    },
    { id: 'notebook', label: 'Notebook', icon: Icons.notebook, href: '/notebook' },
  ];
  const meta = [
    { id: 'settings', label: 'Settings',      icon: Icons.settings, href: '/settings' },
    { id: 'help',     label: 'Help & support', icon: Icons.help,     href: '/help' },
  ];

  return (
    <aside className={`sidenav${navOpen ? ' nav-open' : ''}`}>
      <StoreSwitcher onClose={onClose} />
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
        <div className="nav-section-label">Tools</div>
        {tools.map((i) => (
          <NavItem key={i.id} {...i} active={isActive(i.href)} onClick={onClose} />
        ))}
        <div className="nav-section-label">System</div>
        {meta.map((i) => (
          <NavItem key={i.id} {...i} active={isActive(i.href)} onClick={onClose} />
        ))}
      </div>
    </aside>
  );
}
