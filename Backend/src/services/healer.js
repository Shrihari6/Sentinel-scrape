import { randomUUID } from "crypto";

import { runHeal, runScrape } from "./brightdata.js";
import { detect } from "./detector.js";
import {
  createHealingEvent,
  updateHealingEventStatus,
} from "../db/redis.js";
import { env } from "../config/env.js";

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

function buildHealPrompt(reason, rows) {
  const rowCount = rows.length;

  return [
    "The SentinelScrape validation detected a problem with the scraper output.",
    `Problem detected: ${reason}`,
    `The latest scrape returned ${rowCount} rows.`,
    "",
    "Fix the existing Bright Data scraper so that every returned row consistently contains:",
    "- item_id",
    "- title",
    "- primary_value as a numeric value",
    "- currency",
    "- status as a string",
    "- metadata",
    "",
    "Preserve the existing scraper behavior and target website.",
    "Make the smallest reliable change necessary to fix the detected extraction problem.",
  ].join("\n");
}

export async function healInvalidPayload(
  payload,
  reason
) {
  const rows = getRows(payload);
  const rowsBefore = rows.length;

  const eventId = randomUUID();
  const createdAt = new Date().toISOString();

  const prompt = buildHealPrompt(
    reason,
    rows
  );

  await createHealingEvent({
    event_id: eventId,
    collector_id: env.collectorId,
    reason,
    prompt,
    rows_before: rowsBefore,
    rows_after: 0,
    status: "PENDING",
    created_at: createdAt,
  });

  try {
    console.log(
      `[Healer] Starting healing event ${eventId}`
    );

    await runHeal(prompt);

    console.log(
      `[Healer] Bright Data heal completed for ${eventId}`
    );

    const healedPayload = await runScrape();

    const healedRows = getRows(
      healedPayload
    );

    const verification = detect(
      healedPayload,
      [rowsBefore]
    );

    if (verification.isValid) {
      await updateHealingEventStatus(
        eventId,
        "HEALED",
        healedRows.length
      );

      console.log(
        `[Healer] Event ${eventId} successfully healed`
      );

      return {
        success: true,
        status: "HEALED",
        eventId,
        payload: healedPayload,
        rowsBefore,
        rowsAfter: healedRows.length,
      };
    }

    await updateHealingEventStatus(
      eventId,
      "FAILED",
      healedRows.length
    );

    console.error(
      `[Healer] Event ${eventId} failed verification: ${verification.reason}`
    );

    return {
      success: false,
      status: "FAILED",
      eventId,
      reason: verification.reason,
      payload: healedPayload,
      rowsBefore,
      rowsAfter: healedRows.length,
    };
  } catch (error) {
    await updateHealingEventStatus(
      eventId,
      "FAILED",
      rowsBefore
    );

    console.error(
      `[Healer] Event ${eventId} failed:`,
      error.message
    );

    return {
      success: false,
      status: "FAILED",
      eventId,
      reason: error.message,
      payload: null,
      rowsBefore,
      rowsAfter: 0,
    };
  }
}