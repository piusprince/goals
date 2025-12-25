"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GoalWithMembers } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Target01Icon,
  RepeatIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";

interface SharedGoalCardProps {
  goal: GoalWithMembers;
  hasCheckedInToday?: boolean;
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

export function SharedGoalCard({
  goal,
  hasCheckedInToday = false,
}: Readonly<SharedGoalCardProps>) {
  const Icon = typeIcons[goal.type];
  const isCompleted = goal.completed_at !== null;
  const members = goal.members || [];
  const displayedMembers = members.slice(0, 3);
  const remainingCount = members.length - 3;

  const calculateProgress = () => {
    if (goal.type === "target" && goal.target_value) {
      return Math.min(
        100,
        Math.round((goal.current_value / goal.target_value) * 100)
      );
    }
    if (goal.type === "one-time" && isCompleted) {
      return 100;
    }
    return 0;
  };

  const progress = calculateProgress();

  return (
    <Link href={`/goals/${goal.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Card className="transition-shadow hover:shadow-lg border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="line-clamp-1 text-lg">
                  {goal.title}
                </CardTitle>
                <HugeiconsIcon
                  icon={UserMultiple02Icon}
                  className="h-4 w-4 text-primary"
                />
              </div>
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
              <Badge variant="outline" className="text-xs">
                Shared
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {goal.description && (
              <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                {goal.description}
              </p>
            )}

            {/* Members Avatars */}
            {members.length > 0 && (
              <div className="mb-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {displayedMembers.map((member) => (
                    <Avatar
                      key={member.user_id}
                      className="h-7 w-7 border-2 border-background"
                    >
                      <AvatarImage
                        src={member.user?.avatar_url || undefined}
                        alt={member.user?.display_name || "Member"}
                      />
                      <AvatarFallback className="text-xs">
                        {member.user?.display_name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {remainingCount > 0 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                      +{remainingCount}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
              </div>
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
                    isCompleted ? "text-green-600" : "text-muted-foreground"
                  )}
                >
                  {isCompleted ? "Completed" : "In progress"}
                </span>
              </div>
            )}

            {goal.type === "habit" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Streak</span>
                  <span className="flex items-center gap-1 font-medium">
                    {goal.current_streak > 0 && (
                      <span className="text-orange-500">🔥</span>
                    )}
                    {goal.current_streak || 0} days
                  </span>
                </div>
                {hasCheckedInToday ? (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      className="h-3 w-3"
                    />
                    <span>Done today</span>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Not checked in today
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
