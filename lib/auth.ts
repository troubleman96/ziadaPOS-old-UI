/**
 * lib/auth.ts
 *
 * JWT token storage and user session helpers.
 *
 * Storage strategy:
 *   - Access + refresh tokens → localStorage (never sent over the wire accidentally)
 *   - Session presence flag   → cookie `ziada_session=1` (readable by Edge middleware
 *                               for server-side route protection without exposing the token)
 *
 * All functions are safe to call in SSR (typeof window guard).
 */

import type { UserProfile, SubscriptionInfo } from './api';

const ACCESS_KEY   = 'ziada_access';
const REFRESH_KEY  = 'ziada_refresh';
const USER_KEY     = 'ziada_user';
const SUB_KEY      = 'ziada_sub';
const SESSION_COOKIE = 'ziada_session';

// ── Cookie helpers (client-side only) ─────────────────────────────────────────

function setSessionCookie(): void {
  if (typeof document === 'undefined') return;
  // 7 days — matches typical refresh token lifetime
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

// ── Token storage ──────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(access: string, refresh: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  setSessionCookie();
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SUB_KEY);
  clearSessionCookie();
}

// ── Cached user profile ────────────────────────────────────────────────────────

export function getCachedUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function cacheUser(user: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCachedSubscription(): SubscriptionInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SUB_KEY);
    return raw ? (JSON.parse(raw) as SubscriptionInfo) : null;
  } catch {
    return null;
  }
}

export function cacheSubscription(sub: SubscriptionInfo): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUB_KEY, JSON.stringify(sub));
}

// ── Session helpers ────────────────────────────────────────────────────────────

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

/** Decode the exp claim from a JWT without a library. Returns null on any error. */
export function tokenExpiresAt(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
}

export function tokenIsExpired(token: string): boolean {
  const exp = tokenExpiresAt(token);
  return exp === null || exp <= new Date();
}
