'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Data ──────────────────────────────────────────────────────────────────────
const TODAY = new Date(2026, 4, 25);
const daysAgo = (n: number) => new Date(TODAY.getTime() - n * 86400000);

const INITIAL_SUPPLIERS: Supplier[] = [
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

const CATEGORIES = [
  'Flour / Grains', 'Household / Cleaning', 'Beverages', 'Dairy / Milk',
  'Tea / Beverages', 'Sugar / Grocery', 'Household / Cosmetics', 'Dairy / Yoghurt',
  'Snacks / Biscuits', 'Cooking Oil / Fats', 'Fresh Produce', 'Meat / Poultry',
  'Frozen Foods', 'Pharmacy / Health', 'Electronics', 'Stationery',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysAgoLabel(date: Date) {
  const diff = Math.round((TODAY.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

const STATUS_STYLE: Record<SupplierStatus, { className: string }> = {
  Active:    { className: 'pill good' },
  Inactive:  { className: 'pill' },
  'On hold': { className: 'pill warn' },
};

// ── Add Supplier Drawer ───────────────────────────────────────────────────────
interface AddSupplierForm {
  name: string;
  category: string;
  rep: string;
  phone: string;
  paymentTerms: string;
  status: SupplierStatus;
}

const EMPTY_FORM: AddSupplierForm = {
  name: '', category: '', rep: '', phone: '', paymentTerms: '30', status: 'Active',
};

function AddSupplierDrawer({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
}) {
  const [form, setForm] = useState<AddSupplierForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<AddSupplierForm>>({});
  const [saving, setSaving] = useState(false);

  const set = (field: keyof AddSupplierForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  function validate(): boolean {
    const errs: Partial<AddSupplierForm> = {};
    if (!form.name.trim())     errs.name     = 'Required';
    if (!form.category.trim()) errs.category = 'Required';
    if (!form.rep.trim())      errs.rep      = 'Required';
    if (!form.phone.trim())    errs.phone    = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    // Simulate brief save delay
    setTimeout(() => {
      const newSupplier: Supplier = {
        id: `sup${String(Math.floor(Math.random() * 9000) + 1000)}`,
        name: form.name.trim(),
        category: form.category,
        contactPhone: form.phone.trim(),
        rep: form.rep.trim(),
        products: 0,
        lastDelivery: TODAY,
        paymentTerms: Number(form.paymentTerms) as 30 | 60 | 90,
        outstanding: 0,
        status: form.status,
        avatarHue: Math.floor(Math.random() * 360),
        pendingInvoices: 0,
      };
      onSave(newSupplier);
      setSaving(false);
    }, 600);
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Add new supplier</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>Fill in the details below to register a new supplier.</div>
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' }}>
          {/* Company name */}
          <div className="form-group">
            <label className="form-label">Company / supplier name <span style={{ color: 'var(--bad)' }}>*</span></label>
            <input
              className="form-input"
              placeholder="e.g. Bakhresa Co."
              value={form.name}
              onChange={set('name')}
              style={{ borderColor: errors.name ? 'var(--bad)' : undefined }}
            />
            {errors.name && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.name}</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category <span style={{ color: 'var(--bad)' }}>*</span></label>
            <select
              className="form-input"
              value={form.category}
              onChange={set('category')}
              style={{ borderColor: errors.category ? 'var(--bad)' : undefined }}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            {errors.category && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.category}</span>}
          </div>

          {/* Sales rep */}
          <div className="form-group">
            <label className="form-label">Sales rep name <span style={{ color: 'var(--bad)' }}>*</span></label>
            <input
              className="form-input"
              placeholder="e.g. Joseph Mwangi"
              value={form.rep}
              onChange={set('rep')}
              style={{ borderColor: errors.rep ? 'var(--bad)' : undefined }}
            />
            {errors.rep && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.rep}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label">Contact phone <span style={{ color: 'var(--bad)' }}>*</span></label>
            <input
              className="form-input"
              placeholder="+255 22 XXX XXXX"
              value={form.phone}
              onChange={set('phone')}
              style={{ borderColor: errors.phone ? 'var(--bad)' : undefined }}
            />
            {errors.phone && <span style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.phone}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Payment terms */}
            <div className="form-group">
              <label className="form-label">Payment terms</label>
              <select className="form-input" value={form.paymentTerms} onChange={set('paymentTerms')}>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Initial status</label>
              <select className="form-input" value={form.status} onChange={set('status')}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On hold">On hold</option>
              </select>
            </div>
          </div>

          {/* Info note */}
          <div style={{
            padding: '11px 14px', borderRadius: 8,
            background: 'var(--accent-soft)', border: '1px solid var(--accent-line)',
            fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--accent)' }}>Note:</strong> You can add products and set outstanding balances after creating the supplier record.
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={saving}
            >
              {saving ? 'Saving…' : `${Icons.plus as any} Add supplier`}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Supplier Detail Drawer ────────────────────────────────────────────────────
function SupplierDrawer({ supplier, onClose }: { supplier: Supplier; onClose: () => void }) {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9, flexShrink: 0,
              background: `oklch(55% 0.16 ${supplier.avatarHue})`,
              display: 'grid', placeItems: 'center',
              fontSize: 15, fontWeight: 600, color: '#fff',
            }}>
              {supplier.name[0]}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{supplier.name}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{supplier.category}</div>
            </div>
          </div>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}>×</button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status + terms */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={STATUS_STYLE[supplier.status].className}>{supplier.status}</span>
            <span className="pill">{supplier.paymentTerms}-day terms</span>
            {supplier.pendingInvoices > 0 && (
              <span className="pill warn">{supplier.pendingInvoices} pending invoice{supplier.pendingInvoices > 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Key figures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 4 }}>OUTSTANDING</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: supplier.outstanding > 0 ? 'var(--bad)' : 'var(--good)', letterSpacing: '-0.01em' }}>
                {supplier.outstanding > 0 ? fmtShort(supplier.outstanding) : 'Nil'}
              </div>
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 4 }}>PRODUCTS</div>
              <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>
                {supplier.products > 0 ? supplier.products : <span style={{ color: 'var(--fg-4)', fontSize: 14 }}>None yet</span>}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="surface" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <span className="card-title">Contact details</span>
            </div>
            <div style={{ padding: '4px 16px 8px' }}>
              {[
                { k: 'Rep',           v: supplier.rep },
                { k: 'Phone',         v: supplier.contactPhone },
                { k: 'Category',      v: supplier.category },
                { k: 'Last delivery', v: daysAgoLabel(supplier.lastDelivery) },
                { k: 'Payment terms', v: `${supplier.paymentTerms} days` },
              ].map((row) => (
                <div key={row.k} className="field-row">
                  <span className="k">{row.k}</span>
                  <span className="v mono" style={{ fontSize: 12 }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
              Record payment
            </button>
            <button className="btn btn-soft" style={{ width: '100%', justifyContent: 'center', padding: '10px', display: 'flex', gap: 6 }}>
              {Icons.edit} Edit supplier
            </button>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
              View delivery history
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Success toast ─────────────────────────────────────────────────────────────
function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 300, background: 'var(--bg-2)', border: '1px solid var(--good)',
      borderRadius: 10, padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      animation: 'fadeIn 200ms ease',
    }}>
      <span style={{ color: 'var(--good)', fontSize: 16 }}>✓</span>
      <span style={{ fontSize: 13.5 }}>{message}</span>
      <button
        onClick={onDismiss}
        style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 16, padding: 0 }}
      >
        ×
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | SupplierStatus>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => suppliers.filter((s) => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q) && !s.rep.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [query, statusFilter, suppliers]);

  const totalOutstanding = suppliers.reduce((sum, s) => sum + s.outstanding, 0);
  const totalActive      = suppliers.filter((s) => s.status === 'Active').length;
  const totalPending     = suppliers.reduce((sum, s) => sum + s.pendingInvoices, 0);

  function handleAddSupplier(supplier: Supplier) {
    setSuppliers((prev) => [supplier, ...prev]);
    setAddOpen(false);
    setToast(`${supplier.name} added successfully`);
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Suppliers' }]}
      actions={
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setAddOpen(true)}
        >
          {Icons.plus} Add supplier
        </button>
      }
    >
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-sub">Track vendors, deliveries, payment terms and outstanding balances.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icons.download} Export
          </button>
          <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icons.filter} Filter
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface stat-card">
          <span className="label">TOTAL SUPPLIERS</span>
          <span className="value">{suppliers.length}</span>
          <span className="sub">across all categories</span>
        </div>
        <div className="surface stat-card">
          <span className="label">ACTIVE</span>
          <span className="value" style={{ color: 'var(--good)' }}>{totalActive}</span>
          <span className="sub">delivering regularly</span>
        </div>
        <div className="surface stat-card" style={{ borderColor: totalPending > 0 ? 'rgba(251,191,36,0.3)' : 'var(--line)' }}>
          <span className="label">PENDING INVOICES</span>
          <span className="value" style={{ color: 'var(--warn)' }}>{totalPending}</span>
          <span className="sub">awaiting payment</span>
        </div>
        <div className="surface stat-card" style={{ borderColor: totalOutstanding > 0 ? 'rgba(251,113,133,0.3)' : 'var(--line)' }}>
          <span className="label">TOTAL PAYABLE</span>
          <span className="value" style={{ color: 'var(--bad)', fontSize: totalOutstanding > 1e6 ? 20 : 26 }}>{fmtShort(totalOutstanding)}</span>
          <span className="sub" style={{ color: 'var(--bad)' }}>⚠ due this month</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 180,
          padding: '0 10px 0 12px', height: 32,
          border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg)',
        }}>
          {Icons.search}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category or rep…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }}
          />
          {query && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{filtered.length}</span>}
        </div>

        {/* Status filters */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(['All', 'Active', 'Inactive', 'On hold'] as Array<'All' | SupplierStatus>).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '5px 11px', borderRadius: 999,
                border: '1px solid ' + (statusFilter === s ? 'var(--accent-line)' : 'var(--line)'),
                background: statusFilter === s ? 'var(--accent-soft)' : 'var(--bg)',
                color: statusFilter === s ? 'var(--fg)' : 'var(--fg-2)',
                fontSize: 12, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              {s}
              <span className="mono" style={{ fontSize: 10, color: statusFilter === s ? 'var(--accent)' : 'var(--fg-4)' }}>
                {s === 'All' ? suppliers.length : suppliers.filter((sup) => sup.status === s).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="surface" style={{ overflow: 'hidden' }}>
        <div className="table-scroll">
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th className="num">Products</th>
                <th>Last delivery</th>
                <th>Terms</th>
                <th className="num">Outstanding</th>
                <th>Status</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--fg-3)' }}>
                    No suppliers match your search.
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id} onClick={() => setSelectedSupplier(s)} style={{ cursor: 'pointer' }}>
                  {/* Logo / name */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                        background: `oklch(55% 0.16 ${s.avatarHue})`,
                        display: 'grid', placeItems: 'center',
                        fontSize: 14, fontWeight: 600, color: '#fff',
                      }}>
                        {s.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>{s.name}</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{s.category}</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td>
                    <div style={{ fontSize: 13, color: 'var(--fg-2)', marginBottom: 2 }}>{s.rep}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{s.contactPhone}</div>
                  </td>

                  {/* Products */}
                  <td className="num mono" style={{ fontSize: 13 }}>
                    {s.products > 0 ? s.products : <span style={{ color: 'var(--fg-4)' }}>—</span>}
                  </td>

                  {/* Last delivery */}
                  <td>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{daysAgoLabel(s.lastDelivery)}</div>
                    {s.pendingInvoices > 0 && (
                      <div style={{ marginTop: 3 }}>
                        <span className="pill warn" style={{ fontSize: 10 }}>{s.pendingInvoices} invoice{s.pendingInvoices > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </td>

                  {/* Payment terms */}
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 8px', borderRadius: 999,
                      border: '1px solid var(--line-2)',
                      background: 'var(--bg-3)',
                      fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--fg-2)',
                    }}>
                      {s.paymentTerms}d
                    </span>
                  </td>

                  {/* Outstanding */}
                  <td className="num">
                    {s.outstanding > 0 ? (
                      <span className="mono" style={{ fontSize: 13, color: s.outstanding > 300_000 ? 'var(--bad)' : 'var(--warn)' }}>
                        {fmt(s.outstanding)}
                      </span>
                    ) : (
                      <span className="mono" style={{ fontSize: 12, color: 'var(--good)' }}>Nil</span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <span className={STATUS_STYLE[s.status].className}>{s.status}</span>
                  </td>

                  {/* Actions */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <Link href={`/suppliers/${s.id}`}>
                        <button className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12 }}>View</button>
                      </Link>
                      <button className="icon-btn" title="Edit" style={{ width: 28, height: 28 }} onClick={() => setSelectedSupplier(s)}>
                        {Icons.edit}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: '11px 16px', borderTop: '1px solid var(--line)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg-3)', flexWrap: 'wrap', gap: 8,
        }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
            Showing {filtered.length} of {suppliers.length} suppliers
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
            Total payable:{' '}
            <span style={{ color: 'var(--bad)' }}>{fmtShort(filtered.reduce((s, sup) => s + sup.outstanding, 0))}</span>
          </span>
        </div>
      </div>

      {/* Add supplier drawer */}
      {addOpen && (
        <AddSupplierDrawer
          onClose={() => setAddOpen(false)}
          onSave={handleAddSupplier}
        />
      )}

      {/* Supplier detail drawer */}
      {selectedSupplier && (
        <SupplierDrawer
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}

      {/* Success toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
