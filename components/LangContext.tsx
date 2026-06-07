'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Lang } from '@/lib/lang';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangCtx>({ lang: 'sw', setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('sw');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ziada-lang') as Lang | null;
      if (stored === 'en' || stored === 'sw') setLangState(stored);
    } catch {}
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem('ziada-lang', l); } catch {}
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
