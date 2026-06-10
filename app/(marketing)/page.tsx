'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/components/LangContext';
import { t, type Lang } from '@/lib/lang';

// ── Sparkline ──────────────────────────────────────────────────────────────────
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

// ── Window chrome ──────────────────────────────────────────────────────────────
function WindowChrome({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line-2)', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.4)', background: 'var(--bg)', color: 'var(--fg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg-2)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['var(--bad)', 'var(--warn)', 'var(--good)'].map((c, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: c, opacity: 0.6, display: 'block' }} />
          ))}
        </div>
        <span style={{ fontFamily: 'var(--mono, monospace)', fontSize: 11, color: 'var(--fg-4)', marginLeft: 6 }}>{url}</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono, monospace)', fontSize: 10.5, color: 'var(--fg-4)' }}>v2.4.1</span>
      </div>
      {children}
    </div>
  );
}

// ── Live app showcase — screen components ──────────────────────────────────────
type Screen = 'dashboard' | 'inventory' | 'credits' | 'transactions' | 'pos';

const SCREEN_ORDER: Screen[] = ['dashboard', 'inventory', 'credits', 'transactions', 'pos'];
const SCREEN_URLS: Record<Screen, string> = {
  dashboard:    'app.ziadapos.com/dashboard',
  inventory:    'app.ziadapos.com/inventory',
  credits:      'app.ziadapos.com/credits',
  transactions: 'app.ziadapos.com/transactions',
  pos:          'app.ziadapos.com/pos',
};
const ROTATE_MS = 10_000;

function DashboardScreen({ accent }: { accent: string }) {
  const kpis = [
    { label: "TODAY'S SALES", value: 'TZS 1,240,000', delta: '+18%', good: true,  spark: [3,4,5,4,6,5,7,6,8,7,9,8,10,9,11,12,11,13,12,14] },
    { label: 'PROFIT',        value: 'TZS 272,000',   delta: '+12%', good: true,  spark: [2,3,2,4,3,4,5,4,6,5,6,7,6,8,7,8,9,8,9,10] },
    { label: 'TICKETS',       value: '48',            delta: '+9',   good: true,  spark: [3,4,3,5,4,5,6,5,7,6,7,6,8,7,9,8,9,8,10,9] },
    { label: 'CREDIT OUT',    value: 'TZS 184,500',   delta: '14',   good: false, spark: [8,8,9,8,9,10,9,10,11,10,11,10,9,10,9,10,9,10,9,8] },
  ];
  const hourly = [12,28,45,72,95,120,158,210,175,230,280,195,145];
  const maxH = Math.max(...hourly);
  const SW = 200, SH = 48;
  const hPts = hourly.map((v,i) => [(i/(hourly.length-1))*SW, SH-(v/maxH)*(SH-6)-3]);
  const hLine = hPts.map(([x,y],i) => (i===0?`M${x.toFixed(1)},${y.toFixed(1)}`:`L${x.toFixed(1)},${y.toFixed(1)}`)).join(' ');
  const hFill = `${hLine} L${SW},${SH} L0,${SH} Z`;
  const methods = [
    { label:'M-Pesa', pct:52, color:'#10b981' },
    { label:'Cash',   pct:28, color:accent     },
    { label:'Tigo',   pct:12, color:'#f59e0b'  },
    { label:'Bank',   pct: 8, color:'#60a5fa'  },
  ];
  const DR=22, DS=9, circ=2*Math.PI*DR;
  let cum=0;
  const arcs = methods.map(m => { const s=cum; cum+=m.pct; return {...m, dashLen:(m.pct/100)*circ-0.8, offset:circ*0.25-(s/100)*circ}; });
  const txns = [
    {id:'TXN-2042',time:'14:32',amt:'142,000',via:'M-Pesa',green:true},
    {id:'TXN-2041',time:'14:18',amt:'48,500', via:'Cash',  green:false},
    {id:'TXN-2040',time:'13:55',amt:'217,000',via:'M-Pesa',green:true},
  ];
  const prods = [
    {name:'Unga wa Sembe 10kg',pct:100,rev:'1.42M'},
    {name:'Mafuta Cooking 5L', pct:81, rev:'1.15M'},
    {name:'Sabuni OMO 1kg',    pct:38, rev:'540K' },
  ];
  return (
    <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:9,overflow:'hidden',minWidth:0}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:12.5,fontWeight:600}}>Dashboard</div>
          <div style={{fontFamily:'monospace',fontSize:9,color:'var(--fg-4)',marginTop:1}}>Jumanne, 3 Juni 2026</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{display:'flex',alignItems:'center',gap:4,padding:'3px 8px',border:'1px solid var(--line)',borderRadius:999,fontFamily:'monospace',fontSize:9,color:'var(--fg-3)',background:'var(--bg-2)'}}>
            <span style={{width:5,height:5,borderRadius:999,background:'var(--good)',display:'inline-block',boxShadow:'0 0 0 2px rgba(52,211,153,0.2)'}}/> live
          </span>
          <span style={{width:24,height:24,borderRadius:999,background:`${accent}22`,border:`1px solid ${accent}44`,display:'grid',placeItems:'center',fontSize:10,color:accent,fontWeight:700}}>E</span>
        </div>
      </div>
      <div className="dash-kpi-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
        {kpis.map(k=>(
          <div key={k.label} style={{border:'1px solid var(--line)',borderRadius:7,padding:'7px 9px',background:'var(--bg-2)',display:'flex',flexDirection:'column',gap:3,minWidth:0}}>
            <div style={{fontFamily:'monospace',fontSize:7.5,color:'var(--fg-4)',letterSpacing:'0.05em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{k.label}</div>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:'-0.01em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{k.value}</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:4}}>
              <span style={{fontFamily:'monospace',fontSize:8,padding:'1px 5px',borderRadius:999,color:k.good?'var(--good)':'var(--warn)',background:k.good?'rgba(52,211,153,0.08)':'rgba(251,191,36,0.08)',border:`1px solid ${k.good?'rgba(52,211,153,0.25)':'rgba(251,191,36,0.25)'}`,flexShrink:0}}>{k.delta}</span>
              <div style={{flex:1,height:16,minWidth:0}}><Sparkline data={k.spark} color={k.good?accent:'#f59e0b'} height={16} fill strokeWidth={1.2}/></div>
            </div>
          </div>
        ))}
      </div>
      <div className="dash-mid-grid" style={{display:'grid',gridTemplateColumns:'1.7fr 1fr',gap:6}}>
        <div style={{border:'1px solid var(--line)',borderRadius:7,padding:'8px 10px',background:'var(--bg-2)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
            <span style={{fontSize:10.5,fontWeight:500}}>Sales by hour</span>
            <span style={{fontFamily:'monospace',fontSize:8,color:'var(--fg-4)'}}>TODAY</span>
          </div>
          <svg viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="none" style={{width:'100%',height:SH,display:'block'}}>
            <defs><linearGradient id="mkt-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity="0.22"/><stop offset="100%" stopColor={accent} stopOpacity="0.01"/></linearGradient></defs>
            <path d={hFill} fill="url(#mkt-grad)"/>
            <path d={hLine} fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
          </svg>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:3}}>
            {['6am','8','10','12','2pm','4','6'].map(l=><span key={l} style={{fontFamily:'monospace',fontSize:7.5,color:'var(--fg-4)'}}>{l}</span>)}
          </div>
        </div>
        <div style={{border:'1px solid var(--line)',borderRadius:7,padding:'8px 10px',background:'var(--bg-2)'}}>
          <div style={{fontSize:10.5,fontWeight:500,marginBottom:6}}>Payment mix</div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <svg width="52" height="52" viewBox="0 0 52 52" style={{flexShrink:0}}>
              {arcs.map((arc,i)=><circle key={i} cx="26" cy="26" r={DR} fill="none" stroke={arc.color} strokeWidth={DS} strokeDasharray={`${arc.dashLen} ${circ}`} strokeDashoffset={arc.offset}/>)}
            </svg>
            <div style={{display:'flex',flexDirection:'column',gap:4,flex:1,minWidth:0}}>
              {methods.map(m=>(
                <div key={m.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{display:'flex',alignItems:'center',gap:4,fontSize:9.5,color:'var(--fg-2)'}}>
                    <span style={{width:5,height:5,borderRadius:999,background:m.color,display:'inline-block',flexShrink:0}}/>{m.label}
                  </span>
                  <span style={{fontFamily:'monospace',fontSize:9,color:'var(--fg-3)'}}>{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="dash-bot-grid" style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:6}}>
        <div className="dash-txn-table" style={{border:'1px solid var(--line)',borderRadius:7,background:'var(--bg-2)',overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'1.6fr 0.7fr 1.3fr 0.9fr',gap:4,padding:'5px 10px',fontFamily:'monospace',fontSize:7.5,color:'var(--fg-4)',letterSpacing:'0.05em',borderBottom:'1px solid var(--line)',background:'var(--bg-3)'}}>
            <span>TXN</span><span>TIME</span><span>AMOUNT</span><span>VIA</span>
          </div>
          {txns.map((tx,i)=>(
            <div key={tx.id} style={{display:'grid',gridTemplateColumns:'1.6fr 0.7fr 1.3fr 0.9fr',gap:4,padding:'5px 10px',fontSize:9.5,alignItems:'center',borderBottom:i<txns.length-1?'1px solid var(--line)':0}}>
              <span style={{fontFamily:'monospace',color:accent,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tx.id}</span>
              <span style={{fontFamily:'monospace',color:'var(--fg-4)',fontSize:8.5}}>{tx.time}</span>
              <span style={{fontFamily:'monospace',fontWeight:500,fontSize:9.5}}>TZS {tx.amt}</span>
              <span style={{fontFamily:'monospace',fontSize:8,padding:'1px 5px',borderRadius:999,background:tx.green?'rgba(16,185,129,0.08)':'var(--bg-3)',color:tx.green?'#10b981':'var(--fg-3)',border:`1px solid ${tx.green?'rgba(16,185,129,0.22)':'var(--line)'}`,textAlign:'center'}}>{tx.via}</span>
            </div>
          ))}
        </div>
        <div style={{border:'1px solid var(--line)',borderRadius:7,padding:'8px 10px',background:'var(--bg-2)'}}>
          <div style={{fontSize:10.5,fontWeight:500,marginBottom:7}}>Top products</div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {prods.map((p,i)=>(
              <div key={p.name}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{display:'flex',alignItems:'center',gap:5,minWidth:0}}>
                    <span style={{fontFamily:'monospace',fontSize:8,color:'var(--fg-4)',width:10}}>{i+1}</span>
                    <span style={{fontSize:9.5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--fg-2)'}}>{p.name}</span>
                  </span>
                  <span style={{fontFamily:'monospace',fontSize:8.5,color:'var(--fg-3)',flexShrink:0,marginLeft:6}}>{p.rev}</span>
                </div>
                <div style={{height:3,borderRadius:999,background:'var(--bg-3)',overflow:'hidden'}}>
                  <div style={{height:'100%',borderRadius:999,background:`${accent}aa`,width:`${p.pct}%`}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,padding:'5px 8px',borderRadius:5,background:`${accent}10`,border:`1px solid ${accent}30`,display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:14,height:14,borderRadius:4,background:`${accent}22`,color:accent,display:'grid',placeItems:'center',fontSize:9,flexShrink:0}}>✦</span>
            <span style={{fontSize:9,color:'var(--fg-3)',lineHeight:1.3}}>Sabuni OMO below reorder point</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryScreen({ accent }: { accent: string }) {
  const products = [
    { name:'Unga wa Sembe 10kg',  sku:'PRD-001', qty:142, price:'14,000', status:'ok'       },
    { name:'Mafuta Cooking 5L',   sku:'PRD-002', qty:38,  price:'34,000', status:'ok'       },
    { name:'Sabuni OMO 1kg',      sku:'PRD-003', qty:11,  price:'6,200',  status:'low'      },
    { name:'Sukari Kilo 1kg',     sku:'PRD-004', qty:204, price:'3,200',  status:'ok'       },
    { name:'Mchele Sindano 5kg',  sku:'PRD-005', qty:3,   price:'22,000', status:'critical' },
    { name:'Chai Lipton 100g',    sku:'PRD-006', qty:67,  price:'4,800',  status:'ok'       },
  ];
  const sColor: Record<string,string> = { ok:'var(--good)', low:'var(--warn)', critical:'var(--bad)' };
  const sBg:    Record<string,string> = { ok:'rgba(52,211,153,0.08)', low:'rgba(251,191,36,0.08)', critical:'rgba(251,113,133,0.08)' };
  return (
    <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:9,overflow:'hidden',minWidth:0}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:12.5,fontWeight:600}}>Inventory</div>
          <div style={{fontFamily:'monospace',fontSize:9,color:'var(--fg-4)',marginTop:1}}>142 products · 2 alerts</div>
        </div>
        <div style={{display:'flex',gap:5}}>
          <span style={{padding:'4px 9px',borderRadius:6,border:'1px solid var(--line)',fontSize:9.5,color:'var(--fg-3)',background:'var(--bg-2)'}}>Filter</span>
          <span style={{padding:'4px 9px',borderRadius:6,background:accent,fontSize:9.5,color:'#fff'}}>+ Add product</span>
        </div>
      </div>
      <div style={{border:'1px solid var(--line)',borderRadius:7,overflow:'hidden',background:'var(--bg-2)'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 0.9fr 0.7fr 0.8fr 0.8fr',gap:8,padding:'6px 10px',fontFamily:'monospace',fontSize:7.5,color:'var(--fg-4)',letterSpacing:'0.05em',borderBottom:'1px solid var(--line)',background:'var(--bg-3)'}}>
          <span>PRODUCT</span><span>SKU</span><span>QTY</span><span>PRICE</span><span>STATUS</span>
        </div>
        {products.map((p,i)=>(
          <div key={p.sku} style={{display:'grid',gridTemplateColumns:'2fr 0.9fr 0.7fr 0.8fr 0.8fr',gap:8,padding:'7px 10px',fontSize:9.5,alignItems:'center',borderBottom:i<products.length-1?'1px solid var(--line)':0}}>
            <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--fg)'}}>{p.name}</span>
            <span style={{fontFamily:'monospace',fontSize:8.5,color:'var(--fg-4)'}}>{p.sku}</span>
            <span style={{fontFamily:'monospace',fontWeight:p.status!=='ok'?700:400,color:p.status!=='ok'?sColor[p.status]:'var(--fg-2)'}}>{p.qty}</span>
            <span style={{fontFamily:'monospace',fontSize:9}}>TZS {p.price}</span>
            <span style={{fontFamily:'monospace',fontSize:8,padding:'2px 6px',borderRadius:999,color:sColor[p.status],background:sBg[p.status],display:'inline-block'}}>{p.status.toUpperCase()}</span>
          </div>
        ))}
      </div>
      <div style={{padding:'6px 10px',borderRadius:6,background:'rgba(251,113,133,0.06)',border:'1px solid rgba(251,113,133,0.2)',display:'flex',alignItems:'center',gap:6}}>
        <span style={{width:6,height:6,borderRadius:999,background:'var(--bad)',display:'inline-block',flexShrink:0}}/>
        <span style={{fontSize:9,color:'var(--bad)'}}>2 products below reorder point — draft restock order →</span>
      </div>
    </div>
  );
}

function CreditsScreen({ accent }: { accent: string }) {
  const entries = [
    { name:'Fatuma Abdi',    phone:'0712 334 556', bal:'45,000',  days:12, late:false },
    { name:'Juma Mwangi',   phone:'0754 221 009', bal:'128,500', days:42, late:true  },
    { name:'Aisha Kimani',  phone:'0769 887 112', bal:'18,500',  days:5,  late:false },
    { name:'Hassan Bakari', phone:'0623 445 781', bal:'72,000',  days:28, late:true  },
    { name:'Grace Nyambu',  phone:'0712 009 334', bal:'9,200',   days:3,  late:false },
  ];
  return (
    <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:9,overflow:'hidden',minWidth:0}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:12.5,fontWeight:600}}>Credits</div>
          <div style={{fontFamily:'monospace',fontSize:9,color:'var(--fg-4)',marginTop:1}}>5 active · TZS 273,200 outstanding</div>
        </div>
        <span style={{padding:'4px 9px',borderRadius:6,background:accent,fontSize:9.5,color:'#fff'}}>+ New credit</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
        {([['OUTSTANDING','TZS 273,200','var(--bad)'],['COLLECTED MO.','TZS 89,500','var(--good)'],['OVERDUE >30d','2 customers','var(--warn)']] as const).map(([l,v,c])=>(
          <div key={l} style={{border:'1px solid var(--line)',borderRadius:7,padding:'8px 10px',background:'var(--bg-2)'}}>
            <div style={{fontFamily:'monospace',fontSize:7.5,color:'var(--fg-4)',letterSpacing:'0.05em',marginBottom:3}}>{l}</div>
            <div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{border:'1px solid var(--line)',borderRadius:7,overflow:'hidden',background:'var(--bg-2)'}}>
        <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 0.8fr 0.5fr 0.8fr',gap:6,padding:'6px 10px',fontFamily:'monospace',fontSize:7.5,color:'var(--fg-4)',letterSpacing:'0.05em',borderBottom:'1px solid var(--line)',background:'var(--bg-3)'}}>
          <span>CUSTOMER</span><span>PHONE</span><span>BALANCE</span><span>DAYS</span><span>STATUS</span>
        </div>
        {entries.map((e,i)=>(
          <div key={e.name} style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 0.8fr 0.5fr 0.8fr',gap:6,padding:'7px 10px',fontSize:9.5,alignItems:'center',borderBottom:i<entries.length-1?'1px solid var(--line)':0,background:e.late?'rgba(251,113,133,0.03)':'transparent'}}>
            <span style={{fontWeight:e.late?600:400,color:'var(--fg)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.name}</span>
            <span style={{fontFamily:'monospace',fontSize:8.5,color:'var(--fg-4)'}}>{e.phone}</span>
            <span style={{fontFamily:'monospace',fontWeight:600,color:e.late?'var(--bad)':'var(--fg-2)'}}>TZS {e.bal}</span>
            <span style={{fontFamily:'monospace',fontSize:9,color:e.days>30?'var(--bad)':'var(--fg-3)'}}>{e.days}d</span>
            <span style={{fontFamily:'monospace',fontSize:8,padding:'2px 6px',borderRadius:999,color:e.late?'var(--bad)':'var(--good)',background:e.late?'rgba(251,113,133,0.1)':'rgba(52,211,153,0.08)',border:`1px solid ${e.late?'rgba(251,113,133,0.25)':'rgba(52,211,153,0.25)'}`}}>{e.late?'OVERDUE':'CURRENT'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsScreen({ accent }: { accent: string }) {
  const txns = [
    { id:'TXN-2047', time:'15:42', customer:'Fatuma A.',  amt:'142,000', via:'M-Pesa' },
    { id:'TXN-2046', time:'15:28', customer:'Walk-in',    amt:'28,500',  via:'Cash'   },
    { id:'TXN-2045', time:'14:55', customer:'Hassan B.',  amt:'217,000', via:'M-Pesa' },
    { id:'TXN-2044', time:'14:32', customer:'Walk-in',    amt:'54,000',  via:'Bank'   },
    { id:'TXN-2043', time:'13:18', customer:'Grace N.',   amt:'18,900',  via:'Tigo'   },
    { id:'TXN-2042', time:'12:44', customer:'Juma M.',    amt:'96,500',  via:'M-Pesa' },
  ];
  const viaColor: Record<string,string> = { 'M-Pesa':'#10b981', 'Cash':accent, 'Bank':'#60a5fa', 'Tigo':'#f59e0b' };
  return (
    <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:9,overflow:'hidden',minWidth:0}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:12.5,fontWeight:600}}>Transactions</div>
          <div style={{fontFamily:'monospace',fontSize:9,color:'var(--fg-4)',marginTop:1}}>Today · 48 sales · TZS 1.24M</div>
        </div>
        <div style={{display:'flex',gap:4}}>
          {['All','M-Pesa','Cash'].map((f,i)=>(
            <span key={f} style={{padding:'3px 8px',borderRadius:5,fontSize:9,border:`1px solid ${i===0?accent:'var(--line)'}`,color:i===0?accent:'var(--fg-3)',background:i===0?`${accent}12`:'transparent'}}>{f}</span>
          ))}
        </div>
      </div>
      <div style={{border:'1px solid var(--line)',borderRadius:7,overflow:'hidden',background:'var(--bg-2)'}}>
        <div style={{display:'grid',gridTemplateColumns:'0.9fr 0.55fr 1.1fr 1fr 0.65fr',gap:6,padding:'6px 10px',fontFamily:'monospace',fontSize:7.5,color:'var(--fg-4)',letterSpacing:'0.05em',borderBottom:'1px solid var(--line)',background:'var(--bg-3)'}}>
          <span>TXN ID</span><span>TIME</span><span>CUSTOMER</span><span>AMOUNT</span><span>VIA</span>
        </div>
        {txns.map((tx,i)=>(
          <div key={tx.id} style={{display:'grid',gridTemplateColumns:'0.9fr 0.55fr 1.1fr 1fr 0.65fr',gap:6,padding:'7px 10px',fontSize:9.5,alignItems:'center',borderBottom:i<txns.length-1?'1px solid var(--line)':0}}>
            <span style={{fontFamily:'monospace',color:accent,fontSize:9}}>{tx.id}</span>
            <span style={{fontFamily:'monospace',color:'var(--fg-4)',fontSize:8.5}}>{tx.time}</span>
            <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:9}}>{tx.customer}</span>
            <span style={{fontFamily:'monospace',fontWeight:600,fontSize:9.5}}>TZS {tx.amt}</span>
            <span style={{fontFamily:'monospace',fontSize:8,padding:'2px 6px',borderRadius:999,color:viaColor[tx.via]??'var(--fg-3)',background:`${(viaColor[tx.via]??'#888')}18`,border:`1px solid ${(viaColor[tx.via]??'#888')}44`}}>{tx.via}</span>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
        {([['TOTAL','TZS 1.24M'],['M-PESA','52%'],['CASH','28%'],['AVG TICKET','TZS 25,800']] as const).map(([l,v])=>(
          <div key={l} style={{border:'1px solid var(--line)',borderRadius:6,padding:'6px 8px',background:'var(--bg-2)',textAlign:'center'}}>
            <div style={{fontFamily:'monospace',fontSize:7.5,color:'var(--fg-4)',letterSpacing:'0.05em',marginBottom:2}}>{l}</div>
            <div style={{fontSize:10.5,fontWeight:700}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function POSScreen({ accent }: { accent: string }) {
  const items = [
    { name:'Unga wa Sembe 10kg', qty:2, price:14000 },
    { name:'Mafuta Cooking 5L',  qty:1, price:34000 },
    { name:'Sabuni OMO 1kg',     qty:3, price:6200  },
    { name:'Sukari Kilo 1kg',    qty:2, price:3200  },
  ];
  const total = items.reduce((s,it)=>s+it.qty*it.price,0);
  const fmt = (n:number) => 'TZS '+n.toLocaleString('en-US');
  return (
    <div style={{padding:'10px 12px',display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:10,overflow:'hidden',minWidth:0}}>
      <div style={{display:'flex',flexDirection:'column',gap:7}}>
        <div style={{padding:'5px 8px',border:'1px solid var(--line)',borderRadius:6,background:'var(--bg-2)',fontSize:9,color:'var(--fg-4)'}}>Search products…</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5}}>
          {['Unga 10kg','Mafuta 5L','Sabuni OMO','Sukari','Mchele','Chai'].map((p,i)=>(
            <div key={p} style={{padding:'8px 6px',borderRadius:7,border:`1px solid ${i===0?accent:'var(--line)'}`,background:i===0?`${accent}12`:'var(--bg-2)',textAlign:'center',fontSize:9,cursor:'pointer'}}>
              <div style={{fontSize:16,marginBottom:3}}>📦</div>
              <div style={{color:i===0?accent:'var(--fg-2)',fontWeight:i===0?600:400,lineHeight:1.2}}>{p}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6,border:'1px solid var(--line)',borderRadius:8,padding:'9px 10px',background:'var(--bg-2)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
          <span style={{fontSize:10.5,fontWeight:600}}>Current sale</span>
          <span style={{fontFamily:'monospace',fontSize:8.5,color:accent}}>TXN-2048</span>
        </div>
        {items.map(it=>(
          <div key={it.name} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'5px 0',borderBottom:'1px solid var(--line)'}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:9,color:'var(--fg)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.name}</div>
              <div style={{fontFamily:'monospace',fontSize:8,color:'var(--fg-4)',marginTop:1}}>×{it.qty} · {fmt(it.price)}</div>
            </div>
            <div style={{fontFamily:'monospace',fontSize:9.5,fontWeight:600,flexShrink:0,marginLeft:6}}>{fmt(it.qty*it.price)}</div>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderTop:'1px solid var(--line-2)',marginTop:2}}>
          <span style={{fontSize:10.5,fontWeight:600}}>Total</span>
          <span style={{fontFamily:'monospace',fontSize:12,fontWeight:700,color:accent}}>{fmt(total)}</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:4}}>
          {['Cash','M-Pesa','Bank','Credit'].map((m,i)=>(
            <div key={m} style={{padding:'5px',borderRadius:5,fontSize:9,textAlign:'center',border:`1px solid ${i===1?accent:'var(--line)'}`,background:i===1?`${accent}18`:'transparent',color:i===1?accent:'var(--fg-3)',cursor:'pointer'}}>{m}</div>
          ))}
        </div>
        <div style={{padding:'7px',borderRadius:6,background:accent,color:'#fff',textAlign:'center',fontSize:10,fontWeight:600}}>Complete sale →</div>
      </div>
    </div>
  );
}

// ── Shared sidebar + content shell ─────────────────────────────────────────────
const NAV_ITEMS: Array<{ label: string; screen: Screen | null }> = [
  { label:'Dashboard',     screen:'dashboard'    },
  { label:'Point of Sale', screen:'pos'          },
  { label:'Inventory',     screen:'inventory'    },
  { label:'Transactions',  screen:'transactions' },
  { label:'Credits',       screen:'credits'      },
  { label:'Analytics',     screen:null           },
  { label:'Ziada AI',      screen:null           },
];

function AppShellMockup({ accent, activeScreen, children }: { accent: string; activeScreen: Screen; children: React.ReactNode }) {
  return (
    <div className="dash-main-grid" style={{display:'grid',gridTemplateColumns:'136px 1fr',background:'var(--bg)',color:'var(--fg)'}}>
      <div className="dash-sidebar" style={{borderRight:'1px solid var(--line)',padding:'12px 10px',display:'flex',flexDirection:'column',gap:2}}>
        <div style={{display:'flex',alignItems:'center',gap:7,padding:'0 4px',marginBottom:12}}>
          <span style={{width:22,height:22,borderRadius:6,background:accent,color:'#fff',display:'grid',placeItems:'center',fontSize:11,fontWeight:700,flexShrink:0}}>Z</span>
          <div>
            <div style={{fontSize:11.5,fontWeight:600}}>Ziada</div>
            <div style={{fontFamily:'monospace',fontSize:9,color:'var(--fg-4)',marginTop:1}}>Duka Kuu · DSM</div>
          </div>
        </div>
        {NAV_ITEMS.map(({label,screen})=>{
          const active = screen === activeScreen;
          return (
            <div key={label} style={{padding:'5px 8px',borderRadius:5,fontSize:10.5,color:active?'var(--fg)':'var(--fg-3)',background:active?`${accent}18`:'transparent',borderLeft:`2px solid ${active?accent:'transparent'}`,transition:'all 250ms'}}>
              {label}
            </div>
          );
        })}
      </div>
      <div style={{overflow:'hidden',minWidth:0}}>{children}</div>
    </div>
  );
}

// ── Live app showcase — auto-rotates every 10s ─────────────────────────────────
function LiveAppShowcase({ accent }: { accent: string }) {
  const [idx, setIdx] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % SCREEN_ORDER.length); setVisible(true); }, 280);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  function jumpTo(i: number) {
    if (i === idx) return;
    setVisible(false);
    setTimeout(() => { setIdx(i); setVisible(true); }, 280);
  }

  const activeScreen = SCREEN_ORDER[idx];

  return (
    <div style={{borderRadius:12,overflow:'hidden',border:'1px solid var(--line-2)',boxShadow:'0 30px 80px -20px rgba(0,0,0,0.4)',background:'var(--bg)',color:'var(--fg)'}}>
      {/* Chrome bar */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:'1px solid var(--line)',background:'var(--bg-2)'}}>
        <div style={{display:'flex',gap:6}}>
          {['var(--bad)','var(--warn)','var(--good)'].map((c,i)=><span key={i} style={{width:10,height:10,borderRadius:999,background:c,opacity:0.6,display:'block'}}/>)}
        </div>
        <span style={{fontFamily:'var(--mono,monospace)',fontSize:11,color:'var(--fg-4)',marginLeft:6,transition:'opacity 280ms',opacity:visible?1:0}}>
          {SCREEN_URLS[activeScreen]}
        </span>
        <span style={{marginLeft:'auto',fontFamily:'var(--mono,monospace)',fontSize:10.5,color:'var(--fg-4)'}}>v2.4.1</span>
      </div>

      {/* Screen content */}
      <div style={{opacity:visible?1:0,transition:'opacity 280ms ease'}}>
        <AppShellMockup accent={accent} activeScreen={activeScreen}>
          {activeScreen === 'dashboard'    && <DashboardScreen    accent={accent}/>}
          {activeScreen === 'inventory'    && <InventoryScreen    accent={accent}/>}
          {activeScreen === 'credits'      && <CreditsScreen      accent={accent}/>}
          {activeScreen === 'transactions' && <TransactionsScreen accent={accent}/>}
          {activeScreen === 'pos'          && <POSScreen          accent={accent}/>}
        </AppShellMockup>
      </div>

      {/* Progress bar + dot nav */}
      <div style={{borderTop:'1px solid var(--line)',padding:'9px 14px',background:'var(--bg-2)',display:'flex',alignItems:'center',gap:10}}>
        <div style={{display:'flex',gap:5,flex:1}}>
          {SCREEN_ORDER.map((s,i)=>(
            <button key={s} onClick={()=>jumpTo(i)} title={s.charAt(0).toUpperCase()+s.slice(1)}
              style={{flex:1,height:3,borderRadius:999,background:i===idx?accent:'var(--line-2)',border:0,cursor:'pointer',padding:0,transition:'background 300ms,transform 200ms',transform:i===idx?'scaleY(1.5)':'none',transformOrigin:'center'}}
            />
          ))}
        </div>
        <span style={{fontFamily:'var(--mono)',fontSize:9.5,color:'var(--fg-4)',flexShrink:0,minWidth:32,textAlign:'right'}}>
          {idx+1} / {SCREEN_ORDER.length}
        </span>
      </div>
    </div>
  );
}

// ── Module meta (icon + colors) ────────────────────────────────────────────────
const MODULE_META: Record<string, { color: string; bg: string; icon: string }> = {
  pos:       { color: '#4B3FD4', bg: 'rgba(75,63,212,0.08)',  icon: '⊞' },
  inventory: { color: '#1D9E75', bg: 'rgba(29,158,117,0.1)',  icon: '⬡' },
  analytics: { color: '#BA7517', bg: 'rgba(186,117,23,0.1)',  icon: '↗' },
  credits:   { color: '#A32D2D', bg: 'rgba(163,45,45,0.1)',   icon: '◈' },
  ai:        { color: '#4B3FD4', bg: 'rgba(75,63,212,0.08)',  icon: '✦' },
};

function getFeatures(lang: Lang) {
  return [
    { n: '01', id: 'pos',       title: t(lang,'feat_pos_title'), tagline: t(lang,'feat_pos_tag'), desc: t(lang,'feat_pos_desc'), bullets: [t(lang,'feat_pos_b1'), t(lang,'feat_pos_b2'), t(lang,'feat_pos_b3')] },
    { n: '02', id: 'inventory', title: t(lang,'feat_inv_title'), tagline: t(lang,'feat_inv_tag'), desc: t(lang,'feat_inv_desc'), bullets: [t(lang,'feat_inv_b1'), t(lang,'feat_inv_b2'), t(lang,'feat_inv_b3')] },
    { n: '03', id: 'analytics', title: t(lang,'feat_ana_title'), tagline: t(lang,'feat_ana_tag'), desc: t(lang,'feat_ana_desc'), bullets: [t(lang,'feat_ana_b1'), t(lang,'feat_ana_b2'), t(lang,'feat_ana_b3')] },
    { n: '04', id: 'credits',   title: t(lang,'feat_crd_title'), tagline: t(lang,'feat_crd_tag'), desc: t(lang,'feat_crd_desc'), bullets: [t(lang,'feat_crd_b1'), t(lang,'feat_crd_b2'), t(lang,'feat_crd_b3')] },
    { n: '05', id: 'ai',        title: t(lang,'feat_ai_title'),  tagline: t(lang,'feat_ai_tag'),  desc: t(lang,'feat_ai_desc'),  bullets: [t(lang,'feat_ai_b1'),  t(lang,'feat_ai_b2'),  t(lang,'feat_ai_b3')]  },
  ];
}

function FeatureIllustration({ id, color, bg }: { id: string; color: string; bg: string }) {
  if (id === 'pos') return (
    <div style={{ borderRadius: 10, border: `1px solid ${color}22`, background: bg, padding: '12px 14px', fontFamily: 'var(--mono)', width: '100%' }}>
      <div style={{ fontSize: 8, color: 'var(--fg-4)', letterSpacing: '0.05em', marginBottom: 10 }}>RECEIPT · TXN-2047</div>
      {[['Unga wa Sembe 2kg','×2','3,400'],['Mafuta Cooking 1L','×1','5,200'],['Sabuni OMO 1kg','×3','2,700']].map(([n,q,a]) => (
        <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--fg)', lineHeight: 1.3 }}>{n}</div>
            <div style={{ fontSize: 8, color: 'var(--fg-4)' }}>{q}</div>
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--fg-2)' }}>{a}</div>
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${color}33`, marginTop: 4, paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 8.5, color: 'var(--fg-4)' }}>JUMLA</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>11,300</span>
      </div>
      <div style={{ marginTop: 8, borderRadius: 6, background: color, color: '#fff', fontSize: 9, fontWeight: 600, textAlign: 'center', padding: '6px 0', letterSpacing: '0.02em' }}>M-Pesa · Lipa ✓</div>
    </div>
  );

  if (id === 'inventory') return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--fg-4)', letterSpacing: '0.05em', marginBottom: 10 }}>STOCK LEVELS</div>
      {[['Unga wa Sembe',85,false],['Mafuta Cooking',34,false],['Sabuni OMO',11,true],['Sukari 1kg',72,false]].map(([n,pct,warn]) => (
        <div key={n as string} style={{ marginBottom: 9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: warn ? color : 'var(--fg-2)', fontFamily: 'var(--mono)' }}>{n as string}</span>
            {warn && <span style={{ fontSize: 7, color, border: `1px solid ${color}55`, borderRadius: 3, padding: '0 4px', fontFamily: 'var(--mono)' }}>LOW</span>}
          </div>
          <div style={{ height: 4, borderRadius: 999, background: 'var(--bg-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999, background: warn ? color : `${color}88`, width: `${pct}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
      ))}
    </div>
  );

  if (id === 'analytics') {
    const bars = [28,42,60,78,95,82,70,55,88,64,74,90];
    const max = Math.max(...bars);
    return (
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--fg-4)', letterSpacing: '0.05em', marginBottom: 8 }}>MAPATO KWA SAA</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 56 }}>
          {bars.map((v,i) => (
            <div key={i} style={{ flex: 1, borderRadius: '2px 2px 0 0', background: i === 9 ? color : `${color}50`, height: `${(v/max)*100}%`, transition: 'height 0.3s' }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, marginBottom: 10 }}>
          {['6am','9','12','3pm','6','9'].map(l => <span key={l} style={{ fontFamily: 'var(--mono)', fontSize: 7.5, color: 'var(--fg-4)' }}>{l}</span>)}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['LEO','4.21M'],['FAIDA','1.12M']].map(([lbl,val]) => (
            <div key={lbl} style={{ flex: 1, borderRadius: 6, border: `1px solid ${color}33`, background: bg, padding: '5px 7px', textAlign: 'center' }}>
              <div style={{ fontSize: 7.5, color: 'var(--fg-4)', fontFamily: 'var(--mono)', marginBottom: 2 }}>{lbl}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '-0.02em' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === 'credits') return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 8, fontFamily: 'var(--mono)', color: 'var(--fg-4)', letterSpacing: '0.05em', marginBottom: 8 }}>MIKOPO · HAI</div>
      {[['Fatuma A.','45,000',12,false],['Juma M.','128,000',42,true],['Aisha K.','18,500',5,false]].map(([n,a,d,bad]) => (
        <div key={n as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontSize: 9.5, color: 'var(--fg)', fontWeight: bad ? 600 : 400 }}>{n as string}</div>
            <div style={{ fontSize: 8, color: 'var(--fg-4)', fontFamily: 'var(--mono)' }}>siku {d as number}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--mono)', color: bad ? color : 'var(--fg-2)' }}>{a as string}</div>
            {bad && <div style={{ fontSize: 7, color, fontFamily: 'var(--mono)', border: `1px solid ${color}55`, borderRadius: 3, padding: '0 4px', display: 'inline-block', marginTop: 2 }}>LATE</div>}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 7, padding: '5px 8px', borderRadius: 6, background: bg, border: `1px solid ${color}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 8, color: 'var(--fg-4)', fontFamily: 'var(--mono)' }}>JUMLA DENI</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'var(--mono)' }}>191,500</span>
      </div>
    </div>
  );

  if (id === 'ai') return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ alignSelf: 'flex-end', maxWidth: '85%', padding: '7px 10px', borderRadius: '10px 10px 2px 10px', background: 'var(--bg-3)', border: '1px solid var(--line)' }}>
        <p style={{ margin: 0, fontSize: 9.5, color: 'var(--fg-2)', lineHeight: 1.4 }}>Top products this week?</p>
      </div>
      <div style={{ alignSelf: 'flex-start', maxWidth: '90%', padding: '8px 10px', borderRadius: '10px 10px 10px 2px', background: bg, border: `1px solid ${color}33` }}>
        <p style={{ margin: 0, fontSize: 9.5, color: 'var(--fg)', lineHeight: 1.5 }}>Unga wa Sembe led with <strong style={{ color }}>TZS 1.42M</strong> — up 18% vs last week.</p>
      </div>
      <div style={{ alignSelf: 'flex-end', maxWidth: '75%', padding: '7px 10px', borderRadius: '10px 10px 2px 10px', background: 'var(--bg-3)', border: '1px solid var(--line)' }}>
        <p style={{ margin: 0, fontSize: 9.5, color: 'var(--fg-2)', lineHeight: 1.4 }}>Draft a restock order</p>
      </div>
      <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: color, display: 'inline-block', boxShadow: `0 0 0 3px ${color}33` }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color }}>drafting order...</span>
      </div>
    </div>
  );

  return null;
}


// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero({ accent }: { accent: string }) {
  const { lang } = useLang();
  return (
    <section className="hero-section" style={{ paddingTop: 88, paddingBottom: 96, position: 'relative', overflow: 'hidden' }}>
      {/* radial glow behind the heading */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 900, height: 560, background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${accent}22 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        <div style={{ maxWidth: 2800, margin: '0 auto', textAlign: 'center' }}>

          {/* Badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 14px 5px 10px', border: `1px solid ${accent}44`,
            borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 11,
            letterSpacing: '0.04em', color: accent,
            background: `${accent}0e`, marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, boxShadow: `0 0 0 3px ${accent}33`, display: 'inline-block' }} />
            {t(lang, 'hero_badge')}
          </span>

          {/* Heading */}
          <h1 className="hero-h1" style={{ margin: 0, fontSize: 'clamp(48px, 6.2vw, 80px)', lineHeight: 1.0, fontWeight: 900, letterSpacing: '-0.04em', fontFamily: 'var(--sans)' }}>
            {t(lang, 'hero_h1a')}<br />
            <span style={{ color: accent }}>{t(lang, 'hero_h1b')}</span>
          </h1>

          <p style={{ margin: '26px auto 0', fontSize: 17, lineHeight: 1.65, color: 'var(--fg-2)', maxWidth: 520 }}>
            {t(lang, 'hero_sub')}
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, marginTop: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 999, background: accent, color: '#fff', fontSize: 14.5, fontWeight: 600, textDecoration: 'none', boxShadow: `0 4px 20px ${accent}55` }}>
              {t(lang, 'hero_trial')} <span>→</span>
            </Link>
            <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 999, border: '1px solid var(--line-2)', color: 'var(--fg)', fontSize: 14.5, textDecoration: 'none', background: 'var(--bg-2)' }}>
              {t(lang, 'hero_signin')}
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 20, marginTop: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
            {(['hero_trust1','hero_trust2','hero_trust3','hero_trust4'] as const).map((key) => (
              <span key={key} style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L4.8 8.5L9.5 3.8" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {t(lang, key)}
              </span>
            ))}
          </div>
        </div>

        {/* Live app showcase */}
        <div className="hero-mock-wrap" style={{ maxWidth: 1040, margin: '64px auto 0', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: -48, left: '12%', right: '12%', height: 96, background: accent, filter: 'blur(72px)', opacity: 0.22, borderRadius: '50%', pointerEvents: 'none' }} />
          <LiveAppShowcase accent={accent} />
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ───────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const { lang } = useLang();
  const testimonials = [
    { quoteKey: 'test_q1' as const, roleKey: 'test_q1_role' as const, name: 'Amina J.',  location: 'Mwanza',        initial: 'A' },
    { quoteKey: 'test_q2' as const, roleKey: 'test_q2_role' as const, name: 'Hassan B.', location: 'Dar es Salaam', initial: 'H' },
    { quoteKey: 'test_q3' as const, roleKey: 'test_q3_role' as const, name: 'Grace N.',  location: 'Arusha',        initial: 'G' },
  ];

  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 10 }}>{t(lang, 'test_label')}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08 }}>{t(lang, 'test_h2')}</h2>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>{t(lang, 'test_count')}</span>
          </div>
        </div>
        <div className="mkt-testimonials-grid">
          {testimonials.map((tst) => (
            <div key={tst.name} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '24px', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: 'var(--fg)', fontStyle: 'italic' }}>{t(lang, tst.quoteKey)}</p>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, display: 'flex', gap: 12, alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', display: 'grid', placeItems: 'center', color: 'var(--accent)', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                  {tst.initial}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{tst.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{t(lang, tst.roleKey)} · {tst.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Feature section — desktop: all 5 compact cards; mobile: carousel ──────────
const FEAT_INTERVAL = 7000;

function FeatureCarousel() {
  const { lang } = useLang();
  const features = getFeatures(lang);
  const [idx, setIdx] = React.useState(0);
  const [dir, setDir] = React.useState(1);

  React.useEffect(() => {
    const timer = setInterval(() => { setDir(1); setIdx(i => (i + 1) % features.length); }, FEAT_INTERVAL);
    return () => clearInterval(timer);
  }, [features.length]);

  function go(next: number, d: number) {
    setDir(d);
    setIdx(((next % features.length) + features.length) % features.length);
  }

  const f = features[idx];
  const meta = MODULE_META[f.id] ?? MODULE_META.pos;

  return (
    <section id="features" style={{ padding: '88px 0', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 10 }}>{t(lang, 'feat_label')}</div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08 }}>{t(lang, 'feat_h2')}</h2>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--fg-3)', fontFamily: 'var(--mono)' }}>{t(lang, 'feat_sub')}</p>
        </div>

        {/* ── Desktop: bento grid — 3 top, Credits + AI (wider) on row 2 ── */}
        <div className="feat-desktop-grid">
          {features.map((feat, i) => {
            const m = MODULE_META[feat.id] ?? MODULE_META.pos;
            const isAI = i === 4;
            const illW = isAI ? 210 : 130;
            return (
              <div key={feat.id} style={{
                gridColumn: isAI ? 'span 2' : undefined,
                display: 'grid',
                gridTemplateColumns: `1fr ${illW}px`,
                gap: isAI ? 32 : 20,
                alignItems: 'center',
                padding: '26px 28px',
                border: '1px solid var(--line)',
                borderRadius: 12,
                background: 'var(--bg-2)',
              }}>
                {/* Text */}
                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 11px', borderRadius: 999,
                    border: `1px solid ${m.color}44`, background: `${m.color}14`,
                    fontFamily: 'var(--mono)', fontSize: 10, color: m.color,
                    letterSpacing: '0.04em', marginBottom: 12,
                  }}>
                    {feat.n} · {feat.id.toUpperCase()}
                  </span>
                  <h3 style={{ margin: '0 0 5px', fontSize: isAI ? 22 : 18, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--fg)' }}>
                    {feat.title}
                  </h3>
                  <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>{feat.tagline}</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {feat.bullets.map(b => (
                      <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.4 }}>
                        <span style={{ color: m.color, fontWeight: 700, flexShrink: 0, lineHeight: 1.3 }}>›</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Illustration */}
                <div style={{ width: illW, flexShrink: 0 }}>
                  <FeatureIllustration id={feat.id} color={m.color} bg={m.bg} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Mobile: carousel, one card at a time ── */}
        <div className="feat-mobile-carousel">
          <article
            key={`fc-${lang}-${idx}`}
            className={`feat-carousel-card ${dir >= 0 ? 'feat-enter-fwd' : 'feat-enter-back'}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: 64,
              alignItems: 'center',
              padding: '52px 56px',
              border: '1px solid var(--line)',
              borderRadius: 16,
              background: 'var(--bg-2)',
              minHeight: 360,
            }}
          >
            {/* Text */}
            <div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 14px', borderRadius: 999,
                border: `1px solid ${meta.color}55`, background: `${meta.color}18`,
                fontFamily: 'var(--mono)', fontSize: 11.5, color: meta.color,
                letterSpacing: '0.04em', marginBottom: 24,
              }}>
                {f.n} · {f.id.toUpperCase()}
              </span>
              <h3 style={{ margin: '0 0 14px', fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08, color: 'var(--fg)' }}>
                {f.title}
              </h3>
              <p style={{ margin: '0 0 8px', fontSize: 16.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>{f.tagline}</p>
              <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.7 }}>{f.desc}</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {f.bullets.map(b => (
                  <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>
                    <span style={{ color: meta.color, fontWeight: 700, flexShrink: 0, fontSize: 18, lineHeight: 1.1 }}>›</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            {/* Illustration */}
            <div className="feat-carousel-illus">
              <FeatureIllustration id={f.id} color={meta.color} bg={meta.bg} />
            </div>
          </article>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20 }}>
            <button onClick={() => go(idx - 1, -1)} aria-label="Previous"
              style={{ width: 38, height: 38, borderRadius: 9, border: '1px solid var(--line)', background: 'var(--bg-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--fg-2)', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div style={{ flex: 1, display: 'flex', gap: 6 }}>
              {features.map((ft, i) => (
                <button key={ft.id} onClick={() => go(i, i > idx ? 1 : -1)} aria-label={ft.title}
                  style={{ flex: 1, height: 4, borderRadius: 999, border: 0, cursor: 'pointer', padding: 0, background: i === idx ? meta.color : 'var(--line-2)', transition: 'background 300ms' }}
                />
              ))}
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', flexShrink: 0 }}>{idx + 1} / {features.length}</span>
            <button onClick={() => go(idx + 1, 1)} aria-label="Next"
              style={{ width: 38, height: 38, borderRadius: 9, border: '1px solid var(--line)', background: 'var(--bg-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--fg-2)', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Auto-progress bar */}
          <div style={{ marginTop: 10, height: 2, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
            <div key={`pb-${lang}-${idx}`} style={{
              height: '100%', width: '100%', background: meta.color,
              borderRadius: 999, transformOrigin: 'left center',
              animation: `feat-progress ${FEAT_INTERVAL}ms linear forwards`,
            }} />
          </div>
        </div>

      </div>
    </section>
  );
}

// ── AI section ─────────────────────────────────────────────────────────────────
function AISection({ accent }: { accent: string }) {
  const { lang } = useLang();

  const props = [
    { titleKey: 'ai_prop1_t' as const, descKey: 'ai_prop1_d' as const },
    { titleKey: 'ai_prop2_t' as const, descKey: 'ai_prop2_d' as const },
    { titleKey: 'ai_prop3_t' as const, descKey: 'ai_prop3_d' as const },
    { titleKey: 'ai_prop4_t' as const, descKey: 'ai_prop4_d' as const },
  ];

  return (
    <section id="ai" style={{ padding: '80px 0', borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 10 }}>{t(lang, 'ai_label')}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08 }}>{t(lang, 'ai_h2')}</h2>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--mono)' }}>{t(lang, 'ai_badge')}</p>
          </div>
        </div>

        {/* Chat window — centered, full width up to 760px */}
        {(() => {
          const rows: Array<[string, string, string, string, 'low' | 'ok' | 'critical']> = [
            ['1', 'Unga wa Sembe 10kg',   `50 ${t(lang, 'ai_chat_sold')}`, `8 ${t(lang, 'ai_chat_left')}`,  'low'     ],
            ['2', 'Mafuta ya Cooking 5L', `34 ${t(lang, 'ai_chat_sold')}`, `24 ${t(lang, 'ai_chat_left')}`, 'ok'      ],
            ['3', 'Sabuni ya OMO 1kg',    `42 ${t(lang, 'ai_chat_sold')}`, `3 ${t(lang, 'ai_chat_left')}`,  'critical'],
          ];
          const statusLabel: Record<'low' | 'ok' | 'critical', string> = {
            low:      t(lang, 'ai_chat_low'),
            ok:       t(lang, 'ai_chat_ok'),
            critical: t(lang, 'ai_chat_critical'),
          };
          const chips = [
            t(lang, 'ai_chat_chip1'),
            t(lang, 'ai_chat_chip2'),
            t(lang, 'ai_chat_chip3'),
          ];
          return (
            <div style={{ maxWidth: 760, margin: '0 auto 32px' }}>
              <WindowChrome url="app.ziadapos.com/ai">
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--bg)', color: 'var(--fg)' }}>
                  {/* Chat header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 24, height: 24, borderRadius: 7, background: `${accent}22`, color: accent, display: 'grid', placeItems: 'center', fontSize: 12 }}>✦</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Ziada AI</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--fg-4)' }}>· Duka Kuu</span>
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--fg-3)', display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span style={{ width: 5, height: 5, borderRadius: 999, background: accent, display: 'inline-block' }} /> 142 ms
                    </span>
                  </div>

                  {/* User bubble */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ maxWidth: '70%', padding: '9px 13px', border: '1px solid var(--line-2)', borderRadius: '12px 12px 4px 12px', fontSize: 13 }}>
                      {t(lang, 'ai_chat_user_q')}
                    </div>
                  </div>

                  {/* AI response */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 7, background: `${accent}22`, color: accent, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 12 }}>✦</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55, marginBottom: 10 }}>{t(lang, 'ai_chat_ai_intro')}</div>
                      <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
                        {rows.map(([n, name, sold, left, s]) => (
                          <div key={n} style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto auto auto', gap: 10, alignItems: 'center', padding: '8px 12px', fontSize: 12, borderBottom: s !== 'critical' ? '1px solid var(--line)' : 'none', background: s === 'critical' ? 'rgba(251,113,133,0.04)' : 'transparent' }}>
                            <span style={{ fontFamily: 'monospace', color: 'var(--fg-4)', fontSize: 11 }}>{n}</span>
                            <span style={{ color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                            <span style={{ fontFamily: 'monospace', color: 'var(--fg-3)', fontSize: 11, whiteSpace: 'nowrap' }}>{sold}</span>
                            <span style={{ fontFamily: 'monospace', color: 'var(--fg-4)', fontSize: 11, whiteSpace: 'nowrap' }}>{left}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: 9.5, padding: '2px 7px', borderRadius: 999, whiteSpace: 'nowrap', color: s === 'critical' ? 'var(--bad)' : s === 'low' ? 'var(--warn)' : 'var(--good)', background: s === 'critical' ? 'rgba(251,113,133,0.1)' : s === 'low' ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)' }}>{statusLabel[s]}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55, marginTop: 10, marginBottom: 8 }}>
                        {t(lang, 'ai_chat_reorder')}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {chips.map((c, i) => (
                          <span key={c} style={{ fontFamily: 'monospace', fontSize: 11, padding: '4px 10px', borderRadius: 999, border: '1px solid var(--line-2)', color: i === 0 ? accent : 'var(--fg-2)', background: i === 0 ? `${accent}18` : 'transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Input bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 9, background: 'var(--bg-2)' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--fg-4)' }}>›</span>
                    <span style={{ fontSize: 13, color: 'var(--fg-3)', flex: 1 }}>{t(lang, 'ai_chat_input')}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--fg-4)' }}>⌘ K</span>
                  </div>
                </div>
              </WindowChrome>
            </div>
          );
        })()}

        {/* 4 prop cards — 1px-gap grid trick creates dividers */}
        <div className="ai-props-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
          {props.map(({ titleKey, descKey }) => (
            <div key={titleKey} style={{ padding: '22px 24px', background: 'var(--bg-2)' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>{t(lang, titleKey)}</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.6 }}>{t(lang, descKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing teaser ─────────────────────────────────────────────────────────────
function PricingTeaser() {
  const { lang } = useLang();

  const plans = [
    {
      name: 'Starter',
      price: 'TZS 15,000',
      period: '/month',
      descKey: 'plan_starter_desc' as const,
      features: ['1 store', 'Up to 500 products', '2 staff accounts', 'POS + Inventory + Credits'],
      ctaKey: 'pricing_trial' as const,
      href: '/auth/register',
      popular: false,
    },
    {
      name: 'Business',
      price: 'TZS 40,000',
      period: '/month',
      descKey: 'plan_biz_desc' as const,
      features: ['Up to 3 stores', 'Unlimited products', '10 staff accounts', 'Ziada AI included'],
      ctaKey: 'pricing_trial' as const,
      href: '/auth/register',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      descKey: 'plan_ent_desc' as const,
      features: ['Unlimited stores', 'API access', 'Unlimited staff', 'Dedicated support'],
      ctaKey: 'pricing_contact' as const,
      href: '/contact',
      popular: false,
    },
  ];

  return (
    <section style={{ padding: '88px 0', borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 40, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 10 }}>{t(lang, 'pricing_label')}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08 }}>{t(lang, 'pricing_h2')}</h2>
            <Link href="/pricing" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', textDecoration: 'none', flexShrink: 0 }}>{t(lang, 'pricing_see')}</Link>
          </div>
        </div>

        <div className="mkt-pricing-grid">
          {plans.map((plan) => (
            <div key={plan.name} style={{ border: `1px solid ${plan.popular ? 'var(--accent-line)' : 'var(--line)'}`, borderRadius: 12, background: plan.popular ? 'var(--accent-soft)' : 'var(--bg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 12px', borderRadius: 999, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {t(lang, 'pricing_popular')}
                </div>
              )}
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-4)', letterSpacing: '0.08em', marginBottom: 8 }}>{plan.name.toUpperCase()}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>{plan.period}</span>}
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.55 }}>{t(lang, plan.descKey)}</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-2)' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5L5 9.5L11 3.5" stroke="var(--good)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: 8, background: plan.popular ? 'var(--accent)' : 'var(--bg-3)', color: plan.popular ? '#fff' : 'var(--fg)', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', border: plan.popular ? 'none' : '1px solid var(--line)', marginTop: 'auto' }}>
                {t(lang, plan.ctaKey)} {plan.popular ? ' →' : ''}
              </Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)' }}>
          {t(lang, 'pricing_foot')}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────────
function FAQSection() {
  const { lang } = useLang();
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { qKey: 'faq_q1' as const, aKey: 'faq_a1' as const },
    { qKey: 'faq_q2' as const, aKey: 'faq_a2' as const },
    { qKey: 'faq_q3' as const, aKey: 'faq_a3' as const },
    { qKey: 'faq_q4' as const, aKey: 'faq_a4' as const },
    { qKey: 'faq_q5' as const, aKey: 'faq_a5' as const },
    { qKey: 'faq_q6' as const, aKey: 'faq_a6' as const },
  ];

  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 40, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em', marginBottom: 10 }}>{t(lang, 'faq_label')}</div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08 }}>{t(lang, 'faq_h2')}</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {faqs.map(({ qKey, aKey }, i) => (
            <div key={i} style={{ borderTop: '1px solid var(--line)' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '18px 0', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', gap: 16 }}
              >
                <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg)' }}>{t(lang, qKey)}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--fg-3)', flexShrink: 0, display: 'inline-block', transition: 'transform 200ms', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {open === i && (
                <div style={{ paddingBottom: 20, fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.65 }}>{t(lang, aKey)}</div>
              )}
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--line)' }} />
        </div>
        <div style={{ marginTop: 32, padding: '20px 24px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{t(lang, 'faq_still')}</div>
            <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 3 }}>{t(lang, 'faq_team')}</div>
          </div>
          <a href="https://wa.me/255692069230?text=Hi%2C+I+have+a+question+about+Ziada" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 7, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            {t(lang, 'faq_wa')}
          </a>
        </div>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────────
function CTA() {
  const { lang } = useLang();
  return (
    <section style={{ padding: '100px 0 88px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.08em' }}>{t(lang, 'cta_label')}</div>
        <h2 style={{ margin: '16px 0 18px', fontSize: 'clamp(36px, 4.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.02, fontFamily: 'var(--sans)' }}>
          {t(lang, 'cta_h2a')}<br />
          <span style={{ color: 'var(--accent)' }}>{t(lang, 'cta_h2b')}</span>
        </h2>
        <p style={{ margin: '0 auto', maxWidth: 520, fontSize: 16, color: 'var(--fg-2)' }}>
          {t(lang, 'cta_sub')}
        </p>
        <div style={{ display: 'inline-flex', gap: 10, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            {t(lang, 'cta_trial')} <span style={{ opacity: 0.8 }}>→</span>
          </Link>
          <a
            href="https://wa.me/255692069230?text=Hi%2C+I%27d+like+to+learn+more+about+Ziada"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 18px', borderRadius: 7, border: '1px solid var(--line)', color: 'var(--fg)', fontSize: 14, textDecoration: 'none' }}
          >
            {t(lang, 'cta_talk')}
          </a>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-4)', marginTop: 32, letterSpacing: '0.05em' }}>
          DAR ES SALAAM · ARUSHA · MWANZA · DODOMA · MBEYA · ZANZIBAR
        </div>
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const accent = '#6366f1';

  return (
    <>
      <style>{`
        /* ── Dashboard mockup responsive ── */
        @media (max-width: 900px) {
          .dash-sidebar { display: none !important; }
          .dash-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .dash-kpi-grid { grid-template-columns: repeat(2,1fr) !important; }
          .dash-mid-grid { grid-template-columns: 1fr !important; }
          .dash-bot-grid { grid-template-columns: 1fr !important; }
          .dash-txn-table { display: none !important; }
        }

        /* ── Hero ── */
        @media (max-width: 640px) {
          .hero-h1 { font-size: 48px !important; letter-spacing: -0.03em !important; }
          .hero-section { padding-top: 56px !important; padding-bottom: 56px !important; }
          .hero-mock-wrap { margin-top: 36px !important; }
        }

        /* ── Feature carousel animations ── */
        @keyframes feat-enter-fwd  { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: none; } }
        @keyframes feat-enter-back { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: none; } }
        @keyframes feat-progress   { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .feat-enter-fwd  { animation: feat-enter-fwd  350ms cubic-bezier(0.16,1,0.3,1) forwards; }
        .feat-enter-back { animation: feat-enter-back 350ms cubic-bezier(0.16,1,0.3,1) forwards; }

        /* Feature carousel responsive */
        /* Feature section — responsive show/hide */
        .feat-desktop-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .feat-mobile-carousel { display: none; }

        @media (max-width: 768px) {
          .feat-desktop-grid { display: none; }
          .feat-mobile-carousel { display: block; }
          .feat-carousel-card { grid-template-columns: 1fr !important; padding: 36px 28px !important; gap: 32px !important; }
          .feat-carousel-illus { max-width: 340px; }
          .ai-props-row { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .feat-carousel-card { padding: 28px 20px !important; gap: 24px !important; }
        }
      `}</style>

      <Hero accent={accent} />
      <FeatureCarousel />
      <AISection accent={accent} />
      <PricingTeaser />
      <TestimonialsSection />
      <FAQSection />
      <CTA />
    </>
  );
}
