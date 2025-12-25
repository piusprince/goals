// Supabase Edge Function: Send Streak Warnings
// Scheduled to run daily at 10 PM
// Sends push notifications to users with active streaks who haven't checked in today

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
  streak_warnings: boolean;
  push_subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  } | null;
}

interface Goal {
  id: string;
  title: string;
  owner_id: string;
  current_streak: number;
  type: string;
}

interface CheckIn {
  goal_id: string;
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

    console.log("Starting streak warning check...");

    // Get users with streak_warnings enabled and push subscription
    const { data: preferences, error: prefsError } = await supabase
      .from("notification_preferences")
      .select("user_id, streak_warnings, push_subscription")
      .eq("streak_warnings", true)
      .not("push_subscription", "is", null);

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      return new Response(JSON.stringify({ error: prefsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!preferences || preferences.length === 0) {
      console.log("No users have streak warnings enabled");
      return new Response(
        JSON.stringify({ message: "No users to notify", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userIds = preferences.map((p: NotificationPreference) => p.user_id);

    // Get habit goals with active streaks for these users
    const { data: goals, error: goalsError } = await supabase
      .from("goals")
      .select("id, title, owner_id, current_streak, type")
      .in("owner_id", userIds)
      .eq("type", "habit")
      .eq("is_archived", false)
      .gt("current_streak", 0);

    if (goalsError) {
      console.error("Error fetching goals:", goalsError);
      return new Response(JSON.stringify({ error: goalsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!goals || goals.length === 0) {
      console.log("No active streaks found");
      return new Response(
        JSON.stringify({ message: "No active streaks to warn about", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get today's start timestamp
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get today's check-ins for these goals
    const goalIds = goals.map((g: Goal) => g.id);
    const { data: checkIns, error: checkInsError } = await supabase
      .from("check_ins")
      .select("goal_id, user_id, checked_at")
      .in("goal_id", goalIds)
      .gte("checked_at", todayStart.toISOString());

    if (checkInsError) {
      console.error("Error fetching check-ins:", checkInsError);
    }

    // Create set of goals that have been checked in today
    const goalsWithCheckIns = new Set(
      (checkIns || []).map((c: CheckIn) => c.goal_id)
    );

    // Group goals by user
    const userGoalsAtRisk: Map<string, Goal[]> = new Map();
    for (const goal of goals as Goal[]) {
      // Skip if goal has been checked in today
      if (goalsWithCheckIns.has(goal.id)) {
        continue;
      }

      const existing = userGoalsAtRisk.get(goal.owner_id) || [];
      existing.push(goal);
      userGoalsAtRisk.set(goal.owner_id, existing);
    }

    // Create lookup for push subscriptions
    const subscriptionMap = new Map(
      preferences.map((p: NotificationPreference) => [
        p.user_id,
        p.push_subscription,
      ])
    );

    // Send notifications
    let sent = 0;
    let failed = 0;

    for (const [userId, goalsAtRisk] of userGoalsAtRisk) {
      const subscription = subscriptionMap.get(userId);
      if (!subscription) {
        continue;
      }

      // Find the goal with the longest streak at risk
      const highestStreakGoal = goalsAtRisk.reduce(
        (max, g) => (g.current_streak > max.current_streak ? g : max),
        goalsAtRisk[0]
      );

      const streakCount = highestStreakGoal.current_streak;
      const goalTitle = highestStreakGoal.title;

      try {
        const payload = JSON.stringify({
          title: `🔥 ${streakCount}-day streak at risk!`,
          body: `Don't lose your "${goalTitle}" streak - check in before midnight!`,
          url: `/goals/${highestStreakGoal.id}`,
          tag: "streak-warning",
        });

        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payload
        );

        sent++;
        console.log(
          `Sent streak warning to user ${userId} for ${streakCount}-day streak`
        );
      } catch (err) {
        failed++;
        console.error(`Failed to send to user ${userId}:`, err);

        // Remove invalid subscription
        const error = err as { statusCode?: number };
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from("notification_preferences")
            .update({ push_subscription: null })
            .eq("user_id", userId);
          console.log(`Removed invalid subscription for user ${userId}`);
        }
      }
    }

    console.log(`Streak warnings sent: ${sent}, failed: ${failed}`);

    return new Response(
      JSON.stringify({ message: "Streak warnings processed", sent, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-streak-warnings:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
