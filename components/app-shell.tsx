'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sidenav } from './sidenav';
import { Topbar } from './topbar';
import { STORES } from '../lib/data';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

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
  const [theme, setTheme] = useState<Theme>('dark');
  const [navOpen, setNavOpen] = useState(false);
  const [activeStoreId, setActiveStoreIdState] = useState('kariakoo');

  useEffect(() => {
    const stored = localStorage.getItem('ziada-theme') as Theme | null;
    const current = document.documentElement.getAttribute('data-theme') as Theme | null;
    setTheme(current || stored || 'dark');

    const storedStore = localStorage.getItem('ziada-store');
    if (storedStore && STORES.some(s => s.id === storedStore)) {
      setActiveStoreIdState(storedStore);
    }
  }, []);

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

  const openNav  = () => setNavOpen(true);
  const closeNav = () => setNavOpen(false);

  return (
    <StoreContext.Provider value={{ activeStoreId, setActiveStoreId }}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {/* Mobile overlay behind sidenav */}
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
            {full ? (
              children
            ) : (
              <div className="body">
                {children}
              </div>
            )}
          </div>
        </div>
      </ThemeContext.Provider>
    </StoreContext.Provider>
  );
}
