'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/components/LangContext';
import { t, LANG_LABELS, type Lang } from '@/lib/lang';

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
  const [theme, setTheme]       = useState<'light' | 'dark'>('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dotsOpen, setDotsOpen] = useState(false);
  const dotsRef                 = useRef<HTMLDivElement>(null);
  const pathname                = usePathname();
  const { lang, setLang }       = useLang();

  const NAV_LINKS = [
    { labelKey: 'nav_product' as const, href: '/#features' },
    { labelKey: 'nav_ai'      as const, href: '/#ai'       },
    { labelKey: 'nav_pricing' as const, href: '/pricing'   },
    { labelKey: 'nav_about'   as const, href: '/about'     },
    { labelKey: 'nav_contact' as const, href: '/contact'   },
  ];

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ziada-theme');
      const th = stored === 'dark' ? 'dark' : 'light';
      setTheme(th);
      document.documentElement.setAttribute('data-theme', th);
    } catch {}
  }, []);

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

  function applyTheme(th: 'light' | 'dark') {
    setTheme(th);
    document.documentElement.setAttribute('data-theme', th);
    try { localStorage.setItem('ziada-theme', th); } catch {}
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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', fontFamily: 'var(--sans)' }}>Ziada</span>
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

                {/* ── Appearance ── */}
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 10 }}>
                  {t(lang, 'dots_appearance')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, background: 'var(--bg-3)', borderRadius: 9 }}>
                  {(['light', 'dark'] as const).map((th) => {
                    const active = theme === th;
                    return (
                      <button
                        key={th}
                        onClick={() => applyTheme(th)}
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
                        {th === 'light' ? <SunIcon /> : <MoonIcon />}
                        {t(lang, th === 'light' ? 'dots_light' : 'dots_dark')}
                      </button>
                    );
                  })}
                </div>

                {/* ── Divider ── */}
                <div style={{ height: 1, background: 'var(--line)', margin: '14px 0 12px' }} />

                {/* ── Language ── */}
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 10 }}>
                  {t(lang, 'dots_language')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, background: 'var(--bg-3)', borderRadius: 9 }}>
                  {(['sw', 'en'] as Lang[]).map((l) => {
                    const active = lang === l;
                    return (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          padding: '8px 4px', borderRadius: 6, border: 0, cursor: 'pointer',
                          background: active ? 'var(--bg)' : 'transparent',
                          color: active ? 'var(--fg)' : 'var(--fg-3)',
                          fontSize: 11, fontWeight: active ? 600 : 400,
                          boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                          transition: 'all 150ms',
                          gap: 2,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>{l.toUpperCase()}</span>
                        <span style={{ fontSize: 10, color: active ? 'var(--fg-2)' : 'var(--fg-4)' }}>{LANG_LABELS[l]}</span>
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
