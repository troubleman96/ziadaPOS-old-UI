'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt } from '../../../lib/utils';
import { creditsApi, CreditCustomerProfile } from '../../../lib/api';

const SPINNER = (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
  </>
);

export default function CreditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState('overview');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<CreditCustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderBody, setReminderBody] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderErr, setReminderErr] = useState<string | null>(null);

  function reload() {
    creditsApi.getCustomerProfile(id).then(r => { if (r.success) setProfile(r.data); });
  }

  useEffect(() => {
    setLoading(true);
    creditsApi.getCustomerProfile(id).then((res) => {
      setLoading(false);
      if (res.success) setProfile(res.data);
      else setError(true);
    });
  }, [id]);

  async function handlePayment() {
    if (!profile || !amount) return;
    setSaving(true);
    const res = await creditsApi.recordPayment(profile.customer.id, { amount: parseFloat(amount), method });
    setSaving(false);
    if (res.success) {
      setPaymentOpen(false);
      setAmount('');
      reload();
    }
  }

  function openReminder() {
    if (!profile) return;
    setReminderBody(`Habari ${profile.customer.name}, unadaiwa TZS ${profile.customer.open_credit.toLocaleString()} katika Duka Kuu. Tafadhali lipa deni lako. Asante.`);
    setReminderErr(null);
    setReminderOpen(true);
  }

  async function sendReminder() {
    if (!profile || !reminderBody.trim()) return;
    setSendingReminder(true);
    setReminderErr(null);
    const res = await creditsApi.sendReminder(profile.customer.id, { kind: 'sms', body: reminderBody.trim() });
    setSendingReminder(false);
    if (res.success && res.data.sms_error) {
      setReminderErr(res.data.sms_error);
      reload();
      return;
    }
    if (!res.success) {
      setReminderErr(res.message);
      return;
    }
    setReminderOpen(false);
    setReminderBody('');
    reload();
  }

  if (loading) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Credits', href: '/credits' }, { label: '…' }]}>
        <div style={{ padding: 80, textAlign: 'center' }}>{SPINNER}</div>
      </AppShell>
    );
  }

  if (error || !profile) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Credits', href: '/credits' }, { label: 'Not found' }]}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Customer not found</div>
          <p style={{ color: 'var(--fg-3)', marginBottom: 24 }}>No credit profile found for this customer.</p>
          <Link href="/credits" className="btn btn-primary">← Back to credits</Link>
        </div>
      </AppShell>
    );
  }

  const c = profile.customer;
  const tabs = profile.tabs ?? [];
  const payments = profile.payments ?? [];
  const messages = profile.messages ?? [];
  const notes = profile.notes ?? [];

  const initials = c.initials || c.name.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase();
  const totalBalance = tabs.reduce((s, t) => s + t.balance, 0);
  const overdueStatus = tabs.some(t => t.is_overdue) ? 'overdue' : tabs.some(t => t.due_date && new Date(t.due_date) <= new Date(Date.now() + 7*86400000)) ? 'due-soon' : 'current';

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Credits', href: '/credits' }, { label: c.name }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={openReminder} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }}>Send reminder</button>
          <button onClick={() => setPaymentOpen(true)} className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            Record payment
          </button>
        </div>
      }
    >
      {/* Back */}
      <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--fg-3)' }}>
        <Link href="/credits" style={{ color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>{Icons.chevRight}</span>
          Back to credits
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: `hsl(${c.avatar_hue}, 60%, 50%)`, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 600, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>{c.name}</h1>
            {overdueStatus === 'overdue'   && <span className="pill bad"  style={{ fontSize: 11 }}>Overdue</span>}
            {overdueStatus === 'due-soon'  && <span className="pill warn" style={{ fontSize: 11 }}>Due soon</span>}
            {overdueStatus === 'current'   && <span className="pill good" style={{ fontSize: 11 }}>Current</span>}
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 14 }}>
            {c.id} <span style={{ color: 'var(--fg-4)', margin: '0 6px' }}>·</span>
            {c.phone}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>BALANCE</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 600, color: overdueStatus === 'overdue' ? 'var(--bad)' : 'var(--fg)', marginTop: 2 }}>{fmt(c.open_credit)}</div>
            </div>
            <div style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>OPEN TABS</div>
              <div style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>{tabs.length}</div>
            </div>
            <div style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>PAYMENTS</div>
              <div style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>{payments.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--line)', marginBottom: 18, display: 'flex', gap: 4 }}>
        {[['overview','Overview'],['tabs','Credit tabs'],['payments','Payments'],['messages','Messages']].map(([k,l]) => (
          <button key={k} className={'tab-btn' + (tab === k ? ' active' : '')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
          <div>
            {/* Credit tabs table */}
            <div className="surface" style={{ marginBottom: 14 }}>
              <div className="card-head">
                <span className="card-title">Open credit tabs</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{tabs.length} transactions</span>
              </div>
              <div className="table-scroll">
              <table className="table">
                <thead><tr>
                  <th style={{ width: 120 }}>TXN ID</th>
                  <th style={{ width: 100 }}>DATE</th>
                  <th style={{ width: 90 }}>STATUS</th>
                  <th style={{ width: 120, textAlign: 'right' }} className="num">AMOUNT</th>
                  <th style={{ width: 120, textAlign: 'right' }} className="num">BALANCE</th>
                </tr></thead>
                <tbody>
                  {tabs.map((t) => (
                    <tr key={t.id}>
                      <td className="mono" style={{ color: 'var(--accent)' }}>{t.txn_number}</td>
                      <td className="mono" style={{ color: 'var(--fg-3)' }}>{new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                      <td><span className={`pill ${t.is_overdue ? 'bad' : t.status === 'paid' ? 'good' : 'warn'}`}>{t.status}</span></td>
                      <td className="num" style={{ color: 'var(--fg-2)', fontWeight: 500 }}>{fmt(t.amount)}</td>
                      <td className="num" style={{ color: 'var(--bad)', fontWeight: 500 }}>{fmt(t.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            {/* Payment history */}
            <div className="surface">
              <div className="card-head">
                <span className="card-title">Payment history</span>
                <button onClick={() => setPaymentOpen(true)} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: 12 }}>+ Record payment</button>
              </div>
              {payments.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No payments recorded yet.</div>
              ) : (
                <div className="table-scroll">
                <table className="table">
                  <thead><tr>
                    <th style={{ width: 120 }}>DATE</th>
                    <th>METHOD</th>
                    <th>NOTE</th>
                    <th style={{ width: 120, textAlign: 'right' }} className="num">AMOUNT</th>
                  </tr></thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} style={{ cursor: 'default' }}>
                        <td className="mono" style={{ color: 'var(--fg-3)' }}>{new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                        <td><span className="pill good">{p.method}</span></td>
                        <td style={{ color: 'var(--fg-2)' }}>{p.note}</td>
                        <td className="num" style={{ color: 'var(--good)', fontWeight: 500 }}>{fmt(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div>
            <div className="surface" style={{ marginBottom: 14 }}>
              <div className="card-head"><span className="card-title">Customer details</span></div>
              <div style={{ padding: '14px 16px' }}>
                <div className="field-row"><span className="k">Name</span><span className="v">{c.name}</span></div>
                <div className="field-row"><span className="k">Phone</span><span className="v mono">{c.phone}</span></div>
                <div className="field-row"><span className="k">Customer ID</span><span className="v mono" style={{ color: 'var(--fg-3)' }}>{c.id}</span></div>
                <div className="field-row"><span className="k">Open credit</span><span className="v mono" style={{ color: overdueStatus === 'overdue' ? 'var(--bad)' : 'var(--fg)' }}>{fmt(c.open_credit)}</span></div>
                <div className="field-row"><span className="k">Total spent</span><span className="v mono">{fmt(c.total_spent)}</span></div>
                <div className="field-row"><span className="k">Avg ticket</span><span className="v mono">{fmt(c.avg_ticket)}</span></div>
                {c.last_visit && <div className="field-row"><span className="k">Last visit</span><span className="v mono">{new Date(c.last_visit).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>}
              </div>
            </div>

            {notes.length > 0 && (
              <div className="surface">
                <div className="card-head"><span className="card-title">Notes</span></div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {notes.map((n) => (
                    <div key={n.id} style={{ fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.55, padding: '10px 12px', background: 'var(--bg-3)', borderRadius: 6 }}>{n.body}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'tabs' && (
        <div className="surface">
          <div className="card-head">
            <span className="card-title">All credit tabs · {tabs.length} transactions</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Total: <span style={{ color: 'var(--bad)' }}>{fmt(c.open_credit)}</span></span>
          </div>
          <div className="table-scroll">
          <table className="table">
            <thead><tr>
              <th style={{ width: 120 }}>TXN ID</th>
              <th style={{ width: 100 }}>DATE</th>
              <th style={{ width: 90 }}>STATUS</th>
              <th style={{ width: 120, textAlign: 'right' }} className="num">AMOUNT</th>
              <th style={{ width: 120, textAlign: 'right' }} className="num">BALANCE</th>
            </tr></thead>
            <tbody>
              {tabs.map((t) => (
                <tr key={t.id}>
                  <td className="mono" style={{ color: 'var(--accent)' }}>{t.txn_number}</td>
                  <td className="mono" style={{ color: 'var(--fg-3)' }}>{new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                  <td><span className={`pill ${t.is_overdue ? 'bad' : t.status === 'paid' ? 'good' : 'warn'}`}>{t.status}</span></td>
                  <td className="num" style={{ color: 'var(--fg-2)', fontWeight: 500 }}>{fmt(t.amount)}</td>
                  <td className="num" style={{ color: 'var(--bad)', fontWeight: 500 }}>{fmt(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="surface">
          <div className="card-head">
            <span className="card-title">Payment history</span>
            <button onClick={() => setPaymentOpen(true)} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: 12 }}>+ Record payment</button>
          </div>
          {payments.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-3)' }}>No payments recorded yet.</div>
          ) : (
            <div className="table-scroll">
            <table className="table">
              <thead><tr>
                <th style={{ width: 120 }}>DATE</th>
                <th style={{ width: 110 }}>METHOD</th>
                <th>NOTE</th>
                <th style={{ width: 130, textAlign: 'right' }} className="num">AMOUNT</th>
              </tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} style={{ cursor: 'default' }}>
                    <td className="mono" style={{ color: 'var(--fg-3)' }}>{new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td><span className="pill good">{p.method}</span></td>
                    <td style={{ color: 'var(--fg-2)' }}>{p.note}</td>
                    <td className="num" style={{ color: 'var(--good)', fontWeight: 500 }}>{fmt(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

      {tab === 'messages' && (
        <div className="surface">
          <div className="card-head">
            <span className="card-title">Messages & reminders</span>
            <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.sparkles} Draft with AI</button>
          </div>
          {messages.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--fg-3)' }}>
              <div style={{ fontSize: 14, marginBottom: 8 }}>No messages sent yet</div>
              <button onClick={openReminder} className="btn btn-soft" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{Icons.sparkles} Draft reminder in Swahili</button>
            </div>
          ) : (
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m) => (
                <div key={m.id} style={{ padding: '10px 14px', borderRadius: 8, background: m.direction === 'outbound' ? 'var(--accent-soft)' : 'var(--bg-3)', border: '1px solid var(--line)', fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55 }}>
                  <div style={{ marginBottom: 4 }}>{m.body}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{m.channel} · {m.sent_by_name} · {new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Record payment drawer */}
      {paymentOpen && (
        <div className="drawer-overlay" onClick={() => setPaymentOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <span style={{ fontSize: 15, fontWeight: 500 }}>Record payment</span>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setPaymentOpen(false)}>×</button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: `hsl(${c.avatar_hue}, 60%, 50%)`, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--bad)' }}>Outstanding: {fmt(c.open_credit)}</div>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>AMOUNT (TZS)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={String(c.open_credit)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 15, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', marginBottom: 6 }}>METHOD</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Cash','M-Pesa','Bank'].map((m) => (
                    <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid ' + (method === m ? 'var(--accent-line)' : 'var(--line)'), background: method === m ? 'var(--accent-soft)' : 'var(--bg)', color: method === m ? 'var(--fg)' : 'var(--fg-2)', fontSize: 12, cursor: 'pointer' }}>{m}</button>
                  ))}
                </div>
              </div>
              <button onClick={handlePayment} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13.5, display: 'flex', alignItems: 'center' }}>
                {saving ? 'Saving…' : 'Confirm payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send reminder drawer */}
      {reminderOpen && (
        <div className="drawer-overlay" onClick={() => setReminderOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <span style={{ fontSize: 15, fontWeight: 500 }}>Send SMS reminder</span>
              <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setReminderOpen(false)}>×</button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: `hsl(${c.avatar_hue}, 60%, 50%)`, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{c.phone}</div>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>MESSAGE</label>
                <textarea
                  value={reminderBody}
                  onChange={(e) => setReminderBody(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13.5, outline: 0, boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                />
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 4 }}>{reminderBody.length} chars · {Math.ceil(reminderBody.length / 160) || 1} SMS part(s)</div>
              </div>
              {reminderErr && (
                <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 7, background: 'var(--bad-soft)', border: '1px solid rgba(248,113,113,0.25)', fontSize: 12.5, color: 'var(--bad)' }}>
                  {reminderErr}
                  {reminderErr.toLowerCase().includes('not configured') && (
                    <> — <Link href="/settings" style={{ color: 'var(--bad)', textDecoration: 'underline' }}>configure in Settings</Link></>
                  )}
                </div>
              )}
              <button onClick={sendReminder} disabled={sendingReminder || !reminderBody.trim()} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13.5, display: 'flex', alignItems: 'center' }}>
                {sendingReminder ? 'Sending…' : 'Send SMS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
