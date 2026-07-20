'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';

const ITEMS = [
  { id: 'dashboard', label: 'Home',      icon: Icons.dashboard, href: '/dashboard' },
  { id: 'inventory', label: 'Inventory', icon: Icons.inventory, href: '/inventory' },
  { id: 'pos',       label: 'Sell',      icon: Icons.pos,       href: '/pos' },
  { id: 'analytics', label: 'Analytics', icon: Icons.analytics, href: '/analytics' },
  { id: 'ai',        label: 'Ziada AI',  icon: Icons.ai,        href: '/ai' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {ITEMS.map((item) => {
        const active = isActive(item.href);

        if (item.id === 'pos') {
          return (
            <Link key={item.id} href={item.href} className="bottom-nav-item bottom-nav-item-center" aria-label={item.label}>
              <span className={'bottom-nav-fab' + (active ? ' active' : '')}>{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link key={item.id} href={item.href} className={'bottom-nav-item' + (active ? ' active' : '')}>
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
