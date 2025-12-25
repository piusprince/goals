import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSharedGoals } from "@/lib/actions/goal-actions";
import { getPendingInviteCount } from "@/lib/actions/sharing-actions";
import { PageTransition } from "@/components/layout/page-transition";
import { SharedGoalsContent } from "./shared-goals-content";

export default async function SharedGoalsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all shared goals and pending invite count
  const [sharedGoals, pendingInviteCount] = await Promise.all([
    getSharedGoals("all"),
    getPendingInviteCount(),
  ]);

  // Separate owned and member goals
  const ownedGoals = sharedGoals.filter((g) => g.owner_id === user.id);
  const memberGoals = sharedGoals.filter((g) => g.owner_id !== user.id);

  return (
    <PageTransition>
      <SharedGoalsContent
        ownedGoals={ownedGoals}
        memberGoals={memberGoals}
        pendingInviteCount={pendingInviteCount}
      />
    </PageTransition>
  );
}
