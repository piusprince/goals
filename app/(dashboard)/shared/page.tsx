import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon } from "@hugeicons/core-free-icons";

export default function SharedPage() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Shared Goals</h1>
        <p className="text-muted-foreground">Goals shared with you</p>
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <HugeiconsIcon
            icon={UserGroupIcon}
            className="h-12 w-12 text-muted-foreground"
          />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Coming Soon</h2>
        <p className="max-w-sm text-muted-foreground">
          Goal sharing and collaboration features will be available in Phase 3.
        </p>
      </div>
    </div>
  );
}
