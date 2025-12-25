"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface GoalInsights {
  totalCheckIns: number;
  averagePerWeek: number;
  bestDayOfWeek: string | null;
  bestDayCount: number;
  estimatedCompletion: Date | null;
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number; // 0-100 percentage
}

export interface DashboardInsights {
  totalCheckInsThisWeek: number;
  weekOverWeekTrend: number; // Percentage change from last week
  mostConsistentGoal: {
    id: string;
    title: string;
    streak: number;
    checkIns: number; // Check-ins this week
  } | null;
  bestCategory: {
    name: string;
    checkIns: number;
  } | null;
  bestDayOfWeek: string | null;
  bestDayCount: number;
  goalsCompletedThisMonth: number;
}

/**
 * Get insights for a specific goal
 */
export async function getGoalInsights(goalId: string): Promise<{
  success: boolean;
  data?: GoalInsights;
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get the goal
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("*")
    .eq("id", goalId)
    .eq("owner_id", user.id)
    .single();

  if (goalError || !goal) {
    return { success: false, error: "Goal not found" };
  }

  // Get all check-ins for this goal
  const { data: checkIns, error: checkInsError } = await supabase
    .from("check_ins")
    .select("*")
    .eq("goal_id", goalId)
    .eq("user_id", user.id)
    .order("checked_at", { ascending: false });

  if (checkInsError) {
    return { success: false, error: checkInsError.message };
  }

  const totalCheckIns = checkIns?.length || 0;

  // Calculate average per week
  let averagePerWeek = 0;
  if (totalCheckIns > 0 && checkIns) {
    const firstCheckIn = new Date(checkIns[checkIns.length - 1].checked_at);
    const lastCheckIn = new Date(checkIns[0].checked_at);
    const weeksDiff = Math.max(
      1,
      (lastCheckIn.getTime() - firstCheckIn.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );
    averagePerWeek = Math.round((totalCheckIns / weeksDiff) * 10) / 10;
  }

  // Find best day of week
  const dayOfWeekCounts: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  for (const checkIn of checkIns || []) {
    const day = new Date(checkIn.checked_at).getDay();
    dayOfWeekCounts[day]++;
  }

  let bestDay = 0;
  let bestDayCount = 0;
  for (const [day, count] of Object.entries(dayOfWeekCounts)) {
    if (count > bestDayCount) {
      bestDay = Number.parseInt(day);
      bestDayCount = count;
    }
  }

  const bestDayOfWeek = bestDayCount > 0 ? dayNames[bestDay] : null;

  // Calculate estimated completion for target goals
  let estimatedCompletion: Date | null = null;
  if (goal.type === "target" && goal.target_value && averagePerWeek > 0) {
    const remaining = goal.target_value - goal.current_value;
    if (remaining > 0) {
      const averagePerDay = averagePerWeek / 7;
      const daysToComplete = Math.ceil(remaining / averagePerDay);
      estimatedCompletion = new Date();
      estimatedCompletion.setDate(
        estimatedCompletion.getDate() + daysToComplete
      );
    }
  }

  // Calculate consistency score (for habits)
  // Based on check-in frequency in the last 30 days
  let consistencyScore = 0;
  if (checkIns && checkIns.length > 0) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCheckIns = checkIns.filter(
      (c) => new Date(c.checked_at) >= thirtyDaysAgo
    );

    // For habits, perfect score is checking in every day
    // For targets, we just count activity days
    const uniqueDays = new Set(
      recentCheckIns.map(
        (c) => new Date(c.checked_at).toISOString().split("T")[0]
      )
    );

    consistencyScore = Math.round((uniqueDays.size / 30) * 100);
  }

  return {
    success: true,
    data: {
      totalCheckIns,
      averagePerWeek,
      bestDayOfWeek,
      bestDayCount,
      estimatedCompletion,
      currentStreak: goal.current_streak || 0,
      longestStreak: goal.longest_streak || 0,
      consistencyScore,
    },
  };
}

/**
 * Get dashboard-level insights across all goals
 */
export async function getDashboardInsights(): Promise<{
  success: boolean;
  data?: DashboardInsights;
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get start of this week (Sunday)
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Get start of last week
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setMilliseconds(-1);

  // Get start of this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Fetch check-ins this week
  const { data: weekCheckIns, error: weekError } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", user.id)
    .gte("checked_at", startOfWeek.toISOString());

  if (weekError) {
    return { success: false, error: weekError.message };
  }

  // Fetch check-ins last week for comparison
  const { data: lastWeekCheckIns } = await supabase
    .from("check_ins")
    .select("id")
    .eq("user_id", user.id)
    .gte("checked_at", startOfLastWeek.toISOString())
    .lt("checked_at", startOfWeek.toISOString());

  const totalCheckInsThisWeek = weekCheckIns?.length || 0;
  const totalCheckInsLastWeek = lastWeekCheckIns?.length || 0;

  // Calculate week-over-week trend
  let weekOverWeekTrend = 0;
  if (totalCheckInsLastWeek > 0) {
    weekOverWeekTrend = Math.round(
      ((totalCheckInsThisWeek - totalCheckInsLastWeek) /
        totalCheckInsLastWeek) *
        100
    );
  } else if (totalCheckInsThisWeek > 0) {
    weekOverWeekTrend = 100; // Infinite increase from 0
  }

  // Calculate best day of week from this week's check-ins
  const dayOfWeekCounts: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  for (const checkIn of weekCheckIns || []) {
    const day = new Date(checkIn.checked_at).getDay();
    dayOfWeekCounts[day]++;
  }

  let bestDayOfWeek: string | null = null;
  let bestDayCount = 0;
  for (const [day, count] of Object.entries(dayOfWeekCounts)) {
    if (count > bestDayCount) {
      bestDayOfWeek = dayNames[Number.parseInt(day)];
      bestDayCount = count;
    }
  }

  // Find most consistent goal (highest current streak)
  const { data: goals, error: goalsError } = await supabase
    .from("goals")
    .select("id, title, current_streak, category")
    .eq("owner_id", user.id)
    .eq("is_archived", false)
    .eq("type", "habit")
    .order("current_streak", { ascending: false })
    .limit(1);

  if (goalsError) {
    return { success: false, error: goalsError.message };
  }

  // Count check-ins for the most consistent goal this week
  let mostConsistentGoalCheckIns = 0;
  if (goals && goals.length > 0) {
    mostConsistentGoalCheckIns = (weekCheckIns || []).filter(
      (c) => c.goal_id === goals[0].id
    ).length;
  }

  const mostConsistentGoal =
    goals && goals.length > 0
      ? {
          id: goals[0].id,
          title: goals[0].title,
          streak: goals[0].current_streak || 0,
          checkIns: mostConsistentGoalCheckIns,
        }
      : null;

  // Find best category by check-ins this week
  const { data: allGoals } = await supabase
    .from("goals")
    .select("id, category")
    .eq("owner_id", user.id)
    .eq("is_archived", false);

  const goalCategories = new Map(
    (allGoals || []).map((g) => [g.id, g.category])
  );

  const categoryCounts: Record<string, number> = {};
  for (const checkIn of weekCheckIns || []) {
    const category = goalCategories.get(checkIn.goal_id) || "other";
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  let bestCategory: { name: string; checkIns: number } | null = null;
  let maxCategoryCount = 0;
  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCategoryCount) {
      bestCategory = { name: category, checkIns: count };
      maxCategoryCount = count;
    }
  }

  // Count goals completed this month
  const { count: goalsCompletedThisMonth } = await supabase
    .from("goals")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .gte("completed_at", startOfMonth.toISOString());

  return {
    success: true,
    data: {
      totalCheckInsThisWeek,
      weekOverWeekTrend,
      mostConsistentGoal,
      bestCategory,
      bestDayOfWeek,
      bestDayCount,
      goalsCompletedThisMonth: goalsCompletedThisMonth || 0,
    },
  };
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalCheckIns: number;
  goalsCompleted: number;
  longestStreak: {
    goalId: string;
    goalTitle: string;
    streak: number;
  } | null;
  activeGoals: number;
  topGoal: {
    id: string;
    title: string;
    checkIns: number;
    type: string;
  } | null;
  goalBreakdown: Array<{
    id: string;
    title: string;
    type: string;
    category: string;
    checkIns: number;
    currentStreak: number;
    progress: number; // For target goals
  }>;
  achievements: string[]; // List of badges earned this week
}

/**
 * Get weekly summary for a specific week
 * @param weekStart - Start date of the week (defaults to current week)
 */
export async function getWeeklySummary(weekStart?: Date): Promise<{
  success: boolean;
  data?: WeeklySummary;
  error?: string;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Calculate week boundaries
  const startOfWeek = weekStart ? new Date(weekStart) : new Date();
  if (!weekStart) {
    // Default to current week (Sunday start)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  }
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  endOfWeek.setMilliseconds(-1);

  // Fetch all active goals
  const { data: goals, error: goalsError } = await supabase
    .from("goals")
    .select(
      "id, title, type, category, current_streak, target_value, current_value"
    )
    .eq("owner_id", user.id)
    .eq("is_archived", false);

  if (goalsError) {
    return { success: false, error: goalsError.message };
  }

  const activeGoals = goals?.length || 0;

  // Fetch check-ins for this week
  const { data: checkIns, error: checkInsError } = await supabase
    .from("check_ins")
    .select("goal_id, checked_at, value")
    .eq("user_id", user.id)
    .gte("checked_at", startOfWeek.toISOString())
    .lte("checked_at", endOfWeek.toISOString());

  if (checkInsError) {
    return { success: false, error: checkInsError.message };
  }

  const totalCheckIns = checkIns?.length || 0;

  // Count check-ins per goal
  const checkInsByGoal: Record<string, number> = {};
  for (const checkIn of checkIns || []) {
    checkInsByGoal[checkIn.goal_id] =
      (checkInsByGoal[checkIn.goal_id] || 0) + 1;
  }

  // Find top goal by activity
  let topGoal: WeeklySummary["topGoal"] = null;
  let maxCheckIns = 0;
  for (const [goalId, count] of Object.entries(checkInsByGoal)) {
    if (count > maxCheckIns) {
      const goal = goals?.find((g) => g.id === goalId);
      if (goal) {
        topGoal = {
          id: goal.id,
          title: goal.title,
          checkIns: count,
          type: goal.type,
        };
        maxCheckIns = count;
      }
    }
  }

  // Find longest streak
  let longestStreak: WeeklySummary["longestStreak"] = null;
  let maxStreak = 0;
  for (const goal of goals || []) {
    if ((goal.current_streak || 0) > maxStreak) {
      longestStreak = {
        goalId: goal.id,
        goalTitle: goal.title,
        streak: goal.current_streak || 0,
      };
      maxStreak = goal.current_streak || 0;
    }
  }

  // Count goals completed this week
  const { count: goalsCompleted } = await supabase
    .from("goals")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .gte("completed_at", startOfWeek.toISOString())
    .lte("completed_at", endOfWeek.toISOString());

  // Build goal breakdown
  const goalBreakdown = (goals || [])
    .map((goal) => {
      const progress =
        goal.type === "target" && goal.target_value
          ? Math.round((goal.current_value / goal.target_value) * 100)
          : 0;

      return {
        id: goal.id,
        title: goal.title,
        type: goal.type,
        category: goal.category || "other",
        checkIns: checkInsByGoal[goal.id] || 0,
        currentStreak: goal.current_streak || 0,
        progress,
      };
    })
    .sort((a, b) => b.checkIns - a.checkIns); // Sort by most active

  // Fetch badges earned this week
  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select("badges(name)")
    .eq("user_id", user.id)
    .gte("earned_at", startOfWeek.toISOString())
    .lte("earned_at", endOfWeek.toISOString());

  const achievements = (earnedBadges || [])
    .map((ub) => (ub.badges as { name: string } | null)?.name)
    .filter((name): name is string => Boolean(name));

  return {
    success: true,
    data: {
      weekStart: startOfWeek.toISOString(),
      weekEnd: endOfWeek.toISOString(),
      totalCheckIns,
      goalsCompleted: goalsCompleted || 0,
      longestStreak,
      activeGoals,
      topGoal,
      goalBreakdown,
      achievements,
    },
  };
}
