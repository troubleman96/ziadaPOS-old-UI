'use client';

import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export default function AboutPage() {
  return (
    <>
      <style>{`
        .about-section { padding: 80px 0; border-top: 1px solid var(--line); }
        .about-section:first-of-type { border-top: none; }
      `}</style>

      {/* ── Hero ── */}
      <section style={{ padding: '88px 0 72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 80%)' }} />
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 16 }}>ABOUT · ZIADA TECHNOLOGIES</div>
          <h1 style={{ margin: '0 0 24px', fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.04, fontWeight: 800, letterSpacing: '-0.04em', maxWidth: 820, fontFamily: 'var(--sans)' }}>
            Built in Tanzania,<br />designed for African commerce.
          </h1>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color: 'var(--fg-2)', maxWidth: 600 }}>
            Ziada started from a simple observation: Tanzanian traders were running billion-shilling businesses on paper ledgers and WhatsApp screenshots. We built the tool we wish existed.
          </p>
        </div>
      </section>

      {/* ── Origin story ── */}
      <section style={{ borderTop: '1px solid var(--line)', padding: '72px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }} className="about-origin-grid">
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 20 }}>ORIGIN</div>
            <h2 style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.015em' }}>Why we built this</h2>
            <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.7, color: 'var(--fg-2)' }}>
              Walk into any duka in Dar es Salaam and you&apos;ll see the same thing: a worn notebook tracking who owes what, a calculator for every sale, and a phone full of M-Pesa confirmation screenshots. These are not unsophisticated businesses — they&apos;re sophisticated traders running on tools that weren&apos;t built for them.
            </p>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'var(--fg-2)' }}>
              Ziada was built to change that. A single platform that works offline, speaks Swahili, accepts the payments Tanzanians actually use, and now has an AI that answers questions about your specific store — not a generic chatbot, but one grounded in your sales, your stock, and your customers. We built it in Dar es Salaam, tested it in dukas across 6 regions, and we&apos;re still improving it every week based on what traders tell us.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'FOUNDED', v: '2024', desc: 'Incorporated in Dar es Salaam, Tanzania' },
              { label: 'STORES', v: '1,247+', desc: 'Across 6 regions in Tanzania' },
              { label: 'TZS PROCESSED', v: '4.21B+', desc: 'In transactions over the last 30 days' },
              { label: 'UPTIME', v: '99.98%', desc: 'Over the last 90 days' },
            ].map(({ label, v, desc }) => (
              <div key={label} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '18px 20px', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{desc}</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', flexShrink: 0, fontFamily: 'var(--mono)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          .about-origin-grid { grid-template-columns: 1fr 1fr !important; }
          @media (max-width: 900px) { .about-origin-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>

      {/* ── Founders ── */}
      <section style={{ borderTop: '1px solid var(--line)', padding: '72px 0', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 8 }}>TEAM</div>
          <h2 style={{ margin: '0 0 40px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.015em' }}>The cofounders</h2>
          <div className="mkt-founders-grid">
            {[
              {
                name: 'Emmanuel Lugenge',
                role: 'Co-founder · Product & Engineering',
                company: 'Camel Tech',
                bio: 'Emmanuel leads product and engineering at Ziada. He built the first version of the platform after watching family members manage their shop finances on paper. He believes great software should be invisible — it should just make the work easier.',
                initial: 'E',
              },
              {
                name: 'Ditrick Mpangile',
                role: 'Co-founder · Design & Growth',
                company: 'Camel Creatives',
                bio: 'Ditrick leads design and growth at Ziada. He brings deep experience in visual communication and brand strategy across East Africa. His approach: if a trader in Mwanza can\'t figure it out in 30 seconds, it needs to be redesigned.',
                initial: 'D',
              },
            ].map((f) => (
              <div key={f.name} style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg)' }}>
                <div style={{ padding: '32px 28px', borderBottom: '1px solid var(--line)', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--accent)', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 600, color: '#fff', flexShrink: 0, fontFamily: 'var(--sans)' }}>
                    {f.initial}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>{f.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 4, lineHeight: 1.5 }}>{f.role}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '3px 9px', borderRadius: 999, background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.04em' }}>
                      {f.company}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '24px 28px' }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--fg-2)' }}>{f.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Companies ── */}
      <section style={{ borderTop: '1px solid var(--line)', padding: '72px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 8 }}>COMPANIES</div>
          <h2 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.015em' }}>Ziada is a product of two companies working as one</h2>
          <p style={{ margin: '0 0 36px', fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.6, maxWidth: 600 }}>
            Engineering and design built under one roof — different disciplines, one product, one mission.
          </p>
          <div className="mkt-companies-grid">
            {[
              {
                name: 'Camel Tech',
                tagline: 'Software engineering & infrastructure',
                desc: 'Camel Tech builds the backend, API, data layer and all platform infrastructure behind Ziada. The team focuses on reliability, offline-first architecture, and scaling for the African mobile-first context.',
                color: 'var(--accent)',
              },
              {
                name: 'Camel Creatives',
                tagline: 'Design, brand & merchant experience',
                desc: 'Camel Creatives owns the Ziada product design, marketing, and how merchants experience the platform — from first click to daily use. The team believes that good design is the highest form of respect for the user\'s time.',
                color: 'var(--good)',
              },
            ].map((c) => (
              <div key={c.name} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '28px', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 999, border: `1px solid ${c.color}33`, background: `${c.color}11`, marginBottom: 14 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: c.color, display: 'block' }} />
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: c.color, letterSpacing: '0.04em' }}>{c.name}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{c.tagline}</div>
                  <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.65 }}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ borderTop: '1px solid var(--line)', padding: '72px 0', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 8 }}>VALUES</div>
          <h2 style={{ margin: '0 0 36px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.015em' }}>What we build around</h2>
          <div className="mkt-values-grid">
            {[
              { n: '01', title: 'Offline-first', desc: 'Your shop doesn\'t stop when the internet does. Every feature works without a connection — syncing happens in the background when connectivity returns. This isn\'t a fallback mode, it\'s the default.' },
              { n: '02', title: 'Swahili-first', desc: 'Built for how merchants actually talk. The AI answers in Swahili. The interface uses terms traders know. Language isn\'t an afterthought — it\'s baked into the core of every feature.' },
              { n: '03', title: 'Merchant-first', desc: 'Every feature in Ziada was driven by a real trader\'s pain point. We spend time in dukas, supermarkets, and pharmacies. We don\'t build features because they\'re interesting — we build them because traders need them.' },
            ].map((v) => (
              <div key={v.n} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '28px', background: 'var(--bg)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 14 }}>{v.n}</div>
                <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700 }}>{v.title}</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact callout ── */}
      <section style={{ borderTop: '1px solid var(--line)', padding: '72px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', display: 'grid', placeItems: 'center', margin: '0 auto 24px', fontSize: 18, color: '#fff', fontFamily: 'var(--sans)' }}>Z</div>
            <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Based in Dar es Salaam, Tanzania</h2>
            <p style={{ margin: '0 0 36px', fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.6 }}>
              We love hearing from merchants, partners and anyone building in the East African retail space.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="mailto:contact@ziadapos.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 7, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                contact@ziadapos.com
              </a>
              <a href="https://wa.me/255692069230?text=Hi+Ziada+team%2C" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 7, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 14, textDecoration: 'none' }}>
                WhatsApp 0692069230
              </a>
              <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 7, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 14, textDecoration: 'none' }}>
                Contact page →
              </Link>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', marginTop: 32, letterSpacing: '0.06em' }}>
              DAR ES SALAAM · ARUSHA · MWANZA · DODOMA · MBEYA · ZANZIBAR
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
