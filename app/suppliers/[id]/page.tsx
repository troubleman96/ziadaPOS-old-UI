'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtShort } from '../../../lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────
type SupplierStatus = 'Active' | 'Inactive' | 'On hold';

interface Supplier {
  id: string;
  name: string;
  category: string;
  contactPhone: string;
  rep: string;
  products: number;
  lastDelivery: Date;
  paymentTerms: 30 | 60 | 90;
  outstanding: number;
  status: SupplierStatus;
  avatarHue: number;
  pendingInvoices: number;
}

// ── Data (mirrors suppliers list page) ─────────────────────────────────────────
const TODAY = new Date(2026, 4, 25);
const daysAgo = (n: number) => new Date(TODAY.getTime() - n * 86400000);

const SUPPLIERS: Supplier[] = [
  { id: 'sup001', name: 'Bakhresa Co.',     category: 'Flour / Grains',         contactPhone: '+255 22 218 0000', rep: 'Joseph Mwangi',  products: 14, lastDelivery: daysAgo(3),  paymentTerms: 30, outstanding: 480_000, status: 'Active',   avatarHue: 30,  pendingInvoices: 2 },
  { id: 'sup002', name: 'Unilever EA',      category: 'Household / Cleaning',   contactPhone: '+255 22 260 1500', rep: 'Grace Muriuki',  products: 28, lastDelivery: daysAgo(7),  paymentTerms: 60, outstanding: 620_000, status: 'Active',   avatarHue: 200, pendingInvoices: 1 },
  { id: 'sup003', name: 'Coca-Cola Kwanza', category: 'Beverages',              contactPhone: '+255 22 213 7000', rep: 'Kelvin Massawe', products: 18, lastDelivery: daysAgo(2),  paymentTerms: 30, outstanding: 0,       status: 'Active',   avatarHue: 5,   pendingInvoices: 0 },
  { id: 'sup004', name: 'Azam Dairy',       category: 'Dairy / Milk',           contactPhone: '+255 24 223 1111', rep: 'Amani Salehe',   products: 9,  lastDelivery: daysAgo(1),  paymentTerms: 30, outstanding: 155_000, status: 'Active',   avatarHue: 55,  pendingInvoices: 1 },
  { id: 'sup005', name: 'Chai Bora Ltd',    category: 'Tea / Beverages',        contactPhone: '+255 22 215 3000', rep: 'Fatuma Khamisi', products: 7,  lastDelivery: daysAgo(12), paymentTerms: 60, outstanding: 95_000,  status: 'Active',   avatarHue: 140, pendingInvoices: 1 },
  { id: 'sup006', name: 'Kagera Sugar',     category: 'Sugar / Grocery',        contactPhone: '+255 28 222 0050', rep: 'Abubakari Musa', products: 4,  lastDelivery: daysAgo(18), paymentTerms: 30, outstanding: 340_000, status: 'On hold',  avatarHue: 20,  pendingInvoices: 2 },
  { id: 'sup007', name: 'PZ Cussons',       category: 'Household / Cosmetics',  contactPhone: '+255 22 260 2900', rep: 'Linda Mwamba',   products: 22, lastDelivery: daysAgo(9),  paymentTerms: 60, outstanding: 290_000, status: 'Active',   avatarHue: 270, pendingInvoices: 0 },
  { id: 'sup008', name: 'Tanga Fresh',      category: 'Dairy / Yoghurt',        contactPhone: '+255 27 264 3500', rep: 'Rajabu Ally',    products: 6,  lastDelivery: daysAgo(4),  paymentTerms: 30, outstanding: 78_000,  status: 'Active',   avatarHue: 175, pendingInvoices: 0 },
  { id: 'sup009', name: 'Britania',         category: 'Snacks / Biscuits',      contactPhone: '+255 22 211 8800', rep: 'Diana Ngowi',    products: 11, lastDelivery: daysAgo(21), paymentTerms: 90, outstanding: 0,       status: 'Inactive', avatarHue: 320, pendingInvoices: 0 },
  { id: 'sup010', name: 'Murzah Oil',       category: 'Cooking Oil / Fats',     contactPhone: '+255 22 218 5500', rep: 'Hamza Murzah',   products: 5,  lastDelivery: daysAgo(6),  paymentTerms: 30, outstanding: 360_000, status: 'Active',   avatarHue: 45,  pendingInvoices: 1 },
];

// ── Mock delivery history ──────────────────────────────────────────────────────
interface Delivery {
  id: string;
  date: Date;
  items: number;
  value: number;
  status: 'delivered' | 'pending' | 'partial';
  invoice: string;
  paid: boolean;
}

function mockDeliveries(s: Supplier): Delivery[] {
  const count = Math.max(4, s.products);
  const base  = Math.min(count, 10);
  const result: Delivery[] = [];
  for (let i = 0; i < base; i++) {
    const dayOffset = Math.round((i / base) * 180);
    const date = new Date(TODAY.getTime() - dayOffset * 86400000);
    const value = Math.round((80_000 + Math.abs(Math.sin(i * 3.7 + s.avatarHue)) * 400_000) / 1000) * 1000;
    const status: Delivery['status'] = i === 0 && s.pendingInvoices > 0
      ? 'pending'
      : i === 1 && s.outstanding > 0
        ? 'partial'
        : 'delivered';
    result.push({
      id: `DEL-${s.id.toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      date,
      items: Math.max(1, Math.round(s.products * (0.4 + Math.abs(Math.sin(i)) * 0.4))),
      value,
      status,
      invoice: `INV-${s.id.toUpperCase().slice(-3)}-${2026}${String(i + 1).padStart(2, '0')}`,
      paid: status === 'delivered',
    });
  }
  return result;
}

// ── Mock payment history ───────────────────────────────────────────────────────
interface Payment {
  date: Date;
  type: 'payment' | 'invoice';
  amount: number;
  note: string;
  balance: number;
}

function mockPayments(s: Supplier): Payment[] {
  if (s.outstanding === 0) return [];
  const total = s.outstanding * 1.8;
  const paid  = total - s.outstanding;
  const entries: Payment[] = [];
  entries.push({ date: daysAgo(s.paymentTerms + 5), type: 'invoice', amount: Math.round(total / 1000) * 1000,      note: 'Monthly supply invoice',    balance: Math.round(total / 1000) * 1000 });
  if (paid > 0) {
    entries.push({ date: daysAgo(Math.round(s.paymentTerms / 2)), type: 'payment', amount: Math.round(paid / 1000) * 1000, note: 'Partial bank transfer',      balance: s.outstanding });
  }
  return entries;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
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

const STATUS_STYLE: Record<SupplierStatus, string> = {
  Active:    'pill good',
  Inactive:  'pill',
  'On hold': 'pill warn',
};

// ── 6-month delivery volume bars ───────────────────────────────────────────────
function DeliveryChart({ deliveries, color }: { deliveries: Delivery[]; color: string }) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - (5 - i), 1);
    return { label: d.toLocaleDateString('en-GB', { month: 'short' }), total: 0 };
  });
  for (const d of deliveries) {
    const idx = (d.date.getFullYear() - TODAY.getFullYear()) * 12 + d.date.getMonth() - (TODAY.getMonth() - 5);
    if (idx >= 0 && idx < 6) months[idx].total += d.value;
  }
  const max = Math.max(...months.map((m) => m.total), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
        {months.map((m, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              height: m.total === 0 ? 4 : Math.max(8, (m.total / max) * 60),
              background: m.total === 0 ? 'var(--bg-3)' : color,
              opacity: i === 5 ? 1 : 0.55,
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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function SupplierDetailPage() {
  const params   = useParams();
  const id       = params.id as string;
  const supplier = SUPPLIERS.find((s) => s.id === id);

  const [tab, setTab] = useState<'overview' | 'deliveries' | 'edit'>('overview');
  const [editValues, setEditValues] = useState({
    name:         supplier?.name         ?? '',
    category:     supplier?.category     ?? '',
    rep:          supplier?.rep          ?? '',
    phone:        supplier?.contactPhone ?? '',
    paymentTerms: String(supplier?.paymentTerms ?? '30'),
    status:       supplier?.status       ?? 'Active' as SupplierStatus,
  });
  const [saved, setSaved] = useState(false);

  if (!supplier) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Suppliers', href: '/suppliers' }, { label: 'Not found' }]}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Supplier not found</div>
          <p style={{ color: 'var(--fg-3)', marginBottom: 24 }}>No supplier with ID "{id}" exists.</p>
          <Link href="/suppliers" className="btn btn-primary">← Back to Suppliers</Link>
        </div>
      </AppShell>
    );
  }

  const deliveries = mockDeliveries(supplier);
  const payments   = mockPayments(supplier);
  const avatarColor = `oklch(55% 0.16 ${supplier.avatarHue})`;
  const totalDelivered = deliveries.reduce((s, d) => s + d.value, 0);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AppShell
      crumbs={[
        { label: 'ziada', href: '/' },
        { label: 'Suppliers', href: '/suppliers' },
        { label: supplier.name },
      ]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`https://wa.me/${supplier.contactPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
            <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <g stroke="#25d366" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 14l1-3a6 6 0 1 1 2.5 2.5L2 14z" />
                </g>
              </svg>
              WhatsApp
            </button>
          </a>
          {supplier.outstanding > 0 && (
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              Record payment
            </button>
          )}
        </div>
      }
    >
      {/* Back link */}
      <Link href="/suppliers" className="back-link" style={{ marginBottom: 16, display: 'inline-flex' }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All suppliers
      </Link>

      {/* Hero */}
      <div className="surface" style={{ padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{
          width: 60, height: 60, borderRadius: 14, flexShrink: 0,
          background: avatarColor,
          display: 'grid', placeItems: 'center',
          fontSize: 24, fontWeight: 700, color: '#fff',
        }}>
          {supplier.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>{supplier.name}</h1>
            <span className={STATUS_STYLE[supplier.status]}>{supplier.status}</span>
            <span className="pill">{supplier.paymentTerms}-day terms</span>
            {supplier.pendingInvoices > 0 && (
              <span className="pill warn">{supplier.pendingInvoices} pending invoice{supplier.pendingInvoices > 1 ? 's' : ''}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3a1.5 1.5 0 0 1 1.5-1.5h1l1.5 3.5-1.5 1A9 9 0 0 0 10 10l1-1.5 3.5 1.5v1A1.5 1.5 0 0 1 13 12.5C7 12.5 3 8.5 3 3z"/></g></svg>
              {supplier.contactPhone}
            </span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/><path d="M2 14c.5-2.5 3-4 6-4s5.5 1.5 6 4"/></g></svg>
              Rep: {supplier.rep}
            </span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>
              {supplier.category}
            </span>
          </div>
        </div>

        {/* Outstanding alert */}
        {supplier.outstanding > 0 && (
          <div style={{
            padding: '10px 16px', borderRadius: 8, textAlign: 'center',
            background: 'var(--bad-soft)', border: '1px solid rgba(251,113,133,0.3)',
          }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--bad)', letterSpacing: '0.08em', marginBottom: 3 }}>OUTSTANDING</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--bad)', letterSpacing: '-0.01em' }}>{fmtShort(supplier.outstanding)}</div>
          </div>
        )}
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface stat-card" style={{ borderColor: supplier.outstanding > 0 ? 'rgba(251,113,133,0.3)' : 'var(--line)' }}>
          <span className="label">OUTSTANDING</span>
          <span className="value" style={{ color: supplier.outstanding > 0 ? 'var(--bad)' : 'var(--good)', fontSize: supplier.outstanding > 1e6 ? 20 : 26 }}>
            {supplier.outstanding > 0 ? fmtShort(supplier.outstanding) : 'Nil'}
          </span>
          <span className="sub">{supplier.outstanding > 0 ? `due within ${supplier.paymentTerms} days` : 'fully settled'}</span>
        </div>
        <div className="surface stat-card">
          <span className="label">PRODUCTS</span>
          <span className="value">{supplier.products > 0 ? supplier.products : '—'}</span>
          <span className="sub">SKUs supplied</span>
        </div>
        <div className="surface stat-card" style={{ borderColor: supplier.pendingInvoices > 0 ? 'rgba(251,191,36,0.3)' : 'var(--line)' }}>
          <span className="label">PENDING INVOICES</span>
          <span className="value" style={{ color: supplier.pendingInvoices > 0 ? 'var(--warn)' : 'var(--fg-3)' }}>
            {supplier.pendingInvoices}
          </span>
          <span className="sub">awaiting payment</span>
        </div>
        <div className="surface stat-card">
          <span className="label">LAST DELIVERY</span>
          <span className="value" style={{ fontSize: 18 }}>{daysAgoLabel(supplier.lastDelivery)}</span>
          <span className="sub">{deliveries.length} deliveries on record</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['overview', 'deliveries', 'edit'] as const).map((t) => (
          <button
            key={t}
            className={`tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'deliveries' ? `Deliveries (${deliveries.length})` : t === 'edit' ? 'Edit supplier' : 'Overview'}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="detail-grid">
          {/* Left: chart + recent deliveries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 6-month delivery chart */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Delivery value — last 6 months</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>Dec 2025 – May 2026</span>
              </div>
              <div style={{ padding: '20px 24px 16px' }}>
                <DeliveryChart deliveries={deliveries} color={avatarColor} />
              </div>
              <div style={{
                padding: '10px 16px', borderTop: '1px solid var(--line)',
                display: 'flex', justifyContent: 'space-between', background: 'var(--bg-3)',
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Total delivered</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', fontWeight: 500 }}>{fmt(totalDelivered)}</span>
              </div>
            </div>

            {/* Recent deliveries */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Recent deliveries</span>
                <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setTab('deliveries')}>
                  View all
                </button>
              </div>
              {deliveries.slice(0, 4).map((d, i) => (
                <div key={d.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: i < 3 ? '1px solid var(--line)' : 'none',
                }}>
                  <div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--fg-2)', marginBottom: 2 }}>{d.invoice}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                      {daysAgoLabel(d.date)} · {d.items} item{d.items > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: 14, fontWeight: 500 }}>{fmtShort(d.value)}</div>
                    <span className={`pill${d.status === 'delivered' ? ' good' : d.status === 'pending' ? ' warn' : ' info'}`} style={{ fontSize: 10 }}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment history */}
            {payments.length > 0 && (
              <div className="surface" style={{ overflow: 'hidden' }}>
                <div className="card-head">
                  <span className="card-title">Payment history</span>
                </div>
                {payments.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px',
                    borderBottom: i < payments.length - 1 ? '1px solid var(--line)' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                      background: p.type === 'invoice' ? 'var(--bad-soft)' : 'var(--good-soft)',
                      display: 'grid', placeItems: 'center',
                      color: p.type === 'invoice' ? 'var(--bad)' : 'var(--good)',
                      fontSize: 14, fontWeight: 600,
                    }}>
                      {p.type === 'invoice' ? '↑' : '↓'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>
                        {p.type === 'invoice' ? 'Invoice raised' : 'Payment made'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{p.note} · {daysAgoLabel(p.date)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{
                        fontSize: 14, fontWeight: 600,
                        color: p.type === 'invoice' ? 'var(--bad)' : 'var(--good)',
                      }}>
                        {p.type === 'invoice' ? '+' : '−'}{fmtShort(p.amount)}
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>
                        Bal: {fmtShort(p.balance)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Contact details */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Contact details</span>
                <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setTab('edit')}>{Icons.edit}</button>
              </div>
              <div style={{ padding: '4px 16px 8px' }}>
                {[
                  { k: 'Rep',           v: supplier.rep },
                  { k: 'Phone',         v: supplier.contactPhone },
                  { k: 'Category',      v: supplier.category },
                  { k: 'Payment terms', v: `${supplier.paymentTerms} days` },
                  { k: 'Status',        v: supplier.status },
                  { k: 'ID',            v: supplier.id },
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
              {supplier.outstanding > 0 && (
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Record payment
                </button>
              )}
              <a
                href={`https://wa.me/${supplier.contactPhone.replace(/\D/g, '')}`}
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
                  WhatsApp rep
                </button>
              </a>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setTab('edit')}>
                {Icons.edit} Edit supplier
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                {Icons.download} Export history
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
                  No notes yet. Add a note about delivery schedules, quality issues, or negotiated rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELIVERIES TAB ────────────────────────────────────────────────────── */}
      {tab === 'deliveries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Outstanding banner */}
          {supplier.outstanding > 0 && (
            <div style={{
              padding: '16px 20px', borderRadius: 10,
              background: 'var(--bad-soft)', border: '1px solid rgba(251,113,133,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            }}>
              <div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--bad)', letterSpacing: '0.08em', marginBottom: 4 }}>OUTSTANDING PAYABLE</div>
                <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--bad)', letterSpacing: '-0.02em' }}>{fmt(supplier.outstanding)}</div>
              </div>
              <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Record payment
              </button>
            </div>
          )}

          <div className="surface" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <span className="card-title">Delivery history</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>
                Total: {fmtShort(totalDelivered)}
              </span>
            </div>
            <div className="table-scroll">
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th className="num">Items</th>
                    <th className="num">Value</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr key={d.id}>
                      <td className="mono" style={{ fontSize: 12 }}>{d.invoice}</td>
                      <td style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>{daysAgoLabel(d.date)}</td>
                      <td className="num mono" style={{ fontSize: 12.5 }}>{d.items}</td>
                      <td className="num mono" style={{ fontSize: 13, fontWeight: 500 }}>{fmt(d.value)}</td>
                      <td>
                        <span className={`pill${d.status === 'delivered' ? ' good' : d.status === 'pending' ? ' warn' : ' info'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td>
                        <span className={`pill${d.paid ? ' good' : ' warn'}`} style={{ fontSize: 10 }}>
                          {d.paid ? 'Paid' : 'Unpaid'}
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
                {deliveries.length} deliveries on record
              </span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
                {deliveries.filter((d) => !d.paid).length} unpaid
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT TAB ──────────────────────────────────────────────────────────── */}
      {tab === 'edit' && (
        <div className="detail-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {saved && (
              <div style={{
                padding: '12px 16px', borderRadius: 8,
                background: 'var(--good-soft)', border: '1px solid rgba(52,211,153,0.3)',
                display: 'flex', alignItems: 'center', gap: 10,
                color: 'var(--good)', fontSize: 13.5,
              }}>
                {Icons.check} Changes saved successfully
              </div>
            )}

            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Supplier information</span>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Company / supplier name</label>
                  <input
                    className="form-input"
                    value={editValues.name}
                    onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    className="form-input"
                    value={editValues.category}
                    onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-2)', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Payment terms</label>
                    <select
                      className="form-input"
                      value={editValues.paymentTerms}
                      onChange={(e) => setEditValues((v) => ({ ...v, paymentTerms: e.target.value }))}
                    >
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={editValues.status}
                      onChange={(e) => setEditValues((v) => ({ ...v, status: e.target.value as SupplierStatus }))}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On hold">On hold</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Contact</span>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Sales rep name</label>
                  <input
                    className="form-input"
                    value={editValues.rep}
                    onChange={(e) => setEditValues((v) => ({ ...v, rep: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact phone</label>
                  <input
                    className="form-input"
                    value={editValues.phone}
                    onChange={(e) => setEditValues((v) => ({ ...v, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="surface" style={{ overflow: 'hidden', borderColor: 'rgba(251,113,133,0.3)' }}>
              <div className="card-head" style={{ borderColor: 'rgba(251,113,133,0.2)' }}>
                <span className="card-title" style={{ color: 'var(--bad)' }}>Danger zone</span>
              </div>
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 3 }}>Remove supplier</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>
                    Delivery history and invoices are preserved for auditing purposes.
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ color: 'var(--bad)', borderColor: 'rgba(251,113,133,0.3)', whiteSpace: 'nowrap' }}>
                  Remove
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>
                {Icons.check} Save changes
              </button>
              <button className="btn btn-ghost" onClick={() => setTab('overview')}>Cancel</button>
            </div>
          </div>

          {/* Right: info panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Current values</span>
              </div>
              <div style={{ padding: '4px 16px 8px' }}>
                {[
                  { k: 'Supplier ID',   v: supplier.id },
                  { k: 'Status',        v: supplier.status },
                  { k: 'Products',      v: `${supplier.products} SKUs` },
                  { k: 'Outstanding',   v: supplier.outstanding > 0 ? fmtShort(supplier.outstanding) : 'Nil' },
                  { k: 'Last delivery', v: daysAgoLabel(supplier.lastDelivery) },
                ].map((row) => (
                  <div key={row.k} className="field-row">
                    <span className="k">{row.k}</span>
                    <span className="v mono" style={{ fontSize: 12 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'var(--info-soft)', border: '1px solid rgba(96,165,250,0.3)',
              fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--info)' }}>Tip:</strong> Changing payment terms only affects future invoices. Existing outstanding balances retain their original terms.
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
