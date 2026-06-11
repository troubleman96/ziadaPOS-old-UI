/**
 * lib/api.ts
 *
 * Typed API client for the Ziada POS Django backend.
 * Base URL is read from NEXT_PUBLIC_API_URL (default: http://localhost:8000).
 *
 * Auth flow:
 *   POST /api/v1/auth/register/  → create org + store + owner + trial subscription
 *   POST /api/v1/auth/login/     → phone + password → JWT tokens + user profile
 *   POST /api/v1/auth/refresh/   → { refresh } → { access }
 *   GET  /api/v1/accounts/me/    → current user profile + subscription
 */

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

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
  store: number | null;
}

export interface Organisation {
  id: string;
  name: string;
  business_type: string;
  region: string;
  plan: string;
  max_stores: number;
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

// ── Core fetch helper ──────────────────────────────────────────────────────────

async function rawFetch<T>(
  path: string,
  options: RequestInit,
  accessToken?: string,
): Promise<{ res: Response; json: unknown } | { networkError: true }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const json = await res.json();
    return { res, json };
  } catch {
    return { networkError: true };
  }
}

let tokenRefreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (tokenRefreshPromise) return tokenRefreshPromise;

  tokenRefreshPromise = (async () => {
    const { getRefreshToken, saveTokens, clearTokens } = await import('./auth');
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!refreshRes.ok) {
      clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
      return null;
    }

    // Simple JWT returns { access, refresh } directly (not wrapped).
    const refreshJson = await refreshRes.json() as { access?: string; refresh?: string };
    const newAccess  = refreshJson.access;
    const newRefresh = refreshJson.refresh ?? refreshToken;
    if (!newAccess) return null;

    saveTokens(newAccess, newRefresh);
    return newAccess;
  })().finally(() => {
    tokenRefreshPromise = null;
  });

  return tokenRefreshPromise;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<ApiResult<T>> {
  const tokenForRequest = accessToken;
  let result = await rawFetch<T>(path, options, tokenForRequest ?? undefined);

  // ── Auto-refresh on 401 ────────────────────────────────────────────────────
  // If the access token expired, try the refresh token once, then retry.
  if ('res' in result && result.res.status === 401 && tokenForRequest) {
    try {
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        // Retry the original request with the new access token.
        result = await rawFetch<T>(path, options, newAccess);
      } else {
        return { success: false, status: 401, message: 'Session expired. Please sign in again.' };
      }
    } catch {
      // Refresh attempt failed silently — fall through to return the 401
    }
  }

  if ('networkError' in result) {
    return { success: false, message: 'Network error. Please check your connection.' };
  }

  const { res, json } = result as { res: Response; json: unknown };
  const body = json as Record<string, unknown>;

  if (!res.ok) {
    return {
      success: false,
      status: res.status,
      message: (body.message ?? body.detail ?? 'Request failed.') as string,
      errors: body.errors as Record<string, string[]> | undefined,
    };
  }

  return { success: true, message: (body.message ?? '') as string, data: body.data as T };
}

async function getUsableAccessToken(): Promise<string | null> {
  const { getAccessToken, getRefreshToken, tokenIsExpired } = await import('./auth');
  const accessToken = getAccessToken();
  if (accessToken && !tokenIsExpired(accessToken)) return accessToken;
  if (!getRefreshToken()) return accessToken;
  return refreshAccessToken();
}

// ── Auth endpoints ─────────────────────────────────────────────────────────────

export const authApi = {
  register(payload: RegisterPayload) {
    return apiFetch<RegisterResponse>('/api/v1/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login(payload: LoginPayload) {
    return apiFetch<LoginResponse>('/api/v1/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  refresh(refreshToken: string) {
    return apiFetch<{ access: string }>('/api/v1/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },

  async me(accessToken?: string) {
    return apiFetch<MeResponse>('/api/v1/accounts/me/', {}, accessToken ?? await getUsableAccessToken() ?? undefined);
  },

  async mySubscription(accessToken?: string) {
    return apiFetch<SubscriptionInfo>('/api/v1/subscriptions/my-subscription/', {}, accessToken ?? await getUsableAccessToken() ?? undefined);
  },
};

// ── Inventory API ──────────────────────────────────────────────────────────────

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

// Minimal product shape returned by ?minimal=true — used on POS
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

// Full product shape for inventory list
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

export const inventoryApi = {
  async getCategories(): Promise<ApiResult<Category[]>> {
    const token = await getUsableAccessToken();
    return apiFetch<Category[]>('/api/v1/inventory/categories/', {}, token ?? undefined);
  },

  async getPOSProducts(): Promise<ApiResult<POSProduct[]>> {
    const token = await getUsableAccessToken();
    return apiFetch<POSProduct[]>(
      '/api/v1/inventory/products/?is_active=true&minimal=true',
      {},
      token ?? undefined,
    );
  },

  async getProducts(params?: string): Promise<ApiResult<InventoryProduct[]>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<InventoryProduct[]>(
      `/api/v1/inventory/products/${qs}`,
      {},
      token ?? undefined,
    );
  },

  async bulkCreate(products: Record<string, unknown>[]): Promise<ApiResult<BulkCreateResult>> {
    const token = await getUsableAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/inventory/products/bulk-create/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(products.map(({ image: _i, imageFile: _f, imagePreview: _p, ...rest }) => rest)),
      });
      const json = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          message: (json.message ?? json.detail ?? 'Bulk create failed.') as string,
        };
      }
      return { success: true, message: (json.message ?? '') as string, data: json.data as BulkCreateResult };
    } catch {
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  async bulkUpload(file: File): Promise<ApiResult<BulkUploadResult>> {
    const token = await getUsableAccessToken();
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/inventory/products/bulk-upload/`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const json = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          message: (json.message ?? json.detail ?? 'Upload failed.') as string,
          errors: json.errors as Record<string, string[]> | undefined,
        };
      }
      return { success: true, message: (json.message ?? '') as string, data: json.data as BulkUploadResult };
    } catch {
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  async getDetail(id: string): Promise<ApiResult<InventoryProduct>> {
    const token = await getUsableAccessToken();
    return apiFetch<InventoryProduct>(`/api/v1/inventory/products/${id}/`, {}, token ?? undefined);
  },

  async update(id: string, payload: Record<string, unknown>): Promise<ApiResult<InventoryProduct>> {
    const token = await getUsableAccessToken();
    return apiFetch<InventoryProduct>(`/api/v1/inventory/products/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }, token ?? undefined);
  },

  async delete(id: string): Promise<ApiResult<null>> {
    const token = await getUsableAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/inventory/products/${id}/`, { method: 'DELETE', headers });
      if (res.status === 204 || res.ok) return { success: true, message: 'Product deleted.', data: null };
      const json = await res.json() as Record<string, unknown>;
      return { success: false, status: res.status, message: (json.message ?? json.detail ?? 'Delete failed.') as string };
    } catch {
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  async restock(id: string, qty: number, note?: string): Promise<ApiResult<InventoryProduct>> {
    const token = await getUsableAccessToken();
    return apiFetch<InventoryProduct>(`/api/v1/inventory/products/${id}/restock/`, { method: 'POST', body: JSON.stringify({ qty, note }) }, token ?? undefined);
  },
};

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
  revenue_delta_pct: number | null;
  transaction_delta_pct: number | null;
}

export interface DashboardData {
  kpis_today:   DashboardKPIs;
  hourly_today: { hour: number; label: string; revenue: number; profit: number; discount_amount: number; credit_amount: number; txn_count: number }[];
  payment_mix:  { method: string; amount: number; pct: number }[];
  top_products: { product_id: string; product_name: string; product_sku: string; qty_sold: number; revenue: number; profit: number }[];
  low_stock:    { id: string; name: string; sku: string; stock: number; min_stock: number; status: string }[];
  credit_kpi:   { total: number; customer_count: number; overdue_count: number };
}

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

// ── Analytics products types ──────────────────────────────────────────────────

export interface AnalyticsProduct {
  product_id: string;
  product_name: string;
  product_sku: string;
  category_name: string;
  qty_sold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin_pct: number;
}

// ── Transactions API ───────────────────────────────────────────────────────────

export const transactionApi = {
  async completeSale(payload: CompleteSalePayload): Promise<ApiResult<CompletedTransaction>> {
    const token = await getUsableAccessToken();
    return apiFetch<CompletedTransaction>(
      '/api/v1/transactions/complete-sale/',
      { method: 'POST', body: JSON.stringify(payload) },
      token ?? undefined,
    );
  },

  async getRecent(pageSize = 8): Promise<ApiResult<TransactionListItem[]>> {
    const token = await getUsableAccessToken();
    return apiFetch<TransactionListItem[]>(
      `/api/v1/transactions/?page_size=${pageSize}&ordering=-created_at`,
      {},
      token ?? undefined,
    );
  },

  async getList(params?: string): Promise<ApiResult<TransactionListItem[]>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<TransactionListItem[]>(`/api/v1/transactions/${qs}`, {}, token ?? undefined);
  },

  async getDetail(id: string): Promise<ApiResult<TransactionDetail>> {
    const token = await getUsableAccessToken();
    return apiFetch<TransactionDetail>(`/api/v1/transactions/${id}/`, {}, token ?? undefined);
  },
};

// ── Credits API ────────────────────────────────────────────────────────────────

export const creditsApi = {
  async getDashboard(params?: string): Promise<ApiResult<CreditsDashboard>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<CreditsDashboard>(`/api/v1/credits/${qs}`, {}, token ?? undefined);
  },

  async getCustomerProfile(customerId: string): Promise<ApiResult<CreditCustomerProfile>> {
    const token = await getUsableAccessToken();
    return apiFetch<CreditCustomerProfile>(`/api/v1/credits/customers/${customerId}/`, {}, token ?? undefined);
  },

  async recordPayment(customerId: string, payload: { amount: number; method: string; reference?: string; note?: string }): Promise<ApiResult<unknown>> {
    const token = await getUsableAccessToken();
    return apiFetch(`/api/v1/credits/customers/${customerId}/record-payment/`, { method: 'POST', body: JSON.stringify(payload) }, token ?? undefined);
  },
};

// ── Notebook API ───────────────────────────────────────────────────────────────

export const notebookApi = {
  async getNotes(params?: string): Promise<ApiResult<Note[]>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<Note[]>(`/api/v1/notebook/${qs}`, {}, token ?? undefined);
  },

  async createNote(payload: { title: string; content: string; tags: string[] }): Promise<ApiResult<Note>> {
    const token = await getUsableAccessToken();
    return apiFetch<Note>('/api/v1/notebook/', { method: 'POST', body: JSON.stringify(payload) }, token ?? undefined);
  },

  async updateNote(id: string, payload: Partial<{ title: string; content: string; tags: string[] }>): Promise<ApiResult<Note>> {
    const token = await getUsableAccessToken();
    return apiFetch<Note>(`/api/v1/notebook/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }, token ?? undefined);
  },

  async deleteNote(id: string): Promise<ApiResult<unknown>> {
    const token = await getUsableAccessToken();
    return apiFetch(`/api/v1/notebook/${id}/`, { method: 'DELETE' }, token ?? undefined);
  },
};

// ── Stores API ─────────────────────────────────────────────────────────────────

export const storesApi = {
  async getList(): Promise<ApiResult<StoreItem[]>> {
    const token = await getUsableAccessToken();
    return apiFetch<StoreItem[]>('/api/v1/stores/', {}, token ?? undefined);
  },

  async getStats(): Promise<ApiResult<StoreStats>> {
    const token = await getUsableAccessToken();
    return apiFetch<StoreStats>('/api/v1/stores/stats/', {}, token ?? undefined);
  },

  async getDetail(id: string): Promise<ApiResult<StoreDetail>> {
    const token = await getUsableAccessToken();
    return apiFetch<StoreDetail>(`/api/v1/stores/${id}/`, {}, token ?? undefined);
  },
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

// ── Discount summary types ─────────────────────────────────────────────────────

export interface DiscountSummary {
  total_discount_amount: number; discounted_count: number;
  total_transactions: number; discount_rate: number;
  avg_discount_pct: number; avg_discount_amount: number;
  by_cashier: { cashier_name: string; amount: number; count: number; avg_pct: number }[];
  by_day: { day: string; amount: number; count: number }[];
  largest_discounts: { txn_number: string; customer_name: string; discount_amount: number; discount_pct: number; total: number; created_at: string }[];
}

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
  top_customers: { customer_id: string; customer_name: string; total_spent: number; txn_count: number; avg_ticket: number; segment: string }[];
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

// ── Customer directory API ─────────────────────────────────────────────────────

export const customerApi = {
  async getList(params?: string): Promise<ApiResult<CustomerListItem[]>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<CustomerListItem[]>(`/api/v1/customers/${qs}`, {}, token ?? undefined);
  },
  async getDetail(id: string): Promise<ApiResult<CustomerListItem>> {
    const token = await getUsableAccessToken();
    return apiFetch<CustomerListItem>(`/api/v1/customers/${id}/`, {}, token ?? undefined);
  },
  async getSummary(): Promise<ApiResult<CustomerSummary>> {
    const token = await getUsableAccessToken();
    return apiFetch<CustomerSummary>('/api/v1/customers/summary/', {}, token ?? undefined);
  },
  async create(payload: Record<string, unknown>): Promise<ApiResult<CustomerListItem>> {
    const token = await getUsableAccessToken();
    return apiFetch<CustomerListItem>('/api/v1/customers/', { method: 'POST', body: JSON.stringify(payload) }, token ?? undefined);
  },
  async update(id: string, payload: Record<string, unknown>): Promise<ApiResult<CustomerListItem>> {
    const token = await getUsableAccessToken();
    return apiFetch<CustomerListItem>(`/api/v1/customers/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }, token ?? undefined);
  },
};

// ── Supplier API ───────────────────────────────────────────────────────────────

export const supplierApi = {
  async getList(params?: string): Promise<ApiResult<SupplierListItem[]>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<SupplierListItem[]>(`/api/v1/suppliers/${qs}`, {}, token ?? undefined);
  },
  async getDetail(id: string): Promise<ApiResult<SupplierListItem>> {
    const token = await getUsableAccessToken();
    return apiFetch<SupplierListItem>(`/api/v1/suppliers/${id}/`, {}, token ?? undefined);
  },
  async getStats(): Promise<ApiResult<SupplierStats>> {
    const token = await getUsableAccessToken();
    return apiFetch<SupplierStats>('/api/v1/suppliers/stats/', {}, token ?? undefined);
  },
};

// ── Staff API ──────────────────────────────────────────────────────────────────

export const staffApi = {
  async getList(params?: string): Promise<ApiResult<StaffMember[]>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<StaffMember[]>(`/api/v1/staff/${qs}`, {}, token ?? undefined);
  },
  async getDetail(id: string): Promise<ApiResult<StaffMember>> {
    const token = await getUsableAccessToken();
    return apiFetch<StaffMember>(`/api/v1/staff/${id}/`, {}, token ?? undefined);
  },
  async getKPIs(): Promise<ApiResult<StaffKPIs>> {
    const token = await getUsableAccessToken();
    return apiFetch<StaffKPIs>('/api/v1/staff/kpis/', {}, token ?? undefined);
  },
  async updatePermissions(id: string, payload: { can_refund?: boolean; can_discount?: boolean; can_view_reports?: boolean }): Promise<ApiResult<StaffMember>> {
    const token = await getUsableAccessToken();
    return apiFetch<StaffMember>(`/api/v1/staff/${id}/permissions/`, { method: 'PATCH', body: JSON.stringify(payload) }, token ?? undefined);
  },
};

// ── Discounts API ──────────────────────────────────────────────────────────────

export const discountApi = {
  async getSummary(params?: string): Promise<ApiResult<DiscountSummary>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<DiscountSummary>(`/api/v1/transactions/discount-summary/${qs}`, {}, token ?? undefined);
  },
};

// ── Analytics API ──────────────────────────────────────────────────────────────

export const analyticsApi = {
  async getDashboard(params?: string): Promise<ApiResult<DashboardData>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<DashboardData>(`/api/v1/analytics/dashboard/${qs}`, {}, token ?? undefined);
  },
  async getOverview(params?: string): Promise<ApiResult<AnalyticsOverview>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<AnalyticsOverview>(`/api/v1/analytics/overview/${qs}`, {}, token ?? undefined);
  },
  async getProducts(params?: string): Promise<ApiResult<AnalyticsProduct[]>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<AnalyticsProduct[]>(`/api/v1/analytics/products/${qs}`, {}, token ?? undefined);
  },
  async getSales(params?: string): Promise<ApiResult<SalesAnalytics>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<SalesAnalytics>(`/api/v1/analytics/sales/${qs}`, {}, token ?? undefined);
  },
  async getCustomers(params?: string): Promise<ApiResult<CustomerAnalytics>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<CustomerAnalytics>(`/api/v1/analytics/customers/${qs}`, {}, token ?? undefined);
  },
  async getCashflow(params?: string): Promise<ApiResult<CashflowAnalytics>> {
    const token = await getUsableAccessToken();
    const qs = params ? `?${params}` : '';
    return apiFetch<CashflowAnalytics>(`/api/v1/analytics/cashflow/${qs}`, {}, token ?? undefined);
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
