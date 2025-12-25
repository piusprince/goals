"use client";

import { useActionState, useState } from "react";
import { updateGoal, GoalActionState } from "@/lib/actions/goal-actions";
import { Goal } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GoalTypeSelector } from "./goal-type-selector";
import { CategorySelector } from "./category-selector";

interface GoalEditFormProps {
  goal: Goal;
}

export function GoalEditForm({ goal }: Readonly<GoalEditFormProps>) {
  const updateGoalWithId = updateGoal.bind(null, goal.id);
  const [state, formAction, isPending] = useActionState<
    GoalActionState | null,
    FormData
  >(updateGoalWithId, null);
  const [goalType, setGoalType] = useState<"one-time" | "target" | "habit">(
    goal.type
  );

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
          defaultValue={goal.title}
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
          defaultValue={goal.description || ""}
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
            defaultValue={goal.target_value || ""}
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
        <CategorySelector
          name="category"
          defaultValue={goal.category || undefined}
        />
        {state?.errors?.category && (
          <p className="text-sm text-destructive">{state.errors.category[0]}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
