"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

function getSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true; // Assume online for SSR
}

function subscribe(callback: () => void): () => void {
  globalThis.addEventListener("online", callback);
  globalThis.addEventListener("offline", callback);
  return () => {
    globalThis.removeEventListener("online", callback);
    globalThis.removeEventListener("offline", callback);
  };
}

/**
 * Hook to track online/offline status
 * Returns true when online, false when offline
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
