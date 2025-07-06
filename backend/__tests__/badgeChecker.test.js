import { jest } from "@jest/globals";
import { checkEarnedBadges, awardEarnedBadges } from "../utils/badgeChecker.js";

// Mock pbFetch used in badgeChecker
const mockFetch = jest.fn();
jest.mock("../utils/pbFetch.js", () => ({ default: mockFetch }));

// Mock config
jest.mock("../config.js", () => ({
  POCKETBASE_URL: "http://localhost:8090"
}));

describe("badgeChecker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkEarnedBadges", () => {
    it("should return earned badges for user with sufficient books", async () => {
      const userId = "user123";
      const userData = {
        id: userId,
        books_read: 15,
        current_streak: 5,
        year_goal: 20
      };

      const badges = [
        {
          id: "badge1",
          name: "First Book",
          criteria: "read_1",
          is_active: true
        },
        {
          id: "badge2", 
          name: "10 Books",
          criteria: "read_10",
          is_active: true
        },
        {
          id: "badge3",
          name: "50 Books", 
          criteria: "read_50",
          is_active: true
        }
      ];

      const userBadges = []; // User has no badges yet

      // Mock fetch calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(userData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: badges })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: userBadges })
        });

      const result = await checkEarnedBadges(userId);

      expect(result.user).toEqual(userData);
      expect(result.earnedBadges).toHaveLength(2); // Should earn read_1 and read_10
      expect(result.earnedBadges.map(b => b.criteria)).toEqual(["read_1", "read_10"]);
      expect(result.totalEarned).toBe(2);
    });

    it("should return no badges for user who already has them", async () => {
      const userId = "user123";
      const userData = {
        id: userId,
        books_read: 15,
        current_streak: 5,
        year_goal: 20
      };

      const badges = [
        {
          id: "badge1",
          name: "First Book",
          criteria: "read_1",
          is_active: true
        },
        {
          id: "badge2",
          name: "10 Books", 
          criteria: "read_10",
          is_active: true
        }
      ];

      const userBadges = [
        { badge_id: "badge1" },
        { badge_id: "badge2" }
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(userData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: badges })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: userBadges })
        });

      const result = await checkEarnedBadges(userId);

      expect(result.earnedBadges).toHaveLength(0);
      expect(result.totalEarned).toBe(0);
    });

    it("should handle registration badge", async () => {
      const userId = "user123";
      const userData = {
        id: userId,
        books_read: 0,
        current_streak: 0,
        year_goal: 20
      };

      const badges = [
        {
          id: "badge1",
          name: "Registration",
          criteria: "registration",
          is_active: true
        }
      ];

      const userBadges = [];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(userData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: badges })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: userBadges })
        });

      const result = await checkEarnedBadges(userId);

      expect(result.earnedBadges).toHaveLength(1);
      expect(result.earnedBadges[0].criteria).toBe("registration");
    });

    it("should handle streak badges", async () => {
      const userId = "user123";
      const userData = {
        id: userId,
        books_read: 5,
        current_streak: 8,
        year_goal: 20
      };

      const badges = [
        {
          id: "badge1",
          name: "Week Streak",
          criteria: "streak_7",
          is_active: true
        },
        {
          id: "badge2",
          name: "Month Streak",
          criteria: "streak_30",
          is_active: true
        }
      ];

      const userBadges = [];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(userData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: badges })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: userBadges })
        });

      const result = await checkEarnedBadges(userId);

      expect(result.earnedBadges).toHaveLength(1); // Only streak_7, not streak_30
      expect(result.earnedBadges[0].criteria).toBe("streak_7");
    });

    it("should handle year goal percentage badges", async () => {
      const userId = "user123";
      const userData = {
        id: userId,
        books_read: 15,
        current_streak: 0,
        year_goal: 20 // 15/20 = 75%
      };

      const badges = [
        {
          id: "badge1",
          name: "Half Goal",
          criteria: "goal_50",
          is_active: true
        },
        {
          id: "badge2",
          name: "Full Goal",
          criteria: "goal_100",
          is_active: true
        }
      ];

      const userBadges = [];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(userData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: badges })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: userBadges })
        });

      const result = await checkEarnedBadges(userId);

      expect(result.earnedBadges).toHaveLength(1); // Only goal_50, not goal_100
      expect(result.earnedBadges[0].criteria).toBe("goal_50");
    });
  });

  describe("awardEarnedBadges", () => {
    it("should award all earned badges", async () => {
      const userId = "user123";
      const userData = {
        id: userId,
        books_read: 10,
        current_streak: 5,
        year_goal: 20
      };

      const badges = [
        {
          id: "badge1",
          name: "First Book",
          criteria: "read_1",
          is_active: true
        },
        {
          id: "badge2",
          name: "10 Books",
          criteria: "read_10", 
          is_active: true
        }
      ];

      const userBadges = [];

      // Mock the check earned badges calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(userData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: badges })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: userBadges })
        })
        // Mock awarding first badge
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: "ub1", vk_user_id: userId, badge_id: "badge1" })
        })
        // Mock awarding second badge
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: "ub2", vk_user_id: userId, badge_id: "badge2" })
        });

      const result = await awardEarnedBadges(userId);

      expect(result.success).toBe(true);
      expect(result.badgesAwarded).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it("should return message when no badges to award", async () => {
      const userId = "user123";
      const userData = {
        id: userId,
        books_read: 0,
        current_streak: 0,
        year_goal: 20
      };

      const badges = [
        {
          id: "badge1",
          name: "First Book",
          criteria: "read_1", 
          is_active: true
        }
      ];

      const userBadges = [];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(userData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: badges })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: userBadges })
        });

      const result = await awardEarnedBadges(userId);

      expect(result.success).toBe(true);
      expect(result.message).toBe("No new badges to award");
      expect(result.badgesAwarded).toHaveLength(0);
    });

    it("should handle errors when awarding badges", async () => {
      const userId = "user123";
      const userData = {
        id: userId,
        books_read: 10,
        current_streak: 5,
        year_goal: 20
      };

      const badges = [
        {
          id: "badge1",
          name: "First Book",
          criteria: "read_1",
          is_active: true
        }
      ];

      const userBadges = [];

      // Mock the check earned badges calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(userData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: badges })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: userBadges })
        })
        // Mock failed badge award
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Internal error" })
        });

      const result = await awardEarnedBadges(userId);

      expect(result.success).toBe(false);
      expect(result.badgesAwarded).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
    });
  });
});
