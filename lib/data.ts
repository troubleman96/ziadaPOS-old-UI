import { seeded } from './utils';

// ─── Products ─────────────────────────────────────────────────────────────────
export const PRODUCTS_SIMPLE = [
  { id: 'p1',  name: 'Unga wa Sembe 10kg',   sku: 'UWS-10',  price: 28500, cost: 24000 },
  { id: 'p2',  name: 'Sabuni ya OMO 1kg',    sku: 'SAB-1',   price: 6200,  cost: 4800  },
  { id: 'p3',  name: 'Mafuta ya Cooking 5L', sku: 'MFC-5',   price: 34000, cost: 28500 },
  { id: 'p4',  name: 'Sukari 2kg',           sku: 'SUK-2',   price: 7000,  cost: 5600  },
  { id: 'p5',  name: 'Chai Bora 500g',       sku: 'CHB-500', price: 4800,  cost: 3600  },
  { id: 'p6',  name: 'Mchele Pishori 5kg',   sku: 'MCP-5',   price: 22000, cost: 18000 },
  { id: 'p7',  name: 'Lotion Nivea 400ml',   sku: 'LNV-400', price: 12500, cost: 9000  },
  { id: 'p8',  name: 'Soda Coca-Cola 500ml', sku: 'COK-500', price: 1500,  cost: 1100  },
  { id: 'p9',  name: 'Mkate Bumi 600g',      sku: 'MKB-600', price: 2200,  cost: 1600  },
  { id: 'p10', name: 'Sabuni ya Geisha',     sku: 'GSH-100', price: 1200,  cost: 900   },
  { id: 'p11', name: 'Mafuta Cooking 1L',    sku: 'MFC-1',   price: 8500,  cost: 7000  },
  { id: 'p12', name: 'Maziwa Fresh 500ml',   sku: 'MZW-500', price: 1800,  cost: 1400  },
];

// ─── Inventory ────────────────────────────────────────────────────────────────
export interface InventoryProduct {
  id: string; sku: string; name: string; cat: string;
  price: number; cost: number; stock: number; min: number; max: number;
  unit: string; supplier: string; barcode: string; color: string;
  active: boolean; weeklySold: number; lastRestock: string;
}

export const INVENTORY: InventoryProduct[] = [
  { id:'p1',  sku:'UNGA-001', name:'Unga wa Sembe 10kg',   cat:'Grocery',   price:28500, cost:22000, stock:42,  min:10, max:80,  unit:'bag',   supplier:'Bakhresa Co.',      barcode:'6160100012413', color:'indigo',  active:true, weeklySold:50, lastRestock:'May 18, 2026' },
  { id:'p2',  sku:'SAB-002',  name:'Sabuni ya OMO 1kg',    cat:'Household', price:6200,  cost:4500,  stock:3,   min:15, max:60,  unit:'pcs',   supplier:'Unilever EA',       barcode:'6009880011847', color:'amber',   active:true, weeklySold:42, lastRestock:'May 9, 2026'  },
  { id:'p3',  sku:'OIL-003',  name:'Mafuta ya Cooking 5L', cat:'Grocery',   price:34000, cost:28000, stock:24,  min:8,  max:40,  unit:'jerry', supplier:'Murzah Oil',        barcode:'6160100018446', color:'rose',    active:true, weeklySold:34, lastRestock:'May 20, 2026' },
  { id:'p4',  sku:'SUG-004',  name:'Sukari 2kg',           cat:'Grocery',   price:7000,  cost:5400,  stock:60,  min:20, max:100, unit:'pack',  supplier:'Kagera Sugar',      barcode:'6160100019153', color:'lime',    active:true, weeklySold:26, lastRestock:'May 21, 2026' },
  { id:'p5',  sku:'TEA-005',  name:'Chai Bora 500g',       cat:'Beverage',  price:4800,  cost:3200,  stock:5,   min:10, max:30,  unit:'pack',  supplier:'Chai Bora Ltd',     barcode:'6160100020111', color:'emerald', active:true, weeklySold:18, lastRestock:'May 12, 2026' },
  { id:'p6',  sku:'RIC-006',  name:'Mchele Pishori 5kg',   cat:'Grocery',   price:22000, cost:17500, stock:33,  min:12, max:60,  unit:'bag',   supplier:'Mwanza Rice',       barcode:'6160100021118', color:'violet',  active:true, weeklySold:22, lastRestock:'May 19, 2026' },
  { id:'p7',  sku:'COS-007',  name:'Lotion Nivea 400ml',   cat:'Cosmetics', price:12500, cost:8200,  stock:18,  min:6,  max:30,  unit:'pcs',   supplier:'Beiersdorf EA',     barcode:'4005900543210', color:'cyan',    active:true, weeklySold:8,  lastRestock:'May 14, 2026' },
  { id:'p8',  sku:'DRK-008',  name:'Soda Coca-Cola 500ml', cat:'Beverage',  price:1500,  cost:800,   stock:120, min:30, max:200, unit:'btl',   supplier:'Coca-Cola Kwanza',  barcode:'5449000054227', color:'rose',    active:true, weeklySold:60, lastRestock:'May 22, 2026' },
  { id:'p9',  sku:'BRD-009',  name:'Mkate Bumi 600g',      cat:'Bakery',    price:2200,  cost:1600,  stock:22,  min:12, max:40,  unit:'pcs',   supplier:'Bumi Bakery',       barcode:'6160100022017', color:'amber',   active:true, weeklySold:28, lastRestock:'May 23, 2026' },
  { id:'p10', sku:'SAB-010',  name:'Sabuni ya Geisha',     cat:'Household', price:1200,  cost:900,   stock:88,  min:30, max:150, unit:'pcs',   supplier:'PZ Cussons',        barcode:'6160100023117', color:'lime',    active:true, weeklySold:36, lastRestock:'May 16, 2026' },
  { id:'p11', sku:'OIL-011',  name:'Mafuta Cooking 1L',    cat:'Grocery',   price:8500,  cost:7000,  stock:12,  min:15, max:40,  unit:'btl',   supplier:'Murzah Oil',        barcode:'6160100024218', color:'rose',    active:true, weeklySold:14, lastRestock:'May 11, 2026' },
  { id:'p12', sku:'MZW-012',  name:'Maziwa Fresh 500ml',   cat:'Beverage',  price:1800,  cost:1400,  stock:46,  min:20, max:80,  unit:'pack',  supplier:'Tanga Fresh',       barcode:'6160100025108', color:'cyan',    active:true, weeklySold:30, lastRestock:'May 22, 2026' },
  { id:'p13', sku:'BIS-013',  name:'Biskuti Glucose 90g',  cat:'Snacks',    price:800,   cost:550,   stock:200, min:60, max:300, unit:'pack',  supplier:'Britania',          barcode:'6160100026115', color:'amber',   active:true, weeklySold:75, lastRestock:'May 21, 2026' },
  { id:'p14', sku:'YOG-014',  name:'Yogurt 250ml',         cat:'Beverage',  price:2500,  cost:1800,  stock:30,  min:12, max:50,  unit:'pcs',   supplier:'Azam Dairy',        barcode:'6160100027112', color:'violet',  active:true, weeklySold:22, lastRestock:'May 20, 2026' },
  { id:'p15', sku:'BLB-015',  name:'Mafuta Blue Band 1kg', cat:'Grocery',   price:9500,  cost:7500,  stock:14,  min:8,  max:30,  unit:'tub',   supplier:'Unilever EA',       barcode:'6160100028119', color:'amber',   active:true, weeklySold:11, lastRestock:'May 17, 2026' },
  { id:'p16', sku:'CKE-016',  name:'Choco Cake 500g',      cat:'Bakery',    price:4500,  cost:3000,  stock:8,   min:5,  max:20,  unit:'pcs',   supplier:'Bumi Bakery',       barcode:'6160100029116', color:'rose',    active:true, weeklySold:6,  lastRestock:'May 19, 2026' },
  { id:'p17', sku:'BSL-017',  name:'Bar Soap Imperial',    cat:'Household', price:950,   cost:700,   stock:110, min:40, max:180, unit:'pcs',   supplier:'PZ Cussons',        barcode:'6160100030112', color:'emerald', active:true, weeklySold:48, lastRestock:'May 22, 2026' },
  { id:'p18', sku:'COS-018',  name:'Toothpaste Colgate',   cat:'Cosmetics', price:3500,  cost:2400,  stock:28,  min:12, max:50,  unit:'pcs',   supplier:'Colgate-Palm.',     barcode:'8718951200234', color:'cyan',    active:true, weeklySold:14, lastRestock:'May 15, 2026' },
];

export const CATEGORIES = [
  { id: 'all',       name: 'All',       count: 18 },
  { id: 'Grocery',   name: 'Grocery',   count: 6  },
  { id: 'Household', name: 'Household', count: 3  },
  { id: 'Beverage',  name: 'Beverage',  count: 4  },
  { id: 'Cosmetics', name: 'Cosmetics', count: 2  },
  { id: 'Bakery',    name: 'Bakery',    count: 2  },
  { id: 'Snacks',    name: 'Snacks',    count: 1  },
];

export const COLOR_SCHEMES: Record<string, { bg: string; fg: string }> = {
  indigo:  { bg: 'rgba(99,102,241,0.10)',  fg: '#a5a8ff' },
  amber:   { bg: 'rgba(251,191,36,0.10)',  fg: '#fcd34d' },
  rose:    { bg: 'rgba(251,113,133,0.10)', fg: '#fda4af' },
  lime:    { bg: 'rgba(132,204,22,0.10)',  fg: '#bef264' },
  emerald: { bg: 'rgba(16,185,129,0.10)',  fg: '#6ee7b7' },
  violet:  { bg: 'rgba(167,139,250,0.10)', fg: '#c4b5fd' },
  cyan:    { bg: 'rgba(34,211,238,0.10)',  fg: '#67e8f9' },
};

// ─── POS products ─────────────────────────────────────────────────────────────
export const POS_CATEGORIES = [
  { id: 'all',       label: 'All',       count: 142 },
  { id: 'grocery',   label: 'Grocery',   count: 48  },
  { id: 'household', label: 'Household', count: 26  },
  { id: 'beverage',  label: 'Beverage',  count: 22  },
  { id: 'cosmetics', label: 'Cosmetics', count: 18  },
  { id: 'bakery',    label: 'Bakery',    count: 14  },
  { id: 'snacks',    label: 'Snacks',    count: 14  },
];

export const POS_PRODUCTS = [
  { id:'p1',  name:'Unga wa Sembe 10kg',   price:28500, stock:42,  cat:'grocery',   sku:'UWS-10',  color:'indigo'  },
  { id:'p2',  name:'Sabuni ya OMO 1kg',    price:6200,  stock:3,   cat:'household', sku:'SAB-1',   color:'amber'   },
  { id:'p3',  name:'Mafuta ya Cooking 5L', price:34000, stock:24,  cat:'grocery',   sku:'MFC-5',   color:'rose'    },
  { id:'p4',  name:'Sukari 2kg',           price:7000,  stock:60,  cat:'grocery',   sku:'SUK-2',   color:'lime'    },
  { id:'p5',  name:'Chai Bora 500g',       price:4800,  stock:5,   cat:'beverage',  sku:'CHB-500', color:'emerald' },
  { id:'p6',  name:'Mchele Pishori 5kg',   price:22000, stock:33,  cat:'grocery',   sku:'MCP-5',   color:'violet'  },
  { id:'p7',  name:'Lotion Nivea 400ml',   price:12500, stock:18,  cat:'cosmetics', sku:'LNV-400', color:'cyan'    },
  { id:'p8',  name:'Soda Coca-Cola 500ml', price:1500,  stock:120, cat:'beverage',  sku:'COK-500', color:'rose'    },
  { id:'p9',  name:'Mkate Bumi 600g',      price:2200,  stock:22,  cat:'bakery',    sku:'MKB-600', color:'amber'   },
  { id:'p10', name:'Sabuni ya Geisha',     price:1200,  stock:88,  cat:'household', sku:'GSH-100', color:'lime'    },
  { id:'p11', name:'Mafuta Cooking 1L',    price:8500,  stock:12,  cat:'grocery',   sku:'MFC-1',   color:'rose'    },
  { id:'p12', name:'Maziwa Fresh 500ml',   price:1800,  stock:46,  cat:'beverage',  sku:'MZW-500', color:'cyan'    },
  { id:'p13', name:'Biskuti ya Glucose',   price:800,   stock:200, cat:'snacks',    sku:'BIS-G',   color:'amber'   },
  { id:'p14', name:'Yogurt 250ml',         price:2500,  stock:30,  cat:'beverage',  sku:'YOG-250', color:'violet'  },
  { id:'p15', name:'Mafuta Blue Band 1kg', price:9500,  stock:14,  cat:'grocery',   sku:'BLB-1',   color:'amber'   },
  { id:'p16', name:'Choco Cake 500g',      price:4500,  stock:8,   cat:'bakery',    sku:'CKE-500', color:'rose'    },
  { id:'p17', name:'Bar Soap Imperial',    price:950,   stock:110, cat:'household', sku:'BSL-IM',  color:'emerald' },
  { id:'p18', name:'Toothpaste Colgate',   price:3500,  stock:28,  cat:'cosmetics', sku:'TPC-100', color:'cyan'    },
];

// ─── Transactions ─────────────────────────────────────────────────────────────
export interface TxnLine { id: string; name: string; sku: string; price: number; cost: number; qty: number; }
export interface Customer { name: string; phone: string | null; id?: string; }
export interface Transaction {
  id: string; ts: Date; lines: TxnLine[];
  subtotal: number; discountPct: number; discount: number;
  tax: number; total: number; cost: number; profit: number;
  customer: Customer; method: string; status: string;
  cashier: string; till: string; store: string; reference: string | null;
}

const P = PRODUCTS_SIMPLE;
const methods = ['Cash', 'M-Pesa', 'Tigo Pesa', 'Bank', 'Credit'];
const customers: Customer[] = [
  { name: 'Walk-in',     phone: null },
  { name: 'Walk-in',     phone: null },
  { name: 'Walk-in',     phone: null },
  { name: 'Fatuma Ally', phone: '+255 712 408 311', id: 'c1' },
  { name: 'Juma Kifupi', phone: '+255 754 992 110', id: 'c2' },
  { name: 'Asha Mwinyi', phone: '+255 718 003 982', id: 'c3' },
  { name: 'Hassan Bakari', phone: '+255 765 442 119', id: 'c4' },
  { name: 'Mariam Said', phone: '+255 715 880 442', id: 'c5' },
];
const cashiers = ['Hamisi M.', 'Amani M.', 'Pendo K.'];
const tills = ['Till #1', 'Till #2', 'Till #3'];

function pick<T>(arr: T[], i: number) { return arr[i % arr.length]; }

export const TRANSACTIONS: Transaction[] = (function () {
  const txns: Transaction[] = [];
  const now = new Date(2026, 4, 24, 14, 32, 0);
  let id = 2043;
  for (let i = 0; i < 48; i++) {
    const dt = new Date(now.getTime() - i * 11 * 60 * 1000 - Math.floor(seeded(i + 1) * 900000));
    const lineCount = 1 + Math.floor(seeded(i * 7 + 3) * 5);
    const lines: TxnLine[] = [];
    for (let j = 0; j < lineCount; j++) {
      const p = pick(P, Math.floor(seeded(i * 11 + j * 5) * P.length));
      const qty = 1 + Math.floor(seeded(i * 13 + j * 3) * 3);
      lines.push({ ...p, qty });
    }
    const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
    const discountPct = seeded(i * 17) > 0.85 ? 5 : 0;
    const discount = Math.round(subtotal * discountPct / 100);
    const taxable = subtotal - discount;
    const tax = Math.round(taxable * 0.18);
    const total = taxable + tax;
    const cost = lines.reduce((s, l) => s + l.qty * l.cost, 0);
    const profit = total - cost - tax;
    const cust = pick(customers, Math.floor(seeded(i * 19) * customers.length));
    const methodIdx = seeded(i * 23) > 0.6 ? 1 :
                      seeded(i * 29) > 0.7 ? 0 :
                      seeded(i * 31) > 0.7 ? 2 :
                      seeded(i * 37) > 0.7 ? 3 : 0;
    let status = 'paid';
    let method = methods[methodIdx];
    if (cust.name !== 'Walk-in' && seeded(i * 41) > 0.8) { method = 'Credit'; status = 'credit'; }
    if (seeded(i * 43) > 0.96) { status = 'refunded'; }
    if (i === 0) status = 'paid';
    txns.push({
      id: 'TXN-' + (id - i),
      ts: dt, lines, subtotal, discountPct, discount, tax, total, cost, profit,
      customer: cust, method, status,
      cashier: pick(cashiers, i),
      till: pick(tills, i % 3),
      store: 'Duka Kuu — Kariakoo',
      reference: status === 'paid' && method === 'M-Pesa' ? 'QGT5K3' + i.toString(36).toUpperCase() : null,
    });
  }
  return txns;
})();

// ─── Credits ──────────────────────────────────────────────────────────────────
export interface CreditCustomer {
  id: string; name: string; avatarHue: number; phone: string;
  since: string; visits: number; totalSpent: number;
  status: 'overdue' | 'due-soon' | 'current'; dueDays: number;
  tabs: Array<{ id: string; date: Date; amount: number; items: number; cashier: string; till: string; lines: Array<{ name: string; qty: number; price: number }>; }>;
  payments: Array<{ date: Date; amount: number; method: string; ref?: string; cashier: string; note: string | null; }>;
  messages: Array<{ date: Date; kind: string; direction: 'in' | 'out'; body: string; who: string; }>;
  notes: Array<{ date: Date; by: string; body: string; }>;
  _balance?: number;
}

const today = new Date(2026, 4, 24);
const ago = (d: number) => new Date(today.getTime() - d * 86400000);

export const CREDIT_CUSTOMERS: CreditCustomer[] = [
  {
    id: 'C-1041', name: 'Juma Kifupi', avatarHue: 230,
    phone: '+255 712 990 102', since: 'Mar 2024', visits: 68, totalSpent: 1842000,
    status: 'due-soon', dueDays: 6,
    tabs: [{ id: 'TXN-2039', date: ago(4), amount: 84200, items: 7, cashier: 'Hamisi M.', till: 'Till #2',
      lines: [{ name: 'Mafuta ya Cooking 5L', qty: 1, price: 34000 }, { name: 'Mchele Pishori 5kg', qty: 1, price: 22000 },
               { name: 'Sukari 2kg', qty: 2, price: 7000 }, { name: 'Sabuni ya OMO 1kg', qty: 1, price: 6200 }, { name: 'Chai Bora 500g', qty: 1, price: 4800 }] }],
    payments: [
      { date: ago(11), amount: 20000, method: 'M-Pesa', ref: 'QGT5K3M21', cashier: 'Hamisi M.', note: 'Partial' },
      { date: ago(25), amount: 15000, method: 'Cash', cashier: 'Amani M.', note: null },
    ],
    messages: [
      { date: ago(3), kind: 'whatsapp', direction: 'out', body: 'Habari Juma, hii ni kumbusho la deni la TZS 84,200 linapaswa kulipwa tarehe 30/5. Karibu Duka Kuu.', who: 'auto-reminder' },
      { date: ago(8), kind: 'call', direction: 'out', body: 'Called — discussed payment plan; agreed to pay by end of month.', who: 'Hamisi M.' },
    ],
    notes: [{ date: ago(11), by: 'Hamisi M.', body: 'Customer pays end of month. Reliable for 2 years.' }],
  },
  {
    id: 'C-1038', name: 'Fatuma Ally', avatarHue: 320,
    phone: '+255 754 221 309', since: 'Sep 2023', visits: 142, totalSpent: 3215000,
    status: 'overdue', dueDays: -6,
    tabs: [{ id: 'TXN-2025', date: ago(15), amount: 42500, items: 4, cashier: 'Hamisi M.', till: 'Till #1',
      lines: [{ name: 'Lotion Nivea 400ml', qty: 1, price: 12500 }, { name: 'Sabuni ya OMO 1kg', qty: 2, price: 6200 },
               { name: 'Maziwa Fresh 500ml', qty: 4, price: 1800 }, { name: 'Mkate Bumi 600g', qty: 3, price: 2200 }] }],
    payments: [{ date: ago(12), amount: 10000, method: 'M-Pesa', ref: 'QGT8L2P39', cashier: 'Hamisi M.', note: null }],
    messages: [
      { date: ago(2), kind: 'whatsapp', direction: 'out', body: 'Mama Fatuma, deni la TZS 42,500 limepitwa kwa siku 4. Tafadhali tunaomba uweze kulipa wiki hii.', who: 'auto-reminder' },
      { date: ago(5), kind: 'whatsapp', direction: 'out', body: 'Reminder: payment due 15/5', who: 'auto-reminder' },
      { date: ago(7), kind: 'call', direction: 'out', body: 'No answer — left voicemail.', who: 'Amani M.' },
    ],
    notes: [],
  },
  {
    id: 'C-1029', name: 'Hassan Bakari', avatarHue: 160,
    phone: '+255 689 110 442', since: 'Jan 2024', visits: 36, totalSpent: 2840000,
    status: 'current', dueDays: 19,
    tabs: [{ id: 'TXN-2018', date: ago(8), amount: 156000, items: 12, cashier: 'Pendo K.', till: 'Till #3',
      lines: [{ name: 'Mafuta ya Cooking 5L', qty: 3, price: 34000 }, { name: 'Mchele Pishori 5kg', qty: 2, price: 22000 },
               { name: 'Sukari 2kg', qty: 1, price: 7000 }, { name: 'Unga wa Sembe 10kg', qty: 1, price: 28500 }] }],
    payments: [{ date: ago(20), amount: 40000, method: 'Bank', ref: 'NMB-44021', cashier: 'Hamisi M.', note: 'Down payment' }],
    messages: [],
    notes: [{ date: ago(8), by: 'Pendo K.', body: 'Big restock for his stall — agreed 30 day terms.' }],
  },
  {
    id: 'C-1015', name: 'Asha Mwinyi', avatarHue: 30,
    phone: '+255 718 003 982', since: 'Nov 2023', visits: 92, totalSpent: 1180000,
    status: 'overdue', dueDays: -14,
    tabs: [{ id: 'TXN-1998', date: ago(28), amount: 28800, items: 5, cashier: 'Hamisi M.', till: 'Till #2',
      lines: [{ name: 'Sabuni ya Geisha', qty: 5, price: 1200 }, { name: 'Bar Soap Imperial', qty: 3, price: 950 },
               { name: 'Mkate Bumi 600g', qty: 6, price: 2200 }, { name: 'Maziwa Fresh 500ml', qty: 4, price: 1800 }] }],
    payments: [],
    messages: [
      { date: ago(2), kind: 'whatsapp', direction: 'out', body: 'Asha — TZS 28,800 limepitwa kwa siku 14. Tafadhali wasiliana nasi.', who: 'auto-reminder' },
      { date: ago(7), kind: 'whatsapp', direction: 'out', body: 'Reminder', who: 'auto-reminder' },
      { date: ago(9), kind: 'call', direction: 'out', body: 'Spoke with her — promised to come this week.', who: 'Hamisi M.' },
    ],
    notes: [],
  },
  {
    id: 'C-1003', name: 'Mariam Said', avatarHue: 290,
    phone: '+255 715 880 442', since: 'Aug 2023', visits: 187, totalSpent: 4720000,
    status: 'due-soon', dueDays: 2,
    tabs: [{ id: 'TXN-1972', date: ago(13), amount: 18500, items: 3, cashier: 'Amani M.', till: 'Till #1',
      lines: [{ name: 'Toothpaste Colgate', qty: 2, price: 3500 }, { name: 'Lotion Nivea 400ml', qty: 1, price: 12500 }] }],
    payments: [],
    messages: [
      { date: ago(1), kind: 'whatsapp', direction: 'in', body: 'Nitakuja kesho asubuhi kulipa, asante.', who: 'Mariam' },
      { date: ago(1), kind: 'whatsapp', direction: 'out', body: 'Karibu sana Mama Mariam.', who: 'Hamisi M.' },
    ],
    notes: [],
  },
];

// Compute balances
CREDIT_CUSTOMERS.forEach((c) => {
  const total = c.tabs.reduce((s, t) => s + t.amount, 0)
              - c.payments.reduce((s, p) => s + p.amount, 0);
  c._balance = total;
});

export const CREDIT_TOTALS = (function () {
  let outstanding = 0, overdue = 0, dueSoon = 0, current = 0, recovered = 0;
  for (const c of CREDIT_CUSTOMERS) {
    outstanding += c._balance ?? 0;
    if (c.status === 'overdue') overdue += c._balance ?? 0;
    else if (c.status === 'due-soon') dueSoon += c._balance ?? 0;
    else current += c._balance ?? 0;
    recovered += c.payments.reduce((s, p) => s + p.amount, 0);
  }
  return { outstanding, overdue, dueSoon, current, recovered };
})();

export const AGING_BUCKETS = (function () {
  const buckets = [
    { label: 'Current',    range: '0 days',  amount: 0, color: 'var(--good)' },
    { label: '1–7 days',   range: '1–7d',    amount: 0, color: '#86efac' },
    { label: '8–30 days',  range: '8–30d',   amount: 0, color: 'var(--warn)' },
    { label: '31–60 days', range: '31–60d',  amount: 0, color: '#fb923c' },
    { label: '60+ days',   range: '60+d',    amount: 0, color: 'var(--bad)' },
  ];
  for (const c of CREDIT_CUSTOMERS) {
    const overdue = -c.dueDays;
    if (overdue <= 0) buckets[0].amount += c._balance ?? 0;
    else if (overdue <= 7) buckets[1].amount += c._balance ?? 0;
    else if (overdue <= 30) buckets[2].amount += c._balance ?? 0;
    else if (overdue <= 60) buckets[3].amount += c._balance ?? 0;
    else buckets[4].amount += c._balance ?? 0;
  }
  return buckets;
})();
