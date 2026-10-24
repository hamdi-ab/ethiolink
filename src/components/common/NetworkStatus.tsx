"use client";

import React, { useSyncExternalStore, useState, useEffect, useRef } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getServerSnapshot(): boolean {
  return true;
}

export function NetworkStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [showRestored, setShowRestored] = useState(false);
  const prevOnlineRef = useRef(isOnline);

  useEffect(() => {
    // When transitioning from offline -> online, show restored badge temporarily
    if (!prevOnlineRef.current && isOnline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  if (isOnline && !showRestored) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="assertive"
      aria-label="Network Connection Status"
      className="fixed top-0 inset-x-0 z-50 pointer-events-none flex justify-center p-3 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div
        className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border text-xs sm:text-sm font-semibold transition-all duration-300 ${
          !isOnline
            ? "bg-rose-600 text-white border-rose-500 shadow-rose-950/20"
            : "bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/20"
        }`}
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-rose-200" />
            <span>You are offline. Please check your LAN cable or Wi-Fi.</span>
            <button
              onClick={() => window.location.reload()}
              className="ml-2 px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Retry connection"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>Connection restored. You are back online.</span>
          </>
        )}
      </div>
    </aside>
  );
}
