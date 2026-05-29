'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
type Segment = 'All' | 'VIP' | 'Regular' | 'Occasional' | 'New';

interface Customer {
  id: string;
  name: string;
  phone: string;
  since: Date;
  totalSpent: number;
  lastVisit: Date;
  openCredit: number;
  avgTicket: number;
  segment: 'VIP' | 'Regular' | 'Occasional' | 'New';
  avatarHue: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const TODAY = new Date(2026, 4, 25);
const daysAgo = (n: number) => new Date(TODAY.getTime() - n * 86400000);
const monthsAgo = (n: number) => new Date(TODAY.getTime() - n * 30 * 86400000);

const CUSTOMERS: Customer[] = [
  {
    id: 'c001', name: 'Hamisi Juma', phone: '+255 767 123 456',
    since: monthsAgo(24), totalSpent: 1_840_000, lastVisit: daysAgo(2),
    openCredit: 0, avgTicket: 38_000, segment: 'VIP', avatarHue: 260,
  },
  {
    id: 'c002', name: 'Fatuma Ally', phone: '+255 714 234 567',
    since: monthsAgo(18), totalSpent: 1_120_000, lastVisit: daysAgo(5),
    openCredit: 45_000, avgTicket: 24_500, segment: 'VIP', avatarHue: 340,
  },
  {
    id: 'c003', name: 'Josephine Mkuya', phone: '+255 783 345 678',
    since: monthsAgo(12), totalSpent: 780_000, lastVisit: daysAgo(3),
    openCredit: 0, avgTicket: 19_800, segment: 'Regular', avatarHue: 160,
  },
  {
    id: 'c004', name: 'Baraka Mwamba', phone: '+255 622 456 789',
    since: monthsAgo(30), totalSpent: 2_340_000, lastVisit: daysAgo(1),
    openCredit: 120_000, avgTicket: 52_000, segment: 'VIP', avatarHue: 200,
  },
  {
    id: 'c005', name: 'Asha Mwinyi', phone: '+255 756 567 890',
    since: monthsAgo(6), totalSpent: 430_000, lastVisit: daysAgo(14),
    openCredit: 30_000, avgTicket: 14_200, segment: 'Regular', avatarHue: 30,
  },
  {
    id: 'c006', name: 'Mohamed Rashid', phone: '+255 712 678 901',
    since: monthsAgo(3), totalSpent: 215_000, lastVisit: daysAgo(21),
    openCredit: 0, avgTicket: 11_600, segment: 'Occasional', avatarHue: 280,
  },
  {
    id: 'c007', name: 'Zawadi Chaka', phone: '+255 769 789 012',
    since: daysAgo(45), totalSpent: 148_000, lastVisit: daysAgo(7),
    openCredit: 0, avgTicket: 16_400, segment: 'New', avatarHue: 120,
  },
  {
    id: 'c008', name: 'Salum Kibwana', phone: '+255 784 890 123',
    since: monthsAgo(48), totalSpent: 3_120_000, lastVisit: daysAgo(4),
    openCredit: 85_000, avgTicket: 68_000, segment: 'VIP', avatarHue: 40,
  },
  {
    id: 'c009', name: 'Neema Kalugendo', phone: '+255 767 901 234',
    since: monthsAgo(9), totalSpent: 560_000, lastVisit: daysAgo(9),
    openCredit: 0, avgTicket: 18_000, segment: 'Regular', avatarHue: 190,
  },
  {
    id: 'c010', name: 'Hassan Nguvu', phone: '+255 714 012 345',
    since: monthsAgo(15), totalSpent: 890_000, lastVisit: daysAgo(6),
    openCredit: 60_000, avgTicket: 28_500, segment: 'Regular', avatarHue: 320,
  },
  {
    id: 'c011', name: 'Rehema Omary', phone: '+255 756 123 456',
    since: daysAgo(30), totalSpent: 72_000, lastVisit: daysAgo(12),
    openCredit: 0, avgTicket: 9_800, segment: 'New', avatarHue: 70,
  },
  {
    id: 'c012', name: 'Idrissa Kigoma', phone: '+255 622 234 567',
    since: monthsAgo(7), totalSpent: 310_000, lastVisit: daysAgo(28),
    openCredit: 0, avgTicket: 13_200, segment: 'Occasional', avatarHue: 230,
  },
];

const SEGMENT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  VIP: { bg: 'var(--warn-soft)', color: 'var(--warn)', border: 'rgba(251,191,36,0.3)' },
  Regular: { bg: 'var(--accent-soft)', color: 'var(--accent)', border: 'var(--accent-line)' },
  Occasional: { bg: 'var(--bg-3)', color: 'var(--fg-2)', border: 'var(--line-2)' },
  New: { bg: 'var(--good-soft)', color: 'var(--good)', border: 'rgba(52,211,153,0.3)' },
};

const SORT_OPTIONS = ['Total spent (high)', 'Total spent (low)', 'Last visit (recent)', 'Customer since', 'Open credit'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
}

function daysAgoLabel(date: Date) {
  const diff = Math.round((TODAY.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff}d ago`;
}

function segmentCounts(customers: Customer[]) {
  const map: Record<string, number> = { All: customers.length };
  customers.forEach((c) => { map[c.segment] = (map[c.segment] || 0) + 1; });
  return map;
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [segment, setSegment] = useState<Segment>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Total spent (high)');

  const counts = useMemo(() => segmentCounts(CUSTOMERS), []);

  const filtered = useMemo(() => {
    let list = CUSTOMERS.filter((c) => {
      if (segment !== 'All' && c.segment !== segment) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.phone.includes(query) && !c.id.includes(q)) return false;
      }
      return true;
    });
    if (sort === 'Total spent (high)')   list = [...list].sort((a, b) => b.totalSpent - a.totalSpent);
    if (sort === 'Total spent (low)')    list = [...list].sort((a, b) => a.totalSpent - b.totalSpent);
    if (sort === 'Last visit (recent)')  list = [...list].sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());
    if (sort === 'Customer since')       list = [...list].sort((a, b) => a.since.getTime() - b.since.getTime());
    if (sort === 'Open credit')          list = [...list].sort((a, b) => b.openCredit - a.openCredit);
    return list;
  }, [segment, query, sort]);

  const totalSpent = CUSTOMERS.reduce((s, c) => s + c.totalSpent, 0);
  const activeThisMonth = CUSTOMERS.filter((c) => TODAY.getTime() - c.lastVisit.getTime() < 30 * 86400000).length;
  const onCredit = CUSTOMERS.filter((c) => c.openCredit > 0).length;
  const avgSpend = Math.round(CUSTOMERS.reduce((s, c) => s + c.avgTicket, 0) / CUSTOMERS.length);

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
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>755</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>across all segments</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>ACTIVE THIS MONTH</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>
            {activeThisMonth}
            <span className="pill good" style={{ marginLeft: 10, fontSize: 10.5, verticalAlign: 'middle' }}>↗ +12%</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>visited in last 30 days</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>AVG SPEND</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>{fmtShort(avgSpend)}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>per transaction</div>
        </div>
        <div className="surface" style={{ padding: '16px 18px', borderColor: onCredit > 0 ? 'rgba(251,191,36,0.3)' : 'var(--line)' }}>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>ON CREDIT</div>
          <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>
            28
            <span className="pill warn" style={{ marginLeft: 10, fontSize: 10.5, verticalAlign: 'middle' }}>open tabs</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--warn)', marginTop: 6 }}>
            {fmtShort(CUSTOMERS.reduce((s, c) => s + c.openCredit, 0))} outstanding
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 220,
          padding: '0 10px 0 12px', height: 32,
          border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg)',
        }}>
          {Icons.search}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone or ID…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--fg)', fontSize: 13, fontFamily: 'inherit' }}
          />
          {query && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{filtered.length}</span>}
        </div>

        {/* Segment pills — scrollable on mobile */}
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

        {/* Sort */}
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

      {/* Mobile card-list */}
      <div className="cust-cards-wrap surface" style={{ overflow: 'hidden' }}>
        {filtered.map((c) => {
          const seg = SEGMENT_COLORS[c.segment];
          return (
            <Link key={c.id} href={`/customers/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: '1px solid var(--line)', color: 'inherit' }}>
              <div style={{ width: 38, height: 38, borderRadius: 999, flexShrink: 0, background: `oklch(55% 0.18 ${c.avatarHue})`, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {initials(c.name)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 500, fontSize: 13.5 }}>{c.name}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 7px', borderRadius: 999, fontSize: 10, background: seg.bg, color: seg.color, border: '1px solid ' + seg.border }}>{c.segment}</span>
                </div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 2 }}>{c.phone} · {daysAgoLabel(c.lastVisit)}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{fmtShort(c.totalSpent)}</div>
                {c.openCredit > 0 && <div className="mono" style={{ fontSize: 10, color: 'var(--warn)', marginTop: 2 }}>{fmt(c.openCredit)} credit</div>}
              </div>
            </Link>
          );
        })}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', background: 'var(--bg-3)' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{filtered.length} customers</span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="cust-table-wrap surface" style={{ overflow: 'hidden' }}>
        <div className="table-scroll">
        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Since</th>
              <th className="num">Total spent</th>
              <th>Last visit</th>
              <th className="num">Open credit</th>
              <th className="num">Avg ticket</th>
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const seg = SEGMENT_COLORS[c.segment];
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: `oklch(55% 0.18 ${c.avatarHue})`, display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 600, color: '#fff' }}>
                        {initials(c.name)}
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
                  <td className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{c.since.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
                  <td className="num mono" style={{ fontSize: 13 }}>{fmtShort(c.totalSpent)}</td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{daysAgoLabel(c.lastVisit)}</td>
                  <td className="num">{c.openCredit > 0 ? <span className="mono" style={{ fontSize: 13, color: 'var(--warn)' }}>{fmt(c.openCredit)}</span> : <span className="mono" style={{ fontSize: 12, color: 'var(--fg-4)' }}>—</span>}</td>
                  <td className="num mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{fmtShort(c.avgTicket)}</td>
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
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Showing {filtered.length} of {CUSTOMERS.length} customers</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Total lifetime value: <span style={{ color: 'var(--fg-2)' }}>{fmtShort(totalSpent)}</span></span>
        </div>
      </div>
    </AppShell>
  );
}
