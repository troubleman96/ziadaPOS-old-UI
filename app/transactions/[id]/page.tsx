'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtTime, fmtDate, fmtDT } from '../../../lib/utils';
import { transactionApi, customerApi, aiApi, TransactionDetail, CustomerListItem } from '../../../lib/api';
import { openReceiptPrintWindow } from '../../../lib/reportPdf';

const SPINNER = (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
  </>
);

function StatusBig({ status, creditInfo }: { status: string; creditInfo?: { tab_status: string; balance: number } | null }) {
  if (status === 'paid' && creditInfo?.tab_status === 'partially_paid')
    return <span className="pill warn" style={{ fontSize: 11.5, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}><span className="dot-s" style={{ background: 'var(--warn)' }}></span> Partially paid</span>;
  if (status === 'paid')     return <span className="pill good"   style={{ fontSize: 11.5, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}><span className="dot-s" style={{ background: 'var(--good)' }}></span> Paid in full</span>;
  if (status === 'credit' && creditInfo?.tab_status === 'partially_paid')
    return <span className="pill warn" style={{ fontSize: 11.5, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}><span className="dot-s" style={{ background: 'var(--warn)' }}></span> Partially paid</span>;
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
  const [bg, letter] = map[method] || ['#64748b', method?.[0] || 'C'];
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

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, tone = 'good', onDismiss }: { message: string; tone?: 'good' | 'bad'; onDismiss: () => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 300, background: 'var(--bg-2)', border: `1px solid var(--${tone})`, borderRadius: 10, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', maxWidth: '90vw' }}>
      <span style={{ color: `var(--${tone})`, fontSize: 16 }}>{tone === 'good' ? '✓' : '⚠'}</span>
      <span style={{ fontSize: 13.5 }}>{message}</span>
      <button onClick={onDismiss} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', fontSize: 18, padding: 0, lineHeight: 1 }}>×</button>
    </div>
  );
}

const modalInputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 7, border: '1px solid var(--line)',
  background: 'var(--bg-3)', color: 'var(--fg)', fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
};

// ── Refund Modal ────────────────────────────────────────────────────────────
function RefundModal({ open, onClose, onConfirm, saving }: { open: boolean; onClose: () => void; onConfirm: (reason: string) => void; saving: boolean }) {
  const [reason, setReason] = useState('');
  useEffect(() => { if (open) setReason(''); }, [open]);
  if (!open) return null;
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()} style={{ width: 380 }}>
        <div className="drawer-head">
          <span style={{ fontWeight: 500 }}>Refund this sale</span>
          <button className="icon-btn" onClick={onClose}>{Icons.close}</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '10px 12px', borderRadius: 7, background: 'var(--warn-soft)', border: '1px solid rgba(251,191,36,0.3)', fontSize: 12.5, color: 'var(--warn)' }}>
            This marks the sale as refunded and returns all items to stock. This cannot be undone.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Reason (optional)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Customer changed mind, wrong item, etc." style={{ ...modalInputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-soft" onClick={() => onConfirm(reason)} disabled={saving} style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', color: 'var(--bad)' }}>
              {saving ? 'Refunding…' : 'Confirm refund'}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Attach Customer Modal ─────────────────────────────────────────────────────
function AttachCustomerModal({ open, transactionId, onClose, onSuccess }: { open: boolean; transactionId: string; onClose: () => void; onSuccess: (t: TransactionDetail, msg: string) => void }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<CustomerListItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [attaching, setAttaching] = useState<string | null>(null);

  useEffect(() => { if (open) { setSearch(''); setResults([]); } }, [open]);
  useEffect(() => {
    if (!open || !search.trim()) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(() => {
      customerApi.getList(`search=${encodeURIComponent(search.trim())}`).then((res) => {
        setSearching(false);
        if (res.success) setResults(res.data.slice(0, 8));
      });
    }, 300);
    return () => clearTimeout(t);
  }, [search, open]);

  async function pick(c: CustomerListItem) {
    setAttaching(c.id);
    const res = await transactionApi.attachCustomer(transactionId, c.id);
    setAttaching(null);
    if (res.success) {
      onSuccess(res.data, `${c.name} added to this sale.`);
      onClose();
    }
  }

  if (!open) return null;
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()} style={{ width: 380 }}>
        <div className="drawer-head">
          <span style={{ fontWeight: 500 }}>Add customer to this sale</span>
          <button className="icon-btn" onClick={onClose}>{Icons.close}</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone…" style={modalInputStyle} autoFocus />
          {searching && <div style={{ fontSize: 11.5, color: 'var(--fg-4)' }}>Searching…</div>}
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => pick(c)}
              disabled={!!attaching}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg-3)', cursor: 'pointer', color: 'var(--fg)', fontFamily: 'inherit' }}
            >
              <div>
                <div style={{ fontSize: 13 }}>{c.name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{c.phone}</div>
              </div>
              {attaching === c.id && <span style={{ fontSize: 11 }}>Adding…</span>}
            </button>
          ))}
          {!searching && search.trim() && results.length === 0 && (
            <div style={{ fontSize: 11.5, color: 'var(--fg-4)' }}>
              No matches. <Link href="/customers/new" style={{ color: 'var(--accent)' }}>Add a new customer</Link> first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Email Receipt Modal ────────────────────────────────────────────────────────
function EmailReceiptModal({ open, onClose, onSend, sending }: { open: boolean; onClose: () => void; onSend: (email: string) => void; sending: boolean }) {
  const [email, setEmail] = useState('');
  useEffect(() => { if (open) setEmail(''); }, [open]);
  if (!open) return null;
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()} style={{ width: 360 }}>
        <div className="drawer-head">
          <span style={{ fontWeight: 500 }}>Email receipt</span>
          <button className="icon-btn" onClick={onClose}>{Icons.close}</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@email.com" style={modalInputStyle} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={() => onSend(email)} disabled={sending || !email.trim()} style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
              {sending ? 'Sending…' : 'Send receipt'}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [t, setT] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [refundOpen, setRefundOpen] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [asking, setAsking] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'good' | 'bad' } | null>(null);

  function notify(msg: string, tone: 'good' | 'bad' = 'good') {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    setLoading(true);
    transactionApi.getDetail(id).then((res) => {
      setLoading(false);
      if (res.success) {
        setT(res.data);
      } else {
        setError(true);
      }
    });
  }, [id]);

  function handlePrint() {
    if (!t) return;
    openReceiptPrintWindow(t);
  }

  function handleWhatsApp() {
    if (!t) return;
    const lines = t.lines.map(l => `${l.qty}x ${l.product_name} - ${fmt(l.line_total)}`).join('\n');
    const message = `Receipt ${t.txn_number}\n${fmtDT(new Date(t.created_at))}\n\n${lines}\n\nTOTAL: ${fmt(t.total)}\nPaid via ${t.payment_method}\n\nAsante sana!`;
    const phone = (t.customer_phone || '').replace(/[^\d]/g, '');
    const url = `https://wa.me/${phone.startsWith('255') ? phone : phone ? '255' + phone.replace(/^0/, '') : ''}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  async function handleRefund(reason: string) {
    setRefunding(true);
    const res = await transactionApi.refund(id, reason);
    setRefunding(false);
    setRefundOpen(false);
    if (res.success) {
      setT(res.data);
      notify('Sale refunded and stock restored.');
    } else {
      notify(res.message || 'Refund failed.', 'bad');
    }
  }

  async function handleAskAi() {
    if (!t) return;
    setAsking(true);
    const lines = t.lines.map(l => `${l.qty}x ${l.product_name}`).join(', ');
    const message = `Tell me about transaction ${t.txn_number}: ${fmt(t.total)} total, items: ${lines}, paid via ${t.payment_method}, customer: ${t.customer_name}. Anything notable about this sale — pricing, margin, or follow-up worth flagging?`;
    const res = await aiApi.startChat(message);
    setAsking(false);
    if (res.success) router.push('/ai');
    else notify(res.message || 'Could not reach Ziada AI.', 'bad');
  }

  async function handleEmailReceipt(email: string) {
    setEmailSending(true);
    const res = await transactionApi.emailReceipt(id, email);
    setEmailSending(false);
    if (res.success) {
      notify(`Receipt sent to ${email}.`);
      setEmailOpen(false);
    } else {
      notify(res.message || 'Could not send email.', 'bad');
    }
  }

  if (loading) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Transactions', href: '/transactions' }, { label: '…' }]}>
        <div style={{ padding: 80, textAlign: 'center' }}>{SPINNER}</div>
      </AppShell>
    );
  }

  if (error || !t) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Transactions', href: '/transactions' }, { label: 'Not found' }]}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Transaction not found</div>
          <p style={{ color: 'var(--fg-3)', marginBottom: 24 }}>No transaction with this ID could be found.</p>
          <Link href="/transactions" className="btn btn-primary">← Back to transactions</Link>
        </div>
      </AppShell>
    );
  }

  const ts = new Date(t.created_at);
  const timeline = [
    { ts: new Date(ts.getTime() - 4 * 60000), label: 'Sale started', who: t.cashier_name, muted: true },
    { ts: new Date(ts.getTime() - 30000), label: `${t.lines.length} item${t.lines.length > 1 ? 's' : ''} added`, who: t.cashier_name, muted: true },
    { ts, label: t.status === 'paid' ? `Paid via ${t.payment_method}` : t.status === 'credit' ? 'Added to credit tab' : 'Sale completed', who: t.cashier_name, muted: false },
    ...(t.payment_reference ? [{ ts, label: `Payment confirmation · ref ${t.payment_reference}`, who: 'system', muted: true }] : []),
    { ts: new Date(ts.getTime() + 5000), label: 'Receipt printed', who: t.cashier_name, muted: true },
    ...(t.status === 'refunded' ? [
      { ts: new Date(ts.getTime() + 3600 * 1000), label: 'Refund processed · full amount returned', who: t.cashier_name, muted: false, bad: true },
    ] : []),
  ];

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Transactions', href: '/transactions' }, { label: t.txn_number }]}
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
                <span className="mono" style={{ color: 'var(--accent)' }}>{t.txn_number}</span>
              </h1>
              <StatusBig status={t.status} creditInfo={t.credit_info} />
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--fg-2)' }}>
              {fmtDT(ts)}
              <span className="mono" style={{ color: 'var(--fg-4)', margin: '0 8px' }}>·</span>
              {t.customer_name}
              <span className="mono" style={{ color: 'var(--fg-4)', margin: '0 8px' }}>·</span>
              {t.cashier_name}
              <span className="mono" style={{ color: 'var(--fg-4)', margin: '0 8px' }}>·</span>
              {t.till_number}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={handlePrint}><PrintIcon /> Print receipt</button>
            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={handleWhatsApp}><WhatsAppIcon /> Send via WhatsApp</button>
            {t.status !== 'refunded' && <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => setRefundOpen(true)}><RefundIcon /> Refund sale</button>}
            <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={handleAskAi} disabled={asking}>{Icons.sparkles} {asking ? 'Asking…' : 'Ask AI about this'}</button>
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
                    <td>{l.product_name}</td>
                    <td className="mono" style={{ color: 'var(--fg-3)' }}>{l.product_sku}</td>
                    <td className="num" style={{ color: 'var(--fg-2)' }}>{fmt(l.unit_price)}</td>
                    <td className="num" style={{ color: 'var(--fg-2)' }}>× {l.qty}</td>
                    <td className="num" style={{ color: 'var(--fg)', fontWeight: 500 }}>{fmt(l.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
              <div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <TotalRow label="Subtotal" v={fmt(t.subtotal)} />
                {t.discount_amount > 0 && <TotalRow label={`Discount (${t.discount_pct}%)`} v={'− ' + fmt(t.discount_amount)} color="var(--fg-3)" />}
                <TotalRow label="VAT (18%)" v={fmt(t.tax_amount)} color="var(--fg-3)" />
                <div style={{ height: 1, background: 'var(--line-2)', margin: '4px 0' }}></div>
                <TotalRow label="Net total" v={fmt(t.total)} bold accent />
                <TotalRow label="Cost of goods" v={'− ' + fmt(t.cost_total)} color="var(--fg-4)" small />
                <TotalRow label="Gross profit" v={fmt(t.profit)} color="var(--good)" small />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">Payment</span></div>
            <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center' }}>
              <MethodBadge method={t.payment_method} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--fg)' }}>
                  {t.payment_method === 'M-Pesa'    && 'Vodacom M-Pesa · Lipa namba 7438201'}
                  {t.payment_method === 'Tigo Pesa'  && 'Tigo Pesa · 7438201'}
                  {t.payment_method === 'Cash'       && 'Cash · counted at till'}
                  {t.payment_method === 'Bank'       && 'NMB Bank POS terminal'}
                  {t.payment_method === 'Credit'     && `Added to ${t.customer_name}'s credit tab`}
                  {!['M-Pesa','Tigo Pesa','Cash','Bank','Credit'].includes(t.payment_method) && t.payment_method}
                </div>
                {t.payment_reference && (
                  <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 3 }}>
                    Reference: <span style={{ color: 'var(--fg-2)' }}>{t.payment_reference}</span>
                  </div>
                )}
              </div>
              <span className="mono" style={{ fontSize: 16, fontWeight: 500, color: 'var(--fg)' }}>{fmt(t.total)}</span>
            </div>
          </div>

          {/* Credit balance — shown for credit transactions that have a credit_info */}
          {t.credit_info && (
            <div className="surface" style={{ marginBottom: 14, borderTop: '3px solid var(--warn)' }}>
              <div className="card-head">
                <span className="card-title">Credit balance</span>
                <Link href={`/credits/${t.customer}`} className="mono" style={{ fontSize: 11, color: 'var(--accent)' }}>
                  View credit profile →
                </Link>
              </div>
              <div style={{ padding: '14px 16px' }}>
                {/* Balance bar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--fg-3)', marginBottom: 6 }}>
                    <span>Paid</span>
                    <span>Outstanding</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: t.credit_info.amount > 0 ? (t.credit_info.amount_paid / t.credit_info.amount * 100) + '%' : '0%',
                      background: t.credit_info.balance === 0 ? 'var(--good)' : 'var(--warn)',
                      borderRadius: 3,
                      transition: 'width 0.4s',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
                    <span className="mono" style={{ color: 'var(--good)' }}>{fmt(t.credit_info.amount_paid)}</span>
                    <span className="mono" style={{ color: t.credit_info.balance > 0 ? 'var(--warn)' : 'var(--fg-4)', fontWeight: t.credit_info.balance > 0 ? 600 : 400 }}>
                      {t.credit_info.balance > 0 ? fmt(t.credit_info.balance) + ' owed' : 'Settled ✓'}
                    </span>
                  </div>
                </div>

                {/* Status + due date */}
                <div style={{ display: 'flex', gap: 8, marginBottom: t.credit_info.payments.length > 0 ? 12 : 0, flexWrap: 'wrap' }}>
                  <span className={'pill ' + (t.credit_info.tab_status === 'settled' ? 'good' : t.credit_info.is_overdue ? 'bad' : 'warn')}>
                    {t.credit_info.tab_status === 'open' ? 'Open' :
                     t.credit_info.tab_status === 'partially_paid' ? 'Partially paid' :
                     t.credit_info.tab_status === 'settled' ? 'Settled' : t.credit_info.tab_status}
                  </span>
                  {t.credit_info.due_date && (
                    <span className="mono" style={{ fontSize: 11, color: t.credit_info.is_overdue ? 'var(--bad)' : 'var(--fg-3)', alignSelf: 'center' }}>
                      {t.credit_info.is_overdue ? 'Overdue · ' : 'Due '}
                      {new Date(t.credit_info.due_date).toLocaleDateString('en-TZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Payment history */}
                {t.credit_info.payments.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em', marginBottom: 8 }}>PAYMENTS RECEIVED</div>
                    {t.credit_info.payments.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < t.credit_info!.payments.length - 1 ? '1px solid var(--line)' : 0, fontSize: 12.5 }}>
                        <div>
                          <span style={{ color: 'var(--fg)' }}>{p.method}</span>
                          {p.reference && <span className="mono" style={{ color: 'var(--fg-4)', fontSize: 11, marginLeft: 6 }}>· {p.reference}</span>}
                          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2 }}>
                            {new Date(p.created_at).toLocaleString('en-TZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}
                          </div>
                        </div>
                        <span className="mono" style={{ color: 'var(--good)', fontWeight: 500 }}>+{fmt(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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
                Gross profit <span style={{ color: 'var(--good)' }}>{fmt(t.profit)}</span> ({t.total > 0 ? (t.profit/t.total*100).toFixed(1) : '0'}%)
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head">
              <span className="card-title">Customer</span>
              {t.customer && <Link href={`/customers/${t.customer}`} className="mono" style={{ fontSize: 11, color: 'var(--accent)' }}>View profile →</Link>}
            </div>
            <div style={{ padding: '14px 16px' }}>
              {t.customer_name === 'Walk-in' || !t.customer_name ? (
                <div style={{ color: 'var(--fg-3)', fontSize: 13 }}>
                  Walk-in customer (no profile attached).
                  <button className="btn btn-ghost" style={{ marginTop: 10, padding: '5px 10px', fontSize: 12 }} onClick={() => setAttachOpen(true)}>+ Add customer to this sale</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg, var(--accent), #a855f7)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>
                      {t.customer_name.split(' ').map((s: string) => s[0]).slice(0,2).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{t.customer_name}</div>
                      {t.customer_phone && <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>{t.customer_phone}</div>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sale details */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">Sale details</span></div>
            <div style={{ padding: '14px 16px' }}>
              <div className="field-row"><span className="k">Register</span><span className="v">{t.till_number}</span></div>
              <div className="field-row"><span className="k">Cashier</span><span className="v">{t.cashier_name}</span></div>
              <div className="field-row"><span className="k">Date</span><span className="v mono">{fmtDate(ts)}</span></div>
              <div className="field-row"><span className="k">Time</span><span className="v mono">{fmtTime(ts)}</span></div>
              <div className="field-row"><span className="k">Channel</span><span className="v">{t.channel || 'Counter'}</span></div>
            </div>
          </div>

          {/* Receipt preview */}
          <div className="surface">
            <div className="card-head"><span className="card-title">Receipt</span></div>
            <div style={{ padding: 16 }}>
              <div style={{ background: 'var(--bg)', border: '1px dashed var(--line-2)', borderRadius: 6, padding: '14px 16px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.7 }}>
                <div style={{ textAlign: 'center', color: 'var(--fg)', fontWeight: 500 }}>{t.store_name}</div>
                {t.store_address && <div style={{ textAlign: 'center', color: 'var(--fg-4)' }}>{t.store_address}</div>}
                <div style={{ borderTop: '1px dashed var(--line-2)', margin: '8px 0', color: 'var(--fg-3)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t.txn_number}</span><span>{fmtTime(ts)}</span></div>
                <div style={{ borderTop: '1px dashed var(--line-2)', margin: '8px 0' }}></div>
                {t.lines.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.qty}× {l.product_name}</span>
                    <span>{fmt(l.line_total).replace('TZS ', '')}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px dashed var(--line-2)', margin: '8px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fg)', fontWeight: 500 }}>
                  <span>TOTAL</span><span>{fmt(t.total).replace('TZS ', '')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--fg-3)' }}>
                  <span>{t.payment_method}</span><span>{fmt(t.total).replace('TZS ', '')}</span>
                </div>
                <div style={{ borderTop: '1px dashed var(--line-2)', margin: '8px 0' }}></div>
                <div style={{ textAlign: 'center', color: 'var(--fg-4)' }}>asante sana · come again</div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }} onClick={handlePrint}>{Icons.download} PDF</button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '6px 10px', fontSize: 12 }} onClick={() => setEmailOpen(true)}>Email</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RefundModal open={refundOpen} onClose={() => setRefundOpen(false)} onConfirm={handleRefund} saving={refunding} />
      <AttachCustomerModal
        open={attachOpen}
        transactionId={id}
        onClose={() => setAttachOpen(false)}
        onSuccess={(updated, msg) => { setT(updated); notify(msg); }}
      />
      <EmailReceiptModal open={emailOpen} onClose={() => setEmailOpen(false)} onSend={handleEmailReceipt} sending={emailSending} />
      {toast && <Toast message={toast.msg} tone={toast.tone} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
