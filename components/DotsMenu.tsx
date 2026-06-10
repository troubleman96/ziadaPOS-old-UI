'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLang } from '@/components/LangContext';
import { t, LANG_LABELS, type Lang } from '@/lib/lang';

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3"  cy="8" r="1.5" />
      <circle cx="8"  cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}

interface DotsMenuProps {
  /** When true, renders position:fixed top-right (auth pages).
   *  When false (default), renders position:relative inline (nav bar). */
  fixed?: boolean;
}

export function DotsMenu({ fixed = false }: DotsMenuProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [open,  setOpen]  = useState(false);
  const ref               = useRef<HTMLDivElement>(null);
  const { lang, setLang } = useLang();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ziada-theme');
      const th = stored === 'dark' ? 'dark' : 'light';
      setTheme(th);
      document.documentElement.setAttribute('data-theme', th);
    } catch {}
  }, []);

  useEffect(() => {
    if (!open) return;
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, [open]);

  function applyTheme(th: 'light' | 'dark') {
    setTheme(th);
    document.documentElement.setAttribute('data-theme', th);
    try { localStorage.setItem('ziada-theme', th); } catch {}
  }

  return (
    <div
      ref={ref}
      style={fixed
        ? { position: 'fixed', top: 16, right: 20, zIndex: 200 }
        : { position: 'relative' }
      }
    >
      <style>{`
        @keyframes dots-menu-in {
          from { opacity: 0; transform: scale(0.95) translateY(-6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .dots-menu-panel {
          animation: dots-menu-in 160ms cubic-bezier(0.16,1,0.3,1) forwards;
          transform-origin: top right;
        }
        .dots-seg-btn { transition: background 150ms, color 150ms, box-shadow 150ms; }
        .dots-seg-btn:hover { opacity: 0.88; }
      `}</style>

      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Appearance and language"
        aria-expanded={open}
        style={{
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--line)', borderRadius: 8,
          background: open ? 'var(--bg-3)' : 'var(--bg-2)',
          color: 'var(--fg-2)', cursor: 'pointer',
          transition: 'background 120ms',
          flexShrink: 0,
        }}
      >
        <DotsIcon />
      </button>

      {/* Panel */}
      {open && (
        <div className="dots-menu-panel" style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 240,
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          boxShadow: '0 16px 48px -8px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.06)',
          padding: '14px 14px 13px',
          zIndex: 300,
        }}>

          {/* ── Appearance ── */}
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--fg-4)',
            letterSpacing: '0.12em', marginBottom: 9,
          }}>
            {t(lang, 'dots_appearance')}
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 3, padding: 3,
            background: 'var(--bg-3)', borderRadius: 10,
          }}>
            {(['light', 'dark'] as const).map(th => {
              const active = theme === th;
              return (
                <button
                  key={th}
                  className="dots-seg-btn"
                  onClick={() => applyTheme(th)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 10px', borderRadius: 8, border: 0, cursor: 'pointer',
                    background: active ? 'var(--bg)' : 'transparent',
                    color: active ? 'var(--fg)' : 'var(--fg-3)',
                    fontSize: 13, fontWeight: active ? 500 : 400,
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                  }}
                >
                  {th === 'light' ? <SunIcon /> : <MoonIcon />}
                  {t(lang, th === 'light' ? 'dots_light' : 'dots_dark')}
                </button>
              );
            })}
          </div>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />

          {/* ── Language ── */}
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--fg-4)',
            letterSpacing: '0.12em', marginBottom: 9,
          }}>
            {t(lang, 'dots_language')}
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 3, padding: 3,
            background: 'var(--bg-3)', borderRadius: 10,
          }}>
            {(['sw', 'en'] as Lang[]).map(l => {
              const active = lang === l;
              return (
                <button
                  key={l}
                  className="dots-seg-btn"
                  onClick={() => setLang(l)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: 2,
                    padding: '9px 4px', borderRadius: 8, border: 0, cursor: 'pointer',
                    background: active ? 'var(--accent)' : 'transparent',
                    color: active ? '#fff' : 'var(--fg-3)',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.14)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
                    {l.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, opacity: active ? 0.85 : 1 }}>
                    {LANG_LABELS[l]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
