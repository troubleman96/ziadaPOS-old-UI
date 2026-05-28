'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtShort } from '../../../lib/utils';
import { INVENTORY, COLOR_SCHEMES } from '../../../lib/data';

function generateMovements(p: typeof INVENTORY[0]) {
  const today = new Date(2026, 4, 24);
  const evs: Array<{ ts: Date; kind: string; qty: number; who: string; note: string }> = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today.getTime() - i * 86400000);
    const sold = Math.max(0, Math.round(p.weeklySold / 7 + (Math.sin(i * 1.7) * 2)));
    if (sold > 0) evs.push({ ts: d, kind: 'sale', qty: -sold, who: i % 2 === 0 ? 'Hamisi M.' : 'Amani M.', note: `${sold} units sold` });
  }
  evs.push({ ts: new Date(today.getTime() - 6 * 86400000), kind: 'restock', qty: 40, who: p.supplier, note: `Restock from ${p.supplier} · PO #4421` });
  evs.push({ ts: new Date(today.getTime() - 13 * 86400000), kind: 'adjustment', qty: -2, who: 'Hamisi M.', note: 'Damaged stock removed' });
  evs.push({ ts: new Date(today.getTime() - 18 * 86400000), kind: 'restock', qty: 30, who: p.supplier, note: `Restock from ${p.supplier} · PO #4408` });
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
        <text key={i} x={xScale(i)} y={h - 10} textAnchor="middle" fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">{30 - i}d</text>
      ))}
      {[0.25, 0.5, 0.75, 1].map((t, i) => (
        <text key={i} x={pad.l - 8} y={yScale(t*max) + 3} textAnchor="end" fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">{Math.round(t*max)}</text>
      ))}
    </svg>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState('overview');

  const p = INVENTORY.find((x) => x.id === id) || INVENTORY[0];
  const idx = INVENTORY.findIndex(x => x.id === p.id);
  const prev = INVENTORY[idx - 1];
  const next = INVENTORY[idx + 1];
  const movements = useMemo(() => generateMovements(p), [p]);
  const scheme = COLOR_SCHEMES[p.color] || COLOR_SCHEMES.indigo;
  const margin = (((p.price - p.cost) / p.price) * 100).toFixed(1);
  const stockKind = p.stock === 0 ? 'bad' : p.stock <= p.min * 0.4 ? 'bad' : p.stock <= p.min ? 'warn' : 'good';
  const projDaysLeft = Math.round(p.stock / (p.weeklySold / 7));
  const monthRevenue = p.weeklySold * 4 * p.price;
  const monthProfit = p.weeklySold * 4 * (p.price - p.cost);

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Inventory', href: '/inventory' }, { label: p.name }]}
      actions={
        <div style={{ display: 'flex', gap: 6 }}>
          {prev && <Link href={`/inventory/${prev.id}`} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>← Prev</Link>}
          {next && <Link href={`/inventory/${next.id}`} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>Next →</Link>}
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
            <span className="pill" style={{ background: 'var(--bg-3)' }}>{p.cat}</span>
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 14 }}>
            {p.sku} <span style={{ color: 'var(--fg-4)', margin: '0 6px' }}>·</span>
            {p.barcode} <span style={{ color: 'var(--fg-4)', margin: '0 6px' }}>·</span>
            {p.unit} <span style={{ color: 'var(--fg-4)', margin: '0 6px' }}>·</span>
            supplier: {p.supplier}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.plus} Restock</button>
            <button className="btn btn-soft">Edit product</button>
            <button className="btn btn-soft">Stock adjustment</button>
            <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.sparkles} Ask AI</button>
            <button className="btn btn-ghost">Duplicate</button>
            <button className="btn btn-ghost">Archive</button>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 18 }}>
        <div className="surface kpi-mini">
          <div className="label">ON HAND</div>
          <div className="value">{p.stock} <span style={{ fontSize: 12, color: 'var(--fg-4)', fontFamily: 'var(--mono)' }}>{p.unit}</span></div>
          <div className="delta" style={{ color: 'var(--fg-3)' }}>min {p.min} · max {p.max}</div>
        </div>
        <div className="surface kpi-mini">
          <div className="label">DAYS OF COVER</div>
          <div className="value" style={{ color: projDaysLeft < 7 ? 'var(--warn)' : 'var(--fg)' }}>{projDaysLeft}<span style={{ fontSize: 12, color: 'var(--fg-4)', fontFamily: 'var(--mono)' }}> days</span></div>
          <div className="delta" style={{ color: 'var(--fg-3)' }}>at current sell rate</div>
        </div>
        <div className="surface kpi-mini">
          <div className="label">SOLD · 30D</div>
          <div className="value">{p.weeklySold * 4} <span style={{ fontSize: 12, color: 'var(--fg-4)', fontFamily: 'var(--mono)' }}>units</span></div>
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
            At <strong style={{ color: 'var(--fg)' }}>{p.weeklySold} units/week</strong>, you&apos;ll run out in <strong style={{ color: 'var(--fg)' }}>{projDaysLeft} days</strong>. Suggested restock: <strong style={{ color: 'var(--fg)' }}>{Math.max(40, p.weeklySold * 3)} units</strong> from {p.supplier}.
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
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
                <div className="field-row"><span className="k">On hand</span><span className="v mono">{p.stock} {p.unit}</span></div>
                <div className="field-row"><span className="k">Reorder at</span><span className="v mono">{p.min}</span></div>
                <div className="field-row"><span className="k">Max stock</span><span className="v mono">{p.max}</span></div>
                <div className="field-row"><span className="k">Last restock</span><span className="v">{p.lastRestock}</span></div>
                <div className="field-row"><span className="k">Tracked</span><span className="v">Yes</span></div>
              </div>
            </div>
            <div className="surface">
              <div className="card-head"><span className="card-title">Supplier</span></div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--bg-3)', color: 'var(--fg-2)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>
                    {p.supplier.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.supplier}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>preferred · 3 day lead time</div>
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>View supplier →</button>
              </div>
            </div>
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
              <div className="field-row"><span className="k">Markup</span><span className="v mono">{(((p.price - p.cost) / p.cost) * 100).toFixed(0)}%</span></div>
              <div className="field-row"><span className="k">VAT</span><span className="v">18% inclusive</span></div>
            </div>
          </div>
          <div className="surface">
            <div className="card-head"><span className="card-title">Projected revenue</span></div>
            <div style={{ padding: '14px 16px' }}>
              <div className="field-row"><span className="k">/ day</span><span className="v mono">{fmtShort(Math.round((p.weeklySold/7) * p.price))}</span></div>
              <div className="field-row"><span className="k">/ week</span><span className="v mono">{fmtShort(p.weeklySold * p.price)}</span></div>
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
            <div className="field-row"><span className="k">Category</span><span className="v">{p.cat}</span></div>
            <div className="field-row"><span className="k">Unit</span><span className="v">{p.unit}</span></div>
            <div className="field-row"><span className="k">Barcode</span><span className="v mono">{p.barcode}</span></div>
            <div className="field-row"><span className="k">Status</span><span className="v">{p.active ? 'Active' : 'Archived'}</span></div>
            <div className="field-row"><span className="k">Supplier</span><span className="v">{p.supplier}</span></div>
            <div className="field-row"><span className="k">Lead time</span><span className="v">3 days</span></div>
            <div className="field-row"><span className="k">Tracked</span><span className="v">Yes — stock count maintained</span></div>
            <div className="field-row"><span className="k">Created</span><span className="v">Feb 14, 2024</span></div>
            <div className="field-row"><span className="k">Last updated</span><span className="v">{p.lastRestock}</span></div>
            <div className="field-row"><span className="k">Description</span><span className="v" style={{ color: 'var(--fg-2)' }}>{p.name} — staple {p.cat.toLowerCase()} item.</span></div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
