'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'personal' | 'security' | 'activity';

// ── Seed data ─────────────────────────────────────────────────────────────────

const PROFILE = {
  name:     'Hamisi Mwakapaga',
  initials: 'HM',
  role:     'Owner',
  email:    'hamisi@dukakuu.co.tz',
  phone:    '+255 784 100 001',
  joined:   'February 2023',
  store:    'Duka Kuu — Kariakoo',
  status:   'Active',
  shift:    'Full day',
  totalSales:  12_480_000,
  avgTicket:      42_000,
  txnsTotal:         297,
  canRefund:        true,
  canDiscount:      true,
  canViewReports:   true,
};

const ACTIVITY: Array<{ id: string; time: string; type: 'login' | 'sale' | 'refund' | 'setting'; label: string; sub: string }> = [
  { id: 'a1', time: 'Today, 08:14',    type: 'login',   label: 'Logged in',                   sub: 'Kariakoo · Chrome on macOS' },
  { id: 'a2', time: 'Today, 09:02',    type: 'sale',    label: 'Sale TXN-2043 completed',      sub: 'TZS 84,200 · 7 items · M-Pesa' },
  { id: 'a3', time: 'Yesterday, 17:41',type: 'refund',  label: 'Refund issued TXN-2031',       sub: 'TZS 6,600 · Mkate Bumi 600g ×3' },
  { id: 'a4', time: 'Yesterday, 08:05',type: 'login',   label: 'Logged in',                   sub: 'Kariakoo · Chrome on macOS' },
  { id: 'a5', time: '23 May, 14:22',   type: 'setting', label: 'Updated store profile',        sub: 'Changed opening hours' },
  { id: 'a6', time: '22 May, 10:11',   type: 'sale',    label: 'Sale TXN-2019 completed',      sub: 'TZS 156,000 · 12 items · Cash' },
  { id: 'a7', time: '20 May, 08:00',   type: 'login',   label: 'Logged in',                   sub: 'Kariakoo · Safari on iPhone' },
];

const ACTIVITY_COLORS: Record<string, { bg: string; color: string; icon: string }> = {
  login:   { bg: 'rgba(99,102,241,0.10)', color: '#a5a8ff', icon: '→' },
  sale:    { bg: 'rgba(16,185,129,0.10)', color: 'var(--good)', icon: '✓' },
  refund:  { bg: 'rgba(251,191,36,0.10)', color: 'var(--warn)', icon: '↩' },
  setting: { bg: 'rgba(148,163,184,0.10)', color: 'var(--fg-3)', icon: '⚙' },
};

// ── Small atoms ───────────────────────────────────────────────────────────────

function Field({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label style={{ fontSize: 12.5, color: 'var(--fg-2)', fontWeight: 500 }}>{label}</label>
        {note && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{note}</span>}
      </div>
      <input
        defaultValue={value}
        style={{
          padding: '9px 12px', borderRadius: 7, border: '1px solid var(--line)',
          background: 'var(--bg)', color: 'var(--fg)',
          fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
          width: '100%', boxSizing: 'border-box',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
      />
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12.5, color: 'var(--fg-2)', fontWeight: 500 }}>{label}</label>
      <div style={{
        padding: '9px 12px', borderRadius: 7, border: '1px solid var(--line)',
        background: 'var(--bg-3)', color: 'var(--fg-3)',
        fontSize: 13.5,
      }}>{value}</div>
    </div>
  );
}

function PermBadge({ granted, label }: { granted: boolean; label: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '9px 12px', borderRadius: 8,
      background: granted ? 'rgba(16,185,129,0.08)' : 'var(--bg-3)',
      border: `1px solid ${granted ? 'rgba(16,185,129,0.20)' : 'var(--line)'}`,
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: 999, flexShrink: 0,
        background: granted ? 'var(--good)' : 'var(--bg-4)',
        display: 'grid', placeItems: 'center',
        fontSize: 9, color: granted ? '#fff' : 'var(--fg-4)',
      }}>{granted ? '✓' : '✕'}</span>
      <span style={{ fontSize: 13, color: granted ? 'var(--fg)' : 'var(--fg-3)' }}>{label}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('personal');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Profile' }]}>
      {/* ── Hero card ── */}
      <div className="surface" style={{ marginBottom: 20, padding: '24px 24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 999,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#fff', display: 'grid', placeItems: 'center',
              fontSize: 22, fontWeight: 600,
            }}>HM</div>
            <button style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 22, height: 22, borderRadius: 999,
              background: 'var(--bg-2)', border: '1.5px solid var(--line)',
              display: 'grid', placeItems: 'center', cursor: 'pointer',
              color: 'var(--fg-2)',
            }}>{Icons.edit}</button>
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em' }}>
                {PROFILE.name}
              </h1>
              <span className="pill good" style={{ fontSize: 10 }}>
                <span className="dot-s" style={{ background: 'var(--good)' }} />
                {PROFILE.status}
              </span>
            </div>
            <div style={{ marginTop: 4, fontSize: 13.5, color: 'var(--fg-3)' }}>
              {PROFILE.role} · {PROFILE.store}
            </div>
            <div className="mono" style={{ marginTop: 6, fontSize: 11, color: 'var(--fg-4)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>{PROFILE.email}</span>
              <span>{PROFILE.phone}</span>
              <span>Joined {PROFILE.joined}</span>
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'TOTAL SALES', value: fmtShort(PROFILE.totalSales) },
              { label: 'AVG TICKET',  value: fmtShort(PROFILE.avgTicket)  },
              { label: 'TRANSACTIONS', value: PROFILE.txnsTotal.toLocaleString() },
            ].map((k) => (
              <div key={k.label} style={{
                padding: '10px 16px', borderRadius: 8,
                background: 'var(--bg-3)', border: '1px solid var(--line)',
                textAlign: 'center', minWidth: 90,
              }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 4 }}>{k.label}</div>
                <div className="mono" style={{ fontSize: 16, fontWeight: 500 }}>{k.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
        {([
          { id: 'personal', label: 'Personal info' },
          { id: 'security', label: 'Security' },
          { id: 'activity', label: 'Activity log' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 14px', border: 'none', background: 'transparent',
              fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer',
              color: tab === t.id ? 'var(--fg)' : 'var(--fg-3)',
              fontWeight: tab === t.id ? 500 : 400,
              borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
              marginBottom: -1,
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Tab: Personal info ── */}
      {tab === 'personal' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16 }}>
          {/* Left — editable fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Contact details</div>
              <div className="form-grid-2" style={{ gap: 14 }}>
                <Field label="Full name"     value={PROFILE.name}  />
                <ReadonlyField label="Role"  value={PROFILE.role}  />
                <Field label="Email address" value={PROFILE.email} />
                <Field label="Phone number"  value={PROFILE.phone} />
              </div>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {saved ? Icons.check : null} {saved ? 'Saved' : 'Save changes'}
                </button>
                {saved && (
                  <span style={{ fontSize: 12.5, color: 'var(--good)' }}>Changes saved successfully</span>
                )}
              </div>
            </div>
          </div>

          {/* Right — read-only meta + permissions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Account info</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ReadonlyField label="Store"        value={PROFILE.store}   />
                <ReadonlyField label="Shift"        value={PROFILE.shift}   />
                <ReadonlyField label="Member since" value={PROFILE.joined}  />
              </div>
            </div>

            <div className="surface" style={{ padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Permissions</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', marginBottom: 14 }}>Managed by store owner</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <PermBadge granted={PROFILE.canRefund}       label="Issue refunds" />
                <PermBadge granted={PROFILE.canDiscount}     label="Apply discounts" />
                <PermBadge granted={PROFILE.canViewReports}  label="View reports & analytics" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Security ── */}
      {tab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Change password */}
            <div className="surface" style={{ padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Change password</div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 16 }}>
                Used to log in to your Ziada account.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Current password', ph: '••••••••' },
                  { label: 'New password',      ph: 'Min. 8 characters' },
                  { label: 'Confirm new',        ph: 'Repeat new password' },
                ].map((f) => (
                  <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 12.5, color: 'var(--fg-2)', fontWeight: 500 }}>{f.label}</label>
                    <input
                      type="password"
                      placeholder={f.ph}
                      style={{
                        padding: '9px 12px', borderRadius: 7, border: '1px solid var(--line)',
                        background: 'var(--bg)', color: 'var(--fg)',
                        fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
                        width: '100%', boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                    />
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16 }}>Update password</button>
            </div>

            {/* Change POS PIN */}
            <div className="surface" style={{ padding: '20px 20px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>POS PIN</div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 16 }}>
                4-digit PIN used to authenticate at the Point of Sale.
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, maxWidth: 160 }}>
                  <label style={{ fontSize: 12.5, color: 'var(--fg-2)', fontWeight: 500 }}>New PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    style={{
                      padding: '9px 12px', borderRadius: 7, border: '1px solid var(--line)',
                      background: 'var(--bg)', color: 'var(--fg)',
                      fontSize: 18, outline: 'none', fontFamily: 'var(--mono)',
                      letterSpacing: '0.3em', width: '100%', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                  />
                </div>
                <button className="btn btn-primary">Change PIN</button>
              </div>
            </div>
          </div>

          {/* Right — sessions */}
          <div className="surface" style={{ padding: '20px 20px 16px' }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Active sessions</div>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 16 }}>Devices currently signed in.</div>
            {[
              { device: 'Chrome on macOS', location: 'Dar es Salaam, TZ', time: 'Active now', current: true },
              { device: 'Safari on iPhone', location: 'Kariakoo, TZ',      time: '2 days ago', current: false },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderTop: i > 0 ? '1px solid var(--line)' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: 'var(--bg-3)', border: '1px solid var(--line)',
                  display: 'grid', placeItems: 'center', fontSize: 16,
                }}>
                  {s.device.includes('iPhone') ? '📱' : '💻'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.device}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2 }}>
                    {s.location} · {s.time}
                  </div>
                </div>
                {s.current
                  ? <span className="pill good" style={{ fontSize: 10 }}>This device</span>
                  : <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: 'var(--bad)' }}>Revoke</button>
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Activity log ── */}
      {tab === 'activity' && (
        <div className="surface" style={{ overflow: 'hidden' }}>
          <div className="card-head">
            <span className="card-title">Recent activity</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>Last 7 days</span>
          </div>
          <div>
            {ACTIVITY.map((entry, i) => {
              const meta = ACTIVITY_COLORS[entry.type];
              return (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '12px 16px',
                  borderTop: i > 0 ? '1px solid var(--line)' : 'none',
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                    background: meta.bg, color: meta.color,
                    display: 'grid', placeItems: 'center',
                    fontSize: 11, fontWeight: 700, marginTop: 1,
                  }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{entry.label}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 2 }}>{entry.sub}</div>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', flexShrink: 0, marginTop: 2, textAlign: 'right' }}>
                    {entry.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
