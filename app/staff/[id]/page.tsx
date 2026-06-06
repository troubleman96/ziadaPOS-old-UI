'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtShort } from '../../../lib/utils';
import { staffApi, StaffMember } from '../../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
type ShiftKey = 'Morning' | 'Evening' | 'Full day' | 'Weekend';

interface ActivityEntry {
  id: string;
  time: string;
  type: 'sale' | 'refund' | 'login' | 'adjustment';
  amount?: number;
  items?: number;
  note?: string;
}

// ── Shift metadata ────────────────────────────────────────────────────────────
const SHIFT_HOURS: Record<ShiftKey, { days: string; hours: string; start: string; end: string }> = {
  Morning:    { days: 'Mon – Sat', hours: '7h / day',  start: '7:00 AM', end: '2:00 PM' },
  Evening:    { days: 'Tue – Sun', hours: '7h / day',  start: '2:00 PM', end: '9:00 PM' },
  'Full day': { days: 'Mon – Sat', hours: '12h / day', start: '7:00 AM', end: '7:00 PM' },
  Weekend:    { days: 'Sat – Sun', hours: '10h / day', start: '8:00 AM', end: '6:00 PM' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeShift(shift: string): ShiftKey {
  const s = (shift || '').toLowerCase().replace(/_/g, ' ');
  if (s === 'morning')       return 'Morning';
  if (s === 'evening')       return 'Evening';
  if (s.includes('full'))    return 'Full day';
  if (s.includes('weekend')) return 'Weekend';
  return 'Full day';
}

function normalizeStatus(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'on_leave' || s === 'on leave') return 'On leave';
  if (s === 'inactive') return 'Inactive';
  return 'Active';
}

function getRolePill(role: string) {
  const r = (role || '').toLowerCase();
  if (r === 'owner')   return 'pill accent';
  if (r === 'manager') return 'pill info';
  return 'pill';
}

function getStatusPill(status: string) {
  const label = normalizeStatus(status).toLowerCase();
  if (label === 'active')   return 'pill good';
  if (label === 'on leave') return 'pill warn';
  return 'pill';
}

function mockActivity(m: StaffMember): ActivityEntry[] {
  if (m.txns_today === 0) return [
    { id: 'a0', time: '7:02 AM', type: 'login', note: 'Logged into POS terminal' },
  ];
  const entries: ActivityEntry[] = [
    { id: 'a-login', time: '6:58 AM', type: 'login', note: 'Logged into POS · Till 1' },
  ];
  const amounts = [42000, 28500, 15000, 67000, 8500, 31000, 19500, 88000, 12500, 44000, 22000, 55000];
  const shiftKey = normalizeShift(m.shift);
  for (let i = 0; i < Math.min(m.txns_today, 8); i++) {
    const h  = 7 + Math.floor(i * (shiftKey === 'Evening' ? 8 : 6) / m.txns_today);
    const mn = (i * 17 + 3) % 60;
    const ap = h >= 12 ? 'PM' : 'AM';
    const hh = h > 12 ? h - 12 : h;
    entries.push({
      id: `a${i}`,
      time: `${hh}:${String(mn).padStart(2, '0')} ${ap}`,
      type: i === 2 ? 'refund' : 'sale',
      amount: amounts[i % amounts.length],
      items: Math.max(1, Math.round(amounts[i % amounts.length] / 9000)),
    });
  }
  return entries;
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
    </>
  );
}

// ── Permission toggle ─────────────────────────────────────────────────────────
function PermToggle({
  label, desc, value, onChange,
}: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: value ? 'var(--good)' : 'var(--bg-4)',
          position: 'relative', flexShrink: 0, transition: 'background 200ms',
        }}
        role="switch"
        aria-checked={value}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 20 : 3, width: 18, height: 18,
          borderRadius: 999, background: '#fff',
          transition: 'left 200ms', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }} />
      </button>
    </div>
  );
}

// ── Weekly bar chart ──────────────────────────────────────────────────────────
function WeekChart({ member }: { member: StaffMember }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const shiftKey  = normalizeShift(member.shift);
  const isOnLeave = (member.employment_status || '').toLowerCase() === 'on_leave';
  const seed      = String(member.id).charCodeAt(0) || 50;
  const avgTicket = member.avg_ticket || 20000;
  const values = days.map((_, i) =>
    isOnLeave ? 0
      : shiftKey === 'Weekend' && i < 5 ? 0
      : shiftKey === 'Evening' && i === 0 ? 0
      : Math.round((Math.abs(Math.sin(seed * (i + 1) * 0.7)) * 0.8 + 0.2) * avgTicket * 8)
  );
  const max = Math.max(...values, 1);
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 12 }}>SALES THIS WEEK</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 72 }}>
        {values.map((v, i) => (
          <div key={days[i]} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', borderRadius: 4,
              background: i === 0 ? 'var(--accent)' : 'var(--bg-4)',
              height: Math.max(3, (v / max) * 60),
              transition: 'height 300ms',
            }} />
            <div className="mono" style={{ fontSize: 9, color: 'var(--fg-4)' }}>{days[i]}</div>
          </div>
        ))}
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 10 }}>
        Week total: <span style={{ color: 'var(--fg-2)' }}>{fmtShort(values.reduce((a, b) => a + b, 0))}</span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember]       = useState<StaffMember | null>(null);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [tab, setTab]             = useState<'overview' | 'schedule' | 'permissions'>('overview');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setFetchError(null);
    staffApi.getDetail(id).then((res) => {
      setLoading(false);
      if (res.success) setMember(res.data);
      else setFetchError(res.message ?? 'Staff member not found.');
    });
  }, [id]);

  function patchMember(patch: Partial<StaffMember>) {
    setMember(prev => prev ? { ...prev, ...patch } : null);
  }

  async function saveChanges() {
    if (!member) return;
    setSaving(true);
    setSaveError(null);
    const res = await staffApi.updatePermissions(member.id, {
      can_refund: member.can_refund,
      can_discount: member.can_discount,
      can_view_reports: member.can_view_reports,
    });
    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setSaveError(res.message ?? 'Failed to save changes.');
    }
  }

  if (loading) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Staff', href: '/staff' }, { label: '…' }]}>
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
          <Spinner />
        </div>
      </AppShell>
    );
  }

  if (fetchError || !member) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Staff', href: '/staff' }, { label: 'Not found' }]}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 14, color: 'var(--fg-3)' }}>{fetchError ?? 'Staff member not found.'}</div>
          <Link href="/staff" style={{ marginTop: 16, display: 'inline-block' }}>
            <button className="btn btn-soft">← Back to staff</button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const activity    = mockActivity(member);
  const shiftKey    = normalizeShift(member.shift);
  const shiftInfo   = SHIFT_HOURS[shiftKey];
  const statusLabel = normalizeStatus(member.employment_status);
  const memberInitials = member.initials || member.full_name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  const TABS = [
    { key: 'overview',    label: 'Overview'    },
    { key: 'schedule',    label: 'Schedule'    },
    { key: 'permissions', label: 'Permissions' },
  ] as const;

  return (
    <AppShell
      crumbs={[
        { label: 'ziada', href: '/' },
        { label: member.store_name || 'Store', href: '/' },
        { label: 'Staff', href: '/staff' },
        { label: member.full_name },
      ]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/staff"><button className="btn btn-ghost page-sec">← All staff</button></Link>
          {tab === 'permissions' && (
            <button className="btn btn-primary" onClick={saveChanges} disabled={saving}>
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
            </button>
          )}
        </div>
      }
    >
      {/* ── Profile header ───────────────────────────────────────────────── */}
      <div className="surface" style={{ padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999, flexShrink: 0,
            background: `oklch(52% 0.18 ${member.avatar_hue})`,
            display: 'grid', placeItems: 'center',
            fontSize: 22, fontWeight: 600, color: '#fff',
          }}>
            {memberInitials}
          </div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em' }}>{member.full_name}</h1>
              <span className={getRolePill(member.role)}>{member.role}</span>
              <span className={getStatusPill(member.employment_status)}>{statusLabel}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: 'var(--fg-3)' }}>
              <span className="mono">{member.phone}</span>
              {member.email && <span className="mono">{member.email}</span>}
              <span className="mono">{member.shift_display || shiftKey} · {shiftInfo.hours}</span>
              {member.store_name && <span className="mono">{member.store_name}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <button className="btn btn-soft" style={{ gap: 6, fontSize: 12.5 }}>{Icons.edit} Edit profile</button>
            {statusLabel === 'Active'
              ? <button className="btn btn-ghost" style={{ fontSize: 12.5, color: 'var(--warn)' }} onClick={() => patchMember({ employment_status: 'on_leave' })}>Set on leave</button>
              : <button className="btn btn-ghost" style={{ fontSize: 12.5, color: 'var(--good)' }} onClick={() => patchMember({ employment_status: 'active' })}>Reactivate</button>
            }
          </div>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 20 }}>
        <div className="surface" style={{ padding: '14px 16px' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>SALES TODAY</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 6, color: member.sales_today > 0 ? 'var(--accent)' : 'var(--fg-3)' }}>
            {member.sales_today > 0 ? fmtShort(member.sales_today) : '—'}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 4 }}>{member.txns_today} transaction{member.txns_today !== 1 ? 's' : ''}</div>
        </div>
        <div className="surface" style={{ padding: '14px 16px' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>TOTAL SALES</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 6 }}>{fmtShort(member.total_sales)}</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 4 }}>{member.txns_total} total transactions</div>
        </div>
        <div className="surface" style={{ padding: '14px 16px' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>AVG TICKET</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 6 }}>
            {member.avg_ticket > 0 ? fmtShort(member.avg_ticket) : '—'}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 4 }}>per sale</div>
        </div>
        <div className="surface" style={{ padding: '14px 16px' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>STORE</div>
          <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {member.store_name || '—'}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 4 }}>{member.shift_display || shiftKey}</div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ═════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ padding: '18px 20px' }}>
              <WeekChart member={member} />
            </div>

            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Today&apos;s activity</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div style={{ padding: '4px 0' }}>
                {activity.map((a) => (
                  <div key={a.id} className="timeline-item" style={{ paddingLeft: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: '10px 20px 10px 0' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {a.type === 'sale'       && <span className="pill good"  style={{ fontSize: 9 }}>SALE</span>}
                          {a.type === 'refund'     && <span className="pill bad"   style={{ fontSize: 9 }}>REFUND</span>}
                          {a.type === 'login'      && <span className="pill"       style={{ fontSize: 9 }}>LOGIN</span>}
                          {a.type === 'adjustment' && <span className="pill warn"  style={{ fontSize: 9 }}>ADJUSTMENT</span>}
                          {a.amount ? fmt(a.amount) : a.note}
                        </div>
                        {a.items && (
                          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{a.items} item{a.items !== 1 ? 's' : ''}</div>
                        )}
                        {!a.amount && a.note && <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{a.note}</div>}
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', flexShrink: 0 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head"><span className="card-title">Profile</span></div>
              <div style={{ padding: '4px 16px 8px' }}>
                {[
                  { k: 'Full name', v: member.full_name },
                  { k: 'Role',     v: member.role },
                  { k: 'Phone',    v: member.phone },
                  { k: 'Email',    v: member.email || '—' },
                  { k: 'Status',   v: statusLabel },
                  { k: 'Shift',    v: member.shift_display || shiftKey },
                  { k: 'Store',    v: member.store_name || '—' },
                ].map((row) => (
                  <div key={row.k} className="field-row">
                    <span className="k">{row.k}</span>
                    <span className="v mono" style={{ fontSize: 12 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Access level</span>
                <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11.5 }} onClick={() => setTab('permissions')}>
                  Edit →
                </button>
              </div>
              <div style={{ padding: '4px 16px 8px' }}>
                {[
                  { k: 'Process refunds', v: member.can_refund },
                  { k: 'Apply discounts', v: member.can_discount },
                  { k: 'View reports',    v: member.can_view_reports },
                ].map((row) => (
                  <div key={row.k} className="field-row">
                    <span className="k">{row.k}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                      <span className="dot-s" style={{ background: row.v ? 'var(--good)' : 'var(--fg-4)' }} />
                      <span className="mono" style={{ color: row.v ? 'var(--good)' : 'var(--fg-4)' }}>
                        {row.v ? 'Allowed' : 'Denied'}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SCHEDULE ═════════════════════════════════════════════════════ */}
      {tab === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ padding: '20px', background: 'linear-gradient(135deg, var(--accent-soft), var(--bg-2))', borderColor: 'var(--accent-line)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 10 }}>CURRENT SHIFT</div>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>{member.shift_display || shiftKey}</div>
              <div className="mono" style={{ fontSize: 13, color: 'var(--fg-2)', marginBottom: 14 }}>
                {shiftInfo.start} → {shiftInfo.end} &nbsp;·&nbsp; {shiftInfo.hours}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="pill accent" style={{ fontSize: 10.5 }}>{shiftInfo.days}</span>
                <span className="pill" style={{ fontSize: 10.5 }}>{shiftInfo.hours}</span>
              </div>
            </div>

            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head"><span className="card-title">Change shift</span></div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(['Morning', 'Evening', 'Full day', 'Weekend'] as ShiftKey[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => patchMember({ shift: s })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                      border: `1px solid ${shiftKey === s ? 'var(--accent-line)' : 'var(--line)'}`,
                      background: shiftKey === s ? 'var(--accent-soft)' : 'var(--bg)',
                      color: 'var(--fg)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="dot-s" style={{ background: s === 'Morning' ? 'var(--warn)' : s === 'Evening' ? 'var(--accent)' : s === 'Full day' ? 'var(--good)' : 'var(--fg-3)' }} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 13.5, fontWeight: shiftKey === s ? 500 : 400 }}>{s}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 1 }}>
                          {SHIFT_HOURS[s].start} – {SHIFT_HOURS[s].end} &nbsp;·&nbsp; {SHIFT_HOURS[s].days}
                        </div>
                      </div>
                    </div>
                    {shiftKey === s && (
                      <span style={{ color: 'var(--accent)' }}>{Icons.check}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">This week — {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div style={{ padding: '0 16px' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const isWeekend = i >= 5;
                  const isOnShift = shiftKey === 'Weekend' ? isWeekend
                    : (shiftKey === 'Morning' || shiftKey === 'Full day') ? !isWeekend
                    : shiftKey === 'Evening' ? i > 0 && !isWeekend : false;
                  const dayOfWeek = new Date().getDay();
                  const isToday   = (dayOfWeek === 0 ? 6 : dayOfWeek - 1) === i;
                  const isOnLeave = statusLabel === 'On leave';
                  const shiftLabel = isOnLeave ? 'On leave' : isOnShift ? (member.shift_display || shiftKey) : 'Off';
                  const dotColor   = isOnLeave ? 'var(--warn)' : isOnShift ? 'var(--good)' : 'var(--bg-4)';
                  return (
                    <div key={day} className="field-row" style={{ borderBottom: i < 6 ? '1px solid var(--line)' : 'none' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isToday && <span className="pill accent" style={{ fontSize: 9, padding: '0 5px' }}>TODAY</span>}
                        <span className={isToday ? '' : 'k'} style={{ fontSize: 13 }}>{day}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="dot-s" style={{ background: dotColor }} />
                        <span className="mono" style={{ fontSize: 11.5, color: isOnShift && !isOnLeave ? 'var(--fg-2)' : 'var(--fg-4)' }}>
                          {shiftLabel}
                          {isOnShift && !isOnLeave && <> &nbsp;{shiftInfo.start} – {shiftInfo.end}</>}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head"><span className="card-title">Availability</span></div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(['active', 'on_leave', 'inactive'] as const).map((s) => {
                  const label     = s === 'on_leave' ? 'On leave' : s.charAt(0).toUpperCase() + s.slice(1);
                  const isCurrent = (member.employment_status || '').toLowerCase() === s;
                  return (
                    <button
                      key={s}
                      onClick={() => patchMember({ employment_status: s })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', borderRadius: 8,
                        border: `1px solid ${isCurrent ? 'var(--accent-line)' : 'var(--line)'}`,
                        background: isCurrent ? 'var(--accent-soft)' : 'var(--bg)',
                        cursor: 'pointer', color: 'var(--fg)', fontSize: 13.5,
                      }}
                    >
                      <span className="dot-s" style={{ background: s === 'active' ? 'var(--good)' : s === 'on_leave' ? 'var(--warn)' : 'var(--fg-4)' }} />
                      {label}
                      {isCurrent && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>{Icons.check}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PERMISSIONS ══════════════════════════════════════════════════ */}
      {tab === 'permissions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">POS permissions</span>
                <span className={getRolePill(member.role)} style={{ fontSize: 10.5 }}>{member.role}</span>
              </div>
              <div style={{ padding: '0 18px' }}>
                <PermToggle
                  label="Process refunds"
                  desc="Allow this staff member to issue refunds at the POS"
                  value={member.can_refund}
                  onChange={(v) => patchMember({ can_refund: v })}
                />
                <PermToggle
                  label="Apply discounts"
                  desc="Allow this staff member to apply line-item or cart discounts"
                  value={member.can_discount}
                  onChange={(v) => patchMember({ can_discount: v })}
                />
                <PermToggle
                  label="View reports"
                  desc="Allow access to the Analytics and Reports sections"
                  value={member.can_view_reports}
                  onChange={(v) => patchMember({ can_view_reports: v })}
                />
              </div>
            </div>

            {saveError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bad-soft, #fff0f0)', border: '1px solid var(--bad-line, #fca5a5)', color: 'var(--bad)', fontSize: 13 }}>
                {saveError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveChanges} disabled={saving}>
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head"><span className="card-title">Role permissions guide</span></div>
              <div style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { role: 'Cashier', desc: 'Process sales and view their own shifts. Refunds and discounts controlled individually.' },
                  { role: 'Manager', desc: 'All cashier abilities plus refunds, discounts, and full report access by default.' },
                  { role: 'Owner',   desc: 'Full access to all features including staff management, settings, and billing.' },
                ].map((r) => (
                  <div
                    key={r.role}
                    style={{
                      padding: '12px 14px', borderRadius: 8,
                      background: member.role.toLowerCase() === r.role.toLowerCase() ? 'var(--accent-soft)' : 'var(--bg)',
                      border: `1px solid ${member.role.toLowerCase() === r.role.toLowerCase() ? 'var(--accent-line)' : 'var(--line)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <span className={getRolePill(r.role)} style={{ fontSize: 10 }}>{r.role}</span>
                      {member.role.toLowerCase() === r.role.toLowerCase() && (
                        <span className="mono" style={{ fontSize: 10, color: 'var(--accent)' }}>← current</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--accent-line)', background: 'var(--accent-soft)', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--accent)' }}>Tip:</strong> Individual permissions override the role defaults. You can grant a Cashier refund access without changing their role.
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
