/**
 * Main PocketBase hook for Universal Mini App Template
 * This file contains basic hooks and can be extended with custom functionality
 */

// Example of a basic hook - you can add your custom logic here
// Hook functions will be added here once we identify the correct API

// Health check endpoint removed - PocketBase provides default health endpoint

// Example endpoint for app information
routerAdd("GET", "/api/app-info", (c) => {
  return c.json(200, {
    name: "Universal Mini App Template",
    version: "1.0.0",
    platform: "universal",
    features: ["vk-auth", "telegram-auth", "badges", "user-data"]
  });
});