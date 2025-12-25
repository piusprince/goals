import { LinkButton } from "@/components/ui/link-button";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchRemoveIcon, Home01Icon } from "@hugeicons/core-free-icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <HugeiconsIcon
            icon={SearchRemoveIcon}
            className="h-12 w-12 text-muted-foreground"
          />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Page not found</h1>
        <p className="mb-6 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <LinkButton href="/dashboard">
          <HugeiconsIcon icon={Home01Icon} className="mr-2 h-4 w-4" />
          Go to Dashboard
        </LinkButton>
      </div>
    </div>
  );
}
