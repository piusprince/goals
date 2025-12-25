"use client";

import { GoalInsights } from "@/lib/actions/insights-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InsightsCardProps {
  readonly insights: GoalInsights;
  readonly goalType: "one-time" | "target" | "habit";
  readonly className?: string;
}

interface InsightItemProps {
  readonly label: string;
  readonly value: string;
  readonly subValue?: string;
  readonly icon: string;
  readonly highlight?: boolean;
  readonly className?: string;
}

// Compact insights row for dashboard
interface InsightsRowProps {
  readonly totalCheckIns: number;
  readonly avgPerWeek: number;
  readonly bestDay: string | null;
  readonly className?: string;
}

export function InsightsCard({
  insights,
  goalType,
  className,
}: InsightsCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>📊</span>
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Total Check-ins */}
          <InsightItem
            label="Total Check-ins"
            value={insights.totalCheckIns.toString()}
            icon="📝"
          />

          {/* Average per Week */}
          <InsightItem
            label="Avg per Week"
            value={insights.averagePerWeek.toFixed(1)}
            icon="📈"
          />

          {/* Best Day */}
          {insights.bestDayOfWeek && (
            <InsightItem
              label="Best Day"
              value={insights.bestDayOfWeek}
              subValue={`${insights.bestDayCount} check-ins`}
              icon="⭐"
              highlight
            />
          )}

          {/* Consistency Score */}
          {goalType === "habit" && (
            <InsightItem
              label="Consistency"
              value={`${insights.consistencyScore}%`}
              subValue="Last 30 days"
              icon={
                insights.consistencyScore >= 70
                  ? "🔥"
                  : insights.consistencyScore >= 40
                  ? "📊"
                  : "💪"
              }
            />
          )}

          {/* Streak Info (for habits) */}
          {goalType === "habit" && insights.currentStreak > 0 && (
            <InsightItem
              label="Current Streak"
              value={`${insights.currentStreak} days`}
              subValue={`Best: ${insights.longestStreak} days`}
              icon="🔥"
              highlight={insights.currentStreak === insights.longestStreak}
            />
          )}

          {/* Estimated Completion (for targets) */}
          {goalType === "target" && insights.estimatedCompletion && (
            <InsightItem
              label="Est. Completion"
              value={formatDate(insights.estimatedCompletion)}
              icon="🎯"
              className="col-span-2"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightItem({
  label,
  value,
  subValue,
  icon,
  highlight = false,
  className,
}: InsightItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        highlight &&
          "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
        className
      )}
    >
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold truncate">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        )}
      </div>
    </div>
  );
}

export function InsightsRow({
  totalCheckIns,
  avgPerWeek,
  bestDay,
  className,
}: InsightsRowProps) {
  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      <div className="flex items-center gap-1.5">
        <span>📝</span>
        <span className="text-muted-foreground">{totalCheckIns} total</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span>📈</span>
        <span className="text-muted-foreground">
          {avgPerWeek.toFixed(1)}/week
        </span>
      </div>
      {bestDay && (
        <div className="flex items-center gap-1.5">
          <span>⭐</span>
          <span className="text-muted-foreground">{bestDay}s</span>
        </div>
      )}
    </div>
  );
}
