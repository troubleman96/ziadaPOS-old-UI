'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtDate } from '../../../lib/utils';

// ── Mock discount detail data ──────────────────────────────────────────────────

interface DiscountLine {
  name: string;
  sku: string;
  qty: number;
  unit_price: number;
  discount_pct: number;
  discounted_price: number;
}

interface DiscountDetail {
  id: string;
  txn_number: string;
  date: string;
  time: string;
  cashier: string;
  till: string;
  customer_name: string;
  customer_phone: string | null;
  customer_segment: string | null;
  payment_method: string;
  lines: DiscountLine[];
  subtotal_before: number;
  discount_pct: number;
  discount_amount: number;
  taxable: number;
  tax: number;
  total: number;
  note: string;
  approved_by: string | null;
}

const MOCK_DISCOUNTS: Record<string, DiscountDetail> = {
  'TXN-2041': {
    id: 'TXN-2041', txn_number: 'TXN-2041',
    date: '2026-05-24', time: '14:32',
    cashier: 'Amina Hassan', till: 'Till #2',
    customer_name: 'Juma Kifupi', customer_phone: '+255 754 992 110', customer_segment: 'VIP',
    payment_method: 'M-Pesa',
    lines: [
      { name: 'Unga wa Sembe 10kg',   sku: 'UNGA-001', qty: 4, unit_price: 28500, discount_pct: 10, discounted_price: 25650 },
      { name: 'Mafuta ya Cooking 5L', sku: 'OIL-003',  qty: 2, unit_price: 34000, discount_pct: 10, discounted_price: 30600 },
      { name: 'Sukari 2kg',           sku: 'SUG-004',  qty: 6, unit_price: 7000,  discount_pct: 10, discounted_price: 6300  },
    ],
    subtotal_before: 256500, discount_pct: 10, discount_amount: 28500,
    taxable: 228000, tax: 41040, total: 256500,
    note: 'Bulk purchase discount — VIP customer',
    approved_by: 'Juma Kipanga (Manager)',
  },
  'TXN-2036': {
    id: 'TXN-2036', txn_number: 'TXN-2036',
    date: '2026-05-23', time: '11:15',
    cashier: 'Juma Kipanga', till: 'Till #1',
    customer_name: 'Asha Mwinyi', customer_phone: '+255 718 003 982', customer_segment: 'Regular',
    payment_method: 'Cash',
    lines: [
      { name: 'Mchele Pishori 5kg', sku: 'RIC-006', qty: 3, unit_price: 22000, discount_pct: 15, discounted_price: 18700 },
      { name: 'Chai Bora 500g',     sku: 'TEA-005', qty: 5, unit_price: 4800,  discount_pct: 15, discounted_price: 4080  },
    ],
    subtotal_before: 90000, discount_pct: 15, discount_amount: 22000,
    taxable: 68000, tax: 12240, total: 124800,
    note: 'Loyal customer — recurring weekly buyer',
    approved_by: null,
  },
  'TXN-2031': {
    id: 'TXN-2031', txn_number: 'TXN-2031',
    date: '2026-05-22', time: '09:48',
    cashier: 'Fatuma Ally', till: 'Till #3',
    customer_name: 'Walk-in', customer_phone: null, customer_segment: null,
    payment_method: 'Cash',
    lines: [
      { name: 'Sabuni ya OMO 1kg',   sku: 'SAB-002', qty: 10, unit_price: 6200,  discount_pct: 5, discounted_price: 5890  },
      { name: 'Bar Soap Imperial',   sku: 'BSL-017', qty: 20, unit_price: 950,   discount_pct: 5, discounted_price: 902   },
      { name: 'Toothpaste Colgate',  sku: 'COS-018', qty: 12, unit_price: 3500,  discount_pct: 5, discounted_price: 3325  },
    ],
    subtotal_before: 109400, discount_pct: 5, discount_amount: 18200,
    taxable: 328000, tax: 59040, total: 346200,
    note: 'Bulk negotiated at point of sale',
    approved_by: 'Hamisi M. (Supervisor)',
  },
};

// Segment badge colors
function SegmentBadge({ segment }: { segment: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    VIP:        { bg: 'rgba(251,191,36,0.12)',  color: 'var(--warn)' },
    Regular:    { bg: 'rgba(16,185,129,0.10)',  color: 'var(--good)' },
    Occasional: { bg: 'rgba(99,102,241,0.10)',  color: '#a5a8ff'     },
    New:        { bg: 'rgba(34,211,238,0.10)',  color: 'var(--info)' },
  };
  const c = colors[segment] ?? { bg: 'var(--bg-3)', color: 'var(--fg-3)' };
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 999, fontSize: 11,
      fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: '0.05em',
      background: c.bg, color: c.color,
    }}>{segment}</span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DiscountDetailPage() {
  const params = useParams();
  const id     = decodeURIComponent(String(params.id ?? ''));
  const d      = MOCK_DISCOUNTS[id];

  if (!d) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Discounts', href: '/discounts' }, { label: id }]}>
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--fg-3)' }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', marginBottom: 8 }}>NOT FOUND</div>
          <div style={{ fontSize: 15 }}>No discount record found for <strong>{id}</strong></div>
          <Link href="/discounts" style={{ display: 'inline-block', marginTop: 16, color: 'var(--accent)', fontSize: 13 }}>
            ← Back to discounts
          </Link>
        </div>
      </AppShell>
    );
  }

  const savedAmt   = d.discount_amount;
  const revenueImpactColor = d.discount_pct >= 15 ? 'var(--bad)' : d.discount_pct >= 10 ? 'var(--warn)' : 'var(--good)';

  return (
    <AppShell
      crumbs={[
        { label: 'ziada', href: '/' },
        { label: 'Duka Kuu', href: '/' },
        { label: 'Discounts', href: '/discounts' },
        { label: d.txn_number },
      ]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.download} Export PDF
          </button>
          <Link href="/discounts" className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }}>
            ← All discounts
          </Link>
        </div>
      }
    >
      {/* Back link */}
      <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--fg-3)' }}>
        <Link href="/discounts" style={{ color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>{Icons.chevRight}</span>
          Back to discounts
        </Link>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em' }}>
              {d.txn_number}
            </h1>
            <span className="pill warn" style={{ fontSize: 11 }}>{d.discount_pct}% off</span>
          </div>
          <div className="mono" style={{ fontSize: 11.5, color: 'var(--fg-4)' }}>
            {d.date} · {d.time} &nbsp;·&nbsp; {d.cashier} &nbsp;·&nbsp; {d.till}
          </div>
        </div>

        {/* Hero saving amount */}
        <div style={{
          padding: '12px 20px', borderRadius: 10,
          background: `${revenueImpactColor}0d`,
          border: `1px solid ${revenueImpactColor}30`,
          textAlign: 'right',
        }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.07em', marginBottom: 3 }}>DISCOUNT GIVEN</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: revenueImpactColor, letterSpacing: '-0.02em' }}>
            −{fmt(savedAmt)}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{d.discount_pct}% off sale</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>

        {/* LEFT — line items + totals */}
        <div>
          {/* Line items */}
          <div className="surface" style={{ marginBottom: 14, overflow: 'hidden' }}>
            <div className="card-head">
              <span className="card-title">Items sold</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{d.lines.length} line{d.lines.length !== 1 ? 's' : ''}</span>
            </div>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th style={{ width: 60 }} className="num">QTY</th>
                  <th style={{ width: 110 }} className="num">ORIG PRICE</th>
                  <th style={{ width: 90 }} className="num">DISC</th>
                  <th style={{ width: 110 }} className="num">FINAL PRICE</th>
                  <th style={{ width: 110 }} className="num">LINE TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {d.lines.map((l, i) => {
                  const saving = (l.unit_price - l.discounted_price) * l.qty;
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{l.name}</div>
                        <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 1 }}>{l.sku}</div>
                      </td>
                      <td className="num">{l.qty}</td>
                      <td className="num">
                        <span className="mono" style={{ color: 'var(--fg-3)', textDecoration: 'line-through', fontSize: 12 }}>
                          {fmt(l.unit_price)}
                        </span>
                      </td>
                      <td className="num">
                        <span className="pill warn" style={{ fontSize: 10 }}>{l.discount_pct}%</span>
                      </td>
                      <td className="num">
                        <span className="mono" style={{ color: 'var(--good)', fontWeight: 500 }}>
                          {fmt(l.discounted_price)}
                        </span>
                      </td>
                      <td className="num">
                        <div className="mono" style={{ fontWeight: 500 }}>{fmt(l.discounted_price * l.qty)}</div>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--bad)', marginTop: 1 }}>−{fmt(saving)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals breakdown */}
          <div className="surface" style={{ overflow: 'hidden' }}>
            <div className="card-head"><span className="card-title">Sale breakdown</span></div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Subtotal (before discount)', value: fmt(d.subtotal_before), style: {} },
                { label: `Discount applied (${d.discount_pct}%)`, value: `−${fmt(d.discount_amount)}`, style: { color: 'var(--bad)' } },
                { label: 'After discount', value: fmt(d.taxable), style: {} },
                { label: 'VAT 18%', value: fmt(d.tax), style: { color: 'var(--fg-3)' } },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--fg-2)' }}>
                  <span>{row.label}</span>
                  <span className="mono" style={{ fontWeight: 500, ...row.style }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                <span>Net total collected</span>
                <span className="mono" style={{ color: 'var(--accent)', letterSpacing: '-0.01em' }}>{fmt(d.total)}</span>
              </div>
            </div>

            {/* Revenue impact highlight */}
            <div style={{
              margin: '0 14px 14px',
              padding: '10px 14px', borderRadius: 8,
              background: `${revenueImpactColor}08`,
              border: `1px solid ${revenueImpactColor}25`,
              display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: 999, background: revenueImpactColor, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: revenueImpactColor, marginBottom: 2 }}>
                  Revenue impact: −{fmt(d.discount_amount)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.45 }}>
                  This sale would have generated{' '}
                  <strong style={{ color: 'var(--fg-2)' }}>{fmt(d.subtotal_before + d.tax)}</strong>{' '}
                  at full price. The discount cost{' '}
                  <strong style={{ color: revenueImpactColor }}>{fmt(d.discount_amount)}</strong>{' '}
                  in gross margin.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — meta cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Customer card */}
          <div className="surface">
            <div className="card-head"><span className="card-title">Customer</span></div>
            <div style={{ padding: '14px 16px' }}>
              {d.customer_name === 'Walk-in' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--bg-3)', color: 'var(--fg-3)', display: 'grid', placeItems: 'center', fontSize: 14 }}>?</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>Walk-in customer</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-4)', marginTop: 1 }}>No profile registered</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 999,
                      background: 'linear-gradient(135deg,hsl(240,60%,50%),hsl(280,60%,50%))',
                      color: '#fff', display: 'grid', placeItems: 'center',
                      fontSize: 14, fontWeight: 600,
                    }}>
                      {d.customer_name.split(' ').map(p => p[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{d.customer_name}</span>
                        {d.customer_segment && <SegmentBadge segment={d.customer_segment} />}
                      </div>
                      {d.customer_phone && (
                        <div className="mono" style={{ fontSize: 11.5, color: 'var(--fg-4)', marginTop: 1 }}>
                          {d.customer_phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href="/customers" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    View customer profile {Icons.chevRight}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Discount info card */}
          <div className="surface">
            <div className="card-head"><span className="card-title">Discount details</span></div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Discount type',  value: 'Manual (POS)' },
                { label: 'Amount',         value: `−${fmt(d.discount_amount)}` },
                { label: 'Percentage',     value: `${d.discount_pct}%` },
                { label: 'Given by',       value: d.cashier },
                { label: 'Approved by',    value: d.approved_by ?? 'Self-approved' },
                { label: 'Payment method', value: d.payment_method },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, gap: 8 }}>
                  <span style={{ color: 'var(--fg-3)' }}>{row.label}</span>
                  <span style={{ fontWeight: 500, color: 'var(--fg)', textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>
            {d.note && (
              <div style={{ padding: '0 16px 14px' }}>
                <div style={{
                  padding: '10px 12px', borderRadius: 7,
                  background: 'var(--bg-3)', border: '1px solid var(--line)',
                }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em', marginBottom: 4 }}>NOTE</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>{d.note}</div>
                </div>
              </div>
            )}
          </div>

          {/* Transaction metadata */}
          <div className="surface">
            <div className="card-head"><span className="card-title">Transaction</span></div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Transaction ID', value: d.txn_number },
                { label: 'Date',           value: `${d.date} at ${d.time}` },
                { label: 'Cashier',        value: d.cashier },
                { label: 'Till',           value: d.till },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, gap: 8 }}>
                  <span style={{ color: 'var(--fg-3)' }}>{row.label}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--fg)', textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 14px 14px' }}>
              <Link
                href={`/transactions/${d.txn_number}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '8px 12px', borderRadius: 7,
                  border: '1px solid var(--line-2)', background: 'var(--bg)',
                  color: 'var(--fg-2)', fontSize: 12.5, textDecoration: 'none',
                  transition: 'background 120ms',
                }}
              >
                View full transaction {Icons.chevRight}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
