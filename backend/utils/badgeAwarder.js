import pbFetch from "./pbFetch.js";
import { POCKETBASE_URL } from "../config.js";

/**
 * Parse read criteria from badge criteria string
 * @param {string} criteria - Badge criteria string like "read_5"
 * @returns {number|null} - Number of books required or null if not a read criteria
 */
function parseReadCriteria(criteria) {
  const match = /^read_(\d+)$/.exec((criteria || "").toLowerCase());
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Parse referral criteria from badge criteria string
 * @param {string} criteria - Badge criteria string like "referral_1"
 * @returns {number|null} - Number of referrals required or null if not a referral criteria
 */
function parseReferralCriteria(criteria) {
  const match = /^referral_(\d+)$/.exec((criteria || "").toLowerCase());
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Award a badge to user if not already earned
 * @param {string} userId - User ID
 * @param {string} badgeId - Badge ID
 * @returns {Promise<boolean>} - True if badge was awarded, false if already exists
 */
async function awardBadge(userId, badgeId) {
  console.log(`[BADGE AWARD] Starting badge award process for user ${userId}, badge ${badgeId}`);
  
  try {
    // Check if badge already exists for this user
    let existing;
    try {
      console.log(`[BADGE AWARD] Checking if user ${userId} already has badge ${badgeId}`);
      // Используем encodeURIComponent для фильтра
      const filter = encodeURIComponent(`(user="${userId}" && badge="${badgeId}")`);
      const response = await pbFetch(
        `${POCKETBASE_URL}/api/collections/vk_user_badges/records?filter=${filter}`
      );
      const data = await response.json();
      existing = data.items && data.items.length > 0 ? data.items[0] : null;
      console.log(`[BADGE AWARD] Existing badge check result:`, existing ? `found (id: ${existing.id})` : "not found");
    } catch (err) {
      console.log(`[BADGE AWARD] Error checking existing badge:`, err.message);
      // No existing record found, which is expected for new badge awards
      existing = null;
    }

    console.log(
      "userId",
      userId,
      "badgeId",
      badgeId,
      "existing:",
      existing ? "found" : "not found"
    );

    if (existing) {
      console.log(`[BADGE AWARD] Badge ${badgeId} already awarded to user ${userId}, skipping`);
      console.log("Badge already awarded to user");
      return false;
    }

    // Create new badge award record
    console.log(`[BADGE AWARD] Creating new badge award for user ${userId}, badge ${badgeId}`);
    const badgeData = {
      user: userId,
      badge: badgeId,
      earned_at: new Date().toISOString(),
    };
    console.log(`[BADGE AWARD] Badge data:`, badgeData);

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
      console.log(`[BADGE AWARD] Failed to create badge award:`, errorData);
      throw new Error(
        `Failed to award badge: ${response.status} - ${JSON.stringify(
          errorData
        )}`
      );
    }

    const resultData = await response.json();
    console.log(`[BADGE AWARD] ✅ Successfully awarded badge ${badgeId} to user ${userId}! Award ID: ${resultData.id}`);
    console.log("Awarding badge", badgeId, "to user", userId);
    return true;
  } catch (err) {
    console.log(`[BADGE AWARD] ❌ Error awarding badge ${badgeId} to user ${userId}:`, err.message);
    console.log("awardBadge error:", err);
    return false;
  }
}

/**
 * Check and award read badges for a user based on completed books count
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of badges awarded
 */
async function checkReadBadges(userId) {
  console.log(`[BADGE CHECK] Starting badge check for user ${userId}`);
  
  try {
    // Get count of completed books for this user 
    const filter = encodeURIComponent(`(user="${userId}" && status="completed")`);
    const url = `${POCKETBASE_URL}/api/collections/vk_user_books/records?filter=${filter}`;
       console.log(`[BADGE CHECK] Fetching completed books count for user ${userId}`, url);

    const booksResponse = await pbFetch(url);
    const booksData = await booksResponse.json();
    const booksCount = booksData.totalItems || 0;
    console.log(`[BADGE CHECK] User ${userId} has completed ${booksCount} books`, booksData);

    // Get all active badges
    console.log(`[BADGE CHECK] Fetching available badges`);
    const badgesResponse = await pbFetch(
      `${POCKETBASE_URL}/api/collections/badges/records?filter=(is_active=true)&sort=sort_order&perPage=200`
    );
    const badgesData = await badgesResponse.json();
    const badges = badgesData.items || [];
    console.log(`[BADGE CHECK] Found ${badges.length} available badges`);

    let badgesAwarded = 0;
    const readBadges = badges.filter(badge => parseReadCriteria(badge.criteria) !== null);
    console.log(`[BADGE CHECK] Found ${readBadges.length} read-based badges to check`);

    for (const badge of badges) {
      const criteria = badge.criteria;
      const required = parseReadCriteria(criteria);
      
      if (required !== null) {
        console.log(`[BADGE CHECK] Checking badge "${badge.name || badge.title || badge.id}" (${badge.criteria}): requires ${required} books, user has ${booksCount}`);
        
        if (booksCount >= required) {
          console.log(`[BADGE CHECK] User ${userId} qualifies for badge ${badge.id} (${badge.criteria})`);
          const awarded = await awardBadge(userId, badge.id);
          if (awarded) {
            console.log(`[BADGE CHECK] ✅ Successfully awarded badge ${badge.id} to user ${userId}`);
            badgesAwarded++;
          } else {
            console.log(`[BADGE CHECK] ⚠️ Badge ${badge.id} not awarded (likely already exists)`);
          }
        } else {
          console.log(`[BADGE CHECK] User ${userId} does not qualify for badge ${badge.id} (needs ${required - booksCount} more books)`);
        }
      } else {
        console.log(`[BADGE CHECK] Skipping non-read badge: ${badge.criteria}`);
      }
    }

    console.log(`[BADGE CHECK] Badge check complete for user ${userId}: ${badgesAwarded} new badges awarded`);
    return badgesAwarded;
  } catch (err) {
    console.log(`[BADGE CHECK] ❌ Error during badge check for user ${userId}:`, err.message);
    console.log("checkReadBadges error:", err);
    return 0;
  }
}

/**
 * Award registration badge to a new user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if badge was awarded
 */
async function awardRegistrationBadge(userId) {
  console.log(`[REGISTRATION BADGE] Starting registration badge process for user ${userId}`);
  
  try {
    // Find registration badge
    console.log(`[REGISTRATION BADGE] Searching for registration badge`);
    // const response = await pbFetch(
    //   `${POCKETBASE_URL}/api/collections/badges/records?filter=(criteria="registration" && is_active=true)`
    // );
    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/badges/records?filter=(criteria="registration")`
    );
    const data = await response.json();
    console.log(`[REGISTRATION BADGE] Registration badge search result:`, JSON.stringify(data));
    console.log("registration badge data:", JSON.stringify(data));
    const badge = data.items && data.items.length > 0 ? data.items[0] : null;

    if (badge) {
      console.log(`[REGISTRATION BADGE] Found registration badge: ${badge.name || badge.title || badge.id}`);
      console.log("Awarding registration badge for user:", userId);
      console.log("Badge details:", JSON.stringify(badge));

      const result = await awardBadge(userId, badge.id);
      if (result) {
        console.log(`[REGISTRATION BADGE] ✅ Successfully awarded registration badge to user ${userId}`);
      } else {
        console.log(`[REGISTRATION BADGE] ⚠️ Registration badge not awarded to user ${userId} (likely already exists)`);
      }
      return result;
    } else {
      console.log(`[REGISTRATION BADGE] ❌ No registration badge found in database`);
      console.log("No registration badge found");
      return false;
    }
  } catch (err) {
    console.log(`[REGISTRATION BADGE] ❌ Error awarding registration badge to user ${userId}:`, err.message);
    console.log("registration badge error:", err);
    return false;
  }
}

/**
 * Award referral badge to a user for inviting friends
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if badge was awarded
 */
async function awardReferralBadge(userId) {
  console.log(`[REFERRAL BADGE] Starting referral badge process for user ${userId}`);
  
  try {
    // Find referral badge
    console.log(`[REFERRAL BADGE] Searching for referral badge`);
    // Используем encodeURIComponent для фильтра
    const filter = encodeURIComponent(`(criteria~"referral_" && is_active=true)`);
    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/badges/records?filter=${filter}`
    );
    const data = await response.json();
    console.log(`[REFERRAL BADGE] Referral badge search result:`, JSON.stringify(data));
    const badges = data.items || [];

    if (badges.length > 0) {
      // Find the first referral badge (usually referral_1)
      const badge = badges.find(b => parseReferralCriteria(b.criteria) === 1) || badges[0];
      console.log(`[REFERRAL BADGE] Found referral badge: ${badge.name || badge.title || badge.id}`);
      console.log("Awarding referral badge for user:", userId);
      console.log("Badge details:", JSON.stringify(badge));

      const result = await awardBadge(userId, badge.id);
      if (result) {
        console.log(`[REFERRAL BADGE] ✅ Successfully awarded referral badge to user ${userId}`);
      } else {
        console.log(`[REFERRAL BADGE] ⚠️ Referral badge not awarded to user ${userId} (likely already exists)`);
      }
      return result;
    } else {
      console.log(`[REFERRAL BADGE] ❌ No referral badge found in database`);
      console.log("No referral badge found");
      return false;
    }
  } catch (err) {
    console.log(`[REFERRAL BADGE] ❌ Error awarding referral badge to user ${userId}:`, err.message);
    console.log("referral badge error:", err);
    return false;
  }
}

export {
  awardBadge,
  checkReadBadges,
  awardRegistrationBadge,
  awardReferralBadge,
  parseReadCriteria,
  parseReferralCriteria,
};
