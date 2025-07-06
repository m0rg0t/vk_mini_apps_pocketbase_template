// Basic Express server for Universal Mini App Template backend
import express from "express";
import cors from "cors";
import { POCKETBASE_URL } from "./config.js";
import healthRouter from "./routes/health.js";
import vkUsersRouter from "./routes/vkUsers.js";
import badgesRouter from "./routes/badges.js";
import usersRouter from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Using PocketBase URL:", POCKETBASE_URL);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Universal Mini App Template API!");
});

// Mount route modules
app.use("/api/health", healthRouter);
app.use("/api/vk-users", vkUsersRouter);
app.use("/api/badges", badgesRouter);
app.use("/api/users", usersRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

export default app;
