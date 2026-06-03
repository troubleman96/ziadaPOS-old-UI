'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';
import { inventoryApi, type InventoryProduct, type BulkUploadResult } from '../../lib/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const COLOR_SCHEMES: Record<string, { bg: string; fg: string }> = {
  indigo:  { bg: 'rgba(99,102,241,0.10)',  fg: '#a5a8ff' },
  amber:   { bg: 'rgba(251,191,36,0.10)',  fg: '#fcd34d' },
  rose:    { bg: 'rgba(251,113,133,0.10)', fg: '#fda4af' },
  lime:    { bg: 'rgba(132,204,22,0.10)',  fg: '#bef264' },
  emerald: { bg: 'rgba(16,185,129,0.10)',  fg: '#6ee7b7' },
  violet:  { bg: 'rgba(167,139,250,0.10)', fg: '#c4b5fd' },
  cyan:    { bg: 'rgba(34,211,238,0.10)',  fg: '#67e8f9' },
};

function statusFor(p: InventoryProduct) {
  if (p.stock_status === 'out')      return { kind: 'bad',  label: 'Out'      };
  if (p.stock_status === 'critical') return { kind: 'bad',  label: 'Critical' };
  if (p.stock_status === 'low')      return { kind: 'warn', label: 'Low'      };
  return { kind: 'good', label: 'Active' };
}

function ProductThumb({ name, color, imageUrl, size = 40 }: { name: string; color: string; imageUrl?: string | null; size?: number }) {
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.indigo;
  if (imageUrl) return <img src={imageUrl} alt={name} style={{ width: size, height: size, borderRadius: 7, objectFit: 'cover', border: '1px solid var(--line)', flexShrink: 0, display: 'block' }} />;
  return (
    <div className="thumb-letter" style={{ width: size, height: size, background: scheme.bg, color: scheme.fg, borderRadius: 7, display: 'grid', placeItems: 'center', fontSize: size * 0.42, fontWeight: 600, flexShrink: 0 }}>
      {name[0]}
    </div>
  );
}

function StockBar({ stock, min, max }: { stock: number; min: number; max: number }) {
  const pct    = Math.max(2, Math.min(100, (stock / (max || 1)) * 100));
  const minPct = Math.max(2, Math.min(98, (min / (max || 1)) * 100));
  const color  = stock === 0 ? 'var(--bad)' : stock <= min * 0.4 ? 'var(--bad)' : stock <= min ? 'var(--warn)' : 'var(--good)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 130 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
        <span className="mono" style={{ color: 'var(--fg)' }}>{stock}</span>
        <span className="mono" style={{ color: 'var(--fg-4)' }}>{min}</span>
      </div>
      <div className="stock-bar">
        <div className="fill" style={{ width: pct + '%', background: color }}></div>
        <div className="marker" style={{ left: minPct + '%' }}></div>
      </div>
    </div>
  );
}

// ── CSV template & bulk upload ────────────────────────────────────────────────

const CSV_HEADERS = ['name','sku','category','price','cost','unit','barcode','stock','min_stock','max_stock'];
const CSV_TEMPLATE = [CSV_HEADERS,
  ['Unga wa Sembe 10kg','UWS-10','Flour & Maize Products','28500','22000','bag','6160100012413','50','10','200'],
  ['Sabuni ya OMO 1kg','OMO-1KG','Detergents & Washing Powder','4500','3200','pcs','6001070010024','80','20','300'],
].map(r => r.join(',')).join('\n');

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'products_template.csv'; a.click();
  URL.revokeObjectURL(url);
}

function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const [dragOver,  setDragOver]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result,    setResult]    = useState<BulkUploadResult | null>(null);
  const [err,       setErr]       = useState('');
  const [expanded,  setExpanded]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) { setErr('Only CSV files.'); return; }
    setErr(''); setResult(null); setUploading(true);
    const res = await inventoryApi.bulkUpload(file);
    setUploading(false);
    if (res.success) setResult(res.data); else setErr(res.message ?? 'Upload failed.');
  }

  return (
    <>
      <style>{`
        .bulk-overlay { position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;padding:20px; }
        .bulk-modal { background:var(--bg-2);border:1px solid var(--line);border-radius:12px;width:100%;max-width:520px;box-shadow:0 20px 60px rgba(0,0,0,0.4);overflow:hidden; }
        .bulk-dz { border:2px dashed var(--line-2);border-radius:10px;padding:32px 20px;text-align:center;cursor:pointer;background:var(--bg);transition:border-color 150ms,background 150ms; }
        .bulk-dz.over { border-color:var(--accent);background:var(--accent-soft); }
      `}</style>
      <div className="bulk-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="bulk-modal">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Bulk upload</div>
            <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--fg-3)', fontSize: 20, lineHeight: 1, padding: '4px 8px' }}>×</button>
          </div>
          <div style={{ padding: 20 }}>
            {!result ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{CSV_HEADERS.join(' · ')}</span>
                  <button onClick={downloadTemplate} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.download} Template</button>
                </div>
                <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
                <div className={`bulk-dz${dragOver ? ' over' : ''}`} onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}>
                  {uploading ? <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>Uploading…</div> : <><div style={{ fontSize: 28, marginBottom: 8 }}>📄</div><div style={{ fontSize: 13, fontWeight: 500 }}>Drop CSV or click to browse</div></>}
                </div>
                {err && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--bad)', padding: '10px 12px', borderRadius: 7, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)' }}>{err}</div>}
              </>
            ) : (
              <>
                <div style={{ padding: '12px 14px', borderRadius: 8, background: result.failed === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(251,191,36,0.08)', border: `1px solid ${result.failed === 0 ? 'rgba(16,185,129,0.25)' : 'rgba(251,191,36,0.25)'}` }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: result.failed === 0 ? 'var(--good)' : 'var(--warn)' }}>{result.failed === 0 ? '✓ Done' : `Done with ${result.failed} errors`}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-2)', marginTop: 3 }}><strong>{result.created}</strong> products added{result.failed > 0 ? ` · ${result.failed} skipped` : ''}</div>
                </div>
                {result.errors.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <button onClick={() => setExpanded(v => !v)} style={{ background: 'transparent', border: 0, cursor: 'pointer', fontSize: 12.5, color: 'var(--fg-3)', padding: 0 }}>{expanded ? '▲' : '▶'} {result.errors.length} errors</button>
                    {expanded && <div style={{ marginTop: 8, border: '1px solid var(--line)', borderRadius: 7, maxHeight: 180, overflowY: 'auto', fontFamily: 'var(--mono)', fontSize: 11.5 }}>
                      {result.errors.map((e, i) => <div key={i} style={{ padding: '7px 10px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 10 }}><span style={{ color: 'var(--fg-4)', minWidth: 48 }}>Row {e.row}</span><span style={{ color: 'var(--bad)' }}>{e.message}</span></div>)}
                    </div>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button onClick={() => { setResult(null); setErr(''); setExpanded(false); }} className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }}>Upload more</button>
                  <button onClick={onClose} className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>Done</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const TableViewIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.4"><rect x="2" y="3" width="12" height="10" rx="1"/><path d="M2 6.5h12M2 10h12"/></g></svg>;
const GridViewIcon  = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="5" height="5" rx="0.5"/><rect x="9" y="2" width="5" height="5" rx="0.5"/><rect x="2" y="9" width="5" height="5" rx="0.5"/><rect x="9" y="9" width="5" height="5" rx="0.5"/></g></svg>;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [query,        setQuery]        = useState('');
  const [cat,          setCat]          = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view,         setView]         = useState<'table' | 'grid'>('table');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Live data
  const [products,  setProducts]  = useState<InventoryProduct[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setLoading(true);
    inventoryApi.getProducts('is_active=true').then(res => {
      if (res.success) { setProducts(res.data); }
      else { setLoadError('Could not load products.'); }
      setLoading(false);
    }).catch(() => { setLoadError('Network error.'); setLoading(false); });
  }, []);

  // Derive categories from live product data
  const liveCats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      const name = p.category_name || 'Uncategorised';
      map[name] = (map[name] || 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({ id: name, name, count }));
  }, [products]);

  const filtered = useMemo(() => products.filter(p => {
    if (cat !== 'all' && (p.category_name || 'Uncategorised') !== cat) return false;
    if (statusFilter === 'low' && !(p.stock <= p.min_stock && p.stock > 0)) return false;
    if (statusFilter === 'out' && p.stock !== 0) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q) && !(p.barcode || '').includes(q)) return false;
    }
    return true;
  }), [cat, statusFilter, query, products]);

  const lowProducts = useMemo(() => products.filter(p => p.stock <= p.min_stock && p.stock > 0), [products]);
  const totalValue  = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const outCount    = products.filter(p => p.stock === 0).length;

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Inventory' }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowBulkModal(true)} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.upload} Bulk upload
          </button>
          <Link href="/inventory/new" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.plus} Add product
          </Link>
        </div>
      }
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Inventory</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost page-sec">{Icons.download} Export</button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface stat-card">
          <span className="label">PRODUCTS</span>
          <span className="value">{products.length}</span>
          <span className="sub">{products.filter(p => p.is_active).length} active</span>
        </div>
        <div className="surface stat-card">
          <span className="label">STOCK VALUE</span>
          <span className="value">{fmtShort(totalValue)}</span>
          <span className="sub">at cost</span>
        </div>
        <div className="surface stat-card" style={{ borderColor: lowProducts.length > 0 ? 'rgba(251,191,36,0.25)' : 'var(--line)' }}>
          <span className="label">LOW STOCK</span>
          <span className="value" style={{ color: lowProducts.length > 0 ? 'var(--warn)' : 'var(--fg)' }}>{lowProducts.length}</span>
          <span className="sub">{lowProducts.length === 0 ? 'All stocked' : 'below reorder'}</span>
        </div>
        <div className="surface stat-card" style={{ borderColor: outCount > 0 ? 'rgba(251,113,133,0.25)' : 'var(--line)' }}>
          <span className="label">OUT OF STOCK</span>
          <span className="value" style={{ color: outCount > 0 ? 'var(--bad)' : 'var(--fg)' }}>{outCount}</span>
          <span className="sub">{outCount === 0 ? 'All in stock' : 'restock now'}</span>
        </div>
      </div>

      {/* Low stock AI nudge */}
      {lowProducts.length > 0 && (
        <div className="surface" style={{ padding: '12px 16px', borderColor: 'var(--accent-line)', background: 'var(--accent-soft)', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)', flexShrink: 0 }}>{Icons.sparkles}</span>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 13, color: 'var(--fg)', marginBottom: 2 }}>
              <strong>{lowProducts.length}</strong> product{lowProducts.length > 1 ? 's' : ''} low — restock soon.
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              {lowProducts.slice(0, 3).map(p => p.name).join(' · ')}{lowProducts.length > 3 ? ` · +${lowProducts.length - 3}` : ''}
            </div>
          </div>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.sparkles} Auto-draft restock</button>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg-2)', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240, padding: '0 10px 0 12px', height: 32, border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg)' }}>
          {Icons.search}
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…" style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }} />
          {query && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{filtered.length}</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          <button onClick={() => setCat('all')} style={{ padding: '5px 11px', borderRadius: 999, border: '1px solid ' + (cat === 'all' ? 'var(--accent-line)' : 'var(--line)'), background: cat === 'all' ? 'var(--accent-soft)' : 'var(--bg-2)', color: cat === 'all' ? 'var(--fg)' : 'var(--fg-2)', fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
            All <span className="mono" style={{ fontSize: 10, color: cat === 'all' ? 'var(--accent)' : 'var(--fg-4)' }}>{products.length}</span>
          </button>
          {liveCats.map(c => (
            <button key={c.id} onClick={() => setCat(c.name)} style={{ padding: '5px 11px', borderRadius: 999, border: '1px solid ' + (cat === c.name ? 'var(--accent-line)' : 'var(--line)'), background: cat === c.name ? 'var(--accent-soft)' : 'var(--bg-2)', color: cat === c.name ? 'var(--fg)' : 'var(--fg-2)', fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
              {c.name}<span className="mono" style={{ fontSize: 10, color: cat === c.name ? 'var(--accent)' : 'var(--fg-4)' }}>{c.count}</span>
            </button>
          ))}
        </div>
        <span style={{ width: 1, height: 22, background: 'var(--line)', margin: '0 4px' }}></span>
        <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden', background: 'var(--bg)' }}>
          {[['all','All'],['low','Low'],['out','Out']].map(([k,l]) => (
            <button key={k} onClick={() => setStatusFilter(k)} style={{ padding: '6px 11px', fontSize: 12.5, border: 0, borderRight: '1px solid var(--line)', background: statusFilter === k ? 'var(--bg-3)' : 'transparent', color: statusFilter === k ? 'var(--fg)' : 'var(--fg-3)', cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden', background: 'var(--bg)' }}>
          <button onClick={() => setView('table')} style={{ padding: '6px 9px', border: 0, background: view === 'table' ? 'var(--bg-3)' : 'transparent', color: view === 'table' ? 'var(--fg)' : 'var(--fg-3)', cursor: 'pointer' }}><TableViewIcon /></button>
          <button onClick={() => setView('grid')}  style={{ padding: '6px 9px', border: 0, background: view === 'grid'  ? 'var(--bg-3)' : 'transparent', color: view === 'grid'  ? 'var(--fg)' : 'var(--fg-3)', cursor: 'pointer' }}><GridViewIcon /></button>
        </div>
      </div>

      {/* Loading / error states */}
      {loading && (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--fg-4)' }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {!loading && loadError && (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--bad)', fontSize: 13 }}>{loadError}</div>
      )}

      {/* Mobile list view */}
      {!loading && !loadError && view === 'table' && (
        <div className="surface mobile-only" style={{ overflow: 'hidden', marginBottom: 14 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No matches</div>
          ) : filtered.map((p, i) => {
            const status = statusFor(p);
            return (
              <Link key={p.id} href={`/inventory/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', textDecoration: 'none', color: 'inherit', borderBottom: i < filtered.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <ProductThumb name={p.name} color={p.color} imageUrl={p.image_url} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2 }}>{p.sku}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{fmt(p.price)}</div>
                  <span className={'pill ' + status.kind} style={{ fontSize: 9.5 }}>
                    <span className="dot-s" style={{ background: status.kind === 'good' ? 'var(--good)' : status.kind === 'warn' ? 'var(--warn)' : 'var(--bad)' }} />
                    {p.stock} {status.label}
                  </span>
                </div>
              </Link>
            );
          })}
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', background: 'var(--bg-3)', display: 'flex', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{filtered.length} / {products.length}</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{fmt(filtered.reduce((s, p) => s + p.stock * p.cost, 0))}</span>
          </div>
        </div>
      )}

      {/* Mobile grid view */}
      {!loading && !loadError && view === 'grid' && (
        <div className="inv-grid-wrap mobile-only" style={{ marginBottom: 14 }}>
          {filtered.map(p => {
            const status = statusFor(p);
            const scheme = COLOR_SCHEMES[p.color] || COLOR_SCHEMES.indigo;
            return (
              <Link key={p.id} href={`/inventory/${p.id}`} className="surface" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none', color: 'inherit' }}>
                {p.image_url ? <img src={p.image_url} alt={p.name} style={{ height: 72, width: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
                  : <div style={{ height: 72, background: scheme.bg, color: scheme.fg, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 600 }}>{p.name[0]}</div>}
                <div style={{ fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span className="mono" style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>{fmt(p.price)}</span>
                  <span className={'pill ' + status.kind} style={{ fontSize: 9.5 }}>{p.stock}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop table */}
      {!loading && !loadError && view === 'table' && (
        <div className="inv-table-wrap surface desktop-only" style={{ overflow: 'hidden' }}>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}><input type="checkbox" style={{ accentColor: 'var(--accent)' }} /></th>
                  <th style={{ width: 50 }}></th>
                  <th>PRODUCT</th>
                  <th style={{ width: 110 }}>SKU</th>
                  <th style={{ width: 110 }}>CATEGORY</th>
                  <th style={{ width: 110, textAlign: 'right' }} className="num">COST</th>
                  <th style={{ width: 110, textAlign: 'right' }} className="num">PRICE</th>
                  <th style={{ width: 88,  textAlign: 'right' }} className="num">MARGIN</th>
                  <th style={{ width: 170 }}>STOCK</th>
                  <th style={{ width: 100 }}>STATUS</th>
                  <th style={{ width: 32 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const status = statusFor(p);
                  const margin = p.margin_pct.toFixed(0);
                  return (
                    <tr key={p.id}>
                      <td onClick={e => e.stopPropagation()}><input type="checkbox" style={{ accentColor: 'var(--accent)' }} /></td>
                      <td><ProductThumb name={p.name} color={p.color} imageUrl={p.image_url} size={36} /></td>
                      <td>
                        <Link href={`/inventory/${p.id}`} style={{ fontWeight: 500, color: 'inherit' }}>{p.name}</Link>
                        {p.barcode && <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 1 }}>{p.barcode}</div>}
                      </td>
                      <td className="mono" style={{ color: 'var(--fg-3)' }}>{p.sku}</td>
                      <td>{p.category_name && <span className="pill" style={{ background: 'var(--bg-3)' }}>{p.category_name}</span>}</td>
                      <td className="num" style={{ color: 'var(--fg-2)' }}>{fmt(p.cost)}</td>
                      <td className="num" style={{ color: 'var(--fg)', fontWeight: 500 }}>{fmt(p.price)}</td>
                      <td className="num" style={{ color: 'var(--good)' }}>{margin}%</td>
                      <td><StockBar stock={p.stock} min={p.min_stock} max={p.max_stock} /></td>
                      <td>
                        <span className={'pill ' + status.kind} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <span className="dot-s" style={{ background: status.kind === 'good' ? 'var(--good)' : status.kind === 'warn' ? 'var(--warn)' : 'var(--bad)' }}></span>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="icon-btn" style={{ width: 26, height: 26, fontSize: 13 }}>⋯</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && !loading && (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-3)' }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em' }}>NO MATCHES</div>
            </div>
          )}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-3)' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{filtered.length} / {products.length}</span>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              {fmt(filtered.reduce((s, p) => s + p.stock * p.cost, 0))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop grid view */}
      {!loading && !loadError && view === 'grid' && (
        <div className="inv-grid-wrap desktop-only">
          {filtered.map(p => {
            const status = statusFor(p);
            const scheme = COLOR_SCHEMES[p.color] || COLOR_SCHEMES.indigo;
            return (
              <Link key={p.id} href={`/inventory/${p.id}`} className="surface" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, textDecoration: 'none', color: 'inherit' }}>
                {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: '100%', aspectRatio: '1.4', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
                  : <div style={{ aspectRatio: '1.4', background: scheme.bg, color: scheme.fg, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 36, fontWeight: 500 }}>{p.name[0]}</div>}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 1 }}>{p.sku}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <span className="mono" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>{fmt(p.price)}</span>
                  <span className={'pill ' + status.kind} style={{ fontSize: 10 }}>{p.stock} {status.label.toLowerCase()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showBulkModal && <BulkUploadModal onClose={() => setShowBulkModal(false)} />}
    </AppShell>
  );
}
