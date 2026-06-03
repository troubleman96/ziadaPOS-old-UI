'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';
import { storesApi, StoreItem, StoreStats } from '../../lib/api';

const SPINNER = (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
  </>
);

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STORE_COLORS = ['#6366f1', '#34d399', '#fbbf24', '#fb7185', '#60a5fa', '#a78bfa'];

// Mini sparkline bar chart
function WeekBars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data.filter(v => v > 0), 1);
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
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([storesApi.getList(), storesApi.getStats()]).then(([listRes, statsRes]) => {
      setLoading(false);
      if (listRes.success) {
        const data = listRes.data as unknown as { results?: StoreItem[] } | StoreItem[];
        if (Array.isArray(data)) setStores(data);
        else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as { results: StoreItem[] }).results)) {
          setStores((data as { results: StoreItem[] }).results);
        } else {
          setStores([]);
        }
      }
      if (statsRes.success) setStats(statsRes.data);
    });
  }, []);

  const weekTotals = stores.map((s, i) => ({
    ...s,
    color: STORE_COLORS[i % STORE_COLORS.length],
    weekTotal: (s.week_data || []).reduce((a, b) => a + b, 0),
  }));
  const maxWeekTotal = Math.max(...weekTotals.map(s => s.weekTotal), 1);

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
            <span className="mono" style={{ marginLeft: 10, fontSize: 13, fontWeight: 400, color: 'var(--fg-4)', border: '1px solid var(--line-2)', padding: '2px 8px', borderRadius: 999, verticalAlign: 'middle' }}>
              {stats?.total_stores ?? stores.length}
            </span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
            All locations for your enterprise.
            {stats && (
              <span className="mono" style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span className="dot-s" style={{ background: 'var(--good)' }}></span> {stats.open_stores} open now
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost page-sec">{Icons.download} Export</button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'STORES OPEN', value: stats ? `${stats.open_count} / ${stats.total_stores}` : '—', sub: 'open stores', color: 'var(--good)' },
          { label: 'TODAY REVENUE', value: stats ? fmtShort(stats.total_revenue) : '—', sub: 'across open stores', color: 'var(--fg)' },
          { label: 'TODAY TRANSACTIONS', value: stats ? String(stats.total_txns) : '—', sub: 'cash + mobile combined', color: 'var(--fg)' },
          { label: 'STAFF ON DUTY', value: stats ? String(stats.staff_on_duty) : String(stores.reduce((s, st) => s + (st.staff_on_duty || 0), 0)), sub: 'across open locations', color: 'var(--fg)' },
        ].map((k) => (
          <div key={k.label} className="surface stat-card">
            <span className="label">{k.label}</span>
            <span className="value" style={{ color: k.color }}>{k.value}</span>
            <span className="sub">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Store cards grid */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center' }}>{SPINNER}</div>
      ) : stores.length === 0 ? (
        <div className="surface" style={{ padding: 48, textAlign: 'center', color: 'var(--fg-3)', marginBottom: 20 }}>
          <div className="mono" style={{ fontSize: 11 }}>NO STORES</div>
          <div style={{ marginTop: 6, fontSize: 14 }}>No stores found. Add your first store to get started.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-3)', gap: 14, marginBottom: 20 }}>
          {stores.map((store, idx) => {
            const color = STORE_COLORS[idx % STORE_COLORS.length];
            const isOpen = store.status === 'open';
            const weekData = store.week_data || [0, 0, 0, 0, 0, 0, 0];
            return (
              <div
                key={store.id}
                className="surface"
                style={{
                  display: 'flex', flexDirection: 'column',
                  borderColor: isOpen ? 'var(--accent-line)' : 'var(--line)',
                  background: isOpen ? 'linear-gradient(160deg, var(--accent-soft) 0%, var(--bg-2) 60%)' : 'var(--bg-2)',
                }}
              >
                {/* Card header */}
                <div className="card-head" style={{ gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: color + '22', border: '1px solid ' + color + '44',
                      display: 'grid', placeItems: 'center', color,
                    }}>
                      {Icons.store}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.name}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 1 }}>{store.region}</div>
                    </div>
                  </div>
                  <span className={'pill ' + (isOpen ? 'good' : 'warn')} style={{ flexShrink: 0 }}>
                    <span className="dot-s" style={{ background: isOpen ? 'var(--good)' : 'var(--warn)' }}></span>
                    {store.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>

                {/* Stats */}
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  {/* Status note */}
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: isOpen ? 'var(--good)' : 'var(--warn)', display: 'inline-block' }}></span>
                    {store.staff_on_duty} staff on duty
                  </div>

                  {/* KPIs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-3)', gap: 8 }}>
                    {[
                      { label: "today's rev", value: fmtShort(store.today_revenue), color: 'var(--fg)' },
                      { label: 'Transactions', value: store.today_txns.toString(), color: 'var(--fg)' },
                      { label: 'Staff', value: store.staff_count.toString(), color: 'var(--fg)' },
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
                    <WeekBars data={weekData} color={color} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      {WEEK_DAYS.map((d) => (
                        <span key={d} className="mono" style={{ fontSize: 9, color: 'var(--fg-4)', flex: 1, textAlign: 'center' }}>{d}</span>
                      ))}
                    </div>
                  </div>

                  {/* Footer meta */}
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>Manager</div>
                      <div style={{ fontSize: 13, fontWeight: 500, marginTop: 1 }}>{store.manager_name || '—'}</div>
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
            );
          })}
        </div>
      )}

      {/* Performance comparison table */}
      {!loading && stores.length > 0 && (
        <div className="surface" style={{ marginBottom: 20 }}>
          <div className="card-head">
            <span className="card-title">This week — performance comparison</span>
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
                <th>REVENUE SHARE</th>
              </tr>
            </thead>
            <tbody>
              {weekTotals.map((store) => {
                const activeDays = (store.week_data || []).filter(v => v > 0).length;
                const avgDay = activeDays > 0 ? store.weekTotal / activeDays : 0;
                const totalWeekRev = weekTotals.reduce((a, b) => a + b.weekTotal, 0);
                const sharePct = totalWeekRev > 0 ? (store.weekTotal / totalWeekRev * 100).toFixed(0) : '0';
                const isOpen = store.status === 'open';
                return (
                  <tr key={store.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: store.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{store.name}</div>
                          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{store.manager_name || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={'pill ' + (isOpen ? 'good' : 'warn')}>
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td className="num" style={{ fontWeight: 500 }}>{fmt(store.weekTotal)}</td>
                    <td className="num" style={{ color: 'var(--fg-2)' }}>{fmtShort(avgDay)}</td>
                    <td className="num" style={{ color: 'var(--fg-2)' }}>{store.today_txns.toLocaleString()}</td>
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
      )}

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
          {stores.map((s, i) => (
            <div key={s.id} style={{
              position: 'absolute',
              left: [42, 62, 30, 50][i % 4] + '%',
              top: [38, 52, 60, 45][i % 4] + '%',
              transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              zIndex: 2,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999,
                background: STORE_COLORS[i % STORE_COLORS.length], color: '#fff',
                display: 'grid', placeItems: 'center',
                fontSize: 12, fontWeight: 600,
                boxShadow: '0 2px 8px ' + STORE_COLORS[i % STORE_COLORS.length] + '44',
                border: '2px solid var(--bg-2)',
              }}>
                {s.name[0]}
              </div>
              <div style={{
                background: 'var(--bg-2)', border: '1px solid var(--line)',
                borderRadius: 5, padding: '2px 7px',
                fontSize: 10.5, fontWeight: 500, whiteSpace: 'nowrap',
              }}>
                {s.name.split(' ')[0]}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', zIndex: 1, opacity: 0.5 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-3)' }}>Map view — coming soon</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 4 }}>Interactive map with real-time store status</div>
          </div>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--line)', background: 'var(--bg-3)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {stores.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: STORE_COLORS[i % STORE_COLORS.length], display: 'inline-block' }} />
              <span style={{ fontSize: 12.5 }}>{s.name}</span>
              <span style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>· {s.region}</span>
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
