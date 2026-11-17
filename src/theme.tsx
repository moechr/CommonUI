import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeSetting = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  /** Was der Nutzer gewählt hat. */
  theme: ThemeSetting;
  /** Was tatsächlich angezeigt wird. */
  resolved: ResolvedTheme;
  setTheme: (t: ThemeSetting) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "cui-theme";

function readStored(): ThemeSetting {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* Speicher nicht verfügbar */
  }
  return "system";
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Startwert, falls nichts gespeichert ist. */
  defaultTheme?: ThemeSetting;
  /** Auswahl in localStorage merken (Standard: ja). */
  persist?: boolean;
}

/**
 * Setzt data-theme auf <html>. "system" entfernt das Attribut, dann greift prefers-color-scheme.
 */
export function ThemeProvider({ children, defaultTheme = "system", persist = true }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeSetting>(() => (persist ? readStored() : defaultTheme));
  const [sysDark, setSysDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setSysDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        /* ignorieren */
      }
    }
  }, [theme, persist]);

  const setTheme = useCallback((t: ThemeSetting) => setThemeState(t), []);
  const resolved: ResolvedTheme = theme === "system" ? (sysDark ? "dark" : "light") : theme;
  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme muss innerhalb von <ThemeProvider> verwendet werden.");
  return ctx;
}
