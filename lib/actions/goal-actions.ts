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

  const isShared = formData.get("is_shared") === "on";

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
      is_shared: isShared,
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

/**
 * Toggle a goal's shared status
 */
export async function toggleGoalShared(
  goalId: string,
  isShared: boolean
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

  // If turning off sharing, we should remove all non-owner members
  if (!isShared) {
    // First, remove all non-owner members
    await supabase
      .from("goal_members")
      .delete()
      .eq("goal_id", goalId)
      .neq("role", "owner");

    // Delete pending invites
    await supabase.from("invites").delete().eq("goal_id", goalId);
  }

  // Update the goal
  const { error } = await supabase
    .from("goals")
    .update({ is_shared: isShared })
    .eq("id", goalId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error toggling shared status:", error);
    return {
      success: false,
      message: "Failed to update sharing status. Please try again.",
    };
  }

  // If enabling sharing, ensure owner is in goal_members
  if (isShared) {
    await supabase.from("goal_members").upsert(
      {
        goal_id: goalId,
        user_id: user.id,
        role: "owner",
        accepted_at: new Date().toISOString(),
      },
      { onConflict: "goal_id,user_id" }
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/shared");

  return {
    success: true,
    message: isShared
      ? "Goal is now shared! You can invite collaborators."
      : "Goal is now private.",
  };
}

/**
 * Get all shared goals for the current user
 */
export async function getSharedGoals(
  filter: "all" | "my-goals" | "joined" = "all"
) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  let query = supabase
    .from("goals")
    .select(
      `
      *,
      members:goal_members(
        id,
        user_id,
        role,
        user:users(id, display_name, avatar_url)
      )
    `
    )
    .eq("is_shared", true)
    .eq("is_archived", false);

  if (filter === "my-goals") {
    // Goals where user is owner
    query = query.eq("owner_id", user.id);
  } else if (filter === "joined") {
    // Goals where user is a member but not owner
    const { data: memberGoalIds } = await supabase
      .from("goal_members")
      .select("goal_id")
      .eq("user_id", user.id);

    const goalIds = memberGoalIds?.map((m) => m.goal_id) || [];

    query = query.neq("owner_id", user.id).in("id", goalIds);
  } else {
    // All shared goals user has access to
    // Either owner or member
    const { data: memberGoalIds } = await supabase
      .from("goal_members")
      .select("goal_id")
      .eq("user_id", user.id);

    const goalIds = memberGoalIds?.map((m) => m.goal_id) || [];

    if (goalIds.length > 0) {
      query = query.or(`owner_id.eq.${user.id},id.in.(${goalIds.join(",")})`);
    } else {
      query = query.eq("owner_id", user.id);
    }
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching shared goals:", error);
    return [];
  }

  return data || [];
}
