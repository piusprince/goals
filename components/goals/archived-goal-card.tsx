"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Goal } from "@/lib/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { unarchiveGoal, deleteGoal } from "@/lib/actions/goal-actions";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckCircle,
  Target,
  Repeat,
  RotateCcw,
  Trash2,
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

interface ArchivedGoalCardProps {
  goal: Goal;
}

const typeIcons = {
  "one-time": CheckCircle,
  target: Target,
  habit: Repeat,
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

export function ArchivedGoalCard({ goal }: Readonly<ArchivedGoalCardProps>) {
  const router = useRouter();
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const Icon = typeIcons[goal.type];

  const handleRestore = async () => {
    setIsRestoring(true);
    await unarchiveGoal(goal.id);
    router.refresh();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteGoal(goal.id);
  };

  return (
    <Card className="opacity-75 transition-opacity hover:opacity-100">
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
          <Badge variant="outline" className="text-xs">
            {goal.year}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {goal.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {goal.description}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestore}
            disabled={isRestoring}
            className="flex-1"
          >
            <HugeiconsIcon icon={RotateCcw} className="mr-2 h-4 w-4" />
            {isRestoring ? "Restoring..." : "Restore"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive" size="sm" />}
            >
              <HugeiconsIcon icon={Trash2} className="h-4 w-4" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this goal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
