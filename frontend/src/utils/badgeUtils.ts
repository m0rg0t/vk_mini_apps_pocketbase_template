import type { Badge } from '../types';
import { parseBadgeCriteria, getBadgeCriteriaDescription } from './badgeCriteria';

export interface BadgeCheckResult {
  badge: Badge;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
}

/**
 * Parse badge criteria to extract condition type and value
 * Now supports structured criteria format like 'read_10', 'registration', 'referral_1', etc.
 */
const parseBadgeCriteriaInternal = (criteria?: string): { type: string; value: number } => {
  if (!criteria) return { type: 'unknown', value: 0 };

  // Try to parse using the new structured format
  const structuredConfig = parseBadgeCriteria(criteria);
  if (structuredConfig) {
    return { type: structuredConfig.type, value: structuredConfig.value };
  }

  // Handle direct structured criteria format from migration data
  if (criteria === 'registration') {
    return { type: 'registration', value: 1 };
  }
  
  // Handle read_X format
  const readMatch = criteria.match(/^read_(\d+)$/);
  if (readMatch) {
    return { type: 'books_read', value: parseInt(readMatch[1], 10) };
  }
  
  // Handle referral_X format
  const referralMatch = criteria.match(/^referral_(\d+)$/);
  if (referralMatch) {
    return { type: 'referral', value: parseInt(referralMatch[1], 10) };
  }
  
  // Handle streak_X format
  const streakMatch = criteria.match(/^streak_(\d+)$/);
  if (streakMatch) {
    return { type: 'streak', value: parseInt(streakMatch[1], 10) };
  }
  
  // Handle goal_X format
  const goalMatch = criteria.match(/^goal_(\d+)$/);
  if (goalMatch) {
    return { type: 'goal', value: parseInt(goalMatch[1], 10) };
  }

  // Backward compatibility with old text-based criteria
  const lowerCriteria = criteria.toLowerCase();

  // Check for book reading conditions (old format)
  if (lowerCriteria.includes('первой книги') || lowerCriteria.includes('первую книгу')) {
    return { type: 'books_read', value: 1 };
  }
  if (lowerCriteria.includes('10 книг')) {
    return { type: 'books_read', value: 10 };
  }
  if (lowerCriteria.includes('20 книг')) {
    return { type: 'books_read', value: 20 };
  }
  if (lowerCriteria.includes('50 книг')) {
    return { type: 'books_read', value: 50 };
  }

  // Check for registration condition (old format)
  if (lowerCriteria.includes('регистрация')) {
    return { type: 'registration', value: 1 };
  }

  // Check for referral condition (old format)
  if (lowerCriteria.includes('друга') || lowerCriteria.includes('приглашение')) {
    return { type: 'referral', value: 1 };
  }

  console.warn(`Unknown badge criteria format: ${criteria}`);
  return { type: 'unknown', value: 0 };
};

/**
 * Check if user has earned a specific badge based on their stats
 */
export const checkBadgeCondition = (badge: Badge, booksReadCount: number = 0): BadgeCheckResult => {
  const { type, value } = parseBadgeCriteriaInternal(badge.criteria);
  let earned = false;
  let progress = 0;
  const maxProgress = value;
  
  console.log(`[Badge Check] ${badge.name} (${badge.criteria}) - Type: ${type}, Required: ${value}`);

  switch (type) {
    case 'books_read':
      progress = booksReadCount;
      earned = booksReadCount >= value;
      console.log(`  Books read: ${booksReadCount}/${value} - ${earned ? 'EARNED' : 'NOT EARNED'}`, type, value);
      break;
    case 'registration':
      // User exists means they are registered
      progress = 1;
      earned = true;
      console.log(`  Registration: Always earned for existing user`);
      break;
    case 'referral':
      // For now, assume not implemented
      progress = 0;
      earned = false;
      console.log(`  Referral: Not implemented yet`);
      break;
    case 'streak':
      // Reading streak - not implemented yet
      progress = 0;
      earned = false;
      console.log(`  Streak: Not implemented yet`);
      break;
    case 'goal':
      // Goal achievement - not implemented yet
      progress = 0;
      earned = false;
      console.log(`  Goal: Not implemented yet`);
      break;
    default:
      console.warn(`Unknown badge condition type: ${type} for badge: ${badge.name}`);
  }

  console.log(`  Result: Progress ${progress}/${maxProgress}, Earned: ${earned}\n`);

  return {
    badge,
    earned,
    progress,
    maxProgress,
  };
};

/**
 * Check all badges against user stats and return which ones should be awarded
 */
export const checkAllBadges = (badges: Badge[], booksReadCount: number = 0): BadgeCheckResult[] => {
  return badges.map((badge) => checkBadgeCondition(badge, booksReadCount));
};

/**
 * Get badges that user has earned but hasn't been awarded yet
 */
export const getNewlyEarnedBadges = (badges: Badge[], userBadgeIds: string[], booksReadCount: number = 0): Badge[] => {
  const badgeChecks = checkAllBadges(badges, booksReadCount);

  return badgeChecks
    .filter((check) => check.earned && !userBadgeIds.includes(check.badge.id))
    .map((check) => check.badge);
};

/**
 * Get human-readable description for a badge's criteria
 */
export const getBadgeDescription = (badge: Badge): string => {
  if (!badge.criteria) return 'Условие не указано';
  return getBadgeCriteriaDescription(badge.criteria);
};

// Export badge criteria utilities for external use
export { BADGE_CRITERIA_PRESETS } from './badgeCriteria';
