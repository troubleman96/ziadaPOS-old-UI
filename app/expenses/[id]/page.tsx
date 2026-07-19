'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/app-shell';
import { Icons } from '../../../components/icons';
import { fmt, fmtDT, fmtDate } from '../../../lib/utils';
import { expenseApi, type ExpenseItem } from '../../../lib/api';

const SPINNER = (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
  </>
);

const MODAL_OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
};
const MODAL_BOX_STYLE: React.CSSProperties = {
  background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 12,
  width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden',
};
const INPUT_S: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--line-2)', borderRadius: 7,
  background: 'var(--bg)', color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit', outline: 0,
  boxSizing: 'border-box',
};
const LABEL_S: React.CSSProperties = {
  fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.06em',
  display: 'block', marginBottom: 6, fontFamily: 'var(--mono)',
};

const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Salaries', 'Supplies', 'Transport',
  'Marketing', 'Maintenance', 'Licences & permits', 'Insurance', 'Other',
];
const PAYMENT_METHODS = ['Cash', 'M-Pesa', 'Tigo Pesa', 'Bank', 'Airtel Money'];

const CATEGORY_COLORS: Record<string, string> = {
  'Rent': '#6366f1', 'Utilities': '#f59e0b', 'Salaries': '#10b981',
  'Supplies': '#3b82f6', 'Transport': '#8b5cf6', 'Marketing': '#ec4899',
  'Maintenance': '#f97316', 'Licences & permits': '#14b8a6', 'Insurance': '#06b6d4',
  'Other': '#6b7280',
};
function catColor(cat: string): string { return CATEGORY_COLORS[cat] || '#6b7280'; }

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditModal({ expense, onClose, onSuccess }: { expense: ExpenseItem; onClose: () => void; onSuccess: (updated: ExpenseItem) => void }) {
  const [form, setForm] = useState({
    title: expense.title,
    category: expense.category,
    amount: String(expense.amount),
    payment_method: expense.payment_method,
    payment_reference: expense.payment_reference,
    notes: expense.notes,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [apiErr, setApiErr] = useState('');

  const upd = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }));

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Required.';
    if (!form.amount || +form.amount <= 0) e.amount = 'Must be > 0.';
    if (!form.category.trim()) e.category = 'Select a category.';
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setBusy(true);
    const res = await expenseApi.update(expense.id, {
      title: form.title.trim(),
      category: form.category.trim(),
      amount: +form.amount,
      payment_method: form.payment_method,
      payment_reference: form.payment_reference.trim(),
      notes: form.notes.trim(),
    });
    setBusy(false);
    if (res.success) {
      onSuccess({ ...expense, ...res.data });
    } else {
      setApiErr(res.message ?? 'Save failed.');
    }
  }

  return (
    <div style={MODAL_OVERLAY_STYLE} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...MODAL_BOX_STYLE, maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, background: 'var(--bg-2)', zIndex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Edit expense</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--fg-3)', fontSize: 20, padding: '2px 6px' }}>x</button>
        </div>
        <form onSubmit={submit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={LABEL_S}>TITLE *</label>
            <input value={form.title} onChange={e => { upd({ title: e.target.value }); setErrors(x => ({ ...x, title: '' })); }}
              style={{ ...INPUT_S, borderColor: errors.title ? 'var(--bad)' : 'var(--line-2)' }} />
            {errors.title && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.title}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL_S}>CATEGORY *</label>
              <select value={form.category} onChange={e => { upd({ category: e.target.value }); setErrors(x => ({ ...x, category: '' })); }}
                style={{ ...INPUT_S, cursor: 'pointer', borderColor: errors.category ? 'var(--bad)' : 'var(--line-2)' }}>
                <option value="">Select...</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.category}</div>}
            </div>
            <div>
              <label style={LABEL_S}>AMOUNT (TZS) *</label>
              <input type="number" min="0" value={form.amount} onChange={e => { upd({ amount: e.target.value }); setErrors(x => ({ ...x, amount: '' })); }}
                style={{ ...INPUT_S, fontFamily: 'var(--mono)', borderColor: errors.amount ? 'var(--bad)' : 'var(--line-2)' }} />
              {errors.amount && <div style={{ fontSize: 11.5, color: 'var(--bad)', marginTop: 3 }}>{errors.amount}</div>}
            </div>
          </div>
          <div style={{ height: 1, background: 'var(--line)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={LABEL_S}>PAYMENT METHOD</label>
              <select value={form.payment_method} onChange={e => upd({ payment_method: e.target.value })}
                style={{ ...INPUT_S, cursor: 'pointer' }}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL_S}>REFERENCE</label>
              <input value={form.payment_reference} onChange={e => upd({ payment_reference: e.target.value })}
                style={{ ...INPUT_S, fontFamily: 'var(--mono)' }} placeholder="Receipt / ref number" />
            </div>
          </div>
          <div>
            <label style={LABEL_S}>NOTES</label>
            <textarea value={form.notes} onChange={e => upd({ notes: e.target.value })}
              rows={3} style={{ ...INPUT_S, resize: 'vertical', minHeight: 72 }} placeholder="Additional details..." />
          </div>
          {apiErr && <div style={{ padding: '9px 12px', borderRadius: 7, background: 'rgba(251,113,133,0.08)', color: 'var(--bad)', fontSize: 12.5 }}>{apiErr}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={busy}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {busy ? '...' : Icons.check} Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete modal ──────────────────────────────────────────────────────────────

function DeleteModal({ expense, onClose, onConfirm }: { expense: ExpenseItem; onClose: () => void; onConfirm: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function handle() {
    setBusy(true);
    const res = await expenseApi.delete(expense.id);
    setBusy(false);
    if (res.success) onConfirm();
    else setErr(res.message ?? 'Delete failed.');
  }

  return (
    <div style={MODAL_OVERLAY_STYLE} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...MODAL_BOX_STYLE, maxWidth: 400 }}>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 18, alignItems: 'flex-start' }}>
            <span style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)', display: 'grid', placeItems: 'center', color: 'var(--bad)', flexShrink: 0 }}>
              {Icons.warning}
            </span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Delete expense?</div>
              <div style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--fg)' }}>{expense.title}</strong> ({fmt(expense.amount)}) will be permanently deleted.
              </div>
            </div>
          </div>
          {err && <div style={{ marginBottom: 14, fontSize: 12.5, color: 'var(--bad)', padding: '8px 12px', borderRadius: 7, background: 'rgba(251,113,133,0.08)' }}>{err}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn btn-ghost" disabled={busy}>Cancel</button>
            <button onClick={handle} disabled={busy}
              style={{ padding: '7px 14px', background: 'var(--bad)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}>
              {busy ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [expense, setExpense] = useState<ExpenseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    expenseApi.getDetail(id).then(res => {
      setLoading(false);
      if (res.success) setExpense(res.data);
      else {
        // Fallback: try to find in list
        expenseApi.getList().then(listRes => {
          if (listRes.success) {
            const data = listRes.data as unknown as { results?: ExpenseItem[] } | ExpenseItem[];
            let list: ExpenseItem[] = [];
            if (Array.isArray(data)) list = data;
            else if (data && typeof data === 'object' && 'results' in data) list = (data as { results: ExpenseItem[] }).results;
            const found = list.find(x => x.id === id);
            if (found) setExpense(found); else setError(true);
          } else setError(true);
        });
      }
    });
  }, [id]);

  if (loading) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Expenses', href: '/expenses' }, { label: '...' }]}>
        <div style={{ padding: 80, textAlign: 'center' }}>{SPINNER}</div>
      </AppShell>
    );
  }

  if (error || !expense) {
    return (
      <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Expenses', href: '/expenses' }, { label: 'Not found' }]}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Expense not found</div>
          <p style={{ color: 'var(--fg-3)', marginBottom: 24 }}>No expense with this ID could be found.</p>
          <Link href="/expenses" className="btn btn-primary">Back to expenses</Link>
        </div>
      </AppShell>
    );
  }

  const color = catColor(expense.category);

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Expenses', href: '/expenses' }, { label: expense.title }]}
    >
      {/* Back */}
      <div style={{ marginBottom: 14, fontSize: 13, color: 'var(--fg-3)' }}>
        <Link href="/expenses" style={{ color: 'var(--fg-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>{Icons.chevRight}</span>
          Back to expenses
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 96, height: 96, borderRadius: 12, flexShrink: 0, background: color + '18', color: color, display: 'grid', placeItems: 'center', fontSize: 40, fontWeight: 600, border: `1px solid ${color}30` }}>
          {expense.title[0]}
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>{expense.title}</h1>
            <span className="pill" style={{ background: color + '18', color, border: `1px solid ${color}30`, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: color, flexShrink: 0 }} />
              {expense.category}
            </span>
          </div>
          <div className="mono" style={{ fontSize: 14, color: 'var(--bad)', fontWeight: 600, marginBottom: 14 }}>
            -{fmt(expense.amount)}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setEditOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {Icons.edit} Edit expense
            </button>
            <button className="btn btn-ghost" onClick={() => setDeleteOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--bad)' }}>
              {Icons.trash} Delete
            </button>
          </div>
        </div>
      </div>

      {/* Detail cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-detail)', gap: 16, alignItems: 'start' }}>
        <div>
          {/* Expense details */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">Expense details</span></div>
            <div style={{ padding: '14px 16px' }}>
              <div className="field-row"><span className="k">Title</span><span className="v">{expense.title}</span></div>
              <div className="field-row"><span className="k">Category</span><span className="v" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }} />
                {expense.category}
              </span></div>
              <div className="field-row"><span className="k">Amount</span><span className="v mono" style={{ color: 'var(--bad)', fontWeight: 500 }}>-{fmt(expense.amount)}</span></div>
              <div className="field-row"><span className="k">Payment method</span><span className="v">{expense.payment_method}</span></div>
              {expense.payment_reference && <div className="field-row"><span className="k">Reference</span><span className="v mono">{expense.payment_reference}</span></div>}
              {expense.notes && <div className="field-row"><span className="k">Notes</span><span className="v" style={{ color: 'var(--fg-2)', maxWidth: 320 }}>{expense.notes}</span></div>}
            </div>
          </div>
        </div>

        <div>
          {/* Metadata */}
          <div className="surface" style={{ marginBottom: 14 }}>
            <div className="card-head"><span className="card-title">Metadata</span></div>
            <div style={{ padding: '14px 16px' }}>
              <div className="field-row"><span className="k">Recorded by</span><span className="v">{expense.recorded_by_name || '-'}</span></div>
              <div className="field-row"><span className="k">Created</span><span className="v">{fmtDT(new Date(expense.created_at))}</span></div>
              <div className="field-row"><span className="k">Updated</span><span className="v">{fmtDT(new Date(expense.updated_at))}</span></div>
              <div className="field-row"><span className="k">Expense ID</span><span className="v mono" style={{ color: 'var(--fg-4)', fontSize: 11 }}>{expense.id}</span></div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="surface">
            <div className="card-head"><span className="card-title">Actions</span></div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-soft" onClick={() => setEditOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6 }}>
                {Icons.edit} Edit this expense
              </button>
              <button className="btn btn-ghost" onClick={() => setDeleteOpen(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--bad)' }}>
                {Icons.trash} Delete this expense
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editOpen && (
        <EditModal
          expense={expense}
          onClose={() => setEditOpen(false)}
          onSuccess={updated => { setExpense(updated); setEditOpen(false); }}
        />
      )}
      {deleteOpen && (
        <DeleteModal
          expense={expense}
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => router.push('/expenses')}
        />
      )}
    </AppShell>
  );
}
