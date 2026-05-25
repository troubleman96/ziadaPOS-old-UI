'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmtShort } from '../../../lib/utils';
import { AnalyticsNav, AnalyticsHeader, AreaChart } from '../_shared';
import { seeded } from '../../../lib/utils';

// ── Synthetic cashflow data ────────────────────────────────────────────────────
const TODAY = new Date(2026, 4, 24);

const DAILY_CF = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(TODAY.getTime() - (89 - i) * 86400000);
  const inflow  = Math.round(800000 + Math.sin(i * 0.15) * 200000 + i * 2000);
  const cogs    = Math.round(inflow * (0.72 + seeded(i * 7) * 0.06));
  const opex    = Math.round(60000 + seeded(i * 11) * 20000);
  const net     = inflow - cogs - opex;
  return {
    v: inflow, net, cogs, opex, inflow,
    label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    dow: d.getDay(),
  };
});

const EXPENSES_BREAKDOWN = [
  { name: 'Cost of Goods',   amount: 23040000, pct: 72, color: 'var(--bad)'   },
  { name: 'Rent & Utilities',amount: 1800000,  pct: 6,  color: '#f59e0b'      },
  { name: 'Staff wages',     amount: 2400000,  pct: 7,  color: '#60a5fa'      },
  { name: 'Transport',       amount: 650000,   pct: 2,  color: 'var(--accent)'},
  { name: 'Other OPEX',      amount: 480000,   pct: 2,  color: 'var(--fg-4)' },
];

const PAYMENT_IN = [
  { method: 'M-Pesa',    amount: 15360000, pct: 48, color: '#10b981' },
  { method: 'Cash',      amount: 8960000,  pct: 28, color: 'var(--accent)' },
  { method: 'Tigo Pesa', amount: 4480000,  pct: 14, color: '#f59e0b' },
  { method: 'Bank',      amount: 2240000,  pct: 7,  color: '#60a5fa' },
  { method: 'Credit',    amount: 960000,   pct: 3,  color: '#fb7185' },
];

export default function CashflowPage() {
  const [range, setRange] = useState('30d');

  const chartData = useMemo(() =>
    range === '7d' ? DAILY_CF.slice(-7) :
    range === '90d' ? DAILY_CF : DAILY_CF.slice(-30)
  , [range]);

  const totals = useMemo(() => ({
    inflow:  chartData.reduce((s, d) => s + d.inflow, 0),
    cogs:    chartData.reduce((s, d) => s + d.cogs, 0),
    opex:    chartData.reduce((s, d) => s + d.opex, 0),
    net:     chartData.reduce((s, d) => s + d.net, 0),
  }), [chartData]);

  const netData = chartData.map(d => ({ v: Math.max(0, d.net), label: d.label }));
  const runningBalance = useMemo(() => {
    let bal = 4800000; // opening
    return chartData.map(d => {
      bal += d.net;
      return { v: bal, label: d.label };
    });
  }, [chartData]);

  const maxExp = Math.max(...EXPENSES_BREAKDOWN.map(e => e.amount));

  return (
    <AppShell crumbs={[
      { label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' },
      { label: 'Analytics', href: '/analytics' }, { label: 'Cashflow' },
    ]}
      actions={
        <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {Icons.download} Export
        </button>
      }
    >
      <AnalyticsHeader range={range} setRange={setRange} />
      <AnalyticsNav />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'TOTAL INFLOW',  value: fmtShort(totals.inflow), sub: 'gross revenue', border: '' },
          { label: 'COST OF GOODS', value: fmtShort(totals.cogs),   sub: `${(totals.cogs / totals.inflow * 100).toFixed(1)}% of inflow`, border: 'var(--bad)' },
          { label: 'OPERATING EXP', value: fmtShort(totals.opex),   sub: `${(totals.opex / totals.inflow * 100).toFixed(1)}% of inflow`, border: 'var(--warn)' },
          { label: 'NET CASHFLOW',  value: fmtShort(totals.net),    sub: `${(totals.net / totals.inflow * 100).toFixed(1)}% net margin`,  border: 'var(--good)' },
        ].map((k) => (
          <div key={k.label} className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6, borderTop: k.border ? `3px solid ${k.border}` : undefined }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>{k.label}</span>
            <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>{k.value}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="surface">
          <div className="card-head"><span className="card-title">Net cashflow</span></div>
          <div style={{ padding: '12px 20px 16px' }}>
            <AreaChart data={netData} height={200} color="var(--good)" />
          </div>
        </div>

        <div className="surface">
          <div className="card-head"><span className="card-title">Running balance (est.)</span></div>
          <div style={{ padding: '12px 20px 16px' }}>
            <AreaChart data={runningBalance} height={200} color="var(--accent)" />
          </div>
        </div>
      </div>

      {/* Expenses + payment in */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Expense breakdown */}
        <div className="surface">
          <div className="card-head"><span className="card-title">Expense breakdown</span></div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {EXPENSES_BREAKDOWN.map((e) => (
              <div key={e.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13 }}>{e.name}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{e.pct}%</span>
                    <span className="mono" style={{ fontSize: 13 }}>{fmtShort(e.amount)}</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(e.amount / maxExp) * 100}%`, background: e.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--bg-3)', borderRadius: 7, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 500 }}>
                <span>Total expenses</span>
                <span className="mono">{fmtShort(EXPENSES_BREAKDOWN.reduce((s, e) => s + e.amount, 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment methods in */}
        <div className="surface">
          <div className="card-head"><span className="card-title">Inflow by payment method</span></div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PAYMENT_IN.map((p) => (
              <div key={p.method}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    <span style={{ fontSize: 13 }}>{p.method}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{p.pct}%</span>
                    <span className="mono" style={{ fontSize: 13 }}>{fmtShort(p.amount)}</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}

            {/* Outstanding credits */}
            <div style={{ marginTop: 8, padding: '12px 14px', background: 'color-mix(in srgb, var(--bad) 10%, var(--bg-2))', border: '1px solid color-mix(in srgb, var(--bad) 25%, var(--line))', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bad)' }}>Credit outstanding</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>5 customers · 4 overdue</div>
                </div>
                <span className="mono" style={{ fontSize: 18, fontWeight: 600 }}>TZS 330K</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
