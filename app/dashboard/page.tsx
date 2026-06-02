'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AppShell, useNotifications } from '../../components/app-shell';
import { Icons } from '../../components/icons';
import { fmt, fmtShort } from '../../lib/utils';

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
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
  const dFill = d + ` L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      <path d={dFill} fill={color} opacity="0.1" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
interface KPIProps {
  label: string;
  value: string;
  delta?: string;
  deltaKind?: 'good' | 'bad' | 'warn';
  subtitle?: string;
  spark?: number[];
  accent?: string;
}

function KPI({ label, value, delta, deltaKind = 'good', subtitle, spark, accent = 'var(--accent)' }: KPIProps) {
  return (
    <div className="surface" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 130 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>{label}</span>
        {delta && (
          <span className={'pill ' + deltaKind} style={{ gap: 3, display: 'flex', alignItems: 'center' }}>
            {deltaKind === 'good' ? Icons.arrowUpRight : deltaKind === 'bad' ? Icons.arrowDownRight : null}
            {delta}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>
        {subtitle && <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 4 }}>{subtitle}</div>}
      </div>
      {spark && (
        <div style={{ height: 32, marginTop: 'auto' }}>
          <KPISpark data={spark} color={accent} />
        </div>
      )}
    </div>
  );
}

// ── AI Nudge ──────────────────────────────────────────────────────────────────
const NUDGE_DURATION = 5000; // ms before auto-dismiss

function AINudge({ onDismiss }: { onDismiss: () => void }) {
  const { addNotification } = useNotifications();
  const [progress, setProgress] = useState(100);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef(Date.now());
  const dismissedRef = useRef(false);

  const handleDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    addNotification({
      id: 'ai-insight-' + Date.now(),
      icon: '✦',
      color: 'var(--accent)',
      title: 'AI Insight: Restock alert',
      sub: 'Sabuni ya OMO 1kg · 3 units left · runs out Monday',
      time: 'Just now',
      unread: true,
    });
    onDismiss();
  };

  useEffect(() => {
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / NUDGE_DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        handleDismiss();
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="surface" style={{
      padding: '16px 18px',
      display: 'flex', gap: 14, alignItems: 'flex-start',
      borderColor: 'var(--accent-line)',
      background: 'linear-gradient(180deg, var(--accent-soft) 0%, var(--bg-2) 100%)',
      position: 'relative',
    }}>
      {/* Mobile-only × close button */}
      <button
        className="mobile-only"
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          position: 'absolute', top: 10, right: 10,
          width: 24, height: 24, borderRadius: 999,
          border: 'none', background: 'var(--bg-3)',
          color: 'var(--fg-3)', cursor: 'pointer',
          display: 'grid', placeItems: 'center', fontSize: 14, lineHeight: 1,
        }}
      >×</button>

      <span style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'var(--bg-2)', border: '1px solid var(--accent-line)',
        display: 'grid', placeItems: 'center', color: 'var(--accent)',
        flexShrink: 0,
      }}>{Icons.sparkles}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Ziada AI noticed something.</span>
          <span className="pill accent">insight</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--fg)' }}>Sabuni ya OMO 1kg</strong> is down to <strong style={{ color: 'var(--fg)' }}>3 units</strong> and selling 42/week. You&apos;ll run out by <strong style={{ color: 'var(--fg)' }}>Monday morning</strong>. Draft a restock?
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.sparkles} Draft restock for 200 units
          </button>
          <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12.5 }}>See projection</button>
          {/* Desktop-only Dismiss text button */}
          <button className="btn btn-ghost desktop-only" style={{ padding: '6px 12px', fontSize: 12.5, marginLeft: 'auto' }} onClick={handleDismiss}>Dismiss</button>
        </div>

        {/* Countdown progress bar */}
        <div style={{ height: 2, background: 'var(--bg-3)', borderRadius: 1, overflow: 'hidden', marginTop: 12 }}>
          <div style={{
            width: progress + '%', height: '100%',
            background: 'var(--accent)', opacity: 0.6,
          }} />
        </div>
      </div>
    </div>
  );
}

// ── Sales Chart ───────────────────────────────────────────────────────────────
function SalesChart() {
  const data = [12,8,15,10,14,28,42,68,95,140,180,210,260,290,310,295,270,230,180,135,95,60,40,22];
  const labels = ['00','','02','','04','','06','','08','','10','','12','','14','','16','','18','','20','','22',''];
  const w = 900, h = 220, pad = { l: 38, r: 16, t: 16, b: 28 };
  const max = Math.max(...data);
  const stepX = (w - pad.l - pad.r) / (data.length - 1);
  const yScale = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b);
  const xScale = (i: number) => pad.l + i * stepX;
  const linePath = data.map((v, i) => (i === 0 ? 'M' : 'L') + xScale(i).toFixed(1) + ',' + yScale(v).toFixed(1)).join(' ');
  const areaPath = linePath + ` L ${xScale(data.length-1)},${h-pad.b} L ${pad.l},${h-pad.b} Z`;
  const yTicks = [0, max*0.25, max*0.5, max*0.75, max].map(Math.round);
  const peakIdx = data.indexOf(max);

  return (
    <div style={{ padding: '16px 18px' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} x2={w-pad.r} y1={yScale(t)} y2={yScale(t)} stroke="var(--line)" strokeDasharray="2 4" />
            <text x={pad.l - 8} y={yScale(t) + 3} textAnchor="end" fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">
              {t === 0 ? '0' : (t/1000).toFixed(0) + 'K'}
            </text>
          </g>
        ))}
        {labels.map((l, i) => l && (
          <text key={i} x={xScale(i)} y={h - 10} textAnchor="middle" fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">{l}</text>
        ))}
        <path d={areaPath} fill="url(#salesFill)" />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <line x1={xScale(peakIdx)} x2={xScale(peakIdx)} y1={yScale(max)} y2={h-pad.b} stroke="var(--accent)" strokeDasharray="2 3" strokeOpacity="0.5" />
        <circle cx={xScale(peakIdx)} cy={yScale(max)} r="4" fill="var(--bg-2)" stroke="var(--accent)" strokeWidth="2" />
        <g transform={`translate(${xScale(peakIdx) - 64}, ${yScale(max) - 38})`}>
          <rect width="128" height="30" rx="6" fill="var(--bg)" stroke="var(--line-2)" />
          <text x="10" y="13" fontSize="9.5" fill="var(--fg-4)" fontFamily="var(--mono)">PEAK · 13:00</text>
          <text x="10" y="24" fontSize="11" fill="var(--fg)" fontWeight="500">TZS 310,000</text>
        </g>
      </svg>
    </div>
  );
}

// ── Payment Mix ───────────────────────────────────────────────────────────────
function PaymentMix() {
  const slices = [
    { label: 'M-Pesa',    v: 48, color: '#10b981' },
    { label: 'Cash',      v: 28, color: 'var(--accent)' },
    { label: 'Tigo Pesa', v: 14, color: '#f59e0b' },
    { label: 'Bank',      v: 7,  color: '#60a5fa' },
    { label: 'Credit',    v: 3,  color: '#fb7185' },
  ];
  const total = slices.reduce((s, x) => s + x.v, 0);
  const R = 56, r = 38, cx = 70, cy = 70;
  let acc = 0;
  const arcs = slices.map((s) => {
    const start = acc / total * Math.PI * 2 - Math.PI / 2;
    acc += s.v;
    const end = acc / total * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end),   y2 = cy + R * Math.sin(end);
    const x3 = cx + r * Math.cos(end),   y3 = cy + r * Math.sin(end);
    const x4 = cx + r * Math.cos(start), y4 = cy + r * Math.sin(start);
    const d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`;
    return { d, color: s.color };
  });
  return (
    <div style={{ padding: '16px 18px', display: 'flex', gap: 18, alignItems: 'center' }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="11" fill="var(--fg-3)" fontFamily="var(--mono)" letterSpacing="0.06em">TODAY</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="16" fill="var(--fg)" fontWeight="500">1.24M</text>
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {slices.map((s) => (
          <div key={s.label} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, alignItems: 'center', fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: 'inline-block' }}></span>
            <span style={{ color: 'var(--fg-2)' }}>{s.label}</span>
            <span className="mono" style={{ color: 'var(--fg)' }}>{s.v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recent Transactions ───────────────────────────────────────────────────────
const TXN_ROWS = [
  ['#TXN-2042', 'Walk-in',   'M-Pesa',    271400, 'completed', '14:32'],
  ['#TXN-2041', 'Fatuma A.', 'Credit',     38500, 'credit',    '14:21'],
  ['#TXN-2040', 'Walk-in',   'Cash',        6200, 'completed', '14:18'],
  ['#TXN-2039', 'Juma K.',   'M-Pesa',     84200, 'completed', '14:04'],
  ['#TXN-2038', 'Walk-in',   'Tigo Pesa',  22000, 'completed', '13:55'],
  ['#TXN-2037', 'Asha M.',   'Credit',     54200, 'credit',    '13:42'],
  ['#TXN-2036', 'Walk-in',   'Cash',       12800, 'refunded',  '13:31'],
  ['#TXN-2035', 'Walk-in',   'M-Pesa',     46500, 'completed', '13:18'],
] as const;

function TxnStatusPill({ s }: { s: string }) {
  return s === 'completed' ? <span className="pill good" style={{ fontSize: 9.5 }}>{s}</span> :
         s === 'credit'    ? <span className="pill warn" style={{ fontSize: 9.5 }}>{s}</span> :
         s === 'refunded'  ? <span className="pill bad"  style={{ fontSize: 9.5 }}>{s}</span> :
                             <span className="pill"      style={{ fontSize: 9.5 }}>{s}</span>;
}

// Card-list layout — shown on mobile only
function RecentTxnMobile() {
  return (
    <div className="surface mobile-only" style={{ overflow: 'hidden' }}>
      <div className="card-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="card-title">Recent transactions</span>
          <span className="pill" style={{ background: 'var(--bg-3)', fontSize: 10 }}>last hour</span>
        </div>
      </div>
      {TXN_ROWS.slice(0, 6).map(([id, who, method, amt, status, time], i, arr) => (
        <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 0 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>{who}</span>
              <TxnStatusPill s={status} />
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 3 }}>
              {id} · {method} · {time}
            </div>
          </div>
          <span className="mono" style={{ fontSize: 13, color: 'var(--fg)', flexShrink: 0 }}>{fmt(amt)}</span>
        </div>
      ))}
      <div style={{ padding: 12, borderTop: '1px solid var(--line)' }}>
        <Link href="/transactions" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 5 }}>
          View all transactions {Icons.chevRight}
        </Link>
      </div>
    </div>
  );
}

function RecentTxn() {
  const rows = TXN_ROWS;

  const statusPill = (s: string) =>
    s === 'completed' ? <span className="pill good">{s}</span> :
    s === 'credit'    ? <span className="pill warn">{s}</span> :
    s === 'refunded'  ? <span className="pill bad">{s}</span> :
                        <span className="pill">{s}</span>;

  return (
    <div className="surface" style={{ overflow: 'hidden' }}>
      <div className="card-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="card-title">Recent transactions</span>
          <span className="pill" style={{ background: 'var(--bg-3)' }}>last hour</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.filter} Filter</button>
          <Link href="/transactions" className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>View all {Icons.chevRight}</Link>
        </div>
      </div>
      <div className="table-scroll">
        <div style={{ minWidth: 580 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 110px 130px 110px 60px',
            padding: '10px 16px',
            fontSize: 10, color: 'var(--fg-4)', fontFamily: 'var(--mono)', letterSpacing: '0.08em',
            borderBottom: '1px solid var(--line)',
          }}>
            <span>TXN ID</span><span>CUSTOMER</span><span>METHOD</span>
            <span style={{ textAlign: 'right' }}>AMOUNT</span><span>STATUS</span>
            <span style={{ textAlign: 'right' }}>TIME</span>
          </div>
          {rows.map(([id, who, method, amt, status, time], i) => (
            <div key={id} style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 110px 130px 110px 60px',
              padding: '11px 16px',
              fontSize: 12.5,
              alignItems: 'center',
              borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 0,
              cursor: 'pointer',
            }}>
              <Link href={`/transactions/${id.replace('#', '')}`} className="mono" style={{ color: 'var(--accent)' }}>{id}</Link>
              <span style={{ color: 'var(--fg)' }}>{who}</span>
              <span className="mono" style={{ color: 'var(--fg-2)' }}>{method}</span>
              <span className="mono" style={{ color: 'var(--fg)', textAlign: 'right' }}>{fmt(amt)}</span>
              <span>{statusPill(status)}</span>
              <span className="mono" style={{ color: 'var(--fg-3)', textAlign: 'right' }}>{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Top Products ──────────────────────────────────────────────────────────────
function TopProducts() {
  const rows = [
    { name: 'Unga wa Sembe 10kg',   sold: 50, rev: 1425000, share: 100, trend: [3,4,5,4,6,5,7,8] },
    { name: 'Mafuta ya Cooking 5L', sold: 34, rev: 1156000, share: 81,  trend: [4,3,5,4,5,6,7,8] },
    { name: 'Mchele Pishori 5kg',   sold: 22, rev: 484000,  share: 34,  trend: [2,3,3,4,3,5,4,6] },
    { name: 'Sabuni ya OMO 1kg',    sold: 42, rev: 260400,  share: 18,  trend: [5,4,6,5,7,6,8,9] },
    { name: 'Sukari 2kg',           sold: 26, rev: 182000,  share: 13,  trend: [2,2,3,2,3,3,4,3] },
    { name: 'Chai Bora 500g',       sold: 18, rev: 86400,   share: 6,   trend: [1,2,1,2,3,2,3,4] },
  ];
  return (
    <div className="surface">
      <div className="card-head">
        <span className="card-title">Top products this week</span>
        <button className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>{Icons.download} Export</button>
      </div>
      <div className="table-scroll">
      <div style={{ padding: '8px 0', minWidth: 460 }}>
        {rows.map((r, i) => (
          <div key={r.name} style={{
            padding: '10px 16px',
            display: 'grid',
            gridTemplateColumns: '20px 1fr 60px 90px 110px',
            gap: 12, alignItems: 'center',
          }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-4)' }}>{String(i+1).padStart(2,'0')}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
              <div style={{ height: 3, marginTop: 6, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: r.share + '%', height: '100%', background: 'var(--accent)' }}></div>
              </div>
            </div>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{r.sold} sold</span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg)', textAlign: 'right' }}>{fmtShort(r.rev)}</span>
            <div style={{ height: 22 }}>
              <KPISpark data={r.trend} color="var(--accent)" />
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

// ── Low Stock ─────────────────────────────────────────────────────────────────
function LowStock() {
  const rows = [
    ['Sabuni ya OMO 1kg',    3,  20, 'critical'],
    ['Sukari 2kg',           8,  20, 'low'],
    ['Mafuta ya Cooking 1L', 12, 30, 'low'],
    ['Chai Bora 500g',       14, 30, 'low'],
  ] as const;
  return (
    <div className="surface">
      <div className="card-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="card-title">Low stock</span>
          <span className="pill warn">4 alerts</span>
        </div>
        <Link href="/inventory" className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>Manage {Icons.chevRight}</Link>
      </div>
      <div>
        {rows.map(([name, qty, reorder, s], i) => (
          <div key={name} style={{ padding: '12px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 12.5, color: 'var(--fg)' }}>{name}</span>
              <span className={'pill ' + (s === 'critical' ? 'bad' : 'warn')}>{s}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--fg)' }}>{qty}</span>
              <div style={{ flex: 1, height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: Math.min(100, qty/reorder*100) + '%', height: '100%', background: s === 'critical' ? 'var(--bad)' : 'var(--warn)' }}></div>
              </div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>reorder @ {reorder}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid var(--line)' }}>
        <button className="btn btn-soft" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icons.sparkles} Auto-draft restock for all
        </button>
      </div>
    </div>
  );
}

// ── Today Summary ─────────────────────────────────────────────────────────────
function TodaySummary() {
  const rows = [
    ['Gross sales',   'TZS 1,240,000', null],
    ['Refunds',       '− TZS 12,800',  null],
    ['Net sales',     'TZS 1,227,200', 'var(--fg)'],
    ['Cost of goods', '− TZS 968,000', null],
    ['Gross profit',  'TZS 272,000',   'var(--good)'],
  ] as const;
  return (
    <div className="surface">
      <div className="card-head">
        <span className="card-title">Today&apos;s summary</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--fg-4)' }}>SAT · 24 MAY 2026</span>
      </div>
      <div style={{ padding: '4px 16px' }}>
        {rows.map(([l, v, c], i, arr) => (
          <div key={l} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 0,
            fontSize: 13,
          }}>
            <span style={{ color: 'var(--fg-2)' }}>{l}</span>
            <span className="mono" style={{ color: c || 'var(--fg)' }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--line)', display: 'flex', gap: 16, alignItems: 'center', background: 'var(--bg-3)', borderRadius: '0 0 10px 10px' }}>
        {[['MARGIN','22.2%'],['TICKETS','87'],['AVG TICKET','14.1K']].map(([lbl, val]) => (
          <div key={lbl} style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.06em' }}>{lbl}</div>
            <div style={{ fontSize: 18, fontWeight: 500, marginTop: 2 }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [aiVisible, setAiVisible] = useState(true);
  const [range, setRange] = useState(0);

  return (
    <AppShell crumbs={[{ label: 'ziada', href: '/' }, { label: 'Duka Kuu', href: '#' }, { label: 'Dashboard' }]}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Good afternoon, Hamisi.</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>
              Here&apos;s how <strong style={{ color: 'var(--fg-2)', fontWeight: 500 }}>Duka Kuu — Kariakoo</strong> is doing today.
              <span className="mono" style={{ marginLeft: 10, color: 'var(--fg-4)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span className="dot-s" style={{ background: 'var(--good)' }}></span> live · synced 6s ago
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="date-seg-wrap">
              {['Today', '7D', '30D', '90D', 'YTD'].map((l, i) => (
                <button key={l} onClick={() => setRange(i)} className={range === i ? 'range-active' : ''} style={{
                  padding: '6px 12px', fontSize: 12.5,
                  background: range === i ? 'var(--bg-3)' : 'transparent',
                  color: range === i ? 'var(--fg)' : 'var(--fg-3)',
                  border: 0,
                  borderRight: i < 4 ? '1px solid var(--line)' : 0,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>{l}</button>
              ))}
            </div>
            <button className="btn btn-ghost desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{Icons.download} Export</button>
          </div>
        </div>
      </div>

      {aiVisible && (
        <div style={{ marginBottom: 16 }}>
          <AINudge onDismiss={() => setAiVisible(false)} />
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-4)', gap: 12, marginBottom: 16 }}>
        <KPI label="TODAY'S SALES" value="TZS 1.24M" delta="+18.2%" deltaKind="good" subtitle="vs. yesterday TZS 1.05M" spark={[3,4,3,5,4,6,5,7,8,7,9,10,9,11,12,11,10,12,13,14]} />
        <KPI label="GROSS PROFIT" value="TZS 272K" delta="+12.4%" deltaKind="good" subtitle="22.2% margin" spark={[2,3,2,4,3,4,5,4,6,5,7,6,8,7,9,8,9,10,9,11]} />
        <KPI label="TICKETS" value="87" delta="+9" deltaKind="good" subtitle="avg TZS 14.1K · 87 today" spark={[5,6,5,7,6,7,8,7,9,8,9,10,9,11,10,11,12,11,12,13]} />
        <KPI label="OUTSTANDING CREDIT" value="TZS 184K" delta="−4.1%" deltaKind="good" subtitle="14 customers · 3 overdue" spark={[9,9,8,9,8,8,7,8,7,7,8,7,6,7,6,6,7,6,6,5]} />
      </div>

      {/* Sales chart + payment mix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12, marginBottom: 16 }}>
        <div className="surface">
          <div className="card-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="card-title">Sales by hour</span>
              <span className="pill" style={{ background: 'var(--bg-3)' }}>today</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['Revenue','TZS 1.24M',true],['Tickets','87',false],['Items','342',false]].map(([l,v,a]) => (
                <button key={l as string} style={{
                  padding: '5px 10px', fontSize: 12,
                  background: a ? 'var(--bg-3)' : 'transparent',
                  color: a ? 'var(--fg)' : 'var(--fg-3)',
                  border: '1px solid ' + (a ? 'var(--line-2)' : 'transparent'),
                  borderRadius: 5, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>{l} <span className="mono" style={{ fontSize: 10, color: a ? 'var(--accent)' : 'var(--fg-4)' }}>{v}</span></button>
              ))}
            </div>
          </div>
          <SalesChart />
        </div>
        <div className="surface">
          <div className="card-head">
            <span className="card-title">Payment mix</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>last 24h</span>
          </div>
          <PaymentMix />
        </div>
      </div>

      {/* Recent txn + today summary */}
      {/* Mobile: card-list; Desktop: table with scroll */}
      <RecentTxnMobile />
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12, marginBottom: 16 }}>
        <div className="desktop-only"><RecentTxn /></div>
        <TodaySummary />
      </div>

      {/* Top products + low stock */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--cols-dash-wide)', gap: 12 }}>
        <TopProducts />
        <LowStock />
      </div>
    </AppShell>
  );
}
