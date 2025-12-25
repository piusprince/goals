"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

interface UseInstallPromptReturn {
  /** Whether the install prompt is available */
  canInstall: boolean;
  /** Whether the app is already installed as a PWA */
  isInstalled: boolean;
  /** Whether the user has dismissed the prompt in this session */
  isDismissed: boolean;
  /** Trigger the install prompt */
  promptInstall: () => Promise<boolean>;
  /** Dismiss the install banner (sets localStorage flag) */
  dismissPrompt: () => void;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Dismiss state management using external store pattern
let dismissListeners: Array<() => void> = [];
let currentDismissed = false;

function subscribeToDismiss(callback: () => void): () => void {
  dismissListeners.push(callback);
  return () => {
    dismissListeners = dismissListeners.filter((l) => l !== callback);
  };
}

function getDismissSnapshot(): boolean {
  return currentDismissed;
}

function getDismissServerSnapshot(): boolean {
  return false;
}

function setDismissed(value: boolean): void {
  currentDismissed = value;
  dismissListeners.forEach((l) => l());
}

// Initialize dismiss state
if (typeof globalThis.window !== "undefined") {
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (dismissedAt) {
    const dismissedTime = Number.parseInt(dismissedAt, 10);
    currentDismissed = Date.now() - dismissedTime < DISMISS_DURATION;
    if (!currentDismissed) {
      localStorage.removeItem(DISMISS_KEY);
    }
  }
}

function checkInstalled(): boolean {
  if (typeof globalThis.window === "undefined") return false;
  return (
    globalThis.matchMedia?.("(display-mode: standalone)").matches ||
    // @ts-expect-error - iOS Safari specific
    globalThis.navigator?.standalone === true
  );
}

/**
 * Hook to handle PWA install prompt
 * Stores the beforeinstallprompt event and provides methods to trigger it
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(checkInstalled);
  const isDismissed = useSyncExternalStore(
    subscribeToDismiss,
    getDismissSnapshot,
    getDismissServerSnapshot
  );

  // Listen for beforeinstallprompt event
  useEffect(() => {
    if (globalThis.window === undefined) return;

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    globalThis.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );
    globalThis.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      globalThis.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      globalThis.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      // Clear the deferred prompt (can only be used once)
      setDeferredPrompt(null);

      return outcome === "accepted";
    } catch (error) {
      console.error("Install prompt error:", error);
      return false;
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setDismissed(true);
  }, []);

  return {
    canInstall: !!deferredPrompt && !isInstalled && !isDismissed,
    isInstalled,
    isDismissed,
    promptInstall,
    dismissPrompt,
  };
}
