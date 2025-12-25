import { createServerClient } from "@/lib/supabase/server";
import { GoalCard } from "@/components/goals/goal-card";
import { EmptyState } from "@/components/goals/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { PageTransition } from "@/components/layout/page-transition";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardInsights } from "@/components/dashboard/dashboard-insights";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { getTodayCheckInStatus } from "@/lib/actions/check-in-actions";
import { getDashboardInsights } from "@/lib/actions/insights-actions";

interface DashboardPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: Readonly<DashboardPageProps>) {
  const params = await searchParams;
  const year = params.year
    ? Number.parseInt(params.year)
    : new Date().getFullYear();

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: goals, error } = await supabase
    .from("goals")
    .select("*")
    .eq("owner_id", user.id)
    .eq("year", year)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching goals:", error);
  }

  // Fetch today's check-in status for all goals
  const goalIds = goals?.map((g) => g.id) || [];
  const todayCheckInStatus = goalIds.length > 0 
    ? await getTodayCheckInStatus(goalIds) 
    : {};

  // Fetch dashboard insights
  const insightsResult = await getDashboardInsights();

  // Calculate stats
  const totalGoals = goals?.length || 0;
  const completedGoals = goals?.filter((g) => g.completed_at !== null).length || 0;
  const activeStreaks = goals?.filter((g) => g.type === "habit" && (g.current_streak || 0) > 0).length || 0;
  const todayCheckIns = Object.values(todayCheckInStatus).filter(Boolean).length;

  return (
    <PageTransition>
      <div className="py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold">My Goals</h1>
          <LinkButton href="/goals/new">
            <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Goal</span>
            <span className="sm:hidden">New</span>
          </LinkButton>
        </div>

        {/* Dashboard Stats */}
        {totalGoals > 0 && (
          <DashboardStats
            totalGoals={totalGoals}
            completedGoals={completedGoals}
            activeStreaks={activeStreaks}
            todayCheckIns={todayCheckIns}
          />
        )}

        {/* Dashboard Insights */}
        {totalGoals > 0 && insightsResult.success && insightsResult.data && (
          <DashboardInsights insights={insightsResult.data} />
        )}

        {goals && goals.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal}
                hasCheckedInToday={todayCheckInStatus[goal.id] ?? false}
              />
            ))}
          </div>
        ) : (
          <EmptyState year={year} />
        )}
      </div>
    </PageTransition>
  );
}
