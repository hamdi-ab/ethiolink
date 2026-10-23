"use client";

import React, { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = "", size = "md" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = mounted && resolvedTheme === "dark";

  const sizeClasses =
    size === "sm"
      ? "w-8 h-8 rounded-lg p-1.5"
      : "w-9 h-9 rounded-xl p-2";

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      suppressHydrationWarning
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`inline-flex items-center justify-center border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
        isDark
          ? "bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 border-slate-700 shadow-2xs"
          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs"
      } ${sizeClasses} ${className}`}
    >
      {!mounted ? (
        <span className="w-4 h-4 opacity-0" />
      ) : isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
