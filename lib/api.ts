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

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: json.message ?? json.detail ?? 'Request failed.',
        errors: json.errors ?? undefined,
      };
    }

    return { success: true, message: json.message ?? '', data: json.data as T };
  } catch {
    return { success: false, message: 'Network error. Please check your connection.' };
  }
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

  me(accessToken: string) {
    return apiFetch<MeResponse>('/api/v1/accounts/me/', {}, accessToken);
  },

  mySubscription(accessToken: string) {
    return apiFetch<SubscriptionInfo>('/api/v1/subscriptions/my-subscription/', {}, accessToken);
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
