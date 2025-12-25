"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { CheckIn } from "@/lib/supabase/types";
import { deleteCheckIn } from "@/lib/actions/check-in-actions";
import { Button } from "@/components/ui/button";
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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete01Icon,
  NoteIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface CheckInItemProps {
  checkIn: CheckIn;
  goalType?: "one-time" | "target" | "habit";
}

export function CheckInItem({ checkIn, goalType = "habit" }: Readonly<CheckInItemProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCheckIn(checkIn.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setIsDeleting(false);
  };

  const formattedDate = format(new Date(checkIn.checked_at), "MMM d, yyyy");
  const formattedTime = format(new Date(checkIn.checked_at), "h:mm a");

  return (
    <div className="border-b border-border py-3 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Date and time */}
          <div>
            <p className="font-medium">{formattedDate}</p>
            <p className="text-xs text-muted-foreground">{formattedTime}</p>
          </div>

          {/* Value badge for target goals */}
          {goalType === "target" && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">
              +{checkIn.value}
            </span>
          )}

          {/* Note indicator */}
          {checkIn.note && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={NoteIcon} className="h-4 w-4" />
              <HugeiconsIcon
                icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon}
                className="h-3 w-3"
              />
            </button>
          )}
        </div>

        {/* Delete button */}
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                className="text-muted-foreground hover:text-destructive"
              />
            }
          >
            <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete check-in?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove this check-in and subtract {checkIn.value} from
                your progress. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Expandable note */}
      {checkIn.note && isExpanded && (
        <div
          className={cn(
            "mt-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground",
            "animate-in fade-in slide-in-from-top-1 duration-200"
          )}
        >
          {checkIn.note}
        </div>
      )}
    </div>
  );
}
