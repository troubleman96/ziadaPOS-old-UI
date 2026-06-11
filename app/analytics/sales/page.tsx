'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmtShort } from '../../../lib/utils';
import { AnalyticsNav, AnalyticsHeader, AreaChart, Spinner, rangeToParams } from '../_shared';
import { analyticsApi, SalesAnalytics } from '../../../lib/api';

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SalesAnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsApi.getSales(rangeToParams(range)).then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, [range]);

  const maxHourly = data ? Math.max(...data.hourly_pattern.map(h => h.avg_revenue), 1) : 1;
  const maxDow    = data ? Math.max(...data.day_of_week.map(d => d.avg_revenue), 1) : 1;

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

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-3)' }}>Loading sales data…</div>
        </div>
      ) : !data ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>No sales data available</div>
        </div>
      ) : (
        <>
          {/* Category + DOW grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* Revenue by category */}
            <div className="surface">
              <div className="card-head"><span className="card-title">Revenue by category</span></div>
              {data.category_breakdown.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No category data.</div>
              ) : (
                <div style={{ padding: '12px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.category_breakdown.map((cat) => (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13 }}>{cat.category}</span>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          {cat.delta_pct !== null && (
                            <span className={`pill ${cat.delta_pct >= 0 ? 'good' : 'bad'}`}>
                              {cat.delta_pct >= 0 ? '↗' : '↘'} {Math.abs(cat.delta_pct).toFixed(1)}%
                            </span>
                          )}
                          <span className="mono" style={{ fontSize: 12.5 }}>{fmtShort(cat.revenue)}</span>
                        </div>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cat.pct}%`, background: 'var(--accent)', borderRadius: 3 }} />
                      </div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 3 }}>{cat.pct.toFixed(1)}% of revenue</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sales by day of week */}
            <div className="surface">
              <div className="card-head"><span className="card-title">Sales by day of week</span></div>
              {data.day_of_week.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No day-of-week data.</div>
              ) : (
                <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data.day_of_week.map((d) => (
                    <div key={d.dow} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', width: 28 }}>{d.label}</span>
                      <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(d.avg_revenue / maxDow) * 100}%`, background: 'var(--accent)', borderRadius: 4 }} />
                      </div>
                      <span className="mono" style={{ fontSize: 12, color: 'var(--fg-2)', width: 72, textAlign: 'right' }}>{fmtShort(d.avg_revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hourly heatmap */}
          <div className="surface">
            <div className="card-head">
              <span className="card-title">Hourly revenue pattern</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>Average across selected period</span>
            </div>
            {data.hourly_pattern.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No hourly data.</div>
            ) : (
              <div style={{ padding: '16px 20px 24px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  {data.hourly_pattern.map((h) => {
                    const pct = h.avg_revenue / maxHourly;
                    return (
                      <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)' }}>{fmtShort(h.avg_revenue).replace('TZS ', '')}</span>
                        <div style={{ width: '100%', height: Math.round(pct * 120) + 4, background: pct > 0.85 ? 'var(--warn)' : 'var(--accent)', borderRadius: '3px 3px 0 0', opacity: 0.75 + pct * 0.25 }} />
                        <span className="mono" style={{ fontSize: 9, color: 'var(--fg-4)' }}>{h.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
