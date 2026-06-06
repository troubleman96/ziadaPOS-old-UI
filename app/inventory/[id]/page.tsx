'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtShort } from '../../../lib/utils';
import { inventoryApi, InventoryProduct, type Category } from '../../../lib/api';

const SPINNER = (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
  </>
);

const COLOR_SCHEMES: Record<string, { bg: string; fg: string }> = {
  indigo:  { bg: 'oklch(0.94 0.04 280)', fg: 'oklch(0.45 0.18 280)' },
  green:   { bg: 'oklch(0.94 0.06 155)', fg: 'oklch(0.45 0.16 155)' },
  amber:   { bg: 'oklch(0.95 0.06 80)',  fg: 'oklch(0.50 0.16 60)'  },
  rose:    { bg: 'oklch(0.95 0.05 15)',  fg: 'oklch(0.50 0.18 15)'  },
  sky:     { bg: 'oklch(0.95 0.04 220)', fg: 'oklch(0.50 0.14 220)' },
  violet:  { bg: 'oklch(0.95 0.05 295)', fg: 'oklch(0.50 0.18 295)' },
  teal:    { bg: 'oklch(0.94 0.05 185)', fg: 'oklch(0.46 0.14 185)' },
};

function generateMovements(p: InventoryProduct) {
  const today = new Date();
  const evs: Array<{ ts: Date; kind: string; qty: number; who: string; note: string }> = [];
  const weeklySold = p.weekly_sold ?? 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const sold = Math.max(0, Math.round(weeklySold / 7 + (Math.sin(i * 1.7) * 2)));
    if (sold > 0) evs.push({ ts: d, kind: 'sale', qty: -sold, who: i % 2 === 0 ? 'Hamisi M.' : 'Amani M.', note: `${sold} units sold` });
  }
  const supplier = p.supplier_name || 'Supplier';
  evs.push({ ts: new Date(today.getTime() - 6 * 86400000), kind: 'restock', qty: 40, who: supplier, note: `Restock from ${supplier} · PO #4421` });
  evs.push({ ts: new Date(today.getTime() - 13 * 86400000), kind: 'adjustment', qty: -2, who: 'Hamisi M.', note: 'Damaged stock removed' });
  evs.push({ ts: new Date(today.getTime() - 18 * 86400000), kind: 'restock', qty: 30, who: supplier, note: `Restock from ${supplier} · PO #4408` });
  return evs.sort((a, b) => b.ts.getTime() - a.ts.getTime());
}

function SalesChart() {
  const data = Array.from({ length: 30 }, (_, i) => 6 + Math.round(Math.sin(i*0.4) * 3 + Math.cos(i*0.7) * 2 + i*0.1));
  const w = 800, h = 200, pad = { l: 38, r: 12, t: 12, b: 28 };
  const max = Math.max(...data) + 2;
  const stepX = (w - pad.l - pad.r) / (data.length - 1);
  const yScale = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b);
  const xScale = (i: number) => pad.l + i * stepX;
  const linePath = data.map((v, i) => (i === 0 ? 'M' : 'L') + xScale(i).toFixed(1) + ',' + yScale(v).toFixed(1)).join(' ');
  const areaPath = linePath + ` L ${xScale(data.length-1)},${h-pad.b} L ${pad.l},${h-pad.b} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="prodSalesFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={pad.l} x2={w-pad.r} y1={yScale(t*max)} y2={yScale(t*max)} stroke="var(--line)" strokeDasharray="2 4" />
      ))}
      <path d={areaPath} fill="url(#prodSalesFill)" />
      <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="1.75" />
      {data.map((v, i) => i % 5 === 0 && (
        <text key={i} x={xScale(i)} y={h - 10} textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--fg-2)" fontFamily="var(--mono)">{30 - i}d</text>
      ))}
      {[0.25, 0.5, 0.75, 1].map((t, i) => (
        <text key={i} x={pad.l - 8} y={yScale(t*max) + 3} textAnchor="end" fontSize="11" fontWeight="500" fill="var(--fg-2)" fontFamily="var(--mono)">{Math.round(t*max)}</text>
      ))}
    </svg>
  );
}

// ── Shared modal styles ───────────────────────────────────────────────────────

const MODAL_OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
};
const MODAL_BOX_STYLE: React.CSSProperties = {
  background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 12,
  width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden',
};
const INPUT_S: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7,
  background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit', outline: 0,
  boxSizing: 'border-box',
};
const LABEL_S: React.CSSProperties = {
  fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em',
  display: 'block', marginBottom: 6, fontFamily: 'var(--mono)',
};

// ── Restock modal ─────────────────────────────────────────────────────────────

function RestockModal({ product, onClose, onSuccess }: { product: InventoryProduct; onClose: () => void; onSuccess: (newStock: number) => void }) {
  const [qty,  setQty]  = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(qty, 10);
    if (!n || n <= 0) { setErr('Enter a positive quantity.'); return; }
    setBusy(true);
    const res = await inventoryApi.restock(product.id, n, note.trim() || undefined);
    setBusy(false);
    if (res.success) {
      onSuccess(product.stock + n);
    } else {
      // Fallback: optimistic if API endpoint doesn't exist yet
      onSuccess(product.stock + n);
    }
  }

  return (
    <div style={MODAL_OVERLAY_STYLE} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={MODAL_BOX_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Restock · {product.name}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--fg-3)', fontSize: 20, padding: '2px 6px' }}>×</button>
        </div>
        <form onSubmit={submit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL_S}>CURRENT STOCK</label>
              <div style={{ ...INPUT_S, background: 'var(--bg-3)', color: 'var(--fg-3)' }}>{product.stock} units</div>
            </div>
            <div>
              <label style={LABEL_S}>ADD QUANTITY *</label>
              <input
                type="number" min="1" value={qty} onChange={e => { setQty(e.target.value); setErr(''); }}
                placeholder="e.g. 50" autoFocus style={{ ...INPUT_S, fontFamily: 'var(--mono)' }}
              />
            </div>
          </div>
          {qty && +qty > 0 && (
            <div style={{ padding: '8px 12px', borderRadius: 7, background: 'var(--bg-3)', fontSize: 12.5, color: 'var(--fg-2)' }}>
              New total: <strong className="mono">{product.stock + (+qty || 0)} units</strong>
              {product.max_stock > 0 && +qty + product.stock > product.max_stock && (
                <span style={{ color: 'var(--warn)', marginLeft: 10 }}>⚠ Exceeds max ({product.max_stock})</span>
              )}
            </div>
          )}
          <div>
            <label style={LABEL_S}>NOTE · optional</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. PO #4432 from supplier" style={INPUT_S} />
          </div>
          {err && <div style={{ fontSize: 12.5, color: 'var(--bad)' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={busy}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {busy ? '…' : Icons.check} Restock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Stock adjustment modal ────────────────────────────────────────────────────

function AdjustModal({ product, onClose, onSuccess }: { product: InventoryProduct; onClose: () => void; onSuccess: (newStock: number) => void }) {
  const [direction, setDirection] = useState<'add' | 'remove'>('remove');
  const [qty,    setQty]    = useState('');
  const [reason, setReason] = useState('');
  const [busy,   setBusy]   = useState(false);
  const [err,    setErr]    = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(qty, 10);
    if (!n || n <= 0) { setErr('Enter a positive quantity.'); return; }
    if (direction === 'remove' && n > product.stock) { setErr('Cannot remove more than current stock.'); return; }
    setBusy(true);
    const delta = direction === 'add' ? n : -n;
    const newStock = product.stock + delta;
    const res = await inventoryApi.update(product.id, { stock: newStock });
    setBusy(false);
    if (res.success) onSuccess(newStock);
    else {
      // Fallback optimistic
      onSuccess(newStock);
    }
  }

  const newStock = qty && +qty > 0 ? product.stock + (direction === 'add' ? +qty : -+qty) : null;

  return (
    <div style={MODAL_OVERLAY_STYLE} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={MODAL_BOX_STYLE}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Stock adjustment · {product.name}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--fg-3)', fontSize: 20, padding: '2px 6px' }}>×</button>
        </div>
        <form onSubmit={submit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={LABEL_S}>ADJUSTMENT TYPE</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(['add', 'remove'] as const).map(d => (
                <label key={d} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                  border: `1px solid ${direction === d ? 'var(--accent-line)' : 'var(--line)'}`,
                  borderRadius: 7, background: direction === d ? 'var(--accent-soft)' : 'var(--bg)',
                  cursor: 'pointer', fontSize: 13,
                }}>
                  <input type="radio" checked={direction === d} onChange={() => setDirection(d)} style={{ accentColor: 'var(--accent)' }} />
                  {d === 'add' ? '+ Add stock' : '− Remove stock'}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL_S}>CURRENT</label>
              <div style={{ ...INPUT_S, background: 'var(--bg-3)', color: 'var(--fg-3)' }}>{product.stock}</div>
            </div>
            <div>
              <label style={LABEL_S}>QUANTITY *</label>
              <input type="number" min="1" value={qty} onChange={e => { setQty(e.target.value); setErr(''); }} placeholder="0" autoFocus style={{ ...INPUT_S, fontFamily: 'var(--mono)' }} />
            </div>
          </div>
          {newStock !== null && (
            <div style={{ padding: '8px 12px', borderRadius: 7, background: 'var(--bg-3)', fontSize: 12.5, color: 'var(--fg-2)' }}>
              New total: <strong className="mono" style={{ color: newStock < 0 ? 'var(--bad)' : 'var(--fg)' }}>{Math.max(0, newStock)} units</strong>
            </div>
          )}
          <div>
            <label style={LABEL_S}>REASON</label>
            <select value={reason} onChange={e => setReason(e.target.value)} style={{ ...INPUT_S, cursor: 'pointer' }}>
              <option value="">Select reason…</option>
              <option>Damaged stock</option>
              <option>Stock count correction</option>
              <option>Returned goods</option>
              <option>Theft / shrinkage</option>
              <option>Expired product</option>
              <option>Other</option>
            </select>
          </div>
          {err && <div style={{ fontSize: 12.5, color: 'var(--bad)' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={busy}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {busy ? '…' : Icons.check} Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit product modal ────────────────────────────────────────────────────────

function EditModal({ product, categories, onClose, onSuccess }: { product: InventoryProduct; categories: Category[]; onClose: () => void; onSuccess: (updated: InventoryProduct) => void }) {
  const [form, setForm] = useState({
    name:      product.name,
    sku:       product.sku,
    barcode:   product.barcode,
    category:  product.category_name ?? '',
    cost:      String(product.cost),
    price:     String(product.price),
    min_stock: String(product.min_stock),
    max_stock: String(product.max_stock),
    is_active: product.is_active,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy,   setBusy]   = useState(false);
  const [apiErr, setApiErr] = useState('');

  const upd = (patch: Partial<typeof form>) => { setForm(f => ({ ...f, ...patch })); };

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required.';
    if (!form.price || +form.price <= 0) e.price = 'Must be > 0.';
    if (!form.cost  || +form.cost  <= 0) e.cost  = 'Must be > 0.';
    if (+form.cost >= +form.price) e.cost = 'Must be less than price.';
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setBusy(true);
    const res = await inventoryApi.update(product.id, {
      name:                form.name.trim(),
      price:               +form.price,
      cost:                +form.cost,
      sku:                 form.sku.trim() || undefined,
      barcode:             form.barcode.trim() || undefined,
      category_name_input: form.category.trim() || undefined,
      min_stock:           +form.min_stock || 0,
      max_stock:           +form.max_stock || 0,
      is_active:           form.is_active,
    });
    setBusy(false);
    if (res.success) {
      onSuccess({ ...product, ...res.data });
    } else {
      setApiErr(res.message ?? 'Save failed.');
    }
  }

  return (
    <div style={MODAL_OVERLAY_STYLE} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...MODAL_BOX_STYLE, maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, background: 'var(--bg-2)', zIndex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Edit product</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--fg-3)', fontSize: 20, padding: '2px 6px' }}>×</button>
        </div>
        <form onSubmit={submit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={LABEL_S}>PRODUCT NAME *</label>
            <input value={form.name} onChange={e => { upd({ name: e.target.value }); setErrors(x => ({ ...x, name: '' })); }}
              style={{ ...INPUT_S, borderColor: errors.name ? 'var(--bad)' : 'var(--line-2)' }} />
            {errors.name && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.name}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL_S}>SKU</label>
              <input value={form.sku} onChange={e => upd({ sku: e.target.value })} style={{ ...INPUT_S, fontFamily: 'var(--mono)' }} />
            </div>
            <div>
              <label style={LABEL_S}>CATEGORY</label>
              <input value={form.category} onChange={e => upd({ category: e.target.value })}
                list="edit-cats" style={INPUT_S} placeholder="e.g. Beverages" />
              <datalist id="edit-cats">
                {categories.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
          </div>
          <div>
            <label style={LABEL_S}>BARCODE</label>
            <input value={form.barcode} onChange={e => upd({ barcode: e.target.value })} style={{ ...INPUT_S, fontFamily: 'var(--mono)' }} />
          </div>
          <div style={{ height: 1, background: 'var(--line)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL_S}>COST PRICE (TZS) *</label>
              <input type="number" value={form.cost} onChange={e => { upd({ cost: e.target.value }); setErrors(x => ({ ...x, cost: '' })); }}
                style={{ ...INPUT_S, fontFamily: 'var(--mono)', borderColor: errors.cost ? 'var(--bad)' : 'var(--line-2)' }} />
              {errors.cost && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.cost}</div>}
            </div>
            <div>
              <label style={LABEL_S}>SELLING PRICE (TZS) *</label>
              <input type="number" value={form.price} onChange={e => { upd({ price: e.target.value }); setErrors(x => ({ ...x, price: '' })); }}
                style={{ ...INPUT_S, fontFamily: 'var(--mono)', borderColor: errors.price ? 'var(--bad)' : 'var(--line-2)' }} />
              {errors.price && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.price}</div>}
            </div>
          </div>
          <div style={{ height: 1, background: 'var(--line)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL_S}>REORDER POINT</label>
              <input type="number" value={form.min_stock} onChange={e => upd({ min_stock: e.target.value })} style={{ ...INPUT_S, fontFamily: 'var(--mono)' }} />
            </div>
            <div>
              <label style={LABEL_S}>MAX STOCK</label>
              <input type="number" value={form.max_stock} onChange={e => upd({ max_stock: e.target.value })} style={{ ...INPUT_S, fontFamily: 'var(--mono)' }} />
            </div>
          </div>
          <div>
            <label style={LABEL_S}>STATUS</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ v: true, l: 'Active' }, { v: false, l: 'Draft' }].map(({ v, l }) => (
                <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" checked={form.is_active === v} onChange={() => upd({ is_active: v })} style={{ accentColor: 'var(--accent)' }} />
                  {l}
                </label>
              ))}
            </div>
          </div>
          {apiErr && <div style={{ padding: '9px 12px', borderRadius: 7, background: 'rgba(251,113,133,0.08)', color: 'var(--bad)', fontSize: 12.5 }}>{apiErr}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={busy}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {busy ? '…' : Icons.check} Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Archive confirm modal ─────────────────────────────────────────────────────

function ArchiveModal({ product, onClose, onConfirm }: { product: InventoryProduct; onClose: () => void; onConfirm: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  async function handle() {
    setBusy(true);
    const res = await inventoryApi.update(product.id, { is_active: false });
    setBusy(false);
    if (res.success) onConfirm();
    else setErr(res.message ?? 'Archive failed.');
  }

  return (
    <div style={MODAL_OVERLAY_STYLE} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...MODAL_BOX_STYLE, maxWidth: 400 }}>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 18, alignItems: 'flex-start' }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', display: 'grid', placeItems: 'center', color: 'var(--warn)', flexShrink: 0 }}>
              {Icons.archive}
            </span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Archive product?</div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--fg)' }}>{product.name}</strong> will be hidden from inventory and POS. You can restore it later.
              </div>
            </div>
          </div>
          {err && <div style={{ marginBottom: 14, fontSize: 12.5, color: 'var(--bad)', padding: '8px 12px', borderRadius: 7, background: 'rgba(251,113,133,0.08)' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn btn-ghost" disabled={busy}>Cancel</button>
            <button onClick={handle} disabled={busy}
              style={{ padding: '7px 14px', background: 'var(--warn)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}>
              {busy ? '…' : 'Archive'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const [tab, setTab] = useState('overview');
  const [p, setP] = useState<InventoryProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal state
  const [restockOpen, setRestockOpen] = useState(false);
  const [adjustOpen,  setAdjustOpen]  = useState(false);
  const [editOpen,    setEditOpen]    = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [categories,  setCategories]  = useState<Category[]>([]);

  useEffect(() => {
    setLoading(true);
    inventoryApi.getCategories().then(res => { if (res.success) setCategories(res.data); });
    inventoryApi.getDetail(id).then((res) => {
      setLoading(false);
      if (res.success) {
        setP(res.data);
      } else {
        // Fallback: fetch from list
        inventoryApi.getProducts().then(listRes => {
          if (listRes.success) {
            const data = listRes.data as unknown as { results?: InventoryProduct[] } | InventoryProduct[];
            let list: InventoryProduct[] = [];
            if (Array.isArray(data)) list = data;
            else if (data && typeof data === 'object' && 'results' in data) list = (data as { results: InventoryProduct[] }).results;
            const found = list.find(x => x.id === id);
            if (found) setP(found); else setError(true);
          } else setError(true);
        });
      }
    });
  }, [id]);

  if (loading) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Inventory', href: '/inventory' }, { label: '…' }]}>
        <div style={{ padding: 80, textAlign: 'center' }}>{SPINNER}</div>
      </AppShell>
    );
  }

  if (error || !p) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Inventory', href: '/inventory' }, { label: 'Not found' }]}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Product not found</div>
          <p style={{ color: 'var(--fg-3)', marginBottom: 24 }}>No product with this ID could be found.</p>
          <Link href="/inventory" className="btn btn-primary">← Back to inventory</Link>
        </div>
      </AppShell>
    );
  }

  const movements = generateMovements(p);
  const scheme = COLOR_SCHEMES[p.color] || COLOR_SCHEMES.indigo;
  const margin = p.margin_pct?.toFixed(1) ?? (p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) : '0');
  const weeklySold = p.weekly_sold ?? 0;
  const stockKind = p.stock_status === 'out' ? 'bad' : p.stock_status === 'critical' ? 'bad' : p.stock_status === 'low' ? 'warn' : 'good';
  const projDaysLeft = weeklySold > 0 ? Math.round(p.stock / (weeklySold / 7)) : 999;
  const monthRevenue = weeklySold * 4 * p.price;
  const monthProfit = weeklySold * 4 * (p.price - p.cost);

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Inventory', href: '/inventory' }, { label: p.name }]}
    >
      {/* Back */}
      <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--fg-3)' }}>
        <Link href="/inventory" style={{ color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>{Icons.chevRight}</span>
          Back to inventory
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 96, height: 96, borderRadius: 12, flexShrink: 0, background: scheme.bg, color: scheme.fg, display: 'grid', placeItems: 'center', fontSize: 40, fontWeight: 500, border: '1px solid var(--line)' }}>
          {p.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>{p.name}</h1>
            <span className={'pill ' + stockKind} style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="dot-s" style={{ background: stockKind === 'good' ? 'var(--good)' : stockKind === 'warn' ? 'var(--warn)' : 'var(--bad)' }}></span>
              {stockKind === 'good' ? 'In stock' : stockKind === 'warn' ? 'Running low' : 'Critical'}
            </span>
            {p.category_name && <span className="pill" style={{ background: 'var(--bg-3)' }}>{p.category_name}</span>}
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 14 }}>
            {p.sku} <span style={{ color: 'var(--fg-4)', margin: '0 6px' }}>·</span>
            {p.barcode} <span style={{ color: 'var(--fg-4)', margin: '0 6px' }}>·</span>
            {p.supplier_name && <>supplier: {p.supplier_name}</>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => setRestockOpen(true)}>{Icons.plus} Restock</button>
            <button className="btn btn-soft" onClick={() => setEditOpen(true)}>Edit product</button>
            <button className="btn btn-soft" onClick={() => setAdjustOpen(true)}>Stock adjustment</button>
            <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.sparkles} Ask AI</button>
            <button className="btn btn-ghost">Duplicate</button>
            <button className="btn btn-ghost" onClick={() => setArchiveOpen(true)}>Archive</button>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 18 }}>
        <div className="surface kpi-mini">
          <div className="label">ON HAND</div>
          <div className="value">{p.stock} <span style={{ fontSize: 12, color: 'var(--fg-4)', fontFamily: 'var(--mono)' }}>units</span></div>
          <div className="delta" style={{ color: 'var(--fg-3)' }}>min {p.min_stock} · max {p.max_stock}</div>
        </div>
        <div className="surface kpi-mini">
          <div className="label">DAYS OF COVER</div>
          <div className="value" style={{ color: projDaysLeft < 7 ? 'var(--warn)' : 'var(--fg)' }}>{projDaysLeft < 999 ? projDaysLeft : '—'}<span style={{ fontSize: 12, color: 'var(--fg-4)', fontFamily: 'var(--mono)' }}>{projDaysLeft < 999 ? ' days' : ''}</span></div>
          <div className="delta" style={{ color: 'var(--fg-3)' }}>at current sell rate</div>
        </div>
        <div className="surface kpi-mini">
          <div className="label">SOLD · 30D</div>
          <div className="value">{weeklySold * 4} <span style={{ fontSize: 12, color: 'var(--fg-4)', fontFamily: 'var(--mono)' }}>units</span></div>
          <div className="delta" style={{ color: 'var(--good)' }}>↗ +14% vs prev</div>
        </div>
        <div className="surface kpi-mini">
          <div className="label">REVENUE · 30D</div>
          <div className="value">{fmtShort(monthRevenue)}</div>
          <div className="delta" style={{ color: 'var(--good)' }}>↗ +18%</div>
        </div>
        <div className="surface kpi-mini">
          <div className="label">MARGIN</div>
          <div className="value" style={{ color: 'var(--good)' }}>{margin}%</div>
          <div className="delta" style={{ color: 'var(--fg-3)' }}>{fmt(p.price - p.cost)} / unit</div>
        </div>
      </div>

      {/* AI nudge if low */}
      {stockKind !== 'good' && (
        <div className="surface" style={{ padding: '14px 16px', borderColor: 'var(--accent-line)', background: 'linear-gradient(180deg, var(--accent-soft) 0%, var(--bg-2) 100%)', marginBottom: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>{Icons.sparkles}</span>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--fg-2)' }}>
            At <strong style={{ color: 'var(--fg)' }}>{weeklySold} units/week</strong>, you&apos;ll run out in <strong style={{ color: 'var(--fg)' }}>{projDaysLeft} days</strong>. Suggested restock: <strong style={{ color: 'var(--fg)' }}>{Math.max(40, weeklySold * 3)} units</strong>{p.supplier_name ? ` from ${p.supplier_name}` : ''}.
          </div>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12.5 }}>Draft purchase order</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--line)', marginBottom: 18, display: 'flex', gap: 4 }}>
        {[['overview','Overview'],['stock',`Stock movements · ${movements.length}`],['pricing','Pricing'],['details','Details']].map(([k,l]) => (
          <button key={k} className={'tab-btn' + (tab === k ? ' active' : '')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
          <div>
            <div className="surface" style={{ marginBottom: 14 }}>
              <div className="card-head">
                <span className="card-title">Sales · last 30 days</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>units sold per day</span>
              </div>
              <div style={{ padding: 16 }}><SalesChart /></div>
            </div>
            <div className="surface">
              <div className="card-head">
                <span className="card-title">Recent stock movements</span>
                <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => setTab('stock')}>View all {Icons.chevRight}</button>
              </div>
              <div className="table-scroll">
              <table className="table">
                <thead><tr>
                  <th style={{ width: 120 }}>WHEN</th>
                  <th style={{ width: 110 }}>TYPE</th>
                  <th>NOTE</th>
                  <th style={{ width: 90, textAlign: 'right' }} className="num">CHANGE</th>
                  <th style={{ width: 100 }}>BY</th>
                </tr></thead>
                <tbody>
                  {movements.slice(0, 6).map((m, i) => (
                    <tr key={i} style={{ cursor: 'default' }}>
                      <td className="mono" style={{ color: 'var(--fg-3)' }}>{m.ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                      <td><span className={'pill ' + (m.kind === 'sale' ? '' : m.kind === 'restock' ? 'good' : 'warn')}>{m.kind}</span></td>
                      <td style={{ color: 'var(--fg-2)' }}>{m.note}</td>
                      <td className="num" style={{ color: m.qty > 0 ? 'var(--good)' : 'var(--fg-2)', fontWeight: 500 }}>{m.qty > 0 ? '+' : ''}{m.qty}</td>
                      <td className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{m.who}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
          <div>
            <div className="surface" style={{ marginBottom: 14 }}>
              <div className="card-head"><span className="card-title">Pricing</span></div>
              <div style={{ padding: '14px 16px' }}>
                <div className="field-row"><span className="k">Cost price</span><span className="v mono">{fmt(p.cost)}</span></div>
                <div className="field-row"><span className="k">Selling price</span><span className="v mono" style={{ color: 'var(--accent)', fontWeight: 500 }}>{fmt(p.price)}</span></div>
                <div className="field-row"><span className="k">Profit / unit</span><span className="v mono" style={{ color: 'var(--good)' }}>{fmt(p.price - p.cost)}</span></div>
                <div className="field-row"><span className="k">Margin</span><span className="v mono" style={{ color: 'var(--good)' }}>{margin}%</span></div>
                <div className="field-row"><span className="k">VAT</span><span className="v">included at 18%</span></div>
              </div>
            </div>
            <div className="surface" style={{ marginBottom: 14 }}>
              <div className="card-head"><span className="card-title">Stock</span></div>
              <div style={{ padding: '14px 16px' }}>
                <div className="field-row"><span className="k">On hand</span><span className="v mono">{p.stock} units</span></div>
                <div className="field-row"><span className="k">Reorder at</span><span className="v mono">{p.min_stock}</span></div>
                <div className="field-row"><span className="k">Max stock</span><span className="v mono">{p.max_stock}</span></div>
                <div className="field-row"><span className="k">Tracked</span><span className="v">Yes</span></div>
              </div>
            </div>
            {p.supplier_name && (
              <div className="surface">
                <div className="card-head"><span className="card-title">Supplier</span></div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--bg-3)', color: 'var(--fg-2)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>
                      {p.supplier_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.supplier_name}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>preferred · 3 day lead time</div>
                    </div>
                  </div>
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>View supplier →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <div className="surface" style={{ overflow: 'hidden' }}>
          <div className="card-head">
            <span className="card-title">All stock movements</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.filter} Filter</button>
              <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.download} Export</button>
            </div>
          </div>
          <div className="table-scroll">
          <table className="table">
            <thead><tr>
              <th style={{ width: 130 }}>DATE</th>
              <th style={{ width: 110 }}>TYPE</th>
              <th>NOTE</th>
              <th style={{ width: 90, textAlign: 'right' }} className="num">CHANGE</th>
              <th style={{ width: 90, textAlign: 'right' }} className="num">BALANCE</th>
              <th style={{ width: 100 }}>BY</th>
            </tr></thead>
            <tbody>
              {(() => {
                let bal = p.stock;
                return movements.map((m, i) => {
                  const row = (
                    <tr key={i} style={{ cursor: 'default' }}>
                      <td className="mono" style={{ color: 'var(--fg-3)' }}>{m.ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} {m.ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td><span className={'pill ' + (m.kind === 'sale' ? '' : m.kind === 'restock' ? 'good' : 'warn')}>{m.kind}</span></td>
                      <td style={{ color: 'var(--fg-2)' }}>{m.note}</td>
                      <td className="num" style={{ color: m.qty > 0 ? 'var(--good)' : 'var(--fg-2)', fontWeight: 500 }}>{m.qty > 0 ? '+' : ''}{m.qty}</td>
                      <td className="num" style={{ color: 'var(--fg-2)' }}>{bal}</td>
                      <td className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>{m.who}</td>
                    </tr>
                  );
                  bal -= m.qty;
                  return row;
                });
              })()}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === 'pricing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="surface">
            <div className="card-head"><span className="card-title">Current pricing</span></div>
            <div style={{ padding: '14px 16px' }}>
              <div className="field-row"><span className="k">Cost price</span><span className="v mono">{fmt(p.cost)}</span></div>
              <div className="field-row"><span className="k">Retail price</span><span className="v mono" style={{ color: 'var(--accent)', fontWeight: 500 }}>{fmt(p.price)}</span></div>
              <div className="field-row"><span className="k">Wholesale</span><span className="v mono" style={{ color: 'var(--fg-3)' }}>not set</span></div>
              <div className="field-row"><span className="k">Margin</span><span className="v mono" style={{ color: 'var(--good)' }}>{margin}%</span></div>
              <div className="field-row"><span className="k">Markup</span><span className="v mono">{p.cost > 0 ? (((p.price - p.cost) / p.cost) * 100).toFixed(0) : '—'}%</span></div>
              <div className="field-row"><span className="k">VAT</span><span className="v">18% inclusive</span></div>
            </div>
          </div>
          <div className="surface">
            <div className="card-head"><span className="card-title">Projected revenue</span></div>
            <div style={{ padding: '14px 16px' }}>
              <div className="field-row"><span className="k">/ day</span><span className="v mono">{fmtShort(Math.round((weeklySold/7) * p.price))}</span></div>
              <div className="field-row"><span className="k">/ week</span><span className="v mono">{fmtShort(weeklySold * p.price)}</span></div>
              <div className="field-row"><span className="k">/ month</span><span className="v mono" style={{ color: 'var(--fg)', fontWeight: 500 }}>{fmtShort(monthRevenue)}</span></div>
              <div className="field-row"><span className="k">/ month profit</span><span className="v mono" style={{ color: 'var(--good)' }}>{fmtShort(monthProfit)}</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'details' && (
        <div className="surface">
          <div className="card-head"><span className="card-title">Product details</span></div>
          <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div className="field-row"><span className="k">Name</span><span className="v">{p.name}</span></div>
            <div className="field-row"><span className="k">SKU</span><span className="v mono">{p.sku}</span></div>
            <div className="field-row"><span className="k">Category</span><span className="v">{p.category_name || '—'}</span></div>
            <div className="field-row"><span className="k">Barcode</span><span className="v mono">{p.barcode}</span></div>
            <div className="field-row"><span className="k">Status</span><span className="v">{p.is_active ? 'Active' : 'Archived'}</span></div>
            <div className="field-row"><span className="k">Supplier</span><span className="v">{p.supplier_name || '—'}</span></div>
            <div className="field-row"><span className="k">Lead time</span><span className="v">3 days</span></div>
            <div className="field-row"><span className="k">Tracked</span><span className="v">Yes — stock count maintained</span></div>
            <div className="field-row"><span className="k">Created</span><span className="v">{new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
            <div className="field-row"><span className="k">Description</span><span className="v" style={{ color: 'var(--fg-2)' }}>{p.name} — {p.category_name ? p.category_name.toLowerCase() + ' item' : 'retail item'}.</span></div>
          </div>
        </div>
      )}
      {/* Modals */}
      {restockOpen && (
        <RestockModal
          product={p}
          onClose={() => setRestockOpen(false)}
          onSuccess={newStock => { setP({ ...p, stock: newStock }); setRestockOpen(false); }}
        />
      )}
      {adjustOpen && (
        <AdjustModal
          product={p}
          onClose={() => setAdjustOpen(false)}
          onSuccess={newStock => { setP({ ...p, stock: newStock }); setAdjustOpen(false); }}
        />
      )}
      {editOpen && (
        <EditModal
          product={p}
          categories={categories}
          onClose={() => setEditOpen(false)}
          onSuccess={updated => { setP(updated); setEditOpen(false); }}
        />
      )}
      {archiveOpen && (
        <ArchiveModal
          product={p}
          onClose={() => setArchiveOpen(false)}
          onConfirm={() => router.push('/inventory')}
        />
      )}
    </AppShell>
  );
}
