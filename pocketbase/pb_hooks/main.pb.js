/**
 * Main PocketBase hook for Universal Mini App Template
 * This file contains basic hooks and can be extended with custom functionality
 */

// Example of a basic hook - you can add your custom logic here
onRecordAfterCreateRequest((e) => {
  // Log when new records are created
  console.log("New record created:", e.record.tableName(), e.record.id);
}, "vk_users");

onRecordAfterCreateRequest((e) => {
  // Log when new user data records are created
  console.log("New user data record created:", e.record.id);
}, "user_data");

// Example health check endpoint
routerAdd("GET", "/api/health", (c) => {
  return c.json(200, {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "pocketbase"
  });
});

// Example endpoint for app information
routerAdd("GET", "/api/app-info", (c) => {
  return c.json(200, {
    name: "Universal Mini App Template",
    version: "1.0.0",
    platform: "universal",
    features: ["vk-auth", "telegram-auth", "badges", "user-data"]
  });
});