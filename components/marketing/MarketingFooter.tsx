import React from 'react';
import Link from 'next/link';

const COLS = [
  {
    title: 'Product',
    links: [
      { label: 'Point of Sale', href: '/#features' },
      { label: 'Inventory', href: '/#features' },
      { label: 'Analytics', href: '/#features' },
      { label: 'Credits', href: '/#features' },
      { label: 'Ziada AI', href: '/#ai' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div className="mkt-footer-grid" style={{ maxWidth: 1240, margin: '0 auto', padding: '44px 24px 28px' }}>

        {/* Brand column */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <img src="/ziadaposicon.jpeg" alt="Ziada" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', boxShadow: '0 0 0 1.5px rgba(79,70,229,0.18)' }} />
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--fg-3)', maxWidth: 220, margin: '0 0 18px', lineHeight: 1.65 }}>
            The operating system for retail. Built in Dar es Salaam, made for any counter on the continent.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <a
              href="mailto:contact@ziadapos.com"
              style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', textDecoration: 'none' }}
            >
              contact@ziadapos.com
            </a>
            <a
              href="https://wa.me/255692069230"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', textDecoration: 'none' }}
            >
              WhatsApp · 0692069230
            </a>
          </div>
        </div>

        {/* Link columns */}
        {COLS.map(({ title, links }) => (
          <div key={title}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 16 }}>
              {title.toUpperCase()}
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} style={{ fontSize: 13, color: 'var(--fg-2)', textDecoration: 'none' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '16px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)' }}>
          © 2026 Ziada Technologies Ltd · Dar es Salaam, Tanzania
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)' }}>
          Built by{' '}
          <span style={{ color: 'var(--fg-3)' }}>Camel Tech</span>
          {' × '}
          <span style={{ color: 'var(--fg-3)' }}>Camel Creatives</span>
        </span>
      </div>
    </footer>
  );
}
