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

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="app">
        <Sidenav />
        <div className="main">
          <Topbar crumbs={crumbs} actions={actions} search={search} />
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
