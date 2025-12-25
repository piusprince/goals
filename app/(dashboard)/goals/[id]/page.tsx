import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GoalDetail } from "@/components/goals/goal-detail";
import { PageTransition } from "@/components/layout/page-transition";

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

  return (
    <PageTransition>
      <div className="mx-auto max-w-lg py-6">
        <GoalDetail goal={goal} />
      </div>
    </PageTransition>
  );
}
