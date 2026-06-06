'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidenav } from './sidenav';
import { Topbar } from './topbar';
import { STORES } from '../lib/data';
import { isAuthenticated, getCachedSubscription, cacheSubscription, getAccessToken } from '../lib/auth';
import { authApi } from '../lib/api';
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
}

const StoreContext = createContext<StoreContextValue>({
  activeStoreId: 'kariakoo',
  setActiveStoreId: () => {},
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
  const [activeStoreId, setActiveStoreIdState] = useState('kariakoo');
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

    // Subscription guard — always verify with the API so a stale cache
    // (e.g. admin activated the trial while the user was on /activate)
    // doesn't keep the user stuck forever.
    const cachedSub = getCachedSubscription();
    const subLooksInactive =
      cachedSub && (cachedSub.status === 'pending_payment' || cachedSub.is_active_now === false);

    if (subLooksInactive) {
      // Cache says inactive — verify with the live API before blocking
      const token = getAccessToken();
      if (token) {
        const result = await authApi.mySubscription();
        if (result.success) {
          cacheSubscription(result.data);
          if (!result.data.is_active_now) {
            router.replace('/activate');
            return;
          }
          // API says active — fall through and let the user in
        } else {
          // Can't reach API or 402 — send to activate to be safe
          router.replace('/activate');
          return;
        }
      } else {
        router.replace('/activate');
        return;
      }
    }

    setAuthChecked(true);

    const stored = localStorage.getItem('ziada-theme') as Theme | null;
    const current = document.documentElement.getAttribute('data-theme') as Theme | null;
    setTheme(current || stored || 'light');

    const storedStore = localStorage.getItem('ziada-store');
    if (storedStore && STORES.some(s => s.id === storedStore)) {
      setActiveStoreIdState(storedStore);
    }
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
      <StoreContext.Provider value={{ activeStoreId, setActiveStoreId }}>
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
          <ReviewPrompt />
        </ThemeContext.Provider>
      </StoreContext.Provider>
    </NotifContext.Provider>
  );
}
