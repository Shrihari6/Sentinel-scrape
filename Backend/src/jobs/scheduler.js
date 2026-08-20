import { runScrape } from "../services/brightdata.js";
import { detect } from "../services/detector.js";
import { healInvalidPayload } from "../services/healer.js";
import {
  getClient,
  setLiveProduct,
  addHistoryEntry,
} from "../db/redis.js";
import { env } from "../config/env.js";

const RUN_COUNTS_KEY = "runs:rowcounts";

let intervalHandle = null;
let cycleRunning = false;

function getRows(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  return [];
}

async function getPreviousRunCounts() {
  const redis = getClient();

  const values = await redis.lRange(
    RUN_COUNTS_KEY,
    0,
    4
  );

  return values
    .map(Number)
    .filter((value) => Number.isFinite(value));
}

async function recordRunCount(count) {
  const redis = getClient();

  await redis.lPush(
    RUN_COUNTS_KEY,
    String(count)
  );

  await redis.lTrim(
    RUN_COUNTS_KEY,
    0,
    4
  );
}

async function writeSuccessfulRows(payload) {
  const rows = getRows(payload);
  const scrapedAt = new Date().toISOString();

  for (const row of rows) {
    const product = {
      item_id: row.item_id,
      title: row.title ?? "",
      primary_value: row.primary_value,
      currency: row.currency ?? "",
      status: row.status,
      metadata: row.metadata ?? {},
      scraped_at: scrapedAt,
    };

    await setLiveProduct(product);

    await addHistoryEntry(
      row.item_id,
      {
        recorded_at: scrapedAt,
        primary_value: row.primary_value,
        status: row.status,
      }
    );
  }

  return rows.length;
}

export async function runScrapeCycle() {
  if (cycleRunning) {
    console.log(
      "[Scheduler] Scrape cycle already running. Skipping."
    );

    return {
      success: false,
      skipped: true,
      reason: "A scrape cycle is already running",
    };
  }

  cycleRunning = true;

  const startedAt = new Date().toISOString();

  console.log(
    `[Scheduler] Starting scrape cycle at ${startedAt}`
  );

  try {
    const previousRunCounts =
      await getPreviousRunCounts();

    const payload = await runScrape();

    const rows = getRows(payload);

    const detection = detect(
      payload,
      previousRunCounts
    );

    if (detection.isValid) {
      const rowCount =
        await writeSuccessfulRows(payload);

      await recordRunCount(rowCount);

      console.log(
        `[Scheduler] Scrape cycle successful: ${rowCount} rows`
      );

      return {
        success: true,
        status: "VALID",
        rows: rowCount,
      };
    }

    console.warn(
      `[Scheduler] Invalid scrape detected: ${detection.reason}`
    );

    const healingResult =
      await healInvalidPayload(
        payload,
        detection.reason
      );

    if (
      healingResult.success &&
      healingResult.status === "HEALED"
    ) {
      const rowCount =
        await writeSuccessfulRows(
          healingResult.payload
        );

      await recordRunCount(rowCount);

      console.log(
        `[Scheduler] Healed scrape successfully written: ${rowCount} rows`
      );

      return {
        success: true,
        status: "HEALED",
        rows: rowCount,
        eventId: healingResult.eventId,
      };
    }

    await recordRunCount(rows.length);

    console.error(
      `[Scheduler] Healing failed for event ${healingResult.eventId}`
    );

    return {
      success: false,
      status: "FAILED",
      eventId: healingResult.eventId,
      reason: healingResult.reason,
    };
  } catch (error) {
    console.error(
      "[Scheduler] Scrape cycle failed:",
      error.message
    );

    return {
      success: false,
      status: "ERROR",
      reason: error.message,
    };
  } finally {
    cycleRunning = false;
  }
}

export function start() {
  if (intervalHandle) {
    console.log(
      "[Scheduler] Scheduler is already running."
    );

    return;
  }

  const intervalMs =
    env.scrapeIntervalMinutes * 60 * 1000;

  console.log(
    `[Scheduler] Starting. Interval: ${env.scrapeIntervalMinutes} minute(s)`
  );

  intervalHandle = setInterval(
    () => {
      runScrapeCycle().catch((error) => {
        console.error(
          "[Scheduler] Unhandled cycle error:",
          error
        );
      });
    },
    intervalMs
  );
}

export function stop() {
  if (!intervalHandle) {
    return;
  }

  clearInterval(intervalHandle);
  intervalHandle = null;

  console.log("[Scheduler] Stopped.");
}