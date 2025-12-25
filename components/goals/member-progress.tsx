"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  FireIcon,
  Calendar01Icon,
  BarChartIcon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { SharedGoalProgress, GoalMemberRole } from "@/lib/supabase/types";
import { formatDistanceToNow } from "date-fns";

interface MemberProgressProps {
  progress: SharedGoalProgress[];
  goalType: "one-time" | "target" | "habit";
  targetValue?: number;
}

export function MemberProgress({
  progress,
  goalType,
  targetValue,
}: Readonly<MemberProgressProps>) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: GoalMemberRole) => {
    switch (role) {
      case "owner":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "collaborator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "viewer":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const calculateProgress = (contributed: number) => {
    if (!targetValue || targetValue === 0) return 0;
    return Math.min((contributed / targetValue) * 100, 100);
  };

  if (progress.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No progress data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {progress.map((member) => (
        <div key={member.memberId} className="p-4 border rounded-lg space-y-3">
          {/* Member Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatarUrl || undefined} />
                <AvatarFallback>
                  {getInitials(member.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.displayName}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleBadgeColor(
                    member.role
                  )}`}
                >
                  {member.role}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Check-ins */}
            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon
                icon={BarChartIcon}
                className="h-4 w-4 text-muted-foreground"
              />
              <div>
                <p className="font-medium">{member.checkInCount}</p>
                <p className="text-xs text-muted-foreground">check-ins</p>
              </div>
            </div>

            {/* Streak (for habits) */}
            {goalType === "habit" && (
              <div className="flex items-center gap-2 text-sm">
                <HugeiconsIcon
                  icon={FireIcon}
                  className="h-4 w-4 text-orange-500"
                />
                <div>
                  <p className="font-medium">{member.currentStreak} days</p>
                  <p className="text-xs text-muted-foreground">streak</p>
                </div>
              </div>
            )}

            {/* Contributed Value (for targets) */}
            {goalType === "target" && (
              <div className="flex items-center gap-2 text-sm">
                <HugeiconsIcon
                  icon={BarChartIcon}
                  className="h-4 w-4 text-blue-500"
                />
                <div>
                  <p className="font-medium">{member.contributedValue}</p>
                  <p className="text-xs text-muted-foreground">contributed</p>
                </div>
              </div>
            )}

            {/* Last Check-in */}
            <div className="flex items-center gap-2 text-sm">
              <HugeiconsIcon
                icon={Calendar01Icon}
                className="h-4 w-4 text-muted-foreground"
              />
              <div>
                <p className="font-medium">
                  {member.lastCheckIn
                    ? formatDistanceToNow(new Date(member.lastCheckIn), {
                        addSuffix: true,
                      })
                    : "Never"}
                </p>
                <p className="text-xs text-muted-foreground">last activity</p>
              </div>
            </div>
          </div>

          {/* Progress Bar (for target goals) */}
          {goalType === "target" && targetValue && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Contribution</span>
                <span>
                  {member.contributedValue} / {targetValue}
                </span>
              </div>
              <Progress
                value={calculateProgress(member.contributedValue)}
                className="h-2"
              />
            </div>
          )}
        </div>
      ))}

      {/* Combined Stats */}
      {goalType === "target" && targetValue && (
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm font-medium text-center">
            Team Total:{" "}
            {progress.reduce((sum, p) => sum + p.contributedValue, 0)} /{" "}
            {targetValue}
          </p>
          <Progress
            value={calculateProgress(
              progress.reduce((sum, p) => sum + p.contributedValue, 0)
            )}
            className="h-3 mt-2"
          />
        </div>
      )}
    </div>
  );
}
