'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmtShort } from '../../../lib/utils';
import { AnalyticsNav, AnalyticsHeader, AreaChart, Donut } from '../_shared';
import { seeded } from '../../../lib/utils';

// ── Synthetic customer data ────────────────────────────────────────────────────
const TODAY = new Date(2026, 4, 24);
const DAILY_CUSTOMERS = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(TODAY.getTime() - (89 - i) * 86400000);
  const newC   = Math.round(4  + seeded(i * 5)  * 6);
  const returning = Math.round(40 + seeded(i * 7)  * 30 + i * 0.15);
  return {
    v: returning + newC, newC, returning,
    label: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
  };
});

const TOP_CUSTOMERS = Array.from({ length: 12 }, (_, i) => {
  const names = [
    'Fatuma Ally','Hassan Bakari','Mariam Said','Juma Kifupi','Asha Mwinyi',
    'Saidi Omar','Rehema Juma','Khamis Abdalla','Zuwena Hassan','Bakari Said',
    'Amina Hamisi','Ramadhan Ally',
  ];
  const visits = Math.round(90 + seeded(i * 11) * 120);
  const spent  = Math.round((180000 + seeded(i * 13) * 300000) * (1 - i * 0.05));
  const avgTicket = Math.round(spent / visits);
  const lastSeen  = Math.round(seeded(i * 17) * 12);
  return { name: names[i], visits, spent, avgTicket, lastSeen, hue: Math.round(seeded(i * 31) * 360) };
});

const RETENTION_COHORTS = [
  { month: 'Feb', new: 92, m1: 61, m2: 48, m3: 44 },
  { month: 'Mar', new: 87, m1: 58, m2: 45, m3: 0  },
  { month: 'Apr', new: 105, m1: 70, m2: 0, m3: 0  },
  { month: 'May', new: 118, m1: 0,  m2: 0, m3: 0  },
];

const SEGMENTS = [
  { label: 'VIP (10+/mo)',  v: 18,  color: 'var(--accent)',  spend: 4200000 },
  { label: 'Regular (3+)', v: 142, color: '#10b981',         spend: 8400000 },
  { label: 'Occasional',   v: 380, color: '#f59e0b',         spend: 5100000 },
  { label: 'One-time',     v: 215, color: 'var(--fg-4)',     spend: 1800000 },
];

export default function CustomersAnalyticsPage() {
  const [range, setRange] = useState('30d');

  const chartData = useMemo(() =>
    range === '7d' ? DAILY_CUSTOMERS.slice(-7) :
    range === '90d' ? DAILY_CUSTOMERS : DAILY_CUSTOMERS.slice(-30)
  , [range]);

  const totalCustomers = chartData.reduce((s, d) => s + d.v, 0);
  const newCustomers   = chartData.reduce((s, d) => s + d.newC, 0);
  const returning      = totalCustomers - newCustomers;
  const retentionRate  = ((returning / totalCustomers) * 100).toFixed(0);

  const segTotal = SEGMENTS.reduce((s, sg) => s + sg.v, 0);

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

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'TOTAL VISITS',    value: totalCustomers.toLocaleString(), sub: 'customer visits', delta: '+12%', good: true },
          { label: 'NEW CUSTOMERS',   value: newCustomers.toLocaleString(),   sub: `${(newCustomers / chartData.length).toFixed(1)}/day`, delta: '+8%', good: true },
          { label: 'RETURNING',       value: returning.toLocaleString(),       sub: `${retentionRate}% retention`, delta: '+4%', good: true },
          { label: 'AVG VISIT VALUE', value: fmtShort(Math.round(SEGMENTS.reduce((s,sg)=>s+sg.spend,0)/totalCustomers)), sub: 'per visit', delta: '', good: false },
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

      {/* Visits chart + segments */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, marginBottom: 14 }}>
        <div className="surface">
          <div className="card-head"><span className="card-title">Customer visits over time</span></div>
          <div style={{ padding: '12px 20px 16px' }}>
            <AreaChart data={chartData.map(d => ({ v: d.v, label: d.label }))} height={200} color="#10b981" />
          </div>
        </div>

        <div className="surface">
          <div className="card-head"><span className="card-title">Customer segments</span></div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Donut slices={SEGMENTS} total={segTotal} centerLabel="CUSTOMERS" centerValue={segTotal.toString()} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SEGMENTS.map(sg => (
                <div key={sg.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: sg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, flex: 1 }}>{sg.label}</span>
                  <span className="mono" style={{ fontSize: 12 }}>{sg.v}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', width: 60, textAlign: 'right' }}>{fmtShort(sg.spend)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cohort retention + top customers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Retention cohorts */}
        <div className="surface">
          <div className="card-head"><span className="card-title">Retention by cohort</span></div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
              {['Cohort','New','M+1','M+2','M+3'].map(h => (
                <span key={h} className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>
            {RETENTION_COHORTS.map((row) => {
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
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.6 }}>
              ↗ M+1 retention improved from 66% → 67% since Feb cohort.
            </div>
          </div>
        </div>

        {/* Top customers */}
        <div className="surface">
          <div className="card-head"><span className="card-title">Top customers by spend</span></div>
          <div style={{ overflowY: 'auto', maxHeight: 320 }}>
            {TOP_CUSTOMERS.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--line)' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', width: 16 }}>{i + 1}</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `oklch(55% 0.18 ${c.hue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                  {c.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{c.visits} visits · last {c.lastSeen}d ago</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 13 }}>{fmtShort(c.spent)}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>avg {fmtShort(c.avgTicket)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
