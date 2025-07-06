import pbFetch from "./pbFetch.js";
import { POCKETBASE_URL } from "../config.js";

/**
 * Parse structured badge criteria string
 */
const parseBadgeCriteria = (criteria) => {
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
 * Check if user has earned a specific badge based on their stats
 */
const checkBadgeCondition = (badge, user) => {
  const config = parseBadgeCriteria(badge.criteria);
  if (!config) return false;
  
  switch (config.type) {
    case 'books_read':
      return user.books_read >= config.value;
      
    case 'registration':
      // User exists means they are registered
      return true;
      
    case 'referral':
      // For now, assume not implemented
      return false;
      
    case 'streak_days':
      return user.current_streak >= config.value;
      
    case 'year_goal_percentage':
      const goalProgress = Math.round((user.books_read / user.year_goal) * 100);
      return goalProgress >= config.value;
      
    default:
      return false;
  }
};

/**
 * Get user data from PocketBase
 */
const getUserData = async (userId) => {
  try {
    const response = await pbFetch(`${POCKETBASE_URL}/api/collections/vk_users/records/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

/**
 * Get all active badges
 */
const getActiveBadges = async () => {
  try {
    const response = await pbFetch(`${POCKETBASE_URL}/api/collections/badges/records?filter=(is_active=true)&sort=sort_order,name`);
    if (!response.ok) {
      throw new Error(`Failed to fetch badges: ${response.status}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching badges:", error);
    throw error;
  }
};

/**
 * Get user's earned badge IDs
 */
const getUserBadgeIds = async (userId) => {
  try {
    const response = await pbFetch(`${POCKETBASE_URL}/api/collections/vk_user_badges/records?filter=(user="${userId}")`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user badges: ${response.status}`);
    }
    const data = await response.json();
    return (data.items || []).map(item => item.badge);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    throw error;
  }
};

/**
 * Check which badges a user has earned but not yet received
 */
export const checkEarnedBadges = async (userId) => {
  try {
    // Get user data, all badges, and user's current badges in parallel
    const [userData, allBadges, userBadgeIds] = await Promise.all([
      getUserData(userId),
      getActiveBadges(),
      getUserBadgeIds(userId)
    ]);

    // Find badges the user has earned but doesn't have yet
    const earnedBadges = allBadges.filter(badge => {
      // Skip if user already has this badge
      if (userBadgeIds.includes(badge.id)) {
        return false;
      }
      
      // Check if user meets the criteria for this badge
      return checkBadgeCondition(badge, userData);
    });

    return {
      user: userData,
      earnedBadges,
      totalEarned: earnedBadges.length
    };
  } catch (error) {
    console.error("Error checking earned badges:", error);
    throw error;
  }
};

/**
 * Award a badge to user (internal function, does not check duplicates)
 */
const awardBadgeInternal = async (userId, badgeId) => {
  try {
    const badgeData = { 
      user: userId, 
      badge: badgeId,
      earned_at: new Date().toISOString() 
    };
    
    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/vk_user_badges/records`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(badgeData),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to award badge: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error awarding badge:", error);
    throw error;
  }
};

/**
 * Award all earned badges to user
 */
export const awardEarnedBadges = async (userId) => {
  try {
    const { earnedBadges } = await checkEarnedBadges(userId);
    
    if (earnedBadges.length === 0) {
      return {
        success: true,
        message: "No new badges to award",
        badgesAwarded: []
      };
    }

    const awardedBadges = [];
    const errors = [];

    // Award each badge
    for (const badge of earnedBadges) {
      try {
        const result = await awardBadgeInternal(userId, badge.id);
        awardedBadges.push({
          badge,
          result
        });
        console.log(`Awarded badge "${badge.name}" to user ${userId}`);
      } catch (error) {
        errors.push({
          badge,
          error: error.message
        });
        console.error(`Failed to award badge "${badge.name}" to user ${userId}:`, error);
      }
    }

    return {
      success: errors.length === 0,
      message: `Awarded ${awardedBadges.length} badges${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      badgesAwarded: awardedBadges,
      errors
    };
  } catch (error) {
    console.error("Error awarding earned badges:", error);
    throw error;
  }
};
