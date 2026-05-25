'use client';

import React, { useState, useMemo } from 'react';
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

const SUPPLIERS: Supplier[] = [
  {
    id: 'sup001', name: 'Bakhresa Co.',       category: 'Flour / Grains',
    contactPhone: '+255 22 218 0000', rep: 'Joseph Mwangi',
    products: 14, lastDelivery: daysAgo(3),
    paymentTerms: 30, outstanding: 480_000, status: 'Active',
    avatarHue: 30, pendingInvoices: 2,
  },
  {
    id: 'sup002', name: 'Unilever EA',         category: 'Household / Cleaning',
    contactPhone: '+255 22 260 1500', rep: 'Grace Muriuki',
    products: 28, lastDelivery: daysAgo(7),
    paymentTerms: 60, outstanding: 620_000, status: 'Active',
    avatarHue: 200, pendingInvoices: 1,
  },
  {
    id: 'sup003', name: 'Coca-Cola Kwanza',    category: 'Beverages',
    contactPhone: '+255 22 213 7000', rep: 'Kelvin Massawe',
    products: 18, lastDelivery: daysAgo(2),
    paymentTerms: 30, outstanding: 0, status: 'Active',
    avatarHue: 5, pendingInvoices: 0,
  },
  {
    id: 'sup004', name: 'Azam Dairy',          category: 'Dairy / Milk',
    contactPhone: '+255 24 223 1111', rep: 'Amani Salehe',
    products: 9, lastDelivery: daysAgo(1),
    paymentTerms: 30, outstanding: 155_000, status: 'Active',
    avatarHue: 55, pendingInvoices: 1,
  },
  {
    id: 'sup005', name: 'Chai Bora Ltd',       category: 'Tea / Beverages',
    contactPhone: '+255 22 215 3000', rep: 'Fatuma Khamisi',
    products: 7, lastDelivery: daysAgo(12),
    paymentTerms: 60, outstanding: 95_000, status: 'Active',
    avatarHue: 140, pendingInvoices: 1,
  },
  {
    id: 'sup006', name: 'Kagera Sugar',        category: 'Sugar / Grocery',
    contactPhone: '+255 28 222 0050', rep: 'Abubakari Musa',
    products: 4, lastDelivery: daysAgo(18),
    paymentTerms: 30, outstanding: 340_000, status: 'On hold',
    avatarHue: 20, pendingInvoices: 2,
  },
  {
    id: 'sup007', name: 'PZ Cussons',          category: 'Household / Cosmetics',
    contactPhone: '+255 22 260 2900', rep: 'Linda Mwamba',
    products: 22, lastDelivery: daysAgo(9),
    paymentTerms: 60, outstanding: 290_000, status: 'Active',
    avatarHue: 270, pendingInvoices: 0,
  },
  {
    id: 'sup008', name: 'Tanga Fresh',         category: 'Dairy / Yoghurt',
    contactPhone: '+255 27 264 3500', rep: 'Rajabu Ally',
    products: 6, lastDelivery: daysAgo(4),
    paymentTerms: 30, outstanding: 78_000, status: 'Active',
    avatarHue: 175, pendingInvoices: 0,
  },
  {
    id: 'sup009', name: 'Britania',            category: 'Snacks / Biscuits',
    contactPhone: '+255 22 211 8800', rep: 'Diana Ngowi',
    products: 11, lastDelivery: daysAgo(21),
    paymentTerms: 90, outstanding: 0, status: 'Inactive',
    avatarHue: 320, pendingInvoices: 0,
  },
  {
    id: 'sup010', name: 'Murzah Oil',          category: 'Cooking Oil / Fats',
    contactPhone: '+255 22 218 5500', rep: 'Hamza Murzah',
    products: 5, lastDelivery: daysAgo(6),
    paymentTerms: 30, outstanding: 360_000, status: 'Active',
    avatarHue: 45, pendingInvoices: 1,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysAgoLabel(date: Date) {
  const diff = Math.round((TODAY.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

const STATUS_STYLE: Record<SupplierStatus, { className: string }> = {
  Active:   { className: 'pill good'  },
  Inactive: { className: 'pill'       },
  'On hold':{ className: 'pill warn'  },
};

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
          <div style={{ display: 'flex', gap: 8 }}>
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
              <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>{supplier.products}</div>
            </div>
          </div>

          {/* Details */}
          <div className="surface" style={{ padding: '0 0 0 0', overflow: 'hidden' }}>
            <div className="card-head">
              <span className="card-title">Contact details</span>
            </div>
            <div style={{ padding: '4px 16px 8px' }}>
              <div className="field-row">
                <span className="k">Rep</span>
                <span className="v">{supplier.rep}</span>
              </div>
              <div className="field-row">
                <span className="k">Phone</span>
                <span className="v mono" style={{ fontSize: 12 }}>{supplier.contactPhone}</span>
              </div>
              <div className="field-row">
                <span className="k">Category</span>
                <span className="v">{supplier.category}</span>
              </div>
              <div className="field-row">
                <span className="k">Last delivery</span>
                <span className="v mono" style={{ fontSize: 12 }}>{daysAgoLabel(supplier.lastDelivery)}</span>
              </div>
              <div className="field-row">
                <span className="k">Payment terms</span>
                <span className="v">{supplier.paymentTerms} days</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
              Record payment
            </button>
            <button className="btn btn-soft" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
              {Icons.edit} Edit supplier
            </button>
            <div style={{ padding: '10px 12px', borderRadius: 7, background: 'var(--bg-3)', border: '1px solid var(--line)', fontSize: 12, color: 'var(--fg-3)', textAlign: 'center' }}>
              Full detail page at <span className="mono" style={{ color: 'var(--accent)' }}>/suppliers/{supplier.id}</span> — coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | SupplierStatus>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filtered = useMemo(() => SUPPLIERS.filter((s) => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q) && !s.rep.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [query, statusFilter]);

  const totalOutstanding = SUPPLIERS.reduce((sum, s) => sum + s.outstanding, 0);
  const totalActive = SUPPLIERS.filter((s) => s.status === 'Active').length;
  const totalPending = SUPPLIERS.reduce((sum, s) => sum + s.pendingInvoices, 0);

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Suppliers' }]}
      actions={
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.plus} Add supplier
        </button>
      }
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Suppliers</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
            Track vendors, deliveries, payment terms and outstanding balances.
          </p>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <div className="surface" style={{ padding: '16px 18px' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>TOTAL SUPPLIERS</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>{SUPPLIERS.length}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>across all categories</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>ACTIVE</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--good)' }}>{totalActive}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>delivering regularly</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px', borderColor: totalPending > 0 ? 'rgba(251,191,36,0.3)' : 'var(--line)' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>PENDING INVOICES</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--warn)' }}>{totalPending}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--warn)', marginTop: 6 }}>awaiting payment</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px', borderColor: totalOutstanding > 0 ? 'rgba(251,113,133,0.3)' : 'var(--line)' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>TOTAL PAYABLE</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--bad)' }}>{fmtShort(totalOutstanding)}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--bad)', marginTop: 6 }}>⚠ due this month</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220,
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
        <div style={{ display: 'flex', gap: 5 }}>
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
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              {s}
              <span className="mono" style={{ fontSize: 10, color: statusFilter === s ? 'var(--accent)' : 'var(--fg-4)' }}>
                {s === 'All' ? SUPPLIERS.length : SUPPLIERS.filter((sup) => sup.status === s).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="surface" style={{ overflow: 'hidden' }}>
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
            {filtered.map((s) => (
              <tr key={s.id} onClick={() => setSelectedSupplier(s)}>
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
                <td className="num mono" style={{ fontSize: 13 }}>{s.products}</td>

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
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 8px', borderRadius: 999,
                      border: '1px solid var(--line-2)',
                      background: 'var(--bg-3)',
                      fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--fg-2)',
                    }}
                  >
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
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '5px 9px', fontSize: 12 }}
                      onClick={() => setSelectedSupplier(s)}
                    >
                      View
                    </button>
                    <button className="icon-btn" title="Edit" style={{ width: 28, height: 28 }}>
                      {Icons.edit}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{
          padding: '11px 16px', borderTop: '1px solid var(--line)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg-3)',
        }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
            Showing {filtered.length} of {SUPPLIERS.length} suppliers
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
            Total payable:{' '}
            <span style={{ color: 'var(--bad)' }}>{fmtShort(filtered.reduce((s, sup) => s + sup.outstanding, 0))}</span>
          </span>
        </div>
      </div>

      {/* Supplier detail drawer */}
      {selectedSupplier && (
        <SupplierDrawer
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </AppShell>
  );
}
