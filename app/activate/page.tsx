'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { getCachedUser, getCachedSubscription, cacheSubscription, isAuthenticated, getAccessToken } from '@/lib/auth';
import { DotsMenu } from '@/components/DotsMenu';
import { LangProvider, useLang } from '@/components/LangContext';
import { t } from '@/lib/lang';

const AIRTEL_NUMBER    = '0692069230';
const AIRTEL_NUMBER_WA = '255692069230';
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
      title={copied ? 'Copied!' : 'Copy number'}
      style={{
        width: 30, height: 30, borderRadius: 7, flexShrink: 0,
        display: 'grid', placeItems: 'center',
        border: `1px solid ${copied ? 'rgba(52,211,153,0.35)' : 'var(--line-2)'}`,
        background: copied ? 'rgba(52,211,153,0.1)' : 'var(--bg-3)',
        color: copied ? 'var(--good)' : 'var(--fg-3)',
        cursor: 'pointer', transition: 'all 150ms',
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
const POLL_INTERVAL = 10;

function ActivatePageInner() {
  const router = useRouter();
  const { lang } = useLang();
  const [user, setUser] = useState<{ full_name: string; phone: string } | null>(null);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(POLL_INTERVAL);
  const [checkError, setCheckError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkInFlightRef = useRef(false);

  async function checkStatus(silent = false) {
    if (checkInFlightRef.current) return;
    if (!getAccessToken()) { router.replace('/auth/login'); return; }

    checkInFlightRef.current = true;
    if (!silent) setChecking(true);
    setCheckError('');

    const result = await authApi.mySubscription();

    if (!silent) setChecking(false);
    checkInFlightRef.current = false;

    if (result.success) {
      cacheSubscription(result.data);
      if (result.data.is_active_now) {
        timerRef.current && clearInterval(timerRef.current);
        countRef.current && clearInterval(countRef.current);
        router.replace('/dashboard');
        return;
      }
    } else {
      if ((result as { status?: number }).status !== 402 && !silent) {
        setCheckError(t(lang, 'act_err_server'));
      }
    }
    setCountdown(POLL_INTERVAL);
  }

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/auth/login'); return; }
    const u = getCachedUser();
    if (u) setUser({ full_name: u.full_name, phone: u.phone });
    checkStatus(true);
    timerRef.current = setInterval(() => checkStatus(true), POLL_INTERVAL * 1000);
    countRef.current = setInterval(() => {
      setCountdown(c => (c <= 1 ? POLL_INTERVAL : c - 1));
    }, 1000);
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      countRef.current && clearInterval(countRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const waMessage = encodeURIComponent(
    `Habari Ditrick,\n\nNinataka kulipa TZS 10,000 kwa Ziada 7-day trial yangu.\n\nJina langu: ${user?.full_name ?? ''}\nNamba ya simu: ${user?.phone ?? ''}\n\nAsante.`
  );
  const waUrl = `https://wa.me/${AIRTEL_NUMBER_WA}?text=${waMessage}`;

  const steps = [
    { n: '1', title: t(lang, 'act_step1_t'), desc: t(lang, 'act_step1_d') },
    { n: '2', title: t(lang, 'act_step2_t'), desc: `${lang === 'sw' ? 'Tuma kwa' : 'Send to'} ${AIRTEL_NUMBER} (${PAYEE_NAME}).` },
    { n: '3', title: t(lang, 'act_step3_t'), desc: t(lang, 'act_step3_d') },
    { n: '4', title: t(lang, 'act_step4_t'), desc: t(lang, 'act_step4_d') },
  ];

  const firstName = user?.full_name?.split(' ')[0] ?? '';

  return (
    <>
      <style>{`
        @keyframes act-spin { to { transform: rotate(360deg); } }
        @keyframes act-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .act-page {
          min-height: 100dvh;
          background: var(--bg); color: var(--fg);
          font-family: var(--sans); -webkit-font-smoothing: antialiased;
          display: flex; flex-direction: column;
        }
        .act-glow {
          position: fixed; top: 0; left: 50%; transform: translateX(-50%);
          width: 900px; height: 500px; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse 65% 55% at 50% -10%, rgba(99,102,241,0.22) 0%, transparent 70%);
        }
        .act-topbar {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 56px;
          background: color-mix(in oklab, var(--bg) 82%, transparent);
          backdrop-filter: blur(12px) saturate(160%);
          -webkit-backdrop-filter: blur(12px) saturate(160%);
          border-bottom: 1px solid var(--line);
        }
        .act-body {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 48px 20px 64px;
          position: relative; z-index: 1;
          animation: act-fade-up 400ms cubic-bezier(0.16,1,0.3,1) both;
        }
        .act-card {
          width: 100%; max-width: 468px;
          display: flex; flex-direction: column; gap: 20px;
        }
        .act-payment-box {
          background: var(--bg-2);
          border: 1.5px solid rgba(99,102,241,0.25);
          border-radius: 14px; padding: 18px 20px;
          box-shadow: 0 4px 24px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .act-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 0; border-bottom: 1px solid var(--line);
        }
        .act-row:last-child { border-bottom: 0; padding-bottom: 0; }
        .act-label {
          font-size: 11px; color: var(--fg-4);
          font-family: var(--mono); letter-spacing: 0.07em;
        }
        .act-value {
          font-size: 13.5px; font-weight: 500; font-family: var(--mono);
        }
        .act-step { display: flex; gap: 14px; align-items: flex-start; }
        .act-step-num {
          width: 28px; height: 28px; border-radius: 999px; flex-shrink: 0;
          background: var(--accent-soft); border: 1px solid var(--accent-line);
          color: var(--accent); display: grid; place-items: center;
          font-family: var(--mono); font-size: 12px; font-weight: 600;
        }
        .wa-btn {
          width: 100%; height: 52px; border-radius: 12px; border: 0;
          background: linear-gradient(135deg, #1fba52, #25D366);
          color: #fff;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-family: var(--sans); font-size: 15px; font-weight: 600;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 4px 18px rgba(37,211,102,0.32);
          transition: filter 140ms, box-shadow 140ms;
        }
        .wa-btn:hover {
          filter: brightness(1.06);
          box-shadow: 0 6px 24px rgba(37,211,102,0.42);
        }
        .act-footer {
          text-align: center; padding-bottom: 32px;
          font-family: var(--mono); font-size: 10.5px; color: var(--fg-4);
        }
      `}</style>

      <div className="act-page">
        <div className="act-glow" />

        {/* ── Topbar ── */}
        <header className="act-topbar">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <img
              src="/ziada-final.jpeg"
              alt="Ziada"
              style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover',
                boxShadow: '0 0 0 1.5px rgba(33,14,230,0.18), 0 2px 8px rgba(33,14,230,0.15)' }}
            />
            <span style={{ fontWeight: 600, fontSize: 14.5, letterSpacing: '-0.02em', color: 'var(--fg)' }}>ziada</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 999,
              background: 'var(--good-soft)', border: '1px solid rgba(52,211,153,0.25)',
              fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--good)', letterSpacing: '0.06em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--good)', display: 'inline-block', flexShrink: 0 }} />
              {t(lang, 'act_acct_created')}
            </span>
            <DotsMenu />
          </div>
        </header>

        {/* ── Body ── */}
        <main className="act-body">
          <div className="act-card">

            {/* Heading */}
            <div style={{ marginBottom: 4 }}>
              <h1 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                {t(lang, 'act_h1')}
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.65 }}>
                {firstName ? `${t(lang, 'act_welcome')}, ${firstName}!` : `${t(lang, 'act_welcome')}!`}{' '}
                {t(lang, 'act_sub')}
              </p>
            </div>

            {/* Payment details box */}
            <div className="act-payment-box">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16,
                fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)',
                letterSpacing: '0.09em',
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                  background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
                  display: 'grid', placeItems: 'center', color: 'var(--accent)',
                }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="12" height="9" rx="1.5" />
                    <path d="M2 7h12" /><path d="M5 10h2" />
                  </svg>
                </span>
                {t(lang, 'act_payment_hdr')}
              </div>

              <div className="act-row">
                <span className="act-label">{t(lang, 'act_send_to')}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="act-value" style={{ fontSize: 15, letterSpacing: '0.03em' }}>{AIRTEL_NUMBER}</span>
                  <CopyButton text={AIRTEL_NUMBER} />
                </div>
              </div>

              <div className="act-row">
                <span className="act-label">{t(lang, 'act_label_name')}</span>
                <span className="act-value" style={{ fontFamily: 'var(--sans)', fontWeight: 500 }}>{PAYEE_NAME}</span>
              </div>

              <div className="act-row">
                <span className="act-label">{t(lang, 'act_label_network')}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4, background: '#FF0000',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: '#fff', display: 'block' }} />
                  </span>
                  <span className="act-value" style={{ fontFamily: 'var(--sans)' }}>Airtel Money</span>
                </span>
              </div>

              <div className="act-row">
                <span className="act-label">{t(lang, 'act_label_amount')}</span>
                <span style={{
                  fontSize: 17, fontWeight: 700, fontFamily: 'var(--mono)',
                  color: 'var(--accent)', letterSpacing: '-0.01em',
                  background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
                  padding: '3px 10px', borderRadius: 7,
                }}>
                  TZS 10,000
                </span>
              </div>
            </div>

            {/* Steps — collapsible */}
            <div style={{
              border: '1px solid var(--line)', borderRadius: 12,
              overflow: 'hidden', background: 'var(--bg-2)',
            }}>
              <button
                onClick={() => setStepsOpen(v => !v)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '13px 16px',
                  background: 'transparent', border: 0, cursor: 'pointer', gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
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
                    {t(lang, 'act_how_to_pay')}
                  </span>
                </div>
                <svg
                  width="12" height="12" viewBox="0 0 12 12"
                  style={{ color: 'var(--fg-4)', transition: 'transform 200ms', transform: stepsOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {stepsOpen && (
                <div style={{ padding: '4px 16px 18px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {steps.map(s => (
                    <div key={s.n} className="act-step" style={{ marginTop: 12 }}>
                      <div className="act-step-num">{s.n}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 3 }}>{s.title}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.55 }}>{s.desc}</div>
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
                {t(lang, 'act_wa_btn')}
              </a>
              <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--fg-4)', textAlign: 'center', lineHeight: 1.55 }}>
                {t(lang, 'act_wa_open')}{' '}
                <strong style={{ color: 'var(--fg-3)' }}>+255 692 069 230</strong> ({PAYEE_NAME}).{' '}
                {t(lang, 'act_wa_activates')}
              </p>
            </div>

            {/* Status checker */}
            <div style={{
              border: '1px solid var(--line)', borderRadius: 12,
              padding: '15px 18px', background: 'var(--bg-2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: 999,
                      background: 'var(--warn)', display: 'inline-block',
                      boxShadow: '0 0 0 3px rgba(251,191,36,0.18)',
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{t(lang, 'act_waiting')}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-4)', paddingLeft: 15 }}>
                    {t(lang, 'act_auto_check')}{' '}
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--fg-3)', fontWeight: 500 }}>{countdown}s</span>
                  </div>
                </div>
                <button
                  onClick={() => checkStatus(false)}
                  disabled={checking}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 16px', borderRadius: 9,
                    border: '1.5px solid var(--accent-line)', background: 'var(--accent-soft)',
                    color: 'var(--accent)', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
                    cursor: checking ? 'not-allowed' : 'pointer', opacity: checking ? 0.6 : 1,
                    transition: 'opacity 120ms, box-shadow 120ms',
                    boxShadow: checking ? 'none' : '0 2px 8px rgba(99,102,241,0.12)',
                  }}
                >
                  {checking ? (
                    <>
                      <div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid var(--accent-line)', borderTopColor: 'var(--accent)', animation: 'act-spin 0.7s linear infinite' }} />
                      {t(lang, 'act_checking')}
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                      {t(lang, 'act_check_btn')}
                    </>
                  )}
                </button>
              </div>
              {checkError && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--bad)' }}>{checkError}</div>
              )}
            </div>

          </div>
        </main>

        <div className="act-footer">
          © 2026 Ziada Technologies Ltd · Dar es Salaam
        </div>
      </div>
    </>
  );
}

export default function ActivatePage() {
  return (
    <LangProvider>
      <ActivatePageInner />
    </LangProvider>
  );
}
