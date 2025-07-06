import express from "express";
import pbFetch from "../utils/pbFetch.js";
import { POCKETBASE_URL } from "../config.js";

const router = express.Router();

// Get all badges
router.get("/", async (req, res) => {
  try {
    const response = await pbFetch(
      `${POCKETBASE_URL}/api/collections/badges/records?sort=sort_order,name`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data);

  } catch (e) {
    console.log("PocketBase get badges error:", e);
    return res.status(500).json({
      error: "Failed to get badges",
      details: e.message,
    });
  }
});

export default router;
