import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getInviteByToken,
  acceptInvite,
  declineInvite,
} from "@/lib/actions/sharing-actions";
import { InviteAcceptPage } from "./invite-accept-page";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({
  params,
}: Readonly<InvitePageProps>) {
  const { token } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to login with return URL
  if (!user) {
    redirect(`/login?redirect=/invite/${token}`);
  }

  // Get invite details
  const inviteResult = await getInviteByToken(token);

  if (!inviteResult) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid or Expired Invite</h1>
          <p className="text-muted-foreground mb-4">
            This invite link is no longer valid. It may have expired or been
            revoked.
          </p>
          <a href="/dashboard" className="text-primary hover:underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const invite = inviteResult.invite;

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from("goal_members")
    .select("id")
    .eq("goal_id", invite.goal_id)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    redirect(`/goals/${invite.goal_id}`);
  }

  // Check if invite is expired
  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invite Expired</h1>
          <p className="text-muted-foreground mb-4">
            This invite link has expired. Please ask the goal owner for a new
            invite.
          </p>
          <a href="/dashboard" className="text-primary hover:underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Bound server actions
  async function handleAccept() {
    "use server";
    const result = await acceptInvite(token);
    if (result.success && result.goalId) {
      redirect(`/goals/${result.goalId}`);
    }
    // If failed, the page will re-render and show the error
  }

  async function handleDecline() {
    "use server";
    await declineInvite(token);
    redirect("/dashboard");
  }

  return (
    <InviteAcceptPage
      invite={invite}
      acceptAction={handleAccept}
      declineAction={handleDecline}
    />
  );
}
