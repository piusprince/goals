import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GoalEditForm } from "@/components/goals/goal-edit-form";
import { LinkButton } from "@/components/ui/link-button";
import { PageTransition } from "@/components/layout/page-transition";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

interface EditGoalPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGoalPage({
  params,
}: Readonly<EditGoalPageProps>) {
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
        <div className="mb-6">
          <LinkButton
            variant="ghost"
            size="sm"
            href={`/goals/${id}`}
            className="mb-4"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Back
          </LinkButton>
          <h1 className="text-xl sm:text-2xl font-bold">Edit Goal</h1>
          <p className="text-sm text-muted-foreground">
            Update your goal details
          </p>
        </div>

        <GoalEditForm goal={goal} />
      </div>
    </PageTransition>
  );
}
