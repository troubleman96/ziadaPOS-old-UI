'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/components/LangContext';
import { t } from '@/lib/lang';

export function MarketingFooter() {
  const { lang } = useLang();

  const COLS = [
    {
      titleKey: 'footer_product' as const,
      links: [
        { labelKey: 'footer_pos'      as const, href: '/#features' },
        { labelKey: 'footer_inv'      as const, href: '/#features' },
        { labelKey: 'footer_analytics'as const, href: '/#features' },
        { labelKey: 'footer_credits'  as const, href: '/#features' },
        { labelKey: 'nav_ai'          as const, href: '/#ai'       },
      ],
    },
    {
      titleKey: 'footer_company' as const,
      links: [
        { labelKey: 'footer_about'   as const, href: '/about'   },
        { labelKey: 'footer_pricing' as const, href: '/pricing' },
        { labelKey: 'footer_contact' as const, href: '/contact' },
        { labelKey: 'footer_careers' as const, href: '/contact' },
      ],
    },
    {
      titleKey: 'footer_legal' as const,
      links: [
        { labelKey: 'footer_terms'   as const, href: '/terms'   },
        { labelKey: 'footer_privacy' as const, href: '/privacy' },
      ],
    },
  ];

  return (
    <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div className="mkt-footer-grid" style={{ maxWidth: 1240, margin: '0 auto', padding: '44px 24px 28px' }}>

        {/* Brand column */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', fontFamily: 'var(--sans)', color: 'var(--fg)' }}>Ziada</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--fg-3)', maxWidth: 220, margin: '0 0 18px', lineHeight: 1.65 }}>
            {t(lang, 'footer_desc')}
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
        {COLS.map(({ titleKey, links }) => (
          <div key={titleKey}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 16 }}>
              {t(lang, titleKey).toUpperCase()}
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map(({ labelKey, href }) => (
                <li key={labelKey}>
                  <Link href={href} style={{ fontSize: 13, color: 'var(--fg-2)', textDecoration: 'none' }}>
                    {t(lang, labelKey)}
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
          {t(lang, 'footer_built')}{' '}
          <span style={{ color: 'var(--fg-3)' }}>Camel Tech</span>
          {' × '}
          <span style={{ color: 'var(--fg-3)' }}>Camel Creatives</span>
        </span>
      </div>
    </footer>
  );
}
