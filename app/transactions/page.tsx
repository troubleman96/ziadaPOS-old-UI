'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort, fmtTime, fmtDate } from '../../lib/utils';
import { TRANSACTIONS } from '../../lib/data';

const TODAY = new Date(2026, 4, 24);

function MethodPill({ method }: { method: string }) {
  const cls: Record<string, string> = { Cash: 'cash', 'M-Pesa': 'mpesa', 'Tigo Pesa': 'tigo', Bank: 'bank', Credit: 'credit' };
  const initial = method === 'M-Pesa' ? 'M' : method === 'Tigo Pesa' ? 'T' : method[0];
  return (
    <span className={'method-pill ' + (cls[method] || 'cash')}>
      <span className="swatch">{initial}</span>
      {method}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { kind: string; label: string }> = {
    paid:     { kind: 'good', label: 'Paid' },
    credit:   { kind: 'warn', label: 'On credit' },
    refunded: { kind: 'bad',  label: 'Refunded' },
    held:     { kind: 'info', label: 'Held' },
    void:     { kind: '',     label: 'Void' },
  };
  const m = map[status] || map.paid;
  return <span className={'pill ' + m.kind}>{m.label}</span>;
}

function groupByDay(txns: typeof TRANSACTIONS) {
  const groups = new Map<string, typeof TRANSACTIONS>();
  for (const t of txns) {
    const key = t.ts.toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  return [...groups.entries()];
}

function relativeDayLabel(d: Date) {
  const diff = Math.round((TODAY.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today · ' + d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' });
  if (diff === 1) return 'Yesterday · ' + d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' });
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' });
}

export default function TransactionsPage() {
  const [range, setRange] = useState('today');
  const [method, setMethod] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter((t) => {
      if (range === 'today' && t.ts.toDateString() !== TODAY.toDateString()) return false;
      if (range === '7d' && (TODAY.getTime() - t.ts.getTime()) > 7 * 86400000) return false;
      if (method !== 'all' && t.method !== method) return false;
      if (status !== 'all' && t.status !== status) return false;
      if (query) {
        const q = query.toLowerCase();
        const hit = t.id.toLowerCase().includes(q) || t.customer.name.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [range, method, status, query]);

  const totals = useMemo(() => {
    let inflow = 0, refunds = 0, credit = 0, profit = 0;
    for (const t of filtered) {
      if (t.status === 'refunded') refunds += t.total;
      else inflow += t.total;
      if (t.status === 'credit') credit += t.total;
      profit += t.profit;
    }
    return { inflow, refunds, credit, profit, count: filtered.length };
  }, [filtered]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  return (
    <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Transactions' }]}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>
            Transactions <span style={{ color: 'var(--fg-4)' }}>/</span>{' '}
            <span className="mono" style={{ fontSize: 16, fontWeight: 400, color: 'var(--fg-3)' }}>Miamala</span>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
            Every sale, refund and credit, across your stores.
            <span className="mono" style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="dot-s" style={{ background: 'var(--good)' }}></span> live · updated 4s ago
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="seg">
            {[['Today','today'],['7D','7d'],['30D','30d'],['90D','90d'],['Custom','custom']].map(([l,k]) => (
              <button key={k} className={range === k ? 'active' : ''} onClick={() => setRange(k)}>{l}</button>
            ))}
          </div>
          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.download} Export CSV</button>
          <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.filter} More filters</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'TOTAL INFLOW', value: fmtShort(totals.inflow), sub: `${totals.count} transactions · avg ${totals.count ? fmtShort(Math.round(totals.inflow/totals.count)) : 'TZS 0'}`, color: 'var(--good)', pill: <span className="pill good">↗ +18%</span> },
          { label: 'GROSS PROFIT', value: fmtShort(totals.profit), sub: `${totals.inflow ? (totals.profit/totals.inflow*100).toFixed(1) : '0'}% margin`, pill: <span className="pill good">↗ +12%</span> },
          { label: 'ON CREDIT', value: fmtShort(totals.credit), sub: `${filtered.filter(t => t.status === 'credit').length} tickets unpaid`, color: 'var(--warn)', pill: <span className="pill">stable</span> },
          { label: 'REFUNDS', value: fmtShort(totals.refunds), sub: `${filtered.filter(t => t.status === 'refunded').length} refunds · ${totals.inflow ? (totals.refunds/totals.inflow*100).toFixed(1) : '0'}%`, color: 'var(--bad)', pill: <span className="pill bad">↘ −4%</span> },
        ].map((c) => (
          <div key={c.label} className="surface stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label">{c.label}</span>
              {c.pill}
            </div>
            <div className="value" style={{ color: c.color || 'var(--fg)' }}>{c.value}</div>
            <div className="sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240, padding: '0 10px 0 12px', height: 32, border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg)' }}>
          {Icons.search}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by TXN ID, customer, or M-Pesa reference…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }}
          />
          {query && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{filtered.length} hits</span>}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all','Cash','M-Pesa','Tigo Pesa','Bank','Credit'].map((m) => (
            <button key={m} onClick={() => setMethod(m)} style={{
              padding: '5px 11px', borderRadius: 999,
              border: '1px solid ' + (method === m ? 'var(--accent-line)' : 'var(--line)'),
              background: method === m ? 'var(--accent-soft)' : 'var(--bg)',
              color: method === m ? 'var(--fg)' : 'var(--fg-2)',
              fontSize: 12, cursor: 'pointer',
            }}>{m === 'all' ? 'All methods' : m}</button>
          ))}
        </div>
        <span style={{ width: 1, height: 22, background: 'var(--line)', margin: '0 4px' }}></span>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all','paid','credit','refunded'].map((s) => (
            <button key={s} onClick={() => setStatus(s)} style={{
              padding: '5px 10px', borderRadius: 6,
              border: '1px solid ' + (status === s ? 'var(--line-2)' : 'var(--line)'),
              background: status === s ? 'var(--bg-3)' : 'var(--bg)',
              color: status === s ? 'var(--fg)' : 'var(--fg-3)',
              fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
            }}>{s === 'all' ? 'All status' : s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="surface" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-3)' }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em' }}>NO RESULTS</div>
            <div style={{ marginTop: 6, fontSize: 14 }}>Try widening the date range or clearing filters.</div>
          </div>
        ) : (
          groups.map(([dayKey, txns]) => {
            const dayTotal = txns.reduce((s, t) => s + (t.status === 'refunded' ? -t.total : t.total), 0);
            return (
              <div key={dayKey}>
                <div className="day-divider">
                  <span>{relativeDayLabel(new Date(dayKey))}</span>
                  <span style={{ color: 'var(--fg-3)' }}>
                    <span className="mono">{txns.length} transactions</span>
                    <span style={{ margin: '0 12px', color: 'var(--fg-4)' }}>·</span>
                    <span className="mono" style={{ color: 'var(--fg-2)' }}>{fmtShort(dayTotal)}</span>
                  </span>
                </div>
                <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 120 }}>TXN ID</th>
                      <th style={{ width: 70 }}>TIME</th>
                      <th>CUSTOMER</th>
                      <th style={{ width: 88, textAlign: 'right' }} className="num">ITEMS</th>
                      <th style={{ width: 130 }}>METHOD</th>
                      <th style={{ width: 100 }}>STATUS</th>
                      <th style={{ width: 90 }}>CASHIER</th>
                      <th style={{ width: 130, textAlign: 'right' }} className="num">AMOUNT</th>
                      <th style={{ width: 28 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map((t) => (
                      <tr key={t.id}>
                        <td><Link href={`/transactions/${t.id}`} className="mono" style={{ color: 'var(--accent)' }}>{t.id}</Link></td>
                        <td className="mono" style={{ color: 'var(--fg-3)' }}>{fmtTime(t.ts)}</td>
                        <td>
                          <div>{t.customer.name}</div>
                          {t.customer.phone && <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', marginTop: 1 }}>{t.customer.phone}</div>}
                        </td>
                        <td className="num" style={{ color: 'var(--fg-2)' }}>
                          {t.lines.reduce((s, l) => s + l.qty, 0)}
                          <span className="mono" style={{ marginLeft: 4, color: 'var(--fg-4)', fontSize: 10.5 }}>· {t.lines.length} SKU</span>
                        </td>
                        <td><MethodPill method={t.method} /></td>
                        <td><StatusPill status={t.status} /></td>
                        <td className="mono" style={{ color: 'var(--fg-3)', fontSize: 11.5 }}>{t.cashier}</td>
                        <td className="num" style={{ color: t.status === 'refunded' ? 'var(--bad)' : 'var(--fg)', fontWeight: 500 }}>
                          {t.status === 'refunded' ? '− ' : ''}{fmt(t.total)}
                        </td>
                        <td style={{ color: 'var(--fg-4)', textAlign: 'right' }}>
                          <Link href={`/transactions/${t.id}`}>{Icons.chevRight}</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            );
          })
        )}
        {filtered.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-3)' }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              Showing {filtered.length} of {TRANSACTIONS.length} transactions
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>← Prev</button>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>page 1 of 1</span>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
