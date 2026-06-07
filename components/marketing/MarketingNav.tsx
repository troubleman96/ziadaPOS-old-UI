'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { label: 'Product', href: '/#features' },
  { label: 'Ziada AI', href: '/#ai' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3"  cy="8" r="1.5" />
      <circle cx="8"  cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}

export function MarketingNav() {
  const [theme, setTheme]         = useState<'light' | 'dark'>('light');
  const [menuOpen, setMenuOpen]   = useState(false);
  const [dotsOpen, setDotsOpen]   = useState(false);
  const dotsRef                   = useRef<HTMLDivElement>(null);
  const pathname                  = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ziada-theme');
      const t = stored === 'dark' ? 'dark' : 'light';
      setTheme(t);
      document.documentElement.setAttribute('data-theme', t);
    } catch {}
  }, []);

  // Close dots menu on click outside
  useEffect(() => {
    if (!dotsOpen) return;
    function onOutside(e: MouseEvent) {
      if (dotsRef.current && !dotsRef.current.contains(e.target as Node)) {
        setDotsOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [dotsOpen]);

  function applyTheme(t: 'light' | 'dark') {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('ziada-theme', t); } catch {}
  }

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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
          <img
            src="/ziadaposicon.jpeg"
            alt="Ziada"
            style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', boxShadow: '0 0 0 1.5px rgba(79,70,229,0.2), 0 3px 10px rgba(79,70,229,0.14)' }}
          />
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', fontFamily: 'var(--display)' }}>Ziada</span>
        </Link>

        {/* Desktop nav — absolutely centered */}
        <nav className="mkt-nav-links" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 32 }}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{ fontSize: 13.5, color: isActive(href) ? 'var(--fg)' : 'var(--fg-2)', textDecoration: 'none', fontWeight: isActive(href) ? 500 : 400, transition: 'color 120ms', whiteSpace: 'nowrap' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side: Sign in (desktop) + three-dot menu (all) + hamburger (mobile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>

          {/* Sign in — desktop only */}
          <Link
            href="/auth/login"
            className="mkt-nav-links"
            style={{ padding: '7px 18px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Sign in
          </Link>

          {/* Three-dot menu — all devices */}
          <div ref={dotsRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDotsOpen(!dotsOpen)}
              aria-label="More options"
              style={{
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--line)', borderRadius: 8,
                background: dotsOpen ? 'var(--bg-3)' : 'var(--bg-2)',
                color: 'var(--fg-2)', cursor: 'pointer',
                transition: 'background 120ms',
              }}
            >
              <DotsIcon />
            </button>

            {/* Dropdown */}
            {dotsOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                width: 220,
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: 12,
                boxShadow: '0 8px 32px -8px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)',
                padding: 14,
                zIndex: 100,
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 10 }}>
                  APPEARANCE
                </div>

                {/* Segmented theme control */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, background: 'var(--bg-3)', borderRadius: 9 }}>
                  {(['light', 'dark'] as const).map((t) => {
                    const active = theme === t;
                    return (
                      <button
                        key={t}
                        onClick={() => applyTheme(t)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                          padding: '8px 12px', borderRadius: 6, border: 0, cursor: 'pointer',
                          background: active ? 'var(--bg)' : 'transparent',
                          color: active ? 'var(--fg)' : 'var(--fg-3)',
                          fontSize: 13, fontWeight: active ? 500 : 400,
                          boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                          transition: 'all 150ms',
                        }}
                      >
                        {t === 'light' ? <SunIcon /> : <MoonIcon />}
                        {t === 'light' ? 'Light' : 'Dark'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

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
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{ fontSize: 14, color: 'var(--fg-2)', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid var(--line)' }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div style={{ marginTop: 12 }}>
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
