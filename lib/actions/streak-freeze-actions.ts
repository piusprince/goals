"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { StreakFreeze } from "@/lib/supabase/types";

/**
 * Get streak freeze status for a goal
 */
export async function getStreakFreezeStatus(goalId: string): Promise<{
  success: boolean;
  data?: StreakFreeze;
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
    .from("streak_freezes")
    .select("*")
    .eq("user_id", user.id)
    .eq("goal_id", goalId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = "No rows returned"
    return { success: false, error: error.message };
  }

  // If no record exists, return default values
  if (!data) {
    return {
      success: true,
      data: {
        id: "",
        user_id: user.id,
        goal_id: goalId,
        available: 0,
        active_until: null,
        last_earned_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  return { success: true, data };
}

/**
 * Activate a streak freeze for a goal
 * Uses one available freeze and sets it active for today
 */
export async function activateStreakFreeze(goalId: string): Promise<{
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

  // Get current freeze status
  const { data: freeze, error: fetchError } = await supabase
    .from("streak_freezes")
    .select("*")
    .eq("user_id", user.id)
    .eq("goal_id", goalId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    return { success: false, error: fetchError.message };
  }

  // Check if user has available freezes
  if (!freeze || freeze.available <= 0) {
    return { success: false, error: "No streak freezes available" };
  }

  // Check if a freeze is already active
  if (freeze.active_until) {
    const activeDate = new Date(freeze.active_until);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeDate >= today) {
      return { success: false, error: "A streak freeze is already active" };
    }
  }

  // Set freeze active for today
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const { error: updateError } = await supabase
    .from("streak_freezes")
    .update({
      available: freeze.available - 1,
      active_until: todayStr,
    })
    .eq("id", freeze.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath(`/goals/${goalId}`);
  return { success: true };
}

/**
 * Check if a goal has an active freeze for a given date
 */
export async function hasActiveFreezeForDate(
  goalId: string,
  date: Date
): Promise<boolean> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const dateStr = date.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("streak_freezes")
    .select("active_until")
    .eq("user_id", user.id)
    .eq("goal_id", goalId)
    .single();

  if (error || !data || !data.active_until) {
    return false;
  }

  return data.active_until === dateStr;
}

/**
 * Use (consume) a streak freeze when a day is missed
 * This marks the freeze as used and clears the active_until
 */
export async function useStreakFreeze(goalId: string): Promise<{
  success: boolean;
  freezeUsed: boolean;
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, freezeUsed: false, error: "Not authenticated" };
  }

  // Check for active freeze
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const { data: freeze, error: fetchError } = await supabase
    .from("streak_freezes")
    .select("*")
    .eq("user_id", user.id)
    .eq("goal_id", goalId)
    .single();

  if (fetchError || !freeze) {
    return { success: true, freezeUsed: false };
  }

  // Check if freeze was active for yesterday
  if (freeze.active_until === yesterdayStr) {
    // Clear the active freeze (it's been used)
    const { error: updateError } = await supabase
      .from("streak_freezes")
      .update({ active_until: null })
      .eq("id", freeze.id);

    if (updateError) {
      return { success: false, freezeUsed: false, error: updateError.message };
    }

    return { success: true, freezeUsed: true };
  }

  return { success: true, freezeUsed: false };
}

/**
 * Award a streak freeze to a user for maintaining a 7-day streak
 * Called when a user reaches exactly 7, 14, 21, etc. day streak
 */
export async function awardStreakFreeze(
  goalId: string,
  currentStreak: number
): Promise<{
  success: boolean;
  awarded: boolean;
  error?: string;
}> {
  // Only award on multiples of 7
  if (currentStreak % 7 !== 0 || currentStreak === 0) {
    return { success: true, awarded: false };
  }

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, awarded: false, error: "Not authenticated" };
  }

  // Get or create freeze record
  const { data: freeze, error: fetchError } = await supabase
    .from("streak_freezes")
    .select("*")
    .eq("user_id", user.id)
    .eq("goal_id", goalId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    return { success: false, awarded: false, error: fetchError.message };
  }

  const now = new Date().toISOString();

  if (!freeze) {
    // Create new freeze record with 1 available
    const { error: insertError } = await supabase
      .from("streak_freezes")
      .insert({
        user_id: user.id,
        goal_id: goalId,
        available: 1,
        last_earned_at: now,
      });

    if (insertError) {
      return { success: false, awarded: false, error: insertError.message };
    }

    revalidatePath(`/goals/${goalId}`);
    return { success: true, awarded: true };
  }

  // Check if we've already awarded for this streak milestone
  // Prevent double-awarding by checking if last_earned_at is recent
  if (freeze.last_earned_at) {
    const lastEarned = new Date(freeze.last_earned_at);
    const hoursSinceLastEarned =
      (Date.now() - lastEarned.getTime()) / (1000 * 60 * 60);

    // If awarded within the last 24 hours, don't award again
    if (hoursSinceLastEarned < 24) {
      return { success: true, awarded: false };
    }
  }

  // Max 3 freezes can be stored
  const newAvailable = Math.min(freeze.available + 1, 3);

  // Only update if we're actually adding a freeze
  if (newAvailable === freeze.available) {
    return { success: true, awarded: false };
  }

  const { error: updateError } = await supabase
    .from("streak_freezes")
    .update({
      available: newAvailable,
      last_earned_at: now,
    })
    .eq("id", freeze.id);

  if (updateError) {
    return { success: false, awarded: false, error: updateError.message };
  }

  revalidatePath(`/goals/${goalId}`);
  return { success: true, awarded: true };
}

/**
 * Get all streak freezes for the current user across all goals
 */
export async function getAllStreakFreezes(): Promise<{
  success: boolean;
  data?: StreakFreeze[];
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
    .from("streak_freezes")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data ?? [] };
}
