'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ── Sparkline ──────────────────────────────────────────────────────────────────
function Sparkline({ data, color = 'currentColor', height = 28, fill = false, strokeWidth = 1.5 }: {
  data: number[]; color?: string; height?: number; fill?: boolean; strokeWidth?: number;
}) {
  const w = 100, h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / range) * (h - 4) - 2]);
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block', color }}>
      {fill && <path d={d + ` L ${w},${h} L 0,${h} Z`} fill={color} opacity="0.12" />}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ── Window chrome ──────────────────────────────────────────────────────────────
function WindowChrome({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line-2)', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.4)', background: 'var(--bg)', color: 'var(--fg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['var(--bad)', 'var(--warn)', 'var(--good)'].map((c, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: c, opacity: 0.6, display: 'block' }} />
          ))}
        </div>
        <span style={{ fontFamily: 'var(--mono, monospace)', fontSize: 11, color: 'var(--fg-4)', marginLeft: 6 }}>{url}</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono, monospace)', fontSize: 10.5, color: 'var(--fg-4)' }}>v2.4.1</span>
      </div>
      {children}
    </div>
  );
}

// ── Dashboard mockup ───────────────────────────────────────────────────────────
function DashboardMockup({ accent }: { accent: string }) {
  const stats = [
    { label: "TODAY'S SALES", v: 'TZS 1,240,000', delta: '+18%', spark: [3, 4, 3, 5, 4, 6, 5, 7, 8, 7, 9, 10, 9, 11, 12] },
    { label: 'PROFIT',        v: 'TZS 272,000',   delta: '+12%', spark: [2, 3, 2, 4, 3, 4, 5, 4, 6, 5, 7, 6, 8, 7, 9] },
    { label: 'STOCK VALUE',   v: 'TZS 4.82M',     delta: '+6%',  spark: [5, 5, 6, 5, 6, 7, 6, 7, 7, 8, 7, 8, 9, 8, 10] },
    { label: 'LOW STOCK',     v: '3', delta: 'alerts', deltaColor: 'var(--warn)', spark: null },
  ];
  const bars = [42, 58, 70, 52, 88, 100, 74];
  return (
    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, background: 'var(--bg)', color: 'var(--fg)' }}>
      <div style={{ borderRight: '1px solid var(--line)', paddingRight: 14, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600 }}>Z</span>
          <span style={{ fontWeight: 500, fontSize: 13 }}>Ziada</span>
        </div>
        {[['Dashboard', true], ['Point of Sale', false], ['Transactions', false], ['Inventory', false], ['Credits', false]].map(([l, a]) => (
          <div key={l as string} style={{ padding: '5px 8px', borderRadius: 5, fontSize: 11.5, color: a ? 'var(--fg)' : 'var(--fg-3)', background: a ? `${accent}22` : 'transparent', borderLeft: `2px solid ${a ? accent : 'transparent'}` }}>{l}</div>
        ))}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Dashboard</span>
          <span style={{ fontFamily: 'monospace', fontSize: 9.5, color: 'var(--fg-4)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--good)', display: 'inline-block' }} /> live
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, marginBottom: 10 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ border: '1px solid var(--line)', borderRadius: 7, padding: '8px 10px', background: 'var(--bg-2)' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 8.5, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>{s.label}</div>
              <div style={{ fontSize: 12.5, fontWeight: 500, marginTop: 3 }}>{s.v}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: s.deltaColor || 'var(--good)' }}>{s.delta}</span>
                {s.spark && <div style={{ width: 44, height: 14 }}><Sparkline data={s.spark} color={accent} strokeWidth={1.2} height={14} /></div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8 }}>
          <div style={{ border: '1px solid var(--line)', borderRadius: 7, padding: '9px 11px', background: 'var(--bg-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10.5, fontWeight: 500 }}>Sales this week</span>
              <span style={{ fontFamily: 'monospace', fontSize: 8.5, color: 'var(--fg-4)' }}>7D</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, alignItems: 'end', height: 52 }}>
              {bars.map((h, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: '100%', height: `${h}%`, background: i === 5 ? accent : `${accent}55`, borderRadius: 2 }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 7.5, color: 'var(--fg-4)' }}>{'MTWTFSS'[i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ border: '1px solid var(--line)', borderRadius: 7, padding: '9px 11px', background: 'var(--bg-2)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 500, marginBottom: 8 }}>Top products</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[['Unga wa Sembe 10kg', '1.42M'], ['Mafuta Cooking 5L', '1.15M'], ['Sabuni OMO 1kg', '260K'], ['Sukari 2kg', '182K']].map(([n, v], i) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--fg-4)', width: 10 }}>{i + 1}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n}</span>
                  </span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--fg-2)', flexShrink: 0 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature mockups ────────────────────────────────────────────────────────────
function POSMockup({ accent }: { accent: string }) {
  const items: [string, number, number][] = [['Mafuta ya Cooking 5L', 5, 170000], ['Sabuni ya OMO 1kg', 1, 6200], ['Chai Bora 500g', 1, 4800], ['Mchele Pishori 5kg', 1, 22000]];
  const sub = items.reduce((s, [, q, p]) => s + q * p, 0);
  const fmt = (n: number) => 'TZS ' + n.toLocaleString('en-US');
  return (
    <div style={{ padding: 14, background: 'var(--bg)', color: 'var(--fg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 500 }}>Current sale</span>
        <span style={{ fontFamily: 'monospace', fontSize: 9.5, color: 'var(--fg-3)' }}>SALE #TXN-2042</span>
      </div>
      {items.map(([n, q, p]) => (
        <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, fontSize: 11, padding: '5px 0', borderBottom: '1px solid var(--line)' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n}</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--fg-3)' }}>×{q}</span>
          <span style={{ fontFamily: 'monospace' }}>{fmt(q * p)}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 2px', marginTop: 6, borderTop: '1px solid var(--line-2)' }}>
        <span style={{ fontSize: 12, fontWeight: 500 }}>Net total</span>
        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: accent }}>{fmt(Math.round(sub * 1.18))}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, margin: '8px 0' }}>
        {['Cash', 'M-Pesa', 'Bank', 'Credit'].map((m, i) => (
          <div key={m} style={{ padding: '6px 4px', borderRadius: 5, fontSize: 10, textAlign: 'center', border: `1px solid ${i === 0 ? accent : 'var(--line)'}`, background: i === 0 ? `${accent}22` : 'transparent', color: i === 0 ? 'var(--fg)' : 'var(--fg-2)' }}>{m}</div>
        ))}
      </div>
      <div style={{ padding: '8px', borderRadius: 5, background: accent, color: '#fff', textAlign: 'center', fontSize: 11.5, fontWeight: 500 }}>Complete sale →</div>
    </div>
  );
}

function InventoryMini({ accent: _accent }: { accent: string }) {
  const rows: [string, number, string][] = [['Unga wa Sembe 10kg', 42, 'ok'], ['Sabuni ya OMO 1kg', 3, 'critical'], ['Mafuta Cooking 5L', 24, 'ok'], ['Sukari 2kg', 8, 'low']];
  const sc = (s: string) => s === 'critical' ? 'var(--bad)' : s === 'low' ? 'var(--warn)' : 'var(--good)';
  const sb = (s: string) => s === 'critical' ? 'var(--bad-soft)' : s === 'low' ? 'var(--warn-soft)' : 'var(--good-soft)';
  return (
    <div style={{ padding: '12px 14px', background: 'var(--bg)', color: 'var(--fg)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px 60px', gap: 8, fontSize: 9, fontFamily: 'monospace', color: 'var(--fg-4)', letterSpacing: '0.06em', paddingBottom: 4, borderBottom: '1px solid var(--line)' }}>
        <span>PRODUCT</span><span>STOCK</span><span>STATUS</span>
      </div>
      {rows.map(([name, qty, s]) => (
        <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 60px', gap: 8, fontSize: 11, padding: '5px 0', alignItems: 'center' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--fg-2)' }}>{qty}</span>
          <span style={{ fontFamily: 'monospace', fontSize: 9, padding: '2px 6px', borderRadius: 999, color: sc(s), background: sb(s), width: 'fit-content' }}>{s.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsMini({ accent }: { accent: string }) {
  return (
    <div style={{ padding: '14px', background: 'var(--bg)', color: 'var(--fg)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>PROFIT · 30D</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--good)' }}>+6.2%</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>TZS 4.82M</div>
      <div style={{ height: 56, marginTop: 8 }}>
        <Sparkline data={[3, 4, 3, 5, 4, 5, 6, 5, 7, 6, 7, 8, 7, 9, 8, 10, 9, 11, 10, 12]} color={accent} fill strokeWidth={1.5} height={56} />
      </div>
    </div>
  );
}

function CreditsMini({ accent: _accent }: { accent: string }) {
  return (
    <div style={{ padding: '12px 14px', background: 'var(--bg)', color: 'var(--fg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>OUTSTANDING</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--fg-3)' }}>14 customers</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>TZS 184,500</div>
      {[['Fatuma A.', 'TZS 38,500', 'Today'], ['Juma K.', 'TZS 84,200', '2d'], ['Asha M.', 'TZS 54,200', '5d']].map(([n, a, d]) => (
        <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, fontSize: 11, padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
          <span>{n}</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--fg-2)' }}>{a}</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--fg-4)' }}>{d}</span>
        </div>
      ))}
    </div>
  );
}

function AIChatMini({ accent }: { accent: string }) {
  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5, background: 'var(--bg)', color: 'var(--fg)' }}>
      <div style={{ alignSelf: 'flex-end', maxWidth: '82%', padding: '6px 10px', border: '1px solid var(--line-2)', borderRadius: 8 }}>Niambie mauzo ya leo</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <span style={{ width: 18, height: 18, borderRadius: 5, background: `${accent}22`, color: accent, display: 'grid', placeItems: 'center', fontSize: 10, flexShrink: 0 }}>✦</span>
        <div style={{ color: 'var(--fg-2)', lineHeight: 1.5 }}>
          Mauzo ya leo ni <strong style={{ color: 'var(--fg)' }}>TZS 1,240,000</strong> — juu kwa 18%.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['Tuma report', 'Linganisha wiki'].map((c, i) => (
          <span key={c} style={{ fontFamily: 'monospace', fontSize: 10, padding: '3px 8px', borderRadius: 999, border: '1px solid var(--line-2)', color: i === 0 ? accent : 'var(--fg-3)', background: i === 0 ? `${accent}22` : 'transparent' }}>{c}</span>
        ))}
      </div>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero({ accent }: { accent: string }) {
  return (
    <section style={{ position: 'relative', paddingTop: 80, paddingBottom: 88, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 65% at 50% 30%, #000 30%, transparent 80%)' }} />
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 8px', border: '1px solid var(--line)', borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.04em', color: 'var(--fg-2)', background: 'var(--bg-2)', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-soft)', display: 'inline-block' }} />
            Ziada AI · now in every store
            <span style={{ color: 'var(--fg-4)' }}>→</span>
          </span>
          <h1 style={{ margin: 0, fontSize: 'clamp(38px, 5.6vw, 72px)', lineHeight: 1.03, fontWeight: 500, letterSpacing: '-0.03em', fontFamily: 'var(--display, var(--sans))' }}>
            The operating system<br />for your shop.
          </h1>
          <p style={{ margin: '24px auto 0', fontSize: 17, lineHeight: 1.6, color: 'var(--fg-2)', maxWidth: 540 }}>
            POS, inventory, credit, analytics and an AI that actually knows your store — running on one calm, fast platform. Built in Tanzania, made for any counter.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 22px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              Start free 7-day trial <span style={{ opacity: 0.8 }}>→</span>
            </Link>
            <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 20px', borderRadius: 7, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 14, textDecoration: 'none', background: 'transparent' }}>
              Sign in
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['no card required', 'works offline', 'EN + Swahili', 'M-Pesa, Tigo, Airtel, Bank'].map((t) => (
              <span key={t} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L4.8 8.5L9.5 3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: '56px auto 0' }}>
          <WindowChrome url="app.ziadapos.com/dashboard">
            <DashboardMockup accent={accent} />
          </WindowChrome>
        </div>
      </div>
    </section>
  );
}

// ── Stats strip ────────────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { label: 'STORES RUNNING ZIADA', v: '1,247' },
    { label: 'TXNS LAST 24H',        v: '89,412' },
    { label: 'TZS PROCESSED · 30D',  v: '4.21B' },
    { label: 'AI QUERIES · 24H',     v: '12,094' },
    { label: 'UPTIME · 90D',         v: '99.98%' },
  ];
  return (
    <section style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div className="stats-grid" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', overflowX: 'auto' }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ padding: '20px', borderLeft: i === 0 ? 0 : '1px solid var(--line)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Testimonials ───────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      quote: '"Ziada ilibadilisha jinsi tunavyofanya biashara. Sasa naona data zangu wakati wowote, hata bila internet."',
      name: 'Amina J.',
      role: 'Supermarket owner',
      location: 'Mwanza',
      initial: 'A',
    },
    {
      quote: '"The credit tracking alone saved me from losing TZS 2M in unpaid tabs. Every duka owner needs this."',
      name: 'Hassan B.',
      role: 'Pharmacy',
      location: 'Dar es Salaam',
      initial: 'H',
    },
    {
      quote: '"Managing 3 stores from one screen — that used to be a dream. Now it\'s just Tuesday."',
      name: 'Grace N.',
      role: 'Retail chain',
      location: 'Arusha',
      initial: 'G',
    },
  ];

  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em' }}>§ · MERCHANTS</div>
            <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>What store owners say.</h2>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)' }}>1,247+ stores in Tanzania</span>
        </div>
        <div className="mkt-testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '24px', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: 'var(--fg)', fontStyle: 'italic' }}>{t.quote}</p>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, display: 'flex', gap: 12, alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                  {t.initial}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{t.role} · {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Feature grid ───────────────────────────────────────────────────────────────
const FEATURES = [
  { n: '01', id: 'pos',       title: 'Point of Sale',  tagline: 'Ring up a sale in three taps.',             desc: 'Search, scan, or pick from the grid. Take cash, M-Pesa, Tigo Pesa, Airtel or bank — split across any of them on one ticket.',  bullets: ['Barcode + visual search', 'Split tender', 'Offline-first, syncs when back online'] },
  { n: '02', id: 'inventory', title: 'Inventory',      tagline: "Know what's on the shelf without counting.", desc: 'Stock moves automatically as you sell, restock or transfer. Reorder points and supplier history live with each product.',      bullets: ['Auto reorder points', 'Supplier ledger', 'Variant + bulk pricing'] },
  { n: '03', id: 'analytics', title: 'Analytics',      tagline: "The shop's pulse, every minute.",           desc: 'Sales, profit, margins, payment mix and cash position — all visible at a glance, all filterable to a single SKU.',           bullets: ['Hour-by-hour revenue', 'Profit by product', 'Cohort & repeat-customer view'] },
  { n: '04', id: 'credits',   title: 'Credits',        tagline: 'Track every kopo without a notebook.',       desc: 'Open tabs, payment reminders, statements over WhatsApp. Aging buckets so you always know who\'s overdue.',                  bullets: ['Aging buckets', 'WhatsApp reminders', 'Statement PDF in one tap'] },
  { n: '05', id: 'ai',        title: 'Ziada AI',       tagline: 'An assistant that actually knows your store.', desc: 'Ask in English or Swahili. Pulls answers from your live data and drafts the next action.',                                  bullets: ['Grounded on your data', 'Bilingual EN/SW', 'Drafts orders, reports, messages'] },
];

function FeatureCard({ f, accent }: { f: typeof FEATURES[0]; accent: string }) {
  const mockup =
    f.id === 'pos'       ? <POSMockup accent={accent} /> :
    f.id === 'inventory' ? <InventoryMini accent={accent} /> :
    f.id === 'analytics' ? <AnalyticsMini accent={accent} /> :
    f.id === 'credits'   ? <CreditsMini accent={accent} /> :
                           <AIChatMini accent={accent} />;
  return (
    <article style={{ border: '1px solid var(--line)', borderRadius: 12, background: 'var(--bg-2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>{f.n} · {f.id.toUpperCase()}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-3)' }}>module</span>
        </div>
        <h3 style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em' }}>{f.title}</h3>
        <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--fg-2)' }}>{f.tagline}</p>
      </div>
      <div style={{ flex: 1, borderBottom: '1px solid var(--line)' }}>{mockup}</div>
      <div style={{ padding: '14px 20px 18px' }}>
        <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.55 }}>{f.desc}</p>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {f.bullets.map((b) => (
            <li key={b} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', display: 'flex', gap: 8 }}>
              <span style={{ color: accent }}>›</span>{b}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function FeatureGrid({ accent }: { accent: string }) {
  return (
    <section id="features" style={{ padding: '88px 0', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em' }}>§ 01 · MODULES</div>
            <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>One platform. Five surfaces. Every counter.</h2>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)' }}>5 / 5 included on every plan</span>
        </div>
        <div className="feat-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {FEATURES.slice(0, 3).map((f) => <FeatureCard key={f.id} f={f} accent={accent} />)}
        </div>
        <div className="feat-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          {FEATURES.slice(3).map((f) => <FeatureCard key={f.id} f={f} accent={accent} />)}
        </div>
      </div>
    </section>
  );
}

// ── AI section ─────────────────────────────────────────────────────────────────
function AISection({ accent }: { accent: string }) {
  const prompts = [
    'Top 3 fast movers this week, and which are running low?',
    'Niambie wateja waliokuwa na deni kubwa zaidi mwezi huu.',
    'Compare margins on cooking oil across all 3 stores.',
    'Draft a restock order for everything below reorder point.',
    'What was my busiest hour yesterday and who was on the till?',
    'Send Fatuma her statement on WhatsApp.',
  ];
  return (
    <section id="ai" style={{ padding: '88px 0', borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em' }}>§ 02 · ZIADA AI</div>
            <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>The first AI that actually knows your shop.</h2>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)' }}>grounded · bilingual · in every screen</span>
        </div>
        <div className="ai-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 32, alignItems: 'start' }}>
          <div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--fg-2)', margin: '0 0 20px', maxWidth: 520 }}>
              Most &ldquo;AI features&rdquo; are a chatbot bolted on. Ziada AI reads from your live sales, stock, suppliers and credits — and writes back. Ask in English or Swahili and get an answer with data and a next action.
            </p>
            <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', marginTop: 24 }}>
              <div style={{ fontFamily: 'var(--mono)', padding: '9px 14px', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>THINGS PEOPLE ASK</div>
              {prompts.map((p, i) => (
                <div key={i} style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--fg-2)', borderBottom: i < prompts.length - 1 ? '1px solid var(--line)' : 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--fg-4)', fontSize: 11 }}>›</span>{p}
                </div>
              ))}
            </div>
            <div className="ai-props" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22 }}>
              {[['Grounded', 'Answers cite the exact rows from your store.'], ['Bilingual', 'Speaks English and Swahili, by default.'], ['Action-oriented', 'Drafts the restock, the message, the report.'], ['Private', 'Your data never trains a foundation model.']].map(([t, d]) => (
                <div key={t} style={{ paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <WindowChrome url="app.ziadapos.com/ai">
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 340, background: 'var(--bg)', color: 'var(--fg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: `${accent}22`, color: accent, display: 'grid', placeItems: 'center', fontSize: 11 }}>✦</span>
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>Ziada AI</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--fg-4)', marginLeft: 4 }}>· Duka Kuu</span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--fg-3)', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ width: 5, height: 5, borderRadius: 999, background: accent, display: 'inline-block' }} /> 142 ms
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '78%', padding: '8px 12px', border: '1px solid var(--line-2)', borderRadius: 10, fontSize: 12.5 }}>What were my top 3 fast movers this week, and which are running low?</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: `${accent}22`, color: accent, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 11 }}>✦</span>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.55 }}>
                    This week your top movers were:
                    <div style={{ marginTop: 8, border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden' }}>
                      {[['1', 'Unga wa Sembe 10kg', '50 sold', '8 left', 'low'], ['2', 'Mafuta ya Cooking 5L', '34 sold', '24 left', 'ok'], ['3', 'Sabuni ya OMO 1kg', '42 sold', '3 left', 'critical']].map(([n, name, sold, left, s]) => (
                        <div key={n} style={{ display: 'grid', gridTemplateColumns: '16px 1.4fr 1fr 1fr auto', gap: 8, alignItems: 'center', padding: '7px 10px', fontSize: 11, borderBottom: s === 'critical' ? 'none' : '1px solid var(--line)', background: s === 'critical' ? 'var(--bad-soft)' : 'transparent' }}>
                          <span style={{ fontFamily: 'monospace', color: 'var(--fg-4)' }}>{n}</span>
                          <span style={{ color: 'var(--fg)' }}>{name}</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--fg-2)' }}>{sold}</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--fg-3)' }}>{left}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 9, padding: '2px 6px', borderRadius: 999, color: s === 'critical' ? 'var(--bad)' : s === 'low' ? 'var(--warn)' : 'var(--good)', background: s === 'critical' ? 'var(--bad-soft)' : s === 'low' ? 'var(--warn-soft)' : 'var(--good-soft)' }}>{s.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12 }}>Sabuni ya OMO is below reorder point — want me to draft a restock order?</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {['Draft restock', 'Show suppliers', 'Project next week'].map((c, i) => (
                        <span key={c} style={{ fontFamily: 'monospace', fontSize: 10.5, padding: '4px 9px', borderRadius: 999, border: '1px solid var(--line-2)', color: i === 0 ? accent : 'var(--fg-2)', background: i === 0 ? `${accent}22` : 'transparent', cursor: 'pointer' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--bg-2)' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--fg-4)' }}>›</span>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Ask about your store…</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: 10, color: 'var(--fg-4)' }}>⌘ K</span>
                </div>
              </div>
            </WindowChrome>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pricing teaser ─────────────────────────────────────────────────────────────
function PricingTeaser() {
  const plans = [
    {
      name: 'Starter',
      price: 'TZS 15,000',
      period: '/month',
      desc: 'For a solo duka or kiosk getting started with digital records.',
      features: ['1 store', 'Up to 500 products', '2 staff accounts', 'POS + Inventory + Credits'],
      cta: 'Start free trial',
      href: '/auth/register',
      popular: false,
    },
    {
      name: 'Business',
      price: 'TZS 40,000',
      period: '/month',
      desc: 'For growing shops that need multi-store management and Ziada AI.',
      features: ['Up to 3 stores', 'Unlimited products', '10 staff accounts', 'Ziada AI included'],
      cta: 'Start free trial',
      href: '/auth/register',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'For retail chains and wholesalers that need dedicated support.',
      features: ['Unlimited stores', 'API access', 'Unlimited staff', 'Dedicated support'],
      cta: 'Contact us',
      href: '/contact',
      popular: false,
    },
  ];

  return (
    <section style={{ padding: '88px 0', borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 40, paddingBottom: 16, borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em' }}>§ 03 · PRICING</div>
            <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>Simple, honest pricing. Billed in TZS.</h2>
          </div>
          <Link href="/pricing" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>See full pricing →</Link>
        </div>

        <div className="mkt-pricing-grid">
          {plans.map((plan) => (
            <div key={plan.name} style={{ border: `1px solid ${plan.popular ? 'var(--accent-line)' : 'var(--line)'}`, borderRadius: 12, background: plan.popular ? 'var(--accent-soft)' : 'var(--bg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 12px', borderRadius: 999, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </div>
              )}
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>{plan.name.toUpperCase()}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>{plan.period}</span>}
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.55 }}>{plan.desc}</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-2)' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5L5 9.5L11 3.5" stroke="var(--good)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: 8, background: plan.popular ? 'var(--accent)' : 'var(--bg-3)', color: plan.popular ? '#fff' : 'var(--fg)', fontSize: 13.5, fontWeight: 500, textDecoration: 'none', border: plan.popular ? 'none' : '1px solid var(--line)', marginTop: 'auto' }}>
                {plan.cta} {plan.popular ? ' →' : ''}
              </Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)' }}>
          All plans include a 7-day free trial · TZS 10,000 activation · No credit card · M-Pesa · Tigo · Airtel · Bank
        </div>
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: 'Does Ziada work without internet?', a: 'Yes. Ziada is offline-first — you can ring up sales, update stock and track credits with no connection. Everything syncs automatically the moment you\'re back online.' },
    { q: 'How many products can I add?', a: 'Starter plans support up to 500 products. Business and Enterprise plans have no limit. Products can have multiple variants (sizes, colours) and bulk pricing tiers.' },
    { q: 'Can I manage multiple stores?', a: 'Yes. The Business plan supports up to 3 locations from one dashboard, including cross-store stock transfers and consolidated analytics. Enterprise supports unlimited stores.' },
    { q: 'What payment methods can my customers use?', a: 'Cash, M-Pesa, Tigo Pesa, Airtel Money and bank transfer — all on one ticket. Payments can be split across methods on a single sale.' },
    { q: 'Is my data private and secure?', a: 'Yes. Your sales, customer and stock data is never used to train any AI model. Data is stored on servers in Tanzania, encrypted at rest and in transit. You own your data and can export it any time.' },
    { q: 'How do I cancel my subscription?', a: 'You can cancel any time from Settings → Billing. No lock-in contracts, no exit fees. Your data remains exportable for 30 days after cancellation.' },
  ];

  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 40, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em' }}>§ 04 · FAQ</div>
          <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>Common questions.</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderTop: '1px solid var(--line)' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '18px 0', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', gap: 16 }}
              >
                <span style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--fg)' }}>{faq.q}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--fg-3)', flexShrink: 0, display: 'inline-block', transition: 'transform 200ms', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {open === i && (
                <div style={{ paddingBottom: 20, fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.65 }}>{faq.a}</div>
              )}
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--line)' }} />
        </div>
        <div style={{ marginTop: 32, padding: '20px 24px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Still have questions?</div>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 3 }}>Talk to the team directly — we respond fast.</div>
          </div>
          <a href="https://wa.me/255692069230?text=Hi%2C+I+have+a+question+about+Ziada" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 7, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Chat on WhatsApp →
          </a>
        </div>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section style={{ padding: '100px 0 88px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 80%)' }} />
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.08em' }}>§ 05 · GET ZIADA</div>
        <h2 style={{ margin: '16px 0 18px', fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05, fontFamily: 'var(--display, var(--sans))' }}>
          Run your shop on calm software.
        </h2>
        <p style={{ margin: '0 auto', maxWidth: 520, fontSize: 16, color: 'var(--fg-2)' }}>
          Seven days, every feature, no card. Most shops are live on Ziada in under an hour.
        </p>
        <div style={{ display: 'inline-flex', gap: 10, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            Start free trial <span style={{ opacity: 0.8 }}>→</span>
          </Link>
          <a
            href="https://wa.me/255692069230?text=Hi%2C+I%27d+like+to+learn+more+about+Ziada"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 18px', borderRadius: 7, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 14, textDecoration: 'none' }}
          >
            Talk to the team
          </a>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', marginTop: 32, letterSpacing: '0.05em' }}>
          DAR ES SALAAM · ARUSHA · MWANZA · DODOMA · MBEYA · ZANZIBAR
        </div>
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const accent = '#6366f1';

  return (
    <>
      <style>{`
        .stats-grid > div { border-left-color: var(--line); }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(3, minmax(140px, 1fr)) !important; }
          .stats-grid > div { border-left: 0 !important; border-bottom: 1px solid var(--line); }
          .feat-grid-3, .feat-grid-2 { grid-template-columns: 1fr !important; }
          .ai-grid { grid-template-columns: 1fr !important; }
          .ai-props { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ai-props { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Hero accent={accent} />
      <StatsStrip />
      <TestimonialsSection />
      <FeatureGrid accent={accent} />
      <AISection accent={accent} />
      <PricingTeaser />
      <FAQSection />
      <CTA />
    </>
  );
}
