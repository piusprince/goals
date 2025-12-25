"use client";

import * as React from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, label }, ref) => {
    return (
      <BaseProgress.Root
        ref={ref}
        className={cn("grid w-full gap-y-1", className)}
        value={value}
        max={max}
      >
        {showLabel && (
          <div className="flex justify-between text-sm">
            {label && (
              <BaseProgress.Label className="font-medium text-foreground">
                {label}
              </BaseProgress.Label>
            )}
            <BaseProgress.Value className="text-muted-foreground" />
          </div>
        )}
        <BaseProgress.Track className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
          <BaseProgress.Indicator className="block h-full bg-primary transition-all duration-300" />
        </BaseProgress.Track>
      </BaseProgress.Root>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
