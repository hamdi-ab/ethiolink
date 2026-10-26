"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "ethiolink_theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  } catch {
    return "system";
  }
}

function applyThemeToDOM(theme: Theme): ResolvedTheme {
  if (typeof document === "undefined") return "light";
  const root = document.documentElement;
  const resolved: ResolvedTheme = theme === "system" ? getSystemTheme() : theme;

  if (resolved === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }
  return resolved;
}

const listeners = new Set<() => void>();
let currentTheme: Theme = "system";

if (typeof window !== "undefined") {
  currentTheme = getInitialTheme();
}

function notifyThemeListeners() {
  listeners.forEach((listener) => listener());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<Theme>(
    (callback) => {
      listeners.add(callback);
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleMediaChange = () => {
        applyThemeToDOM(currentTheme);
        callback();
      };

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) {
          const raw = e.newValue as Theme | null;
          currentTheme = raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
          applyThemeToDOM(currentTheme);
          callback();
        }
      };

      mediaQuery.addEventListener("change", handleMediaChange);
      window.addEventListener("storage", handleStorageChange);

      return () => {
        listeners.delete(callback);
        mediaQuery.removeEventListener("change", handleMediaChange);
        window.removeEventListener("storage", handleStorageChange);
      };
    },
    (): Theme => currentTheme,
    (): Theme => "system"
  );

  const resolvedTheme: ResolvedTheme = useMemo((): ResolvedTheme => {
    if (typeof window === "undefined") return "light";
    return theme === "system" ? getSystemTheme() : theme;
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    currentTheme = newTheme;
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors in restricted private contexts
    }
    applyThemeToDOM(newTheme);
    notifyThemeListeners();
  }, []);

  const toggleTheme = useCallback(() => {
    const resolved: ResolvedTheme = currentTheme === "system" ? getSystemTheme() : currentTheme;
    const next: Theme = resolved === "dark" ? "light" : "dark";
    setTheme(next);
  }, [setTheme]);

  useEffect(() => {
    applyThemeToDOM(currentTheme);
  }, []);

  const value = useMemo(
    (): ThemeContextType => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
