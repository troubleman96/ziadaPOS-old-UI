'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Seed data ─────────────────────────────────────────────────────────────────
const TODAY  = new Date(2026, 4, 25);
const dAgo   = (n: number) => new Date(TODAY.getTime() - n * 86400000);
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

export { STAFF_DATA };

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
}

const ROLE_STYLE: Record<Role, { pill: string }> = {
  Owner:   { pill: 'pill accent' },
  Manager: { pill: 'pill info'   },
  Cashier: { pill: 'pill'        },
};

const STATUS_STYLE: Record<Status, { pill: string }> = {
  Active:     { pill: 'pill good' },
  'On leave': { pill: 'pill warn' },
  Inactive:   { pill: 'pill'      },
};

const SHIFT_LABEL: Record<Shift, string> = {
  Morning:  '7am – 2pm',
  Evening:  '2pm – 9pm',
  'Full day': '7am – 7pm',
  Weekend:  'Sat – Sun',
};

function ShiftDot({ shift }: { shift: Shift }) {
  const color = shift === 'Morning' ? 'var(--warn)' : shift === 'Evening' ? 'var(--accent)' : shift === 'Full day' ? 'var(--good)' : 'var(--fg-3)';
  return <span className="dot-s" style={{ background: color, flexShrink: 0 }} />;
}

// ── Add staff drawer ──────────────────────────────────────────────────────────
interface AddForm {
  name: string; role: Role; phone: string; email: string;
  shift: Shift; status: Status; pin: string;
}
const EMPTY_FORM: AddForm = {
  name: '', role: 'Cashier', phone: '', email: '', shift: 'Morning', status: 'Active', pin: '',
};

function AddStaffDrawer({ onClose, onSave }: { onClose: () => void; onSave: (m: StaffMember) => void }) {
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AddForm, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof AddForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const errs: typeof errors = {};
    if (!form.name.trim())  errs.name  = 'Required';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (form.pin && !/^\d{4}$/.test(form.pin)) errs.pin = 'Must be 4 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({
        id: `s${String(Math.floor(Math.random() * 900) + 100)}`,
        name: form.name.trim(),
        role: form.role,
        phone: form.phone.trim(),
        email: form.email.trim(),
        status: form.status,
        shift: form.shift,
        joined: TODAY,
        avatarHue: Math.floor(Math.random() * 360),
        pin: form.pin ? '••••' : '',
        salesToday: 0, totalSales: 0, avgTicket: 0,
        txnsToday: 0, txnsTotal: 0,
        canRefund: form.role !== 'Cashier',
        canDiscount: form.role !== 'Cashier',
        canViewReports: form.role !== 'Cashier',
      });
      setSaving(false);
    }, 500);
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Add staff member</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>Fill in the details to create a new team account.</div>
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}>{Icons.close}</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>
          <div className="form-group">
            <label className="form-label">Full name <span style={{ color: 'var(--bad)' }}>*</span></label>
            <input className="form-input" placeholder="e.g. Neema Kiongo" value={form.name} onChange={set('name')} style={{ borderColor: errors.name ? 'var(--bad)' : undefined }} />
            {errors.name && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone <span style={{ color: 'var(--bad)' }}>*</span></label>
            <input className="form-input" placeholder="+255 7XX XXX XXX" value={form.phone} onChange={set('phone')} style={{ borderColor: errors.phone ? 'var(--bad)' : undefined }} />
            {errors.phone && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email (optional)</label>
            <input className="form-input" type="email" placeholder="name@dukakuu.co.tz" value={form.email} onChange={set('email')} />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={form.role} onChange={set('role')}>
                <option>Cashier</option>
                <option>Manager</option>
                <option>Owner</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Shift</label>
              <select className="form-input" value={form.shift} onChange={set('shift')}>
                <option>Morning</option>
                <option>Evening</option>
                <option value="Full day">Full day</option>
                <option>Weekend</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={set('status')}>
                <option>Active</option>
                <option value="On leave">On leave</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">PIN (4 digits)</label>
              <input className="form-input" placeholder="e.g. 1234" maxLength={4} value={form.pin} onChange={set('pin')} style={{ borderColor: errors.pin ? 'var(--bad)' : undefined }} />
              {errors.pin && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.pin}</span>}
            </div>
          </div>

          <div style={{ padding: '11px 14px', borderRadius: 8, background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent)' }}>Note:</strong> Default permissions are set by role. You can customise them from the staff member's detail page.
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              {saving ? 'Saving…' : 'Add staff member'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(STAFF_DATA);
  const [roleFilter, setRoleFilter]     = useState<'All' | Role>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | Status>('All');
  const [query, setQuery]               = useState('');
  const [addOpen, setAddOpen]           = useState(false);
  const [toast, setToast]               = useState<string | null>(null);

  const filtered = useMemo(() => staff.filter((m) => {
    if (roleFilter   !== 'All' && m.role   !== roleFilter)   return false;
    if (statusFilter !== 'All' && m.status !== statusFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.phone.includes(q) && !m.email.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [staff, roleFilter, statusFilter, query]);

  const activeCount    = staff.filter((m) => m.status === 'Active').length;
  const onShiftToday   = staff.filter((m) => m.status === 'Active' && m.shift !== 'Weekend').length;
  const totalSalesToday = staff.reduce((s, m) => s + m.salesToday, 0);
  const totalTxnsToday  = staff.reduce((s, m) => s + m.txnsToday, 0);

  function handleAdd(m: StaffMember) {
    setStaff((prev) => [m, ...prev]);
    setAddOpen(false);
    setToast(`${m.name} added to the team`);
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Staff' }]}
      actions={
        <button className="btn btn-primary" style={{ gap: 6 }} onClick={() => setAddOpen(true)}>
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
          <span className="value">{staff.length}</span>
          <span className="sub">{activeCount} active · {staff.length - activeCount} on leave/inactive</span>
        </div>
        <div className="surface stat-card">
          <span className="label">ACTIVE</span>
          <span className="value" style={{ color: 'var(--good)' }}>{activeCount}</span>
          <span className="sub">{staff.filter(m => m.status === 'On leave').length} on leave today</span>
        </div>
        <div className="surface stat-card">
          <span className="label">ON SHIFT TODAY</span>
          <span className="value">{onShiftToday}</span>
          <span className="sub">{totalTxnsToday} transactions processed</span>
        </div>
        <div className="surface stat-card" style={{ borderColor: totalSalesToday > 0 ? 'var(--accent-line)' : 'var(--line)' }}>
          <span className="label">SALES TODAY</span>
          <span className="value" style={{ color: 'var(--accent)', fontSize: totalSalesToday > 999_999 ? 20 : 26 }}>{fmtShort(totalSalesToday)}</span>
          <span className="sub">across {totalTxnsToday} transactions</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200, padding: '0 10px 0 12px', height: 32, border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg)' }}>
          {Icons.search}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone or email…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }}
          />
          {query && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{filtered.length}</span>}
        </div>

        {/* Role pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(['All', 'Owner', 'Manager', 'Cashier'] as Array<'All' | Role>).map((r) => (
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
              {r}
              <span className="mono" style={{ fontSize: 10, color: roleFilter === r ? 'var(--accent)' : 'var(--fg-4)' }}>
                {r === 'All' ? staff.length : staff.filter(m => m.role === r).length}
              </span>
            </button>
          ))}
        </div>

        <span style={{ width: 1, height: 20, background: 'var(--line-2)', margin: '0 2px' }} />

        {/* Status segment */}
        <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden', background: 'var(--bg)' }}>
          {(['All', 'Active', 'On leave', 'Inactive'] as Array<'All' | Status>).map((s, i, arr) => (
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
              {s}
            </button>
          ))}
        </div>
      </div>

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
            <div style={{ width: 40, height: 40, borderRadius: 999, flexShrink: 0, background: `oklch(52% 0.18 ${m.avatarHue})`, display: 'grid', placeItems: 'center', fontSize: 13.5, fontWeight: 600, color: '#fff' }}>
              {initials(m.name)}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 500, fontSize: 13.5 }}>{m.name}</span>
                <span className={ROLE_STYLE[m.role].pill} style={{ fontSize: 10 }}>{m.role}</span>
              </div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShiftDot shift={m.shift} />
                {m.shift} · {m.phone}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span className={STATUS_STYLE[m.status].pill} style={{ fontSize: 10 }}>{m.status}</span>
              {m.salesToday > 0 && (
                <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>{fmtShort(m.salesToday)} today</div>
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
                <th>Joined</th>
                <th>Status</th>
                <th className="num">Sales today</th>
                <th className="num">Total sales</th>
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
                  {/* Name + role */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: `oklch(52% 0.18 ${m.avatarHue})`, display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 600, color: '#fff' }}>
                        {initials(m.name)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                          <Link href={`/staff/${m.id}`} style={{ fontSize: 13.5, fontWeight: 500, color: 'inherit' }}>{m.name}</Link>
                          <span className={ROLE_STYLE[m.role].pill} style={{ fontSize: 10 }}>{m.role}</span>
                        </div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{m.email || '—'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{m.phone}</td>

                  {/* Shift */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShiftDot shift={m.shift} />
                      <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{m.shift}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2 }}>{SHIFT_LABEL[m.shift]}</div>
                  </td>

                  {/* Joined */}
                  <td className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                    {m.joined.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </td>

                  {/* Status */}
                  <td><span className={STATUS_STYLE[m.status].pill}>{m.status}</span></td>

                  {/* Sales today */}
                  <td className="num mono" style={{ fontSize: 13, color: m.salesToday > 0 ? 'var(--accent)' : 'var(--fg-4)' }}>
                    {m.salesToday > 0 ? fmtShort(m.salesToday) : '—'}
                    {m.txnsToday > 0 && (
                      <div style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 1 }}>{m.txnsToday} txns</div>
                    )}
                  </td>

                  {/* Total sales */}
                  <td className="num mono" style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                    {m.totalSales > 0 ? fmtShort(m.totalSales) : <span style={{ color: 'var(--fg-4)' }}>—</span>}
                  </td>

                  {/* Action */}
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

        {/* Footer */}
        <div style={{ padding: '11px 16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-3)', flexWrap: 'wrap', gap: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
            Showing {filtered.length} of {staff.length} staff members
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
            Today's total:{' '}
            <span style={{ color: 'var(--accent)' }}>{fmt(filtered.reduce((s, m) => s + m.salesToday, 0))}</span>
          </span>
        </div>
      </div>

      {/* Add drawer */}
      {addOpen && <AddStaffDrawer onClose={() => setAddOpen(false)} onSave={handleAdd} />}

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
