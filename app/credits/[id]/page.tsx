'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt } from '../../../lib/utils';
import { CREDIT_CUSTOMERS } from '../../../lib/data';

export default function CreditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState('overview');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');

  const c = CREDIT_CUSTOMERS.find((x) => x.id === id) || CREDIT_CUSTOMERS[0];
  const initials = c.name.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Credits', href: '/credits' }, { label: c.name }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }}>Send reminder</button>
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
        <div style={{ width: 64, height: 64, borderRadius: 999, background: `linear-gradient(135deg, oklch(70% 0.18 ${c.avatarHue}), oklch(60% 0.18 ${c.avatarHue + 30}))`, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 600, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>{c.name}</h1>
            {c.status === 'overdue'  && <span className="pill bad"  style={{ fontSize: 11 }}>{-c.dueDays}d overdue</span>}
            {c.status === 'due-soon' && <span className="pill warn" style={{ fontSize: 11 }}>Due in {c.dueDays}d</span>}
            {c.status === 'current'  && <span className="pill good" style={{ fontSize: 11 }}>Current</span>}
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 14 }}>
            {c.id} <span style={{ color: 'var(--fg-4)', margin: '0 6px' }}>·</span>
            {c.phone}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>BALANCE</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 600, color: c.status === 'overdue' ? 'var(--bad)' : 'var(--fg)', marginTop: 2 }}>{fmt(c._balance ?? 0)}</div>
            </div>
            <div style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>OPEN TABS</div>
              <div style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>{c.tabs.length}</div>
            </div>
            <div style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>PAYMENTS</div>
              <div style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>{c.payments.length}</div>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
          <div>
            {/* Credit tabs table */}
            <div className="surface" style={{ marginBottom: 14 }}>
              <div className="card-head">
                <span className="card-title">Open credit tabs</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{c.tabs.length} transactions</span>
              </div>
              <div className="table-scroll">
              <table className="table">
                <thead><tr>
                  <th style={{ width: 120 }}>TXN ID</th>
                  <th style={{ width: 100 }}>DATE</th>
                  <th>ITEMS</th>
                  <th style={{ width: 90 }}>CASHIER</th>
                  <th style={{ width: 120, textAlign: 'right' }} className="num">AMOUNT</th>
                </tr></thead>
                <tbody>
                  {c.tabs.map((t, i) => (
                    <tr key={i}>
                      <td className="mono" style={{ color: 'var(--accent)' }}>{t.id}</td>
                      <td className="mono" style={{ color: 'var(--fg-3)' }}>{t.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                      <td style={{ color: 'var(--fg-2)' }}>{`${t.items} items`}</td>
                      <td className="mono" style={{ color: 'var(--fg-3)', fontSize: 11.5 }}>{t.cashier}</td>
                      <td className="num" style={{ color: 'var(--bad)', fontWeight: 500 }}>{fmt(t.amount)}</td>
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
              {c.payments.length === 0 ? (
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
                    {c.payments.map((p, i) => (
                      <tr key={i} style={{ cursor: 'default' }}>
                        <td className="mono" style={{ color: 'var(--fg-3)' }}>{p.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
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
                <div className="field-row"><span className="k">Balance</span><span className="v mono" style={{ color: c.status === 'overdue' ? 'var(--bad)' : 'var(--fg)' }}>{fmt(c._balance ?? 0)}</span></div>
                <div className="field-row"><span className="k">Status</span><span className="v">{c.status}</span></div>
              </div>
            </div>

            {c.notes.length > 0 && (
              <div className="surface">
                <div className="card-head"><span className="card-title">Notes</span></div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {c.notes.map((n: { date: Date; by: string; body: string }, i: number) => (
                    <div key={i} style={{ fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.55, padding: '10px 12px', background: 'var(--bg-3)', borderRadius: 6 }}>{n.body}</div>
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
            <span className="card-title">All credit tabs · {c.tabs.length} transactions</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Total: <span style={{ color: 'var(--bad)' }}>{fmt(c._balance ?? 0)}</span></span>
          </div>
          <div className="table-scroll">
          <table className="table">
            <thead><tr>
              <th style={{ width: 120 }}>TXN ID</th>
              <th style={{ width: 100 }}>DATE</th>
              <th>ITEMS</th>
              <th style={{ width: 90 }}>CASHIER</th>
              <th style={{ width: 120, textAlign: 'right' }} className="num">AMOUNT</th>
            </tr></thead>
            <tbody>
              {c.tabs.map((t, i) => (
                <tr key={i}>
                  <td className="mono" style={{ color: 'var(--accent)' }}>{t.id}</td>
                  <td className="mono" style={{ color: 'var(--fg-3)' }}>{t.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                  <td style={{ color: 'var(--fg-2)' }}>{`${t.items} items`}</td>
                  <td className="mono" style={{ color: 'var(--fg-3)', fontSize: 11.5 }}>{t.cashier}</td>
                  <td className="num" style={{ color: 'var(--bad)', fontWeight: 500 }}>{fmt(t.amount)}</td>
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
          {c.payments.length === 0 ? (
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
                {c.payments.map((p, i) => (
                  <tr key={i} style={{ cursor: 'default' }}>
                    <td className="mono" style={{ color: 'var(--fg-3)' }}>{p.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
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
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--fg-3)' }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>No messages sent yet</div>
            <button className="btn btn-soft" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{Icons.sparkles} Draft reminder in Swahili</button>
          </div>
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
                <div style={{ width: 36, height: 36, borderRadius: 999, background: `linear-gradient(135deg, var(--accent), #a855f7)`, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--bad)' }}>Outstanding: {fmt(c._balance ?? 0)}</div>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>AMOUNT (TZS)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={String(c._balance ?? 0)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 15, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', marginBottom: 6 }}>METHOD</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Cash','M-Pesa','Bank'].map((m) => (
                    <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid ' + (method === m ? 'var(--accent-line)' : 'var(--line)'), background: method === m ? 'var(--accent-soft)' : 'var(--bg)', color: method === m ? 'var(--fg)' : 'var(--fg-2)', fontSize: 12, cursor: 'pointer' }}>{m}</button>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13.5, display: 'flex', alignItems: 'center' }}>
                Confirm payment
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
