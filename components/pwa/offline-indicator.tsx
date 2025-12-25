"use client";

import { useOnlineStatus } from "@/lib/hooks/use-online-status";
import { HugeiconsIcon } from "@hugeicons/react";
import { WifiDisconnected01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  readonly className?: string;
}

/**
 * A small banner that appears at the top of the screen when the user is offline.
 * Slides in from the top with a subtle animation.
 */
export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();

  // Don't render anything when online
  if (isOnline) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-amber-500 text-amber-950",
        "flex items-center justify-center gap-2",
        "px-4 py-2 text-sm font-medium",
        "animate-in slide-in-from-top duration-300",
        "shadow-md",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <HugeiconsIcon
        icon={WifiDisconnected01Icon}
        className="h-4 w-4"
        aria-hidden="true"
      />
      <span>You&apos;re offline. Some features may be unavailable.</span>
    </div>
  );
}
