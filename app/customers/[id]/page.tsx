'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtShort } from '../../../lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Customer {
  id: string;
  name: string;
  phone: string;
  since: Date;
  totalSpent: number;
  lastVisit: Date;
  openCredit: number;
  avgTicket: number;
  segment: 'VIP' | 'Regular' | 'Occasional' | 'New';
  avatarHue: number;
}

// ── Static data (mirrors customers list page) ─────────────────────────────────
const TODAY = new Date(2026, 4, 25);
const daysAgo  = (n: number) => new Date(TODAY.getTime() - n * 86400000);
const monthsAgo = (n: number) => new Date(TODAY.getTime() - n * 30 * 86400000);

const CUSTOMERS: Customer[] = [
  { id: 'c001', name: 'Hamisi Juma',       phone: '+255 767 123 456', since: monthsAgo(24), totalSpent: 1_840_000, lastVisit: daysAgo(2),  openCredit: 0,       avgTicket: 38_000, segment: 'VIP',        avatarHue: 260 },
  { id: 'c002', name: 'Fatuma Ally',       phone: '+255 714 234 567', since: monthsAgo(18), totalSpent: 1_120_000, lastVisit: daysAgo(5),  openCredit: 45_000,  avgTicket: 24_500, segment: 'VIP',        avatarHue: 340 },
  { id: 'c003', name: 'Josephine Mkuya',   phone: '+255 783 345 678', since: monthsAgo(12), totalSpent: 780_000,   lastVisit: daysAgo(3),  openCredit: 0,       avgTicket: 19_800, segment: 'Regular',    avatarHue: 160 },
  { id: 'c004', name: 'Baraka Mwamba',     phone: '+255 622 456 789', since: monthsAgo(30), totalSpent: 2_340_000, lastVisit: daysAgo(1),  openCredit: 120_000, avgTicket: 52_000, segment: 'VIP',        avatarHue: 200 },
  { id: 'c005', name: 'Asha Mwinyi',       phone: '+255 756 567 890', since: monthsAgo(6),  totalSpent: 430_000,   lastVisit: daysAgo(14), openCredit: 30_000,  avgTicket: 14_200, segment: 'Regular',    avatarHue: 30  },
  { id: 'c006', name: 'Mohamed Rashid',    phone: '+255 712 678 901', since: monthsAgo(3),  totalSpent: 215_000,   lastVisit: daysAgo(21), openCredit: 0,       avgTicket: 11_600, segment: 'Occasional', avatarHue: 280 },
  { id: 'c007', name: 'Zawadi Chaka',      phone: '+255 769 789 012', since: daysAgo(45),   totalSpent: 148_000,   lastVisit: daysAgo(7),  openCredit: 0,       avgTicket: 16_400, segment: 'New',        avatarHue: 120 },
  { id: 'c008', name: 'Salum Kibwana',     phone: '+255 784 890 123', since: monthsAgo(48), totalSpent: 3_120_000, lastVisit: daysAgo(4),  openCredit: 85_000,  avgTicket: 68_000, segment: 'VIP',        avatarHue: 40  },
  { id: 'c009', name: 'Neema Kalugendo',   phone: '+255 767 901 234', since: monthsAgo(9),  totalSpent: 560_000,   lastVisit: daysAgo(9),  openCredit: 0,       avgTicket: 18_000, segment: 'Regular',    avatarHue: 190 },
  { id: 'c010', name: 'Hassan Nguvu',      phone: '+255 714 012 345', since: monthsAgo(15), totalSpent: 890_000,   lastVisit: daysAgo(6),  openCredit: 60_000,  avgTicket: 28_500, segment: 'Regular',    avatarHue: 320 },
  { id: 'c011', name: 'Rehema Omary',      phone: '+255 756 123 456', since: daysAgo(30),   totalSpent: 72_000,    lastVisit: daysAgo(12), openCredit: 0,       avgTicket: 9_800,  segment: 'New',        avatarHue: 70  },
  { id: 'c012', name: 'Idrissa Kigoma',    phone: '+255 622 234 567', since: monthsAgo(7),  totalSpent: 310_000,   lastVisit: daysAgo(28), openCredit: 0,       avgTicket: 13_200, segment: 'Occasional', avatarHue: 230 },
];

// ── Mock transactions per customer ────────────────────────────────────────────
interface Txn {
  id: string;
  date: Date;
  amount: number;
  method: string;
  items: number;
  status: 'paid' | 'credit' | 'refunded';
}

function mockTxns(c: Customer): Txn[] {
  const count = Math.round(c.totalSpent / c.avgTicket);
  const base   = Math.min(count, 12);
  const result: Txn[] = [];
  const methods = ['Cash', 'M-Pesa', 'M-Pesa', 'Cash', 'Tigo Pesa', 'M-Pesa'];
  for (let i = 0; i < base; i++) {
    const dayOffset = Math.round((i / base) * (TODAY.getTime() - c.since.getTime()) / 86400000);
    const date = new Date(c.since.getTime() + dayOffset * 86400000);
    const variance = 0.7 + Math.abs(Math.sin(i * 7.3)) * 0.6;
    const amount = Math.round(c.avgTicket * variance / 100) * 100;
    result.push({
      id: `TXN-${c.id.toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      date,
      amount,
      method: methods[i % methods.length],
      items: Math.max(1, Math.round(amount / 8000)),
      status: c.openCredit > 0 && i === 0 ? 'credit' : i === base - 2 ? 'refunded' : 'paid',
    });
  }
  return result.reverse();
}

// ── Mock credit history ────────────────────────────────────────────────────────
interface CreditEntry {
  date: Date;
  type: 'borrow' | 'repay';
  amount: number;
  note: string;
  balance: number;
}

function mockCredit(c: Customer): CreditEntry[] {
  if (c.openCredit === 0) return [];
  const entries: CreditEntry[] = [];
  const total = c.openCredit * 2;
  const borrowed = Math.round(total * 0.6 / 1000) * 1000;
  const repaid   = borrowed - c.openCredit;
  const d1 = daysAgo(45);
  const d2 = daysAgo(30);
  const d3 = daysAgo(15);
  entries.push({ date: d1, type: 'borrow', amount: borrowed,       note: 'Household goods purchase',  balance: borrowed });
  if (repaid > 0)
    entries.push({ date: d2, type: 'repay', amount: Math.round(repaid * 0.6), note: 'Partial repayment via M-Pesa', balance: Math.round(borrowed - repaid * 0.6) });
  if (repaid > 0)
    entries.push({ date: d3, type: 'repay', amount: repaid - Math.round(repaid * 0.6), note: 'Cash repayment', balance: c.openCredit });
  return entries;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
}

function daysAgoLabel(date: Date) {
  const diff = Math.round((TODAY.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return `${diff} days ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

const SEGMENT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  VIP:        { bg: 'var(--warn-soft)',   color: 'var(--warn)',   border: 'rgba(251,191,36,0.3)' },
  Regular:    { bg: 'var(--accent-soft)', color: 'var(--accent)', border: 'var(--accent-line)' },
  Occasional: { bg: 'var(--bg-3)',        color: 'var(--fg-2)',   border: 'var(--line-2)' },
  New:        { bg: 'var(--good-soft)',   color: 'var(--good)',   border: 'rgba(52,211,153,0.3)' },
};

// ── Monthly spend sparkline ────────────────────────────────────────────────────
function MonthlyChart({ txns }: { txns: Txn[] }) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - (5 - i), 1);
    return { label: d.toLocaleDateString('en-GB', { month: 'short' }), total: 0 };
  });
  for (const t of txns) {
    const monthIdx = (t.date.getFullYear() - TODAY.getFullYear()) * 12 + t.date.getMonth() - (TODAY.getMonth() - 5);
    if (monthIdx >= 0 && monthIdx < 6) months[monthIdx].total += t.amount;
  }
  const max = Math.max(...months.map(m => m.total), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
        {months.map((m, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              height: m.total === 0 ? 4 : Math.max(8, (m.total / max) * 60),
              background: m.total === 0 ? 'var(--bg-3)' : 'var(--accent)',
              opacity: i === 5 ? 1 : 0.6,
              transition: 'height 400ms',
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {months.map((m, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--fg-4)' }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const customer = CUSTOMERS.find((c) => c.id === id);

  const [tab, setTab] = useState<'overview' | 'transactions' | 'credit'>('overview');
  const [editOpen, setEditOpen] = useState(false);

  if (!customer) {
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

  const txns   = mockTxns(customer);
  const credit = mockCredit(customer);
  const seg    = SEGMENT_COLORS[customer.segment];
  const visitCount = Math.round(customer.totalSpent / customer.avgTicket);

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
          background: `oklch(55% 0.18 ${customer.avatarHue})`,
          display: 'grid', placeItems: 'center',
          fontSize: 22, fontWeight: 600, color: '#fff',
        }}>
          {initials(customer.name)}
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
              Customer since {monthLabel(customer.since)}
            </span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 2v2M11 2v2M2 7h12" /></g></svg>
              Last visit {daysAgoLabel(customer.lastVisit)}
            </span>
          </div>
        </div>

        {/* Quick stats on right */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {customer.openCredit > 0 && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, textAlign: 'center',
              background: 'var(--warn-soft)', border: '1px solid rgba(251,191,36,0.3)',
            }}>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--warn)', letterSpacing: '0.08em', marginBottom: 3 }}>OPEN CREDIT</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--warn)' }}>{fmtShort(customer.openCredit)}</div>
            </div>
          )}
          <div style={{
            padding: '10px 14px', borderRadius: 8, textAlign: 'center',
            background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
          }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 3 }}>LIFETIME VALUE</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{fmtShort(customer.totalSpent)}</div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface stat-card">
          <span className="label">TOTAL SPENT</span>
          <span className="value">{fmtShort(customer.totalSpent)}</span>
          <span className="sub">lifetime purchases</span>
        </div>
        <div className="surface stat-card">
          <span className="label">AVG TICKET</span>
          <span className="value">{fmtShort(customer.avgTicket)}</span>
          <span className="sub">per transaction</span>
        </div>
        <div className="surface stat-card" style={{ borderColor: customer.openCredit > 0 ? 'rgba(251,191,36,0.3)' : undefined }}>
          <span className="label">OPEN CREDIT</span>
          <span className="value" style={{ color: customer.openCredit > 0 ? 'var(--warn)' : 'var(--good)', fontSize: 22 }}>
            {customer.openCredit > 0 ? fmtShort(customer.openCredit) : 'None'}
          </span>
          <span className="sub">{customer.openCredit > 0 ? 'outstanding balance' : 'fully settled'}</span>
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
            {(['overview', 'transactions', 'credit'] as const).map((t) => (
              <button
                key={t}
                className={'tab' + (tab === t ? ' active' : '')}
                onClick={() => setTab(t)}
                style={{ textTransform: 'capitalize' }}
              >
                {t === 'credit' ? 'Credit history' : t === 'transactions' ? `Transactions (${txns.length})` : 'Overview'}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Monthly spend chart */}
              <div className="surface" style={{ overflow: 'hidden' }}>
                <div className="card-head">
                  <span className="card-title">Monthly spend — last 6 months</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>Dec 2025 – May 2026</span>
                </div>
                <div style={{ padding: '20px 24px 16px' }}>
                  <MonthlyChart txns={txns} />
                </div>
              </div>

              {/* Recent activity */}
              <div className="surface" style={{ overflow: 'hidden' }}>
                <div className="card-head">
                  <span className="card-title">Recent transactions</span>
                  <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setTab('transactions')}>
                    View all
                  </button>
                </div>
                <div>
                  {txns.slice(0, 4).map((t) => (
                    <div key={t.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderBottom: '1px solid var(--line)',
                    }}>
                      <div>
                        <div className="mono" style={{ fontSize: 12, color: 'var(--fg-2)', marginBottom: 2 }}>{t.id}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                          {daysAgoLabel(t.date)} · {t.items} item{t.items > 1 ? 's' : ''} · {t.method}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="mono" style={{
                          fontSize: 14, fontWeight: 500,
                          color: t.status === 'refunded' ? 'var(--bad)' : t.status === 'credit' ? 'var(--warn)' : 'var(--fg)',
                        }}>
                          {t.status === 'refunded' ? '-' : ''}{fmtShort(t.amount)}
                        </div>
                        <span className={`pill${t.status === 'paid' ? ' good' : t.status === 'credit' ? ' warn' : ' bad'}`} style={{ fontSize: 10 }}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase behaviour */}
              <div className="surface" style={{ overflow: 'hidden' }}>
                <div className="card-head">
                  <span className="card-title">Purchase behaviour</span>
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Avg days between visits', value: `${Math.round((Math.round(TODAY.getTime() / 86400000 - customer.since.getTime() / 86400000) / Math.max(visitCount, 1)))} days` },
                    { label: 'Preferred payment method', value: 'M-Pesa' },
                    { label: 'Top category', value: 'Household goods' },
                    { label: 'Best day', value: 'Saturday' },
                  ].map((row) => (
                    <div key={row.label} className="field-row">
                      <span className="k">{row.label}</span>
                      <span className="v mono" style={{ fontSize: 12.5 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transactions tab */}
          {tab === 'transactions' && (
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="table-scroll">
                <table className="table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th className="num">Items</th>
                      <th className="num">Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map((t) => (
                      <tr key={t.id}>
                        <td className="mono" style={{ fontSize: 12 }}>{t.id}</td>
                        <td style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{daysAgoLabel(t.date)}</td>
                        <td>
                          <span style={{
                            display: 'inline-flex', padding: '2px 8px', borderRadius: 999,
                            background: 'var(--bg-3)', border: '1px solid var(--line-2)',
                            fontSize: 11.5, color: 'var(--fg-2)',
                          }}>{t.method}</span>
                        </td>
                        <td className="num mono" style={{ fontSize: 12.5 }}>{t.items}</td>
                        <td className="num mono" style={{
                          fontSize: 13, fontWeight: 500,
                          color: t.status === 'refunded' ? 'var(--bad)' : t.status === 'credit' ? 'var(--warn)' : 'var(--fg)',
                        }}>
                          {t.status === 'refunded' ? '−' : ''}{fmt(t.amount)}
                        </td>
                        <td>
                          <span className={`pill${t.status === 'paid' ? ' good' : t.status === 'credit' ? ' warn' : ' bad'}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{
                padding: '10px 16px', borderTop: '1px solid var(--line)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-3)',
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                  {txns.length} transactions total
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
                  Total: {fmtShort(txns.filter(t => t.status !== 'refunded').reduce((s, t) => s + t.amount, 0))}
                </span>
              </div>
            </div>
          )}

          {/* Credit tab */}
          {tab === 'credit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {customer.openCredit > 0 && (
                <div style={{
                  padding: '16px 20px', borderRadius: 10,
                  background: 'var(--warn-soft)', border: '1px solid rgba(251,191,36,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
                }}>
                  <div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--warn)', letterSpacing: '0.08em', marginBottom: 4 }}>OUTSTANDING BALANCE</div>
                    <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--warn)', letterSpacing: '-0.02em' }}>{fmt(customer.openCredit)}</div>
                  </div>
                  <button className="btn btn-primary" style={{ background: 'var(--warn)', whiteSpace: 'nowrap' }}>
                    Record payment
                  </button>
                </div>
              )}

              {credit.length === 0 ? (
                <div className="surface" style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No credit history</div>
                  <p style={{ color: 'var(--fg-3)', fontSize: 13, margin: 0 }}>
                    {customer.name} has never used credit — all purchases settled immediately.
                  </p>
                </div>
              ) : (
                <div className="surface" style={{ overflow: 'hidden' }}>
                  <div className="card-head">
                    <span className="card-title">Credit history</span>
                  </div>
                  {credit.map((e, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px', borderBottom: i < credit.length - 1 ? '1px solid var(--line)' : 'none',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                        background: e.type === 'borrow' ? 'var(--bad-soft)' : 'var(--good-soft)',
                        display: 'grid', placeItems: 'center',
                        color: e.type === 'borrow' ? 'var(--bad)' : 'var(--good)',
                        fontSize: 14, fontWeight: 600,
                      }}>
                        {e.type === 'borrow' ? '↑' : '↓'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>
                          {e.type === 'borrow' ? 'Credit extended' : 'Payment received'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{e.note} · {daysAgoLabel(e.date)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="mono" style={{
                          fontSize: 14, fontWeight: 600,
                          color: e.type === 'borrow' ? 'var(--bad)' : 'var(--good)',
                        }}>
                          {e.type === 'borrow' ? '+' : '−'}{fmtShort(e.amount)}
                        </div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>
                          Bal: {fmtShort(e.balance)}
                        </div>
                      </div>
                    </div>
                  ))}
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
                { k: 'Segment',  v: customer.segment },
                { k: 'Since',    v: monthLabel(customer.since) },
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
            {customer.openCredit > 0 && (
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--warn) !important' }}>
                Record credit payment
              </button>
            )}
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              {Icons.receipt} View all receipts
            </button>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'var(--bad)' }}>
              {Icons.trash} Delete customer
            </button>
          </div>

          {/* Notes */}
          <div className="surface" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <span className="card-title">Notes</span>
              <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }}>{Icons.plus} Add</button>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-3)', fontStyle: 'italic' }}>
                No notes yet. Add a note to remember important details about this customer.
              </p>
            </div>
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
                { label: 'Full name',     placeholder: customer.name,  value: customer.name },
                { label: 'Phone number',  placeholder: customer.phone, value: customer.phone },
              ].map((f) => (
                <div key={f.label} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" defaultValue={f.value} placeholder={f.placeholder} />
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
    </AppShell>
  );
}
