import { describe, it, expect, vi, beforeEach } from "vitest";
import { createServerClient } from "@/lib/supabase/server";

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  limit: vi.fn(() => mockSupabase),
  single: vi.fn(),
  maybeSingle: vi.fn(),
  gte: vi.fn(() => mockSupabase),
  lte: vi.fn(() => mockSupabase),
  is: vi.fn(() => mockSupabase),
};

vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

describe("Streak Freeze Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // Default mock for authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
  });

  describe("awardStreakFreeze", () => {
    it("should only award freeze on 7-day multiples", async () => {
      const { awardStreakFreeze } = await import("@/lib/actions/streak-freeze-actions");

      // Test non-multiple of 7
      const result5 = await awardStreakFreeze("goal-1", 5);
      expect(result5.success).toBe(true);
      expect(result5.awarded).toBe(false);

      // Test non-multiple of 7
      const result10 = await awardStreakFreeze("goal-1", 10);
      expect(result10.success).toBe(true);
      expect(result10.awarded).toBe(false);
    });

    it("should award freeze on 7-day streak", async () => {
      const { awardStreakFreeze } = await import("@/lib/actions/streak-freeze-actions");

      // Mock: no existing freeze record
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "streak_freezes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "freeze-1", available_count: 1 },
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabase;
      });

      const result = await awardStreakFreeze("goal-1", 7);
      expect(result.success).toBe(true);
      expect(result.awarded).toBe(true);
    });

    it("should award freeze on 14-day streak", async () => {
      const { awardStreakFreeze } = await import("@/lib/actions/streak-freeze-actions");

      // Mock: existing freeze record
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "streak_freezes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: "freeze-1",
                    available_count: 1,
                    last_earned_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return mockSupabase;
      });

      const result = await awardStreakFreeze("goal-1", 14);
      expect(result.success).toBe(true);
      expect(result.awarded).toBe(true);
    });

    it("should NOT award freeze if recently awarded (within 24 hours)", async () => {
      const { awardStreakFreeze } = await import("@/lib/actions/streak-freeze-actions");

      // Mock: freeze awarded recently
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "streak_freezes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: "freeze-1",
                    available_count: 1,
                    last_earned_at: new Date().toISOString(), // Just now
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabase;
      });

      const result = await awardStreakFreeze("goal-1", 7);
      expect(result.success).toBe(true);
      expect(result.awarded).toBe(false);
    });

    it("should return error when not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const { awardStreakFreeze } = await import("@/lib/actions/streak-freeze-actions");

      const result = await awardStreakFreeze("goal-1", 7);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Not authenticated");
    });
  });

  describe("getStreakFreezeStatus", () => {
    it("should return freeze status for goal", async () => {
      const { getStreakFreezeStatus } = await import("@/lib/actions/streak-freeze-actions");

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "streak_freezes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: "freeze-1",
                    goal_id: "goal-1",
                    available_count: 2,
                    is_active: false,
                    last_used_at: null,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabase;
      });

      const result = await getStreakFreezeStatus("goal-1");
      expect(result.success).toBe(true);
      expect(result.data?.available_count).toBe(2);
      expect(result.data?.is_active).toBe(false);
    });

    it("should return null data when no freeze exists", async () => {
      const { getStreakFreezeStatus } = await import("@/lib/actions/streak-freeze-actions");

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "streak_freezes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabase;
      });

      const result = await getStreakFreezeStatus("goal-1");
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe("activateStreakFreeze", () => {
    it("should activate freeze when available count > 0", async () => {
      const { activateStreakFreeze } = await import("@/lib/actions/streak-freeze-actions");

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "streak_freezes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: "freeze-1",
                    goal_id: "goal-1",
                    available_count: 2,
                    is_active: false,
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return mockSupabase;
      });

      const result = await activateStreakFreeze("goal-1");
      expect(result.success).toBe(true);
    });

    it("should NOT activate freeze when available count is 0", async () => {
      const { activateStreakFreeze } = await import("@/lib/actions/streak-freeze-actions");

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "streak_freezes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: "freeze-1",
                    goal_id: "goal-1",
                    available_count: 0,
                    is_active: false,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabase;
      });

      const result = await activateStreakFreeze("goal-1");
      expect(result.success).toBe(false);
      expect(result.error).toBe("No streak freezes available");
    });

    it("should return error when freeze record does not exist", async () => {
      const { activateStreakFreeze } = await import("@/lib/actions/streak-freeze-actions");

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "streak_freezes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabase;
      });

      const result = await activateStreakFreeze("goal-1");
      expect(result.success).toBe(false);
      expect(result.error).toBe("No streak freeze record found");
    });
  });

  describe("consumeStreakFreeze", () => {
    it("should consume freeze when active", async () => {
      const { consumeStreakFreeze } = await import("@/lib/actions/streak-freeze-actions");

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "streak_freezes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: "freeze-1",
                    goal_id: "goal-1",
                    available_count: 2,
                    is_active: true,
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return mockSupabase;
      });

      const result = await consumeStreakFreeze("goal-1");
      expect(result.success).toBe(true);
      expect(result.consumed).toBe(true);
    });

    it("should NOT consume freeze when not active", async () => {
      const { consumeStreakFreeze } = await import("@/lib/actions/streak-freeze-actions");

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "streak_freezes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: "freeze-1",
                    goal_id: "goal-1",
                    available_count: 2,
                    is_active: false, // Not active
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return mockSupabase;
      });

      const result = await consumeStreakFreeze("goal-1");
      expect(result.success).toBe(true);
      expect(result.consumed).toBe(false);
    });
  });
});
