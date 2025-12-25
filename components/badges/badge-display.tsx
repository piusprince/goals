"use client";

import { Badge } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface BadgeDisplayProps {
  badge: Badge;
  earned: boolean;
  earnedAt?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

export function BadgeDisplay({
  badge,
  earned,
  earnedAt,
  size = "md",
  showTooltip = true,
  className,
}: BadgeDisplayProps) {
  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-4xl",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={cn("group relative inline-block", className)}>
      {/* Badge Icon */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full transition-all duration-200",
          sizeClasses[size],
          earned
            ? "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 shadow-lg shadow-amber-500/20"
            : "bg-muted grayscale opacity-50"
        )}
      >
        <span className={cn(!earned && "grayscale")}>{badge.icon}</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-[160px] text-center">
          <div className="font-semibold text-sm">{badge.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {badge.description}
          </div>
          {earned && earnedAt && (
            <div className="text-xs text-primary mt-1">
              Earned {formatDate(earnedAt)}
            </div>
          )}
          {!earned && (
            <div className="text-xs text-muted-foreground mt-1 italic">
              Not yet earned
            </div>
          )}
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
        </div>
      )}
    </div>
  );
}

// Badge with name label below
export function BadgeWithLabel({
  badge,
  earned,
  earnedAt,
  size = "md",
  className,
}: BadgeDisplayProps) {
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <BadgeDisplay
        badge={badge}
        earned={earned}
        earnedAt={earnedAt}
        size={size}
        showTooltip={true}
      />
      <span
        className={cn(
          "text-xs font-medium text-center",
          earned ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {badge.name}
      </span>
    </div>
  );
}
