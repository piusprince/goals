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
    .eq("owner_id", user.id)
    .single();

  if (error || !goal) {
    notFound();
  }

  // Fetch check-ins, today's status, streak freeze, and insights in parallel
  const [checkInsResult, todayStatusResult, freezeResult, insightsResult] =
    await Promise.all([
      getCheckIns(id, 1, 100), // Get last 100 check-ins for charts
      getTodayCheckInStatus([id]),
      goal.type === "habit"
        ? getStreakFreezeStatus(id)
        : Promise.resolve({ success: true, data: null }),
      getGoalInsights(id),
    ]);

  const checkIns = checkInsResult.checkIns;
  const hasCheckedInToday = todayStatusResult[id] ?? false;
  const totalCheckIns = checkInsResult.total;
  const streakFreeze = freezeResult.success ? freezeResult.data : null;
  const insights = insightsResult.success ? insightsResult.data : null;

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
        />
      </div>
    </PageTransition>
  );
}
