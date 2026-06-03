'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmtShort } from '../../lib/utils';
import { analyticsApi, AnalyticsOverview } from '../../lib/api';

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

// ── Charts ────────────────────────────────────────────────────────────────────
function MiniSpark({ data, color = 'var(--accent)' }: { data: number[]; color?: string }) {
  const w = 200, h = 36;
  if (data.length < 2) return <div style={{ width: '100%', height: h }} />;
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
  if (data.length < 2) return <div style={{ height }} />;
  const pad = { l: 48, r: 16, t: 16, b: 32 };
  const max = Math.max(...data.map(d => d.v)) * 1.1 || 1;
  const stepX = (w - pad.l - pad.r) / Math.max(data.length - 1, 1);
  const yScale = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b);
  const xScale = (i: number) => pad.l + i * stepX;
  const linePath = data.map((d, i) => (i === 0 ? 'M' : 'L') + xScale(i).toFixed(1) + ',' + yScale(d.v).toFixed(1)).join(' ');
  const areaPath = linePath + ` L ${xScale(data.length-1)},${h-pad.b} L ${pad.l},${h-pad.b} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(t * max));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="aFillOverview" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w-pad.r} y1={yScale(t)} y2={yScale(t)} stroke="var(--line)" strokeDasharray="2 4" />
          <text x={pad.l - 8} y={yScale(t) + 3} textAnchor="end" fontSize="11" fontWeight="500" fill="var(--fg-2)" fontFamily="var(--mono)">
            {t === 0 ? '0' : fmtShort(t).replace('TZS ', '')}
          </text>
        </g>
      ))}
      {data.map((d, i) => i % Math.ceil(data.length / 8) === 0 && (
        <text key={i} x={xScale(i)} y={h - 12} textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--fg-2)" fontFamily="var(--mono)">{d.label}</text>
      ))}
      <path d={areaPath} fill="url(#aFillOverview)" />
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
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--fg-2)" fontFamily="var(--mono)" letterSpacing="0.06em">{centerLabel}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="15" fill="var(--fg)" fontWeight="500">{centerValue}</text>
    </svg>
  );
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
export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<AnalyticsOverview | null>(null);
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
    label: p.method,
    v: p.pct,
    color: paymentColor(p.method, i),
  })) ?? [];

  const deltaStr = (pct: number | null) => pct === null ? null : pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;

  return (
    <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Analytics' }]}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Analytics</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>Performance across all metrics, powered by Ziada AI.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
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
          <button className="btn btn-ghost page-sec">{Icons.download} Export</button>
        </div>
      </div>

      <AnalyticsNav />

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-3)' }}>Loading analytics…</div>
        </div>
      ) : !data ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>No analytics data available</div>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
            <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em' }}>REVENUE</span>
                {deltaStr(data.kpis.revenue_delta_pct) && (
                  <span className={`pill ${(data.kpis.revenue_delta_pct ?? 0) >= 0 ? 'good' : 'bad'}`}>
                    {(data.kpis.revenue_delta_pct ?? 0) >= 0 ? '↗' : '↘'} {deltaStr(data.kpis.revenue_delta_pct)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>{fmtShort(data.kpis.revenue)}</div>
              <div style={{ height: 36 }}><MiniSpark data={chartData.map(d => d.v)} /></div>
            </div>
            <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em' }}>GROSS PROFIT</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>{fmtShort(data.kpis.profit)}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 2 }}>{data.kpis.margin_pct.toFixed(1)}% margin</div>
            </div>
            <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em' }}>TRANSACTIONS</span>
                {deltaStr(data.kpis.transaction_delta_pct) && (
                  <span className={`pill ${(data.kpis.transaction_delta_pct ?? 0) >= 0 ? 'good' : 'bad'}`}>
                    {(data.kpis.transaction_delta_pct ?? 0) >= 0 ? '↗' : '↘'} {deltaStr(data.kpis.transaction_delta_pct)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>{data.kpis.transaction_count.toLocaleString()}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 2 }}>avg {fmtShort(data.kpis.avg_ticket)} / ticket</div>
            </div>
            <div className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--fg-2)', letterSpacing: '0.07em' }}>CUSTOMERS</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>{data.kpis.customer_count.toLocaleString()}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 2 }}>active in period</div>
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
              <div style={{ padding: 16 }}>
                {chartData.length > 1 ? <AreaChart data={chartData} /> : (
                  <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
                    No trend data available
                  </div>
                )}
              </div>
            </div>
            <div className="surface">
              <div className="card-head">
                <span className="card-title">Payment mix</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>by revenue share</span>
              </div>
              <div className="payment-mix-layout">
                {paymentSlices.length > 0 ? (
                  <>
                    <Donut slices={paymentSlices} total={100} centerLabel="SHARE" centerValue="100%" />
                    <div style={{ flex: 1, minWidth: 120, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {data.payment_mix.map((s, i) => (
                        <div key={s.method} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, alignItems: 'center', fontSize: 12 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: paymentColor(s.method, i), display: 'inline-block', flexShrink: 0 }}></span>
                          <span style={{ color: 'var(--fg-2)' }}>{s.method}</span>
                          <span className="mono" style={{ color: 'var(--fg)' }}>{s.pct.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13, width: '100%' }}>
                    No payment data for this period
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top products */}
          {data.top_products.length > 0 && (
            <div className="surface" style={{ marginBottom: 16 }}>
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
