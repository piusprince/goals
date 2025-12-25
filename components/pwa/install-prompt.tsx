"use client";

import { useInstallPrompt } from "@/lib/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface InstallPromptProps {
  readonly className?: string;
}

/**
 * A dismissible banner prompting the user to install the PWA.
 * Only appears when:
 * - The browser supports install prompt
 * - The app is not already installed
 * - The user hasn't dismissed it recently (7 days)
 */
export function InstallPrompt({ className }: InstallPromptProps) {
  const { canInstall, promptInstall, dismissPrompt } = useInstallPrompt();

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      // Analytics or toast could go here
      console.log("App installed successfully");
    }
  };

  if (!canInstall) {
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <HugeiconsIcon
            icon={Download01Icon}
            className="h-5 w-5 text-primary"
            aria-hidden="true"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-foreground">
            Install Goals Tracker
          </h3>
          <p className="text-sm text-muted-foreground">
            Add to your home screen for quick access and offline support.
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={dismissPrompt}
          className="shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Dismiss install prompt"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            className="h-4 w-4"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Install button */}
      <div className="mt-3 flex justify-end">
        <Button onClick={handleInstall} size="sm">
          <HugeiconsIcon
            icon={Download01Icon}
            className="mr-2 h-4 w-4"
            aria-hidden="true"
          />
          Install
        </Button>
      </div>
    </div>
  );
}
