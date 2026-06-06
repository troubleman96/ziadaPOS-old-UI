'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { label: 'Product', href: '/#features' },
  { label: 'Ziada AI', href: '/#ai' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function MarketingNav() {
  const [theme, setTheme] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ziada-theme');
      const t = stored === 'dark' ? 'dark' : 'light';
      setTheme(t);
      document.documentElement.setAttribute('data-theme', t);
    } catch {}
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('ziada-theme', next); } catch {}
  }

  const isActive = (href: string) => href !== '/' && pathname === href;

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--line)',
      backdropFilter: 'blur(16px) saturate(140%)',
      background: 'color-mix(in oklab, var(--bg) 80%, transparent)',
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, gap: 24 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
          <img
            src="/ziadaposicon.jpeg"
            alt="Ziada"
            style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', boxShadow: '0 0 0 1.5px rgba(79,70,229,0.2), 0 3px 10px rgba(79,70,229,0.14)' }}
          />
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', fontFamily: 'var(--display)' }}>Ziada</span>
        </Link>

        {/* Desktop nav */}
        <nav className="mkt-nav-links" style={{ marginLeft: 4 }}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{
                fontSize: 13.5,
                color: isActive(href) ? 'var(--fg)' : 'var(--fg-2)',
                textDecoration: 'none',
                fontWeight: isActive(href) ? 500 : 400,
                transition: 'color 120ms',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Desktop actions */}
        <div className="mkt-nav-links" style={{ gap: 8 }}>
          <button
            onClick={toggleTheme}
            style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--bg-2)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-2)' }}
          >
            {theme === 'dark' ? '◐ dark' : '◑ light'}
          </button>
          <Link
            href="/auth/login"
            style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 13.5, textDecoration: 'none', background: 'transparent' }}
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            style={{ padding: '7px 18px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Start free trial
          </Link>
        </div>

        {/* Mobile hamburger */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            <Link
              href="/auth/register"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >
              Start free trial
            </Link>
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 14, textDecoration: 'none' }}
            >
              Sign in
            </Link>
          </div>
          <button
            onClick={toggleTheme}
            style={{ padding: '8px 0', border: 0, background: 'transparent', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-4)', cursor: 'pointer', textAlign: 'left', marginTop: 4 }}
          >
            {theme === 'dark' ? '◐ Switch to light mode' : '◑ Switch to dark mode'}
          </button>
        </div>
      )}
    </header>
  );
}
