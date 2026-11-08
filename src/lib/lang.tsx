import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { copy, type Copy, type Lang } from "@/lib/salon";

const STORAGE_KEY = "cb-lang";

type LangContext = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Copy;
};

const Ctx = createContext<LangContext | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
  }, []);

  return <Ctx.Provider value={{ lang, setLang, t: copy[lang] }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useLang must be used in LanguageProvider");
  return value;
}
