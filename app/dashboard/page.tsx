'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AppShell, useNotifications } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort, localDateStr } from '../../lib/utils';
import { analyticsApi, transactionApi, reportsApi, type DashboardData, type TransactionListItem } from '../../lib/api';
import { getCachedUser } from '../../lib/auth';

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPI({ label, value, delta, deltaKind = 'good', subtitle, accent = 'var(--accent)' }: {
  label: string; value: string;
  delta?: string; deltaKind?: 'good' | 'bad' | 'warn';
  subtitle?: string; accent?: string;
}) {
  return (
    <div className="surface kpi-card" style={{
      display: 'flex', flexDirection: 'column',
      borderTop: `3px solid ${accent}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>{label}</span>
        {delta && (
          <span className={'pill ' + deltaKind} style={{ gap: 3, display: 'flex', alignItems: 'center', fontSize: 10 }}>
            {deltaKind === 'good' ? Icons.arrowUpRight : deltaKind === 'bad' ? Icons.arrowDownRight : null}
            {delta}
          </span>
        )}
      </div>
      <div className="dash-kpi-v" style={{ fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      {subtitle && <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 8 }}>{subtitle}</div>}
    </div>
  );
}

// ── Cycling KPI (mobile only) ───────────────────────────────────────────────────
// Alternates between two KPI variants on a timer to save space on narrow
// screens, where showing 5 distinct cards doesn't fit well. Desktop shows
// both as separate cards instead — see the KPI grid below.
function CyclingKPI({ variants, intervalMs = 3500 }: {
  variants: { label: string; value: string; subtitle?: string; accent: string }[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (variants.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % variants.length), intervalMs);
    return () => clearInterval(t);
  }, [variants.length, intervalMs]);

  const v = variants[idx] ?? variants[0];
  if (!v) return null;

  return (
    <div className="surface kpi-card" style={{
      display: 'flex', flexDirection: 'column',
      borderTop: `3px solid ${v.accent}`, transition: 'border-color 250ms',
    }}>
      <style>{`@keyframes kpiFade { from { opacity: 0.3; } to { opacity: 1; } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>{v.label}</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {variants.map((_, i) => (
            <span key={i} style={{
              width: 4, height: 4, borderRadius: 999,
              background: i === idx ? v.accent : 'var(--line-2)',
              transition: 'background 250ms',
            }} />
          ))}
        </div>
      </div>
      <div key={idx} className="dash-kpi-v" style={{ fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, animation: 'kpiFade 250ms ease' }}>{v.value}</div>
      {v.subtitle && <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 8 }}>{v.subtitle}</div>}
    </div>
  );
}

// ── AI Nudge ──────────────────────────────────────────────────────────────────
const NUDGE_DURATION = 6000;

function AINudge({ item, onDismiss }: { item: { name: string; stock: number; min_stock: number }; onDismiss: () => void }) {
  const { addNotification } = useNotifications();
  const [progress, setProgress] = useState(100);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef(Date.now());
  const dismissedRef = useRef(false);

  const handleDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    addNotification({ id: 'ai-' + Date.now(), icon: '✦', color: 'var(--accent)', title: 'Low stock: ' + item.name, sub: `${item.stock} units left`, time: 'Just now', unread: true });
    onDismiss();
  };

  useEffect(() => {
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / NUDGE_DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) { handleDismiss(); return; }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="surface" style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', borderColor: 'var(--accent-line)', background: 'linear-gradient(180deg, var(--accent-soft) 0%, var(--bg-2) 100%)', position: 'relative' }}>
      <button className="mobile-only" onClick={handleDismiss} style={{ position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: 999, border: 'none', background: 'var(--bg-3)', color: 'var(--fg-3)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 14 }}>×</button>
      <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)', flexShrink: 0 }}>{Icons.sparkles}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--fg)' }}>{item.name}</strong> — <strong style={{ color: 'var(--bad)' }}>{item.stock} units</strong> left (reorder at {item.min_stock}).
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>{Icons.sparkles} Draft restock</button>
          <Link href="/inventory" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5 }}>View inventory</Link>
          <button className="btn btn-ghost desktop-only" style={{ padding: '6px 12px', fontSize: 12.5, marginLeft: 'auto' }} onClick={handleDismiss}>Dismiss</button>
        </div>
        <div style={{ height: 2, background: 'var(--bg-3)', borderRadius: 1, overflow: 'hidden', marginTop: 10 }}>
          <div style={{ width: progress + '%', height: '100%', background: 'var(--accent)', opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}

// ── Sales Chart ───────────────────────────────────────────────────────────────

function fmtAxis(v: number): string {
  if (v === 0) return '0';
  if (v >= 1_000_000) {
    const n = v / 1_000_000;
    return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(n < 10 ? 2 : 1)) + 'M';
  }
  if (v >= 1_000) return Math.round(v / 1_000) + 'K';
  return String(Math.round(v));
}

function niceMax(v: number): number {
  if (v <= 0) return 100_000;
  const mag  = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

function smoothCurve(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

type ChartView = 'sales' | 'profit' | 'discounts' | 'credits' | 'expenses';

const CHART_VIEWS: { key: ChartView; label: string; color: string; field: 'revenue' | 'profit' | 'discount_amount' | 'credit_amount' | 'expense_amount' }[] = [
  { key: 'sales',     label: 'Sales',     color: 'var(--accent)', field: 'revenue'         },
  { key: 'profit',    label: 'Profit',    color: '#10b981',       field: 'profit'          },
  { key: 'discounts', label: 'Discounts', color: '#60a5fa',       field: 'discount_amount' },
  { key: 'credits',   label: 'Credits',   color: '#fb7185',       field: 'credit_amount'   },
  { key: 'expenses',  label: 'Expenses',  color: '#ef4444',       field: 'expense_amount'  },
];

// Auto-cycles: Sales (5s) → Profit (4s) → Sales (5s) → Profit (4s) …
// Discounts, Credits and Expenses are manual-only — user pins them by clicking.
const AUTO_CYCLE: ChartView[] = ['sales', 'profit'];
const AUTO_DURATIONS: Record<ChartView, number> = { sales: 5000, profit: 4000, discounts: 0, credits: 0, expenses: 0 };

function SalesChart({ hourly }: { hourly: { hour: number; label: string; revenue: number; profit: number; discount_amount: number; credit_amount: number; expense_amount: number; txn_count: number }[] }) {
  const [view,   setView]   = useState<ChartView>('sales');
  const [pinned, setPinned] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-cycle between Sales and Profit when not pinned
  useEffect(() => {
    if (pinned) return;
    const current = CHART_VIEWS.find(v => v.key === view) ?? CHART_VIEWS[0];
    const duration = AUTO_DURATIONS[current.key];
    if (!duration) return;
    timerRef.current = setTimeout(() => {
      const idx = AUTO_CYCLE.indexOf(view);
      setView(AUTO_CYCLE[(idx + 1) % AUTO_CYCLE.length]);
    }, duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [view, pinned]);

  function handleTabClick(key: ChartView) {
    setView(key);
    setPinned(true);
  }

  const currentCfg = CHART_VIEWS.find(v => v.key === view) ?? CHART_VIEWS[0];
  const color = currentCfg.color;

  const hourMap  = new Map(hourly.map(h => [h.hour, h[currentCfg.field]]));
  const fullData = Array.from({ length: 24 }, (_, hr) => hourMap.get(hr) ?? 0);

  const w = 920, h = 240, pad = { l: 56, r: 24, t: 28, b: 36 };
  const rawMax  = Math.max(...fullData);
  const axisMax = niceMax(rawMax || 10_000);
  const stepX   = (w - pad.l - pad.r) / 23;
  const yScale  = (v: number) => h - pad.b - (v / axisMax) * (h - pad.t - pad.b);
  const xScale  = (i: number) => pad.l + i * stepX;

  const pts: [number, number][] = fullData.map((v, i) => [xScale(i), yScale(v)]);
  const linePath = smoothCurve(pts);
  const areaPath = linePath + ` L${xScale(23).toFixed(1)},${(h - pad.b).toFixed(1)} L${pad.l},${(h - pad.b).toFixed(1)} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(axisMax * f));
  const peakIdx = fullData.reduce((best, v, i) => v > fullData[best] ? i : best, 0);
  const hasPeak = rawMax > 0;

  const tipW = 124, tipH = 52;
  const tipX = Math.min(Math.max(xScale(peakIdx) - tipW / 2, pad.l), w - pad.r - tipW);
  const tipY = Math.max(yScale(rawMax) - tipH - 14, pad.t);

  const gradId = `chartFill-${view}`;
  const glowId = `chartGlow-${view}`;

  return (
    <div className="sales-chart-container" style={{ padding: '4px 16px 16px' }}>
      {/* View tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {CHART_VIEWS.map(cv => (
          <button
            key={cv.key}
            onClick={() => handleTabClick(cv.key)}
            style={{
              padding: '4px 11px',
              fontSize: 11.5,
              borderRadius: 6,
              border: view === cv.key ? `1.5px solid ${cv.color}` : '1.5px solid var(--line)',
              background: view === cv.key ? cv.color + '18' : 'transparent',
              color: view === cv.key ? cv.color : 'var(--fg-3)',
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              fontWeight: view === cv.key ? 600 : 400,
              transition: 'all 140ms',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {view === cv.key && !pinned && AUTO_CYCLE.includes(cv.key) && (
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: cv.color, display: 'inline-block', animation: 'pulse 1.4s ease-in-out infinite' }} />
            )}
            {cv.label}
          </button>
        ))}
        {pinned && (
          <button
            onClick={() => { setPinned(false); setView('sales'); }}
            style={{ padding: '4px 9px', fontSize: 11, borderRadius: 6, border: '1.5px solid var(--line)', background: 'transparent', color: 'var(--fg-4)', cursor: 'pointer', fontFamily: 'var(--mono)' }}
            title="Resume auto-cycle"
          >↺</button>
        )}
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.32" />
            <stop offset="60%"  stopColor={color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={color} stopOpacity="0"    />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {yTicks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={yScale(t)} y2={yScale(t)}
              stroke="var(--line)" strokeOpacity="0.6" strokeWidth="1" />
            <text x={pad.l - 10} y={yScale(t) + 4} textAnchor="end"
              fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">
              {fmtAxis(t)}
            </text>
          </g>
        ))}

        {[0, 3, 6, 9, 12, 15, 18, 21].map(i => (
          <text key={i} x={xScale(i)} y={h - 8} textAnchor="middle"
            fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">
            {String(i).padStart(2, '0')}
          </text>
        ))}

        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color}
          strokeWidth="4" strokeOpacity="0.18" strokeLinecap="round"
          filter={`url(#${glowId})`} />
        <path d={linePath} fill="none" stroke={color}
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {fullData.map((v, i) => v > 0 && (
          <circle key={i} cx={xScale(i)} cy={yScale(v)} r="3.5"
            fill="var(--bg-2)" stroke={color} strokeWidth="2" />
        ))}

        {hasPeak && (
          <>
            <line x1={xScale(peakIdx)} x2={xScale(peakIdx)}
              y1={yScale(rawMax)} y2={h - pad.b}
              stroke={color} strokeDasharray="4 4" strokeOpacity="0.45" />
            <circle cx={xScale(peakIdx)} cy={yScale(rawMax)} r="5.5"
              fill="var(--bg-2)" stroke={color} strokeWidth="2.5" />
            <circle cx={xScale(peakIdx)} cy={yScale(rawMax)} r="2.5"
              fill={color} />
            <g transform={`translate(${tipX},${tipY})`}>
              <rect width={tipW} height={tipH} rx="8"
                fill="var(--bg)" stroke="var(--line-2)" strokeWidth="1" />
              <text x="12" y="17" fontSize="9.5" fill="var(--fg-4)"
                fontFamily="var(--mono)" letterSpacing="0.06em">
                PEAK · {String(peakIdx).padStart(2, '0')}:00
              </text>
              <line x1="12" x2={tipW - 12} y1="25" y2="25"
                stroke="var(--line)" strokeWidth="1" />
              <text x="12" y="41" fontSize="14" fill="var(--fg)"
                fontFamily="var(--mono)" fontWeight="700" letterSpacing="-0.01em">
                {fmtShort(rawMax)}
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}

// ── Payment Mix ───────────────────────────────────────────────────────────────
const METHOD_COLORS: Record<string, string> = {
  'M-Pesa':    '#10b981',
  'Cash':      'var(--accent)',
  'Tigo Pesa': '#f59e0b',
  'Bank':      '#60a5fa',
  'Credit':    '#fb7185',
};

function PaymentMix({ slices, total }: { slices: { method: string; amount: number; pct: number }[]; total: number }) {
  if (slices.length === 0) {
    return <div style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--fg-4)', fontSize: 13 }}>No sales today.</div>;
  }

  const R = 56, r = 38, cx = 70, cy = 70;
  let acc = 0;
  const arcs = slices.map(s => {
    const start = acc / 100 * Math.PI * 2 - Math.PI / 2;
    acc += s.pct;
    const end   = acc / 100 * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end),   y2 = cy + R * Math.sin(end);
    const x3 = cx + r * Math.cos(end),   y3 = cy + r * Math.sin(end);
    const x4 = cx + r * Math.cos(start), y4 = cy + r * Math.sin(start);
    return { d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`, color: METHOD_COLORS[s.method] ?? '#888' };
  });

  return (
    <div style={{ padding: '16px 18px', display: 'flex', gap: 18, alignItems: 'center' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="11" fill="var(--fg-3)" fontFamily="var(--mono)" letterSpacing="0.06em">TODAY</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="15" fill="var(--fg)" fontWeight="500">{fmtShort(total).replace('TZS ','')}</text>
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {slices.map(s => (
          <div key={s.method} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, alignItems: 'center', fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: METHOD_COLORS[s.method] ?? '#888', display: 'inline-block' }}></span>
            <span style={{ color: 'var(--fg-2)' }}>{s.method}</span>
            <span className="mono" style={{ color: 'var(--fg)' }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recent Transactions ───────────────────────────────────────────────────────
function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = { paid: 'good', credit: 'warn', refunded: 'bad' };
  const labels: Record<string, string> = { paid: 'Paid', credit: 'Credit', refunded: 'Refunded' };
  return <span className={'pill ' + (map[s] ?? '')} style={{ fontSize: 9.5 }}>{labels[s] ?? s}</span>;
}

function RecentTransactions({ rows, loading, rangeLabel }: { rows: TransactionListItem[]; loading: boolean; rangeLabel: string }) {
  function timeLabel(iso: string) {
    try { return new Date(iso).toLocaleTimeString('en-TZ', { hour: '2-digit', minute: '2-digit', hour12: false }); } catch { return ''; }
  }

  return (
    <div className="surface" style={{ overflow: 'hidden' }}>
      <div className="card-head">
        <span className="card-title">Sales · {rangeLabel}</span>
        <Link href="/transactions" className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>View all {Icons.chevRight}</Link>
      </div>

      {loading ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--fg-4)' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
        </div>
      ) : rows.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No transactions for {rangeLabel}.</div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="mobile-only">
            {rows.slice(0, 6).map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: i < Math.min(rows.length, 6) - 1 ? '1px solid var(--line)' : 0 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{r.customer_name}</span>
                    <StatusPill s={r.status} />
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 3 }}>
                    {r.txn_number} · {r.payment_method} · {timeLabel(r.created_at)}
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 13, color: 'var(--fg)', flexShrink: 0 }}>{fmt(r.total)}</span>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="desktop-only table-scroll">
            <div style={{ minWidth: 640 }}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 120px 160px 88px 68px',
                columnGap: 0,
                padding: '8px 20px',
                fontSize: 10, color: 'var(--fg-4)', fontFamily: 'var(--mono)',
                letterSpacing: '0.08em', borderBottom: '1px solid var(--line)',
                background: 'var(--bg-3)',
              }}>
                <span>TXN ID</span>
                <span>CUSTOMER</span>
                <span>METHOD</span>
                <span style={{ textAlign: 'right' }}>AMOUNT</span>
                <span style={{ textAlign: 'center' }}>STATUS</span>
                <span style={{ textAlign: 'right' }}>TIME</span>
              </div>
              {/* Rows */}
              {rows.map((r, i) => (
                <div key={r.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr 120px 160px 88px 68px',
                  columnGap: 0,
                  padding: '13px 20px',
                  alignItems: 'center',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 0,
                  transition: 'background 120ms',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <Link href={`/transactions/${r.id}`} className="mono"
                    style={{ color: 'var(--accent)', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {r.txn_number}
                  </Link>
                  <span style={{ fontSize: 13, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
                    {r.customer_name}
                  </span>
                  <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.payment_method}
                  </span>
                  <span className="mono" style={{ fontSize: 13, color: 'var(--fg)', fontWeight: 600, textAlign: 'right', letterSpacing: '-0.01em' }}>
                    {fmt(r.total)}
                  </span>
                  <span style={{ display: 'flex', justifyContent: 'center' }}>
                    <StatusPill s={r.status} />
                  </span>
                  <span className="mono" style={{ color: 'var(--fg-3)', textAlign: 'right', fontSize: 12 }}>
                    {timeLabel(r.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Top Products ──────────────────────────────────────────────────────────────
function TopProducts({ products, loading }: { products: DashboardData['top_products']; loading: boolean }) {
  const maxRev = products[0]?.revenue || 1;
  return (
    <div className="surface">
      <div className="card-head">
        <span className="card-title">Top products</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>last 7 days</span>
      </div>
      {loading ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--fg-4)' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No sales data.</div>
      ) : (
        <div className="table-scroll">
          <div style={{ padding: '8px 0', minWidth: 360 }}>
            {products.map((r, i) => (
              <div key={r.product_id} style={{ padding: '10px 16px', display: 'grid', gridTemplateColumns: '20px 1fr 60px 90px', gap: 12, alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{String(i + 1).padStart(2, '0')}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.product_name}</div>
                  <div style={{ height: 3, marginTop: 6, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: (r.revenue / maxRev * 100) + '%', height: '100%', background: 'var(--accent)' }}></div>
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{r.qty_sold} sold</span>
                <span className="mono" style={{ fontSize: 11.5, textAlign: 'right' }}>{fmtShort(r.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Low Stock ─────────────────────────────────────────────────────────────────
function LowStock({ items, loading }: { items: DashboardData['low_stock']; loading: boolean }) {
  return (
    <div className="surface">
      <div className="card-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="card-title">Low stock</span>
          {items.length > 0 && <span className="pill warn">{items.length}</span>}
        </div>
        <Link href="/inventory" className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12 }}>Manage {Icons.chevRight}</Link>
      </div>
      {loading ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--fg-4)' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--good)', fontSize: 13 }}>All products stocked.</div>
      ) : (
        <>
          {items.map((item, i) => {
            const pct = item.min_stock > 0 ? Math.min(100, item.stock / item.min_stock * 100) : 0;
            const bad = item.status === 'critical' || item.stock === 0;
            return (
              <div key={item.id} style={{ padding: '12px 16px', borderBottom: i < items.length - 1 ? '1px solid var(--line)' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 12.5 }}>{item.name}</span>
                  <span className={'pill ' + (bad ? 'bad' : 'warn')}>{item.stock === 0 ? 'Out' : item.status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--fg)' }}>{item.stock}</span>
                  <div style={{ flex: 1, height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: bad ? 'var(--bad)' : 'var(--warn)' }}></div>
                  </div>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>min {item.min_stock}</span>
                </div>
              </div>
            );
          })}
          <div style={{ padding: 12, borderTop: '1px solid var(--line)' }}>
            <button className="btn btn-soft" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icons.sparkles} Auto-draft restock
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Today Summary ─────────────────────────────────────────────────────────────
function TodaySummary({ kpis, credit, loading, rangeLabel }: { kpis: DashboardData['kpis_today'] | null; credit: DashboardData['credit_kpi'] | null; loading: boolean; rangeLabel: string }) {
  if (loading || !kpis) {
    return (
      <div className="surface">
        <div className="card-head"><span className="card-title">Summary</span></div>
        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--fg-4)' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  const netSales = kpis.revenue - kpis.refund_total;
  const cost     = kpis.revenue - kpis.profit - kpis.tax_collected;

  const rows = [
    { label: 'Revenue',   value: fmt(kpis.revenue),       color: undefined    },
    { label: 'Refunds',   value: kpis.refund_total > 0 ? `−${fmt(kpis.refund_total)}` : '—', color: kpis.refund_total > 0 ? 'var(--bad)' : undefined },
    { label: 'Net sales', value: fmt(netSales),            color: 'var(--fg)'  },
    { label: 'Cost',      value: `−${fmt(cost)}`,          color: 'var(--bad)' },
    { label: 'Gross profit', value: fmt(kpis.profit),      color: 'var(--good)'},
  ] as const;

  return (
    <div className="surface">
      <div className="card-head">
        <span className="card-title" style={{ textTransform: 'capitalize' }}>{rangeLabel}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{new Date().toLocaleDateString('en-TZ', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</span>
      </div>
      <div style={{ padding: '4px 16px' }}>
        {rows.map(({ label, value, color }, i) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '11px 0',
            borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 0,
            fontSize: 13,
          }}>
            <span style={{ color: 'var(--fg-2)' }}>{label}</span>
            <span className="mono" style={{ color: color ?? 'var(--fg)', fontWeight: i === rows.length - 1 ? 600 : 400 }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--line)',
        display: 'flex', gap: 12, alignItems: 'center',
        background: 'var(--bg-3)', borderRadius: '0 0 10px 10px',
        flexWrap: 'wrap',
      }}>
        {[
          ['MARGIN', kpis.margin_pct.toFixed(1) + '%'],
          ['SALES',  String(kpis.transaction_count)],
          ['AVG',    fmtShort(kpis.avg_ticket)],
        ].map(([lbl, val]) => (
          <div key={lbl} style={{ flex: 1, minWidth: 60 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>{lbl}</div>
            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 3, letterSpacing: '-0.02em' }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const RANGE_LABELS = ['Today', '7D', '30D', '90D', 'YTD'] as const;

function getRangeDates(range: number): { dateFrom: string; dateTo: string; label: string } {
  const today = new Date();
  const todayStr = localDateStr(today);
  const sub   = (days: number) => { const d = new Date(today); d.setDate(d.getDate() - days); return localDateStr(d); };
  switch (range) {
    case 1:  return { dateFrom: sub(6),   dateTo: todayStr, label: 'last 7 days'  };
    case 2:  return { dateFrom: sub(29),  dateTo: todayStr, label: 'last 30 days' };
    case 3:  return { dateFrom: sub(89),  dateTo: todayStr, label: 'last 90 days' };
    case 4:  return { dateFrom: `${today.getFullYear()}-01-01`, dateTo: todayStr, label: 'year to date' };
    default: return { dateFrom: todayStr, dateTo: todayStr, label: 'today'        };
  }
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const [aiVisible, setAiVisible] = useState(true);
  const [range,     setRange]     = useState(0);

  const [dash,     setDash]     = useState<DashboardData | null>(null);
  const [txns,     setTxns]     = useState<TransactionListItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [txnLoad,  setTxnLoad]  = useState(true);
  const [exporting, setExporting] = useState(false);

  const user      = typeof window !== 'undefined' ? getCachedUser() : null;
  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    const { dateFrom, dateTo } = getRangeDates(range);
    const params = `date_from=${dateFrom}&date_to=${dateTo}`;

    setLoading(true);
    setTxnLoad(true);

    analyticsApi.getDashboard(params).then(res => {
      if (res.success) setDash(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    transactionApi.getList(
      `date_from=${dateFrom}&date_to=${dateTo}&ordering=-created_at&page_size=20`
    ).then(res => {
      if (res.success) setTxns(res.data);
      setTxnLoad(false);
    }).catch(() => setTxnLoad(false));
  }, [range]);

  const nudgeItem    = dash?.low_stock.find(p => p.stock === 0 || p.status === 'critical');
  const totalRevenue = dash?.kpis_today.revenue ?? 0;
  const { label: rangeLabel } = getRangeDates(range);

  async function handleExport() {
    const { dateFrom, dateTo } = getRangeDates(range);
    setExporting(true);
    await reportsApi.generateCSV('sales', { dateFrom, dateTo });
    setExporting(false);
  }

  return (
    <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '#' }, { label: 'Dashboard' }]}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        @media (max-width: 640px) {
          .dash-filter-row { width: 100%; }
          .sales-chart-container svg { height: 180px; }
        }
        .date-seg-wrap { display:flex; border:1px solid var(--line); border-radius:8px; overflow:hidden; }
        .dash-kpi-grid .surface { padding-top:14px; }
        .kpi-card { border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{greeting()}, {firstName}.</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--fg-3)' }}>
              {new Date().toLocaleDateString('en-TZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="dash-filter-row" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="date-seg-wrap">
              {RANGE_LABELS.map((l, i) => (
                <button
                  key={l}
                  onClick={() => setRange(i)}
                  style={{
                    padding: '6px 14px', fontSize: 12.5,
                    background: range === i ? 'var(--bg-3)' : 'transparent',
                    color: range === i ? 'var(--fg)' : 'var(--fg-3)',
                    border: 0,
                    borderRight: i < RANGE_LABELS.length - 1 ? '1px solid var(--line)' : 0,
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: range === i ? 600 : 400,
                    transition: 'background 100ms, color 100ms',
                  }}
                >{l}</button>
              ))}
            </div>
            <button
              className="btn btn-ghost desktop-only"
              onClick={handleExport}
              disabled={exporting}
              style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: exporting ? 0.6 : 1 }}
            >
              {Icons.download} {exporting ? 'Exporting…' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      {/* AI nudge (first critical low-stock item) */}
      {aiVisible && nudgeItem && (
        <div style={{ marginBottom: 16 }}>
          <AINudge item={nudgeItem} onDismiss={() => setAiVisible(false)} />
        </div>
      )}

      {/* KPI row — desktop: 5 distinct cards. Mobile: Discounts + Expenses
          share one cycling card slot (2x2 grid) to save space. */}
      <style>{`
        .dash-kpi-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
        @media (min-width:769px) { .dash-kpi-grid { grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:16px; } }
        .dash-kpi-grid .surface { padding:14px 16px; min-height:unset; }
        @media (min-width:769px) { .dash-kpi-grid .surface { padding:16px 20px; min-height:110px; } }
        .dash-kpi-v { font-size:22px; }
        @media (min-width:769px) { .dash-kpi-v { font-size:28px; } }
      `}</style>
      <div className="dash-kpi-grid">
        <KPI
          label="SALES"
          value={loading ? '—' : fmtShort(totalRevenue)}
          delta={!loading && dash?.kpis_today.revenue_delta_pct != null ? `${dash.kpis_today.revenue_delta_pct > 0 ? '+' : ''}${dash.kpis_today.revenue_delta_pct}%` : undefined}
          deltaKind={(dash?.kpis_today.revenue_delta_pct ?? 0) >= 0 ? 'good' : 'bad'}
          subtitle={loading ? undefined : `${dash?.kpis_today.transaction_count ?? 0} transactions ${rangeLabel}`}
          accent="var(--accent)"
        />
        <KPI
          label="PROFIT"
          value={loading ? '—' : fmtShort(dash?.kpis_today.profit ?? 0)}
          subtitle={loading ? undefined : `${dash?.kpis_today.margin_pct ?? 0}% margin`}
          accent="#10b981"
        />
        <KPI
          label="CREDIT"
          value={loading ? '—' : fmtShort(dash?.credit_kpi.total ?? 0)}
          subtitle={loading ? undefined : `${dash?.credit_kpi.customer_count ?? 0} customers`}
          deltaKind="warn"
          accent="var(--warn)"
        />

        {/* Desktop: Discounts + Expenses as their own cards */}
        <div className="desktop-only">
          <KPI
            label="DISCOUNTS"
            value={loading ? '—' : fmtShort(dash?.kpis_today.discount_amount ?? 0)}
            subtitle={loading ? undefined : (dash?.kpis_today.discounted_count ?? 0) > 0 ? `${dash?.kpis_today.discounted_count} discounted sales` : 'no discounts today'}
            accent="#60a5fa"
          />
        </div>
        <div className="desktop-only">
          <KPI
            label="EXPENSES"
            value={loading ? '—' : fmtShort(dash?.kpis_today.expense_amount ?? 0)}
            subtitle={loading ? undefined : (dash?.kpis_today.expense_count ?? 0) > 0 ? `${dash?.kpis_today.expense_count} expenses logged` : 'no expenses today'}
            accent="var(--bad)"
          />
        </div>

        {/* Mobile: Discounts and Expenses alternate in one card to fit a 2x2 grid */}
        <div className="mobile-only">
          <CyclingKPI
            variants={[
              {
                label: 'DISCOUNTS',
                value: loading ? '—' : fmtShort(dash?.kpis_today.discount_amount ?? 0),
                subtitle: loading ? undefined : (dash?.kpis_today.discounted_count ?? 0) > 0 ? `${dash?.kpis_today.discounted_count} discounted sales` : 'no discounts today',
                accent: '#60a5fa',
              },
              {
                label: 'EXPENSES',
                value: loading ? '—' : fmtShort(dash?.kpis_today.expense_amount ?? 0),
                subtitle: loading ? undefined : (dash?.kpis_today.expense_count ?? 0) > 0 ? `${dash?.kpis_today.expense_count} expenses logged` : 'no expenses today',
                accent: 'var(--bad)',
              },
            ]}
          />
        </div>
      </div>

      {/* Sales chart + payment mix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12, marginBottom: 16 }}>
        <div className="surface">
          <div className="card-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="card-title">By hour</span>
              <span className="pill" style={{ background: 'var(--bg-3)' }}>{rangeLabel}</span>
            </div>
            {dash && (
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                {dash.kpis_today.transaction_count} sales · {fmtShort(totalRevenue)}
              </span>
            )}
          </div>
          <SalesChart hourly={dash?.hourly_today ?? []} />
        </div>
        <div className="surface">
          <div className="card-head">
            <span className="card-title">Payment mix</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{rangeLabel}</span>
          </div>
          <PaymentMix slices={dash?.payment_mix ?? []} total={totalRevenue} />
        </div>
      </div>

      {/* Sales table + summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12, marginBottom: 16 }}>
        <RecentTransactions rows={txns} loading={txnLoad} rangeLabel={rangeLabel} />
        <TodaySummary kpis={dash?.kpis_today ?? null} credit={dash?.credit_kpi ?? null} loading={loading} rangeLabel={rangeLabel} />
      </div>

      {/* Top products + low stock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12 }}>
        <TopProducts products={dash?.top_products ?? []} loading={loading} />
        <LowStock items={dash?.low_stock ?? []} loading={loading} />
      </div>
    </AppShell>
  );
}
