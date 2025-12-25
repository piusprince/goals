"use client";

import { useState } from "react";
import { GoalWithMembers } from "@/lib/supabase/types";
import { SharedGoalCard } from "@/components/goals/shared-goal-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserMultiple02Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

interface SharedGoalsContentProps {
  ownedGoals: GoalWithMembers[];
  memberGoals: GoalWithMembers[];
  pendingInviteCount: number;
}

type FilterType = "all" | "owned" | "member";

export function SharedGoalsContent({
  ownedGoals,
  memberGoals,
  pendingInviteCount,
}: Readonly<SharedGoalsContentProps>) {
  const [filter, setFilter] = useState<FilterType>("all");

  const allGoals = [...ownedGoals, ...memberGoals];

  const filteredGoals =
    filter === "all" ? allGoals : filter === "owned" ? ownedGoals : memberGoals;

  const hasGoals = allGoals.length > 0;

  return (
    <div className="py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Shared Goals</h1>
            <p className="text-muted-foreground">
              Collaborate with others on shared goals
            </p>
          </div>
          {pendingInviteCount > 0 && (
            <Badge variant="default" className="flex items-center gap-1">
              <HugeiconsIcon icon={Mail01Icon} className="h-3 w-3" />
              {pendingInviteCount} pending
            </Badge>
          )}
        </div>
      </div>

      {hasGoals ? (
        <>
          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({allGoals.length})
            </Button>
            <Button
              variant={filter === "owned" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("owned")}
            >
              My Shared ({ownedGoals.length})
            </Button>
            <Button
              variant={filter === "member" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("member")}
            >
              Shared With Me ({memberGoals.length})
            </Button>
          </div>

          {/* Goals Grid */}
          {filteredGoals.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredGoals.map((goal) => (
                <SharedGoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">No goals in this category</p>
            </div>
          )}
        </>
      ) : (
        <EmptySharedGoals />
      )}
    </div>
  );
}

function EmptySharedGoals() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <HugeiconsIcon
          icon={UserMultiple02Icon}
          className="h-12 w-12 text-muted-foreground"
        />
      </div>
      <h2 className="mb-2 text-xl font-semibold">No Shared Goals Yet</h2>
      <p className="max-w-sm text-muted-foreground mb-4">
        Start collaborating by creating a shared goal or accepting an invite
        from others.
      </p>
      <Link href="/goals/new">
        <Button>Create a Shared Goal</Button>
      </Link>
    </div>
  );
}
