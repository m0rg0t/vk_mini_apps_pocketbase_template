import express from "express";
import pbFetch from "../utils/pbFetch.js";
import { POCKETBASE_URL } from "../config.js";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Health check endpoint hit");

  try {
    // Проверяем доступность PocketBase hooks
    const pbHealthResponse = await pbFetch(`${POCKETBASE_URL}/api/books/health`, {}, { isPublic: true });
    const pbHealthData = await pbHealthResponse.json();

    res.json({
      status: "ok",
      backend: "running",
      pocketbase_hooks: pbHealthData,
    });
  } catch (e) {
    console.log("PocketBase hooks health check failed:", e);
    res.json({
      status: "ok",
      backend: "running",
      pocketbase_hooks: "unavailable",
      pocketbase_error: e.message,
    });
  }
});

export default router;
