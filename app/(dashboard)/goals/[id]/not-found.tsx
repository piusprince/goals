import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Target01Icon, Home01Icon } from "@hugeicons/core-free-icons";

export default function GoalNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <HugeiconsIcon
            icon={Target01Icon}
            className="h-10 w-10 text-muted-foreground"
          />
        </div>
        <h1 className="mb-2 text-xl font-bold">Goal not found</h1>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          This goal doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button render={<Link href="/dashboard" />} className="flex items-center">
          <HugeiconsIcon icon={Home01Icon} className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
