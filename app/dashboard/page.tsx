'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AppShell, useNotifications } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';
import { analyticsApi, transactionApi, type DashboardData, type TransactionListItem } from '../../lib/api';
import { getCachedUser } from '../../lib/auth';

// ── KPI Spark ─────────────────────────────────────────────────────────────────
function KPISpark({ data, color }: { data: number[]; color: string }) {
  const w = 200, h = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return [x, y];
  });
  const d    = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
  const fill = d + ` L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <path d={fill} fill={color} opacity="0.1" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPI({ label, value, delta, deltaKind = 'good', subtitle, spark, accent = 'var(--accent)', compact }: {
  label: string; value: string;
  delta?: string; deltaKind?: 'good' | 'bad' | 'warn';
  subtitle?: string; spark?: number[]; accent?: string; compact?: boolean;
}) {
  return (
    <div className="surface" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--fg-3)', letterSpacing: '0.07em' }}>{label}</span>
        {delta && (
          <span className={'pill ' + deltaKind} style={{ gap: 3, display: 'flex', alignItems: 'center', fontSize: 10 }}>
            {deltaKind === 'good' ? Icons.arrowUpRight : deltaKind === 'bad' ? Icons.arrowDownRight : null}
            {delta}
          </span>
        )}
      </div>
      <div>
        <div className="dash-kpi-v" style={{ fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>
        {subtitle && <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 3 }}>{subtitle}</div>}
      </div>
      {spark && spark.length > 1 && (
        <div style={{ height: 28, marginTop: 'auto' }} className="page-sec">
          <KPISpark data={spark} color={accent} />
        </div>
      )}
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

/** Format a TZS value for a chart axis: 0 → "0", 78000 → "78K", 1240000 → "1.24M" */
function fmtAxis(v: number): string {
  if (v === 0) return '0';
  if (v >= 1_000_000) {
    const n = v / 1_000_000;
    return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(n < 10 ? 2 : 1)) + 'M';
  }
  if (v >= 1_000) return Math.round(v / 1_000) + 'K';
  return String(Math.round(v));
}

/** Round up to a "nice" number (1/2/5 × 10^n) for clean Y-axis max. */
function niceMax(v: number): number {
  if (v <= 0) return 100_000;
  const mag  = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

function SalesChart({ hourly }: { hourly: { hour: number; label: string; revenue: number }[] }) {
  // Build a full 24-hour array (0–23), filling missing hours with 0
  const hourMap = new Map(hourly.map(h => [h.hour, h.revenue]));
  const fullData = Array.from({ length: 24 }, (_, hr) => hourMap.get(hr) ?? 0);

  const w = 920, h = 230, pad = { l: 52, r: 20, t: 20, b: 32 };
  const rawMax  = Math.max(...fullData);
  const axisMax = niceMax(rawMax || 10_000);   // at least 10K so chart has height
  const stepX   = (w - pad.l - pad.r) / 23;   // 24 points → 23 gaps
  const yScale  = (v: number) => h - pad.b - (v / axisMax) * (h - pad.t - pad.b);
  const xScale  = (i: number) => pad.l + i * stepX;

  const linePath = fullData.map((v, i) => (i === 0 ? 'M' : 'L') + xScale(i).toFixed(1) + ',' + yScale(v).toFixed(1)).join(' ');
  const areaPath = linePath + ` L ${xScale(23)},${h - pad.b} L ${pad.l},${h - pad.b} Z`;

  // 5 Y-axis ticks: 0, 25%, 50%, 75%, 100% of axisMax
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(axisMax * f));

  // Peak: ignore hour 0 (likely 0 revenue)
  const peakIdx = fullData.reduce((best, v, i) => v > fullData[best] ? i : best, 0);
  const hasPeak = rawMax > 0;

  // Tooltip stays left of right edge, right of left edge
  const tipW = 118, tipH = 30;
  const tipX = Math.min(Math.max(xScale(peakIdx) - tipW / 2, pad.l), w - pad.r - tipW);
  const tipY = Math.max(yScale(rawMax) - tipH - 8, pad.t);

  return (
    <div className="sales-chart-container" style={{ padding: '8px 16px 16px' }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.20" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines + labels */}
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={yScale(t)} y2={yScale(t)}
              stroke="var(--line)" strokeDasharray="2 5" strokeOpacity="0.6" />
            <text x={pad.l - 8} y={yScale(t) + 4} textAnchor="end"
              fontSize="10.5" fill="var(--fg-3)" fontFamily="var(--mono)">
              {fmtAxis(t)}
            </text>
          </g>
        ))}

        {/* X-axis hour labels — every 2 hours: 00 02 04 … 22 */}
        {fullData.map((_, i) => i % 2 === 0 && (
          <text key={i} x={xScale(i)} y={h - 8} textAnchor="middle"
            fontSize="10.5" fill="var(--fg-3)" fontFamily="var(--mono)">
            {String(i).padStart(2, '0')}
          </text>
        ))}

        {/* Area fill + line */}
        <path d={areaPath} fill="url(#salesFill)" />
        <path d={linePath} fill="none" stroke="var(--accent)"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Peak marker + tooltip */}
        {hasPeak && (
          <>
            <line
              x1={xScale(peakIdx)} x2={xScale(peakIdx)}
              y1={yScale(rawMax)} y2={h - pad.b}
              stroke="var(--accent)" strokeDasharray="3 3" strokeOpacity="0.4"
            />
            <circle cx={xScale(peakIdx)} cy={yScale(rawMax)} r="4.5"
              fill="var(--bg-2)" stroke="var(--accent)" strokeWidth="2" />
            <g transform={`translate(${tipX}, ${tipY})`}>
              <rect width={tipW} height={tipH} rx="6"
                fill="var(--bg)" stroke="var(--line-2)" strokeWidth="1" />
              <text x="9" y="11.5" fontSize="9.5" fill="var(--fg-4)"
                fontFamily="var(--mono)" letterSpacing="0.05em">
                PEAK · {String(peakIdx).padStart(2, '0')}:00
              </text>
              <text x="9" y="24" fontSize="12" fill="var(--fg)"
                fontFamily="var(--mono)" fontWeight="600">
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

function RecentTransactions({ rows, loading }: { rows: TransactionListItem[]; loading: boolean }) {
  function timeLabel(iso: string) {
    try { return new Date(iso).toLocaleTimeString('en-TZ', { hour: '2-digit', minute: '2-digit', hour12: false }); } catch { return ''; }
  }

  return (
    <div className="surface" style={{ overflow: 'hidden' }}>
      <div className="card-head">
        <span className="card-title">Sales today</span>
        <Link href="/transactions" className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>View all {Icons.chevRight}</Link>
      </div>

      {loading ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--fg-4)' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
        </div>
      ) : rows.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>No transactions today.</div>
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
            <div style={{ minWidth: 620 }}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '110px 1fr 100px 140px 96px 52px',
                columnGap: 12,
                padding: '9px 18px',
                fontSize: 10, color: 'var(--fg-4)', fontFamily: 'var(--mono)',
                letterSpacing: '0.08em', borderBottom: '1px solid var(--line)',
              }}>
                <span>TXN ID</span>
                <span>CUSTOMER</span>
                <span>METHOD</span>
                <span style={{ textAlign: 'right' }}>AMOUNT</span>
                <span>STATUS</span>
                <span style={{ textAlign: 'right' }}>TIME</span>
              </div>
              {/* Rows */}
              {rows.map((r, i) => (
                <div key={r.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 100px 140px 96px 52px',
                  columnGap: 12,
                  padding: '11px 18px',
                  fontSize: 12.5, alignItems: 'center',
                  borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 0,
                }}>
                  <Link href={`/transactions/${r.id}`} className="mono"
                    style={{ color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.txn_number}
                  </Link>
                  <span style={{ color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.customer_name}
                  </span>
                  <span className="mono" style={{ color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.payment_method}
                  </span>
                  <span className="mono" style={{ color: 'var(--fg)', fontWeight: 500, textAlign: 'right' }}>
                    {fmt(r.total)}
                  </span>
                  <span><StatusPill s={r.status} /></span>
                  <span className="mono" style={{ color: 'var(--fg-3)', textAlign: 'right', fontSize: 11.5 }}>
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
function TodaySummary({ kpis, credit, loading }: { kpis: DashboardData['kpis_today'] | null; credit: DashboardData['credit_kpi'] | null; loading: boolean }) {
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
    { label: 'Revenue',    value: fmt(kpis.revenue),       color: undefined    },
    { label: 'Refunds',    value: kpis.refund_total > 0 ? `−${fmt(kpis.refund_total)}` : '—', color: kpis.refund_total > 0 ? 'var(--bad)' : undefined },
    { label: 'Net sales',  value: fmt(netSales),            color: 'var(--fg)'  },
    { label: 'Cost',       value: `−${fmt(cost)}`,          color: undefined    },
    { label: 'Profit',     value: fmt(kpis.profit),         color: 'var(--good)'},
  ] as const;

  return (
    <div className="surface">
      <div className="card-head">
        <span className="card-title">Today</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>{new Date().toLocaleDateString('en-TZ', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</span>
      </div>
      <div style={{ padding: '4px 16px' }}>
        {rows.map(({ label, value, color }, i) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 0, fontSize: 13 }}>
            <span style={{ color: 'var(--fg-2)' }}>{label}</span>
            <span className="mono" style={{ color: color ?? 'var(--fg)' }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-3)', borderRadius: '0 0 10px 10px', flexWrap: 'wrap' }}>
        {[
          ['MARGIN', kpis.margin_pct.toFixed(1) + '%'],
          ['SALES',  String(kpis.transaction_count)],
          ['AVG',    fmtShort(kpis.avg_ticket)],
        ].map(([lbl, val]) => (
          <div key={lbl} style={{ flex: 1, minWidth: 60 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>{lbl}</div>
            <div style={{ fontSize: 17, fontWeight: 500, marginTop: 2 }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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

  const user      = typeof window !== 'undefined' ? getCachedUser() : null;
  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    analyticsApi.getDashboard().then(res => {
      if (res.success) setDash(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    transactionApi.getRecent(10).then(res => {
      if (res.success) setTxns(res.data);
      setTxnLoad(false);
    }).catch(() => setTxnLoad(false));
  }, []);

  const nudgeItem = dash?.low_stock.find(p => p.stock === 0 || p.status === 'critical');

  const totalRevenue = dash?.kpis_today.revenue ?? 0;
  const hourlySpark  = dash?.hourly_today.map(h => h.revenue) ?? [];

  return (
    <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '#' }, { label: 'Dashboard' }]}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .dash-filter-row { width: 100%; }
          .sales-chart-container svg { height: 180px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>{greeting()}, {firstName}.</h1>
            <p className="desktop-only" style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="dot-s" style={{ background: 'var(--good)', flexShrink: 0 }}></span> live
            </p>
          </div>
          <div className="dash-filter-row" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="date-seg-wrap">
              {['Today', '7D', '30D', '90D', 'YTD'].map((l, i) => (
                <button key={l} onClick={() => setRange(i)} className={range === i ? 'range-active' : ''} style={{ padding: '6px 12px', fontSize: 12.5, background: range === i ? 'var(--bg-3)' : 'transparent', color: range === i ? 'var(--fg)' : 'var(--fg-3)', border: 0, borderRight: i < 4 ? '1px solid var(--line)' : 0, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
              ))}
            </div>
            <button className="btn btn-ghost desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{Icons.download} Export</button>
          </div>
        </div>
      </div>

      {/* AI nudge (first critical low-stock item) */}
      {aiVisible && nudgeItem && (
        <div style={{ marginBottom: 16 }}>
          <AINudge item={nudgeItem} onDismiss={() => setAiVisible(false)} />
        </div>
      )}

      {/* KPI row — 2×2 on mobile */}
      <style>{`
        .dash-kpi-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
        @media (min-width:640px) { .dash-kpi-grid { grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; } }
        .dash-kpi-grid .surface { padding:12px 14px; min-height:unset; }
        @media (min-width:640px) { .dash-kpi-grid .surface { padding:16px 18px; min-height:130px; } }
        .dash-kpi-v { font-size:20px; }
        @media (min-width:640px) { .dash-kpi-v { font-size:26px; } }
      `}</style>
      <div className="dash-kpi-grid">
        <KPI
          label="SALES"
          value={loading ? '—' : fmtShort(totalRevenue)}
          delta={!loading && dash?.kpis_today.revenue_delta_pct != null ? `${dash.kpis_today.revenue_delta_pct > 0 ? '+' : ''}${dash.kpis_today.revenue_delta_pct}%` : undefined}
          deltaKind={(dash?.kpis_today.revenue_delta_pct ?? 0) >= 0 ? 'good' : 'bad'}
          subtitle={loading ? undefined : 'today'}
          spark={hourlySpark}
          compact
        />
        <KPI
          label="PROFIT"
          value={loading ? '—' : fmtShort(dash!.kpis_today.profit)}
          subtitle={loading ? undefined : `${dash!.kpis_today.margin_pct}% margin`}
          spark={hourlySpark.map(v => v * 0.22)}
          compact
        />
        <KPI
          label="TICKETS"
          value={loading ? '—' : String(dash!.kpis_today.transaction_count)}
          delta={!loading && dash?.kpis_today.transaction_delta_pct != null ? `${dash.kpis_today.transaction_delta_pct > 0 ? '+' : ''}${dash.kpis_today.transaction_delta_pct}%` : undefined}
          deltaKind={(dash?.kpis_today.transaction_delta_pct ?? 0) >= 0 ? 'good' : 'bad'}
          subtitle={loading ? undefined : `avg ${fmtShort(dash!.kpis_today.avg_ticket)}`}
          spark={hourlySpark.map((_, i) => i)}
          compact
        />
        <KPI
          label="CREDIT"
          value={loading ? '—' : fmtShort(dash?.credit_kpi.total ?? 0)}
          subtitle={loading ? undefined : `${dash?.credit_kpi.customer_count ?? 0} cust`}
          deltaKind="warn"
          accent="var(--warn)"
          compact
        />
      </div>

      {/* Sales chart + payment mix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12, marginBottom: 16 }}>
        <div className="surface">
          <div className="card-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="card-title">Sales by hour</span>
              <span className="pill" style={{ background: 'var(--bg-3)' }}>today</span>
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
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>today</span>
          </div>
          <PaymentMix slices={dash?.payment_mix ?? []} total={totalRevenue} />
        </div>
      </div>

      {/* Recent txns + today summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12, marginBottom: 16 }}>
        <RecentTransactions rows={txns} loading={txnLoad} />
        <TodaySummary kpis={dash?.kpis_today ?? null} credit={dash?.credit_kpi ?? null} loading={loading} />
      </div>

      {/* Top products + low stock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12 }}>
        <TopProducts products={dash?.top_products ?? []} loading={loading} />
        <LowStock items={dash?.low_stock ?? []} loading={loading} />
      </div>
    </AppShell>
  );
}
