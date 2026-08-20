import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { connectRedis } from "./db/redis.js";
import { start as startScheduler } from "./jobs/scheduler.js";

import {
  getLiveProducts,
  getProductHistory,
  getHealingAudit,
  triggerScrape,
} from "./controllers/scraperController.js";

const app = express();

app.use(
  cors({
    origin:
      env.frontendUrl === "*"
        ? true
        : env.frontendUrl,
  })
);

app.use(express.json());

const router = express.Router();

router.get(
  "/products/live",
  getLiveProducts
);

router.get(
  "/products/:id/history",
  getProductHistory
);

router.get(
  "/audit/healing",
  getHealingAudit
);

router.post(
  "/trigger",
  triggerScrape
);

app.use("/api", router);

app.use((error, req, res, next) => {
  console.error("[Server Error]", error);

  res.status(500).json({
    success: false,
    message:
      error?.message || "Internal server error",
  });
});

async function startServer() {
  try {
    await connectRedis();

    startScheduler();

    app.listen(env.port, () => {
      console.log(
        `SentinelScrape backend running on http://localhost:${env.port}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start SentinelScrape:",
      error.message
    );

    process.exit(1);
  }
}

startServer();

export default app;