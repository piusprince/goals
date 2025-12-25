"use client";

import { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MoreVerticalIcon,
  UserRemoveIcon,
  UserEditIcon,
  LogoutIcon,
} from "@hugeicons/core-free-icons";
import {
  updateMemberRole,
  removeMember,
  leaveGoal,
} from "@/lib/actions/members-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { GoalMemberWithUser, GoalMemberRole } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MembersListProps {
  goalId: string;
  members: GoalMemberWithUser[];
  currentUserId: string;
  currentUserRole: GoalMemberRole;
  onMemberChanged?: () => void;
}

export function MembersList({
  goalId,
  members,
  currentUserId,
  currentUserRole,
  onMemberChanged,
}: MembersListProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<{
    type: "remove" | "leave" | "changeRole";
    memberId?: string;
    memberName?: string;
    newRole?: "collaborator" | "viewer";
  } | null>(null);
  const router = useRouter();

  const isOwner = currentUserRole === "owner";

  const handleChangeRole = (
    userId: string,
    newRole: "collaborator" | "viewer"
  ) => {
    startTransition(async () => {
      const result = await updateMemberRole(goalId, userId, newRole);
      if (result.success) {
        toast.success(`Role changed to ${newRole}`);
        onMemberChanged?.();
      } else {
        toast.error(result.error || "Failed to change role");
      }
      setConfirmAction(null);
    });
  };

  const handleRemoveMember = (userId: string) => {
    startTransition(async () => {
      const result = await removeMember(goalId, userId);
      if (result.success) {
        toast.success("Member removed");
        onMemberChanged?.();
      } else {
        toast.error(result.error || "Failed to remove member");
      }
      setConfirmAction(null);
    });
  };

  const handleLeaveGoal = () => {
    startTransition(async () => {
      const result = await leaveGoal(goalId);
      if (result.success) {
        toast.success("You've left the goal");
        router.push("/shared");
      } else {
        toast.error(result.error || "Failed to leave goal");
      }
      setConfirmAction(null);
    });
  };

  const getRoleBadgeColor = (role: GoalMemberRole) => {
    switch (role) {
      case "owner":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "collaborator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "viewer":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="space-y-2">
        {members.map((member) => {
          const isCurrentUser = member.user_id === currentUserId;
          const canManage =
            isOwner && !isCurrentUser && member.role !== "owner";
          const canLeave = isCurrentUser && member.role !== "owner";

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.user?.avatar_url || undefined} />
                  <AvatarFallback>
                    {getInitials(member.user?.display_name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.user?.display_name}
                    {isCurrentUser && (
                      <span className="text-muted-foreground ml-1">(you)</span>
                    )}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleBadgeColor(
                      member.role
                    )}`}
                  >
                    {member.role}
                  </span>
                </div>
              </div>

              {(canManage || canLeave) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isPending}
                    >
                      <HugeiconsIcon
                        icon={MoreVerticalIcon}
                        className="h-4 w-4"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canManage && (
                      <>
                        {member.role !== "collaborator" && (
                          <DropdownMenuItem
                            onClick={() =>
                              setConfirmAction({
                                type: "changeRole",
                                memberId: member.user_id,
                                memberName: member.user?.display_name,
                                newRole: "collaborator",
                              })
                            }
                          >
                            <HugeiconsIcon
                              icon={UserEditIcon}
                              className="h-4 w-4 mr-2"
                            />
                            Make Collaborator
                          </DropdownMenuItem>
                        )}
                        {member.role !== "viewer" && (
                          <DropdownMenuItem
                            onClick={() =>
                              setConfirmAction({
                                type: "changeRole",
                                memberId: member.user_id,
                                memberName: member.user?.display_name,
                                newRole: "viewer",
                              })
                            }
                          >
                            <HugeiconsIcon
                              icon={UserEditIcon}
                              className="h-4 w-4 mr-2"
                            />
                            Make Viewer
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            setConfirmAction({
                              type: "remove",
                              memberId: member.user_id,
                              memberName: member.user?.display_name,
                            })
                          }
                        >
                          <HugeiconsIcon
                            icon={UserRemoveIcon}
                            className="h-4 w-4 mr-2"
                          />
                          Remove from Goal
                        </DropdownMenuItem>
                      </>
                    )}
                    {canLeave && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setConfirmAction({ type: "leave" })}
                      >
                        <HugeiconsIcon
                          icon={LogoutIcon}
                          className="h-4 w-4 mr-2"
                        />
                        Leave Goal
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "remove" && "Remove Member?"}
              {confirmAction?.type === "leave" && "Leave Goal?"}
              {confirmAction?.type === "changeRole" && "Change Role?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "remove" &&
                `Are you sure you want to remove ${confirmAction.memberName} from this goal? Their check-ins will be preserved.`}
              {confirmAction?.type === "leave" &&
                "Are you sure you want to leave this goal? You'll need a new invite to rejoin."}
              {confirmAction?.type === "changeRole" &&
                `Change ${confirmAction.memberName}'s role to ${confirmAction.newRole}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => {
                if (
                  confirmAction?.type === "remove" &&
                  confirmAction.memberId
                ) {
                  handleRemoveMember(confirmAction.memberId);
                } else if (confirmAction?.type === "leave") {
                  handleLeaveGoal();
                } else if (
                  confirmAction?.type === "changeRole" &&
                  confirmAction.memberId &&
                  confirmAction.newRole
                ) {
                  handleChangeRole(
                    confirmAction.memberId,
                    confirmAction.newRole
                  );
                }
              }}
              className={
                confirmAction?.type !== "changeRole"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {isPending ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
