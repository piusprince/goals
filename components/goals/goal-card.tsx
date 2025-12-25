"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Target01Icon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";

interface GoalCardProps {
  goal: Goal;
}

const typeIcons = {
  "one-time": CheckmarkCircle01Icon,
  target: Target01Icon,
  habit: RepeatIcon,
};

const typeLabels = {
  "one-time": "One-time",
  target: "Target",
  habit: "Habit",
};

const categoryColors: Record<string, string> = {
  health: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  finance: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  learning:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  personal:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  career: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
};

export function GoalCard({ goal }: Readonly<GoalCardProps>) {
  const Icon = typeIcons[goal.type];
  
  const calculateProgress = () => {
    if (goal.type === "target" && goal.target_value) {
      return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
    }
    if (goal.type === "one-time" && goal.is_completed) {
      return 100;
    }
    return 0;
  };
  
  const progress = calculateProgress();

  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-1 text-lg">{goal.title}</CardTitle>
            <HugeiconsIcon
              icon={Icon}
              className="h-5 w-5 shrink-0 text-muted-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {typeLabels[goal.type]}
            </Badge>
            {goal.category && (
              <Badge
                className={cn(
                  "text-xs",
                  categoryColors[goal.category] || categoryColors.other
                )}
              >
                {goal.category}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {goal.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {goal.description}
            </p>
          )}

          {goal.type === "target" && goal.target_value && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {goal.current_value} / {goal.target_value}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {goal.type === "one-time" && (
            <div className="flex items-center gap-2 text-sm">
              <span
                className={cn(
                  "font-medium",
                  goal.is_completed ? "text-green-600" : "text-muted-foreground"
                )}
              >
                {goal.is_completed ? "Completed" : "In progress"}
              </span>
            </div>
          )}

          {goal.type === "habit" && (
            <div className="text-sm text-muted-foreground">
              Track your daily habit
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
