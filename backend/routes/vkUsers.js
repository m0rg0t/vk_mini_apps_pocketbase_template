import express from "express";
import pbFetch from "../utils/pbFetch.js";
import { POCKETBASE_URL } from "../config.js";
import { verifyVkSignature } from "../utils/signature.js";
import PocketBase from "pocketbase";
import { awardRegistrationBadge } from "../utils/badgeAwarder.js";
import {
  validateVkId,
  validateUserId,
  validateUserData,
  validateUserFilters,
  handleValidationErrors,
  createSafeFilter
} from "../utils/validation.js";

const router = express.Router();

const pb = new PocketBase(`${POCKETBASE_URL}`);

// Get user by VK ID or Telegram ID
router.get("/:vkId", validateVkId(), handleValidationErrors, verifyVkSignature, async (req, res) => {
  try {
    const vkId = parseInt(req.params.vkId, 10);
    const safeFilter = createSafeFilter('vk_id', vkId);
    
    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/vk_users/records?filter=(${safeFilter})`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "User not found" });
    }

    // Return first user or null if not found
    const user = data.items && data.items.length > 0 ? data.items[0] : null;
    return res.json(user);
  } catch (e) {
    console.error("PocketBase get VK user error:", e);
    return res.status(500).json({
      error: "Failed to get VK user"
    });
  }
});

// Get users with query parameters for VK ID or Telegram ID
router.get("/", validateUserFilters(), handleValidationErrors, verifyVkSignature, async (req, res) => {
  try {
    let safeFilter = "";
    
    if (req.query['vk_id']) {
      const vkId = parseInt(req.query['vk_id'], 10);
      safeFilter = createSafeFilter('vk_id', vkId);
    } else if (req.query['telegram-id']) {
      const telegramId = parseInt(req.query['telegram-id'], 10);
      safeFilter = createSafeFilter('telegram_user_id', telegramId);
    } else {
      return res.status(400).json({ error: "vk-id or telegram-id parameter required" });
    }

    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/vk_users/records?filter=(${safeFilter})`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "User not found" });
    }

    return res.json(data.items || []);
  } catch (e) {
    console.error("PocketBase get user error:", e);
    return res.status(500).json({
      error: "Failed to get user"
    });
  }
});

// Create user (VK or Telegram) - VK users need signature verification
router.post("/", validateUserData(), handleValidationErrors, (req, res, next) => {
  // Skip VK signature verification for Telegram users
  const isTelegramUser = req.body.telegram_user_id && !req.body.vk_id;
  if (isTelegramUser) {
    // For Telegram users, skip signature verification and go to handler
    next();
  } else {
    // For VK users, apply signature verification middleware
    verifyVkSignature(req, res, next);
  }
}, async (req, res) => {
  try {
    console.log("creating user");

    // Validate that at least one platform ID is provided
    if (!req.body.vk_id && !req.body.telegram_user_id) {
      return res.status(400).json({ error: "Either vk_id or telegram_user_id is required" });
    }

    const userPayload = {
      first_name: req.body.first_name || '',
      last_name: req.body.last_name || '',
      photo_url: req.body.photo_url || ''
    };

    if (req.body.vk_id) {
      userPayload.vk_id = parseInt(req.body.vk_id, 10);
    }

    if (req.body.telegram_user_id) {
      userPayload.telegram_user_id = parseInt(req.body.telegram_user_id, 10);
    }

    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/vk_users/records`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload),
      }
    );

    const data = await response.json();

    console.log("data", data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Award registration badge to the new user
    try {
      const badgeAwarded = await awardRegistrationBadge(data.id);
      console.log("Registration badge awarded:", badgeAwarded);
    } catch (badgeError) {
      console.log("Error awarding registration badge:", badgeError);
      // Don't fail user creation if badge award fails
    }

    return res.status(201).json(data);
  } catch (e) {
    console.error("PocketBase create VK user error:", e);
    return res.status(500).json({
      error: "Failed to create VK user"
    });
  }
});

// Update user (VK or Telegram) - VK users need signature verification
router.put("/:id", validateUserId(), validateUserData(), handleValidationErrors, (req, res, next) => {
  // Skip VK signature verification for Telegram users
  const isTelegramUser = req.body.telegram_user_id && !req.body.vk_id;
  if (isTelegramUser) {
    // For Telegram users, skip signature verification and go to handler
    next();
  } else {
    // For VK users, apply signature verification middleware
    verifyVkSignature(req, res, next);
  }
}, async (req, res) => {
  try {

    // Prepare validated payload
    const updatePayload = {};
    
    if (req.body.first_name !== undefined) {
      updatePayload.first_name = req.body.first_name;
    }
    if (req.body.last_name !== undefined) {
      updatePayload.last_name = req.body.last_name;
    }
    if (req.body.photo_url !== undefined) {
      updatePayload.photo_url = req.body.photo_url;
    }
    if (req.body.books_read !== undefined) {
      updatePayload.books_read = parseInt(req.body.books_read, 10);
    }
    if (req.body.current_streak !== undefined) {
      updatePayload.current_streak = parseInt(req.body.current_streak, 10);
    }
    if (req.body.year_goal !== undefined) {
      updatePayload.year_goal = parseInt(req.body.year_goal, 10);
    }

    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/vk_users/records/${req.params.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to update user" });
    }

    return res.json(data);
  } catch (e) {
    console.error("PocketBase update user error:", e);
    return res.status(500).json({
      error: "Failed to update user"
    });
  }
});

export default router;
