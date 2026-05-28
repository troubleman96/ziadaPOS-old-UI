'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';
import { CREDIT_CUSTOMERS, CREDIT_TOTALS, AGING_BUCKETS } from '../../lib/data';

const PhoneIcon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3.5 2.5l2 .5 1 2.5-1.5 1.5a8 8 0 0 0 4 4l1.5-1.5 2.5 1 .5 2-1 1a11 11 0 0 1-10-10l1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>;
const WhatsAppMini = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 14l1-3a6 6 0 1 1 2.5 2.5L2 14z"/></g></svg>;
const CashSmall = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="4" width="13" height="8" rx="1"/><circle cx="8" cy="8" r="1.5"/></g></svg>;

function avatarFromName(name: string) {
  return name.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase();
}

function StatusPill({ status, days }: { status: string; days: number }) {
  if (status === 'overdue')  return <span className="pill bad"  style={{ fontSize: 11 }}>{-days}d overdue</span>;
  if (status === 'due-soon') return <span className="pill warn" style={{ fontSize: 11 }}>Due in {days}d</span>;
  return <span className="pill good" style={{ fontSize: 11 }}>Current · {days}d</span>;
}

function AgingBar({ buckets }: { buckets: typeof AGING_BUCKETS }) {
  const total = buckets.reduce((s, b) => s + b.amount, 0) || 1;
  return (
    <div>
      <div className="aging-bar">
        {buckets.map((b) => {
          const pct = (b.amount / total) * 100;
          if (b.amount === 0) return null;
          return <div key={b.label} className="aging-seg" style={{ flex: pct, background: b.color }} title={`${b.label}: ${fmt(b.amount)}`}></div>;
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {buckets.map((b) => (
          <div key={b.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 10px', borderRadius: 7, border: '1px solid var(--line)', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: b.color }}></span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.04em' }}>{b.range.toUpperCase()}</span>
            </div>
            <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg)', fontWeight: 500 }}>{b.amount === 0 ? '—' : fmtShort(b.amount)}</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Record Payment Drawer ─────────────────────────────────────────────────────
function RecordPaymentDrawer({ open, customer, onClose }: { open: boolean; customer: typeof CREDIT_CUSTOMERS[0] | null; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  if (!open || !customer) return null;
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <span style={{ fontSize: 15, fontWeight: 500 }}>Record payment</span>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: `linear-gradient(135deg, var(--accent), #a855f7)`, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>
              {avatarFromName(customer.name)}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{customer.name}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--bad)' }}>Outstanding: {fmt(customer._balance ?? 0)}</div>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>AMOUNT (TZS)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(customer._balance ?? 0)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 15, fontFamily: 'var(--mono)', outline: 0 }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', marginBottom: 6 }}>METHOD</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Cash','M-Pesa','Bank'].map((m) => (
                <button key={m} onClick={() => setMethod(m)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid ' + (method === m ? 'var(--accent-line)' : 'var(--line)'), background: method === m ? 'var(--accent-soft)' : 'var(--bg)', color: method === m ? 'var(--fg)' : 'var(--fg-2)', fontSize: 12, cursor: 'pointer' }}>{m}</button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13.5 }}>
            Confirm payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreditsPage() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [paymentTarget, setPaymentTarget] = useState<typeof CREDIT_CUSTOMERS[0] | null>(null);

  const filtered = useMemo(() => CREDIT_CUSTOMERS.filter((c) => {
    if (filter === 'overdue'  && c.status !== 'overdue')   return false;
    if (filter === 'due-soon' && c.status !== 'due-soon')  return false;
    if (filter === 'current'  && c.status !== 'current')   return false;
    if (query) {
      const q = query.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q) && !(c.phone || '').includes(query)) return false;
    }
    return true;
  }), [filter, query]);

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Credits' }]}
      actions={
        <button className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.plus} Issue credit
        </button>
      }
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>
            Credits <span style={{ color: 'var(--fg-4)' }}>/</span>{' '}
            <span className="mono" style={{ fontSize: 16, fontWeight: 400, color: 'var(--fg-3)' }}>Madeni</span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
            Every customer balance, overdue account, and follow-up — in one view.
            <span className="mono" style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="dot-s" style={{ background: 'var(--good)' }}></span> live
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.download} Statement PDF</button>
          <button className="btn btn-soft">Send all reminders</button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface" style={{ padding: '16px 18px' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>TOTAL OUTSTANDING</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--fg)' }}>{fmtShort(CREDIT_TOTALS.outstanding)}</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 6 }}>{CREDIT_CUSTOMERS.length} customers · avg {fmtShort(Math.round(CREDIT_TOTALS.outstanding / CREDIT_CUSTOMERS.length))}</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px', borderColor: CREDIT_TOTALS.overdue > 0 ? 'rgba(251,113,133,0.3)' : 'var(--line)' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>OVERDUE</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--bad)' }}>{fmtShort(CREDIT_TOTALS.overdue)}</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--bad)', marginTop: 6 }}>⚠ Needs follow-up</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px', borderColor: CREDIT_TOTALS.dueSoon > 0 ? 'rgba(251,191,36,0.3)' : 'var(--line)' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>DUE SOON</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--warn)' }}>{fmtShort(CREDIT_TOTALS.dueSoon)}</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 6 }}>within 7 days</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>RECOVERED · MAY</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--good)' }}>{fmtShort(CREDIT_TOTALS.recovered)}</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--good)', marginTop: 6 }}>↗ +18% vs Apr</div>
        </div>
      </div>

      {/* Aging */}
      <div className="surface" style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span className="card-title">Aging buckets</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>distribution of debt by age</span>
        </div>
        <AgingBar buckets={AGING_BUCKETS} />
      </div>

      {/* AI nudge */}
      <div className="surface" style={{ padding: '14px 16px', borderColor: 'var(--accent-line)', background: 'linear-gradient(180deg, var(--accent-soft) 0%, var(--bg-2) 100%)', marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
        <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>{Icons.sparkles}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--fg)', marginBottom: 2 }}>
            <strong style={{ fontWeight: 500 }}>2 customers</strong> haven&apos;t responded to reminders in 7+ days. Want me to draft a personal message in Swahili?
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Fatuma Ally · Asha Mwinyi</div>
        </div>
        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.sparkles} Draft messages</button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg-2)', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240, padding: '0 10px 0 12px', height: 32, border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg)' }}>
          {Icons.search}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer name, ID or phone…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }}
          />
          {query && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{filtered.length} hits</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            ['all', 'All', CREDIT_CUSTOMERS.length],
            ['overdue', 'Overdue', CREDIT_CUSTOMERS.filter(c => c.status === 'overdue').length],
            ['due-soon', 'Due soon', CREDIT_CUSTOMERS.filter(c => c.status === 'due-soon').length],
            ['current', 'Current', CREDIT_CUSTOMERS.filter(c => c.status === 'current').length],
          ].map(([k, l, n]) => (
            <button key={k as string} onClick={() => setFilter(k as string)} style={{
              padding: '5px 11px', borderRadius: 999,
              border: '1px solid ' + (filter === k ? 'var(--accent-line)' : 'var(--line)'),
              background: filter === k ? 'var(--accent-soft)' : 'var(--bg)',
              color: filter === k ? 'var(--fg)' : 'var(--fg-2)',
              fontSize: 12, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 7,
            }}>
              {l}
              <span className="mono" style={{ fontSize: 10, color: filter === k ? 'var(--accent)' : 'var(--fg-4)' }}>{n}</span>
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto' }} className="mono">
          <span style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>Sort by: <span style={{ color: 'var(--fg)' }}>most overdue</span></span>
        </span>
      </div>

      {/* List */}
      <div className="surface" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-3)' }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em' }}>NO MATCHES</div>
            <div style={{ marginTop: 6 }}>Try clearing filters or searching differently.</div>
          </div>
        ) : (
          filtered.map((c) => {
            const lastPay = c.payments[0];
            const lastTab = c.tabs[0];
            return (
              <div key={c.id} className="customer-row">
                <div className="cust-avatar" style={{ background: `linear-gradient(135deg, oklch(70% 0.18 ${c.avatarHue}), oklch(60% 0.18 ${c.avatarHue + 30}))` }}>
                  {avatarFromName(c.name)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <Link href={`/credits/${c.id}`} style={{ fontSize: 14, fontWeight: 500, color: 'inherit' }}>{c.name}</Link>
                    <StatusPill status={c.status} days={c.dueDays} />
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4 }}>
                    {c.id} <span style={{ color: 'var(--fg-4)', margin: '0 6px' }}>·</span> {c.phone}
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span>Last sale: {lastTab ? lastTab.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'} · {lastTab?.cashier || '—'}</span>
                    <span>Last payment: {lastPay ? fmt(lastPay.amount) + ' · ' + lastPay.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'none'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 500, color: c.status === 'overdue' ? 'var(--bad)' : c.status === 'due-soon' ? 'var(--warn)' : 'var(--fg)', fontFamily: 'var(--mono)', letterSpacing: '-0.01em' }}>
                    {fmt(c._balance ?? 0)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="icon-btn" title="Call" style={{ width: 30, height: 30 }}><PhoneIcon /></button>
                    <button className="icon-btn" title="WhatsApp" style={{ width: 30, height: 30 }}><WhatsAppMini /></button>
                    <button onClick={() => setPaymentTarget(c)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <CashSmall /> Record payment
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {filtered.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-3)' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Showing {filtered.length} of {CREDIT_CUSTOMERS.length} customers</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              Total: <span style={{ color: 'var(--fg-2)' }}>{fmt(filtered.reduce((s, c) => s + (c._balance ?? 0), 0))}</span>
            </span>
          </div>
        )}
      </div>

      <RecordPaymentDrawer open={!!paymentTarget} customer={paymentTarget} onClose={() => setPaymentTarget(null)} />
    </AppShell>
  );
}
