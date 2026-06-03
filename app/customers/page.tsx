'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';
import { customerApi, CustomerListItem, CustomerSummary } from '../../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────
type Segment = 'All' | 'VIP' | 'Regular' | 'Occasional' | 'New';

const SEGMENT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  VIP:        { bg: 'var(--warn-soft)',   color: 'var(--warn)',   border: 'rgba(251,191,36,0.3)' },
  Regular:    { bg: 'var(--accent-soft)', color: 'var(--accent)', border: 'var(--accent-line)' },
  Occasional: { bg: 'var(--bg-3)',        color: 'var(--fg-2)',   border: 'var(--line-2)' },
  New:        { bg: 'var(--good-soft)',   color: 'var(--good)',   border: 'rgba(52,211,153,0.3)' },
};

const SORT_OPTIONS = ['Total spent (high)', 'Total spent (low)', 'Last visit (recent)', 'Open credit'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysAgoLabel(dateStr: string | null) {
  if (!dateStr) return 'Never';
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

// ── Google G icon ─────────────────────────────────────────────────────────────
function GoogleG() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.17z" fill="#4285F4"/>
      <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04c-.72.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.3H1.83v2.07A8 8 0 0 0 8.98 17z" fill="#34A853"/>
      <path d="M4.51 10.48A4.8 4.8 0 0 1 4.26 9c0-.51.09-1.01.25-1.48V5.45H1.83a8 8 0 0 0 0 7.1l2.68-2.07z" fill="#FBBC05"/>
      <path d="M8.98 4.22c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1 8 8 0 0 0 1.83 5.45L4.5 7.52C5.14 5.62 6.9 4.22 8.98 4.22z" fill="#EA4335"/>
    </svg>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid var(--line-2)',borderTopColor:'var(--accent)',animation:'spin 0.7s linear infinite',margin:'0 auto'}} />
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [segment, setSegment] = useState<Segment>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Total spent (high)');
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Fetch summary once
  useEffect(() => {
    customerApi.getSummary().then((res) => {
      if (res.success) setSummary(res.data);
    });
  }, []);

  // Fetch list whenever segment changes
  useEffect(() => {
    setLoading(true);
    const params = segment !== 'All' ? `segment=${segment}` : undefined;
    customerApi.getList(params).then((res) => {
      if (res.success) setCustomers(res.data);
      setLoading(false);
    });
  }, [segment]);

  // Re-fetch on search with debounce
  function handleSearch(q: string) {
    setQuery(q);
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => {
      setLoading(true);
      const parts: string[] = [];
      if (segment !== 'All') parts.push(`segment=${segment}`);
      if (q) parts.push(`search=${encodeURIComponent(q)}`);
      customerApi.getList(parts.join('&') || undefined).then((res) => {
        if (res.success) setCustomers(res.data);
        setLoading(false);
      });
    }, 300);
    setSearchTimeout(t);
  }

  const sorted = useMemo(() => {
    const list = [...customers];
    if (sort === 'Total spent (high)')  list.sort((a, b) => b.total_spent - a.total_spent);
    if (sort === 'Total spent (low)')   list.sort((a, b) => a.total_spent - b.total_spent);
    if (sort === 'Last visit (recent)') list.sort((a, b) => {
      if (!a.last_visit) return 1;
      if (!b.last_visit) return -1;
      return new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime();
    });
    if (sort === 'Open credit') list.sort((a, b) => b.open_credit - a.open_credit);
    return list;
  }, [customers, sort]);

  // Segment counts from by_segment in summary
  const counts: Record<string, number> = {
    All: summary?.total_customers ?? customers.length,
    VIP: summary?.by_segment?.VIP ?? 0,
    Regular: summary?.by_segment?.Regular ?? 0,
    Occasional: summary?.by_segment?.Occasional ?? 0,
    New: summary?.by_segment?.New ?? 0,
  };

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Customers' }]}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-soft page-sec">
            <GoogleG />
            <span>Import from Google Contacts</span>
          </button>
          <Link href="/customers/new">
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icons.plus} Add customer
            </button>
          </Link>
        </div>
      }
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Customers</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
          Manage your customer base, track loyalty, and monitor credit.
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <div className="surface" style={{ padding: '16px 18px' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>TOTAL CUSTOMERS</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>
            {summary ? summary.total_customers : '—'}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>across all segments</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>ACTIVE THIS MONTH</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>
            {summary ? summary.active_this_month : '—'}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>visited in last 30 days</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>AVG SPEND</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>
            {summary ? fmtShort(summary.avg_ticket) : '—'}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>per transaction</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px', borderColor: (summary?.on_credit_count ?? 0) > 0 ? 'rgba(251,191,36,0.3)' : 'var(--line)' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>ON CREDIT</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>
            {summary ? summary.on_credit_count : '—'}
            {(summary?.on_credit_count ?? 0) > 0 && (
              <span className="pill warn" style={{ marginLeft: 10, fontSize: 10.5, verticalAlign: 'middle' }}>open tabs</span>
            )}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--warn)', marginTop: 6 }}>
            {summary ? fmtShort(summary.total_open_credit) : '—'} outstanding
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220,
          padding: '0 10px 0 12px', height: 32,
          border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg)',
        }}>
          {Icons.search}
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, phone or ID…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }}
          />
          {query && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{sorted.length}</span>}
        </div>

        <div className="filter-pills-scroll" style={{ display: 'flex', gap: 5 }}>
          {(['All', 'VIP', 'Regular', 'Occasional', 'New'] as Segment[]).map((s) => (
            <button
              key={s}
              onClick={() => setSegment(s)}
              style={{
                padding: '5px 11px', borderRadius: 999,
                border: '1px solid ' + (segment === s ? 'var(--accent-line)' : 'var(--line)'),
                background: segment === s ? 'var(--accent-soft)' : 'var(--bg)',
                color: segment === s ? 'var(--fg)' : 'var(--fg-2)',
                fontSize: 12, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              {s}
              <span className="mono" style={{ fontSize: 10, color: segment === s ? 'var(--accent)' : 'var(--fg-4)' }}>
                {counts[s] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            marginLeft: 'auto', padding: '6px 10px', borderRadius: 6,
            border: '1px solid var(--line)', background: 'var(--bg)',
            color: 'var(--fg-2)', fontSize: 12.5, fontFamily: 'inherit', outline: 0, cursor: 'pointer',
          }}
        >
          {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="surface" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Spinner />
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-3)' }}>Loading customers…</div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="surface" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>👤</div>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No customers found</div>
          <p style={{ color: 'var(--fg-3)', fontSize: 13, margin: 0 }}>
            {query ? `No results for "${query}"` : 'No customers in this segment yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile card-list */}
          <div className="cust-cards-wrap surface" style={{ overflow: 'hidden' }}>
            {sorted.map((c) => {
              const seg = SEGMENT_COLORS[c.segment] ?? SEGMENT_COLORS.Occasional;
              return (
                <Link key={c.id} href={`/customers/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: '1px solid var(--line)', color: 'inherit' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 999, flexShrink: 0, background: `hsl(${c.avatar_hue}, 60%, 50%)`, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    {c.initials}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, fontSize: 13.5 }}>{c.name}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 7px', borderRadius: 999, fontSize: 10, background: seg.bg, color: seg.color, border: '1px solid ' + seg.border }}>{c.segment}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 2 }}>{c.phone} · {daysAgoLabel(c.last_visit)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{fmtShort(c.total_spent)}</div>
                    {c.open_credit > 0 && <div className="mono" style={{ fontSize: 10, color: 'var(--warn)', marginTop: 2 }}>{fmt(c.open_credit)} credit</div>}
                  </div>
                </Link>
              );
            })}
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', background: 'var(--bg-3)' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{sorted.length} customers</span>
            </div>
          </div>

          {/* Desktop table */}
          <div className="cust-table-wrap surface" style={{ overflow: 'hidden' }}>
            <div className="table-scroll">
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th className="num">Total spent</th>
                    <th>Last visit</th>
                    <th className="num">Open credit</th>
                    <th className="num">Avg ticket</th>
                    <th style={{ width: 100 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c) => {
                    const seg = SEGMENT_COLORS[c.segment] ?? SEGMENT_COLORS.Occasional;
                    return (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: `hsl(${c.avatar_hue}, 60%, 50%)`, display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 600, color: '#fff' }}>
                              {c.initials}
                            </div>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>
                                <Link href={`/customers/${c.id}`} style={{ color: 'inherit' }}>{c.name}</Link>
                              </div>
                              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                                {c.phone}
                                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 6px', borderRadius: 999, fontSize: 10, background: seg.bg, color: seg.color, border: '1px solid ' + seg.border, marginLeft: 6 }}>{c.segment}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="num mono" style={{ fontSize: 13 }}>{fmtShort(c.total_spent)}</td>
                        <td className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{daysAgoLabel(c.last_visit)}</td>
                        <td className="num">{c.open_credit > 0 ? <span className="mono" style={{ fontSize: 13, color: 'var(--warn)' }}>{fmt(c.open_credit)}</span> : <span className="mono" style={{ fontSize: 12, color: 'var(--fg-4)' }}>—</span>}</td>
                        <td className="num mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{fmtShort(c.avg_ticket)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                            <Link href={`/customers/${c.id}`}><button className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12 }}>View</button></Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '11px 16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-3)' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Showing {sorted.length} customers</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                Total lifetime value: <span style={{ color: 'var(--fg-2)' }}>{summary ? fmtShort(summary.total_lifetime_value) : '—'}</span>
              </span>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
