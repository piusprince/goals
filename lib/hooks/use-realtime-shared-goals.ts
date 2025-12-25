"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { GoalMemberWithUser } from "@/lib/supabase/types";
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

interface UseRealtimeSharedGoalsOptions {
  userId: string;
  onMembershipChange?: (
    payload: RealtimePostgresChangesPayload<GoalMemberWithUser>
  ) => void;
}

export function useRealtimeSharedGoals({
  userId,
  onMembershipChange,
}: UseRealtimeSharedGoalsOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const subscribe = useCallback(() => {
    const supabase = createBrowserClient();

    const newChannel = supabase
      .channel(`user-memberships-${userId}`)
      .on<GoalMemberWithUser>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goal_members",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onMembershipChange?.(payload);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    setChannel(newChannel);

    return newChannel;
  }, [userId, onMembershipChange]);

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
