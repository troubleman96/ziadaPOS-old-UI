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

  // Fetch all categories once on mount
  useEffect(() => {
    inventoryApi.getCategories().then(res => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  // Keep input text in sync when parent resets value
  useEffect(() => { setQuery(value); }, [value]);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  // Whether the current query exactly matches an existing category name
  const exactMatch = categories.some(c => c.name.toLowerCase() === query.toLowerCase());

  const select = useCallback((name: string) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
    setHighlight(0);
  }, [onChange]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        // Commit whatever is typed (free-form is allowed)
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
        // Create new: just commit the typed text
        select(query.trim());
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const dropItems = [...filtered];

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

      {/* Input */}
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
            // Pass through the raw typed value immediately
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
        {/* Chevron */}
        <svg
          width="11" height="11" viewBox="0 0 12 12"
          style={{
            position: 'absolute', right: 11, pointerEvents: 'none',
            color: 'var(--fg-3)', transition: 'transform 150ms',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="cat-drop">
          {dropItems.length === 0 && !query.trim() ? (
            <div className="cat-empty">Start typing to search categories…</div>
          ) : dropItems.length === 0 ? null : (
            dropItems.map((c, i) => (
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
          {/* "Create new" option when typed value doesn't match anything */}
          {query.trim() && !exactMatch && (
            <div
              className="cat-new"
              onMouseDown={e => { e.preventDefault(); select(query.trim()); }}
            >
              {Icons.plus} Create &ldquo;{query.trim()}&rdquo;
            </div>
          )}
          {!query.trim() && dropItems.length === 0 && categories.length === 0 && (
            <div className="cat-empty">Loading categories…</div>
          )}
        </div>
      )}
    </div>
  );
}


// ── New Product Page ───────────────────────────────────────────────────────────

export default function NewProductPage() {
  const [name,       setName]       = useState('');
  const [sku,        setSku]        = useState('');
  const [price,      setPrice]      = useState('');
  const [cost,       setCost]       = useState('');
  const [category,   setCategory]   = useState('');
  const [barcode,    setBarcode]    = useState('');
  const [openStock,  setOpenStock]  = useState('');
  const [minStock,   setMinStock]   = useState('');
  const [maxStock,   setMaxStock]   = useState('');
  const [imageFile,  setImageFile]  = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver,   setDragOver]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [success,    setSuccess]    = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageSelect(file: File) {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  }

  const margin = price && cost ? (((+price - +cost) / +price) * 100).toFixed(1) : null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required.';
    if (!price || +price <= 0) errs.price = 'Selling price must be greater than zero.';
    if (!cost || +cost <= 0) errs.cost = 'Cost must be greater than zero.';
    if (price && cost && +cost >= +price) errs.cost = 'Cost must be less than the selling price.';

    if (Object.keys(errs).length) { setErrors(errs); return; }

    const { getAccessToken } = await import('../../../lib/auth');
    const token = getAccessToken();

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('price', price);
    formData.append('cost', cost);
    if (sku.trim()) formData.append('sku', sku.trim());
    if (category.trim()) formData.append('category_name_input', category.trim());
    if (barcode.trim()) formData.append('barcode', barcode.trim());
    if (openStock) formData.append('stock', openStock);
    if (minStock) formData.append('min_stock', minStock);
    if (maxStock) formData.append('max_stock', maxStock);
    if (imageFile) formData.append('image', imageFile);

    setSaving(true);
    try {
      const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
      const res = await fetch(`${BASE_URL}/api/v1/inventory/products/`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const json = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        if (json.errors) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(json.errors as Record<string, unknown>)) {
            flat[k] = Array.isArray(v) ? (v as string[])[0] : String(v);
          }
          setErrors(flat);
        } else {
          setErrors({ _global: (json.message as string) ?? 'Save failed.' });
        }
      } else {
        setSuccess('Product saved successfully.');
        // Reset form
        setName(''); setSku(''); setPrice(''); setCost(''); setCategory('');
        setBarcode(''); setOpenStock(''); setMinStock(''); setMaxStock('');
        setImageFile(null); setImagePreview(null);
      }
    } catch {
      setErrors({ _global: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Inventory', href: '/inventory' }, { label: 'New product' }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/inventory" className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }}>Cancel</Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? '…' : Icons.check} Save product
          </button>
        </div>
      }
    >
      {/* Back */}
      <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--fg-3)' }}>
        <Link href="/inventory" style={{ color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>{Icons.chevRight}</span>
          Back to inventory
        </Link>
      </div>

      <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>New product</h1>

      {errors._global && (
        <div style={{ padding: '11px 14px', borderRadius: 8, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', color: 'var(--bad)', fontSize: 13, marginBottom: 16 }}>
          {errors._global}
        </div>
      )}
      {success && (
        <div style={{ padding: '11px 14px', borderRadius: 8, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', color: 'var(--good)', fontSize: 13, marginBottom: 16 }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
        {/* Left */}
        <div>
          {/* Basic info */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">Basic information</span></div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>PRODUCT NAME *</label>
                <input
                  value={name}
                  onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => ({...p, name: ''})); }}
                  placeholder="e.g. Unga wa Sembe 10kg"
                  style={{ width: '100%', padding: '9px 12px', border: `1px solid ${errors.name ? 'var(--bad)' : 'var(--line-2)'}`, borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13.5, fontFamily: 'inherit', outline: 0, boxSizing: 'border-box' }}
                />
                {errors.name && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.name}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>SKU</label>
                  <input value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. UWS-10" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>CATEGORY</label>
                  <CategoryCombobox value={category} onChange={setCategory} />
                </div>
              </div>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>BARCODE <span style={{ fontWeight: 400, color: 'var(--fg-4)', textTransform: 'none', letterSpacing: 0 }}>· optional</span></label>
                <input value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Scan or type EAN-13 barcode" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">Pricing</span></div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>COST PRICE (TZS) *</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={e => { setCost(e.target.value); if (errors.cost) setErrors(p => ({...p, cost: ''})); }}
                    placeholder="0"
                    style={{ width: '100%', padding: '9px 12px', border: `1px solid ${errors.cost ? 'var(--bad)' : 'var(--line-2)'}`, borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }}
                  />
                  {errors.cost && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.cost}</div>}
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>SELLING PRICE (TZS) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => { setPrice(e.target.value); if (errors.price) setErrors(p => ({...p, price: ''})); }}
                    placeholder="0"
                    style={{ width: '100%', padding: '9px 12px', border: `1px solid ${errors.price ? 'var(--bad)' : 'var(--line-2)'}`, borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }}
                  />
                  {errors.price && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.price}</div>}
                </div>
              </div>
              {margin && (
                <div style={{ padding: '10px 12px', borderRadius: 7, background: 'var(--bg-3)', border: '1px solid var(--line)', display: 'flex', gap: 20 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Margin: <span className="mono" style={{ color: +margin > 15 ? 'var(--good)' : 'var(--warn)' }}>{margin}%</span></span>
                  <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Markup: <span className="mono">{(((+price - +cost) / +cost) * 100).toFixed(0)}%</span></span>
                  <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Profit / unit: <span className="mono" style={{ color: 'var(--good)' }}>TZS {(+price - +cost).toLocaleString()}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="surface">
            <div className="card-head"><span className="card-title">Stock settings</span></div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>OPENING STOCK</label>
                  <input type="number" value={openStock} onChange={e => setOpenStock(e.target.value)} placeholder="0" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>REORDER POINT</label>
                  <input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} placeholder="10" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>MAX STOCK</label>
                  <input type="number" value={maxStock} onChange={e => setMaxStock(e.target.value)} placeholder="100" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div>
          {/* Product image */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head">
              <span className="card-title">Product image</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>optional</span>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); }}
              />

              {imagePreview ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line-2)', display: 'block' }}
                  />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 6, background: 'rgba(0,0,0,0.6)', border: 0, cursor: 'pointer', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14 }}
                    title="Remove image"
                  >×</button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ width: '100%', marginTop: 8, padding: '7px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg-2)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Change image
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{ border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--line-2)'}`, borderRadius: 10, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'var(--accent-soft)' : 'var(--bg)', transition: 'border-color 150ms, background 150ms' }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🖼</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Drop image here</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>or click to browse · JPG, PNG, WEBP</div>
                </div>
              )}
            </div>
          </div>

          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">AI assist</span></div>
            <div style={{ padding: '14px 16px' }}>
              <button className="btn btn-soft" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', fontSize: 13 }}>
                {Icons.sparkles} Suggest price & reorder
              </button>
            </div>
          </div>

          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">Supplier</span></div>
            <div style={{ padding: '14px 16px' }}>
              <select style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit', outline: 0 }}>
                <option value="">Select supplier</option>
                {['Aziz Wholesalers','Karibu Foods Ltd','Hassan Suppliers','Mpaji Distributors'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="surface">
            <div className="card-head"><span className="card-title">Status</span></div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="radio" name="status" defaultChecked style={{ accentColor: 'var(--accent)' }} />
                <span style={{ fontSize: 13 }}>Active</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="radio" name="status" style={{ accentColor: 'var(--accent)' }} />
                <span style={{ fontSize: 13 }}>Draft</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
