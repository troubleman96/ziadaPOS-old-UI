'use client';

import React from 'react';
import Link from 'next/link';
import { use } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtTime, fmtDate, fmtDT } from '../../../lib/utils';
import { TRANSACTIONS } from '../../../lib/data';

function StatusBig({ status }: { status: string }) {
  if (status === 'paid')     return <span className="pill good"   style={{ fontSize: 11.5, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}><span className="dot-s" style={{ background: 'var(--good)' }}></span> Paid in full</span>;
  if (status === 'credit')   return <span className="pill warn"   style={{ fontSize: 11.5, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}><span className="dot-s" style={{ background: 'var(--warn)' }}></span> Outstanding credit</span>;
  if (status === 'refunded') return <span className="pill bad"    style={{ fontSize: 11.5, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}><span className="dot-s" style={{ background: 'var(--bad)'  }}></span> Refunded</span>;
  return <span className="pill">{status}</span>;
}

function MethodBadge({ method }: { method: string }) {
  const map: Record<string, [string, string]> = {
    Cash:      ['#64748b', 'C'],
    'M-Pesa':  ['#10b981', 'M'],
    'Tigo Pesa':['#f59e0b','T'],
    Bank:      ['#60a5fa', 'B'],
    Credit:    ['var(--accent)', 'C'],
  };
  const [bg, letter] = map[method] || ['#64748b', 'C'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 11px 5px 6px', border: '1px solid var(--line)', borderRadius: 999, fontSize: 12.5 }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, background: bg, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)' }}>{letter}</span>
      <span>{method}</span>
    </span>
  );
}

function TotalRow({ label, v, bold, accent, color, small }: { label: string; v: string; bold?: boolean; accent?: boolean; color?: string; small?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: small ? 11.5 : 13, color: color || 'var(--fg-2)' }}>
      <span style={{ fontWeight: bold ? 500 : 400 }}>{label}</span>
      <span className="mono" style={{ fontWeight: bold ? 600 : 400, color: accent ? 'var(--accent)' : (color || 'var(--fg)'), fontSize: bold ? 16 : (small ? 11.5 : 13) }}>{v}</span>
    </div>
  );
}

const PrintIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><rect x="4" y="2" width="8" height="4"/><rect x="2.5" y="6" width="11" height="6" rx="1"/><rect x="4" y="10" width="8" height="4"/></g></svg>;
const WhatsAppIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 14l1-3a6 6 0 1 1 2.5 2.5L2 14z"/></g></svg>;
const RefundIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9a5 5 0 1 0 1.5-3.5"/><path d="M3 3v3h3"/></g></svg>;

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const t = TRANSACTIONS.find((x) => x.id === id) || TRANSACTIONS[0];
  const idx = TRANSACTIONS.findIndex((x) => x.id === t.id);
  const prev = TRANSACTIONS[idx + 1];
  const next = TRANSACTIONS[idx - 1];

  const timeline = [
    { ts: new Date(t.ts.getTime() - 4 * 60000), label: 'Sale started', who: t.cashier, muted: true },
    { ts: new Date(t.ts.getTime() - 30000), label: `${t.lines.length} item${t.lines.length > 1 ? 's' : ''} added`, who: t.cashier, muted: true },
    { ts: t.ts, label: t.status === 'paid' ? `Paid via ${t.method}` : t.status === 'credit' ? 'Added to credit tab' : 'Sale completed', who: t.cashier, muted: false },
    ...(t.reference ? [{ ts: t.ts, label: `M-Pesa confirmation received · ref ${t.reference}`, who: 'system', muted: true }] : []),
    { ts: new Date(t.ts.getTime() + 5000), label: 'Receipt printed', who: t.cashier, muted: true },
    ...(t.status === 'refunded' ? [
      { ts: new Date(t.ts.getTime() + 3600 * 1000), label: 'Refund processed · full amount returned', who: t.cashier, muted: false, bad: true },
    ] : []),
  ];

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Transactions', href: '/transactions' }, { label: t.id }]}
      actions={
        <div style={{ display: 'flex', gap: 6 }}>
          {prev && <Link href={`/transactions/${prev.id}`} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>← Prev</Link>}
          {next && <Link href={`/transactions/${next.id}`} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>Next →</Link>}
        </div>
      }
    >
      {/* Back + header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg-3)', fontSize: 13, marginBottom: 10 }}>
          <Link href="/transactions" style={{ color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>{Icons.chevRight}</span>
            Back to transactions
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>
                <span className="mono" style={{ color: 'var(--accent)' }}>{t.id}</span>
              </h1>
              <StatusBig status={t.status} />
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--fg-2)' }}>
              {fmtDT(t.ts)}
              <span className="mono" style={{ color: 'var(--fg-4)', margin: '0 8px' }}>·</span>
              {t.customer.name}
              <span className="mono" style={{ color: 'var(--fg-4)', margin: '0 8px' }}>·</span>
              {t.cashier}
              <span className="mono" style={{ color: 'var(--fg-4)', margin: '0 8px' }}>·</span>
              {t.till}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><PrintIcon /> Print receipt</button>
            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><WhatsAppIcon /> Send via WhatsApp</button>
            {t.status !== 'refunded' && <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><RefundIcon /> Refund sale</button>}
            <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.sparkles} Ask AI about this</button>
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Line items */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head">
              <span className="card-title">Line items · {t.lines.length} SKU · {t.lines.reduce((s, l) => s + l.qty, 0)} units</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>VAT 18% included</span>
            </div>
            <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 26 }}>#</th>
                  <th>PRODUCT</th>
                  <th style={{ width: 110 }}>SKU</th>
                  <th style={{ width: 90, textAlign: 'right' }} className="num">UNIT</th>
                  <th style={{ width: 64, textAlign: 'right' }} className="num">QTY</th>
                  <th style={{ width: 120, textAlign: 'right' }} className="num">LINE TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {t.lines.map((l, i) => (
                  <tr key={i} style={{ cursor: 'default' }}>
                    <td className="mono" style={{ color: 'var(--fg-4)' }}>{String(i+1).padStart(2,'0')}</td>
                    <td>{l.name}</td>
                    <td className="mono" style={{ color: 'var(--fg-3)' }}>{l.sku}</td>
                    <td className="num" style={{ color: 'var(--fg-2)' }}>{fmt(l.price)}</td>
                    <td className="num" style={{ color: 'var(--fg-2)' }}>× {l.qty}</td>
                    <td className="num" style={{ color: 'var(--fg)', fontWeight: 500 }}>{fmt(l.price * l.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
              <div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <TotalRow label="Subtotal" v={fmt(t.subtotal)} />
                {t.discount > 0 && <TotalRow label={`Discount (${t.discountPct}%)`} v={'− ' + fmt(t.discount)} color="var(--fg-3)" />}
                <TotalRow label="VAT (18%)" v={fmt(t.tax)} color="var(--fg-3)" />
                <div style={{ height: 1, background: 'var(--line-2)', margin: '4px 0' }}></div>
                <TotalRow label="Net total" v={fmt(t.total)} bold accent />
                <TotalRow label="Cost of goods" v={'− ' + fmt(t.cost)} color="var(--fg-4)" small />
                <TotalRow label="Gross profit" v={fmt(t.profit)} color="var(--good)" small />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">Payment</span></div>
            <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center' }}>
              <MethodBadge method={t.method} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--fg)' }}>
                  {t.method === 'M-Pesa'   && 'Vodacom M-Pesa · Lipa namba 7438201'}
                  {t.method === 'Tigo Pesa' && 'Tigo Pesa · 7438201'}
                  {t.method === 'Cash'     && 'Cash · counted at till'}
                  {t.method === 'Bank'     && 'NMB Bank POS terminal'}
                  {t.method === 'Credit'   && `Added to ${t.customer.name}'s credit tab`}
                </div>
                {t.reference && (
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 3 }}>
                    Reference: <span style={{ color: 'var(--fg-2)' }}>{t.reference}</span>
                  </div>
                )}
              </div>
              <span className="mono" style={{ fontSize: 16, fontWeight: 500, color: 'var(--fg)' }}>{fmt(t.total)}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="surface">
            <div className="card-head"><span className="card-title">Timeline</span></div>
            <div style={{ padding: '16px 16px 16px 18px' }}>
              {timeline.map((e, i) => (
                <div key={i} className={'timeline-item' + (e.muted ? ' muted' : '') + (('bad' in e && e.bad) ? ' bad' : '')}>
                  <div style={{ fontSize: 13, color: 'var(--fg)' }}>{e.label}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2 }}>
                    {fmtTime(e.ts)} · {e.who}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Summary */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">Summary</span></div>
            <div style={{ padding: '14px 16px' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>NET TOTAL</div>
              <div style={{ fontSize: 28, fontWeight: 500, color: 'var(--accent)', letterSpacing: '-0.02em', marginTop: 4 }}>{fmt(t.total)}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>
                Gross profit <span style={{ color: 'var(--good)' }}>{fmt(t.profit)}</span> ({(t.profit/t.total*100).toFixed(1)}%)
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head">
              <span className="card-title">Customer</span>
              {t.customer.id && <a href="#" className="mono" style={{ fontSize: 11, color: 'var(--accent)' }}>View profile →</a>}
            </div>
            <div style={{ padding: '14px 16px' }}>
              {t.customer.name === 'Walk-in' ? (
                <div style={{ color: 'var(--fg-3)', fontSize: 13 }}>
                  Walk-in customer (no profile attached).
                  <button className="btn btn-ghost" style={{ marginTop: 10, padding: '5px 10px', fontSize: 12 }}>+ Add customer to this sale</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg, var(--accent), #a855f7)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>
                      {t.customer.name.split(' ').map((s: string) => s[0]).slice(0,2).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{t.customer.name}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>{t.customer.phone}</div>
                    </div>
                  </div>
                  <div className="field-row"><span className="k">Customer since</span><span className="v">Mar 2024</span></div>
                  <div className="field-row"><span className="k">Total spent</span><span className="v mono">TZS 1,842,000</span></div>
                  <div className="field-row"><span className="k">Visits</span><span className="v mono">68</span></div>
                  <div className="field-row"><span className="k">Open credit</span><span className="v mono" style={{ color: 'var(--warn)' }}>TZS 38,500</span></div>
                </>
              )}
            </div>
          </div>

          {/* Sale details */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">Sale details</span></div>
            <div style={{ padding: '14px 16px' }}>
              <div className="field-row"><span className="k">Store</span><span className="v">{t.store}</span></div>
              <div className="field-row"><span className="k">Register</span><span className="v">{t.till}</span></div>
              <div className="field-row"><span className="k">Cashier</span><span className="v">{t.cashier}</span></div>
              <div className="field-row"><span className="k">Date</span><span className="v mono">{fmtDate(t.ts)}</span></div>
              <div className="field-row"><span className="k">Time</span><span className="v mono">{fmtTime(t.ts)}</span></div>
              <div className="field-row"><span className="k">Channel</span><span className="v">Counter</span></div>
            </div>
          </div>

          {/* Receipt preview */}
          <div className="surface">
            <div className="card-head"><span className="card-title">Receipt</span></div>
            <div style={{ padding: 16 }}>
              <div style={{ background: 'var(--bg)', border: '1px dashed var(--line-2)', borderRadius: 6, padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.7 }}>
                <div style={{ textAlign: 'center', color: 'var(--fg)', fontWeight: 500 }}>DUKA KUU — KARIAKOO</div>
                <div style={{ textAlign: 'center', color: 'var(--fg-4)' }}>Tin: 109-882-461</div>
                <div style={{ borderTop: '1px dashed var(--line-2)', margin: '8px 0', color: 'var(--fg-3)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t.id}</span><span>{fmtTime(t.ts)}</span></div>
                <div style={{ borderTop: '1px dashed var(--line-2)', margin: '8px 0' }}></div>
                {t.lines.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.qty}× {l.name}</span>
                    <span>{fmt(l.price * l.qty).replace('TZS ', '')}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px dashed var(--line-2)', margin: '8px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fg)', fontWeight: 500 }}>
                  <span>TOTAL</span><span>{fmt(t.total).replace('TZS ', '')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fg-3)' }}>
                  <span>{t.method}</span><span>{fmt(t.total).replace('TZS ', '')}</span>
                </div>
                <div style={{ borderTop: '1px dashed var(--line-2)', margin: '8px 0' }}></div>
                <div style={{ textAlign: 'center', color: 'var(--fg-4)' }}>asante sana · come again</div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.download} PDF</button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '6px 10px', fontSize: 12 }}>Email</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
