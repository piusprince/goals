"use client";

import { useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Delete01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { revokeInvite } from "@/lib/actions/sharing-actions";
import { Button } from "@/components/ui/button";
import type { Invite } from "@/lib/supabase/types";
import { toast } from "sonner";

interface InviteListProps {
  invites: Invite[];
  onRevoke?: () => void;
}

export function InviteList({ invites, onRevoke }: InviteListProps) {
  const [isPending, startTransition] = useTransition();

  const handleCopyLink = async (token: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const inviteUrl = `${baseUrl}/invite/${token}`;
    await navigator.clipboard.writeText(inviteUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleRevoke = (inviteId: string) => {
    startTransition(async () => {
      const result = await revokeInvite(inviteId);
      if (result.success) {
        toast.success("Invite revoked");
        onRevoke?.();
      } else {
        toast.error(result.error || "Failed to revoke invite");
      }
    });
  };

  const getExpirationText = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffHours = Math.ceil(
      (expires.getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours <= 0) return "Expired";
    if (diffHours < 24) return `${diffHours}h left`;
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays}d left`;
  };

  const getRoleColor = (role: string) => {
    return role === "collaborator"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  if (invites.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No pending invites</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{invite.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleColor(
                  invite.role
                )}`}
              >
                {invite.role}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock01Icon className="h-3 w-3" />
                {getExpirationText(invite.expires_at)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopyLink(invite.token)}
              title="Copy invite link"
              className="h-8 w-8"
            >
              <Copy01Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRevoke(invite.id)}
              disabled={isPending}
              title="Revoke invite"
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Delete01Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
