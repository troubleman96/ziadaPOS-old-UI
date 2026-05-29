'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';

// ── Data ──────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',       label: 'All',       count: 142 },
  { id: 'grocery',   label: 'Grocery',   count: 48  },
  { id: 'household', label: 'Household', count: 26  },
  { id: 'beverage',  label: 'Beverage',  count: 22  },
  { id: 'cosmetics', label: 'Cosmetics', count: 18  },
  { id: 'bakery',    label: 'Bakery',    count: 14  },
  { id: 'snacks',    label: 'Snacks',    count: 14  },
];

interface Product { id: string; name: string; price: number; stock: number; cat: string; sku: string; color: string; }
interface CartItem { product: Product; qty: number; }
type Cart = Record<string, CartItem>;

const PRODUCTS: Product[] = [
  { id: 'p1',  name: 'Unga wa Sembe 10kg',   price: 28500, stock: 42,  cat: 'grocery',   sku: 'UWS-10',  color: 'indigo'  },
  { id: 'p2',  name: 'Sabuni ya OMO 1kg',    price: 6200,  stock: 3,   cat: 'household', sku: 'SAB-1',   color: 'amber'   },
  { id: 'p3',  name: 'Mafuta ya Cooking 5L', price: 34000, stock: 24,  cat: 'grocery',   sku: 'MFC-5',   color: 'rose'    },
  { id: 'p4',  name: 'Sukari 2kg',           price: 7000,  stock: 60,  cat: 'grocery',   sku: 'SUK-2',   color: 'lime'    },
  { id: 'p5',  name: 'Chai Bora 500g',       price: 4800,  stock: 5,   cat: 'beverage',  sku: 'CHB-500', color: 'emerald' },
  { id: 'p6',  name: 'Mchele Pishori 5kg',   price: 22000, stock: 33,  cat: 'grocery',   sku: 'MCP-5',   color: 'violet'  },
  { id: 'p7',  name: 'Lotion Nivea 400ml',   price: 12500, stock: 18,  cat: 'cosmetics', sku: 'LNV-400', color: 'cyan'    },
  { id: 'p8',  name: 'Soda Coca-Cola 500ml', price: 1500,  stock: 120, cat: 'beverage',  sku: 'COK-500', color: 'rose'    },
  { id: 'p9',  name: 'Mkate Bumi 600g',      price: 2200,  stock: 22,  cat: 'bakery',    sku: 'MKB-600', color: 'amber'   },
  { id: 'p10', name: 'Sabuni ya Geisha',     price: 1200,  stock: 88,  cat: 'household', sku: 'GSH-100', color: 'lime'    },
  { id: 'p11', name: 'Mafuta Cooking 1L',    price: 8500,  stock: 12,  cat: 'grocery',   sku: 'MFC-1',   color: 'rose'    },
  { id: 'p12', name: 'Maziwa Fresh 500ml',   price: 1800,  stock: 46,  cat: 'beverage',  sku: 'MZW-500', color: 'cyan'    },
  { id: 'p13', name: 'Biskuti ya Glucose',   price: 800,   stock: 200, cat: 'snacks',    sku: 'BIS-G',   color: 'amber'   },
  { id: 'p14', name: 'Yogurt 250ml',         price: 2500,  stock: 30,  cat: 'beverage',  sku: 'YOG-250', color: 'violet'  },
  { id: 'p15', name: 'Mafuta Blue Band 1kg', price: 9500,  stock: 14,  cat: 'grocery',   sku: 'BLB-1',   color: 'amber'   },
  { id: 'p16', name: 'Choco Cake 500g',      price: 4500,  stock: 8,   cat: 'bakery',    sku: 'CKE-500', color: 'rose'    },
  { id: 'p17', name: 'Bar Soap Imperial',    price: 950,   stock: 110, cat: 'household', sku: 'BSL-IM',  color: 'emerald' },
  { id: 'p18', name: 'Toothpaste Colgate',   price: 3500,  stock: 28,  cat: 'cosmetics', sku: 'TPC-100', color: 'cyan'    },
];

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
        <path d="M9 3v10" /><path d="M11 3v10" /><path d="M13 3v10" /><path d="M14.5 3v10" />
      </g>
    </svg>
  );
}
const PauseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5"><path d="M6 4v8M10 4v8" /></g></svg>
);
const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5L11 4" /></g></svg>
);
const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h2l2.5 10h11L21 8H6" /><circle cx="9" cy="19" r="1.3" /><circle cx="17" cy="19" r="1.3" /></g></svg>
);

// ── Trial banner ──────────────────────────────────────────────────────────────
function TrialBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div style={{
      padding: '8px 14px', borderBottom: '1px solid var(--line)',
      background: 'linear-gradient(90deg, rgba(251,191,36,0.08), transparent 60%)',
      display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
    }}>
      {/* Desktop: full text */}
      <span className="pill warn page-sec" style={{ fontSize: 10 }}>TRIAL</span>
      <span className="page-sec" style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>
        Your free trial ends in <strong style={{ color: 'var(--fg)' }}>5 days</strong>. All Pro features included.
      </span>
      {/* Mobile: compact label */}
      <span className="mono pos-mobile-only" style={{ fontSize: 11.5, color: 'var(--fg-2)', fontWeight: 500 }}>
        Trial: <strong style={{ color: 'var(--fg)' }}>5 days left.</strong>
      </span>
      <div style={{ flex: 1 }} />
      <a href="#" className="mono page-sec" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Compare plans</a>
      <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: 12 }}>Upgrade</button>
      <button onClick={onDismiss} className="icon-btn page-sec" style={{ width: 24, height: 24, fontSize: 16 }} title="Dismiss">×</button>
    </div>
  );
}

// ── Products sticky header ────────────────────────────────────────────────────
function ProductsSticky({ query, setQuery, cat, setCat, resultCount, inputRef, cartCount, cartSubtotal, onOpenCart }: {
  query: string; setQuery: (q: string) => void;
  cat: string;   setCat:   (c: string) => void;
  resultCount: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
}) {
  return (
    <div className="products-sticky">
      {/* Title row — hidden on mobile (topbar already shows the page name) */}
      <div className="products-sticky-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>Point of sale</h1>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-4)', marginTop: 2, letterSpacing: '0.04em' }}>
            REGISTER · TILL #2 · HAMISI M.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="pill" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="dot-s" style={{ background: 'var(--good)' }} />
            online · syncing
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>18 of {PRODUCTS.length}/</span>
          <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>Open drawer</button>
          <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>Recent sales</button>
        </div>
      </div>

      {/* Search row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div className="pos-search" style={{ flex: 1 }}>
          <span style={{ color: 'var(--fg-4)' }}>{Icons.search}</span>
          <input
            ref={inputRef}
            placeholder="Search or scan…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="mono page-sec" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>
            {resultCount} of {PRODUCTS.length}
          </span>
          <span className="kbd page-sec">/</span>
        </div>
        <button className="btn btn-soft" style={{ height: 40, padding: '0 11px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <BarcodeIcon /><span className="page-sec">Scan</span>
        </button>
        <button className="btn btn-soft pos-hide-mobile" style={{ height: 40, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.plus} Custom
        </button>
        {/* Mobile-only cart trigger — expands to show total + count when items in cart */}
        <button
          className="pos-mobile-only"
          onClick={onOpenCart}
          style={{
            position: 'relative', height: 40, flexShrink: 0,
            padding: cartCount > 0 ? '0 12px 0 10px' : '0',
            width: cartCount > 0 ? 'auto' : 40, minWidth: 40,
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            alignItems: 'center', gap: 8,
            transition: 'all 150ms ease',
          }}
          title="View cart"
        >
          <CartIcon />
          {cartCount > 0 && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 600, lineHeight: 1, textAlign: 'left' }}>
              {fmtShort(cartSubtotal)}
              <div style={{ fontSize: 8.5, opacity: 0.85, fontWeight: 500, marginTop: 1 }}>
                {cartCount} item{cartCount !== 1 ? 's' : ''}
              </div>
            </span>
          )}
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: -5,
              minWidth: 18, height: 18, padding: '0 4px',
              borderRadius: 999, background: 'var(--bad)', color: '#fff',
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
              display: 'grid', placeItems: 'center',
              border: '2px solid var(--bg)',
            }}>{cartCount}</span>
          )}
        </button>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={'cat-pill' + (cat === c.id ? ' active' : '')} onClick={() => setCat(c.id)}>
            {c.label}<span className="count">{c.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Product grid ──────────────────────────────────────────────────────────────
function ProductGrid({ items, cartMap, onAdd }: { items: Product[]; cartMap: Record<string, number>; onAdd: (p: Product) => void }) {
  if (items.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--fg-3)' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em' }}>NO MATCHES</div>
        <div style={{ marginTop: 6, fontSize: 14 }}>Try a different search or category.</div>
      </div>
    );
  }
  return (
    <div className="product-grid">
      {items.map((p) => {
        const qty = cartMap[p.id] || 0;
        const scheme = COLOR_SCHEMES[p.color] || COLOR_SCHEMES.indigo;
        const stockKind = p.stock <= 5 ? 'bad' : p.stock <= 15 ? 'warn' : null;
        return (
          <div key={p.id} className={'product-card' + (qty ? ' added' : '')} onClick={() => onAdd(p)}>
            <div className="product-thumb" style={{ background: scheme.bg, color: scheme.fg, borderColor: 'transparent' }}>
              {p.name[0]}
              {qty > 0 && <span className="qty-pill">{qty}</span>}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 2 }}>{p.sku}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <span className="mono" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>{fmt(p.price)}</span>
              {stockKind
                ? <span className={'pill ' + stockKind} style={{ fontSize: 10 }}>{p.stock} left</span>
                : <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{p.stock} in stock</span>}
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
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2 }}>
          {fmt(line.product.price)} ea · {line.product.sku}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line-2)', borderRadius: 6, overflow: 'hidden' }}>
        <button onClick={onDec} style={{ width: 24, height: 24, background: 'transparent', border: 0, color: 'var(--fg-2)', cursor: 'pointer', fontSize: 13 }}>−</button>
        <span className="mono" style={{ width: 26, textAlign: 'center', fontSize: 12 }}>{line.qty}</span>
        <button onClick={onInc} style={{ width: 24, height: 24, background: 'transparent', border: 0, color: 'var(--fg-2)', cursor: 'pointer', fontSize: 13 }}>+</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 90, justifyContent: 'flex-end' }}>
        <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg)' }}>{fmt(line.qty * line.product.price)}</span>
        <button onClick={onRemove} style={{ background: 'transparent', border: 0, color: 'var(--fg-4)', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1 }} title="Remove">×</button>
      </div>
    </div>
  );
}

// ── Cart panel ────────────────────────────────────────────────────────────────
function CartPanel({ cart, setCart, payment, setPayment, discount, setDiscount, isOpen, onClose }: {
  cart: Cart; setCart: React.Dispatch<React.SetStateAction<Cart>>;
  payment: string; setPayment: (p: string) => void;
  discount: number; setDiscount: (d: number) => void;
  isOpen?: boolean; onClose?: () => void;
}) {
  const lines     = Object.values(cart);
  const subtotal  = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
  const discountAmt = Math.round(subtotal * discount / 100);
  const taxable   = subtotal - discountAmt;
  const tax       = Math.round(taxable * 0.18);
  const total     = taxable + tax;

  const updateQty = (id: string, d: number) => {
    setCart((c) => {
      const n = { ...c };
      if (!n[id]) return c;
      const next = n[id].qty + d;
      if (next <= 0) { delete n[id]; }
      else { n[id] = { ...n[id], qty: next }; }
      return n;
    });
  };
  const removeLine = (id: string) => setCart((c) => { const n = { ...c }; delete n[id]; return n; });

  return (
    <aside className={'cart' + (isOpen ? ' cart-open' : '')}>
      {/* Grip handle — visible only on mobile as a drag affordance */}
      <div className="cart-grip" />
      {/* Header */}
      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onClose && (
            <button className="icon-btn cart-close-btn" onClick={onClose} style={{ width: 28, height: 28, fontSize: 18 }} title="Back">←</button>
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Current sale</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2, letterSpacing: '0.04em' }}>
              SALE #TXN-2043 · {lines.reduce((s, l) => s + l.qty, 0)} items
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="icon-btn" title="Hold sale" style={{ width: 28, height: 28 }}><PauseIcon /></button>
          {lines.length > 0 && (
            <button className="icon-btn" title="Clear cart" onClick={() => setCart({})} style={{ width: 28, height: 28 }}><TrashIcon /></button>
          )}
        </div>
      </div>

      {/* Customer chip */}
      <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--line)' }}>
        <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px dashed var(--line-2)', borderRadius: 6, background: 'transparent', color: 'var(--fg-2)', fontSize: 12.5, cursor: 'pointer' }}>
          <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--bg-3)', color: 'var(--fg-3)', display: 'grid', placeItems: 'center', fontSize: 12 }}>+</span>
          <span>Add customer</span>
          <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--fg-4)' }}>walk-in</span>
        </button>
      </div>

      {/* Lines */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {lines.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-3)' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 14px', borderRadius: 14, background: 'var(--bg-3)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--fg-4)' }}>
              <CartIcon />
            </div>
            <div style={{ fontSize: 14, color: 'var(--fg-2)', fontWeight: 500 }}>No items yet</div>
            <div style={{ fontSize: 12.5, marginTop: 4 }}>Tap a product or scan a barcode to add.</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 16, letterSpacing: '0.05em' }}>
              TIP — PRESS <span className="kbd">/</span> TO SEARCH
            </div>
          </div>
        ) : (
          lines.map((l) => (
            <CartLineRow
              key={l.product.id} line={l}
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
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--fg-2)' }}>
              <span>Subtotal</span>
              <span className="mono" style={{ color: 'var(--fg)' }}>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--fg-2)' }}>
              <span>Discount</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button className="icon-btn" style={{ width: 22, height: 22, fontSize: 11 }} onClick={() => setDiscount(Math.max(0, discount - 5))}>−</button>
                <span className="mono" style={{ minWidth: 36, textAlign: 'center', color: discount > 0 ? 'var(--accent)' : 'var(--fg-3)' }}>{discount}%</span>
                <button className="icon-btn" style={{ width: 22, height: 22, fontSize: 11 }} onClick={() => setDiscount(Math.min(50, discount + 5))}>+</button>
                <span className="mono" style={{ minWidth: 80, textAlign: 'right', color: 'var(--fg-3)' }}>−{fmt(discountAmt)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--fg-2)' }}>
              <span>VAT (18%)</span>
              <span className="mono" style={{ color: 'var(--fg-3)' }}>{fmt(tax)}</span>
            </div>
          </div>
          <div style={{ padding: '14px 18px', borderTop: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', background: 'var(--bg-3)' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Net total</span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{fmt(total)}</span>
          </div>
        </>
      )}

      {/* Payment + CTA */}
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>PAYMENT METHOD</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {['Cash', 'M-Pesa', 'Bank', 'Credit'].map((m) => (
              <button key={m} onClick={() => setPayment(m)} style={{
                padding: '8px 6px', borderRadius: 6,
                border: '1px solid ' + (payment === m ? 'var(--accent-line)' : 'var(--line)'),
                background: payment === m ? 'var(--accent-soft)' : 'var(--bg)',
                color: payment === m ? 'var(--fg)' : 'var(--fg-2)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 120ms',
              }}>{m}</button>
            ))}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 8 }}>
            {payment === 'Cash'   && 'Open drawer · count back change'}
            {payment === 'M-Pesa' && 'Prompt phone: ****1234 · Lipa namba 7438201'}
            {payment === 'Bank'   && 'POS terminal · NMB · Hold card to reader'}
            {payment === 'Credit' && 'Add to customer tab · requires customer'}
          </div>
        </div>
        <button
          disabled={lines.length === 0}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', padding: '11px 12px', fontSize: 13.5, opacity: lines.length === 0 ? 0.4 : 1, cursor: lines.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          Complete sale <span className="mono" style={{ marginLeft: 6, opacity: 0.9 }}>→</span>
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fg-4)' }}>
          <span className="mono" style={{ fontSize: 10 }}>F2 hold</span>
          <span className="mono" style={{ fontSize: 10 }}>F3 discount</span>
          <span className="mono" style={{ fontSize: 10 }}>⏎ pay</span>
        </div>
      </div>
    </aside>
  );
}

// ── Mobile cart preview (inline, below products) ──────────────────────────────
function MobileCartPreview({ itemCount, subtotal, onOpen }: { itemCount: number; subtotal: number; onOpen: () => void }) {
  return (
    <div className="pos-mobile-only" style={{
      flexDirection: 'column', gap: 10,
      background: 'var(--bg-2)', border: '1px solid var(--line)',
      borderRadius: 10, padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>
          Current sale{itemCount > 0 && <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)', marginLeft: 6 }}>({itemCount} items)</span>}
        </span>
        <button
          onClick={onOpen}
          style={{ fontSize: 12, color: 'var(--accent)', border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
        >
          Open cart →
        </button>
      </div>
      {itemCount === 0 ? (
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--fg-3)' }}>Tap a product to add it to the sale.</p>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Subtotal</span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{fmt(subtotal)}</span>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function POSPage() {
  const [query,    setQuery]    = useState('');
  const [cat,      setCat]      = useState('all');
  const [cart,      setCart]      = useState<Cart>({});
  const [payment,   setPayment]   = useState('Cash');
  const [discount,  setDiscount]  = useState(0);
  const [trial,     setTrial]     = useState(true);
  const [cartOpen,  setCartOpen]  = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // '/' focuses search, Escape blurs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') searchRef.current?.blur();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) =>
      (cat === 'all' || p.cat === cat) &&
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    );
  }, [query, cat]);

  const cartMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const id in cart) m[id] = cart[id].qty;
    return m;
  }, [cart]);

  const cartCount   = useMemo(() => Object.values(cart).reduce((s, l) => s + l.qty, 0), [cart]);
  const cartSubtotal = useMemo(() => Object.values(cart).reduce((s, l) => s + l.qty * l.product.price, 0), [cart]);

  const addProduct = (p: Product) => {
    setCart((c) => ({ ...c, [p.id]: { product: p, qty: (c[p.id]?.qty || 0) + 1 } }));
  };

  return (
    <AppShell
      full
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Point of sale' }]}
      actions={<button className="btn btn-soft page-sec" style={{ padding: '7px 12px', fontSize: 13 }}>Recent sales</button>}
    >
      {/* Trial banner sits in the flex column before the pos grid */}
      {trial && <TrialBanner onDismiss={() => setTrial(false)} />}

      {/* Backdrop for mobile cart drawer */}
      <div
        className={'cart-mobile-overlay' + (cartOpen ? ' visible' : '')}
        onClick={() => setCartOpen(false)}
      />

      {/* The pos grid: products (left) + cart (right), fills all remaining height */}
      <div className="pos">
        <div className="products">
          <ProductsSticky
            query={query} setQuery={setQuery}
            cat={cat}     setCat={setCat}
            resultCount={items.length}
            inputRef={searchRef}
            cartCount={cartCount}
            cartSubtotal={cartSubtotal}
            onOpenCart={() => setCartOpen(true)}
          />
          <div className="products-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ProductGrid items={items} cartMap={cartMap} onAdd={addProduct} />
            <MobileCartPreview
              itemCount={cartCount}
              subtotal={cartSubtotal}
              onOpen={() => setCartOpen(true)}
            />
          </div>
        </div>
        <CartPanel
          cart={cart}     setCart={setCart}
          payment={payment} setPayment={setPayment}
          discount={discount} setDiscount={setDiscount}
          isOpen={cartOpen} onClose={() => setCartOpen(false)}
        />
      </div>
    </AppShell>
  );
}
