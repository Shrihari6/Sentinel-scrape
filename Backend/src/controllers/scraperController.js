import {
  getAllLiveProducts,
  getHistory,
  getHealingEvents,
} from "../db/redis.js";

import { runScrapeCycle } from "../jobs/scheduler.js";

export async function getLiveProducts(req, res, next) {
  try {
    const products = await getAllLiveProducts();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductHistory(req, res, next) {
  try {
    const { id } = req.params;

    const history = await getHistory(id);

    res.json({
      success: true,
      item_id: id,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

export async function getHealingAudit(req, res, next) {
  try {
    const events = await getHealingEvents(50);

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
}

export function triggerScrape(req, res, next) {
  try {
    // Start the cycle asynchronously.
    // The HTTP request does not wait for Bright Data.
    runScrapeCycle().catch((error) => {
      console.error(
        "[Manual Trigger] Scrape cycle failed:",
        error.message
      );
    });

    res.status(200).json({
      success: true,
      message:
        "Manual scrape cycle triggered successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}