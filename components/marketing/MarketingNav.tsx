'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/components/LangContext';
import { t } from '@/lib/lang';
import { DotsMenu } from '@/components/DotsMenu';

export function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname                = usePathname();
  const { lang }                = useLang();

  const NAV_LINKS = [
    { labelKey: 'nav_product' as const, href: '/#features' },
    { labelKey: 'nav_ai'      as const, href: '/#ai'       },
    { labelKey: 'nav_pricing' as const, href: '/pricing'   },
    { labelKey: 'nav_about'   as const, href: '/about'     },
    { labelKey: 'nav_contact' as const, href: '/contact'   },
  ];

  const isActive = (href: string) => href !== '/' && pathname === href;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--line)',
      backdropFilter: 'blur(16px) saturate(140%)',
      background: 'color-mix(in oklab, var(--bg) 80%, transparent)',
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, position: 'relative' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
          <img src="/ziada-final.jpeg" alt="Ziada" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
          <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: '-0.04em', fontFamily: 'var(--sans)' }}>POS</span>
        </Link>

        {/* Desktop nav — absolutely centered */}
        <nav className="mkt-nav-links" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 32 }}>
          {NAV_LINKS.map(({ labelKey, href }) => (
            <Link
              key={labelKey}
              href={href}
              style={{ fontSize: 13.5, color: isActive(href) ? 'var(--fg)' : 'var(--fg-2)', textDecoration: 'none', fontWeight: isActive(href) ? 500 : 400, transition: 'color 120ms', whiteSpace: 'nowrap' }}
            >
              {t(lang, labelKey)}
            </Link>
          ))}
        </nav>

        {/* Right side: Sign in (desktop) + three-dot menu + hamburger (mobile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>

          {/* Sign in — desktop only */}
          <Link
            href="/auth/login"
            className="mkt-nav-links"
            style={{ padding: '7px 18px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            {t(lang, 'nav_signin')}
          </Link>

          {/* Shared dots menu — appearance + language */}
          <DotsMenu />

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mkt-ham"
            aria-label="Toggle menu"
            style={{ width: 36, height: 36, border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg-2)', cursor: 'pointer', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            <span style={{ width: 16, height: 1.5, background: 'var(--fg-2)', borderRadius: 2, display: 'block', transition: 'transform 150ms', transform: menuOpen ? 'rotate(45deg) translateY(5.5px)' : 'none' }} />
            <span style={{ width: 16, height: 1.5, background: 'var(--fg-2)', borderRadius: 2, display: 'block', opacity: menuOpen ? 0 : 1, transition: 'opacity 150ms' }} />
            <span style={{ width: 16, height: 1.5, background: 'var(--fg-2)', borderRadius: 2, display: 'block', transition: 'transform 150ms', transform: menuOpen ? 'rotate(-45deg) translateY(-5.5px)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-2)', padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_LINKS.map(({ labelKey, href }) => (
            <Link
              key={labelKey}
              href={href}
              style={{ fontSize: 14, color: 'var(--fg-2)', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid var(--line)' }}
              onClick={() => setMenuOpen(false)}
            >
              {t(lang, labelKey)}
            </Link>
          ))}
          <div style={{ marginTop: 12 }}>
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
            >
              {t(lang, 'nav_signin')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
