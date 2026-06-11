'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmtShort } from '../../lib/utils';
import { AnalyticsNav, AnalyticsHeader, AreaChart, MiniSpark, Donut, Spinner, rangeToParams } from './_shared';
import { analyticsApi, AnalyticsOverview } from '../../lib/api';

const PAYMENT_COLORS: Record<string, string> = {
  'M-Pesa': '#10b981', 'Cash': 'var(--accent)',
  'Tigo Pesa': '#f59e0b', 'Bank': '#60a5fa', 'Credit': '#fb7185',
};
function paymentColor(method: string, idx: number) {
  return PAYMENT_COLORS[method] ?? ['#10b981','var(--accent)','#f59e0b','#60a5fa','#fb7185'][idx % 5];
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [data, setData]   = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsApi.getOverview(rangeToParams(range)).then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, [range]);

  const chartData = data?.trend.map((t) => ({ v: t.revenue, label: t.label })) ?? [];
  const paymentSlices = data?.payment_mix.map((p, i) => ({
    label: p.method, v: p.pct, color: paymentColor(p.method, i),
  })) ?? [];
  const deltaStr = (pct: number | null) => pct === null ? null : `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;

  return (
    <AppShell crumbs={[
      { label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Analytics' },
    ]}>
      <AnalyticsHeader range={range} setRange={setRange} />
      <AnalyticsNav />

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-3)' }}>Loading analytics…</div>
        </div>
      ) : !data ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>No analytics data available</div>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
            <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '3px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>REVENUE</span>
                {deltaStr(data.kpis.revenue_delta_pct) && (
                  <span className={`pill ${(data.kpis.revenue_delta_pct ?? 0) >= 0 ? 'good' : 'bad'}`}>
                    {(data.kpis.revenue_delta_pct ?? 0) >= 0 ? Icons.arrowUpRight : Icons.arrowDownRight}
                    {deltaStr(data.kpis.revenue_delta_pct)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{fmtShort(data.kpis.revenue)}</div>
              <div style={{ height: 36 }}><MiniSpark data={chartData.map(d => d.v)} /></div>
            </div>

            <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '3px solid #10b981' }}>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>GROSS PROFIT</span>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{fmtShort(data.kpis.profit)}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{data.kpis.margin_pct.toFixed(1)}% margin</div>
            </div>

            <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '3px solid #60a5fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>TRANSACTIONS</span>
                {deltaStr(data.kpis.transaction_delta_pct) && (
                  <span className={`pill ${(data.kpis.transaction_delta_pct ?? 0) >= 0 ? 'good' : 'bad'}`}>
                    {(data.kpis.transaction_delta_pct ?? 0) >= 0 ? Icons.arrowUpRight : Icons.arrowDownRight}
                    {deltaStr(data.kpis.transaction_delta_pct)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{data.kpis.transaction_count.toLocaleString()}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>avg {fmtShort(data.kpis.avg_ticket)} / ticket</div>
            </div>

            <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '3px solid var(--warn)' }}>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>CUSTOMERS</span>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{data.kpis.customer_count.toLocaleString()}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>active in period</div>
            </div>
          </div>

          {/* Main chart + payment mix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12, marginBottom: 16 }}>
            <div className="surface">
              <div className="card-head">
                <span className="card-title">Revenue trend</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>
                  {range === '7d' ? 'last 7 days' : range === '90d' ? 'last 90 days' : range === 'ytd' ? 'year to date' : 'last 30 days'}
                </span>
              </div>
              <div style={{ padding: '8px 16px 16px' }}>
                <AreaChart data={chartData} height={240} />
              </div>
            </div>

            <div className="surface">
              <div className="card-head">
                <span className="card-title">Payment mix</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>by revenue share</span>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', gap: 18, alignItems: 'center' }}>
                {paymentSlices.length > 0 ? (
                  <>
                    <Donut slices={paymentSlices} total={100} centerLabel="SHARE" centerValue="100%" />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {data.payment_mix.map((s, i) => (
                        <div key={s.method} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, alignItems: 'center', fontSize: 12 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: paymentColor(s.method, i), display: 'inline-block' }}></span>
                          <span style={{ color: 'var(--fg-2)' }}>{s.method}</span>
                          <span className="mono" style={{ color: 'var(--fg)' }}>{s.pct.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13, width: '100%' }}>No payment data</div>
                )}
              </div>
            </div>
          </div>

          {/* Top products */}
          {data.top_products.length > 0 && (
            <div className="surface">
              <div className="card-head">
                <span className="card-title">Top products</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>by revenue</span>
              </div>
              <div className="table-scroll">
                <table className="table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="num">Qty sold</th>
                      <th className="num">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_products.map((p) => (
                      <tr key={p.product_id}>
                        <td style={{ fontSize: 13.5, fontWeight: 500 }}>{p.product_name}</td>
                        <td className="num mono" style={{ fontSize: 13 }}>{p.qty_sold}</td>
                        <td className="num mono" style={{ fontSize: 13 }}>{fmtShort(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
