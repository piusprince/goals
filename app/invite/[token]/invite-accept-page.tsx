"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InviteWithDetails } from "@/lib/supabase/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Target01Icon, UserMultiple02Icon } from "@hugeicons/core-free-icons";

interface InviteAcceptPageProps {
  invite: InviteWithDetails;
  acceptAction: () => Promise<void>;
  declineAction: () => Promise<void>;
}

const roleLabels: Record<string, string> = {
  collaborator: "Collaborator",
  viewer: "Viewer",
};

const roleDescriptions: Record<string, string> = {
  collaborator: "You can check in and contribute to the goal progress",
  viewer: "You can view the goal and its progress",
};

export function InviteAcceptPage({
  invite,
  acceptAction,
  declineAction,
}: Readonly<InviteAcceptPageProps>) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <HugeiconsIcon
              icon={UserMultiple02Icon}
              className="h-8 w-8 text-primary"
            />
          </div>
          <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
          <CardDescription>
            {invite.inviter?.display_name || "Someone"} invited you to join a
            shared goal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <HugeiconsIcon icon={Target01Icon} className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{invite.goal?.title}</h3>
                {invite.goal?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {invite.goal.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <span className="text-sm text-muted-foreground">Your role:</span>
            <Badge variant="secondary">{roleLabels[invite.role]}</Badge>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {roleDescriptions[invite.role]}
          </p>
        </CardContent>
        <CardFooter className="flex gap-3">
          <form action={declineAction} className="flex-1">
            <Button type="submit" variant="outline" className="w-full">
              Decline
            </Button>
          </form>
          <form action={acceptAction} className="flex-1">
            <Button type="submit" className="w-full">
              Accept Invite
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
