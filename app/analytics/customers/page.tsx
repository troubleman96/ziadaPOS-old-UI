'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmtShort } from '../../../lib/utils';
import { AnalyticsNav, AnalyticsHeader, AreaChart, Donut } from '../_shared';
import { analyticsApi, CustomerAnalytics } from '../../../lib/api';

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

// ── SEGMENT COLORS ─────────────────────────────────────────────────────────────
const SEG_COLORS = ['var(--accent)', '#10b981', '#f59e0b', 'var(--fg-4)', '#60a5fa', '#fb7185'];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CustomersAnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsApi.getCustomers(rangeToParams(range)).then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, [range]);

  const totalVisits = data?.daily_visits.reduce((s, d) => s + d.total, 0) ?? 0;
  const newCustomers = data?.daily_visits.reduce((s, d) => s + d.new_customers, 0) ?? 0;
  const returning = totalVisits - newCustomers;
  const retentionRate = totalVisits > 0 ? ((returning / totalVisits) * 100).toFixed(0) : '0';

  const chartData = data?.daily_visits.map((d) => ({ v: d.total, label: d.label })) ?? [];

  const segTotal = data?.segments.reduce((s, sg) => s + sg.count, 0) ?? 0;
  const segSlices = data?.segments.map((sg, i) => ({
    label: sg.segment,
    v: sg.count,
    color: SEG_COLORS[i % SEG_COLORS.length],
  })) ?? [];

  return (
    <AppShell crumbs={[
      { label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' },
      { label: 'Analytics', href: '/analytics' }, { label: 'Customers' },
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
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-3)' }}>Loading customer analytics…</div>
        </div>
      ) : !data ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>No customer data available</div>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'TOTAL VISITS',    value: totalVisits.toLocaleString(), sub: 'customer visits' },
              { label: 'NEW CUSTOMERS',   value: newCustomers.toLocaleString(), sub: `${data.daily_visits.length > 0 ? (newCustomers / data.daily_visits.length).toFixed(1) : '0'}/day` },
              { label: 'RETURNING',       value: returning.toLocaleString(), sub: `${retentionRate}% retention` },
              { label: 'SEGMENTS',        value: `${data.segments.length}`, sub: 'customer segments tracked' },
            ].map((k) => (
              <div key={k.label} className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>{k.label}</span>
                <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>{k.value}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Visits chart + segments */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, marginBottom: 14 }}>
            <div className="surface">
              <div className="card-head"><span className="card-title">Customer visits over time</span></div>
              <div style={{ padding: '12px 20px 16px' }}>
                {chartData.length > 1 ? (
                  <AreaChart data={chartData} height={200} color="#10b981" />
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No visit data available</div>
                )}
              </div>
            </div>

            <div className="surface">
              <div className="card-head"><span className="card-title">Customer segments</span></div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {segSlices.length > 0 && segTotal > 0 ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Donut slices={segSlices} total={segTotal} centerLabel="CUSTOMERS" centerValue={segTotal.toString()} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {data.segments.map((sg, i) => (
                        <div key={sg.segment} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEG_COLORS[i % SEG_COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 12.5, flex: 1 }}>{sg.segment}</span>
                          <span className="mono" style={{ fontSize: 12 }}>{sg.count}</span>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', width: 60, textAlign: 'right' }}>{fmtShort(sg.spend)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No segment data</div>
                )}
              </div>
            </div>
          </div>

          {/* Cohort retention + top customers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Retention cohorts */}
            <div className="surface">
              <div className="card-head"><span className="card-title">Retention by cohort</span></div>
              {data.retention_cohorts.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No cohort data.</div>
              ) : (
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
                    {['Cohort','New','M+1','M+2','M+3'].map(h => (
                      <span key={h} className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>{h}</span>
                    ))}
                  </div>
                  {data.retention_cohorts.map((row) => {
                    const cells = [row.new, row.m1, row.m2, row.m3];
                    return (
                      <div key={row.month} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                        <span className="mono" style={{ fontSize: 12.5 }}>{row.month}</span>
                        {cells.map((v, ci) => {
                          if (v === 0 && ci > 0) return <span key={ci} style={{ fontSize: 11, color: 'var(--fg-4)' }}>—</span>;
                          const pct = ci === 0 ? 100 : Math.round(v / row.new * 100);
                          const bg  = pct > 60 ? 'var(--good)' : pct > 40 ? 'var(--warn)' : pct > 0 ? 'var(--bad)' : 'var(--bg-3)';
                          return (
                            <div key={ci} style={{ padding: '4px 8px', borderRadius: 5, background: `color-mix(in srgb, ${bg} 20%, var(--bg-3))`, textAlign: 'center' }}>
                              <span className="mono" style={{ fontSize: 12.5, color: bg }}>{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top customers */}
            <div className="surface">
              <div className="card-head"><span className="card-title">Top customers by spend</span></div>
              {data.top_customers.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No customer data.</div>
              ) : (
                <div style={{ overflowY: 'auto', maxHeight: 320 }}>
                  {data.top_customers.map((c, i) => (
                    <div key={c.customer_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--line)' }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', width: 16 }}>{i + 1}</span>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                        {c.customer_name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.customer_name}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{c.txn_count} visits · {c.segment}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="mono" style={{ fontSize: 13 }}>{fmtShort(c.total_spent)}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>avg {fmtShort(c.avg_ticket)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
