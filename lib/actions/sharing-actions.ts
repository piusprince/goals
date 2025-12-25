"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import type {
  Invite,
  InviteRole,
  InviteWithDetails,
} from "@/lib/supabase/types";

const INVITE_EXPIRY_DAYS = 7;

/**
 * Create a new invite for a shared goal
 */
export async function createInvite(
  goalId: string,
  email: string,
  role: InviteRole = "collaborator"
): Promise<{ success: boolean; inviteUrl?: string; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify user is the goal owner
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("id, owner_id, is_shared, title")
    .eq("id", goalId)
    .single();

  if (goalError || !goal) {
    return { success: false, error: "Goal not found" };
  }

  if (goal.owner_id !== user.id) {
    return { success: false, error: "Only the goal owner can send invites" };
  }

  if (!goal.is_shared) {
    return { success: false, error: "Goal must be shared to send invites" };
  }

  // Check if email is already a member
  const { data: existingMember } = await supabase
    .from("goal_members")
    .select("id")
    .eq("goal_id", goalId)
    .eq(
      "user_id",
      (
        await supabase.from("users").select("id").ilike("email", email).single()
      ).data?.id || ""
    )
    .single();

  if (existingMember) {
    return { success: false, error: "This user is already a member" };
  }

  // Check if there's already a pending invite for this email
  const { data: existingInvite } = await supabase
    .from("invites")
    .select("id")
    .eq("goal_id", goalId)
    .ilike("email", email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (existingInvite) {
    return {
      success: false,
      error: "There's already a pending invite for this email",
    };
  }

  // Generate unique token
  const token = nanoid(12);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  // Create invite
  const { error: insertError } = await supabase.from("invites").insert({
    goal_id: goalId,
    inviter_id: user.id,
    email: email.toLowerCase(),
    token,
    role,
    expires_at: expiresAt.toISOString(),
  });

  if (insertError) {
    console.error("Error creating invite:", insertError);
    return { success: false, error: "Failed to create invite" };
  }

  // Generate invite URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/invite/${token}`;

  revalidatePath(`/goals/${goalId}`);

  return { success: true, inviteUrl };
}

/**
 * Get all pending invites for a goal
 */
export async function getInvites(goalId: string): Promise<Invite[]> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: invites, error } = await supabase
    .from("invites")
    .select("*")
    .eq("goal_id", goalId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invites:", error);
    return [];
  }

  return invites || [];
}

/**
 * Revoke an invite
 */
export async function revokeInvite(
  inviteId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get invite to check ownership and goal_id
  const { data: invite, error: fetchError } = await supabase
    .from("invites")
    .select("id, goal_id, inviter_id")
    .eq("id", inviteId)
    .single();

  if (fetchError || !invite) {
    return { success: false, error: "Invite not found" };
  }

  // Verify user is inviter or goal owner
  const { data: goal } = await supabase
    .from("goals")
    .select("owner_id")
    .eq("id", invite.goal_id)
    .single();

  if (invite.inviter_id !== user.id && goal?.owner_id !== user.id) {
    return { success: false, error: "Not authorized to revoke this invite" };
  }

  const { error: deleteError } = await supabase
    .from("invites")
    .delete()
    .eq("id", inviteId);

  if (deleteError) {
    console.error("Error revoking invite:", deleteError);
    return { success: false, error: "Failed to revoke invite" };
  }

  revalidatePath(`/goals/${invite.goal_id}`);

  return { success: true };
}

/**
 * Get invite details by token (for invite acceptance page)
 */
export async function getInviteByToken(token: string): Promise<{
  invite: InviteWithDetails;
  isExpired: boolean;
  isAccepted: boolean;
  isAlreadyMember: boolean;
} | null> {
  const supabase = await createServerClient();

  // Use the public function to get invite details (bypasses RLS)
  const { data, error } = await supabase.rpc("get_invite_by_token", {
    invite_token: token,
  });

  if (error || !data || data.length === 0) {
    console.error("Error fetching invite by token:", error);
    return null;
  }

  const inviteData = data[0];

  // Build the invite object from RPC data
  // We need to get additional invite data for the full record
  const { data: inviteRecord, error: inviteError } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .single();

  if (inviteError || !inviteRecord) {
    console.error("Error fetching invite record:", inviteError);
    // Fall back to constructing from RPC data
    const invite: InviteWithDetails = {
      id: inviteData.id,
      goal_id: inviteData.goal_id,
      inviter_id: "", // Not available from RPC
      email: "",
      token: token,
      role: inviteData.role as InviteRole,
      expires_at: inviteData.expires_at,
      accepted_at: null,
      declined_at: null,
      created_at: "",
      goal: {
        id: inviteData.goal_id,
        title: inviteData.goal_title,
        description: inviteData.goal_description,
      },
      inviter: {
        id: "",
        display_name: inviteData.inviter_name,
        avatar_url: null,
      },
    };

    // Check if current user is already a member
    let isAlreadyMember = false;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: member } = await supabase
        .from("goal_members")
        .select("id")
        .eq("goal_id", inviteData.goal_id)
        .eq("user_id", user.id)
        .single();

      isAlreadyMember = !!member;
    }

    return {
      invite,
      isExpired: inviteData.is_expired,
      isAccepted: inviteData.is_accepted,
      isAlreadyMember,
    };
  }

  // Build invite with full details
  const invite: InviteWithDetails = {
    ...inviteRecord,
    goal: {
      id: inviteData.goal_id,
      title: inviteData.goal_title,
      description: inviteData.goal_description,
    },
    inviter: {
      id: inviteRecord.inviter_id,
      display_name: inviteData.inviter_name,
      avatar_url: null,
    },
  };

  // Check if current user is already a member
  let isAlreadyMember = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: member } = await supabase
      .from("goal_members")
      .select("id")
      .eq("goal_id", invite.goal_id)
      .eq("user_id", user.id)
      .single();

    isAlreadyMember = !!member;
  }

  return {
    invite,
    isExpired: inviteData.is_expired,
    isAccepted: inviteData.is_accepted,
    isAlreadyMember,
  };
}

/**
 * Accept an invitation using RPC function (bypasses RLS)
 */
export async function acceptInvite(
  token: string
): Promise<{ success: boolean; goalId?: string; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Use RPC function to accept invite (bypasses RLS)
  const { data, error } = await supabase.rpc("accept_invite_by_token", {
    invite_token: token,
  });

  if (error) {
    console.error("Error accepting invite:", error);
    return { success: false, error: "Failed to accept invite" };
  }

  const result = data as { success: boolean; goalId?: string; error?: string };

  if (result.success && result.goalId) {
    revalidatePath(`/goals/${result.goalId}`);
    revalidatePath("/shared");
  }

  return result;
}

/**
 * Decline an invitation using RPC function (bypasses RLS)
 */
export async function declineInvite(
  token: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Use RPC function to decline invite (bypasses RLS)
  const { data, error } = await supabase.rpc("decline_invite_by_token", {
    invite_token: token,
  });

  if (error) {
    console.error("Error declining invite:", error);
    return { success: false, error: "Failed to decline invite" };
  }

  const result = data as { success: boolean; error?: string };
  return result;
}

/**
 * Get pending invite count for the current user
 */
export async function getPendingInviteCount(): Promise<number> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return 0;
  }

  const { count, error } = await supabase
    .from("invites")
    .select("*", { count: "exact", head: true })
    .ilike("email", user.email)
    .is("accepted_at", null)
    .is("declined_at", null)
    .gt("expires_at", new Date().toISOString());

  if (error) {
    console.error("Error fetching invite count:", error);
    return 0;
  }

  return count || 0;
}
