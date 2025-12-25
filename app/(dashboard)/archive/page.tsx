import { createServerClient } from "@/lib/supabase/server";
import { ArchivedGoalCard } from "@/components/goals/archived-goal-card";
import { PageTransition } from "@/components/layout/page-transition";
import { HugeiconsIcon } from "@hugeicons/react";
import { Archive } from "@hugeicons/core-free-icons";

export default async function ArchivePage() {
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
    .eq("is_archived", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching archived goals:", error);
  }

  return (
    <PageTransition>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Archive</h1>
          <p className="text-sm text-muted-foreground">Your archived goals</p>
        </div>

        {goals && goals.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <ArchivedGoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <HugeiconsIcon
                icon={Archive}
                className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground"
              />
            </div>
            <h2 className="mb-2 text-lg sm:text-xl font-semibold">
              No archived goals
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              When you archive a goal, it will appear here.
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
