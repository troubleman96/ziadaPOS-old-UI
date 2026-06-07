'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { saveTokens, cacheUser, cacheSubscription, isAuthenticated } from '@/lib/auth';

// ── Icons ──────────────────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
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
      <circle cx="3" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}

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

// ── App dashboard mockup (left panel visual) ───────────────────────────────────
function DashMockup() {
  const kpis = [
    { label: "TODAY'S SALES", v: 'TZS 1.24M', delta: '+18%' },
    { label: 'TICKETS',       v: '48',        delta: '+9'   },
    { label: 'PROFIT',        v: 'TZS 272K',  delta: '+12%' },
    { label: 'CREDIT OUT',    v: 'TZS 184K',  delta: '14'   },
  ];
  const txns = [
    { id: 'TXN-2042', amt: '142,000', via: 'M-Pesa', green: true  },
    { id: 'TXN-2041', amt: '48,500',  via: 'Cash',   green: false },
    { id: 'TXN-2040', amt: '217,000', via: 'M-Pesa', green: true  },
  ];
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line-2)', boxShadow: '0 28px 64px rgba(0,0,0,0.22)', background: 'var(--bg)' }}>
      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: 999, background: c, opacity: 0.75, display: 'block' }} />)}
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--fg-4)', marginLeft: 8 }}>app.ziadapos.com/dashboard</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: 9, color: 'var(--fg-4)' }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--good)', display: 'inline-block' }} /> live
        </span>
      </div>
      {/* Content */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--bg-2)' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 7.5, color: 'var(--fg-4)', letterSpacing: '0.06em', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{k.v}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 8.5, color: 'var(--good)', marginTop: 3 }}>{k.delta}</div>
            </div>
          ))}
        </div>
        <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr', gap: 8, padding: '6px 12px', fontFamily: 'monospace', fontSize: 8, color: 'var(--fg-4)', letterSpacing: '0.06em', background: 'var(--bg-3)', borderBottom: '1px solid var(--line)' }}>
            <span>TRANSACTION</span><span>AMOUNT</span><span>VIA</span>
          </div>
          {txns.map((t, i) => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr', gap: 8, padding: '8px 12px', fontSize: 11, alignItems: 'center', borderBottom: i < txns.length - 1 ? '1px solid var(--line)' : 0 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 9.5, color: 'var(--accent)' }}>{t.id}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 500 }}>TZS {t.amt}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 8.5, padding: '2px 6px', borderRadius: 999, background: t.green ? 'rgba(16,185,129,0.1)' : 'var(--bg-3)', color: t.green ? '#10b981' : 'var(--fg-3)' }}>{t.via}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Left panel ─────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="auth-left">
      <style>{`
        .auth-left {
          display: flex; flex-direction: column;
          align-items: center; justify-content: space-between;
          text-align: center;
          padding: 44px 48px; background: var(--bg-2);
          border-right: 1px solid var(--line);
          min-height: 100vh; position: relative; overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(to right, var(--line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--line) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, #000 20%, transparent 75%);
        }
        @media (max-width: 768px) { .auth-left { display: none; } }
      `}</style>

      {/* Logo */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="/ziadaposicon.jpeg" alt="Ziada" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', boxShadow: '0 0 0 1.5px rgba(33,14,230,0.18), 0 3px 10px rgba(33,14,230,0.18)' }} />
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', fontFamily: 'var(--display, var(--sans))' }}>Ziada</span>
      </div>

      {/* Mockup + copy */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
        <div style={{ marginBottom: 28 }}>
          <DashMockup />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px 4px 8px', border: '1px solid var(--line-2)', borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-soft)', display: 'inline-block' }} />
          Trusted by 1,247+ stores in Tanzania
        </div>
        <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(22px, 2.4vw, 30px)', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.15 }}>
          The operating system<br />for your shop.
        </h2>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)', lineHeight: 1.65 }}>
          POS, inventory, credits, analytics and AI —<br />one calm platform built for Tanzania.
        </p>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>
        DAR ES SALAAM · ARUSHA · MWANZA · DODOMA
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
  const [theme,    setTheme]    = useState<'light' | 'dark'>('light');
  const [dotsOpen, setDotsOpen] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Already authenticated — skip the login page
    if (isAuthenticated()) {
      router.replace('/dashboard');
      return;
    }
    try {
      const stored = localStorage.getItem('ziada-theme');
      const effective = stored === 'dark' ? 'dark' : 'light';
      setTheme(effective);
      document.documentElement.setAttribute('data-theme', effective);
    } catch {}
    phoneRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('ziada-theme', theme); } catch {}
  }, [theme]);

  useEffect(() => {
    if (!dotsOpen) return;
    function onOutside(e: MouseEvent) {
      if (dotsRef.current && !dotsRef.current.contains(e.target as Node)) setDotsOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [dotsOpen]);

  function applyTheme(t: 'light' | 'dark') { setTheme(t); }

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

      {/* Fixed three-dot theme menu — always accessible */}
      <div ref={dotsRef} style={{ position: 'fixed', top: 16, right: 20, zIndex: 200 }}>
        <button
          onClick={() => setDotsOpen(o => !o)}
          aria-label="Appearance"
          style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: 8, background: dotsOpen ? 'var(--bg-3)' : 'var(--bg-2)', color: 'var(--fg-2)', cursor: 'pointer', transition: 'background 120ms' }}
        >
          <DotsIcon />
        </button>
        {dotsOpen && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 210, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, boxShadow: '0 8px 32px -8px rgba(0,0,0,0.18)', padding: 14, zIndex: 300 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 10 }}>APPEARANCE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, background: 'var(--bg-3)', borderRadius: 9 }}>
              {(['light', 'dark'] as const).map(t => {
                const active = theme === t;
                return (
                  <button key={t} onClick={() => applyTheme(t)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '8px 12px', borderRadius: 6, border: 0, cursor: 'pointer', background: active ? 'var(--bg)' : 'transparent', color: active ? 'var(--fg)' : 'var(--fg-3)', fontSize: 13, fontWeight: active ? 500 : 400, boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none', transition: 'all 150ms' }}>
                    {t === 'light' ? <SunIcon /> : <MoonIcon />}
                    {t === 'light' ? 'Light' : 'Dark'}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="auth-page">
        <LeftPanel />

        <div className="auth-right">
          <div className="auth-card">

            {/* Mobile-only logo */}
            <div style={{ display: 'none', marginBottom: 32 }} className="auth-mobile-logo">
              <img src="/ziadaposicon.jpeg" alt="Ziada" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', boxShadow: '0 0 0 1.5px rgba(33,14,230,0.18), 0 3px 10px rgba(33,14,230,0.18)' }} />
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
