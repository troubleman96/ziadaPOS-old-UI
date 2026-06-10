'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, TANZANIA_REGIONS, BUSINESS_TYPES } from '@/lib/api';
import { saveTokens, cacheUser, cacheSubscription, isAuthenticated } from '@/lib/auth';

// ── Theme icons ────────────────────────────────────────────────────────────────
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ── Check icon ─────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6.2L4.5 8.7L10 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Region typeahead combobox ──────────────────────────────────────────────────
interface RegionComboboxProps {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}

function RegionCombobox({ value, onChange, error }: RegionComboboxProps) {
  const [query,     setQuery]     = useState(value);
  const [open,      setOpen]      = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  // Keep input in sync when parent resets the value externally
  useEffect(() => { setQuery(value); }, [value]);

  const filtered = TANZANIA_REGIONS.filter(r =>
    r.toLowerCase().includes(query.toLowerCase())
  );

  const select = useCallback((r: string) => {
    onChange(r);
    setQuery(r);
    setOpen(false);
    setHighlight(0);
  }, [onChange]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        // If nothing valid was committed, clear back to the last committed value
        setQuery(value);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [value]);

  function handleKey(e: React.KeyboardEvent) {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp')  { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter')    { e.preventDefault(); if (filtered[highlight]) select(filtered[highlight]); }
    else if (e.key === 'Escape')   { setOpen(false); setQuery(value); }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <style>{`
        .region-drop {
          position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 200;
          background: var(--bg-2); border: 1.5px solid var(--accent-line);
          border-radius: 8px; overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.28);
          max-height: 220px; overflow-y: auto;
        }
        .region-opt {
          padding: 9px 14px; font-size: 13.5px; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          transition: background 80ms;
        }
        .region-opt:hover, .region-opt.hi { background: var(--bg-3); }
        .region-opt.selected { color: var(--accent); }
        .region-empty { padding: 10px 14px; font-size: 13px; color: var(--fg-4); }
      `}</style>

      {/* Input */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          className={`auth-input${error ? ' error' : ''}`}
          style={{ paddingRight: 36 }}
          type="text"
          placeholder="Type to search region…"
          value={query}
          autoComplete="off"
          onFocus={() => { setOpen(true); setHighlight(0); }}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
            // Clear committed value while user is still typing
            if (e.target.value !== value) onChange('');
          }}
          onKeyDown={handleKey}
        />
        {/* Chevron */}
        <svg
          width="12" height="12" viewBox="0 0 12 12"
          style={{
            position: 'absolute', right: 14, pointerEvents: 'none',
            color: 'var(--fg-3)', transition: 'transform 150ms',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="region-drop">
          {filtered.length === 0 ? (
            <div className="region-empty">No regions match "{query}"</div>
          ) : filtered.map((r, i) => (
            <div
              key={r}
              className={`region-opt${i === highlight ? ' hi' : ''}${r === value ? ' selected' : ''}`}
              onMouseDown={e => { e.preventDefault(); select(r); }}
              onMouseEnter={() => setHighlight(i)}
            >
              {r}
              {r === value && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i < step ? 20 : 7,
            height: 7,
            borderRadius: 999,
            background: i < step ? 'var(--accent)' : i === step ? 'var(--fg-2)' : 'var(--line-2)',
            transition: 'all 250ms ease',
          }}
        />
      ))}
    </div>
  );
}

// ── Left panel ─────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="auth-left-reg">
      <style>{`
        .auth-left-reg {
          display: flex; flex-direction: column;
          align-items: flex-start; justify-content: space-between;
          min-height: 100vh; position: relative; overflow: hidden;
        }
        .auth-left-reg-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
        }
        .auth-left-reg-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.52) 0%,
            rgba(0,0,0,0.18) 40%,
            rgba(0,0,0,0.36) 80%,
            rgba(0,0,0,0.72) 100%
          );
        }
        .auth-left-reg-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          align-items: flex-start; justify-content: space-between;
          width: 100%; height: 100%; min-height: 100vh;
          padding: 36px 44px; box-sizing: border-box;
        }
        @media (max-width: 900px) { .auth-left-reg { display: none; } }
      `}</style>

      <img src="/reeeg.jpeg" alt="" className="auth-left-reg-img" />
      <div className="auth-left-reg-overlay" />

      <div className="auth-left-reg-content">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/ziada-app.PNG" alt="Ziada" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', boxShadow: '0 0 0 1.5px rgba(255,255,255,0.25), 0 3px 12px rgba(0,0,0,0.4)' }} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', fontFamily: 'var(--sans)', color: '#fff' }}>Ziada</span>
        </div>

        {/* Copy */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', fontFamily: 'var(--mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 16, backdropFilter: 'blur(6px)' }}>
            7 days free · TZS 10,000 activation
          </div>
          <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(24px, 2.6vw, 34px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>
            Everything your<br />shop needs.
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>
            Account live in under 2 minutes.<br />All 5 modules on every plan.
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

// ── Form field components ──────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, error, hint, required, children }: FieldProps) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 7, color: 'var(--fg-2)' }}>
        {label}
        {!required && <span style={{ fontWeight: 400, color: 'var(--fg-4)', marginLeft: 5 }}>(optional)</span>}
      </label>
      {children}
      {error && (
        <div className="field-error">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--bad)"><circle cx="6" cy="6" r="5.5" /><rect x="5.25" y="3.5" width="1.5" height="3.5" rx=".5" fill="#fff" /><rect x="5.25" y="8" width="1.5" height="1.5" rx=".5" fill="#fff" /></svg>
          {error}
        </div>
      )}
      {hint && !error && (
        <div style={{ fontSize: 11.5, color: 'var(--fg-4)', marginTop: 5 }}>{hint}</div>
      )}
    </div>
  );
}

// ── Password strength ──────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['var(--bad)', 'var(--warn)', 'var(--good)'];
  const labels = ['Weak', 'Fair', 'Strong'];
  return (
    <div style={{ marginTop: 7 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i < score ? colors[score - 1] : 'var(--line-2)', transition: 'background 200ms' }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: colors[score - 1] ?? 'var(--fg-4)', fontFamily: 'var(--mono)' }}>
        {score > 0 ? labels[score - 1] : ''}
      </div>
    </div>
  );
}

// ── Main registration page ─────────────────────────────────────────────────────
const TOTAL_STEPS = 2;

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(0); // 0 = personal, 1 = business
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [theme,    setTheme]    = useState<'light' | 'dark'>('light');
  const [dotsOpen, setDotsOpen] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  // Form state
  const [fullName,    setFullName]    = useState('');
  const [phone,       setPhone]       = useState('');
  const [email,       setEmail]       = useState('');
  const [shopName,    setShopName]    = useState('');
  const [bizType,     setBizType]     = useState('');
  const [region,      setRegion]      = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');

  useEffect(() => {
    // Already authenticated — skip registration
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

  function clearErr(field: string) {
    if (fieldErrors[field]) setFieldErrors(p => ({ ...p, [field]: '' }));
  }

  // ── Step 0 validation (personal details) ──────────────────────────────────
  function validateStep0(): boolean {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.full_name = 'Full name is required.';
    else if (fullName.trim().split(/\s+/).length < 2) errs.full_name = 'Please enter your first and last name.';

    const p = phone.trim();
    if (!p) errs.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(p)) errs.phone = 'Enter a valid 10-digit number (e.g. 0712 345 678).';

    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters.';

    if (!confirm) errs.confirm_password = 'Please confirm your password.';
    else if (password !== confirm) errs.confirm_password = 'Passwords do not match.';

    if (Object.keys(errs).length) { setFieldErrors(errs); return false; }
    return true;
  }

  // ── Step 1 validation (business details) ──────────────────────────────────
  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!shopName.trim()) errs.main_shop_name = 'Shop name is required.';
    if (!bizType) errs.business_type = 'Please select a business type.';
    if (!region) errs.region = 'Please select your region.';
    if (Object.keys(errs).length) { setFieldErrors(errs); return false; }
    return true;
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    if (step === 0 && validateStep0()) setStep(1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    if (!validateStep1()) return;

    setLoading(true);
    const result = await authApi.register({
      full_name:        fullName.trim(),
      phone:            phone.trim(),
      email:            email.trim() || undefined,
      main_shop_name:   shopName.trim(),
      business_type:    bizType,
      region:           region,
      password,
      confirm_password: confirm,
    });
    setLoading(false);

    if (!result.success) {
      if (result.errors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(result.errors)) {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setFieldErrors(flat);
        // If error is on step-0 field, go back
        const step0Fields = ['full_name', 'phone', 'password', 'confirm_password'];
        if (step0Fields.some(f => flat[f])) setStep(0);
        if (!Object.keys(flat).length) setGlobalError(result.message);
      } else {
        setGlobalError(result.message);
      }
      return;
    }

    saveTokens(result.data.access, result.data.refresh);
    cacheUser(result.data.user);
    cacheSubscription(result.data.subscription);
    router.push('/activate');
  }

  return (
    <>
      <style>{`
        .reg-page {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh; min-height: 100dvh;
          background: var(--bg); color: var(--fg);
          font-family: var(--sans);
          -webkit-font-smoothing: antialiased;
        }
        @media (max-width: 900px) { .reg-page { grid-template-columns: 1fr; } }

        .reg-right {
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 48px 24px; min-height: 100dvh;
        }
        .reg-card { width: 100%; max-width: 440px; }

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
        .auth-input.has-toggle { padding-right: 44px; }
        .auth-select {
          width: 100%; height: 44px; padding: 0 36px 0 14px;
          border-radius: 8px; border: 1.5px solid var(--line-2);
          background: var(--bg-2); color: var(--fg);
          font-family: var(--sans); font-size: 14px;
          transition: border-color 120ms, box-shadow 120ms;
          outline: none; cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }
        .auth-select:focus {
          border-color: var(--accent-line);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .auth-select.error {
          border-color: var(--bad);
          box-shadow: 0 0 0 3px rgba(251,113,133,0.12);
        }
        .toggle-pw {
          position: absolute; right: 0; top: 0; bottom: 0;
          width: 44px; display: grid; place-items: center;
          background: transparent; border: 0; cursor: pointer;
          color: var(--fg-3); transition: color 100ms;
        }
        .toggle-pw:hover { color: var(--fg-2); }

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
        .auth-btn-ghost {
          width: 100%; height: 46px;
          border-radius: 8px; border: 1.5px solid var(--line-2); cursor: pointer;
          background: transparent; color: var(--fg-2);
          font-family: var(--sans); font-size: 14px; font-weight: 500;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 120ms, border-color 120ms, color 120ms;
        }
        .auth-btn-ghost:hover { background: var(--bg-3); color: var(--fg); border-color: var(--line-3); }

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

        .form-grid-2 {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        @media (max-width: 480px) { .form-grid-2 { grid-template-columns: 1fr; } }



        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }

        /* Slide animation between steps */
        @keyframes slideIn { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideOut { from { opacity: 0; transform: translateX(-18px); } to { opacity: 1; transform: translateX(0); } }
        .step-enter { animation: slideIn 200ms ease forwards; }
        .step-back-enter { animation: slideOut 200ms ease forwards; }
      `}</style>

      {/* Fixed three-dot theme menu */}
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

      <div className="reg-page">
        <LeftPanel />

        <div className="reg-right">
          <div className="reg-card">

            {/* Mobile logo */}
            <style>{`.reg-mobile-logo { display: none !important; } @media (max-width: 900px) { .reg-mobile-logo { display: flex !important; } }`}</style>
            <div className="reg-mobile-logo" style={{ display: 'none', marginBottom: 28 }}>
              <img src="/ziada-app.PNG" alt="Ziada" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', boxShadow: '0 0 0 1.5px rgba(33,14,230,0.18), 0 3px 10px rgba(33,14,230,0.18)' }} />
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <StepDots step={step + 1} total={TOTAL_STEPS} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)' }}>
                Step {step + 1} of {TOTAL_STEPS}
              </span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>
                {step === 0 ? 'Create your account' : 'Set up your shop'}
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)' }}>
                {step === 0
                  ? 'Your login credentials. Start your free 7-day trial.'
                  : 'Tell us about your business so we can configure Ziada for you.'}
              </p>
            </div>

            {/* Global error */}
            {globalError && <div className="global-error">{globalError}</div>}

            {/* ── Step 0: Personal details ───────────────────────────────────── */}
            {step === 0 && (
              <form className="step-enter" onSubmit={handleNext} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  <Field label="Full name" error={fieldErrors.full_name} hint="First and last name, e.g. Hamisi Mwakapaga" required>
                    <input
                      className={`auth-input${fieldErrors.full_name ? ' error' : ''}`}
                      type="text"
                      placeholder="Hamisi Mwakapaga"
                      value={fullName}
                      onChange={e => { setFullName(e.target.value); clearErr('full_name'); }}
                      autoComplete="name"
                      autoFocus
                    />
                  </Field>

                  <Field label="Phone number" error={fieldErrors.phone} hint="10 digits, e.g. 0712345678" required>
                    <div style={{ position: 'relative' }}>
                      <input
                        className={`auth-input${fieldErrors.phone ? ' error' : ''}`}
                        type="tel"
                        inputMode="numeric"
                        placeholder="0712345678"
                        value={phone}
                        maxLength={10}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); clearErr('phone'); }}
                        autoComplete="tel"
                      />
                    </div>
                  </Field>

                  <Field label="Email" error={fieldErrors.email} hint="Used for receipts and account recovery">
                    <input
                      className={`auth-input${fieldErrors.email ? ' error' : ''}`}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); clearErr('email'); }}
                      autoComplete="email"
                    />
                  </Field>

                  <div className="form-grid-2">
                    <Field label="Password" error={fieldErrors.password} required>
                      <div style={{ position: 'relative' }}>
                        <input
                          className={`auth-input has-toggle${fieldErrors.password ? ' error' : ''}`}
                          type={showPw ? 'text' : 'password'}
                          placeholder="Min 8 characters"
                          value={password}
                          onChange={e => { setPassword(e.target.value); clearErr('password'); }}
                          autoComplete="new-password"
                        />
                        <button type="button" className="toggle-pw" onClick={() => setShowPw(v => !v)} tabIndex={-1} aria-label={showPw ? 'Hide' : 'Show'}>
                          <EyeIcon open={showPw} />
                        </button>
                      </div>
                      {password && <PasswordStrength password={password} />}
                    </Field>

                    <Field label="Confirm password" error={fieldErrors.confirm_password} required>
                      <div style={{ position: 'relative' }}>
                        <input
                          className={`auth-input has-toggle${fieldErrors.confirm_password ? ' error' : ''}`}
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Repeat password"
                          value={confirm}
                          onChange={e => { setConfirm(e.target.value); clearErr('confirm_password'); }}
                          autoComplete="new-password"
                        />
                        <button type="button" className="toggle-pw" onClick={() => setShowConfirm(v => !v)} tabIndex={-1} aria-label={showConfirm ? 'Hide' : 'Show'}>
                          <EyeIcon open={showConfirm} />
                        </button>
                      </div>
                      {confirm && password === confirm && (
                        <div style={{ fontSize: 11.5, color: 'var(--good)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckIcon /> Passwords match
                        </div>
                      )}
                    </Field>
                  </div>

                  <button type="submit" className="auth-btn" style={{ marginTop: 8 }}>
                    Continue →
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 1: Business details ───────────────────────────────────── */}
            {step === 1 && (
              <form className="step-enter" onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  <Field label="Shop / business name" error={fieldErrors.main_shop_name} hint="This becomes your organisation and main store name" required>
                    <input
                      className={`auth-input${fieldErrors.main_shop_name ? ' error' : ''}`}
                      type="text"
                      placeholder="Duka Kuu Kariakoo"
                      value={shopName}
                      onChange={e => { setShopName(e.target.value); clearErr('main_shop_name'); }}
                      autoFocus
                    />
                  </Field>

                  <div className="form-grid-2">
                    <Field label="Business type" error={fieldErrors.business_type} required>
                      <select
                        className={`auth-select${fieldErrors.business_type ? ' error' : ''}`}
                        value={bizType}
                        onChange={e => { setBizType(e.target.value); clearErr('business_type'); }}
                      >
                        <option value="" disabled>Select type…</option>
                        {BUSINESS_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Region" error={fieldErrors.region} required>
                      <RegionCombobox
                        value={region}
                        onChange={v => { setRegion(v); if (v) clearErr('region'); }}
                        error={!!fieldErrors.region}
                      />
                    </Field>
                  </div>

                  {/* Trial info callout */}
                  <div style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--line-2)', background: 'var(--bg-2)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>⏱</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>7-day free trial</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5 }}>
                        Your account is created instantly. Activate your trial by paying{' '}
                        <strong style={{ color: 'var(--fg-2)' }}>TZS 10,000</strong> via M-Pesa, Tigo Pesa or bank transfer after sign-up.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" className="auth-btn-ghost" onClick={() => { setStep(0); setGlobalError(''); }} style={{ flex: '0 0 auto', width: 'auto', padding: '0 20px' }}>
                      ← Back
                    </button>
                    <button type="submit" className="auth-btn" disabled={loading}>
                      {loading ? <><div className="spinner" /> Creating account…</> : <>Create account →</>}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Terms */}
            <p style={{ fontSize: 11.5, color: 'var(--fg-4)', textAlign: 'center', marginTop: 20, lineHeight: 1.55 }}>
              By creating an account you agree to Ziada's{' '}
              <a href="#" style={{ color: 'var(--fg-3)', textDecoration: 'underline', textDecorationColor: 'var(--line-2)' }}>Terms of Service</a>{' '}
              and{' '}
              <a href="#" style={{ color: 'var(--fg-3)', textDecoration: 'underline', textDecorationColor: 'var(--line-2)' }}>Privacy Policy</a>.
            </p>

            {/* Sign in link */}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 13.5, color: 'var(--fg-3)' }}>
                Already have an account?{' '}
                <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </span>
            </div>

          </div>

          <div style={{ marginTop: 28, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)', textAlign: 'center' }}>
            © 2026 Ziada Technologies Ltd · Dar es Salaam
          </div>
        </div>
      </div>
    </>
  );
}
