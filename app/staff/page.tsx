'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';
import { staffApi, StaffMember, StaffKPIs } from '../../lib/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
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

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 300, background: 'var(--bg-2)', border: '1px solid var(--good)', borderRadius: 10, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <span style={{ color: 'var(--good)', fontSize: 16 }}>✓</span>
      <span style={{ fontSize: 13.5 }}>{message}</span>
      <button onClick={onDismiss} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
    </div>
  );
}

// ── Role / status style helpers ───────────────────────────────────────────────
function getRolePill(role: string) {
  const r = role.toLowerCase();
  if (r === 'owner')   return 'pill accent';
  if (r === 'manager') return 'pill info';
  return 'pill';
}

function getStatusPill(status: string) {
  const s = status.toLowerCase();
  if (s === 'active')    return 'pill good';
  if (s === 'on_leave' || s === 'on leave') return 'pill warn';
  return 'pill';
}

function ShiftDot({ shift }: { shift: string }) {
  const lower = shift.toLowerCase();
  const color = lower === 'morning' ? 'var(--warn)' : lower === 'evening' ? 'var(--accent)' : lower === 'full_day' || lower === 'full day' ? 'var(--good)' : 'var(--fg-3)';
  return <span className="dot-s" style={{ background: color, flexShrink: 0 }} />;
}

// ── Permission toggle row ─────────────────────────────────────────────────────
function PermToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: 13 }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
          background: value ? 'var(--good)' : 'var(--bg-3)',
          position: 'relative', transition: 'background 200ms',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 18 : 3,
          width: 14, height: 14, borderRadius: 7, background: '#fff',
          transition: 'left 200ms',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [kpis, setKpis] = useState<StaffKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [permSaving, setPermSaving] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([staffApi.getList(), staffApi.getKPIs()]).then(([listRes, kpiRes]) => {
      if (listRes.success) setStaff(listRes.data);
      if (kpiRes.success) setKpis(kpiRes.data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => staff.filter((m) => {
    if (roleFilter !== 'All' && m.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (statusFilter !== 'All') {
      const st = m.employment_status.toLowerCase().replace('_', ' ');
      if (st !== statusFilter.toLowerCase()) return false;
    }
    if (query) {
      const q = query.toLowerCase();
      if (!m.full_name.toLowerCase().includes(q) && !m.phone.includes(q)) return false;
    }
    return true;
  }), [staff, roleFilter, statusFilter, query]);

  async function togglePerm(m: StaffMember, perm: 'can_refund' | 'can_discount' | 'can_view_reports') {
    setPermSaving(m.id + perm);
    const payload = { [perm]: !m[perm] };
    const res = await staffApi.updatePermissions(m.id, payload);
    if (res.success) {
      setStaff((prev) => prev.map((s) => s.id === m.id ? { ...s, [perm]: !m[perm] } : s));
      setToast('Permissions updated');
      setTimeout(() => setToast(null), 3000);
    }
    setPermSaving(null);
  }

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Staff' }]}
      actions={
        <button className="btn btn-primary" style={{ gap: 6 }}>
          {Icons.plus} Add staff
        </button>
      }
    >
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Staff <span style={{ color: 'var(--fg-4)' }}>/</span>{' '}
            <span className="mono" style={{ fontSize: 16, fontWeight: 400, color: 'var(--fg-3)' }}>Wafanyakazi</span>
          </h1>
          <p className="page-sub">Manage your team, shifts, access, and daily performance.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost page-sec">{Icons.download} Export</button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface stat-card">
          <span className="label">TOTAL STAFF</span>
          <span className="value">{kpis ? kpis.total_staff : '—'}</span>
          <span className="sub">registered team members</span>
        </div>
        <div className="surface stat-card">
          <span className="label">ON DUTY</span>
          <span className="value" style={{ color: 'var(--good)' }}>{kpis ? kpis.on_duty : '—'}</span>
          <span className="sub">currently on shift</span>
        </div>
        <div className="surface stat-card">
          <span className="label">SALES TODAY</span>
          <span className="value" style={{ color: 'var(--accent)', fontSize: (kpis?.total_sales_today ?? 0) > 999_999 ? 20 : 26 }}>
            {kpis ? fmtShort(kpis.total_sales_today) : '—'}
          </span>
          <span className="sub">team combined</span>
        </div>
        <div className="surface stat-card">
          <span className="label">TOP CASHIER</span>
          <span className="value" style={{ fontSize: 16 }}>{kpis?.top_cashier ?? '—'}</span>
          <span className="sub">avg {kpis ? fmtShort(kpis.avg_ticket_today) : '—'} / ticket today</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200, padding: '0 10px 0 12px', height: 32, border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg)' }}>
          {Icons.search}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }}
          />
          {query && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{filtered.length}</span>}
        </div>

        {/* Role pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(['All', 'owner', 'manager', 'cashier']).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '5px 11px', borderRadius: 999,
                border: '1px solid ' + (roleFilter === r ? 'var(--accent-line)' : 'var(--line)'),
                background: roleFilter === r ? 'var(--accent-soft)' : 'var(--bg)',
                color: roleFilter === r ? 'var(--fg)' : 'var(--fg-2)',
                fontSize: 12, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              {r === 'All' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
              <span className="mono" style={{ fontSize: 10, color: roleFilter === r ? 'var(--accent)' : 'var(--fg-4)' }}>
                {r === 'All' ? staff.length : staff.filter(m => m.role.toLowerCase() === r).length}
              </span>
            </button>
          ))}
        </div>

        <span style={{ width: 1, height: 20, background: 'var(--line-2)', margin: '0 2px' }} />

        <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden', background: 'var(--bg)' }}>
          {(['All', 'active', 'on leave', 'inactive']).map((s, i, arr) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 11px', fontSize: 12, border: 0,
                borderRight: i < arr.length - 1 ? '1px solid var(--line)' : 0,
                background: statusFilter === s ? 'var(--bg-3)' : 'transparent',
                color: statusFilter === s ? 'var(--fg)' : 'var(--fg-3)',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="surface" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-3)' }}>Loading staff…</div>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="surface staff-cards-wrap" style={{ overflow: 'hidden', marginBottom: 0 }}>
            {filtered.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
                No staff members match your search.
              </div>
            )}
            {filtered.map((m) => (
              <Link
                key={m.id}
                href={`/staff/${m.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: '1px solid var(--line)', color: 'inherit' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 999, flexShrink: 0, background: `hsl(${m.avatar_hue}, 60%, 50%)`, display: 'grid', placeItems: 'center', fontSize: 13.5, fontWeight: 600, color: '#fff' }}>
                  {m.initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500, fontSize: 13.5 }}>{m.full_name}</span>
                    <span className={getRolePill(m.role)} style={{ fontSize: 10 }}>{m.role}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ShiftDot shift={m.shift} />
                    {m.shift_display} · {m.phone}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className={getStatusPill(m.employment_status)} style={{ fontSize: 10 }}>{m.employment_status}</span>
                  {m.sales_today > 0 && (
                    <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>{fmtShort(m.sales_today)} today</div>
                  )}
                </div>
              </Link>
            ))}
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', background: 'var(--bg-3)' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{filtered.length} staff member{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Desktop table */}
          <div className="surface staff-table-wrap" style={{ overflow: 'hidden' }}>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Staff member</th>
                    <th>Phone</th>
                    <th>Shift</th>
                    <th>Status</th>
                    <th className="num">Sales today</th>
                    <th className="num">Total sales</th>
                    <th>Permissions</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--fg-3)' }}>
                        No staff members match your search.
                      </td>
                    </tr>
                  )}
                  {filtered.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: `hsl(${m.avatar_hue}, 60%, 50%)`, display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 600, color: '#fff' }}>
                            {m.initials}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                              <Link href={`/staff/${m.id}`} style={{ fontSize: 13.5, fontWeight: 500, color: 'inherit' }}>{m.full_name}</Link>
                              <span className={getRolePill(m.role)} style={{ fontSize: 10 }}>{m.role}</span>
                            </div>
                            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{m.store_name || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{m.phone}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ShiftDot shift={m.shift} />
                          <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{m.shift_display}</span>
                        </div>
                      </td>
                      <td><span className={getStatusPill(m.employment_status)}>{m.employment_status}</span></td>
                      <td className="num mono" style={{ fontSize: 13, color: m.sales_today > 0 ? 'var(--accent)' : 'var(--fg-4)' }}>
                        {m.sales_today > 0 ? fmtShort(m.sales_today) : '—'}
                        {m.txns_today > 0 && (
                          <div style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 1 }}>{m.txns_today} txns</div>
                        )}
                      </td>
                      <td className="num mono" style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                        {m.total_sales > 0 ? fmtShort(m.total_sales) : <span style={{ color: 'var(--fg-4)' }}>—</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {[
                            { key: 'can_refund' as const,       label: 'Refund' },
                            { key: 'can_discount' as const,     label: 'Discount' },
                            { key: 'can_view_reports' as const, label: 'Reports' },
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              disabled={permSaving === m.id + key}
                              onClick={() => togglePerm(m, key)}
                              style={{
                                padding: '2px 7px', borderRadius: 5, fontSize: 10.5, cursor: 'pointer',
                                border: '1px solid ' + (m[key] ? 'var(--good)' : 'var(--line)'),
                                background: m[key] ? 'var(--good-soft)' : 'var(--bg-3)',
                                color: m[key] ? 'var(--good)' : 'var(--fg-4)',
                                opacity: permSaving === m.id + key ? 0.5 : 1,
                              }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td>
                        <Link href={`/staff/${m.id}`}>
                          <button className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12 }}>View</button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '11px 16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-3)', flexWrap: 'wrap', gap: 8 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                Showing {filtered.length} of {staff.length} staff members
              </span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                Today's total:{' '}
                <span style={{ color: 'var(--accent)' }}>{fmt(filtered.reduce((s, m) => s + m.sales_today, 0))}</span>
              </span>
            </div>
          </div>
        </>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
