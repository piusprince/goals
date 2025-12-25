"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkInFormSchema } from "@/lib/validations/check-in-schema";
import { getFieldErrors } from "@/lib/validations/utils";
import {
  hasCheckedInToday,
  updateStreakOnCheckIn,
} from "@/lib/utils/streak-calculator";
import { checkAndAwardBadges, BadgeCheckContext } from "@/lib/actions/badge-actions";
import type { CheckIn, Badge } from "@/lib/supabase/types";

export type CheckInActionState = {
  success: boolean;
  message: string;
  checkIn?: CheckIn;
  newBadges?: Badge[];
  errors?: {
    value?: string[];
    note?: string[];
  };
};

/**
 * Create a check-in for a goal
 */
export async function createCheckIn(
  goalId: string,
  _prevState: CheckInActionState | null,
  formData: FormData
): Promise<CheckInActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to check in",
    };
  }

  // Get the goal to verify ownership and type
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("*")
    .eq("id", goalId)
    .eq("owner_id", user.id)
    .single();

  if (goalError || !goal) {
    return {
      success: false,
      message: "Goal not found",
    };
  }

  // Parse form data
  const rawData = {
    value: formData.get("value") ? Number(formData.get("value")) : 1,
    note: (formData.get("note") as string) || null,
  };

  const validationResult = checkInFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    const fieldErrors = getFieldErrors(validationResult.error);
    return {
      success: false,
      message: "Please fix the errors below",
      errors: {
        value: fieldErrors.value,
        note: fieldErrors.note,
      },
    };
  }

  // For habit goals, check if already checked in today
  if (goal.type === "habit") {
    const { data: todayCheckIns } = await supabase
      .from("check_ins")
      .select("*")
      .eq("goal_id", goalId)
      .eq("user_id", user.id)
      .gte("checked_at", new Date().toISOString().split("T")[0]);

    if (todayCheckIns && hasCheckedInToday(todayCheckIns)) {
      return {
        success: false,
        message: "You've already checked in today!",
      };
    }
  }

  // Insert the check-in
  const { data: checkIn, error: insertError } = await supabase
    .from("check_ins")
    .insert({
      goal_id: goalId,
      user_id: user.id,
      value: validationResult.data.value,
      note: validationResult.data.note,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating check-in:", insertError);
    return {
      success: false,
      message: "Failed to create check-in. Please try again.",
    };
  }

  // Update goal's current_value
  const newCurrentValue = goal.current_value + validationResult.data.value;

  // Prepare goal update
  const goalUpdate: Record<string, unknown> = {
    current_value: newCurrentValue,
  };

  // For target goals, check if completed
  let isAutoCompleted = false;
  if (
    goal.type === "target" &&
    goal.target_value &&
    newCurrentValue >= goal.target_value
  ) {
    goalUpdate.completed_at = new Date().toISOString();
    isAutoCompleted = true;
  }

  // For habit goals, update streak
  if (goal.type === "habit") {
    const streakResult = updateStreakOnCheckIn(
      goal.current_streak || 0,
      goal.longest_streak || 0,
      goal.last_check_in_date ? new Date(goal.last_check_in_date) : null,
      new Date()
    );

    goalUpdate.current_streak = streakResult.currentStreak;
    goalUpdate.longest_streak = streakResult.longestStreak;
    goalUpdate.last_check_in_date = new Date().toISOString().split("T")[0];
  }

  // Update the goal
  const { error: updateError } = await supabase
    .from("goals")
    .update(goalUpdate)
    .eq("id", goalId);

  if (updateError) {
    console.error("Error updating goal:", updateError);
    // Don't fail - check-in was created
  }

  // Check and award badges
  let newBadges: Badge[] = [];
  try {
    // Get user stats for badge context
    const { count: totalCheckIns } = await supabase
      .from("check_ins")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: completedGoals } = await supabase
      .from("goals")
      .select("id")
      .eq("owner_id", user.id)
      .not("completed_at", "is", null);

    const badgeContext: BadgeCheckContext = {
      streakDays: (goalUpdate.current_streak as number) || goal.current_streak || 0,
      totalCheckIns: totalCheckIns || 0,
      goalsCompleted: completedGoals?.length || 0,
      goalId,
    };

    const badgeResult = await checkAndAwardBadges(badgeContext);
    if (badgeResult.success && badgeResult.newBadges) {
      newBadges = badgeResult.newBadges;
    }
  } catch (e) {
    console.error("Error checking badges:", e);
    // Don't fail the check-in if badge check fails
  }

  revalidatePath("/dashboard");
  revalidatePath(`/goals/${goalId}`);

  // Build success message
  let message = isAutoCompleted
    ? "🎉 Goal completed! Congratulations!"
    : "Check-in recorded!";
  
  if (newBadges.length > 0) {
    const badgeNames = newBadges.map((b) => b.name).join(", ");
    message += ` 🏆 New badge${newBadges.length > 1 ? "s" : ""}: ${badgeNames}!`;
  }

  return {
    success: true,
    message,
    checkIn,
    newBadges,
  };
}

/**
 * Quick check-in for habit goals (value = 1, no note)
 */
export async function quickCheckIn(
  goalId: string
): Promise<CheckInActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to check in",
    };
  }

  // Get the goal to verify ownership and type
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("*")
    .eq("id", goalId)
    .eq("owner_id", user.id)
    .single();

  if (goalError || !goal) {
    return {
      success: false,
      message: "Goal not found",
    };
  }

  if (goal.type !== "habit") {
    return {
      success: false,
      message: "Quick check-in is only for habit goals",
    };
  }

  // Check if already checked in today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayCheckIns } = await supabase
    .from("check_ins")
    .select("*")
    .eq("goal_id", goalId)
    .eq("user_id", user.id)
    .gte("checked_at", todayStart.toISOString());

  if (todayCheckIns && todayCheckIns.length > 0) {
    return {
      success: false,
      message: "You've already checked in today!",
    };
  }

  // Insert the check-in
  const { data: checkIn, error: insertError } = await supabase
    .from("check_ins")
    .insert({
      goal_id: goalId,
      user_id: user.id,
      value: 1,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error creating check-in:", insertError);
    return {
      success: false,
      message: "Failed to check in. Please try again.",
    };
  }

  // Update goal's current_value and streak
  const newCurrentValue = goal.current_value + 1;
  const streakResult = updateStreakOnCheckIn(
    goal.current_streak || 0,
    goal.longest_streak || 0,
    goal.last_check_in_date ? new Date(goal.last_check_in_date) : null,
    new Date()
  );

  const { error: updateError } = await supabase
    .from("goals")
    .update({
      current_value: newCurrentValue,
      current_streak: streakResult.currentStreak,
      longest_streak: streakResult.longestStreak,
      last_check_in_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", goalId);

  if (updateError) {
    console.error("Error updating goal:", updateError);
  }

  // Check and award badges
  let newBadges: Badge[] = [];
  try {
    // Get user stats for badge context
    const { count: totalCheckIns } = await supabase
      .from("check_ins")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: completedGoals } = await supabase
      .from("goals")
      .select("id")
      .eq("owner_id", user.id)
      .not("completed_at", "is", null);

    const badgeContext: BadgeCheckContext = {
      streakDays: streakResult.currentStreak,
      totalCheckIns: totalCheckIns || 0,
      goalsCompleted: completedGoals?.length || 0,
      goalId,
    };

    const badgeResult = await checkAndAwardBadges(badgeContext);
    if (badgeResult.success && badgeResult.newBadges) {
      newBadges = badgeResult.newBadges;
    }
  } catch (e) {
    console.error("Error checking badges:", e);
    // Don't fail the check-in if badge check fails
  }

  revalidatePath("/dashboard");
  revalidatePath(`/goals/${goalId}`);

  // Build success message
  let message = `🔥 Streak: ${streakResult.currentStreak} days!`;
  
  if (newBadges.length > 0) {
    const badgeNames = newBadges.map((b) => b.name).join(", ");
    message += ` 🏆 New badge${newBadges.length > 1 ? "s" : ""}: ${badgeNames}!`;
  }

  return {
    success: true,
    message,
    checkIn,
    newBadges,
  };
}

/**
 * Delete a check-in
 */
export async function deleteCheckIn(
  checkInId: string
): Promise<CheckInActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in",
    };
  }

  // Get the check-in to verify ownership and get goal info
  const { data: checkIn, error: checkInError } = await supabase
    .from("check_ins")
    .select("*, goals(*)")
    .eq("id", checkInId)
    .eq("user_id", user.id)
    .single();

  if (checkInError || !checkIn) {
    return {
      success: false,
      message: "Check-in not found",
    };
  }

  // Delete the check-in
  const { error: deleteError } = await supabase
    .from("check_ins")
    .delete()
    .eq("id", checkInId);

  if (deleteError) {
    console.error("Error deleting check-in:", deleteError);
    return {
      success: false,
      message: "Failed to delete check-in. Please try again.",
    };
  }

  // Update goal's current_value (subtract the deleted check-in value)
  const goal = checkIn.goals as { id: string; current_value: number };
  const newCurrentValue = Math.max(0, goal.current_value - checkIn.value);

  const { error: updateError } = await supabase
    .from("goals")
    .update({ current_value: newCurrentValue })
    .eq("id", checkIn.goal_id);

  if (updateError) {
    console.error("Error updating goal:", updateError);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/goals/${checkIn.goal_id}`);

  return {
    success: true,
    message: "Check-in deleted",
  };
}

/**
 * Get check-ins for a goal with pagination
 */
export async function getCheckIns(
  goalId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ checkIns: CheckIn[]; total: number }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { checkIns: [], total: 0 };
  }

  const offset = (page - 1) * limit;

  // Get total count
  const { count } = await supabase
    .from("check_ins")
    .select("*", { count: "exact", head: true })
    .eq("goal_id", goalId)
    .eq("user_id", user.id);

  // Get paginated check-ins
  const { data: checkIns, error } = await supabase
    .from("check_ins")
    .select("*")
    .eq("goal_id", goalId)
    .eq("user_id", user.id)
    .order("checked_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching check-ins:", error);
    return { checkIns: [], total: 0 };
  }

  return {
    checkIns: checkIns || [],
    total: count || 0,
  };
}

/**
 * Get today's check-in status for multiple goals
 */
export async function getTodayCheckInStatus(
  goalIds: string[]
): Promise<Record<string, boolean>> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || goalIds.length === 0) {
    return {};
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayCheckIns, error } = await supabase
    .from("check_ins")
    .select("goal_id")
    .eq("user_id", user.id)
    .in("goal_id", goalIds)
    .gte("checked_at", todayStart.toISOString());

  if (error) {
    console.error("Error fetching today's check-ins:", error);
    return {};
  }

  const status: Record<string, boolean> = {};
  for (const goalId of goalIds) {
    status[goalId] = todayCheckIns?.some((c) => c.goal_id === goalId) || false;
  }

  return status;
}
