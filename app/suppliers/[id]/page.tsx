'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtShort } from '../../../lib/utils';
import { supplierApi, SupplierListItem } from '../../../lib/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
function daysAgoLabel(dateStr: string | null) {
  if (!dateStr) return 'Never';
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return `${diff} days ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStatusClass(status: string) {
  const lower = status.toLowerCase();
  if (lower === 'active') return 'pill good';
  if (lower === 'inactive') return 'pill';
  return 'pill warn';
}

// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid var(--line-2)',borderTopColor:'var(--accent)',animation:'spin 0.7s linear infinite',margin:'0 auto'}} />
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function SupplierDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [supplier, setSupplier] = useState<SupplierListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<'overview' | 'edit'>('overview');
  const [editValues, setEditValues] = useState({ name: '', category: '', phone: '', status: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    supplierApi.getDetail(id).then((res) => {
      if (res.success) {
        setSupplier(res.data);
        setEditValues({
          name:     res.data.name,
          category: res.data.category,
          phone:    res.data.phone,
          status:   res.data.status,
        });
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Suppliers', href: '/suppliers' }, { label: 'Loading…' }]}>
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-3)' }}>Loading supplier…</div>
        </div>
      </AppShell>
    );
  }

  if (notFound || !supplier) {
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
          <a href={`https://wa.me/${supplier.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
            <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <g stroke="#25d366" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 14l1-3a6 6 0 1 1 2.5 2.5L2 14z" />
                </g>
              </svg>
              WhatsApp
            </button>
          </a>
          {supplier.outstanding_balance > 0 && (
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
          background: 'var(--accent)',
          display: 'grid', placeItems: 'center',
          fontSize: 24, fontWeight: 700, color: '#fff',
        }}>
          {supplier.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>{supplier.name}</h1>
            <span className={getStatusClass(supplier.status)}>{supplier.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3a1.5 1.5 0 0 1 1.5-1.5h1l1.5 3.5-1.5 1A9 9 0 0 0 10 10l1-1.5 3.5 1.5v1A1.5 1.5 0 0 1 13 12.5C7 12.5 3 8.5 3 3z"/></g></svg>
              {supplier.phone || '—'}
            </span>
            {supplier.email && (
              <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{supplier.email}</span>
            )}
            {supplier.city && (
              <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{supplier.city}</span>
            )}
            <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{supplier.category}</span>
          </div>
        </div>

        {supplier.outstanding_balance > 0 && (
          <div style={{
            padding: '10px 16px', borderRadius: 8, textAlign: 'center',
            background: 'var(--bad-soft)', border: '1px solid rgba(251,113,133,0.3)',
          }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--bad)', letterSpacing: '0.08em', marginBottom: 3 }}>OUTSTANDING</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--bad)', letterSpacing: '-0.01em' }}>{fmtShort(supplier.outstanding_balance)}</div>
          </div>
        )}
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface stat-card" style={{ borderColor: supplier.outstanding_balance > 0 ? 'rgba(251,113,133,0.3)' : 'var(--line)' }}>
          <span className="label">OUTSTANDING</span>
          <span className="value" style={{ color: supplier.outstanding_balance > 0 ? 'var(--bad)' : 'var(--good)', fontSize: supplier.outstanding_balance > 1e6 ? 20 : 26 }}>
            {supplier.outstanding_balance > 0 ? fmtShort(supplier.outstanding_balance) : 'Nil'}
          </span>
          <span className="sub">{supplier.outstanding_balance > 0 ? 'awaiting payment' : 'fully settled'}</span>
        </div>
        <div className="surface stat-card">
          <span className="label">TOTAL VALUE</span>
          <span className="value">{fmtShort(supplier.total_value)}</span>
          <span className="sub">lifetime purchases</span>
        </div>
        <div className="surface stat-card">
          <span className="label">DELIVERIES</span>
          <span className="value">{supplier.delivery_count}</span>
          <span className="sub">on record</span>
        </div>
        <div className="surface stat-card">
          <span className="label">LAST DELIVERY</span>
          <span className="value" style={{ fontSize: 18 }}>{daysAgoLabel(supplier.last_delivery_date)}</span>
          <span className="sub">most recent</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['overview', 'edit'] as const).map((t) => (
          <button
            key={t}
            className={`tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'edit' ? 'Edit supplier' : 'Overview'}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="detail-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Outstanding banner */}
            {supplier.outstanding_balance > 0 && (
              <div style={{
                padding: '16px 20px', borderRadius: 10,
                background: 'var(--bad-soft)', border: '1px solid rgba(251,113,133,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
              }}>
                <div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--bad)', letterSpacing: '0.08em', marginBottom: 4 }}>OUTSTANDING PAYABLE</div>
                  <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--bad)', letterSpacing: '-0.02em' }}>{fmt(supplier.outstanding_balance)}</div>
                </div>
                <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  Record payment
                </button>
              </div>
            )}

            {/* Summary */}
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Supplier summary</span>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Category',      value: supplier.category },
                  { label: 'Status',        value: supplier.status },
                  { label: 'City',          value: supplier.city || '—' },
                  { label: 'Total value',   value: fmtShort(supplier.total_value) },
                  { label: 'Deliveries',    value: `${supplier.delivery_count}` },
                  { label: 'Last delivery', value: daysAgoLabel(supplier.last_delivery_date) },
                ].map((row) => (
                  <div key={row.label} className="field-row">
                    <span className="k">{row.label}</span>
                    <span className="v mono" style={{ fontSize: 12.5 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Contact details</span>
                <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setTab('edit')}>{Icons.edit}</button>
              </div>
              <div style={{ padding: '4px 16px 8px' }}>
                {[
                  { k: 'Phone',    v: supplier.phone || '—' },
                  { k: 'Email',    v: supplier.email || '—' },
                  { k: 'City',     v: supplier.city || '—' },
                  { k: 'Category', v: supplier.category },
                  { k: 'Status',   v: supplier.status },
                  { k: 'ID',       v: supplier.id },
                ].map((row) => (
                  <div key={row.k} className="field-row">
                    <span className="k">{row.k}</span>
                    <span className="v mono" style={{ fontSize: 12 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="card-title" style={{ marginBottom: 6 }}>Quick actions</div>
              {supplier.outstanding_balance > 0 && (
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Record payment
                </button>
              )}
              <a
                href={`https://wa.me/${supplier.phone.replace(/\D/g, '')}`}
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
                  WhatsApp supplier
                </button>
              </a>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setTab('edit')}>
                {Icons.edit} Edit supplier
              </button>
            </div>

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
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={editValues.status}
                    onChange={(e) => setEditValues((v) => ({ ...v, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On hold">On hold</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Contact</span>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
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

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>
                {Icons.check} Save changes
              </button>
              <button className="btn btn-ghost" onClick={() => setTab('overview')}>Cancel</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="surface" style={{ overflow: 'hidden' }}>
              <div className="card-head">
                <span className="card-title">Current values</span>
              </div>
              <div style={{ padding: '4px 16px 8px' }}>
                {[
                  { k: 'Supplier ID',   v: supplier.id },
                  { k: 'Status',        v: supplier.status },
                  { k: 'Total value',   v: fmtShort(supplier.total_value) },
                  { k: 'Outstanding',   v: supplier.outstanding_balance > 0 ? fmtShort(supplier.outstanding_balance) : 'Nil' },
                  { k: 'Last delivery', v: daysAgoLabel(supplier.last_delivery_date) },
                ].map((row) => (
                  <div key={row.k} className="field-row">
                    <span className="k">{row.k}</span>
                    <span className="v mono" style={{ fontSize: 12 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
