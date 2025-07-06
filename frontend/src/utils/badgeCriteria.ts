/**
 * Badge criteria utilities for structured badge conditions
 */

export interface BadgeCriteriaConfig {
  type: 'registration' | 'books_read' | 'referral' | 'streak_days' | 'year_goal_percentage';
  value: number;
}

/**
 * Create a structured badge criteria string
 */
export const createBadgeCriteria = (config: BadgeCriteriaConfig): string => {
  switch (config.type) {
    case 'registration':
      return 'registration';
    case 'books_read':
      return `read_${config.value}`;
    case 'referral':
      return `referral_${config.value}`;
    case 'streak_days':
      return `streak_${config.value}`;
    case 'year_goal_percentage':
      return `goal_${config.value}`;
    default:
      throw new Error(`Unknown badge criteria type: ${config.type}`);
  }
};

/**
 * Parse structured badge criteria string
 */
export const parseBadgeCriteria = (criteria: string): BadgeCriteriaConfig | null => {
  if (!criteria) return null;
  
  const normalizedCriteria = criteria.toLowerCase().trim();
  
  if (normalizedCriteria === 'registration') {
    return { type: 'registration', value: 1 };
  }
  
  const readMatch = normalizedCriteria.match(/^read_(\d+)$/);
  if (readMatch) {
    return { type: 'books_read', value: parseInt(readMatch[1], 10) };
  }
  
  const referralMatch = normalizedCriteria.match(/^referral_(\d+)$/);
  if (referralMatch) {
    return { type: 'referral', value: parseInt(referralMatch[1], 10) };
  }
  
  const streakMatch = normalizedCriteria.match(/^streak_(\d+)$/);
  if (streakMatch) {
    return { type: 'streak_days', value: parseInt(streakMatch[1], 10) };
  }
  
  const goalMatch = normalizedCriteria.match(/^goal_(\d+)$/);
  if (goalMatch) {
    return { type: 'year_goal_percentage', value: parseInt(goalMatch[1], 10) };
  }
  
  return null;
};

/**
 * Validate badge criteria string
 */
export const isValidBadgeCriteria = (criteria: string): boolean => {
  return parseBadgeCriteria(criteria) !== null;
};

/**
 * Get human-readable description for badge criteria
 */
export const getBadgeCriteriaDescription = (criteria: string): string => {
  const config = parseBadgeCriteria(criteria);
  if (!config) return 'Неизвестное условие';
  
  switch (config.type) {
    case 'registration':
      return 'Регистрация в приложении';
    case 'books_read':
      if (config.value === 1) return 'Прочтение первой книги';
      return `Прочтение ${config.value} книг`;
    case 'referral':
      if (config.value === 1) return 'Приглашение друга';
      return `Приглашение ${config.value} друзей`;
    case 'streak_days':
      return `Чтение ${config.value} дней подряд`;
    case 'year_goal_percentage':
      return `Достижение ${config.value}% годовой цели`;
    default:
      return 'Неизвестное условие';
  }
};

/**
 * Common badge criteria presets
 */
export const BADGE_CRITERIA_PRESETS = {
  REGISTRATION: createBadgeCriteria({ type: 'registration', value: 1 }),
  FIRST_BOOK: createBadgeCriteria({ type: 'books_read', value: 1 }),
  BOOKS_10: createBadgeCriteria({ type: 'books_read', value: 10 }),
  BOOKS_20: createBadgeCriteria({ type: 'books_read', value: 20 }),
  BOOKS_50: createBadgeCriteria({ type: 'books_read', value: 50 }),
  BOOKS_100: createBadgeCriteria({ type: 'books_read', value: 100 }),
  FIRST_REFERRAL: createBadgeCriteria({ type: 'referral', value: 1 }),
  STREAK_7_DAYS: createBadgeCriteria({ type: 'streak_days', value: 7 }),
  STREAK_30_DAYS: createBadgeCriteria({ type: 'streak_days', value: 30 }),
  GOAL_50_PERCENT: createBadgeCriteria({ type: 'year_goal_percentage', value: 50 }),
  GOAL_100_PERCENT: createBadgeCriteria({ type: 'year_goal_percentage', value: 100 }),
} as const;
