import { createServerClient } from "@/lib/supabase/server";
import { GoalCard } from "@/components/goals/goal-card";
import { EmptyState } from "@/components/goals/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

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

  return (
    <div className="py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Goals</h1>
        <LinkButton href="/goals/new">
          <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
          New Goal
        </LinkButton>
      </div>

      {goals && goals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <EmptyState year={year} />
      )}
    </div>
  );
}
