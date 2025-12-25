"use client";

import { useState, useEffect, useCallback } from "react";
import {
  savePushSubscription,
  removePushSubscription,
  getVapidPublicKey,
} from "@/lib/actions/notification-actions";
import type { PushSubscriptionJSON } from "@/lib/supabase/types";

export type PushPermissionState =
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported";

/**
 * Convert a base64 string to a Uint8Array (for VAPID key)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [permissionState, setPermissionState] =
    useState<PushPermissionState>("prompt");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  // Check current permission and subscription status
  useEffect(() => {
    async function checkStatus() {
      if (!isSupported) {
        setPermissionState("unsupported");
        setIsLoading(false);
        return;
      }

      // Check permission
      const permission = Notification.permission;
      setPermissionState(permission === "default" ? "prompt" : permission);

      // Check existing subscription
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch {
        console.error("Error checking push subscription");
      }

      setIsLoading(false);
    }

    checkStatus();
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError("Push notifications are not supported in this browser");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission if not granted
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        setPermissionState(permission as PushPermissionState);

        if (permission !== "granted") {
          setError("Push notification permission denied");
          setIsLoading(false);
          return false;
        }
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Get VAPID public key
      const vapidKey = await getVapidPublicKey();
      if (!vapidKey) {
        setError("Push notifications not configured on server");
        setIsLoading(false);
        return false;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Convert to JSON format and save to server
      const subscriptionJson = subscription.toJSON() as PushSubscriptionJSON;
      const result = await savePushSubscription(subscriptionJson);

      if (!result.success) {
        setError(result.error || "Failed to save subscription");
        setIsLoading(false);
        return false;
      }

      setIsSubscribed(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      const error = err as Error;
      console.error("Push subscription error:", error);
      setError(error.message || "Failed to subscribe to push notifications");
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from server
      const result = await removePushSubscription();

      if (!result.success) {
        setError(result.error || "Failed to remove subscription");
        setIsLoading(false);
        return false;
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch (err) {
      const error = err as Error;
      console.error("Push unsubscribe error:", error);
      setError(error.message || "Failed to unsubscribe");
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    permissionState,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
}
