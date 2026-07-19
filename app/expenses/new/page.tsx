'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt } from '../../../lib/utils';
import { expenseApi } from '../../../lib/api';

const INPUT: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  border: '1px solid var(--line-2)', borderRadius: 7,
  background: 'var(--bg)', color: 'var(--fg)',
  fontSize: 13, fontFamily: 'inherit', outline: 0,
  boxSizing: 'border-box',
};

const LABEL: React.CSSProperties = {
  fontSize: 10.5, color: 'var(--fg-4)',
  letterSpacing: '0.06em', display: 'block', marginBottom: 6,
  fontFamily: 'var(--mono)',
};

const SECTION_CARD: React.CSSProperties = {
  background: 'var(--bg-2)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  overflow: 'hidden',
};

const SECTION_HEAD: React.CSSProperties = {
  padding: '12px 18px',
  borderBottom: '1px solid var(--line)',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--fg-2)',
  background: 'var(--bg-3)',
};

const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Salaries', 'Supplies', 'Transport',
  'Marketing', 'Maintenance', 'Licences & permits', 'Insurance', 'Other',
];

const PAYMENT_METHODS = ['Cash', 'M-Pesa', 'Tigo Pesa', 'Bank', 'Airtel Money'];

export default function NewExpensePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentRef, setPaymentRef] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState('');

  const filteredCats = EXPENSE_CATEGORIES.filter(c =>
    c.toLowerCase().includes(categoryQuery.toLowerCase())
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (!amount || +amount <= 0) e.amount = 'Amount must be greater than 0.';
    if (!category.trim()) e.category = 'Select a category.';
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setApiErr('');
    const res = await expenseApi.create({
      title: title.trim(),
      category: category.trim(),
      amount: +amount,
      payment_method: paymentMethod,
      ...(paymentRef.trim() && { payment_reference: paymentRef.trim() }),
      ...(notes.trim() && { notes: notes.trim() }),
    });
    setSaving(false);
    if (res.success) {
      router.push('/expenses');
    } else {
      setApiErr(res.message ?? 'Failed to save expense.');
    }
  }

  const clrErr = (field: string) => {
    if (errors[field]) setErrors(x => ({ ...x, [field]: '' }));
  };

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Expenses', href: '/expenses' }, { label: 'New expense' }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/expenses" className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 13 }}>Cancel</Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? '...' : Icons.check} Save expense
          </button>
        </div>
      }
    >
      <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--fg-3)' }}>
        <Link href="/expenses" style={{ color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>{Icons.chevRight}</span>
          Back to expenses
        </Link>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>New expense</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
          Record a new business expense.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Basic information */}
          <div style={SECTION_CARD}>
            <div style={SECTION_HEAD}>Expense details</div>
            <div style={{ padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={LABEL}>TITLE *</label>
                <input
                  value={title}
                  onChange={e => { setTitle(e.target.value); clrErr('title'); }}
                  placeholder="e.g. Monthly electricity bill"
                  style={{ ...INPUT, borderColor: errors.title ? 'var(--bad)' : 'var(--line-2)' }}
                />
                {errors.title && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.title}</div>}
              </div>
              <div>
                <label style={LABEL}>CATEGORY *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={categoryOpen ? categoryQuery : category}
                    onChange={e => { setCategoryQuery(e.target.value); setCategory(e.target.value); setCategoryOpen(true); clrErr('category'); }}
                    onFocus={() => { setCategoryOpen(true); setCategoryQuery(category); }}
                    placeholder="Select or type a category"
                    autoComplete="off"
                    style={{ ...INPUT, borderColor: errors.category ? 'var(--bad)' : 'var(--line-2)' }}
                  />
                  {categoryOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                      background: 'var(--bg-2)', border: '1.5px solid var(--accent-line)',
                      borderRadius: 8, overflow: 'hidden', zIndex: 300,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.28)', maxHeight: 240, overflowY: 'auto',
                    }}>
                      {filteredCats.map(c => (
                        <div key={c} onClick={() => { setCategory(c); setCategoryQuery(''); setCategoryOpen(false); clrErr('category'); }}
                          style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: c === category ? 'var(--accent-soft)' : 'transparent', color: c === category ? 'var(--accent)' : 'var(--fg-2)', transition: 'background 80ms' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-3)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = c === category ? 'var(--accent-soft)' : 'transparent'; }}
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.category && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.category}</div>}
              </div>
              <div>
                <label style={LABEL}>NOTES <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>- optional</span></label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Additional details about this expense..."
                  rows={3}
                  style={{ ...INPUT, resize: 'vertical', minHeight: 72 }}
                />
              </div>
            </div>
          </div>

          {/* Amount */}
          <div style={SECTION_CARD}>
            <div style={SECTION_HEAD}>Amount</div>
            <div style={{ padding: '18px 18px' }}>
              <label style={LABEL}>AMOUNT (TZS) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 500, color: 'var(--fg-3)' }}>TZS</span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); clrErr('amount'); }}
                  placeholder="0"
                  style={{ ...INPUT, fontFamily: 'var(--mono)', paddingLeft: 56, fontSize: 18, fontWeight: 500, borderColor: errors.amount ? 'var(--bad)' : 'var(--line-2)' }}
                />
              </div>
              {errors.amount && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 4 }}>{errors.amount}</div>}
              {amount && +amount > 0 && (
                <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 7, background: 'var(--bg-3)', fontSize: 12.5, color: 'var(--fg-2)' }}>
                  Expense amount: <strong className="mono">{fmt(+amount)}</strong>
                </div>
              )}
            </div>
          </div>

          {apiErr && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.25)', color: 'var(--bad)', fontSize: 12.5 }}>
              {apiErr}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Payment */}
          <div style={SECTION_CARD}>
            <div style={SECTION_HEAD}>Payment method</div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PAYMENT_METHODS.map(m => (
                <label key={m} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  border: `1px solid ${paymentMethod === m ? 'var(--accent-line)' : 'var(--line)'}`,
                  borderRadius: 7, cursor: 'pointer',
                  background: paymentMethod === m ? 'var(--accent-soft)' : 'transparent',
                  transition: 'background 100ms, border-color 100ms',
                }}>
                  <input type="radio" name="payment-method" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)}
                    style={{ accentColor: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13 }}>{m}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div style={SECTION_CARD}>
            <div style={SECTION_HEAD}>Payment reference</div>
            <div style={{ padding: '14px 16px' }}>
              <label style={LABEL}>REFERENCE <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>- optional</span></label>
              <input
                value={paymentRef}
                onChange={e => setPaymentRef(e.target.value)}
                placeholder="e.g. M-Pesa receipt number"
                style={{ ...INPUT, fontFamily: 'var(--mono)' }}
              />
            </div>
          </div>

          {/* Summary card */}
          <div style={{ ...SECTION_CARD, borderColor: 'var(--accent-line)', background: 'var(--accent-soft)' }}>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ color: 'var(--accent)' }}>{Icons.sparkles}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>Quick summary</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: 'var(--fg-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Title</span>
                  <span className="mono" style={{ color: 'var(--fg)' }}>{title || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Category</span>
                  <span className="mono" style={{ color: 'var(--fg)' }}>{category || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Method</span>
                  <span className="mono" style={{ color: 'var(--fg)' }}>{paymentMethod}</span>
                </div>
                <div style={{ height: 1, background: 'var(--accent-line)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Amount</span>
                  <span className="mono" style={{ color: 'var(--bad)', fontWeight: 600, fontSize: 14 }}>-{amount ? fmt(+amount) : 'TZS 0'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
