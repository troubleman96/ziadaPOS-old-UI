'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtShort } from '../../../lib/utils';
import { customerApi, CustomerListItem } from '../../../lib/api';

// ── SMS icon (matches the inline WhatsApp icon style below) ────────────────────
const SmsIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5h12v7H6l-2.5 2.5V10.5H2v-7z" />
    </g>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysAgoLabel(dateStr: string | null) {
  if (!dateStr) return 'Never';
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return `${diff} days ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function monthLabel(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

const SEGMENT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  VIP:        { bg: 'var(--warn-soft)',   color: 'var(--warn)',   border: 'rgba(251,191,36,0.3)' },
  Regular:    { bg: 'var(--accent-soft)', color: 'var(--accent)', border: 'var(--accent-line)' },
  Occasional: { bg: 'var(--bg-3)',        color: 'var(--fg-2)',   border: 'var(--line-2)' },
  New:        { bg: 'var(--good-soft)',   color: 'var(--good)',   border: 'rgba(52,211,153,0.3)' },
};

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid var(--line-2)',borderTopColor:'var(--accent)',animation:'spin 0.7s linear infinite',margin:'0 auto'}} />
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<CustomerListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<'overview' | 'credit'>('overview');
  const [editOpen, setEditOpen] = useState(false);

  const [smsOpen, setSmsOpen] = useState(false);
  const [smsBody, setSmsBody] = useState('');
  const [sendingSms, setSendingSms] = useState(false);
  const [smsErr, setSmsErr] = useState<string | null>(null);
  const [smsSent, setSmsSent] = useState(false);

  async function sendSms() {
    if (!customer || !smsBody.trim()) return;
    setSendingSms(true);
    setSmsErr(null);
    const res = await customerApi.sendSms(customer.id, smsBody.trim());
    setSendingSms(false);
    if (res.success) {
      setSmsSent(true);
      setTimeout(() => { setSmsOpen(false); setSmsSent(false); setSmsBody(''); }, 1200);
    } else {
      setSmsErr(res.message);
    }
  }

  useEffect(() => {
    setLoading(true);
    customerApi.getDetail(id).then((res) => {
      if (res.success) {
        setCustomer(res.data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Customers', href: '/customers' }, { label: 'Loading…' }]}>
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-3)' }}>Loading customer…</div>
        </div>
      </AppShell>
    );
  }

  if (notFound || !customer) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Customers', href: '/customers' }, { label: 'Not found' }]}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Customer not found</div>
          <p style={{ color: 'var(--fg-3)', marginBottom: 24 }}>No customer with ID "{id}" exists.</p>
          <Link href="/customers" className="btn btn-primary">← Back to Customers</Link>
        </div>
      </AppShell>
    );
  }

  const seg = SEGMENT_COLORS[customer.segment] ?? SEGMENT_COLORS.Occasional;
  const visitCount = customer.avg_ticket > 0 ? Math.round(customer.total_spent / customer.avg_ticket) : 0;

  return (
    <AppShell
      crumbs={[
        { label: 'ziada', href: '/' },
        { label: 'Customers', href: '/customers' },
        { label: customer.name },
      ]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
            <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <g stroke="#25d366" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 14l1-3a6 6 0 1 1 2.5 2.5L2 14z" />
                </g>
              </svg>
              WhatsApp
            </button>
          </a>
          <button className="btn btn-soft" onClick={() => { setSmsOpen(true); setSmsErr(null); setSmsSent(false); }} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            {SmsIcon} SMS
          </button>
          <button className="btn btn-soft" onClick={() => setEditOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            {Icons.edit} Edit
          </button>
        </div>
      }
    >
      {/* Back link */}
      <Link href="/customers" className="back-link" style={{ marginBottom: 16, display: 'inline-flex' }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All customers
      </Link>

      {/* Profile hero */}
      <div className="surface" style={{ padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 999, flexShrink: 0,
          background: `hsl(${customer.avatar_hue}, 60%, 50%)`,
          display: 'grid', placeItems: 'center',
          fontSize: 22, fontWeight: 600, color: '#fff',
        }}>
          {customer.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>{customer.name}</h1>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '3px 9px', borderRadius: 999, fontSize: 11.5,
              background: seg.bg, color: seg.color, border: '1px solid ' + seg.border,
            }}>
              {customer.segment}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3a1.5 1.5 0 0 1 1.5-1.5h1l1.5 3.5-1.5 1A9 9 0 0 0 10 10l1-1.5 3.5 1.5v1A1.5 1.5 0 0 1 13 12.5C7 12.5 3 8.5 3 3z" /></g></svg>
              {customer.phone}
            </span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" /><path d="M2 14c.5-2.5 3-4 6-4s5.5 1.5 6 4" /></g></svg>
              Customer since {monthLabel(customer.created_at)}
            </span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 2v2M11 2v2M2 7h12" /></g></svg>
              Last visit {daysAgoLabel(customer.last_visit)}
            </span>
          </div>
        </div>

        {/* Quick stats on right */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {customer.open_credit > 0 && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, textAlign: 'center',
              background: 'var(--warn-soft)', border: '1px solid rgba(251,191,36,0.3)',
            }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--warn)', letterSpacing: '0.08em', marginBottom: 3 }}>OPEN CREDIT</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--warn)' }}>{fmtShort(customer.open_credit)}</div>
            </div>
          )}
          <div style={{
            padding: '10px 14px', borderRadius: 8, textAlign: 'center',
            background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
          }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 3 }}>LIFETIME VALUE</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{fmtShort(customer.total_spent)}</div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface stat-card">
          <span className="label">TOTAL SPENT</span>
          <span className="value">{fmtShort(customer.total_spent)}</span>
          <span className="sub">lifetime purchases</span>
        </div>
        <div className="surface stat-card">
          <span className="label">AVG TICKET</span>
          <span className="value">{fmtShort(customer.avg_ticket)}</span>
          <span className="sub">per transaction</span>
        </div>
        <div className="surface stat-card" style={{ borderColor: customer.open_credit > 0 ? 'rgba(251,191,36,0.3)' : undefined }}>
          <span className="label">OPEN CREDIT</span>
          <span className="value" style={{ color: customer.open_credit > 0 ? 'var(--warn)' : 'var(--good)', fontSize: 22 }}>
            {customer.open_credit > 0 ? fmtShort(customer.open_credit) : 'None'}
          </span>
          <span className="sub">{customer.open_credit > 0 ? 'outstanding balance' : 'fully settled'}</span>
        </div>
        <div className="surface stat-card">
          <span className="label">TOTAL VISITS</span>
          <span className="value">{visitCount}</span>
          <span className="sub">transactions recorded</span>
        </div>
      </div>

      {/* Main content */}
      <div className="detail-grid">
        {/* Left: tabbed content */}
        <div>
          {/* Tabs */}
          <div className="tabs">
            {(['overview', 'credit'] as const).map((t) => (
              <button
                key={t}
                className={'tab' + (tab === t ? ' active' : '')}
                onClick={() => setTab(t)}
                style={{ textTransform: 'capitalize' }}
              >
                {t === 'credit' ? 'Credit history' : 'Overview'}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Purchase behaviour */}
              <div className="surface" style={{ overflow: 'hidden' }}>
                <div className="card-head">
                  <span className="card-title">Purchase behaviour</span>
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Total visits (est.)', value: `${visitCount}` },
                    { label: 'Avg ticket', value: fmtShort(customer.avg_ticket) },
                    { label: 'Total spent', value: fmtShort(customer.total_spent) },
                    { label: 'Last visit', value: daysAgoLabel(customer.last_visit) },
                  ].map((row) => (
                    <div key={row.label} className="field-row">
                      <span className="k">{row.label}</span>
                      <span className="v mono" style={{ fontSize: 12.5 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="surface" style={{ overflow: 'hidden' }}>
                  <div className="card-head">
                    <span className="card-title">Notes</span>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Credit tab */}
          {tab === 'credit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {customer.open_credit > 0 ? (
                <div style={{
                  padding: '16px 20px', borderRadius: 10,
                  background: 'var(--warn-soft)', border: '1px solid rgba(251,191,36,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
                }}>
                  <div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--warn)', letterSpacing: '0.08em', marginBottom: 4 }}>OUTSTANDING BALANCE</div>
                    <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--warn)', letterSpacing: '-0.02em' }}>{fmt(customer.open_credit)}</div>
                  </div>
                  <Link href={`/credits/${customer.id}`}>
                    <button className="btn btn-primary" style={{ background: 'var(--warn)', whiteSpace: 'nowrap' }}>
                      View full credit history
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="surface" style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No open credit</div>
                  <p style={{ color: 'var(--fg-3)', fontSize: 13, margin: 0 }}>
                    {customer.name} has no outstanding credit balance.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Contact card */}
          <div className="surface" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <span className="card-title">Contact info</span>
              <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setEditOpen(true)}>{Icons.edit}</button>
            </div>
            <div style={{ padding: '4px 16px 8px' }}>
              {[
                { k: 'Phone',    v: customer.phone },
                { k: 'Email',    v: customer.email || '—' },
                { k: 'Segment',  v: customer.segment },
                { k: 'Since',    v: monthLabel(customer.created_at) },
                { k: 'ID',       v: customer.id },
              ].map((row) => (
                <div key={row.k} className="field-row">
                  <span className="k">{row.k}</span>
                  <span className="v mono" style={{ fontSize: 12 }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="surface" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="card-title" style={{ marginBottom: 6 }}>Quick actions</div>
            <a
              href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <button className="btn btn-soft" style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <g stroke="#25d366" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 14l1-3a6 6 0 1 1 2.5 2.5L2 14z" />
                  </g>
                </svg>
                WhatsApp message
              </button>
            </a>
            {customer.open_credit > 0 && (
              <Link href={`/credits/${customer.id}`} style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Record credit payment
                </button>
              </Link>
            )}
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'var(--bad)' }}>
              {Icons.trash} Delete customer
            </button>
          </div>
        </div>
      </div>

      {/* Edit drawer */}
      {editOpen && (
        <div className="drawer-overlay" onClick={() => setEditOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <span style={{ fontWeight: 500 }}>Edit customer</span>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setEditOpen(false)}>×</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Full name',     value: customer.name },
                { label: 'Phone number',  value: customer.phone },
              ].map((f) => (
                <div key={f.label} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" defaultValue={f.value} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Segment</label>
                <select className="form-input" defaultValue={customer.segment}>
                  {['VIP', 'Regular', 'Occasional', 'New'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save changes</button>
                <button className="btn btn-ghost" onClick={() => setEditOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send SMS drawer */}
      {smsOpen && (
        <div className="drawer-overlay" onClick={() => setSmsOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <span style={{ fontWeight: 500 }}>Send SMS to {customer.name}</span>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setSmsOpen(false)}>×</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{customer.phone}</div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-input"
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  rows={4}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 4 }}>{smsBody.length} chars · {Math.ceil(smsBody.length / 160) || 1} SMS part(s)</div>
              </div>
              {smsErr && (
                <div style={{ padding: '10px 12px', borderRadius: 7, background: 'var(--bad-soft)', border: '1px solid rgba(248,113,113,0.25)', fontSize: 12.5, color: 'var(--bad)' }}>
                  {smsErr}
                  {smsErr.toLowerCase().includes('not configured') && (
                    <> — <Link href="/settings" style={{ color: 'var(--bad)', textDecoration: 'underline' }}>configure in Settings</Link></>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={sendSms} disabled={sendingSms || !smsBody.trim()} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                  {sendingSms ? 'Sending…' : smsSent ? 'Sent!' : 'Send SMS'}
                </button>
                <button className="btn btn-ghost" onClick={() => setSmsOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
