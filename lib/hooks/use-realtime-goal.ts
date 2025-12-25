"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { CheckIn, GoalMemberWithUser } from "@/lib/supabase/types";
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

interface UseRealtimeGoalOptions {
  goalId: string;
  onCheckInChange?: (payload: RealtimePostgresChangesPayload<CheckIn>) => void;
  onMemberChange?: (
    payload: RealtimePostgresChangesPayload<GoalMemberWithUser>
  ) => void;
}

export function useRealtimeGoal({
  goalId,
  onCheckInChange,
  onMemberChange,
}: UseRealtimeGoalOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const subscribe = useCallback(() => {
    const supabase = createBrowserClient();

    const newChannel = supabase
      .channel(`goal-${goalId}`)
      .on<CheckIn>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "check_ins",
          filter: `goal_id=eq.${goalId}`,
        },
        (payload) => {
          onCheckInChange?.(payload);
        }
      )
      .on<GoalMemberWithUser>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goal_members",
          filter: `goal_id=eq.${goalId}`,
        },
        (payload) => {
          onMemberChange?.(payload);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    setChannel(newChannel);

    return newChannel;
  }, [goalId, onCheckInChange, onMemberChange]);

  useEffect(() => {
    const channel = subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [subscribe]);

  const unsubscribe = useCallback(() => {
    if (channel) {
      channel.unsubscribe();
      setChannel(null);
      setIsConnected(false);
    }
  }, [channel]);

  return {
    isConnected,
    unsubscribe,
  };
}
