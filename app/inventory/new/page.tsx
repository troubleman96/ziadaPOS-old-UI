'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';

export default function NewProductPage() {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('grocery');
  const [unit, setUnit] = useState('pcs');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');

  const margin = price && cost ? (((+price - +cost) / +price) * 100).toFixed(1) : null;

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Inventory', href: '/inventory' }, { label: 'New product' }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/inventory" className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }}>Cancel</Link>
          <button className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>{Icons.check} Save product</button>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }}>
        {/* Left */}
        <div>
          {/* Basic info */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">Basic information</span></div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>PRODUCT NAME *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Unga wa Sembe 10kg" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13.5, fontFamily: 'inherit', outline: 0, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>SKU</label>
                  <input value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. UWS-10" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>CATEGORY</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit', outline: 0, boxSizing: 'border-box' }}>
                    {['grocery','household','beverage','cosmetics','bakery','snacks'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>UNIT OF MEASURE</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit', outline: 0, boxSizing: 'border-box' }}>
                    {['pcs','kg','g','L','ml','box','ctn'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>BARCODE</label>
                  <input placeholder="Scan or enter barcode" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
                </div>
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
                  <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>SELLING PRICE (TZS) *</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
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
                  <input type="number" placeholder="0" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7, background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'var(--mono)', outline: 0, boxSizing: 'border-box' }} />
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
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">AI assist</span></div>
            <div style={{ padding: '14px 16px' }}>
              <button className="btn btn-soft" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 12px', fontSize: 13 }}>
                {Icons.sparkles} Suggest pricing & reorder point
              </button>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 8, textAlign: 'center' }}>Based on similar products in your store</div>
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
                <span style={{ fontSize: 13 }}>Active — visible on POS</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="radio" name="status" style={{ accentColor: 'var(--accent)' }} />
                <span style={{ fontSize: 13 }}>Draft — not visible yet</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
