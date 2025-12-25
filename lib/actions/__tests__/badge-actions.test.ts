import { describe, it, expect, vi, beforeEach } from "vitest";
import { createServerClient } from "@/lib/supabase/server";

// Import the function we want to test - we'll test the internal logic
// Since checkBadgeCriteria is not exported, we'll test through checkAndAwardBadges

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  limit: vi.fn(() => mockSupabase),
  single: vi.fn(),
};

vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);

// Test the badge criteria logic by importing the module and testing behavior
describe("Badge Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
  });

  describe("Badge Criteria Logic", () => {
    // We'll test the criteria matching through the checkAndAwardBadges function
    
    it("should award 'First Step' badge on first check-in", async () => {
      // Import dynamically to ensure mocks are in place
      const { checkAndAwardBadges } = await import("@/lib/actions/badge-actions");
      
      // Mock badges with first check-in criteria
      const mockBadges = [
        {
          id: "badge-1",
          slug: "first-step",
          name: "First Step",
          description: "Complete your first check-in",
          icon: "🚀",
          criteria_type: "check_in",
          criteria_value: 1,
          sort_order: 1,
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "badges") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockBadges, error: null }),
          };
        }
        if (table === "user_badges") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return mockSupabase;
      });

      const result = await checkAndAwardBadges({
        streakDays: 0,
        totalCheckIns: 1,
        goalsCompleted: 0,
      });

      expect(result.success).toBe(true);
      expect(result.newBadges).toHaveLength(1);
      expect(result.newBadges?.[0].slug).toBe("first-step");
    });

    it("should award 'Week Warrior' badge on 7-day streak", async () => {
      const { checkAndAwardBadges } = await import("@/lib/actions/badge-actions");
      
      const mockBadges = [
        {
          id: "badge-2",
          slug: "week-warrior",
          name: "Week Warrior",
          description: "Maintain a 7-day streak",
          icon: "⚔️",
          criteria_type: "streak",
          criteria_value: 7,
          sort_order: 2,
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "badges") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockBadges, error: null }),
          };
        }
        if (table === "user_badges") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return mockSupabase;
      });

      const result = await checkAndAwardBadges({
        streakDays: 7,
        totalCheckIns: 10,
        goalsCompleted: 0,
      });

      expect(result.success).toBe(true);
      expect(result.newBadges).toHaveLength(1);
      expect(result.newBadges?.[0].slug).toBe("week-warrior");
    });

    it("should NOT award streak badge if streak is less than required", async () => {
      const { checkAndAwardBadges } = await import("@/lib/actions/badge-actions");
      
      const mockBadges = [
        {
          id: "badge-2",
          slug: "week-warrior",
          name: "Week Warrior",
          description: "Maintain a 7-day streak",
          icon: "⚔️",
          criteria_type: "streak",
          criteria_value: 7,
          sort_order: 2,
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "badges") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockBadges, error: null }),
          };
        }
        if (table === "user_badges") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return mockSupabase;
      });

      const result = await checkAndAwardBadges({
        streakDays: 5,
        totalCheckIns: 5,
        goalsCompleted: 0,
      });

      expect(result.success).toBe(true);
      expect(result.newBadges).toHaveLength(0);
    });

    it("should award 'Monthly Master' badge on 30-day streak", async () => {
      const { checkAndAwardBadges } = await import("@/lib/actions/badge-actions");
      
      const mockBadges = [
        {
          id: "badge-3",
          slug: "monthly-master",
          name: "Monthly Master",
          description: "Maintain a 30-day streak",
          icon: "👑",
          criteria_type: "streak",
          criteria_value: 30,
          sort_order: 3,
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "badges") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockBadges, error: null }),
          };
        }
        if (table === "user_badges") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return mockSupabase;
      });

      const result = await checkAndAwardBadges({
        streakDays: 30,
        totalCheckIns: 45,
        goalsCompleted: 0,
      });

      expect(result.success).toBe(true);
      expect(result.newBadges).toHaveLength(1);
      expect(result.newBadges?.[0].slug).toBe("monthly-master");
    });

    it("should award 'Goal Getter' badge on completing first goal", async () => {
      const { checkAndAwardBadges } = await import("@/lib/actions/badge-actions");
      
      const mockBadges = [
        {
          id: "badge-4",
          slug: "goal-getter",
          name: "Goal Getter",
          description: "Complete your first goal",
          icon: "🎯",
          criteria_type: "completion",
          criteria_value: 1,
          sort_order: 4,
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "badges") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockBadges, error: null }),
          };
        }
        if (table === "user_badges") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return mockSupabase;
      });

      const result = await checkAndAwardBadges({
        streakDays: 0,
        totalCheckIns: 20,
        goalsCompleted: 1,
      });

      expect(result.success).toBe(true);
      expect(result.newBadges).toHaveLength(1);
      expect(result.newBadges?.[0].slug).toBe("goal-getter");
    });

    it("should award 'High Achiever' badge on completing 5 goals", async () => {
      const { checkAndAwardBadges } = await import("@/lib/actions/badge-actions");
      
      const mockBadges = [
        {
          id: "badge-5",
          slug: "high-achiever",
          name: "High Achiever",
          description: "Complete 5 goals",
          icon: "🏆",
          criteria_type: "completion",
          criteria_value: 5,
          sort_order: 5,
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "badges") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockBadges, error: null }),
          };
        }
        if (table === "user_badges") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return mockSupabase;
      });

      const result = await checkAndAwardBadges({
        streakDays: 0,
        totalCheckIns: 100,
        goalsCompleted: 5,
      });

      expect(result.success).toBe(true);
      expect(result.newBadges).toHaveLength(1);
      expect(result.newBadges?.[0].slug).toBe("high-achiever");
    });

    it("should NOT award already earned badges", async () => {
      const { checkAndAwardBadges } = await import("@/lib/actions/badge-actions");
      
      const mockBadges = [
        {
          id: "badge-1",
          slug: "first-step",
          name: "First Step",
          criteria_type: "check_in",
          criteria_value: 1,
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "badges") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockBadges, error: null }),
          };
        }
        if (table === "user_badges") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ 
                data: [{ badge_id: "badge-1" }], // Already earned
                error: null 
              }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return mockSupabase;
      });

      const result = await checkAndAwardBadges({
        streakDays: 0,
        totalCheckIns: 10,
        goalsCompleted: 0,
      });

      expect(result.success).toBe(true);
      expect(result.newBadges).toHaveLength(0);
    });

    it("should award multiple badges when multiple criteria are met", async () => {
      const { checkAndAwardBadges } = await import("@/lib/actions/badge-actions");
      
      const mockBadges = [
        {
          id: "badge-1",
          slug: "first-step",
          name: "First Step",
          criteria_type: "check_in",
          criteria_value: 1,
        },
        {
          id: "badge-2",
          slug: "week-warrior",
          name: "Week Warrior",
          criteria_type: "streak",
          criteria_value: 7,
        },
        {
          id: "badge-4",
          slug: "goal-getter",
          name: "Goal Getter",
          criteria_type: "completion",
          criteria_value: 1,
        },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "badges") {
          return {
            select: vi.fn().mockResolvedValue({ data: mockBadges, error: null }),
          };
        }
        if (table === "user_badges") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return mockSupabase;
      });

      const result = await checkAndAwardBadges({
        streakDays: 7,
        totalCheckIns: 10,
        goalsCompleted: 1,
      });

      expect(result.success).toBe(true);
      expect(result.newBadges).toHaveLength(3);
    });
  });

  describe("Authentication", () => {
    it("should return error when not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const { checkAndAwardBadges } = await import("@/lib/actions/badge-actions");

      const result = await checkAndAwardBadges({
        streakDays: 7,
        totalCheckIns: 10,
        goalsCompleted: 0,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Not authenticated");
    });
  });
});
