'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmtShort } from '../../lib/utils';

// ── Analytics Nav ─────────────────────────────────────────────────────────────
function AnalyticsNav() {
  const pathname = usePathname();
  const tabs = [
    ['overview',  'Overview',   '/analytics'],
    ['sales',     'Sales',      '/analytics/sales'],
    ['products',  'Products',   '/analytics/products'],
    ['customers', 'Customers',  '/analytics/customers'],
    ['cashflow',  'Cashflow',   '/analytics/cashflow'],
  ];
  return (
    <div className="analytics-nav">
      {tabs.map(([k, l, href]) => {
        const active = href === '/analytics' ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={k} href={href} className={active ? 'active' : ''}>{l}</Link>
        );
      })}
    </div>
  );
}

// ── Shared charts / atoms ─────────────────────────────────────────────────────
function MiniSpark({ data, color = 'var(--accent)' }: { data: number[]; color?: string }) {
  const w = 200, h = 36;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
  const dFill = d + ` L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <path d={dFill} fill={color} opacity="0.1" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function AreaChart({ data, height = 240 }: { data: Array<{ v: number; label: string }>; height?: number }) {
  const w = 820, h = height;
  const pad = { l: 48, r: 16, t: 16, b: 32 };
  const max = Math.max(...data.map(d => d.v)) * 1.1;
  const stepX = (w - pad.l - pad.r) / (data.length - 1);
  const yScale = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b);
  const xScale = (i: number) => pad.l + i * stepX;
  const linePath = data.map((d, i) => (i === 0 ? 'M' : 'L') + xScale(i).toFixed(1) + ',' + yScale(d.v).toFixed(1)).join(' ');
  const areaPath = linePath + ` L ${xScale(data.length-1)},${h-pad.b} L ${pad.l},${h-pad.b} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(t * max));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="aFill2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w-pad.r} y1={yScale(t)} y2={yScale(t)} stroke="var(--line)" strokeDasharray="2 4" />
          <text x={pad.l - 8} y={yScale(t) + 3} textAnchor="end" fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">
            {t === 0 ? '0' : fmtShort(t).replace('TZS ', '')}
          </text>
        </g>
      ))}
      {data.map((d, i) => i % Math.ceil(data.length / 8) === 0 && (
        <text key={i} x={xScale(i)} y={h - 12} textAnchor="middle" fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">{d.label}</text>
      ))}
      <path d={areaPath} fill="url(#aFill2)" />
      <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="1.75" />
    </svg>
  );
}

function Donut({ slices, total, centerLabel, centerValue }: { slices: Array<{ label: string; v: number; color: string }>; total: number; centerLabel: string; centerValue: string }) {
  const R = 60, r = 42, cx = 70, cy = 70;
  let acc = 0;
  const arcs = slices.map((s) => {
    const start = acc / total * Math.PI * 2 - Math.PI / 2;
    acc += s.v;
    const end = acc / total * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end),   y2 = cy + R * Math.sin(end);
    const x3 = cx + r * Math.cos(end),   y3 = cy + r * Math.sin(end);
    const x4 = cx + r * Math.cos(start), y4 = cy + r * Math.sin(start);
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`;
    return { d, color: s.color, label: s.label };
  });
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)" letterSpacing="0.06em">{centerLabel}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="15" fill="var(--fg)" fontWeight="500">{centerValue}</text>
    </svg>
  );
}

// ── Daily data ────────────────────────────────────────────────────────────────
const TODAY = new Date(2026, 4, 24);
const DAILY = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(TODAY.getTime() - (89 - i) * 86400000);
  const base = 800000 + Math.sin(i * 0.15) * 200000;
  const v = Math.round(base + Math.sin(i * 0.4) * 80000 + i * 2000);
  return { v, label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) };
});

const PAYMENT_MIX = [
  { label: 'M-Pesa',    v: 48, color: '#10b981' },
  { label: 'Cash',      v: 28, color: 'var(--accent)' },
  { label: 'Tigo Pesa', v: 14, color: '#f59e0b' },
  { label: 'Bank',      v: 7,  color: '#60a5fa' },
  { label: 'Credit',    v: 3,  color: '#fb7185' },
];

const AI_INSIGHTS = [
  { kind: 'win',  title: 'Revenue up 18% this month', body: 'Strongest growth from beverages (+34%) and snacks (+22%). Your new shelf layout may be driving impulse buys.', action: 'See breakdown' },
  { kind: 'warn', title: 'Friday peak underserved', body: '14:00–16:00 on Fridays averages 2× normal traffic but you\'re often short-staffed. You\'ve missed ~TZS 180K in potential sales.', action: 'View pattern' },
  { kind: 'risk', title: '3 products losing margin', body: 'Mafuta ya Cooking 1L, Sukari 2kg and Chai Bora 500g have slipped below 18% margin due to cost increases not passed on.', action: 'Reprice now' },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const chartData = range === '7d' ? DAILY.slice(-7) : range === '90d' ? DAILY : DAILY.slice(-30);

  const totalRevenue = chartData.reduce((s, d) => s + d.v, 0);
  const lastPeriod = DAILY.slice(-(chartData.length * 2), -chartData.length);
  const lastRevenue = lastPeriod.reduce((s, d) => s + d.v, 0);
  const revDelta = lastRevenue ? ((totalRevenue - lastRevenue) / lastRevenue * 100).toFixed(1) : '0';

  const totalProfit = Math.round(totalRevenue * 0.22);
  const totalTickets = Math.round(chartData.length * 87);

  return (
    <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Analytics' }]}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Analytics</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>Performance across all metrics, powered by Ziada AI.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden', background: 'var(--bg-2)' }}>
            {[['7d','7D'],['30d','30D'],['90d','90D'],['ytd','YTD']].map(([k,l]) => (
              <button key={k} onClick={() => setRange(k)} style={{
                padding: '7px 14px', fontSize: 12.5, border: 0,
                borderRight: '1px solid var(--line)',
                background: range === k ? 'var(--bg-3)' : 'transparent',
                color: range === k ? 'var(--fg)' : 'var(--fg-3)', cursor: 'pointer',
              }}>{l}</button>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.download} Export</button>
        </div>
      </div>

      <AnalyticsNav />

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>REVENUE</span>
            <span className="pill good">↗ +{revDelta}%</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>{fmtShort(totalRevenue)}</div>
          <div style={{ height: 36 }}><MiniSpark data={chartData.map(d => d.v)} /></div>
        </div>
        <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>GROSS PROFIT</span>
            <span className="pill good">↗ +12%</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>{fmtShort(totalProfit)}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>22.2% margin</div>
        </div>
        <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>TRANSACTIONS</span>
            <span className="pill good">↗ +9%</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>{totalTickets.toLocaleString()}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>avg {fmtShort(Math.round(totalRevenue / totalTickets))} / ticket</div>
        </div>
        <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>CUSTOMERS</span>
            <span className="pill good">↗ +22%</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>1,284</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>142 new this month</div>
        </div>
      </div>

      {/* Main chart + payment mix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12, marginBottom: 16 }}>
        <div className="surface">
          <div className="card-head">
            <span className="card-title">Revenue trend</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{range === '7d' ? 'last 7 days' : range === '90d' ? 'last 90 days' : 'last 30 days'}</span>
          </div>
          <div style={{ padding: 16 }}>
            <AreaChart data={chartData} />
          </div>
        </div>
        <div className="surface">
          <div className="card-head">
            <span className="card-title">Payment mix</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>by revenue share</span>
          </div>
          <div style={{ padding: '16px 18px', display: 'flex', gap: 18, alignItems: 'center' }}>
            <Donut slices={PAYMENT_MIX} total={100} centerLabel="SHARE" centerValue="100%" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {PAYMENT_MIX.map((s) => (
                <div key={s.label} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, alignItems: 'center', fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: 'inline-block' }}></span>
                  <span style={{ color: 'var(--fg-2)' }}>{s.label}</span>
                  <span className="mono" style={{ color: 'var(--fg)' }}>{s.v}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI insights */}
      <div className="surface" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {Icons.sparkles} AI Insights
          </span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>updated 2 min ago</span>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AI_INSIGHTS.map((ins, i) => {
            const color = ins.kind === 'win' ? 'var(--good)' : ins.kind === 'warn' ? 'var(--warn)' : ins.kind === 'risk' ? 'var(--bad)' : 'var(--accent)';
            const bg = ins.kind === 'win' ? 'rgba(52,211,153,0.08)' : ins.kind === 'warn' ? 'rgba(251,191,36,0.08)' : ins.kind === 'risk' ? 'rgba(251,113,133,0.08)' : 'var(--accent-soft)';
            return (
              <div key={i} className="surface" style={{ padding: '14px 16px', borderColor: color, background: bg, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--bg-2)', border: '1px solid ' + color, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {Icons.sparkles}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{ins.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>{ins.body}</div>
                </div>
                <button className="btn btn-soft" style={{ padding: '5px 10px', fontSize: 12, flexShrink: 0 }}>{ins.action}</button>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
