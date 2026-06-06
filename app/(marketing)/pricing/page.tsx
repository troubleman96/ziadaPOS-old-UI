'use client';

import React, { useState } from 'react';
import Link from 'next/link';

function Check({ color = 'var(--good)' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7L5.5 10.5L12 3.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4 4l6 6M10 4l-6 6" stroke="var(--fg-4)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 15000,
    annual: 12500,
    target: 'Solo dukas and kiosks',
    desc: 'Everything you need to go digital — POS, inventory and credit tracking in one place.',
    cta: 'Start free trial',
    href: '/auth/register',
    popular: false,
  },
  {
    id: 'business',
    name: 'Business',
    monthly: 40000,
    annual: 33000,
    target: 'Growing shops and small chains',
    desc: 'Multi-store management, Ziada AI, and advanced analytics for ambitious retailers.',
    cta: 'Start free trial',
    href: '/auth/register',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthly: null,
    annual: null,
    target: 'Retail chains and wholesalers',
    desc: 'Unlimited scale, API access, and a dedicated team to help you set up and grow.',
    cta: 'Contact us',
    href: '/contact',
    popular: false,
  },
];

const MATRIX: { feature: string; starter: boolean | string; business: boolean | string; enterprise: boolean | string }[] = [
  { feature: 'Stores',           starter: '1',             business: 'Up to 3',       enterprise: 'Unlimited' },
  { feature: 'Products',         starter: 'Up to 500',     business: 'Unlimited',     enterprise: 'Unlimited' },
  { feature: 'Staff accounts',   starter: '2',             business: '10',            enterprise: 'Unlimited' },
  { feature: 'Point of Sale',    starter: true,            business: true,            enterprise: true },
  { feature: 'Inventory',        starter: true,            business: true,            enterprise: true },
  { feature: 'Credit tracking',  starter: true,            business: true,            enterprise: true },
  { feature: 'Offline mode',     starter: true,            business: true,            enterprise: true },
  { feature: 'Analytics',        starter: 'Basic',         business: 'Advanced',      enterprise: 'Advanced' },
  { feature: 'Ziada AI',         starter: false,           business: true,            enterprise: true },
  { feature: 'Multi-store mgmt', starter: false,           business: true,            enterprise: true },
  { feature: 'WhatsApp reports', starter: false,           business: true,            enterprise: true },
  { feature: 'API access',       starter: false,           business: false,           enterprise: true },
  { feature: 'Custom domain',    starter: false,           business: false,           enterprise: true },
  { feature: 'Dedicated support',starter: false,           business: false,           enterprise: true },
  { feature: 'SLA guarantee',    starter: false,           business: false,           enterprise: true },
];

function renderCell(val: boolean | string) {
  if (val === true) return <Check />;
  if (val === false) return <Cross />;
  return <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-2)' }}>{val}</span>;
}

function fmt(n: number) {
  return 'TZS ' + n.toLocaleString('en-US');
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <style>{`
        .pricing-matrix-col { min-width: 100px; text-align: center; }
        @media (max-width: 768px) {
          .pricing-matrix-col { min-width: 72px; }
          .mkt-plan-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <section style={{ padding: '80px 0 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 20%, transparent 75%)' }} />
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 16 }}>PRICING</div>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.06, fontFamily: 'var(--display, var(--sans))' }}>
            Simple, honest pricing.
          </h1>
          <p style={{ margin: '0 auto 32px', maxWidth: 480, fontSize: 16, color: 'var(--fg-2)', lineHeight: 1.6 }}>
            All features on every plan. Pay in TZS via M-Pesa, Tigo, Airtel, or Bank. No credit card required.
          </p>

          {/* Annual/monthly toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, border: '1px solid var(--line)', borderRadius: 999, background: 'var(--bg-2)', overflow: 'hidden', padding: 4 }}>
            {[{ label: 'Monthly', v: false }, { label: 'Annual', v: true }].map(({ label, v }) => (
              <button
                key={label}
                onClick={() => setAnnual(v)}
                style={{ padding: '7px 18px', borderRadius: 999, border: 0, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: annual === v ? 500 : 400, background: annual === v ? 'var(--accent)' : 'transparent', color: annual === v ? '#fff' : 'var(--fg-2)', transition: 'all 120ms' }}
              >
                {label}
              </button>
            ))}
          </div>
          {annual && (
            <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--good)' }}>
              Save 2 months · Annual billing
            </div>
          )}
        </div>
      </section>

      {/* ── Plan cards ── */}
      <section style={{ padding: '0 0 72px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          <div className="mkt-plan-cards">
            {PLANS.map((plan) => {
              const price = annual ? plan.annual : plan.monthly;
              return (
                <div
                  key={plan.id}
                  style={{
                    border: `1px solid ${plan.popular ? 'var(--accent-line)' : 'var(--line)'}`,
                    borderRadius: 14,
                    padding: '28px',
                    background: plan.popular ? 'var(--accent-soft)' : 'var(--bg-2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                    position: 'relative',
                  }}
                >
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 14px', borderRadius: 999, letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                      MOST POPULAR
                    </div>
                  )}

                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 4 }}>{plan.name.toUpperCase()}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginBottom: 16 }}>{plan.target}</div>
                    {price !== null ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', fontFamily: 'var(--mono)' }}>{fmt(price)}</span>
                        <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>/month</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em' }}>Custom</div>
                    )}
                    <p style={{ margin: '14px 0 0', fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>{plan.desc}</p>
                  </div>

                  <Link
                    href={plan.href}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '11px', borderRadius: 8, fontWeight: 500, fontSize: 14,
                      textDecoration: 'none',
                      background: plan.popular ? 'var(--accent)' : 'var(--bg-3)',
                      color: plan.popular ? '#fff' : 'var(--fg)',
                      border: plan.popular ? 'none' : '1px solid var(--line)',
                    }}
                  >
                    {plan.cta} {plan.popular ? ' →' : ''}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Trial note */}
          <div style={{ marginTop: 20, padding: '14px 20px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['7-day free trial on all plans', 'TZS 10,000 activation fee', 'No credit card required'].map((t) => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--fg-2)' }}>
                  <Check color="var(--good)" />{t}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['M-Pesa', 'Tigo Pesa', 'Airtel', 'Bank'].map((m) => (
                <span key={m} style={{ fontFamily: 'var(--mono)', fontSize: 10.5, padding: '4px 9px', borderRadius: 5, border: '1px solid var(--line)', color: 'var(--fg-3)' }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature matrix ── */}
      <section style={{ borderTop: '1px solid var(--line)', padding: '72px 0', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 8 }}>FULL COMPARISON</div>
          <h2 style={{ margin: '0 0 36px', fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em' }}>What&apos;s included</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="mkt-feature-matrix">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.07em', color: 'var(--fg-4)', borderBottom: '1px solid var(--line)', width: '40%' }}>FEATURE</th>
                  {PLANS.map((p) => (
                    <th key={p.id} className="pricing-matrix-col" style={{ padding: '12px 16px', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.07em', color: p.popular ? 'var(--accent)' : 'var(--fg-4)', borderBottom: '1px solid var(--line)' }}>
                      {p.name.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row, i) => (
                  <tr key={row.feature} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-3)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13.5, color: 'var(--fg-2)', borderBottom: '1px solid var(--line)' }}>{row.feature}</td>
                    <td className="pricing-matrix-col" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>{renderCell(row.starter)}</div>
                    </td>
                    <td className="pricing-matrix-col" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', background: 'var(--accent-soft)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>{renderCell(row.business)}</div>
                    </td>
                    <td className="pricing-matrix-col" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>{renderCell(row.enterprise)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ borderTop: '1px solid var(--line)', padding: '72px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 8 }}>PRICING FAQ</div>
          <h2 style={{ margin: '0 0 36px', fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em' }}>Questions about pricing</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { q: 'What\'s included in the free trial?', a: 'Every feature on the plan you sign up for — no restrictions. The 7-day trial requires a one-time TZS 10,000 activation fee paid via M-Pesa, Tigo, Airtel, or Bank. No credit card required.' },
              { q: 'What happens when the trial ends?', a: 'Your account moves to the plan you selected. You\'ll be billed in TZS via your preferred payment method. If you don\'t upgrade, your data is kept for 30 days before deletion.' },
              { q: 'Can I change plans later?', a: 'Yes. You can upgrade or downgrade from Settings → Billing at any time. Upgrades are prorated. Downgrades take effect at the next billing cycle.' },
              { q: 'Do you offer refunds?', a: 'Yes. If you\'re not satisfied within the first 30 days of a paid subscription, contact us and we\'ll issue a full refund — no questions asked.' },
              { q: 'How do I pay for Enterprise?', a: 'Enterprise pricing is customised based on number of stores, staff, and support requirements. Reach out to contact@ziadapos.com or WhatsApp 0692069230 and we\'ll put together a quote within 24 hours.' },
            ].map((faq, i) => (
              <div key={i} style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
                <div style={{ fontSize: 14.5, fontWeight: 500, marginBottom: 8 }}>{faq.q}</div>
                <div style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.65 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop: '1px solid var(--line)', padding: '72px 0', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>Ready to get started?</h2>
          <p style={{ margin: '0 auto 28px', maxWidth: 480, fontSize: 15, color: 'var(--fg-2)' }}>
            Start your 7-day free trial today. Most shops are live in under an hour.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              Start free trial →
            </Link>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 18px', borderRadius: 7, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 14, textDecoration: 'none' }}>
              Talk to the team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
