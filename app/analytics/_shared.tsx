'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { fmtShort } from '../../lib/utils';

// ── Nav ───────────────────────────────────────────────────────────────────────
export function AnalyticsNav() {
  const pathname = usePathname();
  const tabs = [
    ['overview',  'Overview',   '/analytics'],
    ['sales',     'Sales',      '/analytics/sales'],
    ['products',  'Products',   '/analytics/products'],
    ['customers', 'Customers',  '/analytics/customers'],
    ['cashflow',  'Cashflow',   '/analytics/cashflow'],
  ];
  return (
    <div className="analytics-nav">
      {tabs.map(([k, l, href]) => {
        const active = href === '/analytics' ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={k} href={href} className={active ? 'active' : ''}>{l}</Link>
        );
      })}
    </div>
  );
}

// ── Chart helpers (same as dashboard) ────────────────────────────────────────
function fmtAxis(v: number): string {
  if (v === 0) return '0';
  if (v >= 1_000_000) {
    const n = v / 1_000_000;
    return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(n < 10 ? 1 : 0)) + 'M';
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

// ── AreaChart — matches dashboard SalesChart quality ─────────────────────────
let gradIdCounter = 0;

export function AreaChart({ data, height = 220, color = 'var(--accent)' }: {
  data: Array<{ v: number; label: string }>;
  height?: number;
  color?: string;
}) {
  const [gradId] = React.useState(() => `aFill-${++gradIdCounter}`);
  const [glowId] = React.useState(() => `aGlow-${gradIdCounter}`);

  if (data.length < 2) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-4)', fontSize: 13 }}>No data for this period</div>;
  }

  const w = 880, h = height;
  const pad = { l: 52, r: 20, t: 24, b: 32 };
  const rawMax  = Math.max(...data.map(d => d.v));
  const axisMax = niceMax(rawMax || 10_000);
  const stepX   = (w - pad.l - pad.r) / (data.length - 1);
  const yScale  = (v: number) => h - pad.b - (v / axisMax) * (h - pad.t - pad.b);
  const xScale  = (i: number) => pad.l + i * stepX;

  const pts: [number, number][] = data.map((d, i) => [xScale(i), yScale(d.v)]);
  const linePath = smoothCurve(pts);
  const areaPath = linePath + ` L${xScale(data.length - 1).toFixed(1)},${(h - pad.b).toFixed(1)} L${pad.l},${(h - pad.b).toFixed(1)} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(axisMax * f));
  const peakIdx = data.reduce((best, d, i) => d.v > data[best].v ? i : best, 0);
  const hasPeak = rawMax > 0;

  const labelStep = Math.max(1, Math.ceil(data.length / 8));
  const tipW = 120, tipH = 50;
  const tipX = Math.min(Math.max(xScale(peakIdx) - tipW / 2, pad.l), w - pad.r - tipW);
  const tipY = Math.max(yScale(rawMax) - tipH - 12, pad.t);

  return (
    <div style={{ padding: '0 4px' }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.28" />
            <stop offset="60%"  stopColor={color} stopOpacity="0.06" />
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
            <text x={pad.l - 8} y={yScale(t) + 4} textAnchor="end"
              fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">
              {fmtAxis(t)}
            </text>
          </g>
        ))}

        {data.map((d, i) => i % labelStep === 0 && (
          <text key={i} x={xScale(i)} y={h - 8} textAnchor="middle"
            fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">
            {d.label}
          </text>
        ))}

        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color}
          strokeWidth="4" strokeOpacity="0.18" strokeLinecap="round"
          filter={`url(#${glowId})`} />
        <path d={linePath} fill="none" stroke={color}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {data.map((d, i) => d.v > 0 && (
          <circle key={i} cx={xScale(i)} cy={yScale(d.v)} r="3"
            fill="var(--bg-2)" stroke={color} strokeWidth="1.8" />
        ))}

        {hasPeak && (
          <>
            <line x1={xScale(peakIdx)} x2={xScale(peakIdx)}
              y1={yScale(rawMax)} y2={h - pad.b}
              stroke={color} strokeDasharray="4 4" strokeOpacity="0.4" />
            <circle cx={xScale(peakIdx)} cy={yScale(rawMax)} r="5"
              fill="var(--bg-2)" stroke={color} strokeWidth="2.2" />
            <circle cx={xScale(peakIdx)} cy={yScale(rawMax)} r="2.5"
              fill={color} />
            <g transform={`translate(${tipX},${tipY})`}>
              <rect width={tipW} height={tipH} rx="7"
                fill="var(--bg)" stroke="var(--line-2)" strokeWidth="1" />
              <text x="10" y="16" fontSize="9" fill="var(--fg-4)"
                fontFamily="var(--mono)" letterSpacing="0.06em">
                PEAK · {data[peakIdx].label}
              </text>
              <line x1="10" x2={tipW - 10} y1="22" y2="22"
                stroke="var(--line)" strokeWidth="1" />
              <text x="10" y="38" fontSize="13" fill="var(--fg)"
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

// ── MiniSpark ─────────────────────────────────────────────────────────────────
export function MiniSpark({ data, color = 'var(--accent)' }: { data: number[]; color?: string }) {
  const w = 200, h = 36;
  if (data.length < 2) return <div style={{ width: '100%', height: h }} />;
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

// ── Donut ─────────────────────────────────────────────────────────────────────
export function Donut({ slices, total, centerLabel, centerValue }: {
  slices: Array<{ label: string; v: number; color: string }>;
  total: number;
  centerLabel: string;
  centerValue: string;
}) {
  const R = 60, r = 42, cx = 70, cy = 70;
  let acc = 0;
  const arcs = slices.map((s) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += s.v;
    const end   = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end),   y2 = cy + R * Math.sin(end);
    const x3 = cx + r * Math.cos(end),   y3 = cy + r * Math.sin(end);
    const x4 = cx + r * Math.cos(start), y4 = cy + r * Math.sin(start);
    return { d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`, color: s.color };
  });
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="11" fill="var(--fg-3)" fontFamily="var(--mono)" letterSpacing="0.06em">{centerLabel}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="15" fill="var(--fg)" fontWeight="500">{centerValue}</text>
    </svg>
  );
}

// ── Header bar ────────────────────────────────────────────────────────────────
export function AnalyticsHeader({ range, setRange }: { range: string; setRange: (r: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Analytics</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>Performance across all metrics, powered by Ziada AI.</p>
      </div>
      <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden', background: 'var(--bg-2)', flexShrink: 0 }}>
        {[['7d','7D'],['30d','30D'],['90d','90D'],['ytd','YTD']].map(([k,l]) => (
          <button key={k} onClick={() => setRange(k)} style={{
            padding: '7px 14px', fontSize: 12.5, border: 0,
            borderRight: '1px solid var(--line)',
            background: range === k ? 'var(--bg-3)' : 'transparent',
            color: range === k ? 'var(--fg)' : 'var(--fg-3)', cursor: 'pointer',
            fontFamily: 'inherit',
          }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

// ── Shared range → params helper ──────────────────────────────────────────────
export function rangeToParams(range: string): string {
  const today = new Date();
  const pad   = (n: number) => String(n).padStart(2, '0');
  const fmtD  = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const todayStr = fmtD(today);
  if (range === '7d')  { const f = new Date(today); f.setDate(f.getDate()-6);  return `date_from=${fmtD(f)}&date_to=${todayStr}`; }
  if (range === '30d') { const f = new Date(today); f.setDate(f.getDate()-29); return `date_from=${fmtD(f)}&date_to=${todayStr}`; }
  if (range === '90d') { const f = new Date(today); f.setDate(f.getDate()-89); return `date_from=${fmtD(f)}&date_to=${todayStr}`; }
  if (range === 'ytd') { const f = new Date(today.getFullYear(), 0, 1);        return `date_from=${fmtD(f)}&date_to=${todayStr}`; }
  return '';
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--line-2)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
    </>
  );
}
