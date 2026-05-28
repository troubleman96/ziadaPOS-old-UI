'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sidenav } from './sidenav';
import { Topbar } from './topbar';

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

  useEffect(() => {
    // Sync with whatever the inline script set before React hydrated
    const stored = localStorage.getItem('ziada-theme') as Theme | null;
    const current = document.documentElement.getAttribute('data-theme') as Theme | null;
    setTheme(current || stored || 'dark');
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ziada-theme', next);
  };

  const openNav  = () => setNavOpen(true);
  const closeNav = () => setNavOpen(false);

  return (
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
            // Full-height mode: children own all remaining space (POS, etc.)
            children
          ) : (
            <div className="body">
              {children}
            </div>
          )}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
