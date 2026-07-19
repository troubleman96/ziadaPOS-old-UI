'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort, fmtDate } from '../../lib/utils';
import { expenseApi, type ExpenseItem } from '../../lib/api';

const SPINNER = (
  <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
  </>
);

const EXPENSE_CATEGORIES = [
  'Rent', 'Utilities', 'Salaries', 'Supplies', 'Transport',
  'Marketing', 'Maintenance', 'Licences & permits', 'Insurance', 'Other',
];

const EXPENSE_METHODS = ['Cash', 'M-Pesa', 'Tigo Pesa', 'Bank', 'Airtel Money'];

const CATEGORY_COLORS: Record<string, string> = {
  'Rent':              '#6366f1',
  'Utilities':         '#f59e0b',
  'Salaries':          '#10b981',
  'Supplies':          '#3b82f6',
  'Transport':         '#8b5cf6',
  'Marketing':         '#ec4899',
  'Maintenance':       '#f97316',
  'Licences & permits':'#14b8a6',
  'Insurance':         '#06b6d4',
  'Other':             '#6b7280',
};

function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] || '#6b7280';
}

function categoryPill(cat: string) {
  const color = categoryColor(cat);
  return (
    <span className="pill" style={{
      background: color + '18',
      color: color,
      border: `1px solid ${color}30`,
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color, flexShrink: 0 }} />
      {cat}
    </span>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────

function DeleteModal({ expense, onCancel, onConfirm }: { expense: ExpenseItem; onCancel: () => void; onConfirm: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function handleDelete() {
    setBusy(true);
    const res = await expenseApi.delete(expense.id);
    setBusy(false);
    if (res.success) onConfirm();
    else setErr(res.message ?? 'Delete failed.');
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 12, width: '100%', maxWidth: 420, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
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
          <button onClick={onCancel} className="btn btn-ghost" style={{ padding: '7px 14px' }} disabled={busy}>Cancel</button>
          <button onClick={handleDelete} disabled={busy}
            style={{ padding: '7px 14px', background: 'var(--bad)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<ExpenseItem | null>(null);

  useEffect(() => {
    setLoading(true);
    expenseApi.getList('ordering=-created_at').then(res => {
      if (res.success) {
        setExpenses(res.data as unknown as ExpenseItem[]);
      } else {
        setLoadError('Could not load expenses.');
      }
      setLoading(false);
    }).catch(() => { setLoadError('Network error.'); setLoading(false); });
  }, []);

  const filtered = useMemo(() => expenses.filter(e => {
    if (catFilter !== 'all' && e.category !== catFilter) return false;
    if (methodFilter !== 'all' && e.payment_method !== methodFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!e.title.toLowerCase().includes(q) && !(e.notes || '').toLowerCase().includes(q) && !(e.payment_reference || '').toLowerCase().includes(q)) return false;
    }
    return true;
  }), [catFilter, methodFilter, query, expenses]);

  const totals = useMemo(() => {
    let total = 0;
    const byCat: Record<string, { amount: number; count: number }> = {};
    for (const e of filtered) {
      total += e.amount;
      byCat[e.category] = byCat[e.category] || { amount: 0, count: 0 };
      byCat[e.category].amount += e.amount;
      byCat[e.category].count += 1;
    }
    return { total, count: filtered.length, byCat };
  }, [filtered]);

  const liveCats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      map[e.category] = (map[e.category] || 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({ id: name, name, count }));
  }, [expenses]);

  function groupByDay(items: ExpenseItem[]) {
    const groups = new Map<string, ExpenseItem[]>();
    for (const e of items) {
      const key = new Date(e.created_at).toDateString();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }
    return [...groups.entries()];
  }

  function relativeDayLabel(d: Date) {
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today.getTime() - 86400000);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' });
  }

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Expenses' }]}
      actions={
        <Link href="/expenses/new" className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.plus} New expense
        </Link>
      }
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .exp-kpi-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:14px; }
        @media (min-width:640px) { .exp-kpi-grid { grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>
            Expenses <span style={{ color: 'var(--fg-4)' }}>/</span>{' '}
            <span className="mono" style={{ fontSize: 16, fontWeight: 400, color: 'var(--fg-3)' }}>Matumizi</span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
            Track every business expense across your stores.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost page-sec">{Icons.download} Export</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="exp-kpi-grid">
        <div className="surface stat-card">
          <span className="label">TOTAL EXPENSES</span>
          <span className="value" style={{ color: 'var(--bad)' }}>{fmtShort(totals.total)}</span>
          <span className="sub">{totals.count} items</span>
        </div>
        <div className="surface stat-card">
          <span className="label">CATEGORIES</span>
          <span className="value">{Object.keys(totals.byCat).length}</span>
          <span className="sub">active categories</span>
        </div>
        <div className="surface stat-card">
          <span className="label">AVERAGE</span>
          <span className="value">{totals.count > 0 ? fmtShort(Math.round(totals.total / totals.count)) : 'TZS 0'}</span>
          <span className="sub">per expense</span>
        </div>
        <div className="surface stat-card">
          <span className="label">TODAY</span>
          <span className="value">{fmtShort(expenses.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString()).reduce((s, e) => s + e.amount, 0))}</span>
          <span className="sub">spent today</span>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg-2)', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240, padding: '0 10px 0 12px', height: 36, border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg)' }}>
          {Icons.search}
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search expenses..." style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }} />
          {query && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{filtered.length}</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          <button onClick={() => setCatFilter('all')} style={{ padding: '5px 11px', borderRadius: 999, border: '1px solid ' + (catFilter === 'all' ? 'var(--accent-line)' : 'var(--line)'), background: catFilter === 'all' ? 'var(--accent-soft)' : 'var(--bg-2)', color: catFilter === 'all' ? 'var(--fg)' : 'var(--fg-2)', fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'inherit' }}>
            All <span className="mono" style={{ fontSize: 10, color: catFilter === 'all' ? 'var(--accent)' : 'var(--fg-4)' }}>{expenses.length}</span>
          </button>
          {liveCats.map(c => (
            <button key={c.id} onClick={() => setCatFilter(c.name)} style={{ padding: '5px 11px', borderRadius: 999, border: '1px solid ' + (catFilter === c.name ? 'var(--accent-line)' : 'var(--line)'), background: catFilter === c.name ? 'var(--accent-soft)' : 'var(--bg-2)', color: catFilter === c.name ? 'var(--fg)' : 'var(--fg-2)', fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'inherit' }}>
              {c.name}<span className="mono" style={{ fontSize: 10, color: catFilter === c.name ? 'var(--accent)' : 'var(--fg-4)' }}>{c.count}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 1, height: 22, background: 'var(--line)' }}></span>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' } as React.CSSProperties}>
            {['all', ...EXPENSE_METHODS].map(m => (
              <button key={m} onClick={() => setMethodFilter(m)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid ' + (methodFilter === m ? 'var(--line-2)' : 'var(--line)'), background: methodFilter === m ? 'var(--bg-3)' : 'var(--bg)', color: methodFilter === m ? 'var(--fg)' : 'var(--fg-3)', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                {m === 'all' ? 'All methods' : m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading / error */}
      {loading && (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--fg-4)' }}>{SPINNER}</div>
      )}
      {!loading && loadError && (
        <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--bad)', fontSize: 13 }}>{loadError}</div>
      )}

      {/* Category breakdown */}
      {!loading && !loadError && Object.keys(totals.byCat).length > 0 && (
        <div className="surface" style={{ marginBottom: 14 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'var(--bg-3)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-2)' }}>Spending by category</span>
          </div>
          <div style={{ padding: '16px 18px', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {Object.entries(totals.byCat)
              .sort((a, b) => b[1].amount - a[1].amount)
              .map(([cat, data]) => (
                <div key={cat} style={{ flex: '1 1 180px', minWidth: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{cat}</span>
                    <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{fmtShort(data.amount)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: categoryColor(cat), width: `${totals.total > 0 ? (data.amount / totals.total * 100) : 0}%`, transition: 'width 300ms' }} />
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 3 }}>{data.count} items</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Expense list */}
      {!loading && !loadError && (
        <div className="surface" style={{ overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-3)' }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em' }}>NO EXPENSES</div>
              <div style={{ marginTop: 6, fontSize: 14 }}>
                {expenses.length === 0
                  ? 'No expenses recorded yet. Add your first expense to get started.'
                  : 'No expenses match your filters.'}
              </div>
              {expenses.length === 0 && (
                <Link href="/expenses/new" className="btn btn-primary" style={{ marginTop: 16, padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {Icons.plus} Add expense
                </Link>
              )}
            </div>
          ) : (
            groups.map(([dayKey, items]) => {
              const dayTotal = items.reduce((s, e) => s + e.amount, 0);
              return (
                <div key={dayKey}>
                  <div style={{ padding: '8px 18px', borderBottom: '1px solid var(--line)', background: 'var(--bg-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <span style={{ color: 'var(--fg-2)', fontWeight: 500 }}>{relativeDayLabel(new Date(dayKey))}</span>
                    <span className="mono" style={{ color: 'var(--fg-3)' }}>
                      {items.length} expense{items.length > 1 ? 's' : ''} · {fmtShort(dayTotal)}
                    </span>
                  </div>
                  {/* Mobile cards */}
                  <div className="mobile-only">
                    {items.map(e => (
                      <Link key={e.id} href={`/expenses/${e.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--line)', color: 'inherit', textDecoration: 'none' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: categoryColor(e.category) + '18', color: categoryColor(e.category), display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {e.title[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 2 }}>{e.category} · {e.payment_method}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--bad)' }}>-{fmt(e.amount)}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>{fmtDate(new Date(e.created_at))}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {/* Desktop table */}
                  <div className="desktop-only">
                    <div className="table-scroll">
                      <table className="table">
                        <thead>
                          <tr>
                            <th style={{ width: 50 }}></th>
                            <th>TITLE</th>
                            <th style={{ width: 140 }}>CATEGORY</th>
                            <th style={{ width: 110 }}>METHOD</th>
                            <th style={{ width: 120, textAlign: 'right' }} className="num">AMOUNT</th>
                            <th style={{ width: 100 }}>DATE</th>
                            <th style={{ width: 100 }}>BY</th>
                            <th style={{ width: 32 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(e => (
                            <tr key={e.id}>
                              <td>
                                <div style={{ width: 32, height: 32, borderRadius: 7, background: categoryColor(e.category) + '18', color: categoryColor(e.category), display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>
                                  {e.title[0]}
                                </div>
                              </td>
                              <td>
                                <Link href={`/expenses/${e.id}`} style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}>{e.title}</Link>
                                {e.notes && <div style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{e.notes}</div>}
                              </td>
                              <td>{categoryPill(e.category)}</td>
                              <td className="mono" style={{ color: 'var(--fg-3)', fontSize: 11.5 }}>{e.payment_method}</td>
                              <td className="num" style={{ color: 'var(--bad)', fontWeight: 500 }}>-{fmt(e.amount)}</td>
                              <td className="mono" style={{ color: 'var(--fg-3)', fontSize: 11.5 }}>{fmtDate(new Date(e.created_at))}</td>
                              <td className="mono" style={{ color: 'var(--fg-3)', fontSize: 11.5 }}>{e.recorded_by_name || '-'}</td>
                              <td style={{ textAlign: 'right' }}>
                                <Link href={`/expenses/${e.id}`} style={{ color: 'var(--fg-4)', textDecoration: 'none' }}>{Icons.chevRight}</Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-3)' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                {filtered.length} / {expenses.length} expenses
              </span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--bad)' }}>
                Total: -{fmt(totals.total)}
              </span>
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal
          expense={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            setExpenses(prev => prev.filter(e => e.id !== deleteTarget.id));
            setDeleteTarget(null);
          }}
        />
      )}
    </AppShell>
  );
}
