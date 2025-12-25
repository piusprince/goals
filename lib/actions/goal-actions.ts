"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { goalFormSchema } from "@/lib/validations/goal-schema";
import { getFieldErrors } from "@/lib/validations/utils";

export type GoalActionState = {
  success: boolean;
  message: string;
  errors?: {
    title?: string[];
    description?: string[];
    type?: string[];
    category?: string[];
    target_value?: string[];
  };
};

export async function createGoal(
  _prevState: GoalActionState | null,
  formData: FormData
): Promise<GoalActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to create a goal",
    };
  }

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    type: formData.get("type") as string,
    category: formData.get("category") as string,
    target_value: formData.get("target_value")
      ? Number(formData.get("target_value"))
      : undefined,
  };

  const validationResult = goalFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    const fieldErrors = getFieldErrors(validationResult.error);
    return {
      success: false,
      message: "Please fix the errors below",
      errors: {
        title: fieldErrors.title,
        description: fieldErrors.description,
        type: fieldErrors.type,
        category: fieldErrors.category,
        target_value: fieldErrors.target_value,
      },
    };
  }

  const { error } = await supabase
    .from("goals")
    .insert({
      title: validationResult.data.title,
      description: validationResult.data.description || null,
      type: validationResult.data.type,
      category: validationResult.data.category || "other",
      target_value: validationResult.data.target_value || null,
      current_value: 0,
      owner_id: user.id,
      year: new Date().getFullYear(),
      is_archived: false,
      completed_at: null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating goal:", error);
    return {
      success: false,
      message: "Failed to create goal. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateGoal(
  goalId: string,
  _prevState: GoalActionState | null,
  formData: FormData
): Promise<GoalActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to update a goal",
    };
  }

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    type: formData.get("type") as string,
    category: formData.get("category") as string,
    target_value: formData.get("target_value")
      ? Number(formData.get("target_value"))
      : undefined,
  };

  const validationResult = goalFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    const fieldErrors = getFieldErrors(validationResult.error);
    return {
      success: false,
      message: "Please fix the errors below",
      errors: {
        title: fieldErrors.title,
        description: fieldErrors.description,
        type: fieldErrors.type,
        category: fieldErrors.category,
        target_value: fieldErrors.target_value,
      },
    };
  }

  const { error } = await supabase
    .from("goals")
    .update({
      title: validationResult.data.title,
      description: validationResult.data.description || null,
      type: validationResult.data.type,
      category: validationResult.data.category || "other",
      target_value: validationResult.data.target_value || null,
    })
    .eq("id", goalId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error updating goal:", error);
    return {
      success: false,
      message: "Failed to update goal. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/goals/${goalId}`);
  redirect(`/goals/${goalId}`);
}

export async function deleteGoal(goalId: string): Promise<GoalActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to delete a goal",
    };
  }

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error deleting goal:", error);
    return {
      success: false,
      message: "Failed to delete goal. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function archiveGoal(goalId: string): Promise<GoalActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to archive a goal",
    };
  }

  const { error } = await supabase
    .from("goals")
    .update({ is_archived: true })
    .eq("id", goalId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error archiving goal:", error);
    return {
      success: false,
      message: "Failed to archive goal. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/archive");
  return {
    success: true,
    message: "Goal archived successfully",
  };
}

export async function unarchiveGoal(goalId: string): Promise<GoalActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in to unarchive a goal",
    };
  }

  const { error } = await supabase
    .from("goals")
    .update({ is_archived: false })
    .eq("id", goalId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error unarchiving goal:", error);
    return {
      success: false,
      message: "Failed to unarchive goal. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/archive");
  return {
    success: true,
    message: "Goal restored successfully",
  };
}

export async function toggleGoalComplete(
  goalId: string,
  isCompleted: boolean
): Promise<GoalActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in",
    };
  }

  const { error } = await supabase
    .from("goals")
    .update({ completed_at: isCompleted ? new Date().toISOString() : null })
    .eq("id", goalId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error toggling goal:", error);
    return {
      success: false,
      message: "Failed to update goal. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/goals/${goalId}`);
  return {
    success: true,
    message: isCompleted
      ? "Goal marked as complete!"
      : "Goal marked as incomplete",
  };
}

export async function updateGoalProgress(
  goalId: string,
  currentValue: number
): Promise<GoalActionState> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in",
    };
  }

  const { error } = await supabase
    .from("goals")
    .update({ current_value: currentValue })
    .eq("id", goalId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error updating progress:", error);
    return {
      success: false,
      message: "Failed to update progress. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/goals/${goalId}`);
  return {
    success: true,
    message: "Progress updated!",
  };
}
