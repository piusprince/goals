"use client";

import { useActionState, useState } from "react";
import { createGoal, GoalActionState } from "@/lib/actions/goal-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GoalTypeSelector } from "./goal-type-selector";
import { CategorySelector } from "./category-selector";
import { UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Switch } from "@/components/ui/switch";

export function GoalForm() {
  const [state, formAction, isPending] = useActionState<
    GoalActionState | null,
    FormData
  >(createGoal, null);
  const [goalType, setGoalType] = useState<"one-time" | "target" | "habit">(
    "one-time"
  );
  const [isShared, setIsShared] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && !state.success && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Goal Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="What do you want to achieve?"
          maxLength={200}
          required
        />
        {state?.errors?.title && (
          <p className="text-sm text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Add more details about your goal..."
          maxLength={1000}
          rows={3}
        />
        {state?.errors?.description && (
          <p className="text-sm text-destructive">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Goal Type *</Label>
        <GoalTypeSelector value={goalType} onChange={setGoalType} />
        <input type="hidden" name="type" value={goalType} />
        {state?.errors?.type && (
          <p className="text-sm text-destructive">{state.errors.type[0]}</p>
        )}
      </div>

      {goalType === "target" && (
        <div className="space-y-2">
          <Label htmlFor="target_value">Target Value *</Label>
          <Input
            id="target_value"
            name="target_value"
            type="number"
            min={1}
            placeholder="e.g., 100"
            required
          />
          {state?.errors?.target_value && (
            <p className="text-sm text-destructive">
              {state.errors.target_value[0]}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Category</Label>
        <CategorySelector name="category" />
        {state?.errors?.category && (
          <p className="text-sm text-destructive">{state.errors.category[0]}</p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <HugeiconsIcon
            icon={UserMultiple02Icon}
            className="h-5 w-5 text-muted-foreground"
          />
          <div>
            <Label
              htmlFor="is_shared"
              className="text-base font-medium cursor-pointer"
            >
              Shared Goal
            </Label>
            <p className="text-sm text-muted-foreground">
              Invite others to contribute to this goal
            </p>
          </div>
        </div>
        <Switch
          id="is_shared"
          name="is_shared"
          checked={isShared}
          onCheckedChange={(checked) => setIsShared(checked)}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Creating..." : "Create Goal"}
        </Button>
      </div>
    </form>
  );
}
