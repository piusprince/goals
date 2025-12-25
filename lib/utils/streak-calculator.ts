import type { CheckIn } from "@/lib/supabase/types";

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: Date | null;
}

/**
 * Get the start of a day in the specified timezone
 */
function getStartOfDay(date: Date, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value || "2024";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const day = parts.find((p) => p.type === "day")?.value || "01";
  return new Date(`${year}-${month}-${day}T00:00:00`);
}

/**
 * Get unique dates from check-ins (in user's timezone)
 */
function getUniqueDates(checkIns: CheckIn[], timezone: string): Set<string> {
  const dates = new Set<string>();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  for (const checkIn of checkIns) {
    const dateStr = formatter.format(new Date(checkIn.checked_at));
    dates.add(dateStr);
  }

  return dates;
}

/**
 * Calculate streak from check-ins
 * @param checkIns Array of check-ins for a goal
 * @param timezone User's timezone (default: UTC)
 * @returns StreakResult with current streak, longest streak, and last check-in date
 */
export function calculateStreak(
  checkIns: CheckIn[],
  timezone: string = "UTC"
): StreakResult {
  if (checkIns.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
    };
  }

  // Get unique dates when check-ins occurred
  const dates = getUniqueDates(checkIns, timezone);
  const sortedDates = Array.from(dates).sort().reverse();

  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
    };
  }

  const lastCheckInDate = new Date(sortedDates[0]);

  // Get today's date in the timezone
  const today = getStartOfDay(new Date(), timezone);
  const todayStr = today.toISOString().split("T")[0];

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = todayStr;

  // Check if we have a check-in for today or yesterday
  const hasToday = dates.has(todayStr);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const hasYesterday = dates.has(yesterdayStr);

  if (!hasToday && !hasYesterday) {
    // Streak is broken - no check-in today or yesterday
    currentStreak = 0;
  } else {
    // Start from the most recent check-in day
    checkDate = hasToday ? todayStr : yesterdayStr;

    while (dates.has(checkDate)) {
      currentStreak++;
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      checkDate = prevDate.toISOString().split("T")[0];
    }
  }

  // Calculate longest streak from all check-ins
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = new Date(sortedDates[i]);
    const nextDate = new Date(sortedDates[i + 1]);

    // Check if consecutive days
    const diffDays = Math.floor(
      (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastCheckInDate,
  };
}

/**
 * Check if user has checked in today
 */
export function hasCheckedInToday(
  checkIns: CheckIn[],
  timezone: string = "UTC"
): boolean {
  if (checkIns.length === 0) return false;

  const dates = getUniqueDates(checkIns, timezone);
  const today = getStartOfDay(new Date(), timezone);
  const todayStr = today.toISOString().split("T")[0];

  return dates.has(todayStr);
}

/**
 * Update streak values after a new check-in
 * @param freezeProtected If true, a streak freeze was active, so don't reset streak even if 2+ days gap
 */
export function updateStreakOnCheckIn(
  currentStreak: number,
  longestStreak: number,
  lastCheckInDate: Date | null,
  newCheckInDate: Date,
  freezeProtected: boolean = false,
  timezone: string = "UTC"
): StreakResult {
  const today = getStartOfDay(newCheckInDate, timezone);
  const todayStr = today.toISOString().split("T")[0];

  if (!lastCheckInDate) {
    // First check-in ever
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastCheckInDate: newCheckInDate,
    };
  }

  const lastDateStart = getStartOfDay(lastCheckInDate, timezone);
  const lastDateStr = lastDateStart.toISOString().split("T")[0];

  if (todayStr === lastDateStr) {
    // Already checked in today - no change to streak
    return {
      currentStreak,
      longestStreak,
      lastCheckInDate: newCheckInDate,
    };
  }

  const diffDays = Math.floor(
    (today.getTime() - lastDateStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) {
    // Consecutive day - increment streak
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastCheckInDate: newCheckInDate,
    };
  } else if (diffDays === 2 && freezeProtected) {
    // Missed one day but freeze protected - increment streak
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastCheckInDate: newCheckInDate,
    };
  } else {
    // Streak broken - start new streak
    return {
      currentStreak: 1,
      longestStreak: longestStreak,
      lastCheckInDate: newCheckInDate,
    };
  }
}

/**
 * Get check-ins grouped by date
 */
export function groupCheckInsByDate(
  checkIns: CheckIn[],
  timezone: string = "UTC"
): Map<string, CheckIn[]> {
  const grouped = new Map<string, CheckIn[]>();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  for (const checkIn of checkIns) {
    const dateStr = formatter.format(new Date(checkIn.checked_at));
    const existing = grouped.get(dateStr) || [];
    existing.push(checkIn);
    grouped.set(dateStr, existing);
  }

  return grouped;
}
