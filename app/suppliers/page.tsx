'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';
import { supplierApi, SupplierListItem, SupplierStats } from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
type SupplierStatus = 'Active' | 'Inactive' | 'On hold';

const STATUS_STYLE: Record<string, { className: string }> = {
  active:    { className: 'pill good' },
  inactive:  { className: 'pill' },
  on_hold:   { className: 'pill warn' },
  Active:    { className: 'pill good' },
  Inactive:  { className: 'pill' },
  'On hold': { className: 'pill warn' },
};

function getStatusClass(status: string) {
  return STATUS_STYLE[status]?.className ?? 'pill';
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysAgoLabel(dateStr: string | null) {
  if (!dateStr) return 'Never';
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid var(--line-2)',borderTopColor:'var(--accent)',animation:'spin 0.7s linear infinite',margin:'0 auto'}} />
    </>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 300, background: 'var(--bg-2)', border: '1px solid var(--good)',
      borderRadius: 10, padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      <span style={{ color: 'var(--good)', fontSize: 16 }}>✓</span>
      <span style={{ fontSize: 13.5 }}>{message}</span>
      <button onClick={onDismiss} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 16, padding: 0 }}>×</button>
    </div>
  );
}

// ── Supplier Detail Drawer ────────────────────────────────────────────────────
function SupplierDrawer({ supplier, onClose }: { supplier: SupplierListItem; onClose: () => void }) {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9, flexShrink: 0,
              background: 'var(--accent)',
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
          {/* Status */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={getStatusClass(supplier.status)}>{supplier.status}</span>
          </div>

          {/* Key figures */}
          <div className="form-grid-2" style={{ gap: 8 }}>
            <div style={{ padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 4 }}>OUTSTANDING</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: supplier.outstanding_balance > 0 ? 'var(--bad)' : 'var(--good)', letterSpacing: '-0.01em' }}>
                {supplier.outstanding_balance > 0 ? fmtShort(supplier.outstanding_balance) : 'Nil'}
              </div>
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 4 }}>DELIVERIES</div>
              <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>
                {supplier.delivery_count > 0 ? supplier.delivery_count : <span style={{ color: 'var(--fg-4)', fontSize: 14 }}>None yet</span>}
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
                { k: 'Phone',         v: supplier.phone },
                { k: 'Email',         v: supplier.email || '—' },
                { k: 'City',          v: supplier.city || '—' },
                { k: 'Category',      v: supplier.category },
                { k: 'Last delivery', v: daysAgoLabel(supplier.last_delivery_date) },
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
            <Link href={`/suppliers/${supplier.id}`}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                View full profile
              </button>
            </Link>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
              View delivery history
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([]);
  const [stats, setStats] = useState<SupplierStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | string>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierListItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supplierApi.getList(),
      supplierApi.getStats(),
    ]).then(([listRes, statsRes]) => {
      if (listRes.success) setSuppliers(listRes.data);
      if (statsRes.success) setStats(statsRes.data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => suppliers.filter((s) => {
    if (statusFilter !== 'All' && s.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q) && !s.phone.includes(q)) return false;
    }
    return true;
  }), [query, statusFilter, suppliers]);

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
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-sub">Track vendors, deliveries, payment terms and outstanding balances.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost page-sec">{Icons.download} Export</button>
          <button className="btn btn-soft page-sec">{Icons.filter} Filter</button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface stat-card">
          <span className="label">TOTAL SUPPLIERS</span>
          <span className="value">{stats ? stats.total_suppliers : '—'}</span>
          <span className="sub">across all categories</span>
        </div>
        <div className="surface stat-card">
          <span className="label">ACTIVE</span>
          <span className="value" style={{ color: 'var(--good)' }}>{stats ? stats.active_suppliers : '—'}</span>
          <span className="sub">delivering regularly</span>
        </div>
        <div className="surface stat-card" style={{ borderColor: (stats?.total_outstanding ?? 0) > 0 ? 'rgba(251,191,36,0.3)' : 'var(--line)' }}>
          <span className="label">TOTAL OUTSTANDING</span>
          <span className="value" style={{ color: 'var(--bad)', fontSize: (stats?.total_outstanding ?? 0) > 1e6 ? 20 : 26 }}>
            {stats ? fmtShort(stats.total_outstanding) : '—'}
          </span>
          <span className="sub" style={{ color: 'var(--bad)' }}>⚠ due this month</span>
        </div>
        <div className="surface stat-card">
          <span className="label">VALUE YTD</span>
          <span className="value">{stats ? fmtShort(stats.total_value_ytd) : '—'}</span>
          <span className="sub">total purchases this year</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 180,
          padding: '0 10px 0 12px', height: 32,
          border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg)',
        }}>
          {Icons.search}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category or phone…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }}
          />
          {query && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{filtered.length}</span>}
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(['All', 'active', 'inactive', 'on_hold'] as const).map((s) => (
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
              {s === 'All' ? 'All' : s === 'on_hold' ? 'On hold' : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="mono" style={{ fontSize: 10, color: statusFilter === s ? 'var(--accent)' : 'var(--fg-4)' }}>
                {s === 'All' ? suppliers.length : suppliers.filter((sup) => sup.status.toLowerCase() === s).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="surface" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-3)' }}>Loading suppliers…</div>
        </div>
      ) : (
        <div className="surface" style={{ overflow: 'hidden' }}>
          <div className="table-scroll">
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Last delivery</th>
                  <th className="num">Outstanding</th>
                  <th>Status</th>
                  <th style={{ width: 90 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--fg-3)' }}>
                      {query ? `No suppliers match "${query}"` : 'No suppliers found.'}
                    </td>
                  </tr>
                )}
                {filtered.map((s) => (
                  <tr key={s.id} onClick={() => setSelectedSupplier(s)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                          background: 'var(--accent)',
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
                    <td>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{s.phone || '—'}</div>
                    </td>
                    <td>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{s.city || '—'}</div>
                    </td>
                    <td>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{daysAgoLabel(s.last_delivery_date)}</div>
                    </td>
                    <td className="num">
                      {s.outstanding_balance > 0 ? (
                        <span className="mono" style={{ fontSize: 13, color: s.outstanding_balance > 300_000 ? 'var(--bad)' : 'var(--warn)' }}>
                          {fmt(s.outstanding_balance)}
                        </span>
                      ) : (
                        <span className="mono" style={{ fontSize: 12, color: 'var(--good)' }}>Nil</span>
                      )}
                    </td>
                    <td>
                      <span className={getStatusClass(s.status)}>{s.status}</span>
                    </td>
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
              <span style={{ color: 'var(--bad)' }}>{fmtShort(filtered.reduce((s, sup) => s + sup.outstanding_balance, 0))}</span>
            </span>
          </div>
        </div>
      )}

      {/* Supplier detail drawer */}
      {selectedSupplier && (
        <SupplierDrawer
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
