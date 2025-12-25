"use client";

import { useServiceWorker } from "@/lib/hooks/use-service-worker";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface UpdateNotificationProps {
  readonly className?: string;
}

/**
 * A toast-style notification that appears when a new version of the app is available.
 * Provides a button to reload and activate the new version.
 */
export function UpdateNotification({ className }: UpdateNotificationProps) {
  const { hasUpdate, updateServiceWorker } = useServiceWorker();

  if (!hasUpdate) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-40 sm:left-auto sm:right-4 sm:max-w-sm",
        "rounded-lg border bg-card p-4 shadow-lg",
        "animate-in slide-in-from-bottom-4 duration-300",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
          <HugeiconsIcon
            icon={RefreshIcon}
            className="h-5 w-5 text-blue-500"
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-foreground">Update Available</h3>
          <p className="text-sm text-muted-foreground">
            A new version of Goals Tracker is ready. Refresh to update.
          </p>
        </div>
      </div>

      {/* Update button */}
      <div className="mt-3 flex justify-end">
        <Button onClick={updateServiceWorker} size="sm" variant="default">
          <HugeiconsIcon
            icon={RefreshIcon}
            className="mr-2 h-4 w-4"
            aria-hidden="true"
          />
          Refresh
        </Button>
      </div>
    </div>
  );
}
