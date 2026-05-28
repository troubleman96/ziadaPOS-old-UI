'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmtShort } from '../../../lib/utils';
import { AnalyticsNav, AnalyticsHeader, AreaChart, MiniSpark } from '../_shared';

// ── Data ──────────────────────────────────────────────────────────────────────
const TODAY = new Date(2026, 4, 24);
const DAILY = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(TODAY.getTime() - (89 - i) * 86400000);
  const base = 800000 + Math.sin(i * 0.15) * 200000;
  const v = Math.round(base + Math.sin(i * 0.4) * 80000 + i * 2000);
  const txns = Math.round(70 + Math.sin(i * 0.22) * 20);
  const avgTicket = Math.round(v / txns);
  return {
    v, txns, avgTicket,
    label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    dow: d.getDay(),
  };
});

const HOURLY = Array.from({ length: 13 }, (_, i) => {
  const hr = i + 7;
  const base = hr < 9 ? 0.2 : hr < 12 ? 0.7 : hr < 14 ? 1.0 : hr < 16 ? 0.8 : hr < 18 ? 0.9 : hr < 19 ? 0.5 : 0.2;
  return { hr: `${hr}:00`, v: Math.round(base * 380000 + Math.sin(hr * 1.2) * 30000) };
});

const CATEGORIES_REV = [
  { name: 'Grocery',   rev: 12400000, pct: 38, trend: +6 },
  { name: 'Beverage',  rev: 9200000,  pct: 28, trend: +34 },
  { name: 'Household', rev: 5100000,  pct: 16, trend: -3  },
  { name: 'Snacks',    rev: 3800000,  pct: 12, trend: +22 },
  { name: 'Cosmetics', rev: 1400000,  pct: 4,  trend: +5  },
  { name: 'Bakery',    rev: 700000,   pct: 2,  trend: -8  },
];

const DOW_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DOW_TOTALS = DOW_LABELS.map((lbl, di) => {
  const days = DAILY.filter(d => d.dow === di);
  return { lbl, avg: days.length ? Math.round(days.reduce((s, d) => s + d.v, 0) / days.length) : 0 };
});

export default function SalesAnalyticsPage() {
  const [range, setRange] = useState('30d');

  const chartData = useMemo(() =>
    range === '7d' ? DAILY.slice(-7) : range === '90d' ? DAILY : DAILY.slice(-30)
  , [range]);

  const totalRevenue = chartData.reduce((s, d) => s + d.v, 0);
  const totalTxns    = chartData.reduce((s, d) => s + d.txns, 0);
  const avgTicket    = Math.round(totalRevenue / totalTxns);
  const peakDay      = [...chartData].sort((a, b) => b.v - a.v)[0];

  const prevData = DAILY.slice(-(chartData.length * 2), -chartData.length);
  const prevRevenue = prevData.reduce((s, d) => s + d.v, 0);
  const delta = prevRevenue ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : '0';

  const maxHourly = Math.max(...HOURLY.map(h => h.v));
  const maxDow    = Math.max(...DOW_TOTALS.map(d => d.avg));

  return (
    <AppShell crumbs={[
      { label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' },
      { label: 'Analytics', href: '/analytics' }, { label: 'Sales' },
    ]}
      actions={
        <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {Icons.download} Export CSV
        </button>
      }
    >
      <AnalyticsHeader range={range} setRange={setRange} />
      <AnalyticsNav />

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'REVENUE',     value: fmtShort(totalRevenue), sub: `vs prev: ${prevRevenue ? fmtShort(prevRevenue) : '—'}`, delta: `+${delta}%`, good: true },
          { label: 'TRANSACTIONS', value: totalTxns.toLocaleString(), sub: `${(totalTxns / chartData.length).toFixed(1)} / day avg`, delta: '+9%', good: true },
          { label: 'AVG TICKET',  value: fmtShort(avgTicket), sub: 'per sale', delta: '+3%', good: true },
          { label: 'PEAK DAY',    value: peakDay?.label ?? '—', sub: fmtShort(peakDay?.v ?? 0), delta: '', good: false },
        ].map((k) => (
          <div key={k.label} className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>{k.label}</span>
              {k.delta && <span className={`pill ${k.good ? 'good' : ''}`}>↗ {k.delta}</span>}
            </div>
            <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>{k.value}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="surface" style={{ marginBottom: 14 }}>
        <div className="card-head" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Revenue over time</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{chartData.length}d window</span>
        </div>
        <div style={{ padding: '12px 20px 16px' }}>
          <AreaChart data={chartData} height={220} />
        </div>
      </div>

      {/* Category + DOW grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Revenue by category */}
        <div className="surface">
          <div className="card-head"><span className="card-title">Revenue by category</span></div>
          <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CATEGORIES_REV.map((cat) => (
              <div key={cat.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{cat.name}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className={`pill ${cat.trend > 0 ? 'good' : 'bad'}`}>
                      {cat.trend > 0 ? '↗' : '↘'} {Math.abs(cat.trend)}%
                    </span>
                    <span className="mono" style={{ fontSize: 12.5 }}>{fmtShort(cat.rev)}</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${cat.pct}%`, background: 'var(--accent)', borderRadius: 3 }} />
                </div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 3 }}>{cat.pct}% of revenue</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by day of week */}
        <div className="surface">
          <div className="card-head"><span className="card-title">Sales by day of week</span></div>
          <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DOW_TOTALS.map((d) => (
              <div key={d.lbl} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', width: 28 }}>{d.lbl}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.avg / maxDow) * 100}%`, background: d.lbl === 'Fri' ? 'var(--warn)' : 'var(--accent)', borderRadius: 4 }} />
                </div>
                <span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)', width: 72, textAlign: 'right' }}>{fmtShort(d.avg)}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg-3)', borderRadius: 7, border: '1px solid var(--line)' }}>
              <span style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>
                {Icons.sparkles} <span style={{ color: 'var(--warn)', fontWeight: 500 }}>Friday</span> is your busiest day — 2× average traffic 14:00–16:00.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly heatmap */}
      <div className="surface">
        <div className="card-head"><span className="card-title">Hourly revenue pattern</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>Average across selected period</span>
        </div>
        <div style={{ padding: '16px 20px 24px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {HOURLY.map((h) => {
              const pct = h.v / maxHourly;
              return (
                <div key={h.hr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)' }}>{fmtShort(h.v).replace('TZS ', '')}</span>
                  <div style={{ width: '100%', height: Math.round(pct * 120) + 4, background: pct > 0.85 ? 'var(--warn)' : 'var(--accent)', borderRadius: '3px 3px 0 0', opacity: 0.75 + pct * 0.25 }} />
                  <span className="mono" style={{ fontSize: 9, color: 'var(--fg-4)' }}>{h.hr}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
