"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, RefreshIcon, Home01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-4">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            className="h-10 w-10 text-destructive"
          />
        </div>
        <h1 className="mb-2 text-xl font-bold">Something went wrong</h1>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          We had trouble loading this page. Please try again.
        </p>
        <div className="flex gap-3">
          <Button onClick={reset} size="sm">
            <HugeiconsIcon icon={RefreshIcon} className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" size="sm" render={<Link href="/dashboard" />}>
            <HugeiconsIcon icon={Home01Icon} className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mt-6 max-w-lg rounded-lg bg-muted p-4 text-left">
            <p className="mb-1 text-xs font-medium">Error details:</p>
            <code className="text-xs text-muted-foreground break-all">
              {error.message}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
