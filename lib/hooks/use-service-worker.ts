"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseServiceWorkerReturn {
  /** Whether a new service worker is waiting to activate */
  hasUpdate: boolean;
  /** Whether the service worker is currently registering */
  isRegistering: boolean;
  /** Any registration error */
  error: Error | null;
  /** Skip waiting and reload to activate new service worker */
  updateServiceWorker: () => void;
}

/**
 * Hook to manage service worker registration and updates
 * Detects when a new version is available and provides method to update
 */
export function useServiceWorker(): UseServiceWorkerReturn {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isRegistering, setIsRegistering] = useState(() => {
    // Initial state based on whether SW is supported
    return globalThis.window !== undefined && "serviceWorker" in navigator;
  });
  const [error, setError] = useState<Error | null>(null);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Skip if not supported or already initialized
    if (globalThis.window === undefined || !("serviceWorker" in navigator)) {
      return;
    }

    if (initialized.current) return;
    initialized.current = true;

    let checkInterval: ReturnType<typeof setInterval>;

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        setRegistration(reg);
        setIsRegistering(false);

        // Check if there's already an update waiting
        if (reg.waiting) {
          setHasUpdate(true);
          return;
        }

        // Listen for new service worker installing
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setHasUpdate(true);
            }
          });
        });

        // Periodically check for updates (every hour)
        checkInterval = setInterval(() => {
          reg.update().catch(console.error);
        }, 60 * 60 * 1000);
      } catch (err) {
        console.error("Service worker registration failed:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsRegistering(false);
      }
    };

    registerServiceWorker();

    // Handle controller change (new SW activated)
    const handleControllerChange = () => {
      globalThis.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, []);

  const updateServiceWorker = useCallback(() => {
    if (!registration?.waiting) return;

    // Tell the waiting service worker to activate
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }, [registration]);

  return {
    hasUpdate,
    isRegistering,
    error,
    updateServiceWorker,
  };
}
