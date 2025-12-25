// This file will be auto-generated using Supabase CLI
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts

// Placeholder Database type - will be replaced with generated types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          type: "one-time" | "target" | "habit";
          category: string;
          target_value: number | null;
          current_value: number;
          year: number;
          is_shared: boolean;
          is_archived: boolean;
          created_at: string;
          completed_at: string | null;
          // Streak fields (Phase 2)
          current_streak: number;
          longest_streak: number;
          last_check_in_date: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          type: "one-time" | "target" | "habit";
          category: string;
          target_value?: number | null;
          current_value?: number;
          year: number;
          is_shared?: boolean;
          is_archived?: boolean;
          created_at?: string;
          completed_at?: string | null;
          // Streak fields default to 0/null
          current_streak?: number;
          longest_streak?: number;
          last_check_in_date?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          type?: "one-time" | "target" | "habit";
          category?: string;
          target_value?: number | null;
          current_value?: number;
          year?: number;
          is_shared?: boolean;
          is_archived?: boolean;
          created_at?: string;
          completed_at?: string | null;
          current_streak?: number;
          longest_streak?: number;
          last_check_in_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "goals_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      check_ins: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          value: number;
          note: string | null;
          checked_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          value?: number;
          note?: string | null;
          checked_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          value?: number;
          note?: string | null;
          checked_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "check_ins_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "check_ins_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // Phase 3: Notification Preferences
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          daily_reminders: boolean;
          reminder_time: string; // TIME type stored as string (HH:MM:SS)
          weekly_summary: boolean;
          achievement_alerts: boolean;
          streak_warnings: boolean;
          push_subscription: PushSubscriptionJSON | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_reminders?: boolean;
          reminder_time?: string;
          weekly_summary?: boolean;
          achievement_alerts?: boolean;
          streak_warnings?: boolean;
          push_subscription?: PushSubscriptionJSON | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          daily_reminders?: boolean;
          reminder_time?: string;
          weekly_summary?: boolean;
          achievement_alerts?: boolean;
          streak_warnings?: boolean;
          push_subscription?: PushSubscriptionJSON | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // Phase 3: Badges
      badges: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          criteria_type: BadgeCriteriaType;
          criteria_value: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          criteria_type: BadgeCriteriaType;
          criteria_value: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          icon?: string;
          criteria_type?: BadgeCriteriaType;
          criteria_value?: number;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      // Phase 3: User Badges
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          goal_id: string | null;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          goal_id?: string | null;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          goal_id?: string | null;
          earned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_badges_badge_id_fkey";
            columns: ["badge_id"];
            isOneToOne: false;
            referencedRelation: "badges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_badges_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          }
        ];
      };
      // Phase 3: Streak Freezes
      streak_freezes: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          available: number;
          active_until: string | null; // DATE type stored as string
          last_earned_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id: string;
          available?: number;
          active_until?: string | null;
          last_earned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string;
          available?: number;
          active_until?: string | null;
          last_earned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "streak_freezes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "streak_freezes_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          }
        ];
      };
      // Phase 4: Goal Members (for shared goals)
      goal_members: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          role: GoalMemberRole;
          invited_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          role: GoalMemberRole;
          invited_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          role?: GoalMemberRole;
          invited_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goal_members_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "goal_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // Phase 4: Invites (pending invitations to shared goals)
      invites: {
        Row: {
          id: string;
          goal_id: string;
          inviter_id: string;
          email: string;
          token: string;
          role: InviteRole;
          expires_at: string;
          accepted_at: string | null;
          declined_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          inviter_id: string;
          email: string;
          token: string;
          role?: InviteRole;
          expires_at: string;
          accepted_at?: string | null;
          declined_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          inviter_id?: string;
          email?: string;
          token?: string;
          role?: InviteRole;
          expires_at?: string;
          accepted_at?: string | null;
          declined_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invites_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invites_inviter_id_fkey";
            columns: ["inviter_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      goal_type: "one-time" | "target" | "habit";
    };
    CompositeTypes: {};
  };
};

// Convenience types
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];

// Goal with computed is_completed property
export type GoalWithCompletion = Goal & {
  is_completed: boolean;
};

// Helper to add computed is_completed to goal
export function withCompletion(goal: Goal): GoalWithCompletion {
  return {
    ...goal,
    is_completed: goal.completed_at !== null,
  };
}

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

// Check-in types (Phase 2)
export type CheckIn = Database["public"]["Tables"]["check_ins"]["Row"];
export type CheckInInsert = Database["public"]["Tables"]["check_ins"]["Insert"];
export type CheckInUpdate = Database["public"]["Tables"]["check_ins"]["Update"];

// Phase 3: Notification Preferences types
export type NotificationPreferences =
  Database["public"]["Tables"]["notification_preferences"]["Row"];
export type NotificationPreferencesInsert =
  Database["public"]["Tables"]["notification_preferences"]["Insert"];
export type NotificationPreferencesUpdate =
  Database["public"]["Tables"]["notification_preferences"]["Update"];

// Phase 3: Badge types
export type BadgeCriteriaType =
  | "streak_days"
  | "total_check_ins"
  | "goals_completed";
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type BadgeInsert = Database["public"]["Tables"]["badges"]["Insert"];
export type BadgeUpdate = Database["public"]["Tables"]["badges"]["Update"];

// Phase 3: User Badge types
export type UserBadge = Database["public"]["Tables"]["user_badges"]["Row"];
export type UserBadgeInsert =
  Database["public"]["Tables"]["user_badges"]["Insert"];
export type UserBadgeUpdate =
  Database["public"]["Tables"]["user_badges"]["Update"];

// User badge with full badge details
export type UserBadgeWithDetails = UserBadge & {
  badge: Badge;
};

// Phase 3: Streak Freeze types
export type StreakFreeze =
  Database["public"]["Tables"]["streak_freezes"]["Row"];
export type StreakFreezeInsert =
  Database["public"]["Tables"]["streak_freezes"]["Insert"];
export type StreakFreezeUpdate =
  Database["public"]["Tables"]["streak_freezes"]["Update"];

// Phase 3: Push Subscription JSON type (Web Push API format)
export interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Phase 4: Goal Member types
export type GoalMemberRole = "owner" | "collaborator" | "viewer";
export type InviteRole = "collaborator" | "viewer";

export type GoalMember = Database["public"]["Tables"]["goal_members"]["Row"];
export type GoalMemberInsert =
  Database["public"]["Tables"]["goal_members"]["Insert"];
export type GoalMemberUpdate =
  Database["public"]["Tables"]["goal_members"]["Update"];

// Goal member with user details
export type GoalMemberWithUser = GoalMember & {
  user: User;
};

// Phase 4: Invite types
export type Invite = Database["public"]["Tables"]["invites"]["Row"];
export type InviteInsert = Database["public"]["Tables"]["invites"]["Insert"];
export type InviteUpdate = Database["public"]["Tables"]["invites"]["Update"];

// Invite with goal and inviter details
export type InviteWithDetails = Invite & {
  goal: Pick<Goal, "id" | "title" | "description">;
  inviter: Pick<User, "id" | "display_name" | "avatar_url">;
};

// Shared goal progress for each member
export interface SharedGoalProgress {
  memberId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: GoalMemberRole;
  checkInCount: number;
  currentStreak: number;
  lastCheckIn: string | null;
  contributedValue: number; // For target goals
}

// Goal with member information for shared goals
export type GoalWithMembers = Goal & {
  members: GoalMemberWithUser[];
  memberCount: number;
};

// Check-in with user info (for shared goals)
export type CheckInWithUser = CheckIn & {
  user: Pick<User, "id" | "display_name" | "avatar_url">;
};
