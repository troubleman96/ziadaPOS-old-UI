'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidenav } from './sidenav';
import { Topbar } from './topbar';
import { BottomNav } from './bottom-nav';
import { isAuthenticated, getCachedUser } from '../lib/auth';
import { storesApi, StoreItem } from '../lib/api';
import { ReviewPrompt } from './review-prompt';

// ── Theme ─────────────────────────────────────────────────────────────────────

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface StoreContextValue {
  activeStoreId: string;
  setActiveStoreId: (id: string) => void;
  stores: StoreItem[];
  activeStore: StoreItem | null;
}

const StoreContext = createContext<StoreContextValue>({
  activeStoreId: '',
  setActiveStoreId: () => {},
  stores: [],
  activeStore: null,
});

export function useStore() {
  return useContext(StoreContext);
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  icon: string;
  color: string;
  title: string;
  sub: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', icon: '⚠', color: 'var(--warn)', title: 'Low stock: Sabuni ya OMO', sub: '3 units left — below minimum of 15', time: '5m ago', unread: true },
  { id: 'n2', icon: '✓', color: 'var(--good)', title: 'Payment received', sub: 'Juma Kifupi paid TZS 20,000', time: '2h ago', unread: true },
  { id: 'n3', icon: '!', color: 'var(--bad)',  title: 'Credit overdue: Asha Mwinyi', sub: 'TZS 28,800 · 14 days overdue', time: '1d ago', unread: true },
  { id: 'n4', icon: '✓', color: 'var(--good)', title: 'Sale completed', sub: 'TXN-2043 · TZS 84,200 via M-Pesa', time: '2d ago', unread: false },
];

interface NotifContextValue {
  notifications: AppNotification[];
  addNotification: (n: AppNotification) => void;
}

const NotifContext = createContext<NotifContextValue>({
  notifications: INITIAL_NOTIFICATIONS,
  addNotification: () => {},
});

export function useNotifications() {
  return useContext(NotifContext);
}

// ── AppShell ──────────────────────────────────────────────────────────────────

interface AppShellProps {
  children: React.ReactNode;
  crumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  search?: boolean;
  /**
   * full=true  → children render directly in .main (no .body wrapper, no padding).
   *              Use for POS and other full-height custom layouts.
   * full=false → children render inside .body (padded, scrollable). Default.
   */
  full?: boolean;
}

export function AppShell({ children, crumbs, actions, search, full = false }: AppShellProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>('light');
  const [navOpen, setNavOpen] = useState(false);
  const [activeStoreId, setActiveStoreIdState] = useState('');
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  // Guard: hide content while we verify auth to avoid a flash of protected UI
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
    // Client-side auth guard — catches the edge case where the session cookie
    // exists but localStorage was cleared (e.g. private-mode tab swap).
    if (!isAuthenticated()) {
      const next = encodeURIComponent(window.location.pathname);
      router.replace(`/auth/login?next=${next}`);
      return;
    }

    // Subscription guard — disabled while the app is pre-launch (no paywall
    // enforcement yet; see apps/subscriptions/middleware.py on the API side).
    // Re-enable this block once the real subscription/billing model ships.

    setAuthChecked(true);

    const stored = localStorage.getItem('ziada-theme') as Theme | null;
    const current = document.documentElement.getAttribute('data-theme') as Theme | null;
    setTheme(current || stored || 'light');

    // Restore the last-selected store id; corrected below once the real
    // store list loads, in case it's stale (deleted store, different account).
    const storedStore = localStorage.getItem('ziada-store');
    if (storedStore) {
      setActiveStoreIdState(storedStore);
    }

    storesApi.getList().then((res) => {
      if (!res.success || !res.data.length) return;
      setStores(res.data);
      setActiveStoreIdState((current) => {
        if (res.data.some(s => s.id === current)) return current;
        // No valid saved preference — default to the account's real assigned
        // store (from /accounts/me/, cached at login) rather than an
        // arbitrary first-in-list store, so the sidenav label always matches
        // the store the backend is actually scoping data to.
        const realStoreId = getCachedUser()?.store;
        if (realStoreId && res.data.some(s => s.id === String(realStoreId))) {
          return String(realStoreId);
        }
        return res.data[0].id;
      });
    });
    })();
  }, [router]);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ziada-theme', next);
  };

  const setActiveStoreId = (id: string) => {
    setActiveStoreIdState(id);
    localStorage.setItem('ziada-store', id);
  };

  const addNotification = (n: AppNotification) => {
    setNotifications(prev => [n, ...prev]);
  };

  const activeStore = stores.find(s => s.id === activeStoreId) ?? null;

  const openNav  = () => setNavOpen(true);
  const closeNav = () => setNavOpen(false);

  // Don't render the app shell at all until auth is confirmed — prevents flash
  if (!authChecked) {
    return (
      <div style={{
        display: 'grid', placeItems: 'center',
        minHeight: '100dvh', background: 'var(--bg)',
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          border: '2px solid var(--line-2)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <NotifContext.Provider value={{ notifications, addNotification }}>
      <StoreContext.Provider value={{ activeStoreId, setActiveStoreId, stores, activeStore }}>
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <div
            className={`mobile-nav-overlay${navOpen ? ' visible' : ''}`}
            onClick={closeNav}
            aria-hidden="true"
          />
          <div className="app">
            <Sidenav navOpen={navOpen} onClose={closeNav} />
            <div className="main">
              <Topbar
                crumbs={crumbs}
                actions={actions}
                search={search}
                onMenuToggle={openNav}
              />
              {full ? children : <div className="body">{children}</div>}
            </div>
          </div>
          <BottomNav />
          <ReviewPrompt />
        </ThemeContext.Provider>
      </StoreContext.Provider>
    </NotifContext.Provider>
  );
}
