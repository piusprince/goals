"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { activateStreakFreeze } from "@/lib/actions/streak-freeze-actions";
import { useRouter } from "next/navigation";

interface StreakFreezeToggleProps {
  readonly goalId: string;
  readonly available: number;
  readonly activeUntil: string | null;
  readonly className?: string;
}

export function StreakFreezeToggle({
  goalId,
  available,
  activeUntil,
  className,
}: StreakFreezeToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if a freeze is currently active
  const isActive =
    activeUntil !== null &&
    (() => {
      const activeDate = new Date(activeUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return activeDate >= today;
    })();

  const handleActivate = () => {
    setError(null);
    startTransition(async () => {
      const result = await activateStreakFreeze(goalId);
      if (!result.success) {
        setError(result.error ?? "Failed to activate freeze");
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xl dark:bg-blue-900/30">
            ❄️
          </div>
          <div>
            <h4 className="font-medium">Streak Freeze</h4>
            <p className="text-sm text-muted-foreground">
              Protects your streak if you miss a day
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Available count */}
          <div className="flex items-center gap-1 text-sm">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "inline-block h-2 w-2 rounded-full transition-colors",
                  i < available ? "bg-blue-500" : "bg-muted"
                )}
              />
            ))}
            <span className="ml-1.5 text-muted-foreground">{available}/3</span>
          </div>

          {/* Activate button or status */}
          {isActive ? (
            <div className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <span className="animate-pulse">❄️</span>
              Active Today
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleActivate}
              disabled={isPending || available === 0}
              className="min-w-[80px]"
            >
              {isPending ? "..." : "Activate"}
            </Button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {/* Help text */}
      <p className="mt-3 text-xs text-muted-foreground">
        💡 Earn freezes by maintaining a 7-day streak. Max 3 stored.
        {available === 0 && !isActive && (
          <span className="block mt-1 text-amber-600 dark:text-amber-400">
            Keep your streak going to earn more freezes!
          </span>
        )}
      </p>
    </div>
  );
}
