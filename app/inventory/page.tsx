'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';
import { INVENTORY, CATEGORIES, COLOR_SCHEMES } from '../../lib/data';

function statusFor(p: typeof INVENTORY[0]) {
  if (p.stock === 0) return { kind: 'bad', label: 'Out' };
  if (p.stock <= p.min * 0.4) return { kind: 'bad', label: 'Critical' };
  if (p.stock <= p.min) return { kind: 'warn', label: 'Low' };
  return { kind: 'good', label: 'Active' };
}

function ThumbLetter({ name, color }: { name: string; color: string }) {
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.indigo;
  return (
    <div className="thumb-letter" style={{ background: scheme.bg, color: scheme.fg }}>
      {name[0]}
    </div>
  );
}

function StockBar({ stock, min, max }: { stock: number; min: number; max: number }) {
  const pct = Math.max(2, Math.min(100, (stock / max) * 100));
  const minPct = Math.max(2, Math.min(98, (min / max) * 100));
  const kind = stock === 0 ? 'bad' : stock <= min * 0.4 ? 'bad' : stock <= min ? 'warn' : 'good';
  const color = kind === 'bad' ? 'var(--bad)' : kind === 'warn' ? 'var(--warn)' : 'var(--good)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 130 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
        <span className="mono" style={{ color: 'var(--fg)' }}>{stock}</span>
        <span className="mono" style={{ color: 'var(--fg-4)' }}>min {min}</span>
      </div>
      <div className="stock-bar">
        <div className="fill" style={{ width: pct + '%', background: color }}></div>
        <div className="marker" style={{ left: minPct + '%' }}></div>
      </div>
    </div>
  );
}

const TableViewIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.4"><rect x="2" y="3" width="12" height="10" rx="1"/><path d="M2 6.5h12M2 10h12"/></g></svg>;
const GridViewIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="5" height="5" rx="0.5"/><rect x="9" y="2" width="5" height="5" rx="0.5"/><rect x="2" y="9" width="5" height="5" rx="0.5"/><rect x="9" y="9" width="5" height="5" rx="0.5"/></g></svg>;

export default function InventoryPage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState<'table' | 'grid'>('table');

  const filtered = useMemo(() => INVENTORY.filter((p) => {
    if (cat !== 'all' && p.cat !== cat) return false;
    if (statusFilter === 'low' && !(p.stock <= p.min)) return false;
    if (statusFilter === 'out' && p.stock !== 0) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q) && !p.barcode.includes(q)) return false;
    }
    return true;
  }), [cat, statusFilter, query]);

  const lowProducts = useMemo(() => INVENTORY.filter((p) => p.stock <= p.min && p.stock > 0), []);
  const totalValue = INVENTORY.reduce((s, p) => s + p.stock * p.cost, 0);
  const lowCount = lowProducts.length;
  const outCount = INVENTORY.filter(p => p.stock === 0).length;

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Inventory' }]}
      actions={
        <Link href="/inventory/new" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.plus} Add product
        </Link>
      }
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>
            Inventory <span style={{ color: 'var(--fg-4)' }}>/</span>{' '}
            <span className="mono" style={{ fontSize: 16, fontWeight: 400, color: 'var(--fg-3)' }}>Bidhaa</span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
            Every product across Duka Kuu — Kariakoo.
            <span className="mono" style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="dot-s" style={{ background: 'var(--good)' }}></span> live · synced 3s ago
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost page-sec">{Icons.download} Export CSV</button>
          <button className="btn btn-ghost page-sec">{Icons.filter} Import</button>
          <button className="btn btn-soft page-sec">Stock adjustment</button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface stat-card">
          <span className="label">TOTAL SKU</span>
          <span className="value">{INVENTORY.length}</span>
          <span className="sub">{INVENTORY.filter(p => p.active).length} active · 0 archived</span>
        </div>
        <div className="surface stat-card">
          <span className="label">INVENTORY VALUE</span>
          <span className="value">{fmtShort(totalValue)}</span>
          <span className="sub">at cost · {INVENTORY.reduce((s,p) => s+p.stock, 0).toLocaleString()} units total</span>
        </div>
        <div className="surface stat-card" style={{ borderColor: lowCount > 0 ? 'rgba(251,191,36,0.25)' : 'var(--line)' }}>
          <span className="label">LOW STOCK</span>
          <span className="value" style={{ color: lowCount > 0 ? 'var(--warn)' : 'var(--fg)' }}>{lowCount}</span>
          <span className="sub">{lowCount === 0 ? 'All above reorder point' : 'below reorder point'}</span>
        </div>
        <div className="surface stat-card" style={{ borderColor: outCount > 0 ? 'rgba(251,113,133,0.25)' : 'var(--line)' }}>
          <span className="label">OUT OF STOCK</span>
          <span className="value" style={{ color: outCount > 0 ? 'var(--bad)' : 'var(--fg)' }}>{outCount}</span>
          <span className="sub">{outCount === 0 ? 'Nothing out yet' : 'needs restock now'}</span>
        </div>
      </div>

      {/* AI nudge */}
      {lowProducts.length > 0 && (
        <div className="surface" style={{ padding: '14px 16px', borderColor: 'var(--accent-line)', background: 'linear-gradient(180deg, var(--accent-soft) 0%, var(--bg-2) 100%)', marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)', flexShrink: 0 }}>{Icons.sparkles}</span>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 13, color: 'var(--fg)', marginBottom: 2 }}>
              <strong style={{ fontWeight: 500 }}>{lowProducts.length} product{lowProducts.length > 1 ? 's' : ''}</strong> below reorder point — projected stockout in 2–4 days.
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              {lowProducts.slice(0, 3).map(p => p.name).join(' · ')}
              {lowProducts.length > 3 ? ` · +${lowProducts.length - 3} more` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.sparkles} Auto-draft restock</button>
            <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}>View all</button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg-2)', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240, padding: '0 10px 0 12px', height: 32, border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg)' }}>
          {Icons.search}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, SKU or barcode…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }}
          />
          {query && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{filtered.length} hits</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{
              padding: '5px 11px', borderRadius: 999,
              border: '1px solid ' + (cat === c.id ? 'var(--accent-line)' : 'var(--line)'),
              background: cat === c.id ? 'var(--accent-soft)' : 'var(--bg-2)',
              color: cat === c.id ? 'var(--fg)' : 'var(--fg-2)',
              fontSize: 12.5, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
            }}>
              {c.name}
              <span className="mono" style={{ fontSize: 10, color: cat === c.id ? 'var(--accent)' : 'var(--fg-4)' }}>{c.count}</span>
            </button>
          ))}
        </div>
        <span style={{ width: 1, height: 22, background: 'var(--line)', margin: '0 4px' }}></span>
        <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden', background: 'var(--bg)' }}>
          {[['all','All'],['low','Low'],['out','Out']].map(([k,l]) => (
            <button key={k} onClick={() => setStatusFilter(k)} style={{
              padding: '6px 11px', fontSize: 12.5, border: 0,
              borderRight: '1px solid var(--line)',
              background: statusFilter === k ? 'var(--bg-3)' : 'transparent',
              color: statusFilter === k ? 'var(--fg)' : 'var(--fg-3)',
              cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden', background: 'var(--bg)' }}>
          <button onClick={() => setView('table')} style={{ padding: '6px 9px', border: 0, background: view === 'table' ? 'var(--bg-3)' : 'transparent', color: view === 'table' ? 'var(--fg)' : 'var(--fg-3)', cursor: 'pointer' }}><TableViewIcon /></button>
          <button onClick={() => setView('grid')} style={{ padding: '6px 9px', border: 0, background: view === 'grid' ? 'var(--bg-3)' : 'transparent', color: view === 'grid' ? 'var(--fg)' : 'var(--fg-3)', cursor: 'pointer' }}><GridViewIcon /></button>
        </div>
      </div>

      {/* Mobile always gets the grid view regardless of toggle */}
      {view === 'table' && (
        <div className="inv-grid-wrap mobile-only" style={{ marginBottom: 0 }}>
          {filtered.map((p) => {
            const status = statusFor(p);
            const scheme = COLOR_SCHEMES[p.color] || COLOR_SCHEMES.indigo;
            return (
              <Link key={p.id} href={`/inventory/${p.id}`} className="surface" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ aspectRatio: '1.4', background: scheme.bg, color: scheme.fg, borderRadius: 7, display: 'grid', placeItems: 'center', fontSize: 30, fontWeight: 500 }}>{p.name[0]}</div>
                <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.name}</div><div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 1 }}>{p.sku}</div></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <span className="mono" style={{ color: 'var(--accent)', fontSize: 12.5, fontWeight: 500 }}>{fmt(p.price)}</span>
                  <span className={'pill ' + status.kind} style={{ fontSize: 10 }}>{p.stock} {status.label.toLowerCase()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Table / grid — on mobile always shows grid; on desktop respects view toggle */}
      {view === 'table' ? (
        <div className="inv-table-wrap surface" style={{ overflow: 'hidden' }}>
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
                <th style={{ width: 88, textAlign: 'right' }} className="num">MARGIN</th>
                <th style={{ width: 170 }}>STOCK</th>
                <th style={{ width: 100 }}>STATUS</th>
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const status = statusFor(p);
                const margin = (((p.price - p.cost) / p.price) * 100).toFixed(0);
                return (
                  <tr key={p.id}>
                    <td onClick={(e) => e.stopPropagation()}><input type="checkbox" style={{ accentColor: 'var(--accent)' }} /></td>
                    <td><ThumbLetter name={p.name} color={p.color} /></td>
                    <td>
                      <Link href={`/inventory/${p.id}`} style={{ fontWeight: 500, color: 'inherit' }}>{p.name}</Link>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 1 }}>{p.barcode}</div>
                    </td>
                    <td className="mono" style={{ color: 'var(--fg-3)' }}>{p.sku}</td>
                    <td><span className="pill" style={{ background: 'var(--bg-3)' }}>{p.cat}</span></td>
                    <td className="num" style={{ color: 'var(--fg-2)' }}>{fmt(p.cost)}</td>
                    <td className="num" style={{ color: 'var(--fg)', fontWeight: 500 }}>{fmt(p.price)}</td>
                    <td className="num" style={{ color: 'var(--good)' }}>{margin}%</td>
                    <td><StockBar stock={p.stock} min={p.min} max={p.max} /></td>
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
          {filtered.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-3)' }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em' }}>NO MATCHES</div>
              <div style={{ marginTop: 6 }}>Try clearing filters or searching differently.</div>
            </div>
          )}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-3)' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Showing {filtered.length} of {INVENTORY.length} products</span>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              Total value: <span style={{ color: 'var(--fg-2)' }}>{fmt(filtered.reduce((s,p) => s + p.stock * p.cost, 0))}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="inv-grid-wrap">
          {filtered.map((p) => {
            const status = statusFor(p);
            const scheme = COLOR_SCHEMES[p.color] || COLOR_SCHEMES.indigo;
            return (
              <Link key={p.id} href={`/inventory/${p.id}`} className="surface" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ aspectRatio: '1.4', background: scheme.bg, color: scheme.fg, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 36, fontWeight: 500 }}>
                  {p.name[0]}
                </div>
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
    </AppShell>
  );
}
