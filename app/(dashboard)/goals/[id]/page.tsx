import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GoalDetail } from "@/components/goals/goal-detail";
import { PageTransition } from "@/components/layout/page-transition";
import {
  getCheckIns,
  getTodayCheckInStatus,
} from "@/lib/actions/check-in-actions";
import { getStreakFreezeStatus } from "@/lib/actions/streak-freeze-actions";
import { getGoalInsights } from "@/lib/actions/insights-actions";
import {
  getGoalMembers,
  getMemberProgress,
  checkMembership,
} from "@/lib/actions/members-actions";

interface GoalPageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalPage({ params }: Readonly<GoalPageProps>) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: goal, error } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .single();

  // Check if user has access (owner or member)
  const membershipResult = await checkMembership(id);
  const currentUserRole = membershipResult.role;
  const isOwner = goal?.owner_id === user.id;

  // User must be owner or a member to view the goal
  if (error || !goal || (!isOwner && !membershipResult.isMember)) {
    notFound();
  }

  // Fetch check-ins, today's status, streak freeze, insights, and sharing data in parallel
  const [
    checkInsResult,
    todayStatusResult,
    freezeResult,
    insightsResult,
    membersResult,
    memberProgressResult,
  ] = await Promise.all([
    getCheckIns(id, 1, 100), // Get last 100 check-ins for charts
    getTodayCheckInStatus([id]),
    goal.type === "habit"
      ? getStreakFreezeStatus(id)
      : Promise.resolve({ success: true, data: null }),
    getGoalInsights(id),
    goal.is_shared ? getGoalMembers(id) : Promise.resolve([]),
    goal.is_shared ? getMemberProgress(id) : Promise.resolve([]),
  ]);

  const checkIns = checkInsResult.checkIns;
  const hasCheckedInToday = todayStatusResult[id] ?? false;
  const totalCheckIns = checkInsResult.total;
  const streakFreeze = freezeResult.success ? freezeResult.data : null;
  const insights = insightsResult.success ? insightsResult.data : null;
  const members = Array.isArray(membersResult) ? membersResult : [];
  const memberProgress = Array.isArray(memberProgressResult)
    ? memberProgressResult
    : [];

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg py-6">
        <GoalDetail
          goal={goal}
          checkIns={checkIns}
          hasCheckedInToday={hasCheckedInToday}
          totalCheckIns={totalCheckIns ?? 0}
          streakFreeze={streakFreeze}
          insights={insights}
          members={members}
          memberProgress={memberProgress}
          currentUserId={user.id}
          currentUserRole={currentUserRole}
        />
      </div>
    </PageTransition>
  );
}
