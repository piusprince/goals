import type { Goal } from "@/lib/supabase/types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ProgressSummaryProps {
  goal: Goal;
  hasCheckedInToday?: boolean;
  className?: string;
}

export function ProgressSummary({
  goal,
  hasCheckedInToday = false,
  className,
}: Readonly<ProgressSummaryProps>) {
  const isCompleted = goal.completed_at !== null;

  // Calculate progress percentage for target goals
  const progressPercentage =
    goal.type === "target" && goal.target_value
      ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
      : 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* One-time goal */}
      {goal.type === "one-time" && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                ✓ Completed
              </Badge>
              {goal.completed_at && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(goal.completed_at), "MMM d, yyyy")}
                </span>
              )}
            </div>
          ) : (
            <Badge variant="secondary">In Progress</Badge>
          )}
        </div>
      )}

      {/* Target goal */}
      {goal.type === "target" && goal.target_value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {goal.current_value} / {goal.target_value}{" "}
              <span className="text-muted-foreground">({progressPercentage}%)</span>
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          {isCompleted && (
            <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              ✓ Goal Achieved!
            </Badge>
          )}
        </div>
      )}

      {/* Habit goal */}
      {goal.type === "habit" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Today&apos;s Status</span>
            {hasCheckedInToday ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                ✓ Done today
              </Badge>
            ) : (
              <Badge variant="outline">Not yet</Badge>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total check-ins</span>
            <span className="font-medium">{goal.current_value}</span>
          </div>
        </div>
      )}
    </div>
  );
}
