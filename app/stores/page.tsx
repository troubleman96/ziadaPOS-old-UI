'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';

// ── Data ─────────────────────────────────────────────────────────────────────

const STORES = [
  {
    id: 'kariakoo',
    name: 'Duka Kuu — Kariakoo',
    shortName: 'Kariakoo',
    badge: 'HQ',
    active: true,
    status: 'open',
    statusLabel: 'Open',
    statusNote: '3 tills active',
    todayRevenue: 1842000,
    todayTxns: 87,
    staffOnDuty: 4,
    period: 'Today',
    address: 'Msimbazi St, Kariakoo, Dar es Salaam',
    manager: 'Hamisi Mwakapaga',
    phone: '+255 712 345 678',
    color: '#6366f1',
    weekData: [1640000, 1720000, 1580000, 1890000, 1842000, 0, 0],
  },
  {
    id: 'kinondoni',
    name: 'Kinondoni Branch',
    shortName: 'Kinondoni',
    badge: null,
    active: false,
    status: 'open',
    statusLabel: 'Open',
    statusNote: '2 tills',
    todayRevenue: 980000,
    todayTxns: 46,
    staffOnDuty: 3,
    period: 'Today',
    address: 'Kinondoni, Dar es Salaam',
    manager: 'Amani Msongo',
    phone: '+255 713 456 789',
    color: '#34d399',
    weekData: [910000, 960000, 880000, 1020000, 980000, 0, 0],
  },
  {
    id: 'ilala',
    name: 'Ilala Outlet',
    shortName: 'Ilala',
    badge: null,
    active: false,
    status: 'closed',
    statusLabel: 'Closed',
    statusNote: 'opens 8:00 AM',
    todayRevenue: 620000,
    todayTxns: 31,
    staffOnDuty: 2,
    period: 'Yesterday',
    address: 'Ilala, Dar es Salaam',
    manager: 'Pendo Kilimba',
    phone: '+255 714 567 890',
    color: '#fbbf24',
    weekData: [580000, 610000, 640000, 595000, 620000, 0, 0],
  },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Mini sparkline bar chart
function WeekBars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data.filter(v => v > 0));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 32 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 3,
          background: v === 0 ? 'var(--bg-3)' : color,
          height: v === 0 ? 4 : Math.max(4, (v / max) * 32),
          opacity: v === 0 ? 0.4 : 0.85,
          transition: 'height 300ms',
        }} />
      ))}
    </div>
  );
}

// Performance comparison mini-spark
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(4, (value / max) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--bg-3)', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', borderRadius: 999, background: color }} />
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', minWidth: 72, textAlign: 'right' }}>{fmtShort(value)}</span>
    </div>
  );
}

export default function StoresPage() {
  const [addOpen, setAddOpen] = useState(false);

  const totalRevenue = STORES.reduce((s, st) => s + (st.status === 'open' ? st.todayRevenue : 0), 0);
  const totalTxns = STORES.reduce((s, st) => s + (st.status === 'open' ? st.todayTxns : 0), 0);
  const maxRevenue = Math.max(...STORES.map(s => s.todayRevenue));

  // This-week totals per store (sum of non-zero days)
  const weekTotals = STORES.map(s => ({ ...s, weekTotal: s.weekData.reduce((a, b) => a + b, 0) }));
  const maxWeekTotal = Math.max(...weekTotals.map(s => s.weekTotal));

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Stores' }]}
      actions={
        <button className="btn btn-primary" onClick={() => setAddOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.plus} Add store
        </button>
      }
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>
            Stores
            <span className="mono" style={{ marginLeft: 10, fontSize: 13, fontWeight: 400, color: 'var(--fg-4)', border: '1px solid var(--line-2)', padding: '2px 8px', borderRadius: 999, verticalAlign: 'middle' }}>3</span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
            All locations for Duka Kuu enterprise.
            <span className="mono" style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="dot-s" style={{ background: 'var(--good)' }}></span> 2 open now
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost page-sec">{Icons.download} Export</button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'STORES OPEN', value: '2 / 3', sub: '1 closed · 0 paused', color: 'var(--good)' },
          { label: 'TODAY REVENUE', value: fmtShort(totalRevenue), sub: 'across open stores', color: 'var(--fg)' },
          { label: 'TODAY TRANSACTIONS', value: totalTxns.toString(), sub: 'cash + mobile combined', color: 'var(--fg)' },
          { label: 'STAFF ON DUTY', value: '7', sub: 'across 2 open locations', color: 'var(--fg)' },
        ].map((k) => (
          <div key={k.label} className="surface stat-card">
            <span className="label">{k.label}</span>
            <span className="value" style={{ color: k.color }}>{k.value}</span>
            <span className="sub">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Store cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-3)', gap: 14, marginBottom: 20 }}>
        {STORES.map((store) => (
          <div
            key={store.id}
            className="surface"
            style={{
              display: 'flex', flexDirection: 'column',
              borderColor: store.active ? 'var(--accent-line)' : 'var(--line)',
              background: store.active ? 'linear-gradient(160deg, var(--accent-soft) 0%, var(--bg-2) 60%)' : 'var(--bg-2)',
            }}
          >
            {/* Card header */}
            <div className="card-head" style={{ gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                  background: store.color + '22', border: '1px solid ' + store.color + '44',
                  display: 'grid', placeItems: 'center', color: store.color,
                }}>
                  {Icons.store}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.name}</span>
                    {store.badge && (
                      <span className="mono" style={{ fontSize: 9.5, background: 'var(--accent)', color: '#fff', padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>{store.badge}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 1 }}>{store.address}</div>
                </div>
              </div>
              <span className={'pill ' + (store.status === 'open' ? 'good' : 'warn')} style={{ flexShrink: 0 }}>
                <span className="dot-s" style={{ background: store.status === 'open' ? 'var(--good)' : 'var(--warn)' }}></span>
                {store.statusLabel}
              </span>
            </div>

            {/* Stats */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {/* Till/status note */}
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: store.status === 'open' ? 'var(--good)' : 'var(--warn)', display: 'inline-block' }}></span>
                {store.statusNote}
              </div>

              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-3)', gap: 8 }}>
                {[
                  { label: store.period + ' rev', value: fmtShort(store.todayRevenue), color: 'var(--fg)' },
                  { label: 'Transactions', value: store.todayTxns.toString(), color: 'var(--fg)' },
                  { label: 'Staff', value: store.staffOnDuty.toString(), color: 'var(--fg)' },
                ].map((stat) => (
                  <div key={stat.label} style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '10px 10px 8px' }}>
                    <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 4 }}>{stat.label.toUpperCase()}</div>
                    <div className="mono" style={{ fontSize: 15, fontWeight: 500, color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Week sparkline */}
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginBottom: 6, letterSpacing: '0.06em' }}>THIS WEEK</div>
                <WeekBars data={store.weekData} color={store.color} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  {WEEK_DAYS.map((d, i) => (
                    <span key={d} className="mono" style={{ fontSize: 9, color: 'var(--fg-4)', flex: 1, textAlign: 'center' }}>{d}</span>
                  ))}
                </div>
              </div>

              {/* Footer meta */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>Manager</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 1 }}>{store.manager}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link href={`/stores/${store.id}`}>
                    <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>View</button>
                  </Link>
                  <Link href={`/stores/${store.id}`}>
                    <button className="icon-btn" style={{ width: 28, height: 28 }}>{Icons.edit}</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance comparison table */}
      <div className="surface" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <span className="card-title">This week — performance comparison</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>Mon 19 – Fri 23 May 2026</span>
        </div>
        <div className="table-scroll">
        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>STORE</th>
              <th>STATUS</th>
              <th className="num">WK REVENUE</th>
              <th className="num">AVG / DAY</th>
              <th className="num">TRANSACTIONS</th>
              <th className="num">AVG TICKET</th>
              <th>REVENUE SHARE</th>
            </tr>
          </thead>
          <tbody>
            {weekTotals.map((store) => {
              const activeDays = store.weekData.filter(v => v > 0).length;
              const avgDay = activeDays > 0 ? store.weekTotal / activeDays : 0;
              const estTxns = Math.round(store.todayTxns * activeDays);
              const avgTicket = estTxns > 0 ? store.weekTotal / estTxns : 0;
              const sharePct = maxWeekTotal > 0 ? (store.weekTotal / weekTotals.reduce((a, b) => a + b.weekTotal, 0) * 100).toFixed(0) : '0';
              return (
                <tr key={store.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: store.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{store.shortName}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{store.manager}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={'pill ' + (store.status === 'open' ? 'good' : 'warn')}>
                      {store.statusLabel}
                    </span>
                  </td>
                  <td className="num" style={{ fontWeight: 500 }}>{fmt(store.weekTotal)}</td>
                  <td className="num" style={{ color: 'var(--fg-2)' }}>{fmtShort(avgDay)}</td>
                  <td className="num" style={{ color: 'var(--fg-2)' }}>{estTxns.toLocaleString()}</td>
                  <td className="num" style={{ color: 'var(--fg-2)' }}>{fmtShort(avgTicket)}</td>
                  <td style={{ minWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <MiniBar value={store.weekTotal} max={maxWeekTotal} color={store.color} />
                      <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>{sharePct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--line)', background: 'var(--bg-3)', display: 'flex', justifyContent: 'space-between' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Combined weekly revenue</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', fontWeight: 500 }}>
            {fmt(weekTotals.reduce((a, b) => a + b.weekTotal, 0))}
          </span>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="surface" style={{ overflow: 'hidden' }}>
        <div className="card-head">
          <span className="card-title">Store locations</span>
          <span className="pill">Coming soon</span>
        </div>
        <div style={{
          height: 200,
          background: 'repeating-linear-gradient(0deg, var(--bg-3) 0px, var(--bg-3) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, var(--bg-3) 0px, var(--bg-3) 1px, transparent 1px, transparent 40px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          position: 'relative',
        }}>
          {/* Store pins */}
          {STORES.map((s, i) => (
            <div key={s.id} style={{
              position: 'absolute',
              left: [42, 62, 30][i] + '%',
              top: [38, 52, 60][i] + '%',
              transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              zIndex: 2,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999,
                background: s.color, color: '#fff',
                display: 'grid', placeItems: 'center',
                fontSize: 12, fontWeight: 600,
                boxShadow: '0 2px 8px ' + s.color + '44',
                border: '2px solid var(--bg-2)',
              }}>
                {s.shortName[0]}
              </div>
              <div style={{
                background: 'var(--bg-2)', border: '1px solid var(--line)',
                borderRadius: 5, padding: '2px 7px',
                fontSize: 10.5, fontWeight: 500, whiteSpace: 'nowrap',
              }}>
                {s.shortName}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', zIndex: 1, opacity: 0.5 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-3)' }}>Map view — coming soon</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 4 }}>Interactive map with real-time store status</div>
          </div>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--line)', background: 'var(--bg-3)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {STORES.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: 'inline-block' }} />
              <span style={{ fontSize: 12.5 }}>{s.shortName}</span>
              <span style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>· {s.address}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add store modal overlay (minimal) */}
      {addOpen && (
        <div className="drawer-overlay" onClick={() => setAddOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()} style={{ width: 400 }}>
            <div className="drawer-head">
              <span style={{ fontWeight: 500 }}>Add new store</span>
              <button className="icon-btn" onClick={() => setAddOpen(false)}>{Icons.close}</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Store name', placeholder: 'e.g. Temeke Branch' },
                { label: 'Address', placeholder: 'Full address' },
                { label: 'Manager name', placeholder: 'Full name' },
                { label: 'Phone number', placeholder: '+255 7XX XXX XXX' },
              ].map((field) => (
                <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{field.label}</label>
                  <input
                    placeholder={field.placeholder}
                    style={{
                      padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)',
                      background: 'var(--bg-3)', color: 'var(--fg)', fontSize: 13.5,
                      outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-primary" style={{ flex: 1 }}>Create store</button>
                <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
