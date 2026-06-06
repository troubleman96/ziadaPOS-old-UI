'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { inventoryApi, type Category } from '../../../lib/api';

// ── Category Combobox ──────────────────────────────────────────────────────────

interface CategoryComboboxProps {
  value: string;
  onChange: (val: string) => void;
}

function CategoryCombobox({ value, onChange }: CategoryComboboxProps) {
  const [categories,  setCategories]  = useState<Category[]>([]);
  const [query,       setQuery]       = useState(value);
  const [open,        setOpen]        = useState(false);
  const [highlight,   setHighlight]   = useState(0);
  const containerRef  = useRef<HTMLDivElement>(null);
  const inputRef      = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inventoryApi.getCategories().then(res => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  useEffect(() => { setQuery(value); }, [value]);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const exactMatch = categories.some(c => c.name.toLowerCase() === query.toLowerCase());

  const select = useCallback((name: string) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
    setHighlight(0);
  }, [onChange]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        onChange(query.trim());
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [query, onChange]);

  function handleKey(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { setOpen(true); return; }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, filtered.length - 1 + (exactMatch ? 0 : 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlight]) {
        select(filtered[highlight].name);
      } else if (!exactMatch && query.trim()) {
        select(query.trim());
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <style>{`
        .cat-drop {
          position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 300;
          background: var(--bg-2); border: 1.5px solid var(--accent-line);
          border-radius: 8px; overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.28);
          max-height: 240px; overflow-y: auto;
        }
        .cat-opt {
          padding: 8px 12px; font-size: 13px; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px; transition: background 80ms;
        }
        .cat-opt:hover, .cat-opt.hi { background: var(--bg-3); }
        .cat-opt.selected { color: var(--accent); }
        .cat-new {
          padding: 8px 12px; font-size: 12.5px; cursor: pointer;
          display: flex; align-items: center; gap: 7px;
          color: var(--fg-3); border-top: 1px solid var(--line);
          transition: background 80ms;
        }
        .cat-new:hover { background: var(--bg-3); color: var(--fg); }
        .cat-empty { padding: 10px 12px; font-size: 13px; color: var(--fg-4); }
        .cat-badge {
          font-family: var(--mono); font-size: 10px;
          color: var(--fg-4); background: var(--bg-3);
          padding: 2px 5px; border-radius: 4px; flex-shrink: 0;
        }
        .cat-global-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent); flex-shrink: 0;
        }
      `}</style>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type or select category…"
          value={query}
          autoComplete="off"
          onFocus={() => { setOpen(true); setHighlight(0); }}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
            onChange(e.target.value);
          }}
          onKeyDown={handleKey}
          style={{
            width: '100%', padding: '9px 32px 9px 12px',
            border: '1px solid var(--line-2)', borderRadius: 7,
            background: 'var(--bg)', color: 'var(--fg)',
            fontSize: 13, fontFamily: 'inherit', outline: 0,
            boxSizing: 'border-box',
          }}
        />
        <svg width="11" height="11" viewBox="0 0 12 12"
          style={{ position: 'absolute', right: 11, pointerEvents: 'none', color: 'var(--fg-3)', transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {open && (
        <div className="cat-drop">
          {filtered.length === 0 && !query.trim() ? (
            <div className="cat-empty">Start typing to search categories…</div>
          ) : filtered.length === 0 ? null : (
            filtered.map((c, i) => (
              <div
                key={c.id}
                className={`cat-opt${i === highlight ? ' hi' : ''}${c.name === value ? ' selected' : ''}`}
                onMouseDown={e => { e.preventDefault(); select(c.name); }}
                onMouseEnter={() => setHighlight(i)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {c.is_global && <span className="cat-global-dot" title="Global category" />}
                  {c.name}
                </span>
                <span className="cat-badge">{c.count}</span>
              </div>
            ))
          )}
          {query.trim() && !exactMatch && (
            <div className="cat-new" onMouseDown={e => { e.preventDefault(); select(query.trim()); }}>
              {Icons.plus} Create &ldquo;{query.trim()}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Product draft ──────────────────────────────────────────────────────────────

interface ProductDraft {
  id: string;
  name: string;
  sku: string;
  price: string;
  cost: string;
  category: string;
  barcode: string;
  openStock: string;
  minStock: string;
  maxStock: string;
  supplier: string;
  status: 'active' | 'draft';
  imageFile: File | null;
  imagePreview: string | null;
  errors: Record<string, string>;
  saved: boolean;
  saving: boolean;
}

let _uid = 0;
function makeEmpty(): ProductDraft {
  return {
    id: String(++_uid),
    name: '', sku: '', price: '', cost: '',
    category: '', barcode: '',
    openStock: '0', minStock: '10', maxStock: '100',
    supplier: '', status: 'active',
    imageFile: null, imagePreview: null,
    errors: {}, saved: false, saving: false,
  };
}

function validate(d: ProductDraft): Record<string, string> {
  const e: Record<string, string> = {};
  if (!d.name.trim()) e.name = 'Product name is required.';
  if (!d.price || +d.price <= 0) e.price = 'Selling price must be > 0.';
  if (!d.cost || +d.cost <= 0) e.cost = 'Cost must be > 0.';
  if (d.price && d.cost && +d.cost >= +d.price) e.cost = 'Cost must be less than selling price.';
  return e;
}

// ── Product card ───────────────────────────────────────────────────────────────

interface ProductCardProps {
  draft: ProductDraft;
  index: number;
  canRemove: boolean;
  onUpdate: (patch: Partial<ProductDraft>) => void;
  onRemove: () => void;
}

const INPUT = {
  width: '100%', padding: '9px 12px',
  border: '1px solid var(--line-2)', borderRadius: 7,
  background: 'var(--bg)', color: 'var(--fg)',
  fontSize: 13, fontFamily: 'inherit', outline: 0,
  boxSizing: 'border-box' as const,
};

const LABEL = {
  fontSize: 10.5, color: 'var(--fg-4)',
  letterSpacing: '0.06em', display: 'block', marginBottom: 6,
  fontFamily: 'var(--mono)',
} as const;

function ProductCard({ draft, index, canRemove, onUpdate, onRemove }: ProductCardProps) {
  const { name, sku, price, cost, category, barcode, openStock, minStock, maxStock, supplier, status, imagePreview, errors, saved, saving } = draft;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleImageSelect(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => onUpdate({ imageFile: file, imagePreview: e.target?.result as string });
    reader.readAsDataURL(file);
  }

  const margin = price && cost && +price > 0 && +cost > 0
    ? (((+price - +cost) / +price) * 100).toFixed(1)
    : null;

  const clrErr = (field: string) => {
    if (errors[field]) onUpdate({ errors: { ...errors, [field]: '' } });
  };

  const borderColor = saved ? 'var(--good)' : errors._submit ? 'var(--bad)' : 'var(--line)';

  return (
    <div className="surface" style={{ marginBottom: 14, border: `1px solid ${borderColor}`, transition: 'border-color 200ms', opacity: saved ? 0.75 : 1 }}>
      {/* Card header */}
      <div className="card-head" style={{ display: 'flex', alignItems: 'center' }}>
        <span className="card-title" style={{ flex: 1 }}>
          Product {index + 1}
          {saving && <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginLeft: 10 }}>Saving…</span>}
          {saved && <span className="mono" style={{ fontSize: 10.5, color: 'var(--good)', marginLeft: 10 }}>✓ Saved</span>}
        </span>
        {canRemove && !saved && (
          <button
            onClick={onRemove}
            style={{ padding: '4px 8px', border: '1px solid var(--line)', borderRadius: 6, background: 'transparent', color: 'var(--fg-3)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}
          >
            Remove
          </button>
        )}
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Name */}
        <div>
          <label style={LABEL}>PRODUCT NAME *</label>
          <input
            value={name}
            onChange={e => { onUpdate({ name: e.target.value }); clrErr('name'); }}
            placeholder="e.g. Unga wa Sembe 10kg"
            style={{ ...INPUT, borderColor: errors.name ? 'var(--bad)' : 'var(--line-2)' }}
            disabled={saved}
          />
          {errors.name && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.name}</div>}
        </div>

        {/* SKU + Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={LABEL}>SKU</label>
            <input value={sku} onChange={e => onUpdate({ sku: e.target.value })} placeholder="e.g. UWS-10"
              style={{ ...INPUT, fontFamily: 'var(--mono)' }} disabled={saved} />
          </div>
          <div>
            <label style={LABEL}>CATEGORY</label>
            <CategoryCombobox value={category} onChange={v => onUpdate({ category: v })} />
          </div>
        </div>

        {/* Barcode */}
        <div>
          <label style={LABEL}>BARCODE <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· optional</span></label>
          <input value={barcode} onChange={e => onUpdate({ barcode: e.target.value })} placeholder="Scan or type EAN-13 barcode"
            style={{ ...INPUT, fontFamily: 'var(--mono)' }} disabled={saved} />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--line)', margin: '0 -20px' }} />

        {/* Cost + Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={LABEL}>COST PRICE (TZS) *</label>
            <input type="number" value={cost} onChange={e => { onUpdate({ cost: e.target.value }); clrErr('cost'); }} placeholder="0"
              style={{ ...INPUT, fontFamily: 'var(--mono)', borderColor: errors.cost ? 'var(--bad)' : 'var(--line-2)' }} disabled={saved} />
            {errors.cost && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.cost}</div>}
          </div>
          <div>
            <label style={LABEL}>SELLING PRICE (TZS) *</label>
            <input type="number" value={price} onChange={e => { onUpdate({ price: e.target.value }); clrErr('price'); }} placeholder="0"
              style={{ ...INPUT, fontFamily: 'var(--mono)', borderColor: errors.price ? 'var(--bad)' : 'var(--line-2)' }} disabled={saved} />
            {errors.price && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.price}</div>}
          </div>
        </div>

        {/* Margin strip */}
        {margin && (
          <div style={{ padding: '8px 12px', borderRadius: 7, background: 'var(--bg-3)', border: '1px solid var(--line)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Margin: <span className="mono" style={{ color: +margin > 15 ? 'var(--good)' : 'var(--warn)' }}>{margin}%</span></span>
            <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Markup: <span className="mono">{(((+price - +cost) / +cost) * 100).toFixed(0)}%</span></span>
            <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Profit/unit: <span className="mono" style={{ color: 'var(--good)' }}>TZS {(+price - +cost).toLocaleString()}</span></span>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--line)', margin: '0 -20px' }} />

        {/* Stock */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <label style={LABEL}>OPENING STOCK</label>
            <input type="number" value={openStock} onChange={e => onUpdate({ openStock: e.target.value })} placeholder="0"
              style={{ ...INPUT, fontFamily: 'var(--mono)' }} disabled={saved} />
          </div>
          <div>
            <label style={LABEL}>REORDER POINT</label>
            <input type="number" value={minStock} onChange={e => onUpdate({ minStock: e.target.value })} placeholder="10"
              style={{ ...INPUT, fontFamily: 'var(--mono)' }} disabled={saved} />
          </div>
          <div>
            <label style={LABEL}>MAX STOCK</label>
            <input type="number" value={maxStock} onChange={e => onUpdate({ maxStock: e.target.value })} placeholder="100"
              style={{ ...INPUT, fontFamily: 'var(--mono)' }} disabled={saved} />
          </div>
        </div>

        {/* Supplier + Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
          <div>
            <label style={LABEL}>SUPPLIER</label>
            <select value={supplier} onChange={e => onUpdate({ supplier: e.target.value })}
              style={{ ...INPUT, cursor: 'pointer' }} disabled={saved}>
              <option value="">Select supplier</option>
              {['Aziz Wholesalers', 'Karibu Foods Ltd', 'Hassan Suppliers', 'Mpaji Distributors'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={LABEL}>STATUS</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 4 }}>
              {(['active', 'draft'] as const).map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name={`status-${draft.id}`} checked={status === s} onChange={() => onUpdate({ status: s })}
                    style={{ accentColor: 'var(--accent)' }} disabled={saved} />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--line)', margin: '0 -20px' }} />

        {/* Image upload */}
        <div>
          <label style={{ ...LABEL, marginBottom: 8 }}>
            PRODUCT IMAGE <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>· optional</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); }}
          />
          {imagePreview ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={imagePreview} alt="Preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line-2)', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '5px 10px', border: '1px solid var(--line-2)', borderRadius: 6, background: 'var(--bg)', color: 'var(--fg-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Change
                </button>
                <button onClick={() => { onUpdate({ imageFile: null, imagePreview: null }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  style={{ padding: '5px 10px', border: '1px solid var(--line-2)', borderRadius: 6, background: 'var(--bg)', color: 'var(--bad)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImageSelect(f); }}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--line-2)'}`,
                borderRadius: 10, padding: '18px 16px', textAlign: 'center',
                cursor: 'pointer', background: dragOver ? 'var(--accent-soft)' : 'var(--bg)',
                transition: 'border-color 150ms, background 150ms',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>🖼</div>
              <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3 }}>Drop image here</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>or click to browse · JPG, PNG, WEBP</div>
            </div>
          )}
        </div>

        {errors._submit && (
          <div style={{ padding: '9px 12px', borderRadius: 7, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', color: 'var(--bad)', fontSize: 12.5 }}>
            {errors._submit}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function NewProductPage() {
  const [products, setProducts] = useState<ProductDraft[]>([makeEmpty()]);
  const [savingAll, setSavingAll] = useState(false);

  function update(id: string, patch: Partial<ProductDraft>) {
    setProducts(p => p.map(d => d.id === id ? { ...d, ...patch } : d));
  }

  function addProduct() {
    setProducts(p => [...p, makeEmpty()]);
  }

  function removeProduct(id: string) {
    setProducts(p => p.filter(d => d.id !== id));
  }

  async function saveAll(e: React.FormEvent) {
    e.preventDefault();

    // Validate all unsaved products
    let hasErrors = false;
    setProducts(p => p.map(d => {
      if (d.saved) return d;
      const errors = validate(d);
      if (Object.keys(errors).length) { hasErrors = true; return { ...d, errors }; }
      return { ...d, errors: {} };
    }));
    if (hasErrors) return;

    setSavingAll(true);
    const { getAccessToken } = await import('../../../lib/auth');
    const token = getAccessToken();
    const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

    for (const draft of products) {
      if (draft.saved) continue;

      update(draft.id, { saving: true });

      const fd = new FormData();
      fd.append('name', draft.name.trim());
      fd.append('price', draft.price);
      fd.append('cost', draft.cost);
      if (draft.sku.trim()) fd.append('sku', draft.sku.trim());
      if (draft.category.trim()) fd.append('category_name_input', draft.category.trim());
      if (draft.barcode.trim()) fd.append('barcode', draft.barcode.trim());
      if (draft.openStock) fd.append('stock', draft.openStock);
      if (draft.minStock) fd.append('min_stock', draft.minStock);
      if (draft.maxStock) fd.append('max_stock', draft.maxStock);
      if (draft.supplier) fd.append('supplier', draft.supplier);
      fd.append('status', draft.status);
      if (draft.imageFile) fd.append('image', draft.imageFile);

      try {
        const res = await fetch(`${BASE_URL}/api/v1/inventory/products/`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        const json = await res.json() as Record<string, unknown>;
        if (!res.ok) {
          const flat: Record<string, string> = {};
          if (json.errors) {
            for (const [k, v] of Object.entries(json.errors as Record<string, unknown>)) {
              flat[k] = Array.isArray(v) ? (v as string[])[0] : String(v);
            }
          } else {
            flat._submit = (json.message as string) ?? 'Save failed.';
          }
          update(draft.id, { saving: false, errors: flat });
        } else {
          update(draft.id, { saving: false, saved: true, errors: {} });
        }
      } catch {
        update(draft.id, { saving: false, errors: { _submit: 'Network error. Please try again.' } });
      }
    }

    setSavingAll(false);
  }

  const unsaved = products.filter(d => !d.saved).length;
  const allSaved = unsaved === 0;

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Inventory', href: '/inventory' }, { label: 'New product' }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/inventory" className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }}>Cancel</Link>
          {allSaved ? (
            <Link href="/inventory" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              {Icons.check} Done
            </Link>
          ) : (
            <button
              onClick={saveAll}
              disabled={savingAll}
              className="btn btn-primary"
              style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: savingAll ? 0.6 : 1 }}
            >
              {savingAll ? '…' : Icons.check} Save {unsaved > 1 ? `${unsaved} products` : 'product'}
            </button>
          )}
        </div>
      }
    >
      <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--fg-3)' }}>
        <Link href="/inventory" style={{ color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>{Icons.chevRight}</span>
          Back to inventory
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>New product</h1>
        {products.length > 1 && (
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>
            {products.filter(d => d.saved).length} / {products.length} saved
          </span>
        )}
      </div>

      {products.map((draft, idx) => (
        <ProductCard
          key={draft.id}
          draft={draft}
          index={idx}
          canRemove={products.length > 1}
          onUpdate={patch => update(draft.id, patch)}
          onRemove={() => removeProduct(draft.id)}
        />
      ))}

      {/* Add another product */}
      {!allSaved && (
        <button
          onClick={addProduct}
          style={{
            width: '100%', padding: '13px 16px',
            border: '2px dashed var(--line-2)', borderRadius: 10,
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: 'var(--fg-3)', fontSize: 13, fontFamily: 'inherit',
            transition: 'border-color 150ms, color 150ms, background 150ms',
            marginBottom: 32,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-soft)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-3)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Add another product
        </button>
      )}
    </AppShell>
  );
}
