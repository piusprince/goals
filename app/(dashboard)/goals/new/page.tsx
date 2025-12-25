import { GoalForm } from "@/components/goals/goal-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default function NewGoalPage() {
  return (
    <div className="mx-auto max-w-lg py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/dashboard" />}
          className="mb-4 flex items-center"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Goal</h1>
        <p className="text-muted-foreground">Define what you want to achieve</p>
      </div>

      <GoalForm />
    </div>
  );
}
