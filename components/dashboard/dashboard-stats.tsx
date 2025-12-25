"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Target01Icon,
  CheckmarkCircle01Icon,
  FireIcon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";

interface DashboardStatsProps {
  totalGoals: number;
  completedGoals: number;
  activeStreaks: number;
  todayCheckIns: number;
  className?: string;
}

interface StatItemProps {
  icon: typeof Target01Icon;
  label: string;
  value: number | string;
  iconColor?: string;
}

function StatItem({ icon: Icon, label, value, iconColor }: Readonly<StatItemProps>) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
          iconColor
        )}
      >
        <HugeiconsIcon icon={Icon} className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function DashboardStats({
  totalGoals,
  completedGoals,
  activeStreaks,
  todayCheckIns,
  className,
}: Readonly<DashboardStatsProps>) {
  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <Card className={cn("mb-6", className)}>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatItem
            icon={Target01Icon}
            label="Total Goals"
            value={totalGoals}
            iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatItem
            icon={CheckmarkCircle01Icon}
            label="Completed"
            value={`${completedGoals} (${completionRate}%)`}
            iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          />
          <StatItem
            icon={FireIcon}
            label="Active Streaks"
            value={activeStreaks}
            iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          />
          <StatItem
            icon={RepeatIcon}
            label="Today's Check-ins"
            value={todayCheckIns}
            iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          />
        </div>
      </CardContent>
    </Card>
  );
}
