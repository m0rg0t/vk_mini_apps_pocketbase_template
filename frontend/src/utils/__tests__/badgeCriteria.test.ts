import { describe, it, expect } from 'vitest';
import {
  parseBadgeCriteria,
  getBadgeCriteriaDescription,
  isValidBadgeCriteria,
  createBadgeCriteria,
  BADGE_CRITERIA_PRESETS
} from '../badgeCriteria';

describe('badgeCriteria', () => {
  describe('parseBadgeCriteria', () => {
    it('should parse registration criteria', () => {
      const result = parseBadgeCriteria('registration');
      expect(result).toEqual({ type: 'registration', value: 1 });
    });

    it('should parse books read criteria', () => {
      expect(parseBadgeCriteria('read_1')).toEqual({ type: 'books_read', value: 1 });
      expect(parseBadgeCriteria('read_10')).toEqual({ type: 'books_read', value: 10 });
      expect(parseBadgeCriteria('read_50')).toEqual({ type: 'books_read', value: 50 });
    });

    it('should parse referral criteria', () => {
      expect(parseBadgeCriteria('referral_1')).toEqual({ type: 'referral', value: 1 });
      expect(parseBadgeCriteria('referral_5')).toEqual({ type: 'referral', value: 5 });
    });

    it('should parse streak criteria', () => {
      expect(parseBadgeCriteria('streak_7')).toEqual({ type: 'streak_days', value: 7 });
      expect(parseBadgeCriteria('streak_30')).toEqual({ type: 'streak_days', value: 30 });
    });

    it('should parse goal criteria', () => {
      expect(parseBadgeCriteria('goal_50')).toEqual({ type: 'year_goal_percentage', value: 50 });
      expect(parseBadgeCriteria('goal_100')).toEqual({ type: 'year_goal_percentage', value: 100 });
    });

    it('should handle case insensitive input', () => {
      expect(parseBadgeCriteria('REGISTRATION')).toEqual({ type: 'registration', value: 1 });
      expect(parseBadgeCriteria('READ_10')).toEqual({ type: 'books_read', value: 10 });
    });

    it('should handle whitespace', () => {
      expect(parseBadgeCriteria(' registration ')).toEqual({ type: 'registration', value: 1 });
      expect(parseBadgeCriteria('  read_5  ')).toEqual({ type: 'books_read', value: 5 });
    });

    it('should return null for invalid criteria', () => {
      expect(parseBadgeCriteria('')).toBeNull();
      expect(parseBadgeCriteria('invalid')).toBeNull();
      expect(parseBadgeCriteria('read_')).toBeNull();
      expect(parseBadgeCriteria('read_abc')).toBeNull();
      expect(parseBadgeCriteria('unknown_format')).toBeNull();
    });
  });

  describe('isValidBadgeCriteria', () => {
    it('should return true for valid criteria', () => {
      expect(isValidBadgeCriteria('registration')).toBe(true);
      expect(isValidBadgeCriteria('read_1')).toBe(true);
      expect(isValidBadgeCriteria('referral_1')).toBe(true);
      expect(isValidBadgeCriteria('streak_7')).toBe(true);
      expect(isValidBadgeCriteria('goal_50')).toBe(true);
    });

    it('should return false for invalid criteria', () => {
      expect(isValidBadgeCriteria('')).toBe(false);
      expect(isValidBadgeCriteria('invalid')).toBe(false);
      expect(isValidBadgeCriteria('read_')).toBe(false);
      expect(isValidBadgeCriteria('read_abc')).toBe(false);
    });
  });

  describe('getBadgeCriteriaDescription', () => {
    it('should return correct descriptions for registration', () => {
      expect(getBadgeCriteriaDescription('registration')).toBe('Регистрация в приложении');
    });

    it('should return correct descriptions for books read', () => {
      expect(getBadgeCriteriaDescription('read_1')).toBe('Прочтение первой книги');
      expect(getBadgeCriteriaDescription('read_10')).toBe('Прочтение 10 книг');
      expect(getBadgeCriteriaDescription('read_50')).toBe('Прочтение 50 книг');
    });

    it('should return correct descriptions for referrals', () => {
      expect(getBadgeCriteriaDescription('referral_1')).toBe('Приглашение друга');
      expect(getBadgeCriteriaDescription('referral_5')).toBe('Приглашение 5 друзей');
    });

    it('should return correct descriptions for streaks', () => {
      expect(getBadgeCriteriaDescription('streak_7')).toBe('Чтение 7 дней подряд');
      expect(getBadgeCriteriaDescription('streak_30')).toBe('Чтение 30 дней подряд');
    });

    it('should return correct descriptions for goals', () => {
      expect(getBadgeCriteriaDescription('goal_50')).toBe('Достижение 50% годовой цели');
      expect(getBadgeCriteriaDescription('goal_100')).toBe('Достижение 100% годовой цели');
    });

    it('should return unknown condition for invalid criteria', () => {
      expect(getBadgeCriteriaDescription('invalid')).toBe('Неизвестное условие');
      expect(getBadgeCriteriaDescription('')).toBe('Неизвестное условие');
    });
  });

  describe('createBadgeCriteria', () => {
    it('should create correct criteria strings', () => {
      expect(createBadgeCriteria({ type: 'registration', value: 1 })).toBe('registration');
      expect(createBadgeCriteria({ type: 'books_read', value: 10 })).toBe('read_10');
      expect(createBadgeCriteria({ type: 'referral', value: 1 })).toBe('referral_1');
      expect(createBadgeCriteria({ type: 'streak_days', value: 7 })).toBe('streak_7');
      expect(createBadgeCriteria({ type: 'year_goal_percentage', value: 50 })).toBe('goal_50');
    });

    it('should throw error for unknown type', () => {
      expect(() => {
        createBadgeCriteria({ type: 'unknown' as never, value: 1 });
      }).toThrow('Unknown badge criteria type: unknown');
    });
  });

  describe('BADGE_CRITERIA_PRESETS', () => {
    it('should have correct preset values', () => {
      expect(BADGE_CRITERIA_PRESETS.REGISTRATION).toBe('registration');
      expect(BADGE_CRITERIA_PRESETS.FIRST_BOOK).toBe('read_1');
      expect(BADGE_CRITERIA_PRESETS.BOOKS_10).toBe('read_10');
      expect(BADGE_CRITERIA_PRESETS.BOOKS_20).toBe('read_20');
      expect(BADGE_CRITERIA_PRESETS.BOOKS_50).toBe('read_50');
      expect(BADGE_CRITERIA_PRESETS.BOOKS_100).toBe('read_100');
      expect(BADGE_CRITERIA_PRESETS.FIRST_REFERRAL).toBe('referral_1');
      expect(BADGE_CRITERIA_PRESETS.STREAK_7_DAYS).toBe('streak_7');
      expect(BADGE_CRITERIA_PRESETS.STREAK_30_DAYS).toBe('streak_30');
      expect(BADGE_CRITERIA_PRESETS.GOAL_50_PERCENT).toBe('goal_50');
      expect(BADGE_CRITERIA_PRESETS.GOAL_100_PERCENT).toBe('goal_100');
    });
  });

  describe('Migration criteria compatibility', () => {
    // Тестируем критерии из миграции 1687801094_import_badges_data.js
    const migrationCriteria = [
      { criteria: 'registration', expectedType: 'registration', expectedValue: 1 },
      { criteria: 'read_1', expectedType: 'books_read', expectedValue: 1 },
      { criteria: 'read_10', expectedType: 'books_read', expectedValue: 10 },
      { criteria: 'read_20', expectedType: 'books_read', expectedValue: 20 },
      { criteria: 'read_50', expectedType: 'books_read', expectedValue: 50 },
      { criteria: 'referral_1', expectedType: 'referral', expectedValue: 1 }
    ];

    migrationCriteria.forEach(({ criteria, expectedType, expectedValue }) => {
      it(`should correctly parse migration criteria: ${criteria}`, () => {
        expect(isValidBadgeCriteria(criteria)).toBe(true);
        
        const parsed = parseBadgeCriteria(criteria);
        expect(parsed).not.toBeNull();
        expect(parsed?.type).toBe(expectedType);
        expect(parsed?.value).toBe(expectedValue);
        
        const description = getBadgeCriteriaDescription(criteria);
        expect(description).not.toBe('Неизвестное условие');
      });
    });
  });
});
