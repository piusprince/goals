// Supabase Edge Function: Send Daily Reminders
// Scheduled to run every 15 minutes
// Sends push notifications to users whose reminder time falls within the current window

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import webpush from "https://esm.sh/web-push@3.6.7";

// CORS headers for HTTP responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Configure web-push with VAPID keys
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
const vapidSubject =
  Deno.env.get("VAPID_SUBJECT") || "mailto:noreply@goaltracker.app";

interface NotificationPreference {
  user_id: string;
  daily_reminders: boolean;
  reminder_time: string;
  push_subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  } | null;
  timezone: string;
}

interface CheckIn {
  user_id: string;
  checked_at: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate VAPID keys
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error("VAPID keys not configured");
      return new Response(
        JSON.stringify({ error: "VAPID keys not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Configure web-push
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time and calculate the 15-minute window
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const windowStart = Math.floor(currentMinutes / 15) * 15;
    const windowEnd = windowStart + 15;

    // Convert window to HH:MM format
    const formatTime = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    };

    const windowStartTime = formatTime(windowStart);
    const windowEndTime = formatTime(windowEnd);

    console.log(
      `Checking reminders for window: ${windowStartTime} - ${windowEndTime}`
    );

    // Get users with daily_reminders enabled and reminder_time in the window
    const { data: preferences, error: prefsError } = await supabase
      .from("notification_preferences")
      .select(
        "user_id, daily_reminders, reminder_time, push_subscription, timezone"
      )
      .eq("daily_reminders", true)
      .not("push_subscription", "is", null)
      .gte("reminder_time", `${windowStartTime}:00`)
      .lt("reminder_time", `${windowEndTime}:00`);

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      return new Response(JSON.stringify({ error: prefsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!preferences || preferences.length === 0) {
      console.log("No users to notify in this window");
      return new Response(
        JSON.stringify({ message: "No users to notify", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get today's start timestamp in UTC
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get today's check-ins for these users
    const userIds = preferences.map((p: NotificationPreference) => p.user_id);
    const { data: checkIns, error: checkInsError } = await supabase
      .from("check_ins")
      .select("user_id, checked_at")
      .in("user_id", userIds)
      .gte("checked_at", todayStart.toISOString());

    if (checkInsError) {
      console.error("Error fetching check-ins:", checkInsError);
    }

    // Create set of users who have already checked in today
    const usersWithCheckIns = new Set(
      (checkIns || []).map((c: CheckIn) => c.user_id)
    );

    // Send notifications to users who haven't checked in
    let sent = 0;
    let failed = 0;

    for (const pref of preferences as NotificationPreference[]) {
      // Skip if user already checked in today
      if (usersWithCheckIns.has(pref.user_id)) {
        console.log(`User ${pref.user_id} already checked in today, skipping`);
        continue;
      }

      if (!pref.push_subscription) {
        continue;
      }

      try {
        const payload = JSON.stringify({
          title: "Time to check in! 📊",
          body: "Don't forget to track your progress today.",
          url: "/dashboard",
          tag: "daily-reminder",
        });

        await webpush.sendNotification(
          {
            endpoint: pref.push_subscription.endpoint,
            keys: pref.push_subscription.keys,
          },
          payload
        );

        sent++;
        console.log(`Sent reminder to user ${pref.user_id}`);
      } catch (err) {
        failed++;
        console.error(`Failed to send to user ${pref.user_id}:`, err);

        // Remove invalid subscription (410 Gone or 404 Not Found)
        const error = err as { statusCode?: number };
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from("notification_preferences")
            .update({ push_subscription: null })
            .eq("user_id", pref.user_id);
          console.log(`Removed invalid subscription for user ${pref.user_id}`);
        }
      }
    }

    console.log(`Daily reminders sent: ${sent}, failed: ${failed}`);

    return new Response(
      JSON.stringify({ message: "Daily reminders processed", sent, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-daily-reminders:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
