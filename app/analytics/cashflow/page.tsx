'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmtShort } from '../../../lib/utils';
import { AnalyticsNav, AnalyticsHeader, AreaChart } from '../_shared';
import { analyticsApi, CashflowAnalytics } from '../../../lib/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function rangeToParams(range: string): string {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmtD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const todayStr = fmtD(today);
  if (range === '7d')  { const f = new Date(today); f.setDate(f.getDate()-6);  return `date_from=${fmtD(f)}&date_to=${todayStr}`; }
  if (range === '30d') { const f = new Date(today); f.setDate(f.getDate()-29); return `date_from=${fmtD(f)}&date_to=${todayStr}`; }
  if (range === '90d') { const f = new Date(today); f.setDate(f.getDate()-89); return `date_from=${fmtD(f)}&date_to=${todayStr}`; }
  if (range === 'ytd') { const f = new Date(today.getFullYear(), 0, 1);        return `date_from=${fmtD(f)}&date_to=${todayStr}`; }
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

// ── PAYMENT COLORS ────────────────────────────────────────────────────────────
const PAYMENT_COLORS: Record<string, string> = {
  'M-Pesa': '#10b981',
  'Cash': 'var(--accent)',
  'Tigo Pesa': '#f59e0b',
  'Bank': '#60a5fa',
  'Credit': '#fb7185',
};
function paymentColor(method: string, idx: number) {
  return PAYMENT_COLORS[method] ?? ['#10b981','var(--accent)','#f59e0b','#60a5fa','#fb7185'][idx % 5];
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CashflowPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<CashflowAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsApi.getCashflow(rangeToParams(range)).then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, [range]);

  const netData    = data?.daily.map(d => ({ v: Math.max(0, d.net), label: d.label })) ?? [];
  const balData    = data?.running_balance.map(d => ({ v: d.balance, label: d.label })) ?? [];
  const maxPayment = data ? Math.max(...data.payment_inflow.map(p => p.amount), 1) : 1;

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

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-3)' }}>Loading cashflow data…</div>
        </div>
      ) : !data ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>💰</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>No cashflow data available</div>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'TOTAL INFLOW',  value: fmtShort(data.totals.inflow), sub: 'gross revenue', border: '' },
              { label: 'COST OF GOODS', value: fmtShort(data.totals.cogs),   sub: `${(data.totals.cogs / (data.totals.inflow || 1) * 100).toFixed(1)}% of inflow`, border: 'var(--bad)' },
              { label: 'OPERATING EXP', value: fmtShort(data.totals.opex),   sub: `${(data.totals.opex / (data.totals.inflow || 1) * 100).toFixed(1)}% of inflow`, border: 'var(--warn)' },
              { label: 'NET CASHFLOW',  value: fmtShort(data.totals.net),    sub: `${data.totals.net_margin_pct.toFixed(1)}% net margin`, border: 'var(--good)' },
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
                {netData.length > 1 ? (
                  <AreaChart data={netData} height={200} color="var(--good)" />
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No daily data</div>
                )}
              </div>
            </div>

            <div className="surface">
              <div className="card-head"><span className="card-title">Running balance</span></div>
              <div style={{ padding: '12px 20px 16px' }}>
                {balData.length > 1 ? (
                  <AreaChart data={balData} height={200} color="var(--accent)" />
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No balance data</div>
                )}
              </div>
            </div>
          </div>

          {/* Payment inflow + credit outstanding */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="surface">
              <div className="card-head"><span className="card-title">Inflow by payment method</span></div>
              {data.payment_inflow.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No payment data.</div>
              ) : (
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {data.payment_inflow.map((p, i) => {
                    const color = paymentColor(p.method, i);
                    return (
                      <div key={p.method}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                            <span style={{ fontSize: 13 }}>{p.method}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{p.pct.toFixed(1)}%</span>
                            <span className="mono" style={{ fontSize: 13 }}>{fmtShort(p.amount)}</span>
                          </div>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-3)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(p.amount / maxPayment) * 100}%`, background: color, borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="surface">
              <div className="card-head"><span className="card-title">Credit outstanding</span></div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: '20px', borderRadius: 10, background: 'color-mix(in srgb, var(--bad) 10%, var(--bg-2))', border: '1px solid color-mix(in srgb, var(--bad) 25%, var(--line))' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--bad)', marginBottom: 4 }}>Total credit outstanding</div>
                      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{fmtShort(data.credit_outstanding.total)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Customers with credit', value: `${data.credit_outstanding.customer_count}` },
                      { label: 'Overdue accounts',      value: `${data.credit_outstanding.overdue_count}`, color: data.credit_outstanding.overdue_count > 0 ? 'var(--bad)' : 'var(--fg)' },
                    ].map((row) => (
                      <div key={row.label} className="field-row">
                        <span className="k">{row.label}</span>
                        <span className="v mono" style={{ fontSize: 12.5, color: (row as { color?: string }).color }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily cashflow summary */}
                {data.daily.length > 0 && (
                  <div>
                    <div style={{ marginBottom: 10, fontSize: 12, fontWeight: 500, color: 'var(--fg-3)' }}>Recent daily cashflow</div>
                    {data.daily.slice(-5).reverse().map((d) => (
                      <div key={d.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{d.label}</span>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{fmtShort(d.inflow)}</span>
                          <span className="mono" style={{ fontSize: 11.5, color: d.net >= 0 ? 'var(--good)' : 'var(--bad)', fontWeight: 500 }}>
                            {d.net >= 0 ? '+' : ''}{fmtShort(d.net)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
