"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Mail01Icon,
  UserAdd01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import {
  createInvite,
  getInvites,
  revokeInvite,
} from "@/lib/actions/sharing-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Invite, InviteRole } from "@/lib/supabase/types";
import { toast } from "sonner";

interface ShareGoalModalProps {
  goalId: string;
  goalTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onInviteSent?: () => void;
}

export function ShareGoalModal({
  goalId,
  goalTitle,
  isOpen,
  onClose,
  onInviteSent,
}: ShareGoalModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("collaborator");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const loadInvites = useCallback(async () => {
    const result = await getInvites(goalId);
    setInvites(result);
  }, [goalId]);

  // Fetch existing invites when modal opens
  useEffect(() => {
    if (isOpen) {
      loadInvites();
    }
  }, [isOpen, loadInvites]);

  const handleSendInvite = () => {
    if (!email) return;

    startTransition(async () => {
      const result = await createInvite(goalId, email, role);

      if (result.success && result.inviteUrl) {
        setInviteUrl(result.inviteUrl);
        setEmail("");
        toast.success("Invitation sent!");
        loadInvites();
        onInviteSent?.();
      } else {
        toast.error(result.error || "Failed to send invite");
      }
    });
  };

  const handleCopyLink = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevokeInvite = (inviteId: string) => {
    startTransition(async () => {
      const result = await revokeInvite(inviteId);
      if (result.success) {
        toast.success("Invite revoked");
        loadInvites();
      } else {
        toast.error(result.error || "Failed to revoke invite");
      }
    });
  };

  const getExpirationText = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffDays = Math.ceil(
      (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays === 1 ? "Expires in 1 day" : `Expires in ${diffDays} days`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={UserAdd01Icon} className="h-5 w-5" />
            Share &quot;{goalTitle}&quot;
          </DialogTitle>
          <DialogDescription>
            Invite others to collaborate on this goal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as InviteRole)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaborator">
                    <div className="flex flex-col items-start">
                      <span>Collaborator</span>
                      <span className="text-xs text-muted-foreground">
                        Can view and check in
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex flex-col items-start">
                      <span>Viewer</span>
                      <span className="text-xs text-muted-foreground">
                        Can view only
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSendInvite}
              disabled={!email || isPending}
              className="w-full"
            >
              <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4 mr-2" />
              {isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>

          {/* Shareable Link */}
          {inviteUrl && (
            <div className="space-y-2">
              <Label>Or share a link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteUrl}
                  readOnly
                  className="text-sm font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600">Copied to clipboard!</p>
              )}
            </div>
          )}

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div className="space-y-2">
              <Label>Pending Invites ({invites.length})</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                  >
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {invite.role} • {getExpirationText(invite.expires_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvite(invite.id)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
