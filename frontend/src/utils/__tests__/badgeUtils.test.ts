import { describe, expect, it, vi } from 'vitest';
import type { Badge } from '../../types';
import { checkAllBadges, checkBadgeCondition, getNewlyEarnedBadges } from '../badgeUtils';

// Mock badgeCriteria module
vi.mock('../badgeCriteria', () => ({
  parseBadgeCriteria: vi.fn((criteria: string) => {
    if (criteria === 'registration') return { type: 'registration', value: 1 };
    if (criteria === 'read_1') return { type: 'books_read', value: 1 };
    if (criteria === 'read_10') return { type: 'books_read', value: 10 };
    if (criteria === 'referral_1') return { type: 'referral', value: 1 };
    if (criteria === 'goal_50') return { type: 'year_goal_percentage', value: 50 };
    return null;
  }),
  getBadgeCriteriaDescription: vi.fn((criteria: string) => {
    const descriptions: Record<string, string> = {
      'registration': 'Регистрация в приложении',
      'read_1': 'Прочтение первой книги',
      'read_10': 'Прочтение 10 книг',
      'referral_1': 'Приглашение друга',
      'goal_50': 'Достижение 50% годовой цели'
    };
    return descriptions[criteria] || 'Неизвестное условие';
  })
}));

describe('badgeUtils', () => {
  // const mockUser: VKUser = {
  //   id: 'test-user',
  //   vk_id: 12345,
  //   first_name: 'Тест',
  //   last_name: 'Пользователь',
  //   created: '2024-01-01T00:00:00Z',
  //   updated: '2024-01-01T00:00:00Z'
  // };

  const mockBooksReadCount = 15;

  const mockBadges: Badge[] = [
    {
      id: 'badge-1',
      name: 'Регистрация',
      description: 'Первый вход',
      criteria: 'registration',
      is_active: true,
      sort_order: 1,
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z'
    },
    {
      id: 'badge-2',
      name: 'Первая книга',
      description: 'Прочитал первую книгу',
      criteria: 'read_1',
      is_active: true,
      sort_order: 2,
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z'
    },
    {
      id: 'badge-3',
      name: '10 книг',
      description: 'Прочитал 10 книг',
      criteria: 'read_10',
      is_active: true,
      sort_order: 3,
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z'
    },
    {
      id: 'badge-4',
      name: 'Друг',
      description: 'Пригласил друга',
      criteria: 'referral_1',
      is_active: true,
      sort_order: 4,
      created: '2024-01-01T00:00:00Z',
      updated: '2024-01-01T00:00:00Z'
    },
  ];

  describe('checkBadgeCondition', () => {
    it('should correctly check registration badge', () => {
      const result = checkBadgeCondition(mockBadges[0], mockBooksReadCount);
      expect(result.earned).toBe(true);
      expect(result.progress).toBe(1);
      expect(result.badge.id).toBe('badge-1');
    });

    it('should correctly check books read badge (earned)', () => {
      const result = checkBadgeCondition(mockBadges[1], mockBooksReadCount); // read_1
      expect(result.earned).toBe(true);
      expect(result.progress).toBe(15); // user has 15 books
      expect(result.maxProgress).toBe(1);
    });

    it('should correctly check books read badge (not earned)', () => {
      const result = checkBadgeCondition(mockBadges[2], 5); // read_10 with only 5 books
      expect(result.earned).toBe(false);
      expect(result.progress).toBe(5);
      expect(result.maxProgress).toBe(10);
    });

    it('should correctly check referral badge (not implemented)', () => {
      const result = checkBadgeCondition(mockBadges[3], mockBooksReadCount); // referral_1
      expect(result.earned).toBe(false);
      expect(result.progress).toBe(0);
    });


  });

  describe('checkAllBadges', () => {
    it('should check all badges and return results', () => {
      const results = checkAllBadges(mockBadges, mockBooksReadCount);
      
      expect(results).toHaveLength(4);
      expect(results[0].earned).toBe(true); // registration
      expect(results[1].earned).toBe(true); // read_1
      expect(results[2].earned).toBe(true); // read_10 (user has 15 books)
      expect(results[3].earned).toBe(false); // referral_1
    });
  });

  describe('getNewlyEarnedBadges', () => {
    it('should return only newly earned badges', () => {
      const userBadgeIds = ['badge-1', 'badge-2']; // user already has these
      
      const newlyEarned = getNewlyEarnedBadges(mockBadges, userBadgeIds, mockBooksReadCount);
      
      // Should get badge-3 (read_10) since user has 15 books, but not badge-1 and badge-2 since user already has them
      expect(newlyEarned).toHaveLength(1);
      expect(newlyEarned[0].id).toBe('badge-3');
    });

    it('should return empty array if no new badges earned', () => {
      const userBadgeIds = ['badge-1']; // user already has registration badge
      
      const newlyEarned = getNewlyEarnedBadges(mockBadges, userBadgeIds, 0);
      
      expect(newlyEarned).toHaveLength(0);
    });

    it('should return all earned badges if user has no badges yet', () => {
      const newlyEarned = getNewlyEarnedBadges(mockBadges, [], mockBooksReadCount);
      
      // Should get registration, read_1, and read_10
      expect(newlyEarned).toHaveLength(3);
      expect(newlyEarned.map(b => b.id)).toEqual(['badge-1', 'badge-2', 'badge-3']);
    });
  });
});
