'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { saveTokens, cacheUser, cacheSubscription, isAuthenticated } from '@/lib/auth';
import { DotsMenu } from '@/components/DotsMenu';

// ── Eye icon ───────────────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    // Eye open — show password
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.25" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    // Eye closed — hide password
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-6.4 0-10-8-10-8a18.1 18.1 0 0 1 4.73-5.66M9.9 4.24A9.12 9.12 0 0 1 12 4c6.4 0 10 8 10 8a18.1 18.1 0 0 1-2.34 3.37M3 3l18 18" />
    </svg>
  );
}

// ── Left panel ─────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="auth-left">
      <style>{`
        .auth-left {
          display: flex; flex-direction: column;
          align-items: flex-start; justify-content: space-between;
          min-height: 100vh; position: relative; overflow: hidden;
        }
        .auth-left-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
        }
        .auth-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.52) 0%,
            rgba(0,0,0,0.18) 40%,
            rgba(0,0,0,0.36) 80%,
            rgba(0,0,0,0.72) 100%
          );
        }
        .auth-left-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          align-items: flex-start; justify-content: space-between;
          width: 100%; height: 100%; min-height: 100vh;
          padding: 36px 44px; box-sizing: border-box;
        }
        @media (max-width: 768px) { .auth-left { display: none; } }
      `}</style>

      <img src="/ziadapos-login.jpeg" alt="" className="auth-left-img" />
      <div className="auth-left-overlay" />

      <div className="auth-left-content">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/ziada-app.PNG" alt="Ziada" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', boxShadow: '0 0 0 1.5px rgba(255,255,255,0.25), 0 3px 12px rgba(0,0,0,0.4)' }} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', fontFamily: 'var(--sans)', color: '#fff' }}>Ziada</span>
        </div>

        {/* Copy */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px 4px 8px', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 16, backdropFilter: 'blur(6px)', background: 'rgba(255,255,255,0.08)' }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#34d399', boxShadow: '0 0 0 3px rgba(52,211,153,0.25)', display: 'inline-block' }} />
            Trusted by 1,247+ stores in Tanzania
          </div>
          <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(24px, 2.6vw, 34px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>
            The operating system<br />for your shop.
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>
            POS, inventory, credits, analytics and AI —<br />one calm platform built for Tanzania.
          </p>
        </div>

        {/* Footer */}
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
          DAR ES SALAAM · ARUSHA · MWANZA · DODOMA
        </div>
      </div>
    </div>
  );
}

// ── Main login page ────────────────────────────────────────────────────────────
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneRef = useRef<HTMLInputElement>(null);

  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (isAuthenticated()) { router.replace('/dashboard'); return; }
    phoneRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const trimPhone = phone.trim();

    if (!trimPhone) { setFieldErrors({ phone: 'Phone number is required.' }); return; }
    if (!/^\d{10}$/.test(trimPhone)) { setFieldErrors({ phone: 'Enter a valid 10-digit number (e.g. 0712 345 678).' }); return; }
    if (!password) { setFieldErrors({ password: 'Password is required.' }); return; }

    setLoading(true);
    const result = await authApi.login({ phone: trimPhone, password });
    setLoading(false);

    if (!result.success) {
      if (result.errors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(result.errors)) {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setFieldErrors(flat);
        if (!flat.phone && !flat.password) setError(result.message);
      } else {
        setError(result.message);
      }
      return;
    }

    saveTokens(result.data.access, result.data.refresh);
    cacheUser(result.data.user);

    const sub = result.data.subscription;
    if (sub) cacheSubscription(sub);

    // If subscription isn't active, send them to the activation page first
    if (!sub || sub.status === 'pending_payment' || sub.is_active_now === false) {
      router.push('/activate');
      return;
    }

    const next = searchParams.get('next');
    router.push(next && next.startsWith('/') ? next : '/dashboard');
  }

  return (
    <>
      <style>{`
        .auth-page {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--bg);
          color: var(--fg);
          font-family: var(--sans);
          -webkit-font-smoothing: antialiased;
        }
        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
        }

        .auth-right {
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 48px 24px; min-height: 100dvh;
        }
        .auth-card {
          width: 100%; max-width: 400px;
        }

        .auth-input-wrap {
          position: relative; display: flex; align-items: center;
        }
        .auth-input {
          width: 100%; height: 44px; padding: 0 14px;
          border-radius: 8px; border: 1.5px solid var(--line-2);
          background: var(--bg-2); color: var(--fg);
          font-family: var(--sans); font-size: 14px;
          transition: border-color 120ms, box-shadow 120ms;
          outline: none; box-sizing: border-box;
        }
        .auth-input:focus {
          border-color: var(--accent-line);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .auth-input.error {
          border-color: var(--bad);
          box-shadow: 0 0 0 3px rgba(251,113,133,0.12);
        }
        .auth-input.has-toggle { padding-right: 46px; }
        .toggle-pw {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          width: 30px; height: 30px; border-radius: 6px;
          display: grid; place-items: center;
          background: transparent; border: 0; cursor: pointer;
          color: var(--fg-3); transition: color 120ms, background 120ms;
          flex-shrink: 0;
        }
        .toggle-pw:hover { color: var(--fg); background: var(--bg-3); }
        .toggle-pw:active { background: var(--bg-4); }

        .auth-btn {
          width: 100%; height: 46px;
          border-radius: 8px; border: 0; cursor: pointer;
          background: var(--accent); color: #fff;
          font-family: var(--sans); font-size: 14px; font-weight: 500;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: filter 120ms, opacity 120ms;
        }
        .auth-btn:hover:not(:disabled) { filter: brightness(1.1); }
        .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          font-size: 12px; color: var(--fg-4); margin: 20px 0;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--line);
        }

        .field-error {
          font-size: 11.5px; color: var(--bad); margin-top: 5px;
          display: flex; align-items: center; gap: 5px;
        }
        .global-error {
          padding: 11px 14px; border-radius: 8px;
          background: rgba(251,113,133,0.08); border: 1px solid rgba(251,113,133,0.25);
          color: var(--bad); font-size: 13px; line-height: 1.45;
          margin-bottom: 20px;
        }

        /* Loading spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
      `}</style>

      {/* Appearance + language menu */}
      <DotsMenu fixed />

      <div className="auth-page">
        <LeftPanel />

        <div className="auth-right">
          <div className="auth-card">

            {/* Mobile-only logo */}
            <div style={{ display: 'none', marginBottom: 32 }} className="auth-mobile-logo">
              <img src="/ziada-app.PNG" alt="Ziada" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', boxShadow: '0 0 0 1.5px rgba(33,14,230,0.18), 0 3px 10px rgba(33,14,230,0.18)' }} />
            </div>
            <style>{`.auth-mobile-logo { display: none !important; } @media (max-width: 768px) { .auth-mobile-logo { display: flex !important; } }`}</style>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>Welcome back</h1>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--fg-3)' }}>Sign in with your phone number and password.</p>
            </div>

            {/* Global error */}
            {error && <div className="global-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 7, color: 'var(--fg-2)' }}>
                  Phone number
                </label>
                <div className="phone-wrap">
                  <input
                    ref={phoneRef}
                    className={`auth-input${fieldErrors.phone ? ' error' : ''}`}
                    type="tel"
                    inputMode="numeric"
                    placeholder="0712345678"
                    value={phone}
                    maxLength={10}
                    onChange={e => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      if (fieldErrors.phone) setFieldErrors(p => ({ ...p, phone: '' }));
                    }}
                    autoComplete="tel"
                  />
                </div>
                {fieldErrors.phone && (
                  <div className="field-error">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--bad)"><circle cx="6" cy="6" r="5.5" /><rect x="5.25" y="3.5" width="1.5" height="3.5" rx=".5" fill="#fff" /><rect x="5.25" y="8" width="1.5" height="1.5" rx=".5" fill="#fff" /></svg>
                    {fieldErrors.phone}
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-2)' }}>Password</label>
                  <Link href="/auth/forgot-password" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>Forgot password?</Link>
                </div>
                <div className="auth-input-wrap">
                  <input
                    className={`auth-input has-toggle${fieldErrors.password ? ' error' : ''}`}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: '' }));
                    }}
                    autoComplete="current-password"
                  />
                  <button type="button" className="toggle-pw" onClick={() => setShowPw(v => !v)} tabIndex={-1} aria-label={showPw ? 'Hide password' : 'Show password'}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="field-error">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--bad)"><circle cx="6" cy="6" r="5.5" /><rect x="5.25" y="3.5" width="1.5" height="3.5" rx=".5" fill="#fff" /><rect x="5.25" y="8" width="1.5" height="1.5" rx=".5" fill="#fff" /></svg>
                    {fieldErrors.password}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? <><div className="spinner" /> Signing in…</> : <>Sign in →</>}
              </button>
            </form>

            <div className="auth-divider">or</div>

            {/* Sign up link */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 13.5, color: 'var(--fg-3)' }}>
                New to Ziada?{' '}
                <Link href="/auth/register" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>
                  Start your free 7-day trial
                </Link>
              </span>
            </div>

          </div>

          {/* Footer */}
          <div style={{ marginTop: 32, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)', textAlign: 'center' }}>
            © 2026 Ziada Technologies Ltd · Dar es Salaam
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
