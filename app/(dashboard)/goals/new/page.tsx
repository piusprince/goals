import { GoalForm } from "@/components/goals/goal-form";
import { LinkButton } from "@/components/ui/link-button";
import { PageTransition } from "@/components/layout/page-transition";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default function NewGoalPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-lg py-6">
        <div className="mb-6">
          <LinkButton
            variant="ghost"
            size="sm"
            href="/dashboard"
            className="mb-4"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Back
          </LinkButton>
          <h1 className="text-xl sm:text-2xl font-bold">Create New Goal</h1>
          <p className="text-sm text-muted-foreground">
            Define what you want to achieve
          </p>
        </div>

        <GoalForm />
      </div>
    </PageTransition>
  );
}
