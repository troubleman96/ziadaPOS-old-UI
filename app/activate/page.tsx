'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCachedUser, getCachedSubscription, isAuthenticated } from '@/lib/auth';

const AIRTEL_NUMBER    = '0692069230';
const AIRTEL_NUMBER_WA = '255692069230';   // WhatsApp international format (no +)
const PAYEE_NAME       = 'Ditrick Mpangile';
const TRIAL_FEE        = 10_000;

// ── Icons ──────────────────────────────────────────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// ── Copy-to-clipboard button ───────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      title="Copy"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 9px', borderRadius: 6,
        border: '1px solid var(--line-2)', background: 'var(--bg-3)',
        color: copied ? 'var(--good)' : 'var(--fg-3)',
        cursor: 'pointer', fontSize: 12, fontFamily: 'var(--mono)',
        transition: 'color 120ms, background 120ms',
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ActivatePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name: string; phone: string } | null>(null);
  const [theme, setTheme] = useState('dark');
  const [stepsOpen, setStepsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/auth/login'); return; }
    const u = getCachedUser();
    if (u) setUser({ full_name: u.full_name, phone: u.phone });

    try {
      const t = localStorage.getItem('ziada-theme');
      if (t === 'light' || t === 'dark') setTheme(t);
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('ziada-theme', theme); } catch {}
  }, [theme]);

  // Build the pre-filled WhatsApp message
  const waMessage = encodeURIComponent(
    `Habari Ditrick,\n\nNinataka kulipa TZS 10,000 kwa Ziada POS 7-day trial yangu.\n\nJina langu: ${user?.full_name ?? ''}\nNamba ya simu: ${user?.phone ?? ''}\n\nAsante.`
  );
  const waUrl = `https://wa.me/${AIRTEL_NUMBER_WA}?text=${waMessage}`;

  const steps = [
    { n: '1', title: 'Open Airtel Money',    desc: 'Dial *150*60# or use your Airtel Money app.' },
    { n: '2', title: 'Send TZS 10,000',       desc: `Send to ${AIRTEL_NUMBER} (${PAYEE_NAME}).` },
    { n: '3', title: 'Message on WhatsApp',   desc: 'Tap the button below to send your payment confirmation.' },
    { n: '4', title: 'Account activated',     desc: 'Cameltech will activate your trial within minutes.' },
  ];

  return (
    <>
      <style>{`
        .act-page {
          min-height: 100dvh; background: var(--bg); color: var(--fg);
          font-family: var(--sans); -webkit-font-smoothing: antialiased;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 48px 20px;
        }
        .act-card {
          width: 100%; max-width: 480px;
          display: flex; flex-direction: column; gap: 24px;
        }
        .act-payment-box {
          background: var(--bg-2); border: 1.5px solid var(--accent-line);
          border-radius: 12px; padding: 20px 22px;
        }
        .act-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid var(--line);
        }
        .act-row:last-child { border-bottom: 0; padding-bottom: 0; }
        .act-label { font-size: 12px; color: var(--fg-4); font-family: var(--mono); letter-spacing: 0.05em; }
        .act-value { font-size: 14px; font-weight: 500; font-family: var(--mono); }
        .act-step {
          display: flex; gap: 14px; align-items: flex-start;
        }
        .act-step-num {
          width: 28px; height: 28px; border-radius: 999px; flex-shrink: 0;
          background: var(--accent-soft); border: 1px solid var(--accent-line);
          color: var(--accent); display: grid; place-items: center;
          font-family: var(--mono); font-size: 12px; font-weight: 600;
        }
        .wa-btn {
          width: 100%; height: 50px; border-radius: 10px; border: 0;
          background: #25D366; color: #fff;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-family: var(--sans); font-size: 15px; font-weight: 600;
          cursor: pointer; text-decoration: none;
          transition: filter 120ms;
        }
        .wa-btn:hover { filter: brightness(1.08); }
        .skip-link {
          text-align: center; font-size: 13px; color: var(--fg-4);
        }
        .skip-link a { color: var(--fg-3); text-decoration: underline;
          text-decoration-color: var(--line-2); }
        .skip-link a:hover { color: var(--fg-2); }
      `}</style>

      <div className="act-page">
        <div className="act-card">

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
            <img src="/ziada.PNG" alt="Ziada" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Ziada POS</span>
          </div>

          {/* Heading */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px', border: '1px solid var(--good-soft)', borderRadius: 999, marginBottom: 12, background: 'var(--good-soft)' }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--good)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--good)', letterSpacing: '0.05em' }}>ACCOUNT CREATED</span>
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>
              Activate your 7-day trial
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.6 }}>
              {user?.full_name ? `Welcome, ${user.full_name.split(' ')[0]}!` : 'Welcome!'}{' '}
              Your account is ready. Pay <strong style={{ color: 'var(--fg-2)' }}>TZS 10,000</strong> via Airtel Money to start your free 7-day trial.
            </p>
          </div>

          {/* Payment details box */}
          <div className="act-payment-box">
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 14 }}>
              AIRTEL MONEY — PAYMENT DETAILS
            </div>

            <div className="act-row">
              <span className="act-label">SEND TO</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="act-value">{AIRTEL_NUMBER}</span>
                <CopyButton text={AIRTEL_NUMBER} />
              </div>
            </div>

            <div className="act-row">
              <span className="act-label">NAME</span>
              <span className="act-value" style={{ fontFamily: 'var(--sans)' }}>{PAYEE_NAME}</span>
            </div>

            <div className="act-row">
              <span className="act-label">NETWORK</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#FF0000', display: 'inline-block' }} />
                <span className="act-value" style={{ fontFamily: 'var(--sans)' }}>Airtel Money</span>
              </span>
            </div>

            <div className="act-row">
              <span className="act-label">AMOUNT</span>
              <span className="act-value" style={{ color: 'var(--accent)', fontSize: 16 }}>
                TZS 10,000
              </span>
            </div>
          </div>

          {/* Steps — collapsible */}
          <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
            {/* Header — always visible, click to toggle */}
            <button
              onClick={() => setStepsOpen(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: 'var(--bg-2)',
                border: 0, cursor: 'pointer', gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Info icon */}
                <span style={{
                  width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                  background: 'var(--info-soft)', border: '1px solid rgba(96,165,250,0.25)',
                  color: 'var(--info)', display: 'grid', placeItems: 'center',
                }}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
                    <circle cx="6" cy="6" r="5.5" fillOpacity="0" stroke="currentColor" strokeWidth="1.2" />
                    <rect x="5.4" y="5" width="1.2" height="4" rx=".5" />
                    <circle cx="6" cy="3.2" r=".7" />
                  </svg>
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.08em' }}>
                  HOW TO PAY
                </span>
              </div>
              {/* Chevron */}
              <svg
                width="12" height="12" viewBox="0 0 12 12"
                style={{ color: 'var(--fg-4)', transition: 'transform 200ms', transform: stepsOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Steps body — animated reveal */}
            {stepsOpen && (
              <div style={{ padding: '4px 16px 16px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--bg)' }}>
                {steps.map(s => (
                  <div key={s.n} className="act-step" style={{ marginTop: 12 }}>
                    <div className="act-step-num">{s.n}</div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>{s.title}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WhatsApp CTA */}
          <div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="wa-btn"
            >
              <WhatsAppIcon />
              Send payment confirmation on WhatsApp
            </a>
            <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--fg-4)', textAlign: 'center', lineHeight: 1.5 }}>
              Opens WhatsApp with a pre-filled message to <strong style={{ color: 'var(--fg-3)' }}>+255 692 069 230</strong> ({PAYEE_NAME}).
              Your trial activates within minutes of confirmation.
            </p>
          </div>

          {/* Skip */}
          <div className="skip-link">
            Already paid?{' '}
            <Link href="/dashboard">Go to dashboard →</Link>
          </div>

          {/* Theme toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 6, padding: '5px 10px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', cursor: 'pointer' }}
            >
              {theme === 'dark' ? '◐ dark' : '◑ light'}
            </button>
          </div>

        </div>

        <div style={{ marginTop: 36, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)', textAlign: 'center' }}>
          © 2026 Ziada Technologies Ltd · Dar es Salaam
        </div>
      </div>
    </>
  );
}
