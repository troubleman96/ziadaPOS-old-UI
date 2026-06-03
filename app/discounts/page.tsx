'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';

// ── Mock data (replace with API call in Phase 3) ───────────────────────────────
const SUMMARY = {
  total_discount_amount: 284_600,
  discounted_count: 47,
  total_transactions: 340,
  discount_rate: 13.8,
  avg_discount_pct: 6.2,
  avg_discount_amount: 6_055,
};

const BY_CASHIER = [
  { cashier_name: 'Amina Hassan',   amount: 98_200, count: 18, avg_pct: 7.1 },
  { cashier_name: 'Juma Kipanga',   amount: 76_400, count: 14, avg_pct: 5.8 },
  { cashier_name: 'Fatuma Ally',    amount: 62_000, count: 9,  avg_pct: 6.4 },
  { cashier_name: 'Baraka Mwenda',  amount: 48_000, count: 6,  avg_pct: 4.9 },
];

const LARGEST = [
  { txn_number: 'TXN-2041', customer_name: 'Juma K.',   discount_amount: 28_500, discount_pct: 10, total: 256_500, created_at: '2026-05-24' },
  { txn_number: 'TXN-2036', customer_name: 'Asha M.',   discount_amount: 22_000, discount_pct: 15, total: 124_800, created_at: '2026-05-23' },
  { txn_number: 'TXN-2031', customer_name: 'Walk-in',   discount_amount: 18_200, discount_pct: 5,  total: 346_200, created_at: '2026-05-22' },
  { txn_number: 'TXN-2028', customer_name: 'Fatuma A.', discount_amount: 14_600, discount_pct: 8,  total: 167_800, created_at: '2026-05-21' },
  { txn_number: 'TXN-2020', customer_name: 'Walk-in',   discount_amount: 12_400, discount_pct: 5,  total: 236_400, created_at: '2026-05-20' },
];

// Sparkline for daily trend
const DAILY_TREND = [12000,8000,0,18000,6000,22000,14000,9000,28500,11000,16000,0,20000,8000,18200,14600,10000,22000,0,16000,12400,8800,24000,14000,0,18000,12000,26000,20000,18000];

function Sparkline({ data }: { data: number[] }) {
  const w = 200, h = 36;
  const max = Math.max(...data) || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * (h - 4) - 2;
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <path d={d + ` L ${w},${h} L 0,${h} Z`} fill="var(--accent)" opacity="0.1" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function DiscountsPage() {
  const [range, setRange] = useState('30d');

  const discountRate = SUMMARY.discount_rate;
  const rateColor = discountRate > 20 ? 'var(--bad)' : discountRate > 10 ? 'var(--warn)' : 'var(--good)';

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Discounts' }]}
      actions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden', background: 'var(--bg-2)' }}>
            {[['7d','7D'],['30d','30D'],['90d','90D']].map(([k,l]) => (
              <button key={k} onClick={() => setRange(k)} style={{
                padding: '6px 12px', fontSize: 12.5, border: 0,
                borderRight: '1px solid var(--line)',
                background: range === k ? 'var(--bg-3)' : 'transparent',
                color: range === k ? 'var(--fg)' : 'var(--fg-3)', cursor: 'pointer',
              }}>{l}</button>
            ))}
          </div>
          <button className="btn btn-ghost">{Icons.download} Export</button>
        </div>
      }
    >
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Discounts</h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)' }}>
          Track every discount given, who gave it, and its impact on revenue.
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>

        <div className="surface" style={{ padding: '18px 20px' }}>
          <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em', marginBottom: 8 }}>TOTAL DISCOUNTS</div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--accent)' }}>{fmtShort(SUMMARY.total_discount_amount)}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>{SUMMARY.discounted_count} transactions</div>
          <div style={{ height: 32, marginTop: 8 }}><Sparkline data={DAILY_TREND} /></div>
        </div>

        <div className="surface" style={{ padding: '18px 20px' }}>
          <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em', marginBottom: 8 }}>DISCOUNT RATE</div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: rateColor }}>{SUMMARY.discount_rate}%</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>
            of {SUMMARY.total_transactions} total transactions
          </div>
          <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: 'var(--bg-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(SUMMARY.discount_rate, 100)}%`, background: rateColor, borderRadius: 999, transition: 'width 400ms' }} />
          </div>
        </div>

        <div className="surface" style={{ padding: '18px 20px' }}>
          <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em', marginBottom: 8 }}>AVG DISCOUNT</div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>{SUMMARY.avg_discount_pct}%</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>{fmt(SUMMARY.avg_discount_amount)} per sale</div>
        </div>

        <div className="surface" style={{ padding: '18px 20px' }}>
          <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em', marginBottom: 8 }}>REVENUE IMPACT</div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--bad)' }}>−{fmtShort(SUMMARY.total_discount_amount)}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>gross revenue foregone</div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12, marginBottom: 16 }}>

        {/* Cashier breakdown */}
        <div className="surface">
          <div className="card-head">
            <span className="card-title">Discounts by cashier</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>ranked by amount</span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            {BY_CASHIER.map((c, i) => {
              const maxAmt = BY_CASHIER[0].amount;
              const pct = (c.amount / maxAmt) * 100;
              return (
                <div key={c.cashier_name} style={{ padding: '12px 18px', borderBottom: i < BY_CASHIER.length - 1 ? '1px solid var(--line)' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', width: 16 }}>{i + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{c.cashier_name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{c.count} txns</span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>avg {c.avg_pct}%</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>{fmtShort(c.amount)}</span>
                    </div>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: 'var(--bg-3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', opacity: 0.6, borderRadius: 999 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips for owner */}
        <div className="surface">
          <div className="card-head">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {Icons.sparkles} Discount insights
            </span>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                kind: 'warn',
                title: 'High discount rate for Amina Hassan',
                body: 'Amina has given 18 discounts totalling TZS 98,200 this month — 38% of all discounts. Consider reviewing her discount permissions.',
              },
              {
                kind: 'info',
                title: 'Discounts peak on weekends',
                body: 'Saturday and Sunday account for 60% of all discounts. Walk-in customers tend to negotiate more on weekends.',
              },
              {
                kind: 'good',
                title: 'Discount rate is healthy',
                body: `Your discount rate (${SUMMARY.discount_rate}%) is below the 20% threshold. Most shops start losing margin above 20%.`,
              },
            ].map((ins, i) => {
              const color = ins.kind === 'good' ? 'var(--good)' : ins.kind === 'warn' ? 'var(--warn)' : 'var(--info)';
              return (
                <div key={i} style={{ padding: '12px 14px', borderRadius: 8, border: `1px solid ${color}33`, background: `${color}08`, display: 'flex', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 999, background: color, flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 2 }}>{ins.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5 }}>{ins.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Largest discounts table */}
      <div className="surface">
        <div className="card-head">
          <span className="card-title">Largest discounts</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>top 5 by amount</span>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>TRANSACTION</th>
                <th>CUSTOMER</th>
                <th className="num">DISCOUNT %</th>
                <th className="num">DISCOUNT AMT</th>
                <th className="num">SALE TOTAL</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {LARGEST.map((row) => (
                <tr key={row.txn_number}>
                  <td>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{row.txn_number}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>{row.customer_name}</td>
                  <td className="num">
                    <span className="pill warn" style={{ fontSize: 10.5 }}>{row.discount_pct}%</span>
                  </td>
                  <td className="num">
                    <span className="mono" style={{ color: 'var(--bad)', fontWeight: 500 }}>−{fmt(row.discount_amount)}</span>
                  </td>
                  <td className="num">
                    <span className="mono">{fmt(row.total)}</span>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{row.created_at}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
