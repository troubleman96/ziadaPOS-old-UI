'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtShort } from '../../../lib/utils';
import { storesApi, StoreDetail } from '../../../lib/api';

const SPINNER = (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
  </>
);

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STORE_COLORS = ['#6366f1', '#34d399', '#fbbf24', '#fb7185', '#60a5fa', '#a78bfa'];

// ── Mini sparkline ────────────────────────────────────────────────────────────
function WeekBars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data.filter((v) => v > 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 56 }}>
        {data.map((v, i) => (
          <div
            key={i}
            title={v > 0 ? fmtShort(v) : '—'}
            style={{
              flex: 1, borderRadius: '4px 4px 0 0',
              background: v === 0 ? 'var(--bg-3)' : color,
              height: v === 0 ? 4 : Math.max(6, (v / max) * 56),
              opacity: v === 0 ? 0.4 : i === data.filter((d) => d > 0).length - 1 ? 1 : 0.7,
              transition: 'height 300ms',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {WEEK_DAYS.map((d) => (
          <div key={d} style={{ flex: 1, textAlign: 'center' }}>
            <span className="mono" style={{ fontSize: 9, color: 'var(--fg-4)' }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StoreDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [store, setStore] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<'overview' | 'staff' | 'edit'>('overview');
  const [saved, setSaved] = useState(false);
  const [editValues, setEditValues] = useState({
    name: '', address: '', manager: '', phone: '', email: '', openHours: '',
  });

  useEffect(() => {
    setLoading(true);
    storesApi.getDetail(id).then((res) => {
      setLoading(false);
      if (res.success) {
        setStore(res.data);
        setEditValues({
          name: res.data.name ?? '',
          address: res.data.address ?? '',
          manager: res.data.manager_name ?? '',
          phone: res.data.phone ?? '',
          email: '',
          openHours: '',
        });
      } else {
        setError(true);
      }
    });
  }, [id]);

  if (loading) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Stores', href: '/stores' }, { label: '…' }]}>
        <div style={{ padding: 80, textAlign: 'center' }}>{SPINNER}</div>
      </AppShell>
    );
  }

  if (error || !store) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Stores', href: '/stores' }, { label: 'Not found' }]}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Store not found</div>
          <p style={{ color: 'var(--fg-3)', marginBottom: 24 }}>No store with ID &ldquo;{id}&rdquo; exists.</p>
          <Link href="/stores" className="btn btn-primary">← Back to Stores</Link>
        </div>
      </AppShell>
    );
  }

  const storeColor = STORE_COLORS[0]; // use accent color since we don't have it in API
  const weekData = store.week_data || [0, 0, 0, 0, 0, 0, 0];
  const weekBreakdown = store.week_breakdown || [];
  const staffRoster = store.staff_roster || [];
  const weekTotal = weekData.reduce((a, b) => a + b, 0);
  const activeDays = weekData.filter((v) => v > 0).length;
  const avgDay = activeDays > 0 ? weekTotal / activeDays : 0;
  const isOpen = store.status === 'open';

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AppShell
      crumbs={[
        { label: 'ziada', href: '/' },
        { label: 'Stores', href: '/stores' },
        { label: store.name },
      ]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icons.download} Export
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setTab('edit')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {Icons.edit} Edit store
          </button>
        </div>
      }
    >
      {/* Back link */}
      <Link href="/stores" className="back-link" style={{ marginBottom: 16, display: 'inline-flex' }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All stores
      </Link>

      {/* Store hero */}
      <div className="surface" style={{ padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12, flexShrink: 0,
          background: storeColor + '22', border: '2px solid ' + storeColor + '44',
          display: 'grid', placeItems: 'center', color: storeColor, fontSize: 24,
        }}>
          {Icons.store}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>{store.name}</h1>
            <span className={`pill ${isOpen ? 'good' : 'warn'}`}>
              <span className="dot-s" style={{ background: isOpen ? 'var(--good)' : 'var(--warn)' }}></span>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {store.address && (
              <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5z"/><circle cx="8" cy="6" r="1.5"/></g></svg>
                {store.address}
              </span>
            )}
            {store.phone && (
              <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3a1.5 1.5 0 0 1 1.5-1.5h1l1.5 3.5-1.5 1A9 9 0 0 0 10 10l1-1.5 3.5 1.5v1A1.5 1.5 0 0 1 13 12.5C7 12.5 3 8.5 3 3z"/></g></svg>
                {store.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface stat-card">
          <span className="label">TODAY REVENUE</span>
          <span className="value">{fmtShort(store.today_revenue)}</span>
          <span className="sub">{store.today_txns} transactions</span>
        </div>
        <div className="surface stat-card">
          <span className="label">TRANSACTIONS</span>
          <span className="value">{store.today_txns}</span>
          <span className="sub">cash + mobile</span>
        </div>
        <div className="surface stat-card">
          <span className="label">STAFF ON DUTY</span>
          <span className="value" style={{ color: isOpen ? 'var(--good)' : 'var(--fg-3)' }}>
            {store.staff_on_duty}
          </span>
          <span className="sub">of {staffRoster.length || store.staff_count} assigned</span>
        </div>
        <div className="surface stat-card">
          <span className="label">WEEK TOTAL</span>
          <span className="value">{fmtShort(weekTotal)}</span>
          <span className="sub">avg {fmtShort(avgDay)} / day</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['overview', 'staff', 'edit'] as const).map((t) => (
          <button
            key={t}
            className={`tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'edit' ? 'Edit store' : t === 'staff' ? `Staff (${staffRoster.length || store.staff_count})` : 'Overview'}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="detail-grid">
          {/* Left: charts + performance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Weekly chart */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">This week — daily revenue</span>
              </div>
              <div style={{ padding: '20px 24px 16px' }}>
                <WeekBars data={weekData} color={storeColor} />
              </div>
              <div style={{
                padding: '10px 16px', borderTop: '1px solid var(--line)',
                display: 'flex', justifyContent: 'space-between', background: 'var(--bg-3)',
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Weekly total</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', fontWeight: 500 }}>{fmt(weekTotal)}</span>
              </div>
            </div>

            {/* Daily stats */}
            {weekBreakdown.length > 0 ? (
              <div className="surface" style={{ overflow: 'hidden' }}>
                <div className="card-head">
                  <span className="card-title">Daily performance</span>
                </div>
                <div className="table-scroll">
                  <table className="table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th className="num">Revenue</th>
                        <th className="num">Transactions</th>
                        <th className="num">vs Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weekBreakdown.map((day) => {
                        const diff = avgDay > 0 ? ((day.revenue - avgDay) / avgDay) * 100 : 0;
                        return (
                          <tr key={day.date} style={{ opacity: day.revenue === 0 ? 0.4 : 1 }}>
                            <td>{new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                            <td className="num mono" style={{ fontSize: 13 }}>
                              {day.revenue > 0 ? fmtShort(day.revenue) : '—'}
                            </td>
                            <td className="num mono" style={{ fontSize: 13 }}>
                              {day.txn_count > 0 ? day.txn_count : '—'}
                            </td>
                            <td className="num">
                              {day.revenue > 0 ? (
                                <span className="mono" style={{ fontSize: 11.5, color: diff >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                                  {diff >= 0 ? '+' : ''}{diff.toFixed(0)}%
                                </span>
                              ) : (
                                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="surface" style={{ overflow: 'hidden' }}>
                <div className="card-head">
                  <span className="card-title">Daily performance</span>
                </div>
                <div className="table-scroll">
                  <table className="table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th className="num">Revenue</th>
                        <th className="num">vs Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {WEEK_DAYS.map((day, i) => {
                        const v = weekData[i];
                        const diff = avgDay > 0 ? ((v - avgDay) / avgDay) * 100 : 0;
                        return (
                          <tr key={day} style={{ opacity: v === 0 ? 0.4 : 1 }}>
                            <td>{day}</td>
                            <td className="num mono" style={{ fontSize: 13 }}>
                              {v > 0 ? fmtShort(v) : '—'}
                            </td>
                            <td className="num">
                              {v > 0 ? (
                                <span className="mono" style={{ fontSize: 11.5, color: diff >= 0 ? 'var(--good)' : 'var(--bad)' }}>
                                  {diff >= 0 ? '+' : ''}{diff.toFixed(0)}%
                                </span>
                              ) : (
                                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Store details */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Store details</span>
                <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setTab('edit')}>{Icons.edit}</button>
              </div>
              <div style={{ padding: '4px 16px 8px' }}>
                {[
                  { k: 'Address',   v: store.address || '—' },
                  { k: 'Manager',   v: store.manager_name || '—' },
                  { k: 'Phone',     v: store.phone || '—' },
                  { k: 'Region',    v: store.region },
                  { k: 'Status',    v: isOpen ? 'Open' : 'Closed' },
                  { k: 'Staff',     v: `${store.staff_count} assigned` },
                ].map((row) => (
                  <div key={row.k} className="field-row">
                    <span className="k">{row.k}</span>
                    <span className="v mono" style={{ fontSize: 11.5, textAlign: 'right', maxWidth: 160, wordBreak: 'break-word' }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="surface" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="card-title" style={{ marginBottom: 6 }}>Quick actions</div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Open POS for this store
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                {Icons.reports} View reports
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                {Icons.download} Export transactions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAFF TAB ─────────────────────────────────────────────────────────── */}
      {tab === 'staff' && (
        <div className="surface" style={{ overflow: 'hidden' }}>
          <div className="card-head">
            <span className="card-title">Staff roster — {store.name}</span>
            <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 12 }}>
              {Icons.plus} Add staff
            </button>
          </div>
          {staffRoster.length === 0 ? (
            <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
              No staff roster available.
            </div>
          ) : (
            staffRoster.map((s, i) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                borderBottom: i < staffRoster.length - 1 ? '1px solid var(--line)' : 'none',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 999, flexShrink: 0,
                  background: s.on_duty ? storeColor + '22' : 'var(--bg-3)',
                  border: '1px solid ' + (s.on_duty ? storeColor + '44' : 'var(--line)'),
                  display: 'grid', placeItems: 'center',
                  fontSize: 13, fontWeight: 600,
                  color: s.on_duty ? storeColor : 'var(--fg-4)',
                }}>
                  {s.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{s.role}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`pill ${s.on_duty ? 'good' : ''}`} style={{ marginBottom: 4, display: 'block' }}>
                    {s.on_duty ? 'On duty' : 'Off duty'}
                  </span>
                  {s.phone && (
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{s.phone}</div>
                  )}
                </div>
                <button className="icon-btn" style={{ width: 28, height: 28 }}>{Icons.edit}</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── EDIT TAB ──────────────────────────────────────────────────────────── */}
      {tab === 'edit' && (
        <div className="detail-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {saved && (
              <div style={{
                padding: '12px 16px', borderRadius: 8,
                background: 'var(--good-soft)', border: '1px solid rgba(52,211,153,0.3)',
                display: 'flex', alignItems: 'center', gap: 10,
                color: 'var(--good)', fontSize: 13.5,
              }}>
                {Icons.check} Changes saved successfully
              </div>
            )}

            {/* Basic info */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Basic information</span>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Store name</label>
                  <input
                    className="form-input"
                    value={editValues.name}
                    onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    className="form-input"
                    value={editValues.address}
                    onChange={(e) => setEditValues((v) => ({ ...v, address: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-2)', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Phone number</label>
                    <input
                      className="form-input"
                      value={editValues.phone}
                      onChange={(e) => setEditValues((v) => ({ ...v, phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      value={editValues.email}
                      onChange={(e) => setEditValues((v) => ({ ...v, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Opening hours</label>
                  <input
                    className="form-input"
                    value={editValues.openHours}
                    onChange={(e) => setEditValues((v) => ({ ...v, openHours: e.target.value }))}
                    placeholder="e.g. 7:00 AM – 9:00 PM"
                  />
                </div>
              </div>
            </div>

            {/* Manager */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Store manager</span>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Manager name</label>
                  <input
                    className="form-input"
                    value={editValues.manager}
                    onChange={(e) => setEditValues((v) => ({ ...v, manager: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="surface" style={{ overflow: 'hidden', borderColor: 'rgba(251,113,133,0.3)' }}>
              <div className="card-head" style={{ borderColor: 'rgba(251,113,133,0.2)' }}>
                <span className="card-title" style={{ color: 'var(--bad)' }}>Danger zone</span>
              </div>
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 3 }}>Deactivate store</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>
                    Pauses all POS activity for this location. Staff data is preserved.
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ color: 'var(--bad)', borderColor: 'rgba(251,113,133,0.3)', whiteSpace: 'nowrap' }}>
                  Deactivate
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>
                {Icons.check} Save changes
              </button>
              <button className="btn btn-ghost" onClick={() => setTab('overview')}>Cancel</button>
            </div>
          </div>

          {/* Right: info panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Current values</span>
              </div>
              <div style={{ padding: '4px 16px 8px' }}>
                {[
                  { k: 'Store ID',  v: store.id },
                  { k: 'Status',    v: isOpen ? 'Open' : 'Closed' },
                  { k: 'Staff',     v: `${store.staff_count} assigned` },
                  { k: 'Today rev', v: fmtShort(store.today_revenue) },
                ].map((row) => (
                  <div key={row.k} className="field-row">
                    <span className="k">{row.k}</span>
                    <span className="v mono" style={{ fontSize: 12 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'var(--info-soft)', border: '1px solid rgba(96,165,250,0.3)',
              fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--info)' }}>Tip:</strong> Changes to store name and address will appear in all reports and receipts immediately after saving.
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
