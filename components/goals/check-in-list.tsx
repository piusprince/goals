import Link from "next/link";
import type { CheckIn, CheckInWithUser } from "@/lib/supabase/types";
import { CheckInItem } from "./check-in-item";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface CheckInListProps {
  goalId: string;
  checkIns: CheckIn[] | CheckInWithUser[];
  goalType?: "one-time" | "target" | "habit";
  limit?: number;
  showViewAll?: boolean;
  totalCount?: number;
  isSharedGoal?: boolean;
  currentUserId?: string;
}

export function CheckInList({
  goalId,
  checkIns,
  goalType = "habit",
  limit,
  showViewAll = true,
  totalCount,
  isSharedGoal = false,
  currentUserId,
}: Readonly<CheckInListProps>) {
  const displayedCheckIns = limit ? checkIns.slice(0, limit) : checkIns;
  const hasMore = totalCount
    ? totalCount > displayedCheckIns.length
    : checkIns.length > displayedCheckIns.length;

  if (checkIns.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No check-ins yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Start tracking your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {displayedCheckIns.map((checkIn) => (
        <CheckInItem
          key={checkIn.id}
          checkIn={checkIn}
          goalType={goalType}
          isSharedGoal={isSharedGoal}
          canDelete={!isSharedGoal || checkIn.user_id === currentUserId}
        />
      ))}

      {showViewAll && hasMore && (
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            render={(props) => (
              <Link href={`/goals/${goalId}/check-ins`} {...props} />
            )}
          >
            View All History
            <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
