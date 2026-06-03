'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';
import { discountApi, DiscountSummary } from '../../lib/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function rangeToParams(range: string): string {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const todayStr = fmt(today);
  if (range === '7d') {
    const from = new Date(today); from.setDate(from.getDate() - 6);
    return `date_from=${fmt(from)}&date_to=${todayStr}`;
  }
  if (range === '30d') {
    const from = new Date(today); from.setDate(from.getDate() - 29);
    return `date_from=${fmt(from)}&date_to=${todayStr}`;
  }
  if (range === '90d') {
    const from = new Date(today); from.setDate(from.getDate() - 89);
    return `date_from=${fmt(from)}&date_to=${todayStr}`;
  }
  return '';
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid var(--line-2)',borderTopColor:'var(--accent)',animation:'spin 0.7s linear infinite',margin:'0 auto'}} />
    </>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
  const w = 200, h = 36;
  if (data.length < 2) return <div style={{ height: h }} />;
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DiscountsPage() {
  const [range, setRange] = useState('30d');
  const [summary, setSummary] = useState<DiscountSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    discountApi.getSummary(rangeToParams(range)).then((res) => {
      if (res.success) setSummary(res.data);
      setLoading(false);
    });
  }, [range]);

  const rateColor = summary
    ? summary.discount_rate > 20 ? 'var(--bad)' : summary.discount_rate > 10 ? 'var(--warn)' : 'var(--good)'
    : 'var(--fg-3)';

  const dailyAmounts = summary?.by_day?.map((d) => d.amount) ?? [];

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

      {loading ? (
        <div className="surface" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-3)' }}>Loading discount data…</div>
        </div>
      ) : !summary ? (
        <div className="surface" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>No discount data available</div>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>

            <div className="surface" style={{ padding: '18px 20px' }}>
              <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em', marginBottom: 8 }}>TOTAL DISCOUNTS</div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--accent)' }}>{fmtShort(summary.total_discount_amount)}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>{summary.discounted_count} transactions</div>
              <div style={{ height: 32, marginTop: 8 }}><Sparkline data={dailyAmounts} /></div>
            </div>

            <div className="surface" style={{ padding: '18px 20px' }}>
              <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em', marginBottom: 8 }}>DISCOUNT RATE</div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: rateColor }}>{summary.discount_rate.toFixed(1)}%</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>
                of {summary.total_transactions} total transactions
              </div>
              <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: 'var(--bg-3)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(summary.discount_rate, 100)}%`, background: rateColor, borderRadius: 999, transition: 'width 400ms' }} />
              </div>
            </div>

            <div className="surface" style={{ padding: '18px 20px' }}>
              <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em', marginBottom: 8 }}>AVG DISCOUNT</div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>{summary.avg_discount_pct.toFixed(1)}%</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 4 }}>{fmt(Math.round(summary.avg_discount_amount))} per sale</div>
            </div>

            <div className="surface" style={{ padding: '18px 20px' }}>
              <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em', marginBottom: 8 }}>REVENUE IMPACT</div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--bad)' }}>−{fmtShort(summary.total_discount_amount)}</div>
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
                {summary.by_cashier.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No cashier data for this period.</div>
                ) : summary.by_cashier.map((c, i) => {
                  const maxAmt = summary.by_cashier[0].amount;
                  const pct = (c.amount / maxAmt) * 100;
                  return (
                    <div key={c.cashier_name} style={{ padding: '12px 18px', borderBottom: i < summary.by_cashier.length - 1 ? '1px solid var(--line)' : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', width: 16 }}>{i + 1}</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{c.cashier_name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{c.count} txns</span>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>avg {c.avg_pct.toFixed(1)}%</span>
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

            {/* Tips */}
            <div className="surface">
              <div className="card-head">
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {Icons.sparkles} Discount insights
                </span>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  {
                    kind: summary.discount_rate > 20 ? 'warn' : 'good',
                    title: summary.discount_rate > 20 ? 'High discount rate detected' : 'Discount rate is healthy',
                    body: `Your discount rate (${summary.discount_rate.toFixed(1)}%) is ${summary.discount_rate > 20 ? 'above' : 'below'} the 20% threshold. ${summary.discount_rate > 20 ? 'Review cashier permissions to reduce discounting.' : 'Most shops start losing margin above 20%.'}`,
                  },
                  {
                    kind: 'info',
                    title: `${summary.discounted_count} discounted transactions`,
                    body: `Out of ${summary.total_transactions} total transactions, ${summary.discounted_count} had a discount applied — an average of ${fmt(Math.round(summary.avg_discount_amount))} each.`,
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
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>top by amount</span>
            </div>
            {summary.largest_discounts.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No large discounts in this period.</div>
            ) : (
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
                    {summary.largest_discounts.map((row) => (
                      <tr
                        key={row.txn_number}
                        style={{ cursor: 'pointer' }}
                        onClick={() => window.location.href = `/discounts/${encodeURIComponent(row.txn_number)}`}
                      >
                        <td>
                          <Link href={`/discounts/${encodeURIComponent(row.txn_number)}`} style={{ textDecoration: 'none' }}>
                            <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{row.txn_number}</span>
                          </Link>
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
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
