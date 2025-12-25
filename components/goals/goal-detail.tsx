"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Goal, CheckIn } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  deleteGoal,
  archiveGoal,
  toggleGoalComplete,
} from "@/lib/actions/goal-actions";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  Archive01Icon,
  CheckmarkCircle01Icon,
  Target01Icon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckInForm } from "./check-in-form";
import { CheckInList } from "./check-in-list";
import {
  StreakDisplay,
  ProgressSummary,
  ProgressChart,
} from "./progress";

interface GoalDetailProps {
  goal: Goal;
  checkIns?: CheckIn[];
  hasCheckedInToday?: boolean;
  totalCheckIns?: number;
}

const typeIcons = {
  "one-time": CheckmarkCircle01Icon,
  target: Target01Icon,
  habit: RepeatIcon,
};

const typeLabels = {
  "one-time": "One-time Goal",
  target: "Target Goal",
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

export function GoalDetail({ 
  goal, 
  checkIns = [], 
  hasCheckedInToday = false,
  totalCheckIns = 0,
}: Readonly<GoalDetailProps>) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Computed from completed_at timestamp
  const isCompleted = goal.completed_at !== null;

  const Icon = typeIcons[goal.type];

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteGoal(goal.id);
    if (!result.success) {
      toast.error(result.message);
      setIsDeleting(false);
    }
    // On success, redirect happens in the action
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    const result = await archiveGoal(goal.id);
    if (result.success) {
      toast.success(result.message);
      router.push("/dashboard");
    } else {
      toast.error(result.message);
      setIsArchiving(false);
    }
  };

  const handleToggleComplete = async () => {
    setIsToggling(true);
    const result = await toggleGoalComplete(goal.id, !isCompleted);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setIsToggling(false);
  };

  const handleCheckInSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          render={(props) => <Link href="/dashboard" {...props} />}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            render={(props) => (
              <Link href={`/goals/${goal.id}/edit`} {...props} />
            )}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{goal.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <HugeiconsIcon icon={Icon} className="h-3 w-3" />
                  {typeLabels[goal.type]}
                </Badge>
                {goal.category && (
                  <Badge
                    className={cn(
                      categoryColors[goal.category] || categoryColors.other
                    )}
                  >
                    {goal.category}
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {goal.description && (
            <div>
              <h3 className="mb-2 font-medium">Description</h3>
              <p className="text-muted-foreground">{goal.description}</p>
            </div>
          )}

          {/* One-time goal: Toggle complete */}
          {goal.type === "one-time" && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">Status</h3>
                <p className="text-sm text-muted-foreground">
                  {isCompleted
                    ? "This goal is complete!"
                    : "Mark as complete when done"}
                </p>
              </div>
              <Button
                onClick={handleToggleComplete}
                disabled={isToggling}
                variant={isCompleted ? "outline" : "default"}
              >
                {isToggling && "Updating..."}
                {!isToggling && isCompleted && "Mark Incomplete"}
                {!isToggling && !isCompleted && "Mark Complete"}
              </Button>
            </div>
          )}

          {/* Target goal: Progress tracker with check-ins */}
          {goal.type === "target" && goal.target_value && (
            <div className="space-y-6">
              {/* Progress Summary */}
              <ProgressSummary
                goal={goal}
                hasCheckedInToday={hasCheckedInToday}
              />

              {/* Check-in Form */}
              <CheckInForm
                goalId={goal.id}
                goalType="target"
                hasCheckedInToday={hasCheckedInToday}
                onSuccess={handleCheckInSuccess}
              />

              {/* Progress Chart */}
              {checkIns.length > 0 && (
                <ProgressChart
                  checkIns={checkIns}
                  goalType="target"
                  targetValue={goal.target_value}
                />
              )}

              {/* Recent Check-ins */}
              <CheckInList
                checkIns={checkIns.slice(0, 5)}
                goalId={goal.id}
                goalType="target"
                totalCount={totalCheckIns}
              />
            </div>
          )}

          {/* Habit goal: Streak and check-ins */}
          {goal.type === "habit" && (
            <div className="space-y-6">
              {/* Streak Display */}
              <StreakDisplay
                currentStreak={goal.current_streak || 0}
                longestStreak={goal.longest_streak || 0}
                hasCheckedInToday={hasCheckedInToday}
              />

              {/* Check-in Form */}
              <CheckInForm
                goalId={goal.id}
                goalType="habit"
                hasCheckedInToday={hasCheckedInToday}
                onSuccess={handleCheckInSuccess}
              />

              {/* Progress Chart (Calendar Heatmap) */}
              <ProgressChart
                checkIns={checkIns}
                goalType="habit"
              />

              {/* Recent Check-ins */}
              <CheckInList
                checkIns={checkIns.slice(0, 5)}
                goalId={goal.id}
                goalType="habit"
                totalCount={totalCheckIns}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 border-t pt-4">
            <Button
              variant="outline"
              onClick={handleArchive}
              disabled={isArchiving}
              className="flex-1"
            >
              <HugeiconsIcon icon={Archive01Icon} className="mr-2 h-4 w-4" />
              {isArchiving ? "Archiving..." : "Archive"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="destructive" className="flex-1" />}
              >
                <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
                Delete
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your goal.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
