'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmtShort } from '../../../lib/utils';
import { analyticsApi, AnalyticsProduct } from '../../../lib/api';
import { AnalyticsNav, AnalyticsHeader } from '../_shared';

const SPINNER = (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
  </>
);

const CAT_COLORS: Record<string, string> = {
  Grocery: 'var(--accent)', Beverage: '#10b981', Household: '#f59e0b',
  Snacks: '#fb7185', Cosmetics: '#60a5fa', Bakery: '#a78bfa',
};

export default function ProductsAnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [sort, setSort] = useState<'revenue' | 'qty_sold' | 'margin_pct' | 'profit'>('revenue');
  const [catFilter, setCatFilter] = useState('All');

  const [products, setProducts] = useState<AnalyticsProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsApi.getProducts(`range=${range}`).then((res) => {
      setLoading(false);
      if (res.success) {
        const data = res.data as unknown as { results?: AnalyticsProduct[] } | AnalyticsProduct[];
        if (Array.isArray(data)) setProducts(data);
        else if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as { results: AnalyticsProduct[] }).results)) {
          setProducts((data as { results: AnalyticsProduct[] }).results);
        } else {
          setProducts([]);
        }
      }
    });
  }, [range]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category_name)))], [products]);

  const filtered = useMemo(() => {
    return products
      .filter(p => catFilter === 'All' || p.category_name === catFilter)
      .slice()
      .sort((a, b) => (b[sort] as number) - (a[sort] as number));
  }, [products, catFilter, sort]);

  const totals = useMemo(() => ({
    rev:    filtered.reduce((s, p) => s + p.revenue, 0),
    profit: filtered.reduce((s, p) => s + p.profit, 0),
    units:  filtered.reduce((s, p) => s + p.qty_sold, 0),
  }), [filtered]);

  const maxRev = filtered[0]?.revenue ?? 1;

  return (
    <AppShell crumbs={[
      { label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' },
      { label: 'Analytics', href: '/analytics' }, { label: 'Products' },
    ]}
      actions={
        <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {Icons.download} Export
        </button>
      }
    >
      <AnalyticsHeader range={range} setRange={setRange} />
      <AnalyticsNav />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'TOTAL SKUs',   value: filtered.length.toString(),    sub: 'active products' },
          { label: 'REVENUE',      value: fmtShort(totals.rev),          sub: 'from products' },
          { label: 'GROSS PROFIT', value: fmtShort(totals.profit),       sub: totals.rev > 0 ? `${(totals.profit / totals.rev * 100).toFixed(1)}% margin` : '— margin' },
          { label: 'UNITS SOLD',   value: totals.units.toLocaleString(), sub: 'total units' },
        ].map((k) => (
          <div key={k.label} className="surface" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>{k.label}</span>
            <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>{k.value}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* AI nudge */}
      <div style={{ padding: '12px 16px', background: 'color-mix(in srgb, var(--accent) 10%, var(--bg-2))', border: '1px solid color-mix(in srgb, var(--accent) 25%, var(--line))', borderRadius: 10, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ color: 'var(--accent)', marginTop: 1, flexShrink: 0 }}>{Icons.sparkles}</span>
        <div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>3 products are underperforming</span>
          <span style={{ fontSize: 13, color: 'var(--fg-2)' }}> — Some products have slipped below 18% margin due to cost increases not yet passed on. </span>
          <button style={{ fontSize: 12.5, color: 'var(--accent)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>Review pricing →</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{
              padding: '5px 12px', fontSize: 12.5, borderRadius: 20,
              border: '1px solid ' + (catFilter === c ? 'var(--accent)' : 'var(--line)'),
              background: catFilter === c ? 'color-mix(in srgb, var(--accent) 15%, var(--bg-2))' : 'var(--bg-2)',
              color: catFilter === c ? 'var(--fg)' : 'var(--fg-3)', cursor: 'pointer',
            }}>{c}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>SORT:</span>
          {[['revenue','Revenue'],['qty_sold','Units'],['margin_pct','Margin'],['profit','Profit']].map(([k,l]) => (
            <button key={k} onClick={() => setSort(k as typeof sort)} style={{
              padding: '4px 10px', fontSize: 12, borderRadius: 5,
              border: '1px solid var(--line)',
              background: sort === k ? 'var(--bg-3)' : 'transparent',
              color: sort === k ? 'var(--fg)' : 'var(--fg-3)', cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Product table */}
      <div className="surface">
        <div className="card-head" style={{ justifyContent: 'space-between' }}>
          <span className="card-title">Product performance</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{filtered.length} products</span>
        </div>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>{SPINNER}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-3)' }}>
            <div className="mono" style={{ fontSize: 11 }}>NO DATA</div>
            <div style={{ marginTop: 6, fontSize: 14 }}>No product analytics available for this period.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Units sold</th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                  <th style={{ textAlign: 'right' }}>Profit</th>
                  <th style={{ textAlign: 'right' }}>Margin</th>
                  <th style={{ paddingRight: 20 }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.product_id}>
                    <td style={{ paddingLeft: 20, color: 'var(--fg-4)', width: 32 }}>
                      <span className="mono" style={{ fontSize: 12 }}>{i + 1}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 6, background: `color-mix(in srgb, ${CAT_COLORS[p.category_name] ?? 'var(--accent)'} 20%, var(--bg-3))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: CAT_COLORS[p.category_name] ?? 'var(--accent)', flexShrink: 0 }}>
                          {p.product_name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5 }}>{p.product_name}</div>
                          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{p.product_sku}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: `color-mix(in srgb, ${CAT_COLORS[p.category_name] ?? 'var(--accent)'} 15%, var(--bg-3))`, color: CAT_COLORS[p.category_name] ?? 'var(--accent)' }}>
                        {p.category_name}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono" style={{ fontSize: 13 }}>{p.qty_sold.toLocaleString()}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono" style={{ fontSize: 13 }}>{fmtShort(p.revenue)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono" style={{ fontSize: 13, color: 'var(--good)' }}>{fmtShort(p.profit)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="mono" style={{ fontSize: 13, color: p.margin_pct < 18 ? 'var(--warn)' : 'var(--good)' }}>{p.margin_pct.toFixed(1)}%</span>
                    </td>
                    <td style={{ paddingRight: 20, width: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--bg-3)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(p.revenue / maxRev) * 100}%`, background: CAT_COLORS[p.category_name] ?? 'var(--accent)', borderRadius: 2 }} />
                        </div>
                        <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', width: 28 }}>
                          {totals.rev > 0 ? (p.revenue / totals.rev * 100).toFixed(0) : '0'}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
