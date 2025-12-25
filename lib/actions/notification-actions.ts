"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import webpush from "web-push";
import {
  NotificationPreferences,
  NotificationPreferencesInsert,
  NotificationPreferencesUpdate,
  PushSubscriptionJSON,
} from "@/lib/supabase/types";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject =
  process.env.VAPID_SUBJECT || "mailto:noreply@goaltracker.app";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// Default notification preferences
const DEFAULT_PREFERENCES: Omit<NotificationPreferencesInsert, "user_id"> = {
  daily_reminders: true,
  reminder_time: "09:00:00",
  weekly_summary: true,
  achievement_alerts: true,
  streak_warnings: true,
  timezone: "UTC",
};

/**
 * Get or create notification preferences for the current user
 */
export async function getNotificationPreferences(): Promise<{
  success: boolean;
  data?: NotificationPreferences;
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Try to get existing preferences
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = "No rows returned"
    return { success: false, error: error.message };
  }

  // If preferences exist, return them
  if (data) {
    return { success: true, data };
  }

  // Create default preferences for new user
  const createResult = await createDefaultPreferences();
  return createResult;
}

/**
 * Create default notification preferences for the current user
 */
export async function createDefaultPreferences(): Promise<{
  success: boolean;
  data?: NotificationPreferences;
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Detect user timezone from browser (fallback to UTC)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const { data, error } = await supabase
    .from("notification_preferences")
    .insert({
      ...DEFAULT_PREFERENCES,
      user_id: user.id,
      timezone,
    })
    .select()
    .single();

  if (error) {
    // Handle duplicate key error (preferences already exist)
    if (error.code === "23505") {
      return getNotificationPreferences();
    }
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Update notification preferences for the current user
 */
export async function updateNotificationPreferences(
  updates: Omit<
    NotificationPreferencesUpdate,
    "id" | "user_id" | "created_at" | "updated_at"
  >
): Promise<{
  success: boolean;
  data?: NotificationPreferences;
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  return { success: true, data };
}

/**
 * Save push subscription for the current user
 */
export async function savePushSubscription(
  subscription: PushSubscriptionJSON
): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // First ensure preferences exist
  const prefsResult = await getNotificationPreferences();
  if (!prefsResult.success) {
    return { success: false, error: prefsResult.error };
  }

  const { error } = await supabase
    .from("notification_preferences")
    .update({ push_subscription: subscription })
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Remove push subscription for the current user
 */
export async function removePushSubscription(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notification_preferences")
    .update({ push_subscription: null })
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Check if the user has push notifications enabled
 */
export async function hasPushSubscription(): Promise<boolean> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data } = await supabase
    .from("notification_preferences")
    .select("push_subscription")
    .eq("user_id", user.id)
    .single();

  return data?.push_subscription !== null;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

/**
 * Send a push notification to a specific user
 */
export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return { success: false, error: "VAPID keys not configured" };
  }

  const supabase = await createServerClient();

  // Get user's push subscription
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("push_subscription")
    .eq("user_id", userId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data?.push_subscription) {
    return { success: false, error: "User has no push subscription" };
  }

  const subscription = data.push_subscription as PushSubscriptionJSON;

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload)
    );
    return { success: true };
  } catch (err) {
    const error = err as Error & { statusCode?: number };

    // Handle expired/invalid subscriptions
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Remove invalid subscription
      await supabase
        .from("notification_preferences")
        .update({ push_subscription: null })
        .eq("user_id", userId);

      return { success: false, error: "Push subscription expired" };
    }

    return { success: false, error: error.message };
  }
}

/**
 * Send push notification to current authenticated user
 */
export async function sendPushNotificationToCurrentUser(
  payload: PushNotificationPayload
): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  return sendPushNotification(user.id, payload);
}

/**
 * Get VAPID public key for client-side subscription
 */
export async function getVapidPublicKey(): Promise<string | null> {
  return vapidPublicKey || null;
}
