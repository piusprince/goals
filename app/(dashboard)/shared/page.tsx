import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSharedGoals } from "@/lib/actions/goal-actions";
import { getPendingInviteCount } from "@/lib/actions/sharing-actions";
import { PageTransition } from "@/components/layout/page-transition";
import { SharedGoalsContent } from "./shared-goals-content";
import { GoalWithMembers } from "@/lib/supabase/types";

export default async function SharedGoalsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all shared goals and pending invite count
  const [sharedGoalsRaw, pendingInviteCount] = await Promise.all([
    getSharedGoals("all"),
    getPendingInviteCount(),
  ]);

  // Add memberCount to each goal (cast as GoalWithMembers for type safety)
  const sharedGoals = sharedGoalsRaw.map((goal) => ({
    ...goal,
    memberCount: goal.members?.length ?? 0,
  })) as GoalWithMembers[];

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
