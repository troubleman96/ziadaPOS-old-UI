'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color = 'currentColor', height = 28, fill = false, strokeWidth = 1.5 }: {
  data: number[]; color?: string; height?: number; fill?: boolean; strokeWidth?: number;
}) {
  const w = 100, h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / range) * (h - 4) - 2]);
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block', color }}>
      {fill && <path d={d + ` L ${w},${h} L 0,${h} Z`} fill={color} opacity="0.12" />}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ── Window chrome ─────────────────────────────────────────────────────────────
function WindowChrome({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.55)', background: '#0a0a0b', color: '#f5f5f7' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#0f0f12' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#3a3a3e','#3a3a3e','#3a3a3e'].map((c, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: c, display: 'block' }} />)}
        </div>
        <span style={{ fontFamily: 'var(--mono, monospace)', fontSize: 11, color: 'rgba(245,245,247,0.42)', marginLeft: 6 }}>{url}</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono, monospace)', fontSize: 10.5, color: 'rgba(245,245,247,0.26)' }}>v2.4.1</span>
      </div>
      {children}
    </div>
  );
}

// ── Dashboard mockup ──────────────────────────────────────────────────────────
function DashboardMockup({ accent }: { accent: string }) {
  const stats = [
    { label: "TODAY'S SALES", v: 'TZS 1,240,000', delta: '+18%', spark: [3,4,3,5,4,6,5,7,8,7,9,10,9,11,12] },
    { label: "PROFIT",        v: 'TZS 272,000',   delta: '+12%', spark: [2,3,2,4,3,4,5,4,6,5,7,6,8,7,9] },
    { label: 'STOCK VALUE',   v: 'TZS 4.82M',     delta: '+6%',  spark: [5,5,6,5,6,7,6,7,7,8,7,8,9,8,10] },
    { label: 'LOW STOCK',     v: '3',             delta: 'alerts', deltaColor: '#fbbf24', spark: null },
  ];
  const bars = [42, 58, 70, 52, 88, 100, 74];
  return (
    <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, background: '#0a0a0b', color: '#f5f5f7' }}>
      <div style={{ borderRight: '1px solid rgba(255,255,255,0.07)', paddingRight: 14, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600 }}>Z</span>
          <span style={{ fontWeight: 500, fontSize: 13 }}>Ziada</span>
        </div>
        {[['Dashboard',true],['Point of Sale',false],['Transactions',false],['Inventory',false],['Credits',false]].map(([l, a]) => (
          <div key={l as string} style={{ padding: '5px 8px', borderRadius: 5, fontSize: 11.5, color: a ? '#f5f5f7' : 'rgba(245,245,247,0.42)', background: a ? `${accent}22` : 'transparent', borderLeft: `2px solid ${a ? accent : 'transparent'}` }}>{l}</div>
        ))}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Dashboard</span>
          <span style={{ fontFamily: 'monospace', fontSize: 9.5, color: 'rgba(245,245,247,0.42)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: '#34d399', display: 'inline-block' }} /> live
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, marginBottom: 10 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '8px 10px', background: '#0f0f12' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 8.5, color: 'rgba(245,245,247,0.26)', letterSpacing: '0.06em' }}>{s.label}</div>
              <div style={{ fontSize: 12.5, fontWeight: 500, marginTop: 3 }}>{s.v}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: s.deltaColor || '#34d399' }}>{s.delta}</span>
                {s.spark && <div style={{ width: 44, height: 14 }}><Sparkline data={s.spark} color={accent} strokeWidth={1.2} height={14} /></div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8 }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '9px 11px', background: '#0f0f12' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10.5, fontWeight: 500 }}>Sales this week</span>
              <span style={{ fontFamily: 'monospace', fontSize: 8.5, color: 'rgba(245,245,247,0.26)' }}>7D</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, alignItems: 'end', height: 52 }}>
              {bars.map((h, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: '100%', height: `${h}%`, background: i === 5 ? accent : `${accent}55`, borderRadius: 2 }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 7.5, color: 'rgba(245,245,247,0.26)' }}>{'MTWTFSS'[i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '9px 11px', background: '#0f0f12' }}>
            <div style={{ fontSize: 10.5, fontWeight: 500, marginBottom: 8 }}>Top products</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[['Unga wa Sembe 10kg','1.42M'],['Mafuta Cooking 5L','1.15M'],['Sabuni OMO 1kg','260K'],['Sukari 2kg','182K']].map(([n,v],i) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                    <span style={{ fontFamily: 'monospace', color: 'rgba(245,245,247,0.26)', width: 10 }}>{i+1}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n}</span>
                  </span>
                  <span style={{ fontFamily: 'monospace', color: 'rgba(245,245,247,0.66)', flexShrink: 0 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature mockups ───────────────────────────────────────────────────────────
function POSMockup({ accent }: { accent: string }) {
  const items = [['Mafuta ya Cooking 5L',5,170000],['Sabuni ya OMO 1kg',1,6200],['Chai Bora 500g',1,4800],['Mchele Pishori 5kg',1,22000]];
  const sub = items.reduce((s,[,q,p]) => s + (q as number)*(p as number), 0);
  const fmt = (n: number) => 'TZS ' + n.toLocaleString('en-US');
  return (
    <div style={{ padding: 14, background: '#0a0a0b', color: '#f5f5f7' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 500 }}>Current sale</span>
        <span style={{ fontFamily: 'monospace', fontSize: 9.5, color: 'rgba(245,245,247,0.42)' }}>SALE #TXN-2042</span>
      </div>
      {items.map(([n,q,p]) => (
        <div key={n as string} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, fontSize: 11, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n}</span>
          <span style={{ fontFamily: 'monospace', color: 'rgba(245,245,247,0.42)' }}>×{q}</span>
          <span style={{ fontFamily: 'monospace' }}>{fmt((q as number)*(p as number))}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 2px', marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <span style={{ fontSize: 12, fontWeight: 500 }}>Net total</span>
        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: accent }}>{fmt(Math.round(sub*1.18))}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, margin: '8px 0' }}>
        {['Cash','M-Pesa','Bank','Credit'].map((m,i) => (
          <div key={m} style={{ padding: '6px 4px', borderRadius: 5, fontSize: 10, textAlign: 'center', border: `1px solid ${i===0?accent:'rgba(255,255,255,0.07)'}`, background: i===0?`${accent}22`:'transparent', color: i===0?'#f5f5f7':'rgba(245,245,247,0.66)' }}>{m}</div>
        ))}
      </div>
      <div style={{ padding: '8px', borderRadius: 5, background: accent, color: '#fff', textAlign: 'center', fontSize: 11.5, fontWeight: 500 }}>Complete sale →</div>
    </div>
  );
}

function InventoryMini({ accent }: { accent: string }) {
  const rows: [string, number, string][] = [['Unga wa Sembe 10kg',42,'ok'],['Sabuni ya OMO 1kg',3,'critical'],['Mafuta Cooking 5L',24,'ok'],['Sukari 2kg',8,'low']];
  return (
    <div style={{ padding: '12px 14px', background: '#0a0a0b', color: '#f5f5f7' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 44px 60px', gap: 8, fontSize: 9, fontFamily: 'monospace', color: 'rgba(245,245,247,0.26)', letterSpacing: '0.06em', paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span>PRODUCT</span><span>STOCK</span><span>STATUS</span>
      </div>
      {rows.map(([name, qty, s]) => (
        <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr 44px 60px', gap: 8, fontSize: 11, padding: '5px 0', alignItems: 'center' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
          <span style={{ fontFamily: 'monospace', color: 'rgba(245,245,247,0.66)' }}>{qty}</span>
          <span style={{ fontFamily: 'monospace', fontSize: 9, padding: '2px 6px', borderRadius: 999, color: s==='critical'?'#fb7185':s==='low'?'#fbbf24':'#34d399', border: `1px solid ${s==='critical'?'rgba(251,113,133,0.3)':s==='low'?'rgba(251,191,36,0.3)':'rgba(52,211,153,0.3)'}`, width: 'fit-content' }}>{s.toUpperCase()}</span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsMini({ accent }: { accent: string }) {
  return (
    <div style={{ padding: '14px', background: '#0a0a0b', color: '#f5f5f7' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(245,245,247,0.26)', letterSpacing: '0.06em' }}>PROFIT · 30D</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#34d399' }}>+6.2%</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>TZS 4.82M</div>
      <div style={{ height: 56, marginTop: 8 }}>
        <Sparkline data={[3,4,3,5,4,5,6,5,7,6,7,8,7,9,8,10,9,11,10,12]} color={accent} fill strokeWidth={1.5} height={56} />
      </div>
    </div>
  );
}

function CreditsMini({ accent }: { accent: string }) {
  return (
    <div style={{ padding: '12px 14px', background: '#0a0a0b', color: '#f5f5f7' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(245,245,247,0.26)', letterSpacing: '0.06em' }}>OUTSTANDING</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(245,245,247,0.42)' }}>14 customers</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>TZS 184,500</div>
      {[['Fatuma A.','TZS 38,500','Today'],['Juma K.','TZS 84,200','2d'],['Asha M.','TZS 54,200','5d']].map(([n,a,d]) => (
        <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, fontSize: 11, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span>{n}</span>
          <span style={{ fontFamily: 'monospace', color: 'rgba(245,245,247,0.66)' }}>{a}</span>
          <span style={{ fontFamily: 'monospace', color: 'rgba(245,245,247,0.26)' }}>{d}</span>
        </div>
      ))}
    </div>
  );
}

function AIChatMini({ accent }: { accent: string }) {
  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5, background: '#0a0a0b', color: '#f5f5f7' }}>
      <div style={{ alignSelf: 'flex-end', maxWidth: '82%', padding: '6px 10px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}>Niambie mauzo ya leo</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <span style={{ width: 18, height: 18, borderRadius: 5, background: `${accent}22`, color: accent, display: 'grid', placeItems: 'center', fontSize: 10, flexShrink: 0 }}>✦</span>
        <div style={{ color: 'rgba(245,245,247,0.66)', lineHeight: 1.5 }}>
          Mauzo ya leo ni <strong style={{ color: '#f5f5f7' }}>TZS 1,240,000</strong> — juu kwa 18%.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['Tuma report','Linganisha wiki'].map((c,i) => (
          <span key={c} style={{ fontFamily: 'monospace', fontSize: 10, padding: '3px 8px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', color: i===0?accent:'rgba(245,245,247,0.66)', background: i===0?`${accent}22`:'transparent' }}>{c}</span>
        ))}
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ theme, onToggleTheme }: { theme: string; onToggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--line)', backdropFilter: 'blur(16px) saturate(140%)', background: 'color-mix(in oklab, var(--bg) 70%, transparent)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, gap: 24 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'inherit' }}>
          <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>Z</span>
          <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em' }}>ziada</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', padding: '2px 6px', border: '1px solid var(--line)', borderRadius: 4 }}>v2.4</span>
        </a>
        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 20, marginLeft: 8 }} className="landing-nav">
          {[['Product','#features'],['Ziada AI','#ai'],['Pricing','#'],['Docs','#']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 13, color: 'var(--fg-2)', textDecoration: 'none' }}>{l}</a>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <button onClick={onToggleTheme} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--bg-2)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-2)' }} className="landing-nav">
          {theme === 'dark' ? '◐ dark' : '◑ light'}
        </button>
        <a href="#" style={{ fontSize: 13, color: 'var(--fg-2)', textDecoration: 'none' }} className="landing-nav">Sign in</a>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 6, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
          Start trial <span style={{ opacity: 0.8 }}>→</span>
        </Link>
        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="landing-ham" style={{ display: 'none', width: 36, height: 36, border: '1px solid var(--line)', borderRadius: 7, background: 'var(--bg-2)', cursor: 'pointer', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span style={{ width: 16, height: 1.5, background: 'var(--fg-2)', borderRadius: 2, display: 'block' }} />
          <span style={{ width: 16, height: 1.5, background: 'var(--fg-2)', borderRadius: 2, display: 'block' }} />
          <span style={{ width: 16, height: 1.5, background: 'var(--fg-2)', borderRadius: 2, display: 'block' }} />
        </button>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-2)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }} className="landing-mobile-menu">
          {[['Product','#features'],['Ziada AI','#ai'],['Pricing','#'],['Docs','#'],['Sign in','#']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 14, color: 'var(--fg-2)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>{l}</a>
          ))}
          <button onClick={onToggleTheme} style={{ padding: '8px 0', border: 0, background: 'transparent', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-3)', cursor: 'pointer', textAlign: 'left' }}>
            {theme === 'dark' ? '◐ Switch to light mode' : '◑ Switch to dark mode'}
          </button>
        </div>
      )}
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ accent }: { accent: string }) {
  return (
    <section style={{ position: 'relative', paddingTop: 80, paddingBottom: 88, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 80% 65% at 50% 30%, #000 30%, transparent 80%)' }} />
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        {/* Centered headline block */}
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 8px', border: '1px solid var(--line)', borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.04em', color: 'var(--fg-2)', background: 'var(--bg-2)', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-soft)', display: 'inline-block' }} />
            Ziada AI · now in every store
            <span style={{ color: 'var(--fg-4)' }}>→</span>
          </span>
          <h1 style={{ margin: 0, fontSize: 'clamp(38px, 5.6vw, 72px)', lineHeight: 1.03, fontWeight: 500, letterSpacing: '-0.03em' }}>
            The operating system<br />for your shop.
          </h1>
          <p style={{ margin: '24px auto 0', fontSize: 17, lineHeight: 1.6, color: 'var(--fg-2)', maxWidth: 540 }}>
            POS, inventory, credit, analytics and an AI that actually knows your store — running on one calm, fast platform. Built in Tanzania, made for any counter.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 20px', borderRadius: 7, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              Start free 7-day trial <span style={{ opacity: 0.8 }}>→</span>
            </Link>
            <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 20px', borderRadius: 7, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 14, textDecoration: 'none', background: 'transparent' }}>
              Try the live demo
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['no card required','works offline','EN + Swahili','M-Pesa, Tigo, Bank, Cash'].map((t) => (
              <span key={t} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L4.8 8.5L9.5 3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t}
              </span>
            ))}
          </div>
        </div>
        {/* Mockup — constrained so internal proportions stay balanced */}
        <div style={{ maxWidth: 1000, margin: '56px auto 0' }}>
          <WindowChrome url="app.ziada.co/dashboard">
            <DashboardMockup accent={accent} />
          </WindowChrome>
        </div>
      </div>
    </section>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { label: 'STORES RUNNING ZIADA', v: '1,247' },
    { label: 'TXNS LAST 24H',        v: '89,412' },
    { label: 'TZS PROCESSED · 30D',  v: '4.21B' },
    { label: 'AI QUERIES · 24H',     v: '12,094' },
    { label: 'UPTIME · 90D',         v: '99.98%' },
  ];
  return (
    <section style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div className="stats-grid" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ padding: '20px 20px', borderLeft: i === 0 ? 0 : '1px solid var(--line)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Feature grid ──────────────────────────────────────────────────────────────
const FEATURES = [
  { n: '01', id: 'pos',       title: 'Point of Sale',  tagline: 'Ring up a sale in three taps.',            desc: 'Search, scan, or pick from the grid. Take cash, M-Pesa, Tigo Pesa, bank or credit — split across any of them on one ticket.', bullets: ['Barcode + visual search','Split tender','Offline-first, syncs when back online'] },
  { n: '02', id: 'inventory', title: 'Inventory',      tagline: 'Know what\'s on the shelf without counting.',   desc: 'Stock moves automatically as you sell, restock or transfer. Reorder points and supplier history live with each product.',    bullets: ['Auto reorder points','Supplier ledger','Variant + bulk pricing'] },
  { n: '03', id: 'analytics', title: 'Analytics',      tagline: 'The shop\'s pulse, every minute.',           desc: 'Sales, profit, margins, payment mix and cash position — all visible at a glance, all filterable to a single SKU.',          bullets: ['Hour-by-hour revenue','Profit by product','Cohort & repeat-customer view'] },
  { n: '04', id: 'credits',   title: 'Credits',        tagline: 'Track every kopo without a notebook.',       desc: 'Open tabs, payment reminders, statements over WhatsApp. Aging buckets so you always know who\'s overdue.',                 bullets: ['Aging buckets','WhatsApp reminders','Statement PDF in one tap'] },
  { n: '05', id: 'ai',        title: 'Ziada AI',       tagline: 'An assistant that actually knows your store.', desc: 'Ask in English or Swahili. Pulls answers from your live data and drafts the next action.',                                  bullets: ['Grounded on your data','Bilingual EN/SW','Drafts orders, reports, messages'] },
];

function FeatureCard({ f, accent }: { f: typeof FEATURES[0]; accent: string }) {
  const mockup =
    f.id === 'pos'       ? <POSMockup accent={accent} /> :
    f.id === 'inventory' ? <InventoryMini accent={accent} /> :
    f.id === 'analytics' ? <AnalyticsMini accent={accent} /> :
    f.id === 'credits'   ? <CreditsMini accent={accent} /> :
                           <AIChatMini accent={accent} />;
  return (
    <article style={{ border: '1px solid var(--line)', borderRadius: 12, background: 'var(--bg-2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.08em' }}>{f.n} · {f.id.toUpperCase()}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-3)' }}>module</span>
        </div>
        <h3 style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em' }}>{f.title}</h3>
        <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--fg-2)' }}>{f.tagline}</p>
      </div>
      <div style={{ flex: 1, borderBottom: '1px solid var(--line)' }}>{mockup}</div>
      <div style={{ padding: '14px 20px 18px' }}>
        <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.55 }}>{f.desc}</p>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {f.bullets.map((b) => (
            <li key={b} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', display: 'flex', gap: 8 }}>
              <span style={{ color: accent }}>›</span>{b}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function FeatureGrid({ accent }: { accent: string }) {
  return (
    <section id="features" style={{ padding: '88px 0' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em' }}>§ 01 · MODULES</div>
            <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>One platform. Five surfaces. Every counter.</h2>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)' }}>5 / 5 included on every plan</span>
        </div>
        <div className="feat-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {FEATURES.slice(0, 3).map((f) => <FeatureCard key={f.id} f={f} accent={accent} />)}
        </div>
        <div className="feat-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          {FEATURES.slice(3).map((f) => <FeatureCard key={f.id} f={f} accent={accent} />)}
        </div>
      </div>
    </section>
  );
}

// ── AI section ────────────────────────────────────────────────────────────────
function AISection({ accent }: { accent: string }) {
  const prompts = [
    'Top 3 fast movers this week, and which are running low?',
    'Niambie wateja waliokuwa na deni kubwa zaidi mwezi huu.',
    'Compare margins on cooking oil across all 3 stores.',
    'Draft a restock order for everything below reorder point.',
    'What was my busiest hour yesterday and who was on the till?',
    'Send Fatuma her statement on WhatsApp.',
  ];
  return (
    <section id="ai" style={{ padding: '88px 0', borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em' }}>§ 02 · ZIADA AI</div>
            <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>The first AI that actually knows your shop.</h2>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)' }}>grounded · bilingual · in every screen</span>
        </div>
        <div className="ai-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 32, alignItems: 'start' }}>
          <div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--fg-2)', margin: '0 0 20px', maxWidth: 520 }}>
              Most &ldquo;AI features&rdquo; are a chatbot bolted on. Ziada AI reads from your live sales, stock, suppliers and credits — and writes back. Ask in English or Swahili and get an answer with data and a next action.
            </p>
            <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', marginTop: 24 }}>
              <div style={{ fontFamily: 'var(--mono)', padding: '9px 14px', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>THINGS PEOPLE ASK</div>
              {prompts.map((p, i) => (
                <div key={i} style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--fg-2)', borderBottom: i < prompts.length - 1 ? '1px solid var(--line)' : 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--fg-4)', fontSize: 11 }}>›</span>{p}
                </div>
              ))}
            </div>
            <div className="ai-props" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22 }}>
              {[['Grounded','Answers cite the exact rows from your store.'],['Bilingual','Speaks English and Swahili, by default.'],['Action-oriented','Drafts the restock, the message, the report.'],['Private','Your data never trains a foundation model.']].map(([t,d]) => (
                <div key={t} style={{ paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <WindowChrome url="app.ziada.co/ai">
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 340, background: '#0a0a0b', color: '#f5f5f7' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: `${accent}22`, color: accent, display: 'grid', placeItems: 'center', fontSize: 11 }}>✦</span>
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>Ziada AI</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(245,245,247,0.26)', marginLeft: 4 }}>· Duka Kuu</span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(245,245,247,0.42)', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ width: 5, height: 5, borderRadius: 999, background: accent, display: 'inline-block' }} /> 142 ms
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '78%', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12.5 }}>What were my top 3 fast movers this week, and which are running low?</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: `${accent}22`, color: accent, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 11 }}>✦</span>
                  <div style={{ fontSize: 12.5, color: 'rgba(245,245,247,0.66)', lineHeight: 1.55 }}>
                    This week your top movers were:
                    <div style={{ marginTop: 8, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, overflow: 'hidden' }}>
                      {[['1','Unga wa Sembe 10kg','50 sold','8 left','low'],['2','Mafuta ya Cooking 5L','34 sold','24 left','ok'],['3','Sabuni ya OMO 1kg','42 sold','3 left','critical']].map(([n,name,sold,left,s]) => (
                        <div key={n} style={{ display: 'grid', gridTemplateColumns: '16px 1.4fr 1fr 1fr auto', gap: 8, alignItems: 'center', padding: '7px 10px', fontSize: 11, borderBottom: s==='critical'?0:'1px solid rgba(255,255,255,0.07)', background: s==='critical'?'rgba(251,113,133,0.05)':'transparent' }}>
                          <span style={{ fontFamily: 'monospace', color: 'rgba(245,245,247,0.26)' }}>{n}</span>
                          <span style={{ color: '#f5f5f7' }}>{name}</span>
                          <span style={{ fontFamily: 'monospace', color: 'rgba(245,245,247,0.66)' }}>{sold}</span>
                          <span style={{ fontFamily: 'monospace', color: 'rgba(245,245,247,0.42)' }}>{left}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 9, padding: '2px 6px', borderRadius: 999, color: s==='critical'?'#fb7185':s==='low'?'#fbbf24':'#34d399', border: `1px solid ${s==='critical'?'rgba(251,113,133,0.3)':s==='low'?'rgba(251,191,36,0.3)':'rgba(52,211,153,0.3)'}` }}>{s.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12 }}>Sabuni ya OMO is below reorder point — want me to draft a restock order?</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {['Draft restock','Show suppliers','Project next week'].map((c,i) => (
                        <span key={c} style={{ fontFamily: 'monospace', fontSize: 10.5, padding: '4px 9px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', color: i===0?accent:'rgba(245,245,247,0.66)', background: i===0?`${accent}22`:'transparent', cursor: 'pointer' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, background: '#0f0f12' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(245,245,247,0.26)' }}>›</span>
                  <span style={{ fontSize: 12, color: 'rgba(245,245,247,0.42)' }}>Ask about your store…</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: 10, color: 'rgba(245,245,247,0.26)' }}>⌘ K</span>
                </div>
              </div>
            </WindowChrome>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section style={{ padding: '100px 0 88px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 80%)' }} />
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.08em' }}>§ 03 · GET ZIADA</div>
        <h2 style={{ margin: '16px 0 18px', fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Run your shop on calm software.</h2>
        <p style={{ margin: '0 auto', maxWidth: 520, fontSize: 16, color: 'var(--fg-2)' }}>Seven days, every feature, no card. Most shops are live on Ziada in under an hour.</p>
        <div style={{ display: 'inline-flex', gap: 10, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 18px', borderRadius: 6, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            Start free trial <span style={{ opacity: 0.8 }}>→</span>
          </Link>
          <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 18px', borderRadius: 6, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 14, textDecoration: 'none' }}>Talk to the team</a>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', marginTop: 32, letterSpacing: '0.05em' }}>
          DAR ES SALAAM · ARUSHA · MWANZA · DODOMA · MBEYA · ZANZIBAR
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div className="footer-grid" style={{ maxWidth: 1240, margin: '0 auto', padding: '44px 24px 28px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr', gap: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>Z</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>ziada</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--fg-3)', maxWidth: 240, margin: 0, lineHeight: 1.6 }}>The operating system for retail. Built in Dar es Salaam, made for any counter on the continent.</p>
        </div>
        {[
          ['Product', ['Point of Sale','Inventory','Analytics','Credits','Ziada AI']],
          ['Resources', ['Docs','Changelog','API','Status','Security']],
          ['Company', ['About','Customers','Careers','Press','Contact']],
          ['Legal', ['Terms','Privacy','DPA','Cookies']],
        ].map(([title, links]) => (
          <div key={title as string}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 14 }}>{(title as string).toUpperCase()}</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(links as string[]).map((l) => <li key={l}><a href="#" style={{ fontSize: 13, color: 'var(--fg-2)', textDecoration: 'none' }}>{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)' }}>© 2026 Ziada Technologies Ltd · Dar es Salaam, Tanzania</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)' }}>STATUS · <span style={{ color: 'var(--good)' }}>●</span> all systems normal</span>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const accent = '#6366f1';
  const [theme, setTheme] = useState<string>('dark');

  useEffect(() => {
    try { const s = localStorage.getItem('ziada-theme'); if (s === 'light' || s === 'dark') setTheme(s); } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('ziada-theme', theme); } catch {}
  }, [theme]);

  return (
    <>
      <style>{`
        /* Landing page layout overrides — scoped so they don't bleed into the app shell */
        .landing-nav { display: flex !important; }
        .landing-ham { display: none !important; }

        /* Stats strip: scroll on mobile */
        .stats-grid { overflow-x: auto; }

        /* Feature grids */
        .feat-grid-3 { grid-template-columns: repeat(3,1fr); }
        .feat-grid-2 { grid-template-columns: repeat(2,1fr); }

        /* AI section */
        .ai-grid { grid-template-columns: 1fr 1.15fr; }
        .ai-props { grid-template-columns: 1fr 1fr; }

        /* Footer */
        .footer-grid { grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr; }

        @media (max-width: 768px) {
          .landing-nav { display: none !important; }
          .landing-ham { display: flex !important; }

          .stats-grid {
            grid-template-columns: repeat(3, minmax(140px, 1fr)) !important;
          }
          .stats-grid > div {
            border-left: 0 !important;
            border-bottom: 1px solid var(--line);
          }

          .feat-grid-3,
          .feat-grid-2 { grid-template-columns: 1fr !important; }

          .ai-grid { grid-template-columns: 1fr !important; }
          .ai-props { grid-template-columns: 1fr 1fr !important; }

          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ai-props { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'var(--sans, system-ui, sans-serif)', fontSize: 15, lineHeight: 1.5, WebkitFontSmoothing: 'antialiased' }}>
        <Header theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
        <Hero accent={accent} />
        <StatsStrip />
        <FeatureGrid accent={accent} />
        <AISection accent={accent} />
        <CTA />
        <Footer />
      </div>
    </>
  );
}
