/**
 * lib/api.ts  —  MOCK DATA LAYER
 *
 * All API calls return deterministic mock data so the UI can run without a backend.
 * The original API client is preserved at lib/api.original.ts for reference.
 *
 * Every function signature and type is identical to the real backend contract.
 */

// ── Response envelope ──────────────────────────────────────────────────────────

export interface ApiOk<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export type ApiResult<T> = ApiOk<T> | ApiError;

function ok<T>(data: T, message = ''): ApiResult<T> {
  return { success: true, message, data };
}

// ── Domain types ───────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number;
  phone: string;
  email: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  initials: string;
  role: 'admin' | 'owner' | 'staff';
  avatar_hue: number;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  organisation: number | null;
  store: string | null;
}

export interface Organisation {
  id: string;
  name: string;
  business_type: string;
  region: string;
  plan: string;
  max_stores: number;
  sendafrica_api_key_masked?: string;
  sms_sender_id?: string;
  sms_configured?: boolean;
  ngamia_api_key_masked?: string;
  ngamia_configured?: boolean;
  ai_credits_monthly?: number;
}

export interface SubscriptionInfo {
  id: string;
  status: string;
  is_trial: boolean;
  is_active_now?: boolean;
  days_remaining: number;
  end_date: string;
  trial_fee?: number;
}

// ── Request payloads ───────────────────────────────────────────────────────────

export interface RegisterPayload {
  full_name: string;
  phone: string;
  password: string;
  confirm_password: string;
  email?: string;
  main_shop_name: string;
  business_type: string;
  region: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

// ── Response shapes ────────────────────────────────────────────────────────────

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterResponse extends AuthTokens {
  user: UserProfile;
  organisation: Organisation;
  subscription: SubscriptionInfo;
}

export interface LoginResponse extends AuthTokens {
  user: UserProfile;
  subscription: SubscriptionInfo | null;
}

export interface MeResponse {
  user: UserProfile;
  subscription: SubscriptionInfo | null;
  verification: {
    phone_verified: boolean;
    email_verified: boolean;
  };
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_TOKEN = 'mock-access-token-ziadapos';
const MOCK_REFRESH = 'mock-refresh-token-ziadapos';

const MOCK_USER: UserProfile = {
  id: 1,
  phone: '0712345678',
  email: 'hamisi@ziadapos.com',
  first_name: 'Hamisi',
  last_name: 'Mwakapaga',
  full_name: 'Hamisi Mwakapaga',
  initials: 'HM',
  role: 'owner',
  avatar_hue: 230,
  is_phone_verified: true,
  is_email_verified: true,
  organisation: 1,
  store: 'kariakoo',
};

const MOCK_ORG: Organisation = {
  id: 'org-1',
  name: 'Duka Kuu Ltd',
  business_type: 'retail',
  region: 'Dar es Salaam',
  plan: 'pro',
  max_stores: 3,
  sms_configured: true,
  sms_sender_id: 'ZIADA',
  sendafrica_api_key_masked: 'snd_****7890',
  ngamia_configured: false,
  ai_credits_monthly: 500,
};

const MOCK_SUB: SubscriptionInfo = {
  id: 'sub-1',
  status: 'active',
  is_trial: false,
  is_active_now: true,
  days_remaining: 245,
  end_date: '2027-03-15',
};

// ── Inventory types ────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  is_global: boolean;
  count: number;
  created_at: string;
}

export interface BulkUploadResult {
  created: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export interface BulkCreateResult {
  created: number;
  failed: number;
  products: InventoryProduct[];
  errors: { index: number; name: string; errors: Record<string, string | string[]> }[];
}

export interface POSProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  stock: number;
  stock_status: 'active' | 'low' | 'critical' | 'out';
  color: string;
  unit: string;
  category: string | null;
  category_name: string | null;
  image_url: string | null;
}

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string | null;
  category_name: string | null;
  supplier: string | null;
  supplier_name: string | null;
  color: string;
  image_url: string | null;
  price: number;
  cost: number;
  margin_pct: number;
  stock: number;
  min_stock: number;
  max_stock: number;
  weekly_sold: number;
  stock_status: string;
  is_active: boolean;
  created_at: string;
}

export interface CompleteSalePayload {
  items: { product_id: string; qty: number }[];
  payment_method: string;
  payment_reference?: string;
  discount_pct: number;
  till_number: string;
  customer_id?: string | null;
  notes?: string;
}

export interface CompletedTransaction {
  id: string;
  txn_number: string;
  payment_method: string;
  payment_reference: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  subtotal: number;
  discount_pct: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  cashier_name: string;
  lines: {
    product_name: string;
    product_sku: string;
    qty: number;
    unit_price: number;
    line_total: number;
  }[];
  created_at: string;
}

// ── Mock inventory data ────────────────────────────────────────────────────────

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Grocery', description: 'Food staples', sort_order: 1, is_global: true, count: 6, created_at: '2026-01-01' },
  { id: 'cat-2', name: 'Household', description: 'Home essentials', sort_order: 2, is_global: true, count: 3, created_at: '2026-01-01' },
  { id: 'cat-3', name: 'Beverage', description: 'Drinks', sort_order: 3, is_global: true, count: 4, created_at: '2026-01-01' },
  { id: 'cat-4', name: 'Cosmetics', description: 'Personal care', sort_order: 4, is_global: true, count: 2, created_at: '2026-01-01' },
  { id: 'cat-5', name: 'Bakery', description: 'Baked goods', sort_order: 5, is_global: true, count: 2, created_at: '2026-01-01' },
  { id: 'cat-6', name: 'Snacks', description: 'Snack items', sort_order: 6, is_global: true, count: 1, created_at: '2026-01-01' },
];

const MOCK_INVENTORY: InventoryProduct[] = [
  { id:'p1', name:'Unga wa Sembe 10kg', sku:'UNGA-001', barcode:'6160100012413', category:'cat-1', category_name:'Grocery', supplier:'s1', supplier_name:'Bakhresa Co.', color:'indigo', image_url:null, price:28500, cost:22000, margin_pct:22.8, stock:42, min_stock:10, max_stock:80, weekly_sold:50, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p2', name:'Sabuni ya OMO 1kg', sku:'SAB-002', barcode:'6009880011847', category:'cat-2', category_name:'Household', supplier:'s2', supplier_name:'Unilever EA', color:'amber', image_url:null, price:6200, cost:4500, margin_pct:27.4, stock:3, min_stock:15, max_stock:60, weekly_sold:42, stock_status:'low', is_active:true, created_at:'2026-01-15' },
  { id:'p3', name:'Mafuta ya Cooking 5L', sku:'OIL-003', barcode:'6160100018446', category:'cat-1', category_name:'Grocery', supplier:'s3', supplier_name:'Murzah Oil', color:'rose', image_url:null, price:34000, cost:28000, margin_pct:17.6, stock:24, min_stock:8, max_stock:40, weekly_sold:34, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p4', name:'Sukari 2kg', sku:'SUG-004', barcode:'6160100019153', category:'cat-1', category_name:'Grocery', supplier:'s4', supplier_name:'Kagera Sugar', color:'lime', image_url:null, price:7000, cost:5400, margin_pct:22.9, stock:60, min_stock:20, max_stock:100, weekly_sold:26, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p5', name:'Chai Bora 500g', sku:'TEA-005', barcode:'6160100020111', category:'cat-3', category_name:'Beverage', supplier:'s5', supplier_name:'Chai Bora Ltd', color:'emerald', image_url:null, price:4800, cost:3200, margin_pct:33.3, stock:5, min_stock:10, max_stock:30, weekly_sold:18, stock_status:'low', is_active:true, created_at:'2026-01-15' },
  { id:'p6', name:'Mchele Pishori 5kg', sku:'RIC-006', barcode:'6160100021118', category:'cat-1', category_name:'Grocery', supplier:'s6', supplier_name:'Mwanza Rice', color:'violet', image_url:null, price:22000, cost:17500, margin_pct:20.5, stock:33, min_stock:12, max_stock:60, weekly_sold:22, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p7', name:'Lotion Nivea 400ml', sku:'COS-007', barcode:'4005900543210', category:'cat-4', category_name:'Cosmetics', supplier:'s7', supplier_name:'Beiersdorf EA', color:'cyan', image_url:null, price:12500, cost:8200, margin_pct:34.4, stock:18, min_stock:6, max_stock:30, weekly_sold:8, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p8', name:'Soda Coca-Cola 500ml', sku:'DRK-008', barcode:'5449000054227', category:'cat-3', category_name:'Beverage', supplier:'s8', supplier_name:'Coca-Cola Kwanza', color:'rose', image_url:null, price:1500, cost:800, margin_pct:46.7, stock:120, min_stock:30, max_stock:200, weekly_sold:60, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p9', name:'Mkate Bumi 600g', sku:'BRD-009', barcode:'6160100022017', category:'cat-5', category_name:'Bakery', supplier:'s9', supplier_name:'Bumi Bakery', color:'amber', image_url:null, price:2200, cost:1600, margin_pct:27.3, stock:22, min_stock:12, max_stock:40, weekly_sold:28, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p10', name:'Sabuni ya Geisha', sku:'SAB-010', barcode:'6160100023117', category:'cat-2', category_name:'Household', supplier:'s10', supplier_name:'PZ Cussons', color:'lime', image_url:null, price:1200, cost:900, margin_pct:25, stock:88, min_stock:30, max_stock:150, weekly_sold:36, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p11', name:'Mafuta Cooking 1L', sku:'OIL-011', barcode:'6160100024218', category:'cat-1', category_name:'Grocery', supplier:'s3', supplier_name:'Murzah Oil', color:'rose', image_url:null, price:8500, cost:7000, margin_pct:17.6, stock:12, min_stock:15, max_stock:40, weekly_sold:14, stock_status:'low', is_active:true, created_at:'2026-01-15' },
  { id:'p12', name:'Maziwa Fresh 500ml', sku:'MZW-012', barcode:'6160100025108', category:'cat-3', category_name:'Beverage', supplier:'s11', supplier_name:'Tanga Fresh', color:'cyan', image_url:null, price:1800, cost:1400, margin_pct:22.2, stock:46, min_stock:20, max_stock:80, weekly_sold:30, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p13', name:'Biskuti Glucose 90g', sku:'BIS-013', barcode:'6160100026115', category:'cat-6', category_name:'Snacks', supplier:'s12', supplier_name:'Britania', color:'amber', image_url:null, price:800, cost:550, margin_pct:31.3, stock:200, min_stock:60, max_stock:300, weekly_sold:75, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p14', name:'Yogurt 250ml', sku:'YOG-014', barcode:'6160100027112', category:'cat-3', category_name:'Beverage', supplier:'s13', supplier_name:'Azam Dairy', color:'violet', image_url:null, price:2500, cost:1800, margin_pct:28, stock:30, min_stock:12, max_stock:50, weekly_sold:22, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p15', name:'Mafuta Blue Band 1kg', sku:'BLB-015', barcode:'6160100028119', category:'cat-1', category_name:'Grocery', supplier:'s2', supplier_name:'Unilever EA', color:'amber', image_url:null, price:9500, cost:7500, margin_pct:21.1, stock:14, min_stock:8, max_stock:30, weekly_sold:11, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p16', name:'Choco Cake 500g', sku:'CKE-016', barcode:'6160100029116', category:'cat-5', category_name:'Bakery', supplier:'s9', supplier_name:'Bumi Bakery', color:'rose', image_url:null, price:4500, cost:3000, margin_pct:33.3, stock:8, min_stock:5, max_stock:20, weekly_sold:6, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p17', name:'Bar Soap Imperial', sku:'BSL-017', barcode:'6160100030112', category:'cat-2', category_name:'Household', supplier:'s10', supplier_name:'PZ Cussons', color:'emerald', image_url:null, price:950, cost:700, margin_pct:26.3, stock:110, min_stock:40, max_stock:180, weekly_sold:48, stock_status:'active', is_active:true, created_at:'2026-01-15' },
  { id:'p18', name:'Toothpaste Colgate', sku:'COS-018', barcode:'8718951200234', category:'cat-4', category_name:'Cosmetics', supplier:'s14', supplier_name:'Colgate-Palm.', color:'cyan', image_url:null, price:3500, cost:2400, margin_pct:31.4, stock:28, min_stock:12, max_stock:50, weekly_sold:14, stock_status:'active', is_active:true, created_at:'2026-01-15' },
];

function mockPOSProduct(p: InventoryProduct): POSProduct {
  const status: POSProduct['stock_status'] =
    p.stock === 0 ? 'out' : p.stock <= p.min_stock ? 'critical' : p.stock <= p.min_stock * 1.5 ? 'low' : 'active';
  return {
    id: p.id, name: p.name, sku: p.sku, barcode: p.barcode,
    price: p.price, stock: p.stock, stock_status: status,
    color: p.color, unit: 'pcs', category: p.category,
    category_name: p.category_name, image_url: p.image_url,
  };
}

// ── Transaction types ──────────────────────────────────────────────────────────

export interface TransactionListItem {
  id: string;
  txn_number: string;
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  payment_reference: string;
  status: string;
  subtotal: number;
  discount_pct: number;
  discount_amount: number;
  total: number;
  profit: number;
  cashier_name: string;
  till_number: string;
  sku_count: number;
  item_count: number;
  created_at: string;
}

export interface TransactionDetail extends TransactionListItem {
  tax_amount: number;
  cost_total: number;
  channel: string;
  store_name: string;
  store_address: string;
  store_phone: string;
  customer: string | null;
  notes: string;
  lines: {
    id: string;
    product: string | null;
    product_name: string;
    product_sku: string;
    unit_price: number;
    unit_cost: number;
    qty: number;
    line_total: number;
    line_cost: number;
    line_profit: number;
  }[];
  credit_info: {
    tab_id: string;
    tab_status: string;
    amount: number;
    amount_paid: number;
    balance: number;
    due_date: string | null;
    is_overdue: boolean;
    payments: { amount: number; method: string; reference: string; created_at: string }[];
  } | null;
}

const MOCK_TRANSACTIONS: TransactionListItem[] = [
  { id:'txn-2043', txn_number:'TXN-2043', customer_name:'Walk-in', customer_phone:'', payment_method:'M-Pesa', payment_reference:'QGT5K3A', status:'paid', subtotal:76700, discount_pct:0, discount_amount:0, total:90506, profit:22306, cashier_name:'Hamisi M.', till_number:'Till #1', sku_count:4, item_count:6, created_at:'2026-05-24T14:32:00Z' },
  { id:'txn-2042', txn_number:'TXN-2042', customer_name:'Juma Kifupi', customer_phone:'+255 712 990 102', payment_method:'Credit', payment_reference:'', status:'credit', subtotal:84200, discount_pct:0, discount_amount:0, total:99356, profit:24156, cashier_name:'Hamisi M.', till_number:'Till #2', sku_count:5, item_count:7, created_at:'2026-05-24T13:41:00Z' },
  { id:'txn-2041', txn_number:'TXN-2041', customer_name:'Walk-in', customer_phone:'', payment_method:'Cash', payment_reference:'', status:'paid', subtotal:15000, discount_pct:5, discount_amount:750, total:16830, profit:4630, cashier_name:'Amani M.', till_number:'Till #1', sku_count:2, item_count:3, created_at:'2026-05-24T12:55:00Z' },
  { id:'txn-2040', txn_number:'TXN-2040', customer_name:'Fatuma Ally', customer_phone:'+255 754 221 309', payment_method:'M-Pesa', payment_reference:'QGT5K3C', status:'paid', subtotal:42500, discount_pct:0, discount_amount:0, total:50150, profit:11150, cashier_name:'Hamisi M.', till_number:'Till #1', sku_count:4, item_count:8, created_at:'2026-05-24T11:18:00Z' },
  { id:'txn-2039', txn_number:'TXN-2039', customer_name:'Walk-in', customer_phone:'', payment_method:'Cash', payment_reference:'', status:'paid', subtotal:8200, discount_pct:0, discount_amount:0, total:9676, profit:2476, cashier_name:'Pendo K.', till_number:'Till #3', sku_count:2, item_count:2, created_at:'2026-05-24T10:42:00Z' },
  { id:'txn-2038', txn_number:'TXN-2038', customer_name:'Hassan Bakari', customer_phone:'+255 689 110 442', payment_method:'M-Pesa', payment_reference:'QGT5K3D', status:'paid', subtotal:156000, discount_pct:0, discount_amount:0, total:184080, profit:42080, cashier_name:'Pendo K.', till_number:'Till #3', sku_count:4, item_count:12, created_at:'2026-05-24T09:15:00Z' },
  { id:'txn-2037', txn_number:'TXN-2037', customer_name:'Walk-in', customer_phone:'', payment_method:'Tigo Pesa', payment_reference:'TGP8821', status:'paid', subtotal:28500, discount_pct:0, discount_amount:0, total:33630, profit:10630, cashier_name:'Hamisi M.', till_number:'Till #1', sku_count:1, item_count:1, created_at:'2026-05-24T08:52:00Z' },
  { id:'txn-2036', txn_number:'TXN-2036', customer_name:'Asha Mwinyi', customer_phone:'+255 718 003 982', payment_method:'Cash', payment_reference:'', status:'paid', subtotal:28800, discount_pct:0, discount_amount:0, total:33984, profit:7984, cashier_name:'Hamisi M.', till_number:'Till #2', sku_count:4, item_count:18, created_at:'2026-05-23T17:28:00Z' },
  { id:'txn-2035', txn_number:'TXN-2035', customer_name:'Walk-in', customer_phone:'', payment_method:'M-Pesa', payment_reference:'QGT5K3E', status:'refunded', subtotal:6200, discount_pct:0, discount_amount:0, total:7316, profit:-4684, cashier_name:'Amani M.', till_number:'Till #1', sku_count:1, item_count:1, created_at:'2026-05-23T16:05:00Z' },
  { id:'txn-2034', txn_number:'TXN-2034', customer_name:'Mariam Said', customer_phone:'+255 715 880 442', payment_method:'M-Pesa', payment_reference:'QGT5K3F', status:'paid', subtotal:19500, discount_pct:0, discount_amount:0, total:23010, profit:5010, cashier_name:'Amani M.', till_number:'Till #1', sku_count:3, item_count:4, created_at:'2026-05-23T15:30:00Z' },
];

// ── Credits types ─────────────────────────────────────────────────────────────

export interface CreditCustomer {
  id: string;
  name: string;
  phone: string;
  avatar_hue: number;
  initials: string;
  segment: string;
  balance: number;
  status: 'overdue' | 'due-soon' | 'current';
  due_days: number;
  last_tab_date: string | null;
  last_pay_date: string | null;
  last_pay_amount: number | null;
}

export interface CreditsDashboard {
  kpis: {
    total_outstanding: number;
    overdue: number;
    due_soon: number;
    recovered_month: number;
    customer_count: number;
  };
  aging_buckets: { label: string; range: string; amount: number; color: string }[];
  customers: CreditCustomer[];
}

export interface CreditCustomerProfile {
  customer: {
    id: string; name: string; phone: string; avatar_hue: number; initials: string;
    segment: string; open_credit: number; total_spent: number; avg_ticket: number;
    last_visit: string | null;
  };
  tabs:     { id: string; txn_number: string; amount: number; amount_paid: number; balance: number; status: string; due_date: string | null; is_overdue: boolean; created_at: string }[];
  payments: { id: string; amount: number; method: string; reference: string; cashier_name: string; note: string; created_at: string }[];
  messages: { id: string; channel: string; direction: string; body: string; sent_by_name: string; created_at: string }[];
  notes:    { id: string; body: string; author_name: string; created_at: string }[];
}

const MOCK_CREDIT_CUSTOMERS: CreditCustomer[] = [
  { id:'c1', name:'Juma Kifupi', phone:'+255 712 990 102', avatar_hue:230, initials:'JK', segment:'Regular', balance:34200, status:'due-soon', due_days:6, last_tab_date:'2026-05-20', last_pay_date:'2026-05-13', last_pay_amount:20000 },
  { id:'c2', name:'Fatuma Ally', phone:'+255 754 221 309', avatar_hue:320, initials:'FA', segment:'VIP', balance:32500, status:'overdue', due_days:-6, last_tab_date:'2026-05-09', last_pay_date:'2026-05-12', last_pay_amount:10000 },
  { id:'c3', name:'Hassan Bakari', phone:'+255 689 110 442', avatar_hue:160, initials:'HB', segment:'Wholesale', balance:116000, status:'current', due_days:19, last_tab_date:'2026-05-16', last_pay_date:'2026-05-04', last_pay_amount:40000 },
  { id:'c4', name:'Asha Mwinyi', phone:'+255 718 003 982', avatar_hue:30, initials:'AM', segment:'Regular', balance:28800, status:'overdue', due_days:-14, last_tab_date:'2026-04-26', last_pay_date:null, last_pay_amount:null },
  { id:'c5', name:'Mariam Said', phone:'+255 715 880 442', avatar_hue:290, initials:'MS', segment:'VIP', balance:18500, status:'due-soon', due_days:2, last_tab_date:'2026-05-11', last_pay_date:null, last_pay_amount:null },
];

const MOCK_CREDITS_DASHBOARD: CreditsDashboard = {
  kpis: { total_outstanding: 230000, overdue: 61300, due_soon: 52700, recovered_month: 70000, customer_count: 5 },
  aging_buckets: [
    { label:'Current', range:'0 days', amount:116000, color:'var(--good)' },
    { label:'1-7 days', range:'1-7d', amount:52700, color:'#86efac' },
    { label:'8-30 days', range:'8-30d', amount:0, color:'var(--warn)' },
    { label:'31-60 days', range:'31-60d', amount:32500, color:'#fb923c' },
    { label:'60+ days', range:'60+d', amount:28800, color:'var(--bad)' },
  ],
  customers: MOCK_CREDIT_CUSTOMERS,
};

// ── Notebook types ────────────────────────────────────────────────────────────

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  date_label: string;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

const MOCK_NOTES: Note[] = [
  { id:'n1', title:'Supplier price review — Bakhresa', content:'Unga wa Sembe supplier raised prices by 8% starting November. Need to renegotiate by end of month.', tags:['Suppliers'], date_label:'Today', created_by_name:'Hamisi M.', created_at:'2026-05-24T10:00:00Z', updated_at:'2026-05-24T10:00:00Z' },
  { id:'n2', title:'Staff schedule — November', content:'Neema: Mon-Sat morning shift 7am-2pm. Baraka: Tue-Sun evening 2pm-9pm.', tags:['Staff'], date_label:'Yesterday', created_by_name:'Hamisi M.', created_at:'2026-05-23T09:00:00Z', updated_at:'2026-05-23T09:00:00Z' },
  { id:'n3', title:'Marketing ideas Q4', content:'Run loyalty promo for top 20 customers — offer 5% discount on next purchase over TZS 50,000.', tags:['Marketing','Ideas'], date_label:'2d ago', created_by_name:'Amani M.', created_at:'2026-05-22T14:00:00Z', updated_at:'2026-05-22T14:00:00Z' },
  { id:'n4', title:'Mwanza branch — opening checklist', content:'New branch opening planned for January 2026. Initial stock order estimated TZS 8.5M.', tags:['Ideas','Suppliers'], date_label:'5d ago', created_by_name:'Hamisi M.', created_at:'2026-05-19T11:00:00Z', updated_at:'2026-05-19T11:00:00Z' },
  { id:'n5', title:'Customer complaint — stale bread', content:'Mrs. Amina complained about stale bread on Saturday. Issued refund TZS 4,500.', tags:['Staff'], date_label:'1w ago', created_by_name:'Pendo K.', created_at:'2026-05-17T08:00:00Z', updated_at:'2026-05-17T08:00:00Z' },
];

// ── Store types ───────────────────────────────────────────────────────────────

export interface StoreItem {
  id: string;
  name: string;
  region: string;
  status: string;
  organisation_name: string;
  staff_count: number;
  manager_name: string | null;
  today_revenue: number;
  today_txns: number;
  staff_on_duty: number;
  week_data: number[];
  vat_enabled: boolean;
}

export interface StoreDetail extends StoreItem {
  address: string;
  phone: string;
  week_breakdown: { date: string; revenue: number; txn_count: number }[];
  staff_roster: { id: string; name: string; role: string; phone: string; on_duty: boolean }[];
}

export interface StoreStats {
  total_stores: number;
  open_count: number;
  closed_count: number;
  paused_count: number;
  total_revenue: number;
  total_txns: number;
  staff_on_duty: number;
}

const MOCK_STORES: StoreItem[] = [
  { id:'kariakoo', name:'Duka Kuu — Kariakoo', region:'Dar es Salaam', status:'open', organisation_name:'Duka Kuu Ltd', staff_count:6, manager_name:'Hamisi Mwakapaga', today_revenue:1842000, today_txns:87, staff_on_duty:4, week_data:[1640000,1720000,1580000,1890000,1842000,0,0], vat_enabled:true },
  { id:'kinondoni', name:'Kinondoni Branch', region:'Dar es Salaam', status:'open', organisation_name:'Duka Kuu Ltd', staff_count:4, manager_name:'Amani Msongo', today_revenue:980000, today_txns:46, staff_on_duty:3, week_data:[910000,960000,880000,1020000,980000,0,0], vat_enabled:true },
  { id:'ilala', name:'Ilala Outlet', region:'Dar es Salaam', status:'closed', organisation_name:'Duka Kuu Ltd', staff_count:3, manager_name:'Pendo Kilimba', today_revenue:620000, today_txns:31, staff_on_duty:2, week_data:[580000,610000,640000,595000,620000,0,0], vat_enabled:false },
];

// ── Analytics types ────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  revenue: number;
  profit: number;
  margin_pct: number;
  transaction_count: number;
  customer_count: number;
  avg_ticket: number;
  tax_collected: number;
  refund_total: number;
  discount_amount: number;
  discounted_count: number;
  expense_amount: number;
  expense_count: number;
  revenue_delta_pct: number | null;
  transaction_delta_pct: number | null;
}

export interface DashboardData {
  kpis_today:   DashboardKPIs;
  hourly_today: { hour: number; label: string; revenue: number; profit: number; discount_amount: number; credit_amount: number; expense_amount: number; txn_count: number }[];
  payment_mix:  { method: string; amount: number; pct: number }[];
  top_products: { product_id: string; product_name: string; product_sku: string; qty_sold: number; revenue: number; profit: number }[];
  low_stock:    { id: string; name: string; sku: string; stock: number; min_stock: number; status: string }[];
  credit_kpi:   { total: number; customer_count: number; overdue_count: number };
}

const MOCK_DASHBOARD: DashboardData = {
  kpis_today: {
    revenue: 3442000, profit: 892000, margin_pct: 25.9, transaction_count: 164, customer_count: 89,
    avg_ticket: 21000, tax_collected: 523000, refund_total: 7316, discount_amount: 15200,
    discounted_count: 12, expense_amount: 185000, expense_count: 4,
    revenue_delta_pct: 8.2, transaction_delta_pct: 5.1,
  },
  hourly_today: [
    { hour:8, label:'8AM', revenue:180000, profit:42000, discount_amount:0, credit_amount:0, expense_amount:0, txn_count:8 },
    { hour:9, label:'9AM', revenue:420000, profit:105000, discount_amount:0, credit_amount:0, expense_amount:0, txn_count:18 },
    { hour:10, label:'10AM', revenue:580000, profit:152000, discount_amount:5000, credit_amount:84200, expense_amount:0, txn_count:24 },
    { hour:11, label:'11AM', revenue:510000, profit:128000, discount_amount:0, credit_amount:0, expense_amount:0, txn_count:22 },
    { hour:12, label:'12PM', revenue:620000, profit:162000, discount_amount:0, credit_amount:0, expense_amount:50000, txn_count:28 },
    { hour:13, label:'1PM', revenue:480000, profit:118000, discount_amount:10200, credit_amount:0, expense_amount:0, txn_count:21 },
    { hour:14, label:'2PM', revenue:410000, profit:105000, discount_amount:0, credit_amount:0, expense_amount:85000, txn_count:19 },
    { hour:15, label:'3PM', revenue:242000, profit:80000, discount_amount:0, credit_amount:0, expense_amount:50000, txn_count:14 },
  ],
  payment_mix: [
    { method:'M-Pesa', amount:1720000, pct:50 },
    { method:'Cash', amount:1030000, pct:30 },
    { method:'Tigo Pesa', amount:415000, pct:12 },
    { method:'Credit', amount:202000, pct:6 },
    { method:'Bank', amount:75000, pct:2 },
  ],
  top_products: [
    { product_id:'p3', product_name:'Mafuta ya Cooking 5L', product_sku:'OIL-003', qty_sold:18, revenue:612000, profit:108000 },
    { product_id:'p1', product_name:'Unga wa Sembe 10kg', product_sku:'UNGA-001', qty_sold:14, revenue:399000, profit:88200 },
    { product_id:'p6', product_name:'Mchele Pishori 5kg', product_sku:'RIC-006', qty_sold:12, revenue:264000, profit:54000 },
    { product_id:'p8', product_name:'Soda Coca-Cola 500ml', product_sku:'DRK-008', qty_sold:35, revenue:52500, profit:24500 },
    { product_id:'p7', product_name:'Lotion Nivea 400ml', product_sku:'COS-007', qty_sold:6, revenue:75000, profit:25800 },
  ],
  low_stock: [
    { id:'p2', name:'Sabuni ya OMO 1kg', sku:'SAB-002', stock:3, min_stock:15, status:'low' },
    { id:'p5', name:'Chai Bora 500g', sku:'TEA-005', stock:5, min_stock:10, status:'low' },
    { id:'p11', name:'Mafuta Cooking 1L', sku:'OIL-011', stock:12, min_stock:15, status:'low' },
  ],
  credit_kpi: { total: 230000, customer_count: 5, overdue_count: 2 },
};

// ── Analytics sub-page types ───────────────────────────────────────────────────

export interface SalesAnalytics {
  category_breakdown: { category: string; revenue: number; pct: number; delta_pct: number | null }[];
  day_of_week: { dow: number; label: string; avg_revenue: number; avg_transactions: number }[];
  hourly_pattern: { hour: number; label: string; avg_revenue: number }[];
}

export interface CustomerAnalytics {
  daily_visits: { date: string; label: string; total: number; new_customers: number; returning: number }[];
  segments: { segment: string; count: number; spend: number; pct: number }[];
  retention_cohorts: { month: string; new: number; m1: number; m2: number; m3: number }[];
  top_customers: { customer_id: string; name: string; spent: number; visits: number; avg_ticket: number; last_seen_days: number | null; avatar_hue: number }[];
}

export interface CashflowAnalytics {
  totals: { inflow: number; cogs: number; opex: number; net: number; net_margin_pct: number };
  daily: { date: string; label: string; inflow: number; cogs: number; net: number }[];
  running_balance: { date: string; label: string; balance: number }[];
  payment_inflow: { method: string; amount: number; pct: number }[];
  credit_outstanding: { total: number; customer_count: number; overdue_count: number };
}

export interface AnalyticsOverview {
  kpis: {
    revenue: number; profit: number; margin_pct: number; transaction_count: number;
    customer_count: number; avg_ticket: number; revenue_delta_pct: number | null;
    transaction_delta_pct: number | null;
  };
  trend: { date: string; label: string; revenue: number; transactions: number }[];
  payment_mix: { method: string; amount: number; pct: number }[];
  top_products: { product_id: string; product_name: string; revenue: number; qty_sold: number }[];
}

// ── Analytics products types ──────────────────────────────────────────────────

export interface AnalyticsProduct {
  product_id: string;
  product_name: string;
  product_sku: string;
  category: string;
  units_sold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin_pct: number;
  trend_pct: number | null;
  revenue_share_pct: number;
}

export interface AnalyticsProductsResponse {
  date_from: string;
  date_to: string;
  totals: { revenue: number; profit: number; margin_pct: number; units_sold: number; sku_count: number };
  products: AnalyticsProduct[];
}

const MOCK_SALES_ANALYTICS: SalesAnalytics = {
  category_breakdown: [
    { category:'Grocery', revenue:1280000, pct:37, delta_pct:5.2 },
    { category:'Beverage', revenue:680000, pct:20, delta_pct:12.1 },
    { category:'Household', revenue:520000, pct:15, delta_pct:-2.3 },
    { category:'Cosmetics', revenue:410000, pct:12, delta_pct:8.7 },
    { category:'Bakery', revenue:340000, pct:10, delta_pct:1.1 },
    { category:'Snacks', revenue:212000, pct:6, delta_pct:15.4 },
  ],
  day_of_week: [
    { dow:1, label:'Mon', avg_revenue:2850000, avg_transactions:142 },
    { dow:2, label:'Tue', avg_revenue:2920000, avg_transactions:138 },
    { dow:3, label:'Wed', avg_revenue:2780000, avg_transactions:135 },
    { dow:4, label:'Thu', avg_revenue:3100000, avg_transactions:152 },
    { dow:5, label:'Fri', avg_revenue:3450000, avg_transactions:168 },
    { dow:6, label:'Sat', avg_revenue:3680000, avg_transactions:182 },
    { dow:0, label:'Sun', avg_revenue:1950000, avg_transactions:98 },
  ],
  hourly_pattern: [
    { hour:7, label:'7AM', avg_revenue:85000 },
    { hour:8, label:'8AM', avg_revenue:180000 },
    { hour:9, label:'9AM', avg_revenue:420000 },
    { hour:10, label:'10AM', avg_revenue:580000 },
    { hour:11, label:'11AM', avg_revenue:510000 },
    { hour:12, label:'12PM', avg_revenue:620000 },
    { hour:13, label:'1PM', avg_revenue:480000 },
    { hour:14, label:'2PM', avg_revenue:410000 },
    { hour:15, label:'3PM', avg_revenue:242000 },
    { hour:16, label:'4PM', avg_revenue:180000 },
    { hour:17, label:'5PM', avg_revenue:120000 },
    { hour:18, label:'6PM', avg_revenue:65000 },
  ],
};

const MOCK_CUSTOMER_ANALYTICS: CustomerAnalytics = {
  daily_visits: [
    { date:'2026-05-24', label:'May 24', total:89, new_customers:12, returning:77 },
    { date:'2026-05-23', label:'May 23', total:95, new_customers:8, returning:87 },
    { date:'2026-05-22', label:'May 22', total:82, new_customers:10, returning:72 },
    { date:'2026-05-21', label:'May 21', total:78, new_customers:6, returning:72 },
    { date:'2026-05-20', label:'May 20', total:102, new_customers:15, returning:87 },
    { date:'2026-05-19', label:'May 19', total:91, new_customers:9, returning:82 },
    { date:'2026-05-18', label:'May 18', total:88, new_customers:11, returning:77 },
  ],
  segments: [
    { segment:'VIP', count:28, spend:4200000, pct:15 },
    { segment:'Regular', count:120, spend:8500000, pct:65 },
    { segment:'New', count:35, spend:890000, pct:19 },
  ],
  retention_cohorts: [
    { month:'Mar', new:42, m1:35, m2:30, m3:28 },
    { month:'Apr', new:38, m1:32, m2:28, m3:0 },
    { month:'May', new:45, m1:38, m2:0, m3:0 },
  ],
  top_customers: [
    { customer_id:'c5', name:'Mariam Said', spent:4720000, visits:187, avg_ticket:25240, last_seen_days:1, avatar_hue:290 },
    { customer_id:'c2', name:'Fatuma Ally', spent:3215000, visits:142, avg_ticket:22640, last_seen_days:2, avatar_hue:320 },
    { customer_id:'c3', name:'Hassan Bakari', spent:2840000, visits:36, avg_ticket:78889, last_seen_days:8, avatar_hue:160 },
    { customer_id:'c1', name:'Juma Kifupi', spent:1842000, visits:68, avg_ticket:27088, last_seen_days:4, avatar_hue:230 },
    { customer_id:'c4', name:'Asha Mwinyi', spent:1180000, visits:92, avg_ticket:12826, last_seen_days:14, avatar_hue:30 },
  ],
};

const MOCK_CASHFLOW: CashflowAnalytics = {
  totals: { inflow:3442000, cogs:2180000, opex:185000, net:1077000, net_margin_pct:31.3 },
  daily: [
    { date:'2026-05-24', label:'May 24', inflow:3442000, cogs:2180000, net:1077000 },
    { date:'2026-05-23', label:'May 23', inflow:2890000, cogs:1830000, net:875000 },
    { date:'2026-05-22', label:'May 22', inflow:3120000, cogs:1980000, net:955000 },
    { date:'2026-05-21', label:'May 21', inflow:2750000, cogs:1740000, net:825000 },
    { date:'2026-05-20', label:'May 20', inflow:3580000, cogs:2260000, net:1135000 },
  ],
  running_balance: [
    { date:'2026-05-20', label:'May 20', balance:12500000 },
    { date:'2026-05-21', label:'May 21', balance:13325000 },
    { date:'2026-05-22', label:'May 22', balance:14280000 },
    { date:'2026-05-23', label:'May 23', balance:15155000 },
    { date:'2026-05-24', label:'May 24', balance:16232000 },
  ],
  payment_inflow: [
    { method:'M-Pesa', amount:1720000, pct:50 },
    { method:'Cash', amount:1030000, pct:30 },
    { method:'Tigo Pesa', amount:415000, pct:12 },
    { method:'Credit', amount:202000, pct:6 },
    { method:'Bank', amount:75000, pct:2 },
  ],
  credit_outstanding: { total:230000, customer_count:5, overdue_count:2 },
};

const MOCK_ANALYTICS_OVERVIEW: AnalyticsOverview = {
  kpis: {
    revenue:3442000, profit:892000, margin_pct:25.9, transaction_count:164,
    customer_count:89, avg_ticket:21000, revenue_delta_pct:8.2, transaction_delta_pct:5.1,
  },
  trend: [
    { date:'2026-05-18', label:'May 18', revenue:2680000, transactions:132 },
    { date:'2026-05-19', label:'May 19', revenue:2950000, transactions:145 },
    { date:'2026-05-20', label:'May 20', revenue:3580000, transactions:178 },
    { date:'2026-05-21', label:'May 21', revenue:2750000, transactions:138 },
    { date:'2026-05-22', label:'May 22', revenue:3120000, transactions:155 },
    { date:'2026-05-23', label:'May 23', revenue:2890000, transactions:142 },
    { date:'2026-05-24', label:'May 24', revenue:3442000, transactions:164 },
  ],
  payment_mix: MOCK_DASHBOARD.payment_mix,
  top_products: [
    { product_id:'p3', product_name:'Mafuta ya Cooking 5L', revenue:612000, qty_sold:18 },
    { product_id:'p1', product_name:'Unga wa Sembe 10kg', revenue:399000, qty_sold:14 },
    { product_id:'p6', product_name:'Mchele Pishori 5kg', revenue:264000, qty_sold:12 },
  ],
};

const MOCK_ANALYTICS_PRODUCTS: AnalyticsProductsResponse = {
  date_from: '2026-05-01',
  date_to: '2026-05-24',
  totals: { revenue:3442000, profit:892000, margin_pct:25.9, units_sold:428, sku_count:18 },
  products: MOCK_INVENTORY.map((p, i) => ({
    product_id: p.id, product_name: p.name, product_sku: p.sku,
    category: p.category_name ?? '', units_sold: 18 - i,
    revenue: p.price * (18 - i), cost: p.cost * (18 - i),
    profit: (p.price - p.cost) * (18 - i),
    margin_pct: p.margin_pct, trend_pct: i % 3 === 0 ? 12.5 : i % 3 === 1 ? -3.2 : 7.8,
    revenue_share_pct: Math.round(((18 - i) / 428) * 1000) / 10,
  })),
};

// ── Customer directory types ───────────────────────────────────────────────────

export interface CustomerListItem {
  id: string; name: string; phone: string; email: string;
  avatar_hue: number; initials: string; segment: string;
  total_spent: number; last_visit: string | null;
  avg_ticket: number; open_credit: number; has_open_credit: boolean;
  credit_limit: number | null;
  notes: string; is_active: boolean; created_at: string;
}

export interface CustomerSummary {
  total_customers: number; total_lifetime_value: number;
  total_open_credit: number; avg_ticket: number;
  active_this_month: number; on_credit_count: number;
  by_segment: Record<string, number>;
}

const MOCK_CUSTOMERS: CustomerListItem[] = [
  { id:'c5', name:'Mariam Said', phone:'+255 715 880 442', email:'', avatar_hue:290, initials:'MS', segment:'VIP', total_spent:4720000, last_visit:'2026-05-23', avg_ticket:25240, open_credit:18500, has_open_credit:true, credit_limit:200000, notes:'', is_active:true, created_at:'2023-08-15' },
  { id:'c2', name:'Fatuma Ally', phone:'+255 754 221 309', email:'', avatar_hue:320, initials:'FA', segment:'VIP', total_spent:3215000, last_visit:'2026-05-22', avg_ticket:22640, open_credit:32500, has_open_credit:true, credit_limit:150000, notes:'', is_active:true, created_at:'2023-09-20' },
  { id:'c3', name:'Hassan Bakari', phone:'+255 689 110 442', email:'', avatar_hue:160, initials:'HB', segment:'Wholesale', total_spent:2840000, last_visit:'2026-05-16', avg_ticket:78889, open_credit:116000, has_open_credit:true, credit_limit:500000, notes:'', is_active:true, created_at:'2024-01-10' },
  { id:'c1', name:'Juma Kifupi', phone:'+255 712 990 102', email:'', avatar_hue:230, initials:'JK', segment:'Regular', total_spent:1842000, last_visit:'2026-05-20', avg_ticket:27088, open_credit:34200, has_open_credit:true, credit_limit:100000, notes:'', is_active:true, created_at:'2024-03-05' },
  { id:'c4', name:'Asha Mwinyi', phone:'+255 718 003 982', email:'', avatar_hue:30, initials:'AM', segment:'Regular', total_spent:1180000, last_visit:'2026-04-26', avg_ticket:12826, open_credit:28800, has_open_credit:true, credit_limit:50000, notes:'', is_active:true, created_at:'2023-11-12' },
];

const MOCK_CUSTOMER_SUMMARY: CustomerSummary = {
  total_customers: 183, total_lifetime_value: 14500000, total_open_credit: 230000,
  avg_ticket: 21000, active_this_month: 156, on_credit_count: 5,
  by_segment: { VIP: 28, Regular: 120, New: 35 },
};

// ── Supplier types ─────────────────────────────────────────────────────────────

export interface SupplierListItem {
  id: string; name: string; phone: string; email: string; city: string;
  category: string; status: string; total_value: number;
  outstanding_balance: number; last_delivery_date: string | null;
  delivery_count: number; created_at: string;
}

export interface SupplierStats {
  total_suppliers: number; active_suppliers: number;
  total_outstanding: number; total_value_ytd: number;
}

const MOCK_SUPPLIERS: SupplierListItem[] = [
  { id:'s1', name:'Bakhresa Co.', phone:'+255 22 211 0001', email:'orders@bakhresa.co.tz', city:'Dar es Salaam', category:'Grocery', status:'active', total_value:8500000, outstanding_balance:0, last_delivery_date:'2026-05-18', delivery_count:24, created_at:'2023-01-15' },
  { id:'s2', name:'Unilever EA', phone:'+255 22 211 0002', email:'supply@unilever.co.tz', city:'Dar es Salaam', category:'Household', status:'active', total_value:4200000, outstanding_balance:0, last_delivery_date:'2026-05-09', delivery_count:18, created_at:'2023-02-10' },
  { id:'s3', name:'Murzah Oil', phone:'+255 22 211 0003', email:'orders@murzah.co.tz', city:'Dar es Salaam', category:'Grocery', status:'active', total_value:6800000, outstanding_balance:0, last_delivery_date:'2026-05-20', delivery_count:22, created_at:'2023-01-20' },
  { id:'s8', name:'Coca-Cola Kwanza', phone:'+255 22 211 0008', email:'supply@cocacola.co.tz', city:'Dar es Salaam', category:'Beverage', status:'active', total_value:3200000, outstanding_balance:0, last_delivery_date:'2026-05-22', delivery_count:30, created_at:'2023-03-01' },
  { id:'s10', name:'PZ Cussons', phone:'+255 22 211 0010', email:'orders@pzcussons.co.tz', city:'Dar es Salaam', category:'Household', status:'active', total_value:2100000, outstanding_balance:0, last_delivery_date:'2026-05-16', delivery_count:15, created_at:'2023-04-15' },
];

const MOCK_SUPPLIER_STATS: SupplierStats = {
  total_suppliers: 14, active_suppliers: 12, total_outstanding: 450000, total_value_ytd: 32500000,
};

// ── Staff types ────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string; full_name: string; initials: string; phone: string; email: string;
  role: string; avatar_hue: number; shift: string; shift_display: string;
  employment_status: string; can_refund: boolean; can_discount: boolean;
  can_view_reports: boolean; is_active: boolean;
  sales_today: number; txns_today: number; total_sales: number;
  avg_ticket: number; txns_total: number; store_name: string;
}

export interface StaffKPIs {
  total_staff: number; on_duty: number; total_sales_today: number;
  avg_ticket_today: number; top_cashier: string | null;
}

const MOCK_STAFF: StaffMember[] = [
  { id:'st1', full_name:'Hamisi Mwakapaga', initials:'HM', phone:'+255 712 345 678', email:'hamisi@ziadapos.com', role:'Manager', avatar_hue:230, shift:'morning', shift_display:'7AM - 2PM', employment_status:'full_time', can_refund:true, can_discount:true, can_view_reports:true, is_active:true, sales_today:1240000, txns_today:48, total_sales:42000000, avg_ticket:25833, txns_total:1626, store_name:'Duka Kuu — Kariakoo' },
  { id:'st2', full_name:'Amani Msongo', initials:'AM', phone:'+255 713 456 789', email:'amani@ziadapos.com', role:'Cashier', avatar_hue:160, shift:'morning', shift_display:'7AM - 2PM', employment_status:'full_time', can_refund:true, can_discount:false, can_view_reports:false, is_active:true, sales_today:890000, txns_today:32, total_sales:28000000, avg_ticket:21875, txns_total:1280, store_name:'Duka Kuu — Kariakoo' },
  { id:'st3', full_name:'Pendo Kilimba', initials:'PK', phone:'+255 714 567 890', email:'pendo@ziadapos.com', role:'Cashier', avatar_hue:320, shift:'evening', shift_display:'2PM - 9PM', employment_status:'full_time', can_refund:false, can_discount:false, can_view_reports:false, is_active:true, sales_today:620000, txns_today:24, total_sales:18000000, avg_ticket:22222, txns_total:810, store_name:'Duka Kuu — Kariakoo' },
  { id:'st4', full_name:'Neema Charles', initials:'NC', phone:'+255 715 678 901', email:'neema@ziadapos.com', role:'Cashier', avatar_hue:60, shift:'morning', shift_display:'7AM - 2PM', employment_status:'part_time', can_refund:false, can_discount:false, can_view_reports:false, is_active:true, sales_today:450000, txns_today:18, total_sales:8000000, avg_ticket:20833, txns_total:384, store_name:'Kinondoni Branch' },
  { id:'st5', full_name:'Baraka Osman', initials:'BO', phone:'+255 716 789 012', email:'baraka@ziadapos.com', role:'Cashier', avatar_hue:200, shift:'evening', shift_display:'2PM - 9PM', employment_status:'full_time', can_refund:false, can_discount:false, can_view_reports:false, is_active:true, sales_today:242000, txns_today:12, total_sales:15000000, avg_ticket:22059, txns_total:680, store_name:'Kinondoni Branch' },
];

const MOCK_STAFF_KPIS: StaffKPIs = {
  total_staff: 5, on_duty: 4, total_sales_today: 3442000, avg_ticket_today: 21000, top_cashier: 'Hamisi Mwakapaga',
};

// ── Discount summary types ─────────────────────────────────────────────────────

export interface DiscountSummary {
  total_discount_amount: number; discounted_count: number;
  total_transactions: number; discount_rate: number;
  avg_discount_pct: number; avg_discount_amount: number;
  by_cashier: { cashier_name: string; amount: number; count: number; avg_pct: number }[];
  by_day: { day: string; amount: number; count: number }[];
  largest_discounts: { txn_number: string; customer_name: string; discount_amount: number; discount_pct: number; total: number; created_at: string }[];
}

const MOCK_DISCOUNT_SUMMARY: DiscountSummary = {
  total_discount_amount: 152000, discounted_count: 48, total_transactions: 820,
  discount_rate: 5.9, avg_discount_pct: 4.2, avg_discount_amount: 3167,
  by_cashier: [
    { cashier_name:'Hamisi M.', amount:68000, count:22, avg_pct:4.5 },
    { cashier_name:'Amani M.', amount:52000, count:16, avg_pct:4.0 },
    { cashier_name:'Pendo K.', amount:32000, count:10, avg_pct:3.8 },
  ],
  by_day: [
    { day:'Mon', amount:22000, count:7 },
    { day:'Tue', amount:18000, count:6 },
    { day:'Wed', amount:25000, count:8 },
    { day:'Thu', amount:20000, count:6 },
    { day:'Fri', amount:30000, count:10 },
    { day:'Sat', amount:25000, count:8 },
    { day:'Sun', amount:12000, count:3 },
  ],
  largest_discounts: [
    { txn_number:'TXN-2020', customer_name:'Hassan Bakari', discount_amount:7800, discount_pct:5, total:148200, created_at:'2026-05-18T14:20:00Z' },
    { txn_number:'TXN-1985', customer_name:'Mariam Said', discount_amount:5200, discount_pct:5, total:98800, created_at:'2026-05-14T11:45:00Z' },
    { txn_number:'TXN-2041', customer_name:'Walk-in', discount_amount:750, discount_pct:5, total:16830, created_at:'2026-05-24T12:55:00Z' },
  ],
};

// ── Expense types ─────────────────────────────────────────────────────────────

export interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  payment_method: string;
  payment_reference: string;
  notes: string;
  receipt_url: string | null;
  recorded_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSummary {
  total_amount: number;
  total_count: number;
  by_category: { category: string; amount: number; count: number; pct: number }[];
  by_method: { method: string; amount: number; count: number; pct: number }[];
  recent: ExpenseItem[];
}

const MOCK_EXPENSES: ExpenseItem[] = [
  { id:'ex1', title:'Staff wages — May week 3', category:'Payroll', amount:850000, payment_method:'Bank', payment_reference:'NMB-44021', notes:'Weekly payroll for 5 staff', receipt_url:null, recorded_by_name:'Hamisi M.', created_at:'2026-05-22T09:00:00Z', updated_at:'2026-05-22T09:00:00Z' },
  { id:'ex2', title:'Electricity bill — May', category:'Utilities', amount:185000, payment_method:'M-Pesa', payment_reference:'QGT5K3E', notes:'TANESCO bill for Kariakoo store', receipt_url:null, recorded_by_name:'Hamisi M.', created_at:'2026-05-20T14:30:00Z', updated_at:'2026-05-20T14:30:00Z' },
  { id:'ex3', title:'Store cleaning supplies', category:'Maintenance', amount:45000, payment_method:'Cash', payment_reference:'', notes:'Mops, detergent, trash bags', receipt_url:null, recorded_by_name:'Amani M.', created_at:'2026-05-19T10:15:00Z', updated_at:'2026-05-19T10:15:00Z' },
  { id:'ex4', title:'POS receipt paper', category:'Supplies', amount:35000, payment_method:'Cash', payment_reference:'', notes:'20 rolls thermal paper', receipt_url:null, recorded_by_name:'Pendo K.', created_at:'2026-05-18T11:00:00Z', updated_at:'2026-05-18T11:00:00Z' },
  { id:'ex5', title:'Transport — supplier pickup', category:'Transport', amount:25000, payment_method:'Cash', payment_reference:'', notes:'Taxi to Bakhresa warehouse', receipt_url:null, recorded_by_name:'Hamisi M.', created_at:'2026-05-17T08:30:00Z', updated_at:'2026-05-17T08:30:00Z' },
];

const MOCK_EXPENSE_SUMMARY: ExpenseSummary = {
  total_amount: 1140000, total_count: 18,
  by_category: [
    { category:'Payroll', amount:850000, count:4, pct:74.6 },
    { category:'Utilities', amount:185000, count:2, pct:16.2 },
    { category:'Maintenance', amount:45000, count:3, pct:3.9 },
    { category:'Supplies', amount:35000, count:5, pct:3.1 },
    { category:'Transport', amount:25000, count:4, pct:2.2 },
  ],
  by_method: [
    { method:'Bank', amount:850000, count:4, pct:74.6 },
    { method:'M-Pesa', amount:185000, count:2, pct:16.2 },
    { method:'Cash', amount:105000, count:12, pct:9.2 },
  ],
  recent: MOCK_EXPENSES,
};

// ── AI types ───────────────────────────────────────────────────────────────────

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  sources: string[];
  created_at: string;
}

export interface AIConversationListItem {
  id: string;
  title: string;
  first_message_preview: string;
  message_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIConversationDetail extends AIConversationListItem {
  messages: AIMessage[];
}

export interface AISuggestion {
  icon: string;
  label: string;
  key: string;
}

export interface AICreditsStatus {
  remaining: number;
  used: number;
  allocated: number;
  pct_used: number;
}

export interface AIUsageEntry {
  id: string;
  conversation_title: string;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  created_at: string;
}

export interface AIUsage {
  totals: { messages: number; prompt_tokens: number; completion_tokens: number };
  this_month: { messages: number; prompt_tokens: number; completion_tokens: number };
  recent: AIUsageEntry[];
  ai_credits: AICreditsStatus;
  ngamia_configured: boolean;
}

const MOCK_AI_CONVERSATIONS: AIConversationListItem[] = [
  { id:'ai-1', title:'Sales analysis for May', first_message_preview:'Analyze my sales trends for May 2026', message_count:4, is_active:true, created_at:'2026-05-24T10:00:00Z', updated_at:'2026-05-24T10:15:00Z' },
  { id:'ai-2', title:'Inventory restock suggestions', first_message_preview:'Which products need restocking?', message_count:6, is_active:true, created_at:'2026-05-23T14:00:00Z', updated_at:'2026-05-23T14:30:00Z' },
  { id:'ai-3', title:'Customer credit follow-up', first_message_preview:'Draft reminder messages for overdue credits', message_count:3, is_active:true, created_at:'2026-05-22T09:00:00Z', updated_at:'2026-05-22T09:20:00Z' },
];

const MOCK_AI_SUGGESTIONS: AISuggestion[] = [
  { icon:'📊', label:'Analyze today\'s sales performance', key:'analyze_sales' },
  { icon:'📦', label:'Which products are running low?', key:'low_stock' },
  { icon:'💰', label:'Show overdue credit customers', key:'overdue_credits' },
  { icon:'📈', label:'Compare this week vs last week', key:'weekly_comparison' },
];

const MOCK_AI_CREDITS: AICreditsStatus = { remaining: 380, used: 120, allocated: 500, pct_used: 24 };

// ── Reports types ─────────────────────────────────────────────────────────────

export interface ReportType {
  id: string;
  name: string;
  desc: string;
  color: string;
  supports_date_range: boolean;
}

export interface ScheduledReportEntry {
  id: string;
  report_type: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  date_range_preset: string;
  recipients: string[];
  is_enabled: boolean;
  last_sent_at: string | null;
  next_send_at: string | null;
  recipient_count?: number;
  created_at: string;
}

export interface ReportExportEntry {
  id: string;
  report_type: string;
  name: string;
  period_label: string;
  format: 'csv' | 'json';
  date_from: string;
  date_to: string;
  file_size_bytes: number;
  file_size_display: string;
  created_by_name: string;
  created_at: string;
}

const MOCK_REPORT_TYPES: ReportType[] = [
  { id:'sales', name:'Sales Report', desc:'Revenue, transactions, and profit summary', color:'#6366f1', supports_date_range:true },
  { id:'inventory', name:'Inventory Report', desc:'Stock levels, movements, and valuation', color:'#10b981', supports_date_range:true },
  { id:'tax', name:'Tax Report', desc:'VAT collected and remittances', color:'#f59e0b', supports_date_range:true },
  { id:'credit', name:'Credit Report', desc:'Outstanding balances and aging', color:'#ef4444', supports_date_range:true },
  { id:'expense', name:'Expense Report', desc:'Operating costs by category', color:'#8b5cf6', supports_date_range:true },
  { id:'customer', name:'Customer Report', desc:'Customer activity and lifetime value', color:'#06b6d4', supports_date_range:true },
];

const MOCK_SCHEDULED_REPORTS: ScheduledReportEntry[] = [
  { id:'sr1', report_type:'sales', name:'Daily Sales Summary', frequency:'daily', date_range_preset:'today', recipients:['hamisi@ziadapos.com'], is_enabled:true, last_sent_at:'2026-05-24T18:00:00Z', next_send_at:'2026-05-25T18:00:00Z', recipient_count:1, created_at:'2026-04-01' },
  { id:'sr2', report_type:'credit', name:'Weekly Credit Update', frequency:'weekly', date_range_preset:'this_week', recipients:['hamisi@ziadapos.com','amani@ziadapos.com'], is_enabled:true, last_sent_at:'2026-05-19T09:00:00Z', next_send_at:'2026-05-26T09:00:00Z', recipient_count:2, created_at:'2026-04-01' },
];

const MOCK_REPORT_EXPORTS: ReportExportEntry[] = [
  { id:'re1', report_type:'sales', name:'Sales Report', period_label:'May 1-24, 2026', format:'csv', date_from:'2026-05-01', date_to:'2026-05-24', file_size_bytes:45000, file_size_display:'45 KB', created_by_name:'Hamisi M.', created_at:'2026-05-24T16:00:00Z' },
  { id:'re2', report_type:'inventory', name:'Inventory Snapshot', period_label:'May 24, 2026', format:'csv', date_from:'2026-05-24', date_to:'2026-05-24', file_size_bytes:12000, file_size_display:'12 KB', created_by_name:'Hamisi M.', created_at:'2026-05-24T08:00:00Z' },
];

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  register(payload: RegisterPayload) {
    const user: UserProfile = { ...MOCK_USER, first_name: payload.full_name.split(' ')[0], last_name: payload.full_name.split(' ').slice(1).join(' '), full_name: payload.full_name, phone: payload.phone };
    return Promise.resolve(ok<RegisterResponse>({ access: MOCK_TOKEN, refresh: MOCK_REFRESH, user, organisation: MOCK_ORG, subscription: MOCK_SUB }));
  },

  login(payload: LoginPayload) {
    const user: UserProfile = { ...MOCK_USER, phone: payload.phone };
    return Promise.resolve(ok<LoginResponse>({ access: MOCK_TOKEN, refresh: MOCK_REFRESH, user, subscription: MOCK_SUB }));
  },

  refresh(refreshToken: string) {
    return Promise.resolve(ok<{ access: string }>({ access: MOCK_TOKEN }));
  },

  async me() {
    return Promise.resolve(ok<MeResponse>({ user: MOCK_USER, subscription: MOCK_SUB, verification: { phone_verified: true, email_verified: true } }));
  },

  async mySubscription() {
    return Promise.resolve(ok<SubscriptionInfo>(MOCK_SUB));
  },

  async resendEmailConfirmation(): Promise<ApiResult<null>> {
    return Promise.resolve(ok<null>(null));
  },

  async sendPhoneOtp(): Promise<ApiResult<null>> {
    return Promise.resolve(ok<null>(null));
  },

  async verifyPhoneOtp(code: string): Promise<ApiResult<null>> {
    return Promise.resolve(ok<null>(null));
  },

  async switchStore(storeId: string): Promise<ApiResult<MeResponse['user']>> {
    return Promise.resolve(ok<MeResponse['user']>({ ...MOCK_USER, store: storeId }));
  },
};

// ── Organisation API ───────────────────────────────────────────────────────────

export const organisationApi = {
  async get(): Promise<ApiResult<Organisation>> {
    return Promise.resolve(ok<Organisation>(MOCK_ORG));
  },
  async patch(payload: Partial<{ sendafrica_api_key: string; sms_sender_id: string; ngamia_api_key: string }>): Promise<ApiResult<Organisation>> {
    return Promise.resolve(ok<Organisation>(MOCK_ORG));
  },
  async getSmsBalance(): Promise<ApiResult<{ balance: number }>> {
    return Promise.resolve(ok({ balance: 245 }));
  },
};

// ── Inventory API ──────────────────────────────────────────────────────────────

export const inventoryApi = {
  async create(payload: Record<string, unknown>): Promise<ApiResult<InventoryProduct>> {
    const newProduct: InventoryProduct = {
      id: 'p-new-' + Date.now(),
      name: String(payload.name ?? 'New Product'),
      sku: String(payload.sku ?? ''),
      barcode: String(payload.barcode ?? ''),
      category: null,
      category_name: String(payload.category_name_input ?? null),
      supplier: null,
      supplier_name: null,
      color: 'indigo',
      image_url: null,
      price: Number(payload.price ?? 0),
      cost: Number(payload.cost ?? 0),
      margin_pct: 0,
      stock: Number(payload.stock ?? 0),
      min_stock: Number(payload.min_stock ?? 5),
      max_stock: Number(payload.max_stock ?? 50),
      weekly_sold: 0,
      stock_status: 'active',
      is_active: payload.is_active !== false,
      created_at: new Date().toISOString(),
    };
    return Promise.resolve(ok<InventoryProduct>(newProduct));
  },

  async getCategories(): Promise<ApiResult<Category[]>> {
    return Promise.resolve(ok<Category[]>(MOCK_CATEGORIES));
  },

  async getPOSProducts(): Promise<ApiResult<POSProduct[]>> {
    return Promise.resolve(ok<POSProduct[]>(MOCK_INVENTORY.filter(p => p.is_active).map(mockPOSProduct)));
  },

  async getProducts(params?: string): Promise<ApiResult<InventoryProduct[]>> {
    return Promise.resolve(ok<InventoryProduct[]>(MOCK_INVENTORY));
  },

  async bulkCreate(products: Record<string, unknown>[]): Promise<ApiResult<BulkCreateResult>> {
    return Promise.resolve(ok<BulkCreateResult>({ created: products.length, failed: 0, products: MOCK_INVENTORY.slice(0, products.length), errors: [] }));
  },

  async bulkUpload(file: File): Promise<ApiResult<BulkUploadResult>> {
    return Promise.resolve(ok<BulkUploadResult>({ created: 12, failed: 0, errors: [] }));
  },

  async getDetail(id: string): Promise<ApiResult<InventoryProduct>> {
    const product = MOCK_INVENTORY.find(p => p.id === id) ?? MOCK_INVENTORY[0];
    return Promise.resolve(ok<InventoryProduct>(product));
  },

  async update(id: string, payload: Record<string, unknown>): Promise<ApiResult<InventoryProduct>> {
    const product = MOCK_INVENTORY.find(p => p.id === id) ?? MOCK_INVENTORY[0];
    return Promise.resolve(ok<InventoryProduct>({ ...product, ...payload }));
  },

  async delete(id: string): Promise<ApiResult<null>> {
    return Promise.resolve(ok<null>(null));
  },

  async restock(id: string, qty: number, note?: string): Promise<ApiResult<InventoryProduct>> {
    return this.adjustStock(id, qty, note || 'Restock');
  },

  async adjustStock(id: string, quantityChange: number, note: string): Promise<ApiResult<InventoryProduct>> {
    const product = MOCK_INVENTORY.find(p => p.id === id) ?? MOCK_INVENTORY[0];
    return Promise.resolve(ok<InventoryProduct>({ ...product, stock: product.stock + quantityChange }));
  },

  async getAdjustments(id: string): Promise<ApiResult<{ id: string; adjustment_type: string; quantity_change: number; quantity_before: number; quantity_after: number; note: string; performed_by_name: string; created_at: string }[]>> {
    return Promise.resolve(ok([
      { id:'adj-1', adjustment_type:'restock', quantity_change:20, quantity_before:22, quantity_after:42, note:'Weekly restock', performed_by_name:'Hamisi M.', created_at:'2026-05-22T08:00:00Z' },
    ]));
  },
};

// ── Transactions API ───────────────────────────────────────────────────────────

export const transactionApi = {
  async completeSale(payload: CompleteSalePayload): Promise<ApiResult<CompletedTransaction>> {
    const total = payload.items.reduce((s, i) => s + i.qty * 15000, 0);
    const discount = Math.round(total * payload.discount_pct / 100);
    const taxable = total - discount;
    const tax = Math.round(taxable * 0.18);
    const result: CompletedTransaction = {
      id: 'txn-' + Date.now(), txn_number: 'TXN-' + (2044 + Math.floor(Math.random() * 100)),
      payment_method: payload.payment_method, payment_reference: payload.payment_reference ?? '',
      status: 'paid', customer_name: 'Walk-in', customer_phone: '',
      subtotal: total, discount_pct: payload.discount_pct, discount_amount: discount,
      tax_amount: tax, total: taxable + tax, cashier_name: 'Hamisi M.',
      lines: payload.items.map(i => ({ product_name: 'Product', product_sku: 'SKU', qty: i.qty, unit_price: 15000, line_total: i.qty * 15000 })),
      created_at: new Date().toISOString(),
    };
    return Promise.resolve(ok<CompletedTransaction>(result));
  },

  async getRecent(pageSize = 8): Promise<ApiResult<TransactionListItem[]>> {
    return Promise.resolve(ok<TransactionListItem[]>(MOCK_TRANSACTIONS.slice(0, pageSize)));
  },

  async getList(params?: string): Promise<ApiResult<TransactionListItem[]>> {
    return Promise.resolve(ok<TransactionListItem[]>(MOCK_TRANSACTIONS));
  },

  async getDetail(id: string): Promise<ApiResult<TransactionDetail>> {
    const txn = MOCK_TRANSACTIONS.find(t => t.id === id) ?? MOCK_TRANSACTIONS[0];
    const detail: TransactionDetail = {
      ...txn, tax_amount: Math.round(txn.total * 0.18 / 1.18),
      cost_total: txn.total - txn.profit, channel: 'pos',
      store_name: 'Duka Kuu — Kariakoo', store_address: 'Msimbazi St, Kariakoo',
      store_phone: '+255 712 345 678', customer: txn.customer_name !== 'Walk-in' ? txn.customer_name : null,
      notes: '',
      lines: [
        { id:'l1', product:'p1', product_name:'Unga wa Sembe 10kg', product_sku:'UNGA-001', unit_price:28500, unit_cost:22000, qty:1, line_total:28500, line_cost:22000, line_profit:6500 },
        { id:'l2', product:'p3', product_name:'Mafuta ya Cooking 5L', product_sku:'OIL-003', unit_price:34000, unit_cost:28000, qty:1, line_total:34000, line_cost:28000, line_profit:6000 },
      ],
      credit_info: txn.status === 'credit' ? {
        tab_id:'tab-1', tab_status:'open', amount:txn.total, amount_paid:0, balance:txn.total,
        due_date:'2026-06-24', is_overdue:false, payments:[],
      } : null,
    };
    return Promise.resolve(ok<TransactionDetail>(detail));
  },

  async refund(id: string, reason?: string): Promise<ApiResult<TransactionDetail>> {
    const txn = MOCK_TRANSACTIONS.find(t => t.id === id) ?? MOCK_TRANSACTIONS[0];
    return this.getDetail(txn.id);
  },

  async attachCustomer(id: string, customerId: string): Promise<ApiResult<TransactionDetail>> {
    const txn = MOCK_TRANSACTIONS.find(t => t.id === id) ?? MOCK_TRANSACTIONS[0];
    return this.getDetail(txn.id);
  },

  async emailReceipt(id: string, email?: string): Promise<ApiResult<null>> {
    return Promise.resolve(ok<null>(null));
  },
};

// ── Credits API ────────────────────────────────────────────────────────────────

export interface SendReminderResult {
  id: string;
  channel: string;
  direction: string;
  body: string;
  sent_by_name: string;
  created_at: string;
  sms_sent?: boolean;
  sms_error?: string;
  sms_credits_used?: number;
}

export const creditsApi = {
  async getDashboard(params?: string): Promise<ApiResult<CreditsDashboard>> {
    return Promise.resolve(ok<CreditsDashboard>(MOCK_CREDITS_DASHBOARD));
  },

  async getCustomerProfile(customerId: string): Promise<ApiResult<CreditCustomerProfile>> {
    const cust = MOCK_CREDIT_CUSTOMERS.find(c => c.id === customerId) ?? MOCK_CREDIT_CUSTOMERS[0];
    return Promise.resolve(ok<CreditCustomerProfile>({
      customer: {
        id: cust.id, name: cust.name, phone: cust.phone, avatar_hue: cust.avatar_hue,
        initials: cust.initials, segment: cust.segment, open_credit: cust.balance,
        total_spent: 1842000, avg_ticket: 27088, last_visit: '2026-05-20',
      },
      tabs: [{ id:'tab-1', txn_number:'TXN-2039', amount:84200, amount_paid:0, balance:84200, status:'open', due_date:'2026-05-30', is_overdue:false, created_at:'2026-05-20T10:00:00Z' }],
      payments: [{ id:'pay-1', amount:20000, method:'M-Pesa', reference:'QGT5K3M21', cashier_name:'Hamisi M.', note:'Partial', created_at:'2026-05-13T14:00:00Z' }],
      messages: [{ id:'msg-1', channel:'whatsapp', direction:'out', body:'Habari, hii ni kumbusho la deni.', sent_by_name:'auto-reminder', created_at:'2026-05-21T09:00:00Z' }],
      notes: [{ id:'note-1', body:'Customer pays end of month. Reliable.', author_name:'Hamisi M.', created_at:'2026-05-13T14:00:00Z' }],
    }));
  },

  async recordPayment(customerId: string, payload: { amount: number; method: string; reference?: string; note?: string }): Promise<ApiResult<unknown>> {
    return Promise.resolve(ok({ id: 'pay-' + Date.now(), ...payload }));
  },

  async sendReminder(customerId: string, payload: { kind: 'sms' | 'whatsapp' | 'call'; body: string; direction?: 'in' | 'out' }): Promise<ApiResult<SendReminderResult>> {
    return Promise.resolve(ok<SendReminderResult>({
      id: 'msg-' + Date.now(), channel: payload.kind, direction: payload.direction ?? 'out',
      body: payload.body, sent_by_name: 'Hamisi M.', created_at: new Date().toISOString(),
      sms_sent: payload.kind === 'sms', sms_credits_used: payload.kind === 'sms' ? 1 : undefined,
    }));
  },

  async issueCredit(customerId: string, payload: { amount: number; due_date?: string; note?: string }): Promise<ApiResult<unknown>> {
    return Promise.resolve(ok({ id: 'tab-' + Date.now(), amount: payload.amount }));
  },

  async sendAllReminders(body?: string): Promise<ApiResult<{ sent: number; failed: number; total_amount: number; errors: { customer: string; error: string }[] }>> {
    return Promise.resolve(ok({ sent: 4, failed: 1, total_amount: 230000, errors: [{ customer:'Asha Mwinyi', error:'Invalid phone number' }] }));
  },

  async draftReminder(tone: 'friendly' | 'firm' | 'final_notice' = 'friendly'): Promise<ApiResult<{ draft: string; customers_with_credit: number; total_outstanding: number; overdue_count: number }>> {
    const drafts: Record<string, string> = {
      friendly: 'Habari! Ukumbusho wa deni lako la TZS 230,000. Tafadhali lipa kabla ya tarehe iliyopitwa.',
      firm: 'Tafadhali lipa deni lako la TZS 230,000 lililopita muda. Ongea nasi ili kupata mpango wa malipo.',
      final_notice: 'TAARIFA YA MWISHO: Deni lako la TZS 230,000 limepitwa muda. Lipa siku 7 au hatua za kisheria zitachukuliwa.',
    };
    return Promise.resolve(ok({ draft: drafts[tone], customers_with_credit: 5, total_outstanding: 230000, overdue_count: 2 }));
  },
};

// ── Notebook API ───────────────────────────────────────────────────────────────

export const notebookApi = {
  async getNotes(params?: string): Promise<ApiResult<Note[]>> {
    return Promise.resolve(ok<Note[]>(MOCK_NOTES));
  },
  async createNote(payload: { title: string; content: string; tags: string[] }): Promise<ApiResult<Note>> {
    const note: Note = {
      id: 'n-' + Date.now(), title: payload.title, content: payload.content,
      tags: payload.tags, date_label: 'Just now', created_by_name: 'Hamisi M.',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    return Promise.resolve(ok<Note>(note));
  },
  async updateNote(id: string, payload: Partial<{ title: string; content: string; tags: string[] }>): Promise<ApiResult<Note>> {
    const note = MOCK_NOTES.find(n => n.id === id) ?? MOCK_NOTES[0];
    return Promise.resolve(ok<Note>({ ...note, ...payload, updated_at: new Date().toISOString() }));
  },
  async deleteNote(id: string): Promise<ApiResult<unknown>> {
    return Promise.resolve(ok(null));
  },
};

// ── Stores API ─────────────────────────────────────────────────────────────────

export const storesApi = {
  async getList(): Promise<ApiResult<StoreItem[]>> {
    return Promise.resolve(ok<StoreItem[]>(MOCK_STORES));
  },
  async getStats(): Promise<ApiResult<StoreStats>> {
    return Promise.resolve(ok<StoreStats>({
      total_stores: 3, open_count: 2, closed_count: 1, paused_count: 0,
      total_revenue: 3442000, total_txns: 164, staff_on_duty: 9,
    }));
  },
  async getDetail(id: string): Promise<ApiResult<StoreDetail>> {
    const store = MOCK_STORES.find(s => s.id === id) ?? MOCK_STORES[0];
    return Promise.resolve(ok<StoreDetail>({
      ...store, address: 'Msimbazi St, Kariakoo, Dar es Salaam', phone: '+255 712 345 678',
      week_breakdown: [
        { date:'2026-05-20', revenue:3580000, txn_count:178 },
        { date:'2026-05-21', revenue:2750000, txn_count:138 },
        { date:'2026-05-22', revenue:3120000, txn_count:155 },
        { date:'2026-05-23', revenue:2890000, txn_count:142 },
        { date:'2026-05-24', revenue:1842000, txn_count:87 },
      ],
      staff_roster: [
        { id:'st1', name:'Hamisi Mwakapaga', role:'Manager', phone:'+255 712 345 678', on_duty:true },
        { id:'st2', name:'Amani Msongo', role:'Cashier', phone:'+255 713 456 789', on_duty:true },
        { id:'st3', name:'Pendo Kilimba', role:'Cashier', phone:'+255 714 567 890', on_duty:false },
      ],
    }));
  },
  async patch(id: string, data: Partial<StoreItem>): Promise<ApiResult<StoreItem>> {
    const store = MOCK_STORES.find(s => s.id === id) ?? MOCK_STORES[0];
    return Promise.resolve(ok<StoreItem>({ ...store, ...data }));
  },
  async create(data: { name: string; address?: string; phone?: string }): Promise<ApiResult<StoreItem>> {
    return Promise.resolve(ok<StoreItem>({
      id: 'store-' + Date.now(), name: data.name, region: 'Dar es Salaam',
      status: 'open', organisation_name: 'Duka Kuu Ltd', staff_count: 0,
      manager_name: null, today_revenue: 0, today_txns: 0, staff_on_duty: 0,
      week_data: [0,0,0,0,0,0,0], vat_enabled: false,
    }));
  },
};

// ── Customer directory API ─────────────────────────────────────────────────────

export const customerApi = {
  async getList(params?: string): Promise<ApiResult<CustomerListItem[]>> {
    return Promise.resolve(ok<CustomerListItem[]>(MOCK_CUSTOMERS));
  },
  async getDetail(id: string): Promise<ApiResult<CustomerListItem>> {
    const cust = MOCK_CUSTOMERS.find(c => c.id === id) ?? MOCK_CUSTOMERS[0];
    return Promise.resolve(ok<CustomerListItem>(cust));
  },
  async getSummary(): Promise<ApiResult<CustomerSummary>> {
    return Promise.resolve(ok<CustomerSummary>(MOCK_CUSTOMER_SUMMARY));
  },
  async create(payload: Record<string, unknown>): Promise<ApiResult<CustomerListItem>> {
    return Promise.resolve(ok<CustomerListItem>({
      id: 'c-' + Date.now(), name: String(payload.name ?? ''), phone: String(payload.phone ?? ''),
      email: String(payload.email ?? ''), avatar_hue: Math.floor(Math.random() * 360),
      initials: String(payload.name ?? 'XX').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
      segment: 'New', total_spent: 0, last_visit: null, avg_ticket: 0,
      open_credit: 0, has_open_credit: false, credit_limit: null,
      notes: '', is_active: true, created_at: new Date().toISOString(),
    }));
  },
  async update(id: string, payload: Record<string, unknown>): Promise<ApiResult<CustomerListItem>> {
    const cust = MOCK_CUSTOMERS.find(c => c.id === id) ?? MOCK_CUSTOMERS[0];
    return Promise.resolve(ok<CustomerListItem>({ ...cust, ...payload } as CustomerListItem));
  },
  async sendSms(id: string, message: string): Promise<ApiResult<{ message_id: string; status: string; credits_used: number }>> {
    return Promise.resolve(ok({ message_id: 'sms-' + Date.now(), status: 'sent', credits_used: 1 }));
  },
};

// ── Supplier API ───────────────────────────────────────────────────────────────

export const supplierApi = {
  async getList(params?: string): Promise<ApiResult<SupplierListItem[]>> {
    return Promise.resolve(ok<SupplierListItem[]>(MOCK_SUPPLIERS));
  },
  async getDetail(id: string): Promise<ApiResult<SupplierListItem>> {
    const s = MOCK_SUPPLIERS.find(s => s.id === id) ?? MOCK_SUPPLIERS[0];
    return Promise.resolve(ok<SupplierListItem>(s));
  },
  async getStats(): Promise<ApiResult<SupplierStats>> {
    return Promise.resolve(ok<SupplierStats>(MOCK_SUPPLIER_STATS));
  },
};

// ── Staff API ──────────────────────────────────────────────────────────────────

export const staffApi = {
  async getList(params?: string): Promise<ApiResult<StaffMember[]>> {
    return Promise.resolve(ok<StaffMember[]>(MOCK_STAFF));
  },
  async getDetail(id: string): Promise<ApiResult<StaffMember>> {
    const s = MOCK_STAFF.find(s => s.id === id) ?? MOCK_STAFF[0];
    return Promise.resolve(ok<StaffMember>(s));
  },
  async getKPIs(): Promise<ApiResult<StaffKPIs>> {
    return Promise.resolve(ok<StaffKPIs>(MOCK_STAFF_KPIS));
  },
  async updatePermissions(id: string, payload: { can_refund?: boolean; can_discount?: boolean; can_view_reports?: boolean }): Promise<ApiResult<StaffMember>> {
    const s = MOCK_STAFF.find(s => s.id === id) ?? MOCK_STAFF[0];
    return Promise.resolve(ok<StaffMember>({ ...s, ...payload }));
  },
  async create(payload: {
    first_name: string; last_name: string; phone: string; email?: string;
    role: string; shift: string; pin?: string;
    can_refund?: boolean; can_discount?: boolean; can_view_reports?: boolean;
  }): Promise<ApiResult<StaffMember>> {
    return Promise.resolve(ok<StaffMember>({
      id: 'st-' + Date.now(),
      full_name: `${payload.first_name} ${payload.last_name}`,
      initials: `${payload.first_name[0]}${payload.last_name[0]}`.toUpperCase(),
      phone: payload.phone, email: payload.email ?? '',
      role: payload.role, avatar_hue: Math.floor(Math.random() * 360),
      shift: payload.shift, shift_display: payload.shift === 'morning' ? '7AM - 2PM' : '2PM - 9PM',
      employment_status: 'full_time', can_refund: payload.can_refund ?? false,
      can_discount: payload.can_discount ?? false, can_view_reports: payload.can_view_reports ?? false,
      is_active: true, sales_today: 0, txns_today: 0, total_sales: 0,
      avg_ticket: 0, txns_total: 0, store_name: 'Duka Kuu — Kariakoo',
    }));
  },
};

// ── Discounts API ──────────────────────────────────────────────────────────────

export const discountApi = {
  async getSummary(params?: string): Promise<ApiResult<DiscountSummary>> {
    return Promise.resolve(ok<DiscountSummary>(MOCK_DISCOUNT_SUMMARY));
  },
};

// ── Analytics API ──────────────────────────────────────────────────────────────

export const analyticsApi = {
  async getDashboard(params?: string): Promise<ApiResult<DashboardData>> {
    return Promise.resolve(ok<DashboardData>(MOCK_DASHBOARD));
  },
  async getOverview(params?: string): Promise<ApiResult<AnalyticsOverview>> {
    return Promise.resolve(ok<AnalyticsOverview>(MOCK_ANALYTICS_OVERVIEW));
  },
  async getProducts(params?: string): Promise<ApiResult<AnalyticsProductsResponse>> {
    return Promise.resolve(ok<AnalyticsProductsResponse>(MOCK_ANALYTICS_PRODUCTS));
  },
  async getSales(params?: string): Promise<ApiResult<SalesAnalytics>> {
    return Promise.resolve(ok<SalesAnalytics>(MOCK_SALES_ANALYTICS));
  },
  async getCustomers(params?: string): Promise<ApiResult<CustomerAnalytics>> {
    return Promise.resolve(ok<CustomerAnalytics>(MOCK_CUSTOMER_ANALYTICS));
  },
  async getCashflow(params?: string): Promise<ApiResult<CashflowAnalytics>> {
    return Promise.resolve(ok<CashflowAnalytics>(MOCK_CASHFLOW));
  },
};

// ── Expense API ───────────────────────────────────────────────────────────────

export const expenseApi = {
  async getList(params?: string): Promise<ApiResult<ExpenseItem[]>> {
    return Promise.resolve(ok<ExpenseItem[]>(MOCK_EXPENSES));
  },
  async getDetail(id: string): Promise<ApiResult<ExpenseItem>> {
    const e = MOCK_EXPENSES.find(e => e.id === id) ?? MOCK_EXPENSES[0];
    return Promise.resolve(ok<ExpenseItem>(e));
  },
  async create(payload: {
    title: string; category: string; amount: number; payment_method: string;
    payment_reference?: string; notes?: string; receipt_url?: string;
  }): Promise<ApiResult<ExpenseItem>> {
    return Promise.resolve(ok<ExpenseItem>({
      id: 'ex-' + Date.now(), ...payload, payment_reference: payload.payment_reference ?? '',
      notes: payload.notes ?? '', receipt_url: payload.receipt_url ?? null,
      recorded_by_name: 'Hamisi M.', created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  },
  async update(id: string, payload: Partial<{
    title: string; category: string; amount: number;
    payment_method: string; payment_reference: string; notes: string;
  }>): Promise<ApiResult<ExpenseItem>> {
    const e = MOCK_EXPENSES.find(e => e.id === id) ?? MOCK_EXPENSES[0];
    return Promise.resolve(ok<ExpenseItem>({ ...e, ...payload, updated_at: new Date().toISOString() }));
  },
  async delete(id: string): Promise<ApiResult<null>> {
    return Promise.resolve(ok<null>(null));
  },
  async getSummary(params?: string): Promise<ApiResult<ExpenseSummary>> {
    return Promise.resolve(ok<ExpenseSummary>(MOCK_EXPENSE_SUMMARY));
  },
};

// ── AI API ─────────────────────────────────────────────────────────────────────

export const aiApi = {
  async getConversations(): Promise<ApiResult<AIConversationListItem[]>> {
    return Promise.resolve(ok<AIConversationListItem[]>(MOCK_AI_CONVERSATIONS));
  },
  async getConversation(id: string): Promise<ApiResult<AIConversationDetail>> {
    const conv = MOCK_AI_CONVERSATIONS.find(c => c.id === id) ?? MOCK_AI_CONVERSATIONS[0];
    return Promise.resolve(ok<AIConversationDetail>({
      ...conv,
      messages: [
        { id:'m1', role:'user', content:'Analyze my sales trends for May 2026', model_used:'', prompt_tokens:0, completion_tokens:0, sources:[], created_at:'2026-05-24T10:00:00Z' },
        { id:'m2', role:'assistant', content:'Your sales for May show a positive trend. Revenue is up 8.2% compared to April, with 164 transactions today. Top products are cooking oil, flour, and rice. M-Pesa accounts for 50% of payments. Consider restocking OMO soap which is running low at 3 units.', model_used:'gpt-4o', prompt_tokens:120, completion_tokens:95, sources:['analytics','inventory'], created_at:'2026-05-24T10:00:15Z' },
      ],
    }));
  },
  async startChat(message: string, title?: string): Promise<ApiResult<{ conversation_id: string; message: AIMessage }>> {
    return Promise.resolve(ok({
      conversation_id: 'ai-' + Date.now(),
      message: { id:'m-' + Date.now(), role:'assistant' as const, content:'I can help you analyze your business data. What would you like to know?', model_used:'gpt-4o', prompt_tokens:50, completion_tokens:25, sources:['analytics'], created_at: new Date().toISOString() },
    }));
  },
  async continueChat(conversationId: string, message: string): Promise<ApiResult<{ message: AIMessage }>> {
    return Promise.resolve(ok({
      message: { id:'m-' + Date.now(), role:'assistant' as const, content:'Based on your data, I recommend focusing on restocking low-stock items and following up with overdue credit customers.', model_used:'gpt-4o', prompt_tokens:80, completion_tokens:45, sources:['inventory','credits'], created_at: new Date().toISOString() },
    }));
  },
  async renameConversation(id: string, title: string): Promise<ApiResult<AIConversationListItem>> {
    const conv = MOCK_AI_CONVERSATIONS.find(c => c.id === id) ?? MOCK_AI_CONVERSATIONS[0];
    return Promise.resolve(ok<AIConversationListItem>({ ...conv, title }));
  },
  async archiveConversation(id: string): Promise<ApiResult<AIConversationListItem>> {
    const conv = MOCK_AI_CONVERSATIONS.find(c => c.id === id) ?? MOCK_AI_CONVERSATIONS[0];
    return Promise.resolve(ok<AIConversationListItem>({ ...conv, is_active: false }));
  },
  async getSuggestions(): Promise<ApiResult<{ suggestions: AISuggestion[]; ai_credits: AICreditsStatus }>> {
    return Promise.resolve(ok({ suggestions: MOCK_AI_SUGGESTIONS, ai_credits: MOCK_AI_CREDITS }));
  },
  async getUsage(): Promise<ApiResult<AIUsage>> {
    return Promise.resolve(ok<AIUsage>({
      totals: { messages: 48, prompt_tokens: 5200, completion_tokens: 3800 },
      this_month: { messages: 12, prompt_tokens: 1350, completion_tokens: 980 },
      recent: [
        { id:'u1', conversation_title:'Sales analysis for May', model_used:'gpt-4o', prompt_tokens:120, completion_tokens:95, created_at:'2026-05-24T10:00:00Z' },
        { id:'u2', conversation_title:'Inventory restock suggestions', model_used:'gpt-4o', prompt_tokens:280, completion_tokens:190, created_at:'2026-05-23T14:00:00Z' },
      ],
      ai_credits: MOCK_AI_CREDITS, ngamia_configured: false,
    }));
  },
};

// ── Reports API ───────────────────────────────────────────────────────────────

export const reportsApi = {
  async getTypes(): Promise<ApiResult<{ report_types: ReportType[] }>> {
    return Promise.resolve(ok({ report_types: MOCK_REPORT_TYPES }));
  },

  async generateCSV(reportType: string, params: { range?: string; dateFrom?: string; dateTo?: string }): Promise<boolean> {
    // In mock mode, generate a dummy CSV blob and trigger download
    const headers = ['Date', 'Revenue', 'Transactions', 'Profit'];
    const rows = [
      ['2026-05-24', '3442000', '164', '892000'],
      ['2026-05-23', '2890000', '142', '756000'],
      ['2026-05-22', '3120000', '155', '812000'],
    ];
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${reportType}-report.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  },

  async generateJSON(reportType: string, range: string): Promise<ApiResult<{ report_type: string; period_label: string; date_from: string; date_to: string; store_name: string; report_name: string; report: Record<string, unknown> }>> {
    return Promise.resolve(ok({
      report_type: reportType, period_label: 'This week', date_from: '2026-05-18', date_to: '2026-05-24',
      store_name: 'Duka Kuu — Kariakoo', report_name: `${reportType} Report`,
      report: { summary: 'Mock report data', total_revenue: 3442000 },
    }));
  },

  async getHistory(params?: string): Promise<ApiResult<{ exports: ReportExportEntry[]; total: number }>> {
    return Promise.resolve(ok({ exports: MOCK_REPORT_EXPORTS, total: MOCK_REPORT_EXPORTS.length }));
  },

  async downloadExport(exportId: string, format: string): Promise<boolean> {
    return true;
  },

  async getScheduled(): Promise<ApiResult<{ scheduled_reports: ScheduledReportEntry[]; total: number; active_count: number }>> {
    return Promise.resolve(ok({
      scheduled_reports: MOCK_SCHEDULED_REPORTS, total: MOCK_SCHEDULED_REPORTS.length,
      active_count: MOCK_SCHEDULED_REPORTS.filter(r => r.is_enabled).length,
    }));
  },

  async createScheduled(data: { report_type: string; name: string; frequency: string; date_range_preset: string; recipients: string[]; is_enabled: boolean }): Promise<ApiResult<ScheduledReportEntry>> {
    return Promise.resolve(ok<ScheduledReportEntry>({
      id: 'sr-' + Date.now(), ...data,
      frequency: data.frequency as ScheduledReportEntry['frequency'],
      last_sent_at: null, next_send_at: null, recipient_count: data.recipients.length,
      created_at: new Date().toISOString(),
    }));
  },

  async patchScheduled(id: string, data: Partial<ScheduledReportEntry>): Promise<ApiResult<ScheduledReportEntry>> {
    const sr = MOCK_SCHEDULED_REPORTS.find(r => r.id === id) ?? MOCK_SCHEDULED_REPORTS[0];
    return Promise.resolve(ok<ScheduledReportEntry>({ ...sr, ...data }));
  },

  async deleteScheduled(id: string): Promise<ApiResult<null>> {
    return Promise.resolve(ok<null>(null));
  },

  async sendScheduledNow(id: string): Promise<ApiResult<{ sent: number; failed: number; recipients: string[] }>> {
    return Promise.resolve(ok({ sent: 2, failed: 0, recipients: ['hamisi@ziadapos.com'] }));
  },
};

// ── Tanzania constants (mirrored from backend) ─────────────────────────────────

export const TANZANIA_REGIONS = [
  'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera',
  'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara',
  'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North',
  'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu',
  'Singida', 'Songwe', 'Tabora', 'Tanga', 'Unguja North', 'Unguja South',
  'Unguja West',
] as const;

export const BUSINESS_TYPES = [
  { value: 'retail',    label: 'Retail Shop (Duka la Rejareja)' },
  { value: 'wholesale', label: 'Wholesale (Jumla)' },
  { value: 'pharmacy',  label: 'Pharmacy (Duka la Dawa)' },
] as const;
