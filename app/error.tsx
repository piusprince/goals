"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Readonly<ErrorPageProps>) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-4">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            className="h-12 w-12 text-destructive"
          />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Something went wrong!</h1>
        <p className="mb-6 max-w-md text-muted-foreground">
          We encountered an unexpected error. Please try again or contact
          support if the problem persists.
        </p>
        <div className="flex gap-3">
          <Button onClick={reset} variant="default">
            <HugeiconsIcon icon={RefreshIcon} className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            render={(props) => <Link href="/dashboard" {...props} />}
          >
            Go to Dashboard
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mt-6 max-w-lg rounded-lg bg-muted p-4 text-left">
            <p className="mb-1 text-sm font-medium">Error details:</p>
            <code className="text-xs text-muted-foreground">
              {error.message}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
