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
