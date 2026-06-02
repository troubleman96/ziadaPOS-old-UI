'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtShort } from '../../../lib/utils';

// ── Types (mirrors list page) ─────────────────────────────────────────────────
type Role   = 'Owner' | 'Manager' | 'Cashier';
type Status = 'Active' | 'On leave' | 'Inactive';
type Shift  = 'Morning' | 'Evening' | 'Full day' | 'Weekend';

interface StaffMember {
  id: string;
  name: string;
  role: Role;
  phone: string;
  email: string;
  status: Status;
  shift: Shift;
  joined: Date;
  avatarHue: number;
  salesToday: number;
  totalSales: number;
  avgTicket: number;
  txnsToday: number;
  txnsTotal: number;
  canRefund: boolean;
  canDiscount: boolean;
  canViewReports: boolean;
  pin: string;
}

interface ActivityEntry {
  id: string;
  time: string;
  type: 'sale' | 'refund' | 'login' | 'adjustment';
  amount?: number;
  items?: number;
  note?: string;
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const TODAY  = new Date(2026, 4, 25);
const mAgo   = (n: number) => new Date(TODAY.getTime() - n * 30 * 86400000);

const STAFF_DATA: StaffMember[] = [
  {
    id: 's001', name: 'Hamisi Mwakapaga', role: 'Owner',
    phone: '+255 784 100 001', email: 'hamisi@dukakuu.co.tz',
    status: 'Active', shift: 'Full day', joined: mAgo(36),
    avatarHue: 260, pin: '••••',
    salesToday: 0, totalSales: 12_480_000, avgTicket: 42_000,
    txnsToday: 0, txnsTotal: 297,
    canRefund: true, canDiscount: true, canViewReports: true,
  },
  {
    id: 's002', name: 'Neema Kiongo', role: 'Manager',
    phone: '+255 767 200 002', email: 'neema@dukakuu.co.tz',
    status: 'Active', shift: 'Morning', joined: mAgo(18),
    avatarHue: 160, pin: '••••',
    salesToday: 348_500, totalSales: 6_240_000, avgTicket: 28_400,
    txnsToday: 12, txnsTotal: 220,
    canRefund: true, canDiscount: true, canViewReports: true,
  },
  {
    id: 's003', name: 'Baraka Mwenda', role: 'Cashier',
    phone: '+255 712 300 003', email: 'baraka@dukakuu.co.tz',
    status: 'Active', shift: 'Evening', joined: mAgo(12),
    avatarHue: 200, pin: '••••',
    salesToday: 214_000, totalSales: 3_820_000, avgTicket: 19_600,
    txnsToday: 11, txnsTotal: 195,
    canRefund: false, canDiscount: true, canViewReports: false,
  },
  {
    id: 's004', name: 'Amina Hassan', role: 'Cashier',
    phone: '+255 756 400 004', email: 'amina@dukakuu.co.tz',
    status: 'Active', shift: 'Morning', joined: mAgo(8),
    avatarHue: 340, pin: '••••',
    salesToday: 196_000, totalSales: 1_580_000, avgTicket: 17_800,
    txnsToday: 11, txnsTotal: 89,
    canRefund: false, canDiscount: false, canViewReports: false,
  },
  {
    id: 's005', name: 'Joseph Kilosa', role: 'Cashier',
    phone: '+255 622 500 005', email: 'joseph@dukakuu.co.tz',
    status: 'On leave', shift: 'Weekend', joined: mAgo(14),
    avatarHue: 40, pin: '••••',
    salesToday: 0, totalSales: 2_140_000, avgTicket: 22_300,
    txnsToday: 0, txnsTotal: 96,
    canRefund: false, canDiscount: true, canViewReports: false,
  },
  {
    id: 's006', name: 'Zawadi Omary', role: 'Manager',
    phone: '+255 769 600 006', email: 'zawadi@dukakuu.co.tz',
    status: 'Active', shift: 'Full day', joined: mAgo(22),
    avatarHue: 120, pin: '••••',
    salesToday: 284_500, totalSales: 5_640_000, avgTicket: 31_200,
    txnsToday: 9, txnsTotal: 181,
    canRefund: true, canDiscount: true, canViewReports: true,
  },
];

function mockActivity(m: StaffMember): ActivityEntry[] {
  if (m.txnsToday === 0) return [
    { id: 'a0', time: '7:02 AM', type: 'login', note: 'Logged into POS terminal' },
  ];
  const entries: ActivityEntry[] = [
    { id: 'a-login', time: '6:58 AM', type: 'login', note: 'Logged into POS · Till 1' },
  ];
  const amounts = [42000, 28500, 15000, 67000, 8500, 31000, 19500, 88000, 12500, 44000, 22000, 55000];
  for (let i = 0; i < Math.min(m.txnsToday, 8); i++) {
    const h  = 7 + Math.floor(i * (m.shift === 'Evening' ? 8 : 6) / m.txnsToday);
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
}

const ROLE_STYLE: Record<Role, string> = {
  Owner:   'pill accent',
  Manager: 'pill info',
  Cashier: 'pill',
};

const STATUS_STYLE: Record<Status, string> = {
  Active:     'pill good',
  'On leave': 'pill warn',
  Inactive:   'pill',
};

const SHIFT_HOURS: Record<Shift, { days: string; hours: string; start: string; end: string }> = {
  Morning:    { days: 'Mon – Sat', hours: '7h / day', start: '7:00 AM', end: '2:00 PM' },
  Evening:    { days: 'Tue – Sun', hours: '7h / day', start: '2:00 PM', end: '9:00 PM' },
  'Full day': { days: 'Mon – Sat', hours: '12h / day', start: '7:00 AM', end: '7:00 PM' },
  Weekend:    { days: 'Sat – Sun', hours: '10h / day', start: '8:00 AM', end: '6:00 PM' },
};

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

// ── Weekly bar chart (simple CSS bars) ───────────────────────────────────────
function WeekChart({ member }: { member: StaffMember }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const seed  = member.id.charCodeAt(3);
  const values = days.map((_, i) =>
    member.status === 'On leave' ? 0
      : member.shift === 'Weekend' && i < 5 ? 0
      : member.shift === 'Evening' && i === 0 ? 0
      : Math.round((Math.abs(Math.sin(seed * (i + 1) * 0.7)) * 0.8 + 0.2) * member.avgTicket * 8)
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
  const [staff, setStaff] = useState<StaffMember[]>(STAFF_DATA);
  const [tab,   setTab  ] = useState<'overview' | 'schedule' | 'permissions'>('overview');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved ] = useState(false);

  const member = staff.find((m) => m.id === id);

  if (!member) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Staff', href: '/staff' }, { label: 'Not found' }]}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 14, color: 'var(--fg-3)' }}>Staff member not found.</div>
          <Link href="/staff" style={{ marginTop: 16, display: 'inline-block' }}>
            <button className="btn btn-soft">← Back to staff</button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const activity = mockActivity(member);
  const shiftInfo = SHIFT_HOURS[member.shift];
  const tenureMonths = Math.round((TODAY.getTime() - member.joined.getTime()) / (30 * 86400000));

  function patchMember(patch: Partial<StaffMember>) {
    setStaff((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function saveChanges() {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); }, 600);
  }

  const TABS = [
    { key: 'overview',     label: 'Overview'     },
    { key: 'schedule',     label: 'Schedule'     },
    { key: 'permissions',  label: 'Permissions'  },
  ] as const;

  return (
    <AppShell
      crumbs={[
        { label: 'ziada', href: '/' },
        { label: 'Duka Kuu', href: '/' },
        { label: 'Staff', href: '/staff' },
        { label: member.name },
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
      {/* ── Profile header ─────────────────────────────────────────────── */}
      <div className="surface" style={{ padding: '20px 22px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: 999, flexShrink: 0,
            background: `oklch(52% 0.18 ${member.avatarHue})`,
            display: 'grid', placeItems: 'center',
            fontSize: 22, fontWeight: 600, color: '#fff',
          }}>
            {initials(member.name)}
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em' }}>{member.name}</h1>
              <span className={ROLE_STYLE[member.role]}>{member.role}</span>
              <span className={STATUS_STYLE[member.status]}>{member.status}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: 'var(--fg-3)' }}>
              <span className="mono">{member.phone}</span>
              {member.email && <span className="mono">{member.email}</span>}
              <span className="mono">{member.shift} shift · {SHIFT_HOURS[member.shift].hours}</span>
              <span className="mono">Joined {member.joined.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} · {tenureMonths}mo tenure</span>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <button className="btn btn-soft" style={{ gap: 6, fontSize: 12.5 }}>{Icons.edit} Edit profile</button>
            {member.status === 'Active'
              ? <button className="btn btn-ghost" style={{ fontSize: 12.5, color: 'var(--warn)' }} onClick={() => patchMember({ status: 'On leave' })}>Set on leave</button>
              : <button className="btn btn-ghost" style={{ fontSize: 12.5, color: 'var(--good)' }} onClick={() => patchMember({ status: 'Active' })}>Reactivate</button>
            }
          </div>
        </div>
      </div>

      {/* ── KPI mini strip ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 20 }}>
        <div className="surface" style={{ padding: '14px 16px' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>SALES TODAY</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 6, color: member.salesToday > 0 ? 'var(--accent)' : 'var(--fg-3)' }}>
            {member.salesToday > 0 ? fmtShort(member.salesToday) : '—'}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 4 }}>{member.txnsToday} transaction{member.txnsToday !== 1 ? 's' : ''}</div>
        </div>
        <div className="surface" style={{ padding: '14px 16px' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>TOTAL SALES</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 6 }}>{fmtShort(member.totalSales)}</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 4 }}>{member.txnsTotal} total transactions</div>
        </div>
        <div className="surface" style={{ padding: '14px 16px' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>AVG TICKET</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 6 }}>
            {member.avgTicket > 0 ? fmtShort(member.avgTicket) : '—'}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 4 }}>per sale</div>
        </div>
        <div className="surface" style={{ padding: '14px 16px' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>TENURE</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', marginTop: 6 }}>{tenureMonths}mo</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 4 }}>
            since {member.joined.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
          {/* Left: performance + activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Week chart */}
            <div className="surface" style={{ padding: '18px 20px' }}>
              <WeekChart member={member} />
            </div>

            {/* Today's activity */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Today's activity</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
              </div>
              <div style={{ padding: '4px 0' }}>
                {activity.length === 0 && (
                  <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: 'var(--fg-3)' }}>No activity recorded today.</div>
                )}
                {activity.map((a) => (
                  <div key={a.id} className="timeline-item" style={{ paddingLeft: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: '10px 20px 10px 0' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {a.type === 'sale'       && <span className="pill good"   style={{ fontSize: 9 }}>SALE</span>}
                          {a.type === 'refund'     && <span className="pill bad"    style={{ fontSize: 9 }}>REFUND</span>}
                          {a.type === 'login'      && <span className="pill"        style={{ fontSize: 9 }}>LOGIN</span>}
                          {a.type === 'adjustment' && <span className="pill warn"   style={{ fontSize: 9 }}>ADJUSTMENT</span>}
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

          {/* Right: profile details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Contact & details */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head"><span className="card-title">Profile</span></div>
              <div style={{ padding: '4px 16px 8px' }}>
                {[
                  { k: 'Full name',    v: member.name },
                  { k: 'Role',         v: member.role },
                  { k: 'Phone',        v: member.phone },
                  { k: 'Email',        v: member.email || '—' },
                  { k: 'Status',       v: member.status },
                  { k: 'Shift',        v: member.shift },
                  { k: 'PIN',          v: member.pin || 'Not set' },
                  { k: 'Joined',       v: member.joined.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map((row) => (
                  <div key={row.k} className="field-row">
                    <span className="k">{row.k}</span>
                    <span className="v mono" style={{ fontSize: 12 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick permissions summary */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Access level</span>
                <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11.5 }} onClick={() => setTab('permissions')}>
                  Edit →
                </button>
              </div>
              <div style={{ padding: '4px 16px 8px' }}>
                {[
                  { k: 'Process refunds',  v: member.canRefund },
                  { k: 'Apply discounts',  v: member.canDiscount },
                  { k: 'View reports',     v: member.canViewReports },
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

      {/* ══ SCHEDULE TAB ════════════════════════════════════════════════ */}
      {tab === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
          {/* Left: shift overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Current shift card */}
            <div className="surface" style={{ padding: '20px', background: 'linear-gradient(135deg, var(--accent-soft), var(--bg-2))', borderColor: 'var(--accent-line)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 10 }}>CURRENT SHIFT</div>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>{member.shift}</div>
              <div className="mono" style={{ fontSize: 13, color: 'var(--fg-2)', marginBottom: 14 }}>
                {shiftInfo.start} → {shiftInfo.end} &nbsp;·&nbsp; {shiftInfo.hours}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="pill accent" style={{ fontSize: 10.5 }}>{shiftInfo.days}</span>
                <span className="pill" style={{ fontSize: 10.5 }}>{shiftInfo.hours}</span>
              </div>
            </div>

            {/* Change shift */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head"><span className="card-title">Change shift</span></div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(['Morning', 'Evening', 'Full day', 'Weekend'] as Shift[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => patchMember({ shift: s })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                      border: `1px solid ${member.shift === s ? 'var(--accent-line)' : 'var(--line)'}`,
                      background: member.shift === s ? 'var(--accent-soft)' : 'var(--bg)',
                      color: 'var(--fg)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="dot-s" style={{ background: s === 'Morning' ? 'var(--warn)' : s === 'Evening' ? 'var(--accent)' : s === 'Full day' ? 'var(--good)' : 'var(--fg-3)' }} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 13.5, fontWeight: member.shift === s ? 500 : 400 }}>{s}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 1 }}>
                          {SHIFT_HOURS[s].start} – {SHIFT_HOURS[s].end} &nbsp;·&nbsp; {SHIFT_HOURS[s].days}
                        </div>
                      </div>
                    </div>
                    {member.shift === s && (
                      <span style={{ color: 'var(--accent)' }}>{Icons.check}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: calendar and time-off */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* This week */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head"><span className="card-title">This week — {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}</span></div>
              <div style={{ padding: '0 16px' }}>
                {['Mon 20', 'Tue 21', 'Wed 22', 'Thu 23', 'Fri 24', 'Sat 25', 'Sun 26'].map((day, i) => {
                  const isWeekend    = i >= 5;
                  const isOnShift    = member.shift === 'Weekend' ? isWeekend
                    : member.shift === 'Morning' || member.shift === 'Full day' ? !isWeekend
                    : member.shift === 'Evening' ? i > 0 && !isWeekend : false;
                  const isToday      = i === 5;
                  const isOnLeave    = member.status === 'On leave';
                  const shiftLabel   = isOnLeave ? 'On leave' : isOnShift ? member.shift : 'Off';
                  const dotColor     = isOnLeave ? 'var(--warn)' : isOnShift ? 'var(--good)' : 'var(--bg-4)';
                  return (
                    <div
                      key={day}
                      className="field-row"
                      style={{ borderBottom: i < 6 ? '1px solid var(--line)' : 'none' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isToday && <span className="pill accent" style={{ fontSize: 9, padding: '0 5px' }}>TODAY</span>}
                        <span className={isToday ? '' : 'k'} style={{ fontSize: 13 }}>{day}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="dot-s" style={{ background: dotColor }} />
                        <span className="mono" style={{ fontSize: 11.5, color: isOnShift && !isOnLeave ? 'var(--fg-2)' : 'var(--fg-4)' }}>
                          {shiftLabel}
                          {isOnShift && !isOnLeave && <> &nbsp;{SHIFT_HOURS[member.shift].start} – {SHIFT_HOURS[member.shift].end}</>}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status control */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head"><span className="card-title">Availability</span></div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(['Active', 'On leave', 'Inactive'] as Status[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => patchMember({ status: s })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 8, border: `1px solid ${member.status === s ? 'var(--accent-line)' : 'var(--line)'}`,
                      background: member.status === s ? 'var(--accent-soft)' : 'var(--bg)',
                      cursor: 'pointer', color: 'var(--fg)', fontSize: 13.5,
                    }}
                  >
                    <span className="dot-s" style={{ background: s === 'Active' ? 'var(--good)' : s === 'On leave' ? 'var(--warn)' : 'var(--fg-4)' }} />
                    {s}
                    {member.status === s && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>{Icons.check}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PERMISSIONS TAB ═════════════════════════════════════════════ */}
      {tab === 'permissions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
          {/* Left: permission toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">POS permissions</span>
                <span className={ROLE_STYLE[member.role]} style={{ fontSize: 10.5 }}>{member.role}</span>
              </div>
              <div style={{ padding: '0 18px' }}>
                <PermToggle
                  label="Process refunds"
                  desc="Allow this staff member to issue refunds at the POS"
                  value={member.canRefund}
                  onChange={(v) => patchMember({ canRefund: v })}
                />
                <PermToggle
                  label="Apply discounts"
                  desc="Allow this staff member to apply line-item or cart discounts"
                  value={member.canDiscount}
                  onChange={(v) => patchMember({ canDiscount: v })}
                />
                <PermToggle
                  label="View reports"
                  desc="Allow access to the Analytics and Reports sections"
                  value={member.canViewReports}
                  onChange={(v) => patchMember({ canViewReports: v })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveChanges} disabled={saving}>
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
              </button>
              <button className="btn btn-ghost" onClick={() => {
                setStaff((prev) => prev.map((m) => m.id === id ? { ...STAFF_DATA.find((x) => x.id === id)! } : m));
              }}>
                Reset
              </button>
            </div>
          </div>

          {/* Right: role info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head"><span className="card-title">Role permissions guide</span></div>
              <div style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {([
                  { role: 'Cashier', desc: 'Process sales and view their own shifts. Refunds and discounts controlled individually.', color: 'var(--fg-3)' },
                  { role: 'Manager', desc: 'All cashier abilities plus refunds, discounts, and full report access by default.', color: 'var(--info)' },
                  { role: 'Owner',   desc: 'Full access to all features including staff management, settings, and billing.', color: 'var(--accent)' },
                ] as { role: Role; desc: string; color: string }[]).map((r) => (
                  <div
                    key={r.role}
                    style={{
                      padding: '12px 14px', borderRadius: 8, border: `1px solid var(--line)`,
                      background: member.role === r.role ? 'var(--accent-soft)' : 'var(--bg)',
                      borderColor: member.role === r.role ? 'var(--accent-line)' : 'var(--line)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <span className={ROLE_STYLE[r.role]} style={{ fontSize: 10 }}>{r.role}</span>
                      {member.role === r.role && <span className="mono" style={{ fontSize: 10, color: 'var(--accent)' }}>← current</span>}
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
