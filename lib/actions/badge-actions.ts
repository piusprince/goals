"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import {
  Badge,
  UserBadgeWithDetails,
  BadgeCriteriaType,
} from "@/lib/supabase/types";

/**
 * Get all available badges
 */
export async function getAllBadges(): Promise<{
  success: boolean;
  data?: Badge[];
  error?: string;
}> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Get all badges earned by the current user
 */
export async function getUserBadges(): Promise<{
  success: boolean;
  data?: UserBadgeWithDetails[];
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
    .from("user_badges")
    .select(
      `
      *,
      badge:badges(*)
    `
    )
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  // Transform data to match UserBadgeWithDetails type
  const badges =
    data?.map((item) => ({
      ...item,
      badge: item.badge as Badge,
    })) || [];

  return { success: true, data: badges };
}

/**
 * Get recently earned badges for the current user
 */
export async function getRecentBadges(limit: number = 5): Promise<{
  success: boolean;
  data?: UserBadgeWithDetails[];
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
    .from("user_badges")
    .select(
      `
      *,
      badge:badges(*)
    `
    )
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error: error.message };
  }

  const badges =
    data?.map((item) => ({
      ...item,
      badge: item.badge as Badge,
    })) || [];

  return { success: true, data: badges };
}

// Context needed to check badge criteria
export interface BadgeCheckContext {
  streakDays: number;
  totalCheckIns: number;
  goalsCompleted: number;
  goalId?: string; // Optional: the goal that triggered this check
}

/**
 * Check and award any earned badges for the current user
 * Returns newly awarded badges
 */
export async function checkAndAwardBadges(context: BadgeCheckContext): Promise<{
  success: boolean;
  newBadges?: Badge[];
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get all badges
  const { data: allBadges, error: badgesError } = await supabase
    .from("badges")
    .select("*");

  if (badgesError) {
    return { success: false, error: badgesError.message };
  }

  // Get user's existing badges
  const { data: userBadges, error: userBadgesError } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", user.id);

  if (userBadgesError) {
    return { success: false, error: userBadgesError.message };
  }

  const earnedBadgeIds = new Set(userBadges?.map((ub) => ub.badge_id) || []);
  const newBadges: Badge[] = [];

  // Check each badge
  for (const badge of allBadges || []) {
    // Skip if already earned
    if (earnedBadgeIds.has(badge.id)) {
      continue;
    }

    // Check if badge criteria is met
    const isMet = checkBadgeCriteria(
      badge.criteria_type,
      badge.criteria_value,
      context
    );

    if (isMet) {
      // Award the badge
      const { error: insertError } = await supabase.from("user_badges").insert({
        user_id: user.id,
        badge_id: badge.id,
        goal_id: context.goalId || null,
      });

      if (!insertError) {
        newBadges.push(badge);
      }
    }
  }

  // Revalidate paths if badges were awarded
  if (newBadges.length > 0) {
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    revalidatePath("/settings");
  }

  return { success: true, newBadges };
}

/**
 * Check if a badge criteria is met
 */
function checkBadgeCriteria(
  criteriaType: BadgeCriteriaType,
  criteriaValue: number,
  context: BadgeCheckContext
): boolean {
  switch (criteriaType) {
    case "streak_days":
      return context.streakDays >= criteriaValue;
    case "total_check_ins":
      return context.totalCheckIns >= criteriaValue;
    case "goals_completed":
      return context.goalsCompleted >= criteriaValue;
    default:
      return false;
  }
}

/**
 * Get badge progress for all badges
 * Returns each badge with current progress and completion percentage
 */
export async function getBadgeProgress(): Promise<{
  success: boolean;
  data?: Array<{
    badge: Badge;
    earned: boolean;
    earnedAt?: string;
    currentProgress: number;
    progressPercent: number;
  }>;
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get all badges
  const { data: allBadges, error: badgesError } = await supabase
    .from("badges")
    .select("*")
    .order("sort_order", { ascending: true });

  if (badgesError) {
    return { success: false, error: badgesError.message };
  }

  // Get user's existing badges
  const { data: userBadges, error: userBadgesError } = await supabase
    .from("user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", user.id);

  if (userBadgesError) {
    return { success: false, error: userBadgesError.message };
  }

  // Get user stats for progress calculation
  const stats = await getUserStatsForBadges(user.id);

  const earnedBadgesMap = new Map(
    userBadges?.map((ub) => [ub.badge_id, ub.earned_at]) || []
  );

  const badgeProgress = (allBadges || []).map((badge) => {
    const earned = earnedBadgesMap.has(badge.id);
    const currentProgress = getProgressForCriteria(badge.criteria_type, stats);
    const progressPercent = Math.min(
      (currentProgress / badge.criteria_value) * 100,
      100
    );

    return {
      badge,
      earned,
      earnedAt: earned ? earnedBadgesMap.get(badge.id) : undefined,
      currentProgress,
      progressPercent,
    };
  });

  return { success: true, data: badgeProgress };
}

/**
 * Get user stats for badge progress calculation
 */
async function getUserStatsForBadges(userId: string) {
  const supabase = await createServerClient();

  // Get max streak from goals
  const { data: goals } = await supabase
    .from("goals")
    .select("current_streak, longest_streak, completed_at")
    .eq("owner_id", userId);

  const maxStreak = Math.max(
    0,
    ...(goals || []).map((g) => Math.max(g.current_streak, g.longest_streak))
  );

  const goalsCompleted = (goals || []).filter(
    (g) => g.completed_at !== null
  ).length;

  // Get total check-ins
  const { count: totalCheckIns } = await supabase
    .from("check_ins")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  return {
    streakDays: maxStreak,
    totalCheckIns: totalCheckIns || 0,
    goalsCompleted,
  };
}

/**
 * Get progress value for a specific criteria type
 */
function getProgressForCriteria(
  criteriaType: BadgeCriteriaType,
  stats: { streakDays: number; totalCheckIns: number; goalsCompleted: number }
): number {
  switch (criteriaType) {
    case "streak_days":
      return stats.streakDays;
    case "total_check_ins":
      return stats.totalCheckIns;
    case "goals_completed":
      return stats.goalsCompleted;
    default:
      return 0;
  }
}
