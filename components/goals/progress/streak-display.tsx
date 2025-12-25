"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FireIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  hasCheckedInToday?: boolean;
  className?: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  hasCheckedInToday = false,
  className,
}: Readonly<StreakDisplayProps>) {
  const isOnFire = currentStreak >= 3;
  const isNewRecord = currentStreak > 0 && currentStreak >= longestStreak;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isOnFire
          ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
          : "border-border bg-muted/30",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={
              isOnFire
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, -5, 5, 0],
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              repeat: isOnFire ? Infinity : 0,
              repeatDelay: 2,
            }}
          >
            <HugeiconsIcon
              icon={FireIcon}
              className={cn(
                "h-8 w-8",
                isOnFire
                  ? "text-orange-500"
                  : "text-muted-foreground"
              )}
            />
          </motion.div>
          <div>
            <motion.p
              key={currentStreak}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "text-2xl font-bold",
                isOnFire
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-foreground"
              )}
            >
              {currentStreak} {currentStreak === 1 ? "day" : "days"}
            </motion.p>
            <p className="text-sm text-muted-foreground">
              Current streak
              {isNewRecord && currentStreak > 0 && (
                <span className="ml-2 text-orange-600 dark:text-orange-400">
                  🎉 New record!
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">Longest streak</p>
        </div>
      </div>
    </div>
  );
}
