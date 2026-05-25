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
    <div style={{ borderBottom: '1px solid var(--line)', marginBottom: 20, display: 'flex', gap: 4 }}>
      {tabs.map(([k, l, href]) => {
        const active = href === '/analytics' ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={k} href={href} style={{
            padding: '10px 14px', fontSize: 13.5,
            color: active ? 'var(--fg)' : 'var(--fg-3)',
            borderBottom: '2px solid ' + (active ? 'var(--accent)' : 'transparent'),
            marginBottom: -1,
            fontWeight: active ? 500 : 400,
          }}>{l}</Link>
        );
      })}
    </div>
  );
}

// ── Charts ────────────────────────────────────────────────────────────────────
export function MiniSpark({ data, color = 'var(--accent)' }: { data: number[]; color?: string }) {
  const w = 200, h = 36;
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

export function AreaChart({ data, height = 240, color = 'var(--accent)' }: { data: Array<{ v: number; label: string }>; height?: number; color?: string }) {
  const w = 820, h = height;
  const pad = { l: 48, r: 16, t: 16, b: 32 };
  const max = Math.max(...data.map(d => d.v)) * 1.1;
  const stepX = (w - pad.l - pad.r) / (data.length - 1);
  const yScale = (v: number) => h - pad.b - (v / max) * (h - pad.t - pad.b);
  const xScale = (i: number) => pad.l + i * stepX;
  const linePath = data.map((d, i) => (i === 0 ? 'M' : 'L') + xScale(i).toFixed(1) + ',' + yScale(d.v).toFixed(1)).join(' ');
  const areaPath = linePath + ` L ${xScale(data.length-1)},${h-pad.b} L ${pad.l},${h-pad.b} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(t * max));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="aFillShared" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w-pad.r} y1={yScale(t)} y2={yScale(t)} stroke="var(--line)" strokeDasharray="2 4" />
          <text x={pad.l - 8} y={yScale(t) + 3} textAnchor="end" fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">
            {t === 0 ? '0' : fmtShort(t).replace('TZS ', '')}
          </text>
        </g>
      ))}
      {data.map((d, i) => i % Math.ceil(data.length / 8) === 0 && (
        <text key={i} x={xScale(i)} y={h - 12} textAnchor="middle" fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)">{d.label}</text>
      ))}
      <path d={areaPath} fill="url(#aFillShared)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.75" />
    </svg>
  );
}

export function Donut({ slices, total, centerLabel, centerValue }: { slices: Array<{ label: string; v: number; color: string }>; total: number; centerLabel: string; centerValue: string }) {
  const R = 60, r = 42, cx = 70, cy = 70;
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
    return { d, color: s.color, label: s.label };
  });
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="10" fill="var(--fg-4)" fontFamily="var(--mono)" letterSpacing="0.06em">{centerLabel}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="15" fill="var(--fg)" fontWeight="500">{centerValue}</text>
    </svg>
  );
}

// ── Header bar ────────────────────────────────────────────────────────────────
export function AnalyticsHeader({ range, setRange }: { range: string; setRange: (r: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em' }}>Analytics</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--fg-3)' }}>Performance across all metrics, powered by Ziada AI.</p>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 7, overflow: 'hidden', background: 'var(--bg-2)' }}>
          {[['7d','7D'],['30d','30D'],['90d','90D'],['ytd','YTD']].map(([k,l]) => (
            <button key={k} onClick={() => setRange(k)} style={{
              padding: '7px 14px', fontSize: 12.5, border: 0,
              borderRight: '1px solid var(--line)',
              background: range === k ? 'var(--bg-3)' : 'transparent',
              color: range === k ? 'var(--fg)' : 'var(--fg-3)', cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
