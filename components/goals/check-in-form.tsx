"use client";

import { useActionState, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCheckIn, type CheckInActionState } from "@/lib/actions/check-in-actions";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Add01Icon,
  Remove01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useBadgeToast } from "@/components/badges/badge-earned-toast";

interface CheckInFormProps {
  goalId: string;
  goalType: "one-time" | "target" | "habit";
  hasCheckedInToday?: boolean;
  targetValue?: number | null;
  currentValue?: number;
  onSuccess?: () => void;
}

const initialState: CheckInActionState = {
  success: false,
  message: "",
  newBadges: [],
};

export function CheckInForm({
  goalId,
  goalType,
  hasCheckedInToday = false,
  targetValue,
  currentValue = 0,
  onSuccess,
}: Readonly<CheckInFormProps>) {
  const [showNote, setShowNote] = useState(false);
  const [value, setValue] = useState(1);
  const { showBadgeToast } = useBadgeToast();

  // Bind goalId to the action
  const boundCreateCheckIn = createCheckIn.bind(null, goalId);
  const [state, formAction, isPending] = useActionState(
    boundCreateCheckIn,
    initialState
  );

  // Call onSuccess when check-in succeeds and show badge toast
  useEffect(() => {
    if (state.success) {
      onSuccess?.();
      
      // Show badge toast if new badges were earned
      if (state.newBadges && state.newBadges.length > 0) {
        showBadgeToast(state.newBadges);
      }
    }
  }, [state.success, state.newBadges, onSuccess, showBadgeToast]);

  // Don't render for one-time goals (they use the toggle)
  if (goalType === "one-time") {
    return null;
  }

  // For habits that already checked in today
  if (goalType === "habit" && hasCheckedInToday) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <HugeiconsIcon
          icon={CheckmarkCircle01Icon}
          className="h-5 w-5 text-green-600 dark:text-green-400"
        />
        <span className="font-medium text-green-700 dark:text-green-300">
          Already checked in today!
        </span>
      </div>
    );
  }

  const remaining = targetValue ? targetValue - currentValue : null;

  return (
    <form action={formAction} className="space-y-4">
      {/* Value input for target goals */}
      {goalType === "target" && (
        <div className="space-y-2">
          <Label htmlFor="value">Add Progress</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setValue((v) => Math.max(1, v - 1))}
              disabled={value <= 1}
            >
              <HugeiconsIcon icon={Remove01Icon} className="h-4 w-4" />
            </Button>
            <Input
              id="value"
              name="value"
              type="number"
              value={value}
              onChange={(e) => setValue(Math.max(1, Number.parseInt(e.target.value) || 1))}
              className="w-24 text-center"
              min={1}
              max={remaining || 10000}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setValue((v) => v + 1)}
              disabled={remaining !== null && value >= remaining}
            >
              <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
            </Button>
            {remaining !== null && (
              <span className="text-sm text-muted-foreground">
                ({remaining} remaining)
              </span>
            )}
          </div>
          {state.errors?.value && (
            <p className="text-sm text-destructive">{state.errors.value[0]}</p>
          )}
        </div>
      )}

      {/* Hidden value input for habits (always 1) */}
      {goalType === "habit" && <input type="hidden" name="value" value="1" />}

      {/* Optional note toggle */}
      {!showNote && (
        <button
          type="button"
          onClick={() => setShowNote(true)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          + Add a note
        </button>
      )}

      {showNote && (
        <div className="space-y-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea
            id="note"
            name="note"
            placeholder="How did it go today?"
            className="min-h-[80px]"
            maxLength={500}
          />
          {state.errors?.note && (
            <p className="text-sm text-destructive">{state.errors.note[0]}</p>
          )}
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full",
          goalType === "habit" && "bg-green-600 hover:bg-green-700"
        )}
      >
        {isPending && "Saving..."}
        {!isPending && goalType === "habit" && (
          <>
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mr-2 h-4 w-4" />
            Check In
          </>
        )}
        {!isPending && goalType === "target" && "Add Progress"}
      </Button>

      {/* Error/Success message */}
      {state.message && !state.success && (
        <p className="text-center text-sm text-destructive">{state.message}</p>
      )}
    </form>
  );
}
