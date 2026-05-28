'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmtDate } from '../../lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ReportCard {
  id: string;
  icon: React.ReactNode;
  name: string;
  desc: string;
  color: string;
  lastRun: Date;
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  recipients: string[];
  lastSent: Date;
  nextSend: Date;
  enabled: boolean;
}

interface RecentExport {
  id: string;
  name: string;
  period: string;
  format: 'CSV' | 'PDF';
  generated: Date;
  size: string;
}

// ── Seeded Data ───────────────────────────────────────────────────────────────
const TODAY = new Date(2026, 4, 25);
const daysAgo = (n: number) => new Date(TODAY.getTime() - n * 86400000);
const daysAhead = (n: number) => new Date(TODAY.getTime() + n * 86400000);

const REPORT_CARDS: ReportCard[] = [
  {
    id: 'sales',
    icon: Icons.analytics,
    name: 'Sales Summary',
    desc: 'Daily sales totals, top products, payment breakdown and revenue by category.',
    color: 'var(--accent)',
    lastRun: daysAgo(1),
  },
  {
    id: 'inventory',
    icon: Icons.inventory,
    name: 'Inventory Valuation',
    desc: 'Cost and retail value of all stock on hand, sorted by category.',
    color: 'var(--good)',
    lastRun: daysAgo(3),
  },
  {
    id: 'tax',
    icon: Icons.receipt,
    name: 'Tax Statement',
    desc: 'VAT collected, taxable revenue and TRA-ready summary for compliance.',
    color: 'var(--warn)',
    lastRun: daysAgo(7),
  },
  {
    id: 'credit',
    icon: Icons.credit,
    name: 'Credit Aged Debtors',
    desc: 'Accounts receivable aged 0–30, 31–60, 61–90, 90+ days with contact details.',
    color: 'var(--bad)',
    lastRun: daysAgo(2),
  },
];

const SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: 'sr1',
    name: 'Daily Sales Summary',
    frequency: 'Daily',
    recipients: ['hamisi@dukakuu.co.tz', 'amina@dukakuu.co.tz'],
    lastSent: daysAgo(1),
    nextSend: daysAhead(0),
    enabled: true,
  },
  {
    id: 'sr2',
    name: 'Weekly Inventory Valuation',
    frequency: 'Weekly',
    recipients: ['hamisi@dukakuu.co.tz'],
    lastSent: daysAgo(5),
    nextSend: daysAhead(2),
    enabled: true,
  },
  {
    id: 'sr3',
    name: 'Monthly Tax Statement',
    frequency: 'Monthly',
    recipients: ['hamisi@dukakuu.co.tz', 'accountant@cpagroup.co.tz'],
    lastSent: daysAgo(25),
    nextSend: daysAhead(5),
    enabled: true,
  },
  {
    id: 'sr4',
    name: 'Credit Aged Debtors',
    frequency: 'Weekly',
    recipients: ['hamisi@dukakuu.co.tz'],
    lastSent: daysAgo(8),
    nextSend: daysAhead(6),
    enabled: false,
  },
  {
    id: 'sr5',
    name: 'Monthly Supplier Payments',
    frequency: 'Monthly',
    recipients: ['hamisi@dukakuu.co.tz', 'finance@dukakuu.co.tz'],
    lastSent: daysAgo(30),
    nextSend: daysAhead(0),
    enabled: true,
  },
];

const RECENT_EXPORTS: RecentExport[] = [
  { id: 're1',  name: 'Sales Summary',          period: '1 – 24 May 2026',   format: 'PDF', generated: daysAgo(1),  size: '284 KB' },
  { id: 're2',  name: 'Sales Summary',          period: '18 – 24 May 2026',  format: 'CSV', generated: daysAgo(1),  size: '48 KB'  },
  { id: 're3',  name: 'Inventory Valuation',    period: '24 May 2026',       format: 'PDF', generated: daysAgo(3),  size: '512 KB' },
  { id: 're4',  name: 'Inventory Valuation',    period: '24 May 2026',       format: 'CSV', generated: daysAgo(3),  size: '92 KB'  },
  { id: 're5',  name: 'Tax Statement',          period: 'April 2026',        format: 'PDF', generated: daysAgo(7),  size: '196 KB' },
  { id: 're6',  name: 'Credit Aged Debtors',    period: '23 May 2026',       format: 'CSV', generated: daysAgo(2),  size: '34 KB'  },
  { id: 're7',  name: 'Sales Summary',          period: 'April 2026',        format: 'PDF', generated: daysAgo(11), size: '318 KB' },
  { id: 're8',  name: 'Monthly Tax Statement',  period: 'March 2026',        format: 'PDF', generated: daysAgo(18), size: '204 KB' },
  { id: 're9',  name: 'Supplier Payments',      period: 'April 2026',        format: 'CSV', generated: daysAgo(25), size: '56 KB'  },
  { id: 're10', name: 'Inventory Valuation',    period: 'March 2026',        format: 'PDF', generated: daysAgo(31), size: '498 KB' },
];

const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This year'];

// ── Sub-components ────────────────────────────────────────────────────────────
function QuickExportCard({ card }: { card: ReportCard }) {
  const [range, setRange] = useState('Last 30 days');

  return (
    <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
      {/* Card head */}
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: card.color === 'var(--accent)' ? 'var(--accent-soft)' :
                        card.color === 'var(--good)'   ? 'var(--good-soft)'   :
                        card.color === 'var(--warn)'   ? 'var(--warn-soft)'   : 'var(--bad-soft)',
            color: card.color, display: 'grid', placeItems: 'center',
            border: '1px solid ' + (card.color === 'var(--accent)' ? 'var(--accent-line)' :
                                     card.color === 'var(--good)'   ? 'rgba(52,211,153,0.3)'  :
                                     card.color === 'var(--warn)'   ? 'rgba(251,191,36,0.3)'  : 'rgba(251,113,133,0.3)'),
          }}>
            {card.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 3 }}>{card.name}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.45 }}>{card.desc}</div>
          </div>
        </div>
      </div>
      {/* Controls */}
      <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 5 }}>DATE RANGE</div>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{
              width: '100%', padding: '7px 10px', borderRadius: 6,
              border: '1px solid var(--line-2)', background: 'var(--bg)',
              color: 'var(--fg)', fontSize: 12.5, fontFamily: 'inherit', outline: 0, cursor: 'pointer',
            }}
          >
            {DATE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-soft" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icons.download} CSV
          </button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icons.download} PDF
          </button>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>
          Last run: {fmtDate(card.lastRun)}
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 36, height: 20, borderRadius: 999,
        background: enabled ? 'var(--accent)' : 'var(--bg-4)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 150ms', padding: 0, flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: enabled ? 18 : 2,
        width: 16, height: 16, borderRadius: 999,
        background: '#fff', transition: 'left 150ms',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

function ScheduledTab() {
  const [rows, setRows] = useState(SCHEDULED_REPORTS);
  const toggle = (id: string) => setRows(rows.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  const freqColor: Record<string, string> = { Daily: 'var(--accent)', Weekly: 'var(--good)', Monthly: 'var(--warn)' };

  return (
    <div className="surface" style={{ overflow: 'hidden' }}>
      <div className="card-head">
        <span className="card-title">Scheduled reports</span>
        <button className="btn btn-primary" style={{ fontSize: 12.5, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
          {Icons.plus} Schedule report
        </button>
      </div>
      <div className="table-scroll">
      <table className="table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Report name</th>
            <th>Frequency</th>
            <th>Recipients</th>
            <th>Last sent</th>
            <th>Next send</th>
            <th style={{ textAlign: 'center' }}>Active</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.name}</div>
              </td>
              <td>
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '2px 9px', borderRadius: 999, fontSize: 11.5,
                    background: r.frequency === 'Daily'   ? 'var(--accent-soft)' :
                                r.frequency === 'Weekly'  ? 'var(--good-soft)'   : 'var(--warn-soft)',
                    color: freqColor[r.frequency],
                    border: '1px solid ' + (r.frequency === 'Daily'  ? 'var(--accent-line)'          :
                                           r.frequency === 'Weekly' ? 'rgba(52,211,153,0.3)'         : 'rgba(251,191,36,0.3)'),
                  }}
                >
                  {r.frequency}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {r.recipients.map((email, i) => (
                    <span key={i} className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>{email}</span>
                  ))}
                </div>
              </td>
              <td className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                {fmtDate(r.lastSent)}
              </td>
              <td className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>
                {fmtDate(r.nextSend)}
              </td>
              <td style={{ textAlign: 'center' }}>
                <ToggleSwitch enabled={r.enabled} onChange={() => toggle(r.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function HistoryTab() {
  return (
    <div className="surface" style={{ overflow: 'hidden' }}>
      <div className="card-head">
        <span className="card-title">Recent exports</span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>Last 30 days · {RECENT_EXPORTS.length} files</span>
      </div>
      <div className="table-scroll">
      <table className="table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Report</th>
            <th>Period</th>
            <th>Format</th>
            <th>Generated</th>
            <th className="num">Size</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          {RECENT_EXPORTS.map((ex) => (
            <tr key={ex.id}>
              <td style={{ fontSize: 13.5, fontWeight: 500 }}>{ex.name}</td>
              <td className="mono" style={{ fontSize: 12, color: 'var(--fg-2)' }}>{ex.period}</td>
              <td>
                <span
                  className="pill"
                  style={{
                    background: ex.format === 'PDF' ? 'rgba(251,113,133,0.09)' : 'var(--good-soft)',
                    color: ex.format === 'PDF' ? 'var(--bad)' : 'var(--good)',
                    borderColor: ex.format === 'PDF' ? 'rgba(251,113,133,0.3)' : 'rgba(52,211,153,0.3)',
                  }}
                >
                  {ex.format}
                </span>
              </td>
              <td className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{fmtDate(ex.generated)}</td>
              <td className="mono num" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{ex.size}</td>
              <td>
                <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {Icons.download} Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [tab, setTab] = useState<'overview' | 'scheduled' | 'history'>('overview');

  return (
    <AppShell
      crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '/' }, { label: 'Reports' }]}
      actions={
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.reports} Generate report
        </button>
      }
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Reports</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
            Export, schedule and review all business reports for Duka Kuu.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icons.filter} Filter
          </button>
          <button className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icons.settings} Configure
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {(['overview', 'scheduled', 'history'] as const).map((t) => {
          const labels: Record<string, string> = { overview: 'Overview', scheduled: 'Scheduled', history: 'History' };
          return (
            <button key={t} className={'tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>
              {labels[t]}
              {t === 'scheduled' && (
                <span className="mono" style={{ marginLeft: 6, fontSize: 10, color: tab === t ? 'var(--accent)' : 'var(--fg-4)' }}>
                  {SCHEDULED_REPORTS.filter((r) => r.enabled).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <>
          {/* AI nudge */}
          <div
            className="surface"
            style={{
              padding: '13px 16px', marginBottom: 18,
              borderColor: 'var(--accent-line)',
              background: 'linear-gradient(180deg, var(--accent-soft) 0%, var(--bg-2) 100%)',
              display: 'flex', gap: 12, alignItems: 'center',
            }}
          >
            <span style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--bg-2)', border: '1px solid var(--accent-line)',
              display: 'grid', placeItems: 'center', color: 'var(--accent)', flexShrink: 0,
            }}>
              {Icons.sparkles}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, marginBottom: 2 }}>
                <strong style={{ fontWeight: 500 }}>May report ready.</strong>{' '}
                Your monthly tax statement for May 2026 can now be generated. TRA filing deadline is 15 Jun.
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>Tax Statement · VAT period: 1–31 May 2026</div>
            </div>
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              {Icons.reports} Generate PDF
            </button>
          </div>

          {/* Quick export grid */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-2)' }}>Quick export</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)' }}>4 report types</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12 }}>
              {REPORT_CARDS.map((card) => (
                <QuickExportCard key={card.id} card={card} />
              ))}
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-3)', gap: 12, marginTop: 18 }}>
            <div className="surface" style={{ padding: '16px 18px' }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>REPORTS THIS MONTH</div>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>47</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--good)', marginTop: 6 }}>↗ +12 vs last month</div>
            </div>
            <div className="surface" style={{ padding: '16px 18px' }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>SCHEDULED ACTIVE</div>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>
                {SCHEDULED_REPORTS.filter((r) => r.enabled).length}
                <span style={{ fontSize: 14, color: 'var(--fg-4)', fontWeight: 400 }}>/{SCHEDULED_REPORTS.length}</span>
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>auto-delivered reports</div>
            </div>
            <div className="surface" style={{ padding: '16px 18px' }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>STORAGE USED</div>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em' }}>4.2 <span style={{ fontSize: 14, color: 'var(--fg-4)', fontWeight: 400 }}>MB</span></div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>last 12 months · 128 files</div>
            </div>
          </div>
        </>
      )}

      {tab === 'scheduled' && <ScheduledTab />}
      {tab === 'history' && <HistoryTab />}
    </AppShell>
  );
}
