"use client";

import { Badge, UserBadgeWithDetails } from "@/lib/supabase/types";
import { BadgeWithLabel } from "./badge-display";
import { cn } from "@/lib/utils";

interface BadgeGridProps {
  badges: Badge[];
  earnedBadges: UserBadgeWithDetails[];
  columns?: 3 | 4 | 5;
  className?: string;
}

export function BadgeGrid({
  badges,
  earnedBadges,
  columns = 4,
  className,
}: BadgeGridProps) {
  // Create a map of earned badges for quick lookup
  const earnedMap = new Map(
    earnedBadges.map((ub) => [ub.badge_id, ub.earned_at])
  );

  const gridCols = {
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
  };

  return (
    <div
      className={cn(
        "grid gap-4",
        gridCols[columns],
        className
      )}
    >
      {badges.map((badge) => {
        const earned = earnedMap.has(badge.id);
        const earnedAt = earnedMap.get(badge.id);

        return (
          <BadgeWithLabel
            key={badge.id}
            badge={badge}
            earned={earned}
            earnedAt={earnedAt}
            size="md"
          />
        );
      })}
    </div>
  );
}

// Compact badge row (for dashboard)
interface BadgeRowProps {
  badges: Badge[];
  earnedBadges: UserBadgeWithDetails[];
  maxDisplay?: number;
  className?: string;
}

export function BadgeRow({
  badges,
  earnedBadges,
  maxDisplay = 5,
  className,
}: BadgeRowProps) {
  const earnedMap = new Map(
    earnedBadges.map((ub) => [ub.badge_id, ub.earned_at])
  );

  // Sort badges: earned first, then by sort_order
  const sortedBadges = [...badges].sort((a, b) => {
    const aEarned = earnedMap.has(a.id);
    const bEarned = earnedMap.has(b.id);
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    return a.sort_order - b.sort_order;
  });

  const displayBadges = sortedBadges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {displayBadges.map((badge) => {
        const earned = earnedMap.has(badge.id);
        const earnedAt = earnedMap.get(badge.id);

        return (
          <BadgeWithLabel
            key={badge.id}
            badge={badge}
            earned={earned}
            earnedAt={earnedAt}
            size="sm"
          />
        );
      })}
      {remainingCount > 0 && (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground text-sm font-medium">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

// Progress-focused badge list (for achievements page)
interface BadgeProgressListProps {
  badgeProgress: Array<{
    badge: Badge;
    earned: boolean;
    earnedAt?: string;
    currentProgress: number;
    progressPercent: number;
  }>;
  className?: string;
}

export function BadgeProgressList({
  badgeProgress,
  className,
}: BadgeProgressListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {badgeProgress.map(({ badge, earned, earnedAt, currentProgress, progressPercent }) => (
        <div
          key={badge.id}
          className={cn(
            "flex items-center gap-4 p-3 rounded-lg",
            earned ? "bg-amber-50 dark:bg-amber-900/20" : "bg-muted/50"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full text-2xl",
              earned
                ? "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40"
                : "bg-muted grayscale opacity-50"
            )}
          >
            <span className={cn(!earned && "grayscale")}>{badge.icon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className={cn("font-medium", !earned && "text-muted-foreground")}>
                {badge.name}
              </span>
              {earned && earnedAt && (
                <span className="text-xs text-primary">
                  {new Date(earnedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {badge.description}
            </p>
            {!earned && (
              <div className="space-y-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/50 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentProgress} / {badge.criteria_value}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
