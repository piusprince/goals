"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Target01Icon } from "@hugeicons/core-free-icons";

interface EmptyStateProps {
  year: number;
}

export function EmptyState({ year }: Readonly<EmptyStateProps>) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <HugeiconsIcon icon={Target01Icon} className="h-12 w-12 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">No goals for {year}</h2>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Start your journey by creating your first goal. What would you like to
        achieve this year?
      </p>
      <Button render={<Link href="/goals/new" />}>
        Create Your First Goal
      </Button>
    </div>
  );
}
