"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AnalyticsUpIcon,
  Calendar01Icon,
  Award01Icon,
  CheckmarkSquare02Icon,
} from "@hugeicons/core-free-icons";
import type { DashboardInsights as DashboardInsightsType } from "@/lib/actions/insights-actions";

interface DashboardInsightsProps {
  insights: DashboardInsightsType;
  className?: string;
}

interface InsightItemProps {
  icon: typeof AnalyticsUpIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  iconColor?: string;
}

function InsightItem({
  icon: Icon,
  label,
  value,
  subtitle,
  iconColor,
}: Readonly<InsightItemProps>) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted",
          iconColor
        )}
      >
        <HugeiconsIcon icon={Icon} className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold truncate">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function DashboardInsights({
  insights,
  className,
}: Readonly<DashboardInsightsProps>) {
  // Calculate trend indicator
  const trendText =
    insights.weekOverWeekTrend > 0
      ? `↑ ${insights.weekOverWeekTrend}% from last week`
      : insights.weekOverWeekTrend < 0
      ? `↓ ${Math.abs(insights.weekOverWeekTrend)}% from last week`
      : "Same as last week";

  return (
    <Card className={cn("mb-6", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <HugeiconsIcon
            icon={AnalyticsUpIcon}
            className="h-5 w-5 text-primary"
          />
          Weekly Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Weekly Check-ins */}
          <InsightItem
            icon={CheckmarkSquare02Icon}
            label="Check-ins This Week"
            value={insights.totalCheckInsThisWeek}
            subtitle={trendText}
            iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />

          {/* Most Consistent Goal */}
          {insights.mostConsistentGoal ? (
            <InsightItem
              icon={Award01Icon}
              label="Most Consistent"
              value={insights.mostConsistentGoal.title}
              subtitle={`${insights.mostConsistentGoal.checkIns} check-ins this week`}
              iconColor="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            />
          ) : (
            <InsightItem
              icon={Award01Icon}
              label="Most Consistent"
              value="No data yet"
              subtitle="Start checking in to see insights"
              iconColor="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            />
          )}

          {/* Best Day */}
          {insights.bestDayOfWeek ? (
            <InsightItem
              icon={Calendar01Icon}
              label="Best Day"
              value={insights.bestDayOfWeek}
              subtitle={`${insights.bestDayCount} check-ins on ${insights.bestDayOfWeek}s`}
              iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            />
          ) : (
            <InsightItem
              icon={Calendar01Icon}
              label="Best Day"
              value="Not enough data"
              subtitle="Keep tracking to discover patterns"
              iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            />
          )}
        </div>

        {/* Encouragement message */}
        {insights.totalCheckInsThisWeek === 0 && (
          <div className="mt-4 rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-sm text-muted-foreground">
              No check-ins this week yet. Start tracking your progress! 💪
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
