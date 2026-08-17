'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DotsMenu } from '@/components/DotsMenu';

type Step = 'phone' | 'sent';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const phoneRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { phoneRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const trimmed = phone.trim();
    if (!trimmed || !/^\d{10}$/.test(trimmed)) {
      setError('Enter a valid 10-digit Tanzanian phone number (e.g. 0712 345 678).');
      return;
    }

    setLoading(true);
    try {
      // Mock: simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      setStep('sent');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        .fp-input { width: 100%; height: 44px; padding: 0 14px; border-radius: 8px; border: 1.5px solid var(--line-2); background: var(--bg-2); color: var(--fg); font-family: var(--sans); font-size: 14px; transition: border-color 120ms, box-shadow 120ms; outline: none; box-sizing: border-box; }
        .fp-input:focus { border-color: var(--accent-line); box-shadow: 0 0 0 3px var(--accent-soft); }
        .fp-input.error { border-color: var(--bad); box-shadow: 0 0 0 3px rgba(251,113,133,0.12); }
        .fp-btn { width: 100%; height: 46px; border-radius: 8px; border: 0; cursor: pointer; background: var(--accent); color: #fff; font-family: var(--sans); font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px; transition: filter 120ms, opacity 120ms; }
        .fp-btn:hover:not(:disabled) { filter: brightness(1.1); }
        .fp-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>

      <DotsMenu fixed />
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--sans)', padding: '24px', WebkitFontSmoothing: 'antialiased' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <Link href="/">
              <img src="/ziada-final.jpeg" alt="Ziada" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 1.5px rgba(79,70,229,0.2)' }} />
            </Link>
          </div>

          {step === 'phone' ? (
            <>
              <div style={{ marginBottom: 28, textAlign: 'center' }}>
                <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>Forgot your password?</h1>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.5 }}>
                  Enter your phone number and we&apos;ll send you a reset code via SMS.
                </p>
              </div>

              {error && (
                <div style={{ padding: '11px 14px', borderRadius: 8, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', color: 'var(--bad)', fontSize: 13, lineHeight: 1.45, marginBottom: 20 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 7, color: 'var(--fg-2)' }}>
                    Phone number
                  </label>
                  <input
                    ref={phoneRef}
                    className={`fp-input${error ? ' error' : ''}`}
                    type="tel"
                    inputMode="numeric"
                    placeholder="0712345678"
                    value={phone}
                    maxLength={10}
                    onChange={e => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      if (error) setError('');
                    }}
                    autoComplete="tel"
                  />
                </div>

                <button type="submit" className="fp-btn" disabled={loading}>
                  {loading ? <><div className="spinner" /> Sending…</> : 'Send reset code'}
                </button>
              </form>
            </>
          ) : (
            /* ── Sent state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--good-soft)', border: '1px solid rgba(52,211,153,0.3)', display: 'grid', placeItems: 'center', margin: '0 auto 24px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--good)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6A16 16 0 0 0 13 13.69l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em' }}>Check your phone</h2>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6 }}>
                We&apos;ve sent a reset code to <strong style={{ color: 'var(--fg)' }}>{phone}</strong>.
              </p>
              <p style={{ margin: '0 0 28px', fontSize: 13.5, color: 'var(--fg-3)', lineHeight: 1.6 }}>
                Didn&apos;t receive it? Check that the number is correct, or contact us on{' '}
                <a href="https://wa.me/255692069230" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>WhatsApp</a>.
              </p>
              <button
                onClick={() => { setStep('phone'); setError(''); }}
                style={{ width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-2)', color: 'var(--fg)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--sans)' }}
              >
                Try a different number
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
            <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
              ← Back to sign in
            </Link>
          </div>

          <div style={{ marginTop: 24, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)' }}>
            © 2026 Ziada Technologies Ltd · Dar es Salaam
          </div>
        </div>
      </div>
    </>
  );
}
