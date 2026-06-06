'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';
import { inventoryApi, transactionApi, type POSProduct, type Category, type CompletedTransaction } from '../../lib/api';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface CartItem { product: POSProduct; qty: number; }
type Cart = Record<string, CartItem>;

// ── Customer types ────────────────────────────────────────────────────────────

interface POSCustomer {
  id: string;
  name: string;
  phone: string;
  segment: 'VIP' | 'Regular' | 'Occasional' | 'New';
  avatar_hue: number;
  open_credit: number;
}

// Temporary mock customers until customers API is wired here
const MOCK_CUSTOMERS: POSCustomer[] = [
  { id: 'c1', name: 'Fatuma Ally',   phone: '+255 712 408 311', segment: 'VIP',        avatar_hue: 240, open_credit: 0     },
  { id: 'c2', name: 'Juma Kifupi',   phone: '+255 754 992 110', segment: 'Regular',    avatar_hue: 160, open_credit: 28800 },
  { id: 'c3', name: 'Asha Mwinyi',   phone: '+255 718 003 982', segment: 'Regular',    avatar_hue: 30,  open_credit: 0     },
  { id: 'c4', name: 'Hassan Bakari', phone: '+255 765 442 119', segment: 'Occasional', avatar_hue: 300, open_credit: 12000 },
  { id: 'c5', name: 'Mariam Said',   phone: '+255 715 880 442', segment: 'VIP',        avatar_hue: 200, open_credit: 0     },
];

const SEGMENT_COLORS: Record<string, { bg: string; color: string }> = {
  VIP:        { bg: 'rgba(251,191,36,0.14)', color: '#fbbf24' },
  Regular:    { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  Occasional: { bg: 'rgba(99,102,241,0.12)', color: '#a5a8ff' },
  New:        { bg: 'rgba(34,211,238,0.12)', color: '#67e8f9' },
};

const COLOR_SCHEMES: Record<string, { bg: string; fg: string }> = {
  indigo:  { bg: 'rgba(99,102,241,0.10)',  fg: '#a5a8ff' },
  amber:   { bg: 'rgba(251,191,36,0.10)',  fg: '#fcd34d' },
  rose:    { bg: 'rgba(251,113,133,0.10)', fg: '#fda4af' },
  lime:    { bg: 'rgba(132,204,22,0.10)',  fg: '#bef264' },
  emerald: { bg: 'rgba(16,185,129,0.10)',  fg: '#6ee7b7' },
  violet:  { bg: 'rgba(167,139,250,0.10)', fg: '#c4b5fd' },
  cyan:    { bg: 'rgba(34,211,238,0.10)',  fg: '#67e8f9' },
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function BarcodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <g stroke="currentColor" strokeWidth="1.4">
        <path d="M2 3v10" /><path d="M4 3v10" /><path d="M6 3v10" />
        <path d="M9 3v10" /><path d="M11 3v10" /><path d="M13 3v10" />
      </g>
    </svg>
  );
}
const PauseIcon  = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5"><path d="M6 4v8M10 4v8" /></g></svg>;
const TrashIcon  = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5L11 4" /></g></svg>;
const CartIcon   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h2l2.5 10h11L21 8H6" /><circle cx="9" cy="19" r="1.3" /><circle cx="17" cy="19" r="1.3" /></g></svg>;
const CheckBigIcon = () => <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 16l8 8 12-12" stroke="var(--good)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

// ── Customer avatar ───────────────────────────────────────────────────────────

function CustomerAvatar({ customer, size = 32 }: { customer: POSCustomer; size?: number }) {
  const initials = customer.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      background: `linear-gradient(135deg,hsl(${customer.avatar_hue},60%,45%),hsl(${customer.avatar_hue + 40},60%,55%))`,
      color: '#fff', display: 'grid', placeItems: 'center',
      fontSize: size * 0.38, fontWeight: 600,
    }}>{initials}</div>
  );
}

// ── Receipt modal ─────────────────────────────────────────────────────────────

function ReceiptModal({ txn, onNewSale }: { txn: CompletedTransaction; onNewSale: () => void }) {
  return (
    <>
      <style>{`
        .receipt-overlay {
          position: fixed; inset: 0; z-index: 800;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 200ms ease;
        }
        .receipt-card {
          background: var(--bg-2); border: 1px solid var(--line);
          border-radius: 16px; width: 100%; max-width: 360px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.45);
          overflow: hidden;
          animation: slideUp 200ms ease;
        }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
      `}</style>
      <div className="receipt-overlay">
        <div className="receipt-card">
          {/* Success header */}
          <div style={{ padding: '24px 20px 16px', textAlign: 'center', borderBottom: '1px solid var(--line)' }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: 'rgba(16,185,129,0.12)', margin: '0 auto 12px', display: 'grid', placeItems: 'center' }}>
              <CheckBigIcon />
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>Sale complete</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--fg-4)', marginTop: 4 }}>{txn.txn_number}</div>
          </div>

          {/* Total */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.03em' }}>
              {fmt(txn.total)}
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 4 }}>
              {txn.payment_method}
              {txn.payment_reference ? ` · ${txn.payment_reference}` : ''}
            </div>
          </div>

          {/* Items summary */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--line)', maxHeight: 140, overflowY: 'auto' }}>
            {txn.lines.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0' }}>
                <span style={{ color: 'var(--fg-2)' }}>{l.product_name} × {l.qty}</span>
                <span className="mono" style={{ color: 'var(--fg)' }}>{fmt(l.line_total)}</span>
              </div>
            ))}
          </div>

          {/* Customer + breakdown */}
          <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--fg-3)' }}>
              <span>Customer</span>
              <span style={{ color: 'var(--fg-2)', fontWeight: 500 }}>{txn.customer_name}</span>
            </div>
            {txn.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--fg-3)' }}>
                <span>Discount</span>
                <span className="mono" style={{ color: 'var(--bad)' }}>−{fmt(txn.discount_amount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--fg-3)' }}>
              <span>VAT 18%</span>
              <span className="mono">{fmt(txn.tax_amount)}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: '14px 20px', display: 'flex', gap: 8 }}>
            <button
              onClick={onNewSale}
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', padding: '12px', fontSize: 14, fontWeight: 600 }}
            >
              New sale
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Customer picker modal ─────────────────────────────────────────────────────

function CustomerPickerModal({ selected, onSelect, onClose }: {
  selected: POSCustomer | null;
  onSelect: (c: POSCustomer | null) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_CUSTOMERS;
    return MOCK_CUSTOMERS.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }, [query]);

  const pick = useCallback((c: POSCustomer | null) => { onSelect(c); onClose(); }, [onSelect, onClose]);

  return (
    <>
      <style>{`
        .cust-overlay { position:fixed;inset:0;z-index:700;background:rgba(0,0,0,0.5);display:flex;align-items:flex-start;justify-content:center;padding:20px;animation:fadeIn 150ms ease; }
        .cust-modal { background:var(--bg-2);border:1px solid var(--line);border-radius:12px;width:100%;max-width:440px;margin-top:60px;box-shadow:0 20px 60px rgba(0,0,0,0.4);overflow:hidden;animation:slideUp 160ms ease; }
        .cust-row { display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;transition:background 80ms;border-bottom:1px solid var(--line); }
        .cust-row:hover,.cust-row.selected { background:var(--bg-3); }
        .cust-row:last-child { border-bottom:none; }
      `}</style>
      <div className="cust-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="cust-modal">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--fg-4)', flexShrink: 0 }}>{Icons.search}</span>
            <input ref={inputRef} placeholder="Name or phone…" value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 14, fontFamily: 'var(--sans)' }} />
            {query && <button onClick={() => setQuery('')} style={{ background: 'transparent', border: 0, color: 'var(--fg-4)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>}
          </div>

          {/* Walk-in */}
          <div className={`cust-row${selected === null ? ' selected' : ''}`} onClick={() => pick(null)}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--bg-3)', color: 'var(--fg-3)', display: 'grid', placeItems: 'center', fontSize: 12, flexShrink: 0 }}>?</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Walk-in</div>
            </div>
            {selected === null && <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {filtered.map(c => {
              const sc = SEGMENT_COLORS[c.segment];
              return (
                <div key={c.id} className={`cust-row${selected?.id === c.id ? ' selected' : ''}`} onClick={() => pick(c)}>
                  <CustomerAvatar customer={c} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{c.name}</span>
                      <span style={{ padding: '1px 6px', borderRadius: 999, fontSize: 9.5, fontFamily: 'var(--mono)', fontWeight: 600, background: sc.bg, color: sc.color }}>{c.segment}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{c.phone}</span>
                      {c.open_credit > 0 && <span className="mono" style={{ fontSize: 10, color: 'var(--bad)' }}>owes {fmt(c.open_credit)}</span>}
                    </div>
                  </div>
                  {selected?.id === c.id && <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Mobile cart bottom bar ────────────────────────────────────────────────────

function CartBottomBar({ lines, count, subtotal, onOpen }: {
  lines: CartItem[]; count: number; subtotal: number; onOpen: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="cart-bottom-bar" onClick={onOpen}>
      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', position: 'relative' }}>
        <CartIcon />
        <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 999, background: 'var(--bad)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', border: '2px solid var(--bg-2)' }}>{count}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{count} item{count !== 1 ? 's' : ''}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lines[0]?.product.name}{lines.length > 1 ? ` +${lines.length - 1}` : ''}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span className="mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{fmtShort(subtotal)}</span>
        <div style={{ height: 32, padding: '0 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 500 }}>View →</div>
      </div>
    </div>
  );
}

// ── Mobile cart sheet ─────────────────────────────────────────────────────────

function MobileCartSheet({ cart, setCart, payment, setPayment, onClose }: {
  cart: Cart; setCart: React.Dispatch<React.SetStateAction<Cart>>;
  payment: string; setPayment: (p: string) => void;
  onClose: () => void;
}) {
  const lines    = Object.values(cart);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
  const tax      = Math.round(subtotal * 0.18);
  const total    = subtotal + tax;

  const updateQty = (id: string, d: number) => setCart(c => {
    const n = { ...c }; if (!n[id]) return c;
    const next = n[id].qty + d;
    if (next <= 0) { delete n[id]; } else { n[id] = { ...n[id], qty: next }; }
    return n;
  });
  const removeLine = (id: string) => setCart(c => { const n = { ...c }; delete n[id]; return n; });

  return (
    <>
      <div className="cart-sheet-handle" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 14px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Cart ({lines.reduce((s, l) => s + l.qty, 0)})</span>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 999, border: 'none', background: 'var(--bg-3)', color: 'var(--fg-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 16 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {lines.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-4)' }}><CartIcon /></div>
        ) : lines.map((l, i) => (
          <div key={l.product.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderBottom: i < lines.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.product.name}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2 }}>{fmt(l.product.price)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line-2)', borderRadius: 7, overflow: 'hidden' }}>
              <button onClick={() => updateQty(l.product.id, -1)} style={{ width: 28, height: 28, background: 'transparent', border: 0, color: 'var(--fg-2)', cursor: 'pointer', fontSize: 14 }}>−</button>
              <span className="mono" style={{ width: 28, textAlign: 'center', fontSize: 13 }}>{l.qty}</span>
              <button onClick={() => updateQty(l.product.id, +1)} style={{ width: 28, height: 28, background: 'transparent', border: 0, color: 'var(--fg-2)', cursor: 'pointer', fontSize: 14 }}>+</button>
            </div>
            <span className="mono" style={{ minWidth: 72, textAlign: 'right', fontSize: 13 }}>{fmt(l.qty * l.product.price)}</span>
            <button onClick={() => removeLine(l.product.id)} style={{ background: 'transparent', border: 0, color: 'var(--fg-4)', cursor: 'pointer', padding: 0, fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--line)', flexShrink: 0, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[['Subtotal', fmt(subtotal)], ['VAT 18%', fmt(tax)]].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--fg-3)' }}>
            <span>{l}</span><span className="mono" style={{ color: 'var(--fg-2)' }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 6, borderTop: '1px solid var(--line)' }}>
          <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>Total</span>
          <span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{fmt(total)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 4 }}>
          {['Cash', 'M-Pesa', 'Bank', 'Credit'].map(m => (
            <button key={m} onClick={() => setPayment(m)} style={{ padding: '8px 4px', borderRadius: 7, fontSize: 12, fontWeight: 500, border: '1px solid ' + (payment === m ? 'var(--accent-line)' : 'var(--line)'), background: payment === m ? 'var(--accent-soft)' : 'var(--bg)', color: payment === m ? 'var(--fg)' : 'var(--fg-2)', cursor: 'pointer', transition: 'all 120ms' }}>{m}</button>
          ))}
        </div>
        <button disabled={lines.length === 0} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', padding: '12px', fontSize: 14, opacity: lines.length === 0 ? 0.4 : 1 }}>
          Pay {fmt(total)} →
        </button>
      </div>
    </>
  );
}

// ── Trial banner ──────────────────────────────────────────────────────────────

function TrialBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--line)', background: 'linear-gradient(90deg, rgba(251,191,36,0.08), transparent 60%)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <span className="pill warn page-sec" style={{ fontSize: 10 }}>TRIAL</span>
      <span className="page-sec" style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>
        Trial ends in <strong style={{ color: 'var(--fg)' }}>5 days</strong>.
      </span>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: 12 }}>Upgrade</button>
      <button onClick={onDismiss} className="icon-btn page-sec" style={{ width: 24, height: 24, fontSize: 16 }}>×</button>
    </div>
  );
}

// ── Products sticky header ────────────────────────────────────────────────────

function ProductsSticky({ query, setQuery, cat, setCat, categories, resultCount, totalCount, inputRef, cartCount, cartSubtotal, onOpenCart }: {
  query: string; setQuery: (q: string) => void;
  cat: string;   setCat:   (c: string) => void;
  categories: Category[];
  resultCount: number; totalCount: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  cartCount: number; cartSubtotal: number;
  onOpenCart: () => void;
}) {
  return (
    <div className="products-sticky">
      <div className="products-sticky-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>Point of sale</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="pill" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="dot-s" style={{ background: 'var(--good)' }} />online
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{totalCount} products</span>
          <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>Open drawer</button>
          <Link href="/transactions" className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12, textDecoration: 'none' }}>Recent sales</Link>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div className="pos-search" style={{ flex: 1 }}>
          <span style={{ color: 'var(--fg-4)' }}>{Icons.search}</span>
          <input ref={inputRef} placeholder="Search or scan…" value={query} onChange={e => setQuery(e.target.value)} />
          {query && <span className="mono page-sec" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{resultCount}</span>}
          <span className="kbd page-sec">/</span>
        </div>
        <button className="btn btn-soft" style={{ height: 40, padding: '0 11px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <BarcodeIcon /><span className="page-sec">Scan</span>
        </button>
        <button className="btn btn-soft pos-hide-mobile" style={{ height: 40, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.plus} Custom
        </button>
        <button className="pos-mobile-only" onClick={onOpenCart} style={{ position: 'relative', width: 40, height: 40, flexShrink: 0, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CartIcon />
          {cartCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 999, background: 'var(--bad)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', border: '2px solid var(--bg)' }}>{cartCount}</span>}
        </button>
      </div>
      {/* Category pills — only show categories that have products */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        <button className={'cat-pill' + (cat === 'all' ? ' active' : '')} onClick={() => setCat('all')}>
          All<span className="count">{totalCount}</span>
        </button>
        {categories.filter(c => c.count > 0).map(c => (
          <button key={c.id} className={'cat-pill' + (cat === c.name ? ' active' : '')} onClick={() => setCat(c.name)}>
            {c.name}<span className="count">{c.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Product grid ──────────────────────────────────────────────────────────────

function ProductGrid({ items, cartMap, onAdd, loading }: { items: POSProduct[]; cartMap: Record<string, number>; onAdd: (p: POSProduct) => void; loading: boolean }) {
  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--fg-4)' }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--fg-3)' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em' }}>NO MATCHES</div>
      </div>
    );
  }
  return (
    <div className="product-grid">
      {items.map(p => {
        const qty     = cartMap[p.id] || 0;
        const scheme  = COLOR_SCHEMES[p.color] || COLOR_SCHEMES.indigo;
        const imgUrl  = p.image_url;
        const isOut   = p.stock_status === 'out';
        const isLow   = p.stock_status === 'low' || p.stock_status === 'critical';
        return (
          <div key={p.id} className={'product-card' + (qty ? ' added' : '') + (isOut ? ' out' : '')} onClick={() => !isOut && onAdd(p)} style={{ opacity: isOut ? 0.5 : 1, cursor: isOut ? 'not-allowed' : 'pointer' }}>
            <div className="product-thumb" style={{ background: imgUrl ? 'transparent' : scheme.bg, color: scheme.fg, borderColor: 'transparent', overflow: 'hidden' }}>
              {imgUrl ? <img src={imgUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : p.name[0]}
              {qty > 0 && <span className="qty-pill">{qty}</span>}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <span className="mono" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>{fmt(p.price)}</span>
              {isOut
                ? <span className="pill bad" style={{ fontSize: 10 }}>Out</span>
                : isLow
                  ? <span className="pill warn" style={{ fontSize: 10 }}>{p.stock}</span>
                  : <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{p.stock}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Cart line ─────────────────────────────────────────────────────────────────

function CartLineRow({ line, onInc, onDec, onRemove }: { line: CartItem; onInc: () => void; onDec: () => void; onRemove: () => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid var(--line)' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line.product.name}</div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2 }}>{fmt(line.product.price)}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line-2)', borderRadius: 6, overflow: 'hidden' }}>
        <button onClick={onDec} style={{ width: 24, height: 24, background: 'transparent', border: 0, color: 'var(--fg-2)', cursor: 'pointer', fontSize: 13 }}>−</button>
        <span className="mono" style={{ width: 26, textAlign: 'center', fontSize: 12 }}>{line.qty}</span>
        <button onClick={onInc} style={{ width: 24, height: 24, background: 'transparent', border: 0, color: 'var(--fg-2)', cursor: 'pointer', fontSize: 13 }}>+</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 90, justifyContent: 'flex-end' }}>
        <span className="mono" style={{ fontSize: 12.5 }}>{fmt(line.qty * line.product.price)}</span>
        <button onClick={onRemove} style={{ background: 'transparent', border: 0, color: 'var(--fg-4)', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1 }}>×</button>
      </div>
    </div>
  );
}

// ── Cart panel ────────────────────────────────────────────────────────────────

function CartPanel({ cart, setCart, payment, setPayment, discount, setDiscount, isOpen, onClose, selectedCustomer, onOpenCustomerPicker, onCompleteSale, completing }: {
  cart: Cart; setCart: React.Dispatch<React.SetStateAction<Cart>>;
  payment: string; setPayment: (p: string) => void;
  discount: number; setDiscount: (d: number) => void;
  isOpen?: boolean; onClose?: () => void;
  selectedCustomer: POSCustomer | null;
  onOpenCustomerPicker: () => void;
  onCompleteSale: () => void;
  completing: boolean;
}) {
  const lines       = Object.values(cart);
  const subtotal    = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
  const discountAmt = Math.min(discount, subtotal);
  const discountPct = subtotal > 0 && discountAmt > 0 ? (discountAmt / subtotal * 100).toFixed(1) : null;
  const taxable     = subtotal - discountAmt;
  const tax         = Math.round(taxable * 0.18);
  const total       = taxable + tax;

  const updateQty = (id: string, d: number) => setCart(c => {
    const n = { ...c }; if (!n[id]) return c;
    const next = n[id].qty + d;
    if (next <= 0) { delete n[id]; } else { n[id] = { ...n[id], qty: next }; }
    return n;
  });
  const removeLine = (id: string) => setCart(c => { const n = { ...c }; delete n[id]; return n; });

  return (
    <aside className={'cart' + (isOpen ? ' cart-open' : '')}>
      <div className="cart-grip" />

      {/* Header */}
      <div className="cart-hd" style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onClose && <button className="icon-btn cart-close-btn" onClick={onClose} style={{ width: 28, height: 28, fontSize: 18 }}>←</button>}
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Current sale</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2 }}>
              {lines.reduce((s, l) => s + l.qty, 0)} items
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="icon-btn" title="Hold" style={{ width: 28, height: 28 }}><PauseIcon /></button>
          {lines.length > 0 && <button className="icon-btn" onClick={() => setCart({})} style={{ width: 28, height: 28 }}><TrashIcon /></button>}
        </div>
      </div>

      {/* Customer chip */}
      <div className="cart-customer" style={{ padding: '10px 18px', borderBottom: '1px solid var(--line)' }}>
        {selectedCustomer ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', border: '1px solid var(--accent-line)', borderRadius: 7, background: 'var(--accent-soft)', cursor: 'pointer' }} onClick={onOpenCustomerPicker}>
            <CustomerAvatar customer={selectedCustomer} size={26} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedCustomer.name}</span>
                <span style={{ padding: '1px 5px', borderRadius: 999, fontSize: 9, flexShrink: 0, fontFamily: 'var(--mono)', fontWeight: 700, background: SEGMENT_COLORS[selectedCustomer.segment]?.bg, color: SEGMENT_COLORS[selectedCustomer.segment]?.color }}>{selectedCustomer.segment}</span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 1 }}>{selectedCustomer.phone}</div>
            </div>
            {selectedCustomer.open_credit > 0 && <span className="mono" style={{ fontSize: 9.5, color: 'var(--bad)', flexShrink: 0 }}>owes {fmtShort(selectedCustomer.open_credit)}</span>}
          </div>
        ) : (
          <button onClick={onOpenCustomerPicker} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px dashed var(--line-2)', borderRadius: 6, background: 'transparent', color: 'var(--fg-2)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--bg-3)', color: 'var(--fg-3)', display: 'grid', placeItems: 'center', fontSize: 12, flexShrink: 0 }}>+</span>
            <span>Add customer</span>
            <span className="pill" style={{ marginLeft: 'auto', fontSize: 10, background: 'var(--bg-3)', color: 'var(--fg-4)' }}>walk-in</span>
          </button>
        )}
      </div>

      {/* Lines */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {lines.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-4)' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 14px', borderRadius: 14, background: 'var(--bg-3)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center' }}>
              <CartIcon />
            </div>
          </div>
        ) : (
          lines.map(l => (
            <CartLineRow key={l.product.id} line={l}
              onInc={() => updateQty(l.product.id, +1)}
              onDec={() => updateQty(l.product.id, -1)}
              onRemove={() => removeLine(l.product.id)}
            />
          ))
        )}
      </div>

      {/* Totals */}
      {lines.length > 0 && (
        <>
          <div className="cart-totals-section" style={{ padding: '12px 18px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--fg-2)' }}>
              <span>Subtotal</span>
              <span className="mono" style={{ color: 'var(--fg)' }}>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--fg-2)' }}>
              <span>Discount</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${discountAmt > 0 ? 'var(--accent-line)' : 'var(--line-2)'}`, borderRadius: 6, overflow: 'hidden', background: discountAmt > 0 ? 'var(--accent-soft)' : 'var(--bg)' }}>
                  <span style={{ paddingLeft: 6, fontFamily: 'var(--mono)', fontSize: 11, color: discountAmt > 0 ? 'var(--accent)' : 'var(--fg-4)' }}>TZS</span>
                  <input type="number" min={0} value={discount === 0 ? '' : discount} placeholder="0" onChange={e => setDiscount(Math.max(0, Number(e.target.value) || 0))} style={{ width: 68, padding: '3px 6px', border: 0, outline: 0, background: 'transparent', color: discountAmt > 0 ? 'var(--accent)' : 'var(--fg)', fontFamily: 'var(--mono)', fontSize: 12.5, textAlign: 'right' }} />
                </div>
                {discountAmt > 0 && (
                  <>
                    {discountPct && <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{discountPct}%</span>}
                    <button onClick={() => setDiscount(0)} style={{ width: 18, height: 18, borderRadius: 4, border: 0, background: 'var(--bg-3)', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 11, display: 'grid', placeItems: 'center' }}>×</button>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--fg-2)' }}>
              <span>VAT 18%</span>
              <span className="mono" style={{ color: 'var(--fg-3)' }}>{fmt(tax)}</span>
            </div>
          </div>
          <div className="cart-net-section" style={{ padding: '14px 18px', borderTop: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', background: 'var(--bg-3)' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Total</span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{fmt(total)}</span>
          </div>
        </>
      )}

      {/* Payment + CTA */}
      <div className="cart-payment-section" style={{ padding: '14px 18px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>PAYMENT</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {['Cash', 'M-Pesa', 'Bank', 'Credit'].map(m => (
              <button key={m} onClick={() => setPayment(m)} style={{ padding: '8px 6px', borderRadius: 6, border: '1px solid ' + (payment === m ? 'var(--accent-line)' : 'var(--line)'), background: payment === m ? 'var(--accent-soft)' : 'var(--bg)', color: payment === m ? 'var(--fg)' : 'var(--fg-2)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 120ms' }}>{m}</button>
            ))}
          </div>
        </div>
        <button
          disabled={lines.length === 0 || completing}
          onClick={onCompleteSale}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', padding: '13px 12px', fontSize: 15, fontWeight: 600, opacity: (lines.length === 0 || completing) ? 0.4 : 1, cursor: (lines.length === 0 || completing) ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em' }}
        >
          {completing ? 'Processing…' : lines.length > 0 ? `Pay ${fmt(total)}` : 'Pay'}
        </button>
      </div>
    </aside>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function POSPage() {
  const [query,     setQuery]     = useState('');
  const [cat,       setCat]       = useState('all');
  const [cart,      setCart]      = useState<Cart>({});
  const [payment,   setPayment]   = useState('Cash');
  const [discount,  setDiscount]  = useState(0);
  const [trial,     setTrial]     = useState(true);
  const [cartOpen,  setCartOpen]  = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<POSCustomer | null>(null);
  const [custPickerOpen,   setCustPickerOpen]   = useState(false);
  const [completing, setCompleting] = useState(false);
  const [saleError,  setSaleError]  = useState('');
  const [completedTxn, setCompletedTxn] = useState<CompletedTransaction | null>(null);

  // Live data from API
  const [products,   setProducts]   = useState<POSProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const searchRef = useRef<HTMLInputElement>(null);

  // Load products and categories on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingProducts(true);

    Promise.all([
      inventoryApi.getPOSProducts(),
      inventoryApi.getCategories(),
    ]).then(([prodRes, catRes]) => {
      if (cancelled) return;
      if (prodRes.success)  setProducts(prodRes.data);
      if (catRes.success)   setCategories(catRes.data);
      setLoadingProducts(false);
    }).catch(() => {
      if (!cancelled) setLoadingProducts(false);
    });

    return () => { cancelled = true; };
  }, []);

  // '/' focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault(); searchRef.current?.focus();
      }
      if (e.key === 'Escape') searchRef.current?.blur();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(p =>
      (cat === 'all' || p.category_name === cat) &&
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q))
    );
  }, [query, cat, products]);

  const cartMap    = useMemo(() => { const m: Record<string, number> = {}; for (const id in cart) m[id] = cart[id].qty; return m; }, [cart]);
  const cartCount  = useMemo(() => Object.values(cart).reduce((s, l) => s + l.qty, 0), [cart]);
  const cartSubtotal = useMemo(() => Object.values(cart).reduce((s, l) => s + l.qty * l.product.price, 0), [cart]);

  const addProduct = (p: POSProduct) => {
    setCart(c => ({ ...c, [p.id]: { product: p, qty: (c[p.id]?.qty || 0) + 1 } }));
  };

  // ── Complete sale ──────────────────────────────────────────────────────────
  async function handleCompleteSale() {
    const lines = Object.values(cart);
    if (lines.length === 0) return;
    setSaleError('');
    setCompleting(true);

    const subtotal    = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
    const discountAmt = Math.min(discount, subtotal);
    const discountPct = subtotal > 0 ? parseFloat((discountAmt / subtotal * 100).toFixed(2)) : 0;

    const res = await transactionApi.completeSale({
      items: lines.map(l => ({ product_id: l.product.id, qty: l.qty })),
      payment_method: payment,
      discount_pct: Math.min(discountPct, 50),
      till_number: 'Till #1',
      customer_id: selectedCustomer?.id ?? null,
    });

    setCompleting(false);

    if (res.success) {
      setCompletedTxn(res.data);
    } else {
      setSaleError(res.message || 'Sale failed. Please try again.');
    }
  }

  function handleNewSale() {
    setCart({});
    setDiscount(0);
    setPayment('Cash');
    setSelectedCustomer(null);
    setCompletedTxn(null);
    setSaleError('');
  }

  const cartLines = Object.values(cart);

  return (
    <AppShell
      full
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Point of sale' }]}
      actions={<Link href="/transactions" className="btn btn-soft page-sec" style={{ padding: '7px 12px', fontSize: 13, textDecoration: 'none' }}>Recent sales</Link>}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {trial && <TrialBanner onDismiss={() => setTrial(false)} />}

      {saleError && (
        <div style={{ padding: '8px 16px', background: 'rgba(251,113,133,0.12)', borderBottom: '1px solid rgba(251,113,133,0.2)', color: 'var(--bad)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {saleError}
          <button onClick={() => setSaleError('')} style={{ background: 'transparent', border: 0, color: 'var(--bad)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      <div className="pos">
        <div className="products">
          <ProductsSticky
            query={query} setQuery={setQuery}
            cat={cat}     setCat={setCat}
            categories={categories}
            resultCount={items.length}
            totalCount={products.length}
            inputRef={searchRef}
            cartCount={cartCount}
            cartSubtotal={cartSubtotal}
            onOpenCart={() => setCartOpen(true)}
          />
          <div className="products-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ProductGrid items={items} cartMap={cartMap} onAdd={addProduct} loading={loadingProducts} />
          </div>
        </div>

        <CartPanel
          cart={cart}     setCart={setCart}
          payment={payment} setPayment={setPayment}
          discount={discount} setDiscount={setDiscount}
          isOpen={cartOpen} onClose={() => setCartOpen(false)}
          selectedCustomer={selectedCustomer}
          onOpenCustomerPicker={() => setCustPickerOpen(true)}
          onCompleteSale={handleCompleteSale}
          completing={completing}
        />
      </div>

      <CartBottomBar lines={cartLines} count={cartCount} subtotal={cartSubtotal} onOpen={() => setCartOpen(true)} />

      <div className={'cart-sheet-backdrop' + (cartOpen ? ' open' : '')} onClick={() => setCartOpen(false)} />
      <div className={'cart-sheet' + (cartOpen ? ' open' : '')}>
        <MobileCartSheet cart={cart} setCart={setCart} payment={payment} setPayment={setPayment} onClose={() => setCartOpen(false)} />
      </div>

      {custPickerOpen && (
        <CustomerPickerModal selected={selectedCustomer} onSelect={setSelectedCustomer} onClose={() => setCustPickerOpen(false)} />
      )}

      {completedTxn && <ReceiptModal txn={completedTxn} onNewSale={handleNewSale} />}
    </AppShell>
  );
}
