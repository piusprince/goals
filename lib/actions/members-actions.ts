"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  GoalMemberWithUser,
  GoalMemberRole,
  SharedGoalProgress,
} from "@/lib/supabase/types";

/**
 * Get all members of a goal
 */
export async function getGoalMembers(
  goalId: string
): Promise<GoalMemberWithUser[]> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: members, error } = await supabase
    .from("goal_members")
    .select(
      `
      *,
      user:users(id, display_name, avatar_url)
    `
    )
    .eq("goal_id", goalId)
    .order("role", { ascending: true }) // owner first
    .order("accepted_at", { ascending: true });

  if (error) {
    console.error("Error fetching goal members:", error);
    return [];
  }

  return (members || []) as GoalMemberWithUser[];
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  goalId: string,
  userId: string,
  newRole: "collaborator" | "viewer"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify current user is the goal owner
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("owner_id")
    .eq("id", goalId)
    .single();

  if (goalError || !goal) {
    return { success: false, error: "Goal not found" };
  }

  if (goal.owner_id !== user.id) {
    return { success: false, error: "Only the goal owner can change roles" };
  }

  // Can't change owner's role
  if (userId === user.id) {
    return { success: false, error: "Cannot change the owner's role" };
  }

  // Update role
  const { error: updateError } = await supabase
    .from("goal_members")
    .update({ role: newRole })
    .eq("goal_id", goalId)
    .eq("user_id", userId);

  if (updateError) {
    console.error("Error updating member role:", updateError);
    return { success: false, error: "Failed to update role" };
  }

  revalidatePath(`/goals/${goalId}`);

  return { success: true };
}

/**
 * Remove a member from a goal
 */
export async function removeMember(
  goalId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify current user is the goal owner
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("owner_id")
    .eq("id", goalId)
    .single();

  if (goalError || !goal) {
    return { success: false, error: "Goal not found" };
  }

  if (goal.owner_id !== user.id) {
    return { success: false, error: "Only the goal owner can remove members" };
  }

  // Can't remove owner
  if (userId === goal.owner_id) {
    return { success: false, error: "Cannot remove the goal owner" };
  }

  // Delete member (preserves their check-ins)
  const { error: deleteError } = await supabase
    .from("goal_members")
    .delete()
    .eq("goal_id", goalId)
    .eq("user_id", userId);

  if (deleteError) {
    console.error("Error removing member:", deleteError);
    return { success: false, error: "Failed to remove member" };
  }

  revalidatePath(`/goals/${goalId}`);

  return { success: true };
}

/**
 * Leave a goal (for non-owners)
 */
export async function leaveGoal(
  goalId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if user is the owner
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("owner_id")
    .eq("id", goalId)
    .single();

  if (goalError || !goal) {
    return { success: false, error: "Goal not found" };
  }

  if (goal.owner_id === user.id) {
    return {
      success: false,
      error:
        "Owners cannot leave their goals. Transfer ownership or delete the goal.",
    };
  }

  // Delete own membership (preserves check-ins)
  const { error: deleteError } = await supabase
    .from("goal_members")
    .delete()
    .eq("goal_id", goalId)
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Error leaving goal:", deleteError);
    return { success: false, error: "Failed to leave goal" };
  }

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/shared");

  return { success: true };
}

/**
 * Get progress stats for each member of a shared goal
 */
export async function getMemberProgress(
  goalId: string
): Promise<SharedGoalProgress[]> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get goal info
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("type, target_value")
    .eq("id", goalId)
    .single();

  if (goalError || !goal) {
    return [];
  }

  // Get all members with their users
  const { data: members, error: membersError } = await supabase
    .from("goal_members")
    .select(
      `
      id,
      user_id,
      role,
      user:users(id, display_name, avatar_url)
    `
    )
    .eq("goal_id", goalId);

  if (membersError || !members) {
    return [];
  }

  // Get all check-ins for this goal
  const { data: checkIns, error: checkInsError } = await supabase
    .from("check_ins")
    .select("*")
    .eq("goal_id", goalId)
    .order("checked_at", { ascending: false });

  if (checkInsError) {
    console.error("Error fetching check-ins:", checkInsError);
    return [];
  }

  // Calculate progress for each member
  const progress: SharedGoalProgress[] = members.map((member) => {
    const memberCheckIns = (checkIns || []).filter(
      (c) => c.user_id === member.user_id
    );

    // Calculate current streak
    let currentStreak = 0;
    if (memberCheckIns.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sortedDates = memberCheckIns
        .map((c) => new Date(c.checked_at))
        .sort((a, b) => b.getTime() - a.getTime());

      let checkDate = new Date(sortedDates[0]);
      checkDate.setHours(0, 0, 0, 0);

      // Check if most recent check-in is today or yesterday
      const diffDays = Math.floor(
        (today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 1) {
        currentStreak = 1;
        let lastDate = checkDate;

        for (let i = 1; i < sortedDates.length; i++) {
          const thisDate = new Date(sortedDates[i]);
          thisDate.setHours(0, 0, 0, 0);

          const dayDiff = Math.floor(
            (lastDate.getTime() - thisDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (dayDiff === 1) {
            currentStreak++;
            lastDate = thisDate;
          } else if (dayDiff === 0) {
            // Same day, continue
            continue;
          } else {
            break;
          }
        }
      }
    }

    // Calculate contributed value
    const contributedValue = memberCheckIns.reduce(
      (sum, c) => sum + c.value,
      0
    );

    const userData = member.user as {
      id: string;
      display_name: string;
      avatar_url: string | null;
    };

    return {
      memberId: member.id,
      userId: member.user_id,
      displayName: userData?.display_name || "Unknown",
      avatarUrl: userData?.avatar_url || null,
      role: member.role as GoalMemberRole,
      checkInCount: memberCheckIns.length,
      currentStreak,
      lastCheckIn: memberCheckIns[0]?.checked_at || null,
      contributedValue,
    };
  });

  // Sort by most recent activity
  return progress.sort((a, b) => {
    if (!a.lastCheckIn && !b.lastCheckIn) return 0;
    if (!a.lastCheckIn) return 1;
    if (!b.lastCheckIn) return -1;
    return (
      new Date(b.lastCheckIn).getTime() - new Date(a.lastCheckIn).getTime()
    );
  });
}

/**
 * Check if current user is a member of a goal
 */
export async function checkMembership(goalId: string): Promise<{
  isMember: boolean;
  role?: GoalMemberRole;
  isOwner?: boolean;
}> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isMember: false };
  }

  // First check if user is the owner
  const { data: goal } = await supabase
    .from("goals")
    .select("owner_id")
    .eq("id", goalId)
    .single();

  if (goal?.owner_id === user.id) {
    return { isMember: true, role: "owner", isOwner: true };
  }

  // Check goal_members table
  const { data: member, error } = await supabase
    .from("goal_members")
    .select("role")
    .eq("goal_id", goalId)
    .eq("user_id", user.id)
    .single();

  if (error || !member) {
    return { isMember: false };
  }

  return {
    isMember: true,
    role: member.role as GoalMemberRole,
    isOwner: member.role === "owner",
  };
}
