'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';
import { creditsApi, customerApi, reportsApi, CreditCustomer, CreditsDashboard, CustomerListItem } from '../../lib/api';
import { openReportPrintWindow } from '../../lib/reportPdf';

const SPINNER = (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
  </>
);

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

type AgingBucket = { label: string; range: string; amount: number; color: string };

function AgingBar({ buckets }: { buckets: AgingBucket[] }) {
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
      <div className="aging-grid">
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
function RecordPaymentDrawer({ open, customer, onClose, onSuccess }: { open: boolean; customer: CreditCustomer | null; onClose: () => void; onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    if (!customer || !amount) return;
    setSaving(true);
    const res = await creditsApi.recordPayment(customer.id, { amount: parseFloat(amount), method });
    setSaving(false);
    if (res.success) {
      setAmount('');
      onSuccess();
      onClose();
    }
  }

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
            <div style={{ width: 36, height: 36, borderRadius: 999, background: `hsl(${customer.avatar_hue}, 60%, 50%)`, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>
              {customer.initials || avatarFromName(customer.name)}
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{customer.name}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--bad)' }}>Outstanding: {fmt(customer.balance)}</div>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>AMOUNT (TZS)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(customer.balance)}
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
          <button onClick={handleConfirm} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13.5 }}>
            {saving ? 'Saving…' : 'Confirm payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, tone = 'good', onDismiss }: { message: string; tone?: 'good' | 'bad'; onDismiss: () => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 300, background: 'var(--bg-2)', border: `1px solid var(--${tone})`, borderRadius: 10, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', maxWidth: '90vw' }}>
      <span style={{ color: `var(--${tone})`, fontSize: 16 }}>{tone === 'good' ? '✓' : '⚠'}</span>
      <span style={{ fontSize: 13.5 }}>{message}</span>
      <button onClick={onDismiss} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
    </div>
  );
}

// ── Issue Credit Drawer ────────────────────────────────────────────────────────
function IssueCreditDrawer({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<CustomerListItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<CustomerListItem | null>(null);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSearch(''); setResults([]); setSelected(null);
    setAmount(''); setDueDate(''); setNote(''); setErr(null);
  }, [open]);

  useEffect(() => {
    if (!open || selected) return;
    if (!search.trim()) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(() => {
      customerApi.getList(`search=${encodeURIComponent(search.trim())}`).then((res) => {
        setSearching(false);
        if (res.success) setResults(res.data.slice(0, 8));
      });
    }, 300);
    return () => clearTimeout(t);
  }, [search, open, selected]);

  async function handleSubmit() {
    if (!selected) { setErr('Select a customer first.'); return; }
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) { setErr('Enter a valid amount.'); return; }
    setSaving(true);
    setErr(null);
    const res = await creditsApi.issueCredit(selected.id, {
      amount: amt,
      due_date: dueDate || undefined,
      note: note.trim() || undefined,
    });
    setSaving(false);
    if (res.success) {
      onSuccess(`Credit of ${fmt(amt)} issued to ${selected.name}.`);
      onClose();
    } else {
      setErr(res.message);
    }
  }

  if (!open) return null;
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)',
    background: 'var(--bg-3)', color: 'var(--fg)', fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()} style={{ width: 400 }}>
        <div className="drawer-head">
          <span style={{ fontWeight: 500 }}>Issue credit</span>
          <button className="icon-btn" onClick={onClose}>{Icons.close}</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Customer</label>
            {selected ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 7, border: '1px solid var(--accent-line)', background: 'var(--accent-soft)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{selected.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{selected.phone}</div>
                </div>
                <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => { setSelected(null); setSearch(''); }}>×</button>
              </div>
            ) : (
              <>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone…" style={inputStyle} />
                {searching && <div style={{ fontSize: 11.5, color: 'var(--fg-4)' }}>Searching…</div>}
                {results.length > 0 && (
                  <div style={{ border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden' }}>
                    {results.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelected(c); setResults([]); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', borderBottom: '1px solid var(--line)', background: 'var(--bg-3)', cursor: 'pointer', color: 'var(--fg)', fontFamily: 'inherit' }}
                      >
                        <div style={{ fontSize: 13 }}>{c.name}</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{c.phone}</div>
                      </button>
                    ))}
                  </div>
                )}
                {!searching && search.trim() && results.length === 0 && (
                  <div style={{ fontSize: 11.5, color: 'var(--fg-4)' }}>
                    No matches. <Link href="/customers/new" style={{ color: 'var(--accent)' }}>Add a new customer</Link> first.
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Amount (TZS)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="15000"
              inputMode="numeric"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Due date (optional, default 30 days)</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Note (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why this credit was issued…" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {err && (
            <div style={{ padding: '9px 12px', borderRadius: 7, background: 'var(--bad-soft)', border: '1px solid rgba(248,113,113,0.25)', fontSize: 12.5, color: 'var(--bad)' }}>
              {err}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving} style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              {saving ? 'Issuing…' : 'Issue credit'}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Draft Messages Modal ────────────────────────────────────────────────────────
function DraftMessagesModal({ open, onClose, onSend }: { open: boolean; onClose: () => void; onSend: (body: string) => void }) {
  const [tone, setTone] = useState<'friendly' | 'firm' | 'final_notice'>('friendly');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{ customers_with_credit: number; total_outstanding: number; overdue_count: number } | null>(null);

  const generate = useCallback((t: typeof tone) => {
    setLoading(true);
    creditsApi.draftReminder(t).then((res) => {
      setLoading(false);
      if (res.success) {
        setDraft(res.data.draft);
        setMeta(res.data);
      }
    });
  }, []);

  useEffect(() => { if (open) generate(tone); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()} style={{ width: 440 }}>
        <div className="drawer-head">
          <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>{Icons.sparkles} Draft messages with AI</span>
          <button className="icon-btn" onClick={onClose}>{Icons.close}</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['friendly', 'firm', 'final_notice'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTone(t); generate(t); }}
                style={{
                  flex: 1, padding: '7px 8px', borderRadius: 6, fontSize: 11.5, cursor: 'pointer',
                  border: '1px solid ' + (tone === t ? 'var(--accent-line)' : 'var(--line)'),
                  background: tone === t ? 'var(--accent-soft)' : 'var(--bg)',
                  color: tone === t ? 'var(--fg)' : 'var(--fg-2)',
                }}
              >
                {t === 'friendly' ? 'Friendly' : t === 'firm' ? 'Firm' : 'Final notice'}
              </button>
            ))}
          </div>

          {meta && (
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              {meta.customers_with_credit} customers owe {fmt(meta.total_outstanding)} · {meta.overdue_count} overdue
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Message (edit freely — {'{name}'} and {'{amount}'} are filled in per customer)</label>
            <textarea
              value={loading ? 'Drafting…' : draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={loading}
              rows={5}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 7, border: '1px solid var(--line)', background: 'var(--bg-3)', color: 'var(--fg)', fontSize: 13.5, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn btn-primary" onClick={() => onSend(draft)} disabled={loading || !draft.trim()} style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              Send to all via SMS
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreditsPage() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [paymentTarget, setPaymentTarget] = useState<CreditCustomer | null>(null);
  const [dashboard, setDashboard] = useState<CreditsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [issueOpen, setIssueOpen] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [statementLoading, setStatementLoading] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'good' | 'bad' } | null>(null);

  function notify(msg: string, tone: 'good' | 'bad' = 'good') {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  }

  const loadDashboard = useCallback(() => {
    setLoading(true);
    const params = filter !== 'all' ? `status=${filter}` : undefined;
    creditsApi.getDashboard(params).then((res) => {
      setLoading(false);
      if (res.success) setDashboard(res.data);
    });
  }, [filter]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  async function handleStatementPDF() {
    setStatementLoading(true);
    const res = await reportsApi.generateJSON('credit', '90d');
    setStatementLoading(false);
    if (res.success && res.data) {
      const d = res.data as Record<string, unknown>;
      const reportData = (d.report as Record<string, unknown>) ?? d;
      openReportPrintWindow(
        'credit',
        reportData,
        {
          report_name:  String(reportData.report_name ?? 'Credit Aged Debtors'),
          store_name:   String(reportData.store_name  ?? ''),
          period_label: String(d.period_label ?? reportData.period_label ?? '90d'),
          date_from:    String(d.date_from    ?? reportData.date_from ?? ''),
          date_to:      String(d.date_to      ?? reportData.date_to   ?? ''),
        },
        `${window.location.origin}/ziada-final.jpeg`,
      );
    } else {
      notify(res.message || 'Could not generate statement.', 'bad');
    }
  }

  async function handleSendAllReminders(body?: string) {
    setSendingReminders(true);
    const res = await creditsApi.sendAllReminders(body);
    setSendingReminders(false);
    setDraftOpen(false);
    if (res.success) {
      const { sent, failed } = res.data;
      notify(res.message || `Sent ${sent} reminder(s).`, failed && !sent ? 'bad' : 'good');
      loadDashboard();
    } else {
      notify(res.message || 'Failed to send reminders.', 'bad');
    }
  }

  const kpis = dashboard?.kpis;
  const agingBuckets = dashboard?.aging_buckets ?? [];
  const allCustomers = dashboard?.customers ?? [];

  const filtered = useMemo(() => {
    let list = allCustomers;
    if (filter !== 'all') list = list.filter(c => c.status === filter);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.phone || '').includes(query));
    }
    return list;
  }, [allCustomers, filter, query]);

  const filterCounts = useMemo(() => ({
    all: allCustomers.length,
    overdue: allCustomers.filter(c => c.status === 'overdue').length,
    'due-soon': allCustomers.filter(c => c.status === 'due-soon').length,
    current: allCustomers.filter(c => c.status === 'current').length,
  }), [allCustomers]);

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Debts' }]}
      actions={
        <button className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setIssueOpen(true)}>
          {Icons.plus} Issue credit
        </button>
      }
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>
            Debts <span style={{ color: 'var(--fg-4)' }}>/</span>{' '}
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
          <button className="btn btn-ghost page-sec" onClick={handleStatementPDF} disabled={statementLoading}>
            {Icons.download} {statementLoading ? 'Generating…' : 'Statement PDF'}
          </button>
          <button className="btn btn-soft page-sec" onClick={() => handleSendAllReminders()} disabled={sendingReminders}>
            {sendingReminders ? 'Sending…' : 'Send all reminders'}
          </button>
        </div>
      </div>

      {/* KPI strip — 2×2 on mobile, 4-col on desktop */}
      <style>{`
        .credits-kpi-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
        @media (min-width:640px) { .credits-kpi-grid { grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; } }
        .credits-kpi { padding:14px; }
        @media (min-width:640px) { .credits-kpi { padding:16px 18px; } }
        .credits-kpi .kv { font-size:22px; }
        @media (min-width:640px) { .credits-kpi .kv { font-size:26px; } }
      `}</style>
      <div className="credits-kpi-grid">
        <div className="surface credits-kpi">
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>OUTSTANDING</div>
          <div className="kv mono" style={{ fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6, color: 'var(--fg)' }}>{fmtShort(kpis?.total_outstanding ?? 0)}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 4 }}>{kpis?.customer_count ?? 0} customers</div>
        </div>
        <div className="surface credits-kpi" style={{ borderColor: (kpis?.overdue ?? 0) > 0 ? 'rgba(251,113,133,0.3)' : 'var(--line)' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>OVERDUE</div>
          <div className="kv mono" style={{ fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6, color: 'var(--bad)' }}>{fmtShort(kpis?.overdue ?? 0)}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--bad)', marginTop: 4 }}>follow-up</div>
        </div>
        <div className="surface credits-kpi" style={{ borderColor: (kpis?.due_soon ?? 0) > 0 ? 'rgba(251,191,36,0.3)' : 'var(--line)' }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>DUE SOON</div>
          <div className="kv mono" style={{ fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6, color: 'var(--warn)' }}>{fmtShort(kpis?.due_soon ?? 0)}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 4 }}>7 days</div>
        </div>
        <div className="surface credits-kpi">
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>RECOVERED</div>
          <div className="kv mono" style={{ fontWeight: 500, letterSpacing: '-0.02em', marginTop: 6, color: 'var(--good)' }}>{fmtShort(kpis?.recovered_month ?? 0)}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--good)', marginTop: 4 }}>this month</div>
        </div>
      </div>

      {/* Aging */}
      {agingBuckets.length > 0 && (
        <div className="surface" style={{ padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span className="card-title">Aging buckets</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>distribution of debt by age</span>
          </div>
          <AgingBar buckets={agingBuckets} />
        </div>
      )}

      {/* AI nudge */}
      {(kpis?.customer_count ?? 0) > 0 && (
        <div className="surface" style={{ padding: '14px 16px', borderColor: 'var(--accent-line)', background: 'linear-gradient(180deg, var(--accent-soft) 0%, var(--bg-2) 100%)', marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>{Icons.sparkles}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--fg)', marginBottom: 2 }}>
              <strong style={{ fontWeight: 500 }}>{kpis?.customer_count} customer{kpis?.customer_count === 1 ? '' : 's'}</strong> currently owe credit
              {(kpis?.overdue ?? 0) > 0 && <> — some overdue</>}. Want AI to draft a personal reminder in Swahili?
            </div>
          </div>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => setDraftOpen(true)}>{Icons.sparkles} Draft messages</button>
        </div>
      )}

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
        <div className="filter-pills-scroll" style={{ display: 'flex', gap: 6 }}>
          {([
            ['all', 'All', filterCounts.all],
            ['overdue', 'Overdue', filterCounts.overdue],
            ['due-soon', 'Due soon', filterCounts['due-soon']],
            ['current', 'Current', filterCounts.current],
          ] as [string, string, number][]).map(([k, l, n]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              flexShrink: 0,
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
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>{SPINNER}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-3)' }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em' }}>NO MATCHES</div>
            <div style={{ marginTop: 6 }}>No customers with open credit.</div>
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 16px',
              borderBottom: '1px solid var(--line)',
            }}>
              {/* Avatar */}
              <div style={{
                width: 38, height: 38, borderRadius: 999, flexShrink: 0,
                background: `linear-gradient(135deg,hsl(${c.avatar_hue},55%,42%),hsl(${c.avatar_hue + 40},55%,52%))`,
                color: '#fff', display: 'grid', placeItems: 'center',
                fontSize: 13, fontWeight: 600,
              }}>
                {c.initials || avatarFromName(c.name)}
              </div>

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Row 1: name + status pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                  <Link href={`/credits/${c.id}`} style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </Link>
                  <StatusPill status={c.status} days={c.due_days} />
                </div>
                {/* Row 2: phone + last payment (compact) */}
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                  {c.phone && (
                    <>
                      <a href={`tel:${c.phone}`} style={{ color: 'var(--fg-4)', textDecoration: 'none' }}>{c.phone}</a>
                      {c.last_pay_amount && <span style={{ color: 'var(--line-3)' }}>·</span>}
                    </>
                  )}
                  {c.last_pay_amount && (
                    <span>paid {fmtShort(c.last_pay_amount)}{c.last_pay_date ? ' · ' + new Date(c.last_pay_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}</span>
                  )}
                </div>
              </div>

              {/* Right: balance + pay button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7, flexShrink: 0 }}>
                <div style={{
                  fontSize: 17, fontWeight: 600,
                  color: c.status === 'overdue' ? 'var(--bad)' : c.status === 'due-soon' ? 'var(--warn)' : 'var(--fg)',
                  fontFamily: 'var(--mono)', letterSpacing: '-0.01em', lineHeight: 1,
                }}>
                  {fmtShort(c.balance)}
                </div>
                <button
                  onClick={() => setPaymentTarget(c)}
                  style={{
                    padding: '5px 11px', borderRadius: 6, border: 0,
                    background: '#0C2A4E', color: '#fff',
                    fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
                    fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <CashSmall /> Pay
                </button>
              </div>
            </div>
          ))
        )}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-3)' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Showing {filtered.length} customers</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              Total: <span style={{ color: 'var(--fg-2)' }}>{fmt(filtered.reduce((s, c) => s + c.balance, 0))}</span>
            </span>
          </div>
        )}
      </div>

      <RecordPaymentDrawer
        open={!!paymentTarget}
        customer={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onSuccess={loadDashboard}
      />

      <IssueCreditDrawer
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        onSuccess={(msg) => { notify(msg); loadDashboard(); }}
      />

      <DraftMessagesModal
        open={draftOpen}
        onClose={() => setDraftOpen(false)}
        onSend={(body) => handleSendAllReminders(body)}
      />

      {toast && <Toast message={toast.msg} tone={toast.tone} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
