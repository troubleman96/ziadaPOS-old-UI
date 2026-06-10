'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/components/LangContext';
import { t, type Lang } from '@/lib/lang';

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
  const kpis = [
    { label: "TODAY'S SALES", value: 'TZS 1,240,000', delta: '+18%', good: true,  spark: [3,4,5,4,6,5,7,6,8,7,9,8,10,9,11,12,11,13,12,14] },
    { label: 'PROFIT',        value: 'TZS 272,000',   delta: '+12%', good: true,  spark: [2,3,2,4,3,4,5,4,6,5,6,7,6,8,7,8,9,8,9,10] },
    { label: 'TICKETS',       value: '48',            delta: '+9',   good: true,  spark: [3,4,3,5,4,5,6,5,7,6,7,6,8,7,9,8,9,8,10,9] },
    { label: 'CREDIT OUT',    value: 'TZS 184,500',   delta: '14',   good: false, spark: [8,8,9,8,9,10,9,10,11,10,11,10,9,10,9,10,9,10,9,8] },
  ];

  const hourly = [12, 28, 45, 72, 95, 120, 158, 210, 175, 230, 280, 195, 145];
  const maxH = Math.max(...hourly);
  const SVG_W = 200, SVG_H = 48;
  const hPts = hourly.map((v, i) => [
    (i / (hourly.length - 1)) * SVG_W,
    SVG_H - (v / maxH) * (SVG_H - 6) - 3,
  ]);
  const hLine = hPts.map(([x, y], i) => (i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`)).join(' ');
  const hFill = `${hLine} L${SVG_W},${SVG_H} L0,${SVG_H} Z`;

  const methods = [
    { label: 'M-Pesa', pct: 52, color: '#10b981' },
    { label: 'Cash',   pct: 28, color: accent },
    { label: 'Tigo',   pct: 12, color: '#f59e0b' },
    { label: 'Bank',   pct:  8, color: '#60a5fa' },
  ];
  const DONUT_R = 22, DONUT_STROKE = 9, DONUT_CX = 26, DONUT_CY = 26;
  const circ = 2 * Math.PI * DONUT_R;
  let cumPct = 0;
  const arcs = methods.map(m => {
    const start = cumPct;
    cumPct += m.pct;
    return { ...m, dashLen: (m.pct / 100) * circ - 0.8, offset: circ * 0.25 - (start / 100) * circ };
  });

  const txns = [
    { id: 'TXN-2042', time: '14:32', amount: '142,000', method: 'M-Pesa', mpesa: true },
    { id: 'TXN-2041', time: '14:18', amount: '48,500',  method: 'Cash',   mpesa: false },
    { id: 'TXN-2040', time: '13:55', amount: '217,000', method: 'M-Pesa', mpesa: true },
  ];

  const topProds = [
    { name: 'Unga wa Sembe 10kg', pct: 100, rev: '1.42M' },
    { name: 'Mafuta Cooking 5L',  pct: 81,  rev: '1.15M' },
    { name: 'Sabuni OMO 1kg',     pct: 38,  rev: '540K' },
  ];

  return (
    <div className="dash-main-grid" style={{ display: 'grid', gridTemplateColumns: '136px 1fr', background: 'var(--bg)', color: 'var(--fg)' }}>
      {/* Sidebar */}
      <div className="dash-sidebar" style={{ borderRight: '1px solid var(--line)', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 4px', marginBottom: 12 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Z</span>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>Ziada</div>
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--fg-4)', marginTop: 1 }}>Duka Kuu · DSM</div>
          </div>
        </div>
        {[
          ['Dashboard',    true ],
          ['Point of Sale',false],
          ['Inventory',    false],
          ['Transactions', false],
          ['Credits',      false],
          ['Analytics',    false],
          ['Ziada AI',     false],
        ].map(([label, active]) => (
          <div key={label as string} style={{ padding: '5px 8px', borderRadius: 5, fontSize: 10.5, color: active ? 'var(--fg)' : 'var(--fg-3)', background: active ? `${accent}18` : 'transparent', borderLeft: `2px solid ${active ? accent : 'transparent'}` }}>
            {label}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 9, overflow: 'hidden', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Dashboard</div>
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--fg-4)', marginTop: 1 }}>Jumanne, 3 Juni 2026</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', border: '1px solid var(--line)', borderRadius: 999, fontFamily: 'monospace', fontSize: 9, color: 'var(--fg-3)', background: 'var(--bg-2)' }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--good)', display: 'inline-block', boxShadow: '0 0 0 2px rgba(52,211,153,0.2)' }} /> live
            </span>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: `${accent}22`, border: `1px solid ${accent}44`, display: 'grid', placeItems: 'center', fontSize: 10, color: accent, fontWeight: 700 }}>E</span>
          </div>
        </div>

        <div className="dash-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {kpis.map((k) => (
            <div key={k.label} style={{ border: '1px solid var(--line)', borderRadius: 7, padding: '7px 9px', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 7.5, color: 'var(--fg-4)', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.label}</div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.value}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 8, padding: '1px 5px', borderRadius: 999, color: k.good ? 'var(--good)' : 'var(--warn)', background: k.good ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)', border: `1px solid ${k.good ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)'}`, flexShrink: 0 }}>{k.delta}</span>
                <div style={{ flex: 1, height: 16, minWidth: 0 }}>
                  <Sparkline data={k.spark} color={k.good ? accent : '#f59e0b'} height={16} fill strokeWidth={1.2} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-mid-grid" style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 6 }}>
          <div style={{ border: '1px solid var(--line)', borderRadius: 7, padding: '8px 10px', background: 'var(--bg-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10.5, fontWeight: 500 }}>Sales by hour</span>
              <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'var(--fg-4)' }}>TODAY</span>
            </div>
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="none" style={{ width: '100%', height: SVG_H, display: 'block' }}>
              <defs>
                <linearGradient id="mkt-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path d={hFill} fill="url(#mkt-grad)" />
              <path d={hLine} fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              {['6am','8','10','12','2pm','4','6'].map(lbl => (
                <span key={lbl} style={{ fontFamily: 'monospace', fontSize: 7.5, color: 'var(--fg-4)' }}>{lbl}</span>
              ))}
            </div>
          </div>

          <div style={{ border: '1px solid var(--line)', borderRadius: 7, padding: '8px 10px', background: 'var(--bg-2)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 500, marginBottom: 6 }}>Payment mix</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="52" height="52" viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
                {arcs.map((arc, i) => (
                  <circle key={i}
                    cx={DONUT_CX} cy={DONUT_CY} r={DONUT_R}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={DONUT_STROKE}
                    strokeDasharray={`${arc.dashLen} ${circ}`}
                    strokeDashoffset={arc.offset}
                  />
                ))}
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
                {methods.map(m => (
                  <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9.5, color: 'var(--fg-2)' }}>
                      <span style={{ width: 5, height: 5, borderRadius: 999, background: m.color, display: 'inline-block', flexShrink: 0 }} />
                      {m.label}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--fg-3)' }}>{m.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dash-bot-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 6 }}>
          <div className="dash-txn-table" style={{ border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg-2)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 1.3fr 0.9fr', gap: 4, padding: '5px 10px', fontFamily: 'monospace', fontSize: 7.5, color: 'var(--fg-4)', letterSpacing: '0.05em', borderBottom: '1px solid var(--line)', background: 'var(--bg-3)' }}>
              <span>TXN</span><span>TIME</span><span>AMOUNT</span><span>VIA</span>
            </div>
            {txns.map((tx, i) => (
              <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 1.3fr 0.9fr', gap: 4, padding: '5px 10px', fontSize: 9.5, alignItems: 'center', borderBottom: i < txns.length - 1 ? '1px solid var(--line)' : 0 }}>
                <span style={{ fontFamily: 'monospace', color: accent, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.id}</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--fg-4)', fontSize: 8.5 }}>{tx.time}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 500, fontSize: 9.5 }}>TZS {tx.amount}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 8, padding: '1px 5px', borderRadius: 999, background: tx.mpesa ? 'rgba(16,185,129,0.08)' : 'var(--bg-3)', color: tx.mpesa ? '#10b981' : 'var(--fg-3)', border: `1px solid ${tx.mpesa ? 'rgba(16,185,129,0.22)' : 'var(--line)'}`, textAlign: 'center' }}>{tx.method}</span>
              </div>
            ))}
          </div>

          <div style={{ border: '1px solid var(--line)', borderRadius: 7, padding: '8px 10px', background: 'var(--bg-2)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 500, marginBottom: 7 }}>Top products</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {topProds.map((p, i) => (
                <div key={p.name}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'var(--fg-4)', width: 10 }}>{i + 1}</span>
                      <span style={{ fontSize: 9.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--fg-2)' }}>{p.name}</span>
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: 8.5, color: 'var(--fg-3)', flexShrink: 0, marginLeft: 6 }}>{p.rev}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 999, background: 'var(--bg-3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: `${accent}aa`, width: `${p.pct}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, padding: '5px 8px', borderRadius: 5, background: `${accent}10`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: `${accent}22`, color: accent, display: 'grid', placeItems: 'center', fontSize: 9, flexShrink: 0 }}>✦</span>
              <span style={{ fontSize: 9, color: 'var(--fg-3)', lineHeight: 1.3 }}>Sabuni OMO below reorder point</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Module meta (icon + colors) ────────────────────────────────────────────────
const MODULE_META: Record<string, { color: string; bg: string; icon: string }> = {
  pos:       { color: '#4B3FD4', bg: 'rgba(75,63,212,0.08)',  icon: '⊞' },
  inventory: { color: '#1D9E75', bg: 'rgba(29,158,117,0.1)',  icon: '⬡' },
  analytics: { color: '#BA7517', bg: 'rgba(186,117,23,0.1)',  icon: '↗' },
  credits:   { color: '#A32D2D', bg: 'rgba(163,45,45,0.1)',   icon: '◈' },
  ai:        { color: '#4B3FD4', bg: 'rgba(75,63,212,0.08)',  icon: '✦' },
};

function getFeatures(lang: Lang) {
  return [
    { n: '01', id: 'pos',       title: t(lang,'feat_pos_title'), tagline: t(lang,'feat_pos_tag'), desc: t(lang,'feat_pos_desc'), bullets: [t(lang,'feat_pos_b1'), t(lang,'feat_pos_b2'), t(lang,'feat_pos_b3')] },
    { n: '02', id: 'inventory', title: t(lang,'feat_inv_title'), tagline: t(lang,'feat_inv_tag'), desc: t(lang,'feat_inv_desc'), bullets: [t(lang,'feat_inv_b1'), t(lang,'feat_inv_b2'), t(lang,'feat_inv_b3')] },
    { n: '03', id: 'analytics', title: t(lang,'feat_ana_title'), tagline: t(lang,'feat_ana_tag'), desc: t(lang,'feat_ana_desc'), bullets: [t(lang,'feat_ana_b1'), t(lang,'feat_ana_b2'), t(lang,'feat_ana_b3')] },
    { n: '04', id: 'credits',   title: t(lang,'feat_crd_title'), tagline: t(lang,'feat_crd_tag'), desc: t(lang,'feat_crd_desc'), bullets: [t(lang,'feat_crd_b1'), t(lang,'feat_crd_b2'), t(lang,'feat_crd_b3')] },
    { n: '05', id: 'ai',        title: t(lang,'feat_ai_title'),  tagline: t(lang,'feat_ai_tag'),  desc: t(lang,'feat_ai_desc'),  bullets: [t(lang,'feat_ai_b1'),  t(lang,'feat_ai_b2'),  t(lang,'feat_ai_b3')]  },
  ];
}

function FeatureCard({ f, wide }: { f: ReturnType<typeof getFeatures>[0]; wide?: boolean }) {
  const meta = MODULE_META[f.id] ?? MODULE_META.pos;
  const [hovered, setHovered] = React.useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? meta.color + '88' : meta.color + '33'}`,
        borderRadius: 12,
        padding: 22,
        background: hovered ? meta.bg : 'var(--bg)',
        gridColumn: wide ? 'span 2' : undefined,
        transition: 'border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease',
        boxShadow: hovered ? `0 4px 24px ${meta.color}18` : 'none',
        cursor: 'default',
      }}>
      <div style={{ marginBottom: 14 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 999,
          border: `1px solid ${meta.color}44`,
          background: meta.bg,
          fontFamily: 'var(--mono)', fontSize: 10.5,
          color: meta.color, letterSpacing: '0.04em',
        }}>
          {f.n} · {f.id.toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>{f.title}</div>
      <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55, marginBottom: 14 }}>{f.tagline}</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {f.bullets.map((b) => (
          <li key={b} style={{ fontSize: 12, color: 'var(--fg-2)', padding: '3px 0', display: 'flex', gap: 4 }}>
            <span style={{ color: meta.color, fontWeight: 600, flexShrink: 0 }}>›</span>{b}
          </li>
        ))}
      </ul>
    </article>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero({ accent }: { accent: string }) {
  const { lang } = useLang();
  return (
    <section className="hero-section" style={{ paddingTop: 88, paddingBottom: 96, position: 'relative', overflow: 'hidden' }}>
      {/* radial glow behind the heading */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 900, height: 560, background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${accent}22 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <div style={{ maxWidth: 2800, margin: '0 auto', textAlign: 'center' }}>

          {/* Badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 14px 5px 10px', border: `1px solid ${accent}44`,
            borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 11,
            letterSpacing: '0.04em', color: accent,
            background: `${accent}0e`, marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, boxShadow: `0 0 0 3px ${accent}33`, display: 'inline-block' }} />
            {t(lang, 'hero_badge')}
          </span>

          {/* Heading */}
          <h1 className="hero-h1" style={{ margin: 0, fontSize: 'clamp(48px, 6.2vw, 80px)', lineHeight: 1.0, fontWeight: 900, letterSpacing: '-0.04em', fontFamily: 'var(--sans)' }}>
            {t(lang, 'hero_h1a')}<br />
            <span style={{ color: accent }}>{t(lang, 'hero_h1b')}</span>
          </h1>

          <p style={{ margin: '26px auto 0', fontSize: 17, lineHeight: 1.65, color: 'var(--fg-2)', maxWidth: 520 }}>
            {t(lang, 'hero_sub')}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 999, background: accent, color: '#fff', fontSize: 14.5, fontWeight: 600, textDecoration: 'none', boxShadow: `0 4px 20px ${accent}55` }}>
              {t(lang, 'hero_trial')} <span>→</span>
            </Link>
            <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 999, border: '1px solid var(--line-2)', color: 'var(--fg)', fontSize: 14.5, textDecoration: 'none', background: 'var(--bg-2)' }}>
              {t(lang, 'hero_signin')}
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 20, marginTop: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
            {(['hero_trust1','hero_trust2','hero_trust3','hero_trust4'] as const).map((key) => (
              <span key={key} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L4.8 8.5L9.5 3.8" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t(lang, key)}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="hero-mock-wrap" style={{ maxWidth: 1040, margin: '64px auto 0', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: -48, left: '12%', right: '12%', height: 96, background: accent, filter: 'blur(72px)', opacity: 0.22, borderRadius: '50%', pointerEvents: 'none' }} />
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
  const { lang } = useLang();
  const stats = [
    { labelKey: 'stat_stores' as const, v: '1,247'  },
    { labelKey: 'stat_txns'   as const, v: '89,412' },
    { labelKey: 'stat_tzs'    as const, v: '4.21B'  },
    { labelKey: 'stat_ai'     as const, v: '12,094' },
    { labelKey: 'stat_uptime' as const, v: '99.98%' },
  ];
  const ticker = [...stats, ...stats, ...stats];

  return (
    <section style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)', overflow: 'hidden', position: 'relative' }}>
      {/* Fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, var(--bg-2), transparent)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, var(--bg-2), transparent)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', width: 'max-content', animation: 'mkt-ticker 32s linear infinite' }}>
        {ticker.map((s, i) => (
          <div key={i} style={{ padding: '22px 36px', borderRight: '1px solid var(--line)', flexShrink: 0, textAlign: 'center', minWidth: 160 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 6, whiteSpace: 'nowrap' }}>{t(lang, s.labelKey)}</div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Testimonials ───────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const { lang } = useLang();
  const testimonials = [
    { quoteKey: 'test_q1' as const, roleKey: 'test_q1_role' as const, name: 'Amina J.',  location: 'Mwanza',        initial: 'A' },
    { quoteKey: 'test_q2' as const, roleKey: 'test_q2_role' as const, name: 'Hassan B.', location: 'Dar es Salaam', initial: 'H' },
    { quoteKey: 'test_q3' as const, roleKey: 'test_q3_role' as const, name: 'Grace N.',  location: 'Arusha',        initial: 'G' },
  ];

  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 10 }}>{t(lang, 'test_label')}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08 }}>{t(lang, 'test_h2')}</h2>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>{t(lang, 'test_count')}</span>
          </div>
        </div>
        <div className="mkt-testimonials-grid">
          {testimonials.map((tst) => (
            <div key={tst.name} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '24px', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: 'var(--fg)', fontStyle: 'italic' }}>{t(lang, tst.quoteKey)}</p>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, display: 'flex', gap: 12, alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                  {tst.initial}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{tst.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{t(lang, tst.roleKey)} · {tst.location}</div>
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
function FeatureGrid() {
  const { lang } = useLang();
  const features = getFeatures(lang);
  return (
    <section id="features" style={{ padding: '88px 0', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 36, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 10 }}>{t(lang, 'feat_label')}</div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08 }}>{t(lang, 'feat_h2')}</h2>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--fg-3)', fontFamily: 'var(--mono)' }}>{t(lang, 'feat_sub')}</p>
        </div>
        <div className="z-modules" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {features.map((f) => <FeatureCard key={f.id} f={f} wide={f.id === 'ai'} />)}
        </div>
      </div>
    </section>
  );
}

// ── AI section ─────────────────────────────────────────────────────────────────
function AISection({ accent }: { accent: string }) {
  const { lang } = useLang();
  const prompts = lang === 'sw' ? [
    'Bidhaa 3 zinazouzwa zaidi wiki hii, na zipi zinaisha?',
    'Niambie wateja waliokuwa na deni kubwa zaidi mwezi huu.',
    'Linganisha faida ya mafuta ya kupikia katika maduka yote 3.',
    'Andika agizo la kuagiza kwa kila kitu chini ya kiwango cha kuagiza.',
    'Ni saa ngapi ilikuwa na shughuli nyingi zaidi jana?',
    'Tuma Fatuma taarifa yake kupitia WhatsApp.',
  ] : [
    'Top 3 fast movers this week, and which are running low?',
    'Niambie wateja waliokuwa na deni kubwa zaidi mwezi huu.',
    'Compare margins on cooking oil across all 3 stores.',
    'Draft a restock order for everything below reorder point.',
    'What was my busiest hour yesterday and who was on the till?',
    'Send Fatuma her statement on WhatsApp.',
  ];

  const props = [
    { titleKey: 'ai_prop1_t' as const, descKey: 'ai_prop1_d' as const },
    { titleKey: 'ai_prop2_t' as const, descKey: 'ai_prop2_d' as const },
    { titleKey: 'ai_prop3_t' as const, descKey: 'ai_prop3_d' as const },
    { titleKey: 'ai_prop4_t' as const, descKey: 'ai_prop4_d' as const },
  ];

  return (
    <section id="ai" style={{ padding: '88px 0', borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 10 }}>{t(lang, 'ai_label')}</div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08 }}>{t(lang, 'ai_h2')}</h2>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--mono)' }}>{t(lang, 'ai_badge')}</p>
        </div>
        <div className="ai-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 32, alignItems: 'start' }}>
          <div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--fg-2)', margin: '0 0 20px', maxWidth: 520 }}>
              {t(lang, 'ai_desc')}
            </p>
            <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', marginTop: 24 }}>
              <div style={{ fontFamily: 'var(--mono)', padding: '9px 14px', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>{t(lang, 'ai_things_label')}</div>
              {prompts.map((p, i) => (
                <div key={i} style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--fg-2)', borderBottom: i < prompts.length - 1 ? '1px solid var(--line)' : 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--fg-4)', fontSize: 11 }}>›</span>{p}
                </div>
              ))}
            </div>
            <div className="ai-props" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22 }}>
              {props.map(({ titleKey, descKey }) => (
                <div key={titleKey} style={{ paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t(lang, titleKey)}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{t(lang, descKey)}</div>
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
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>Ziada AI</span>
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
  const { lang } = useLang();

  const plans = [
    {
      name: 'Starter',
      price: 'TZS 15,000',
      period: '/month',
      descKey: 'plan_starter_desc' as const,
      features: ['1 store', 'Up to 500 products', '2 staff accounts', 'POS + Inventory + Credits'],
      ctaKey: 'pricing_trial' as const,
      href: '/auth/register',
      popular: false,
    },
    {
      name: 'Business',
      price: 'TZS 40,000',
      period: '/month',
      descKey: 'plan_biz_desc' as const,
      features: ['Up to 3 stores', 'Unlimited products', '10 staff accounts', 'Ziada AI included'],
      ctaKey: 'pricing_trial' as const,
      href: '/auth/register',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      descKey: 'plan_ent_desc' as const,
      features: ['Unlimited stores', 'API access', 'Unlimited staff', 'Dedicated support'],
      ctaKey: 'pricing_contact' as const,
      href: '/contact',
      popular: false,
    },
  ];

  return (
    <section style={{ padding: '88px 0', borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 40, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 10 }}>{t(lang, 'pricing_label')}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08 }}>{t(lang, 'pricing_h2')}</h2>
            <Link href="/pricing" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', textDecoration: 'none', flexShrink: 0 }}>{t(lang, 'pricing_see')}</Link>
          </div>
        </div>

        <div className="mkt-pricing-grid">
          {plans.map((plan) => (
            <div key={plan.name} style={{ border: `1px solid ${plan.popular ? 'var(--accent-line)' : 'var(--line)'}`, borderRadius: 12, background: plan.popular ? 'var(--accent-soft)' : 'var(--bg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 12px', borderRadius: 999, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {t(lang, 'pricing_popular')}
                </div>
              )}
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>{plan.name.toUpperCase()}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>{plan.period}</span>}
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.55 }}>{t(lang, plan.descKey)}</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-2)' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5L5 9.5L11 3.5" stroke="var(--good)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: 8, background: plan.popular ? 'var(--accent)' : 'var(--bg-3)', color: plan.popular ? '#fff' : 'var(--fg)', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', border: plan.popular ? 'none' : '1px solid var(--line)', marginTop: 'auto' }}>
                {t(lang, plan.ctaKey)} {plan.popular ? ' →' : ''}
              </Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)' }}>
          {t(lang, 'pricing_foot')}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────────
function FAQSection() {
  const { lang } = useLang();
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { qKey: 'faq_q1' as const, aKey: 'faq_a1' as const },
    { qKey: 'faq_q2' as const, aKey: 'faq_a2' as const },
    { qKey: 'faq_q3' as const, aKey: 'faq_a3' as const },
    { qKey: 'faq_q4' as const, aKey: 'faq_a4' as const },
    { qKey: 'faq_q5' as const, aKey: 'faq_a5' as const },
    { qKey: 'faq_q6' as const, aKey: 'faq_a6' as const },
  ];

  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 40, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 10 }}>{t(lang, 'faq_label')}</div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08 }}>{t(lang, 'faq_h2')}</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {faqs.map(({ qKey, aKey }, i) => (
            <div key={i} style={{ borderTop: '1px solid var(--line)' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '18px 0', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', gap: 16 }}
              >
                <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>{t(lang, qKey)}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--fg-3)', flexShrink: 0, display: 'inline-block', transition: 'transform 200ms', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {open === i && (
                <div style={{ paddingBottom: 20, fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.65 }}>{t(lang, aKey)}</div>
              )}
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--line)' }} />
        </div>
        <div style={{ marginTop: 32, padding: '20px 24px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{t(lang, 'faq_still')}</div>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 3 }}>{t(lang, 'faq_team')}</div>
          </div>
          <a href="https://wa.me/255692069230?text=Hi%2C+I+have+a+question+about+Ziada" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 7, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            {t(lang, 'faq_wa')}
          </a>
        </div>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────────
function CTA() {
  const { lang } = useLang();
  return (
    <section style={{ padding: '100px 0 88px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.08em' }}>{t(lang, 'cta_label')}</div>
        <h2 style={{ margin: '16px 0 18px', fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.02, fontFamily: 'var(--sans)' }}>
          {t(lang, 'cta_h2a')}<br />
          <span style={{ color: 'var(--accent)' }}>{t(lang, 'cta_h2b')}</span>
        </h2>
        <p style={{ margin: '0 auto', maxWidth: 520, fontSize: 16, color: 'var(--fg-2)' }}>
          {t(lang, 'cta_sub')}
        </p>
        <div style={{ display: 'inline-flex', gap: 10, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            {t(lang, 'cta_trial')} <span style={{ opacity: 0.8 }}>→</span>
          </Link>
          <a
            href="https://wa.me/255692069230?text=Hi%2C+I%27d+like+to+learn+more+about+Ziada"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 18px', borderRadius: 7, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 14, textDecoration: 'none' }}
          >
            {t(lang, 'cta_talk')}
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
        /* ── Stats ticker ── */
        @keyframes mkt-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Dashboard mockup responsive ── */
        @media (max-width: 900px) {
          .dash-sidebar { display: none !important; }
          .dash-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .dash-kpi-grid { grid-template-columns: repeat(2,1fr) !important; }
          .dash-mid-grid { grid-template-columns: 1fr !important; }
          .dash-bot-grid { grid-template-columns: 1fr !important; }
          .dash-txn-table { display: none !important; }
        }

        /* ── Hero ── */
        @media (max-width: 640px) {
          .hero-h1 { font-size: 48px !important; letter-spacing: -0.03em !important; }
          .hero-section { padding-top: 56px !important; padding-bottom: 56px !important; }
          .hero-mock-wrap { margin-top: 36px !important; }
        }

        /* ── Section grids ── */
        @media (max-width: 768px) {
          .ai-grid { grid-template-columns: 1fr !important; }
          .ai-props { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 900px) {
          .z-modules { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .z-modules { grid-template-columns: 1fr !important; }
          .z-modules article[style*="span 2"] { grid-column: span 1 !important; }
          .z-modules article ul { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .ai-props { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Hero accent={accent} />
      <FeatureGrid />
      <StatsStrip />
      <AISection accent={accent} />
      <PricingTeaser />
      <TestimonialsSection />
      <FAQSection />
      <CTA />
    </>
  );
}
