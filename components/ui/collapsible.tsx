"use client";

import * as React from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { cn } from "@/lib/utils";

const CollapsibleRoot = React.forwardRef<
  React.ElementRef<typeof Collapsible.Root>,
  React.ComponentPropsWithoutRef<typeof Collapsible.Root>
>(({ className, ...props }, ref) => (
  <Collapsible.Root ref={ref} className={cn("", className)} {...props} />
));
CollapsibleRoot.displayName = "Collapsible";

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof Collapsible.Trigger>,
  React.ComponentPropsWithoutRef<typeof Collapsible.Trigger>
>(({ className, ...props }, ref) => (
  <Collapsible.Trigger ref={ref} className={cn("", className)} {...props} />
));
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsiblePanel = React.forwardRef<
  React.ElementRef<typeof Collapsible.Panel>,
  React.ComponentPropsWithoutRef<typeof Collapsible.Panel>
>(({ className, ...props }, ref) => (
  <Collapsible.Panel
    ref={ref}
    className={cn(
      "overflow-hidden transition-all duration-200 ease-out",
      "data-[ending-style]:h-0 data-[starting-style]:h-0",
      className
    )}
    {...props}
  />
));
CollapsiblePanel.displayName = "CollapsiblePanel";

export {
  CollapsibleRoot as Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel as CollapsibleContent,
};
