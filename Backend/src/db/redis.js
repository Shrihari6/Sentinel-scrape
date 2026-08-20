import { createClient } from "redis";

import { env } from "../config/env.js";

let client;

export async function connectRedis() {
  if (client?.isReady) {
    return client;
  }

  client = createClient({
    url: env.redisUrl,
  });

  client.on("error", (error) => {
    console.error("[Redis Error]", error);
  });

  client.on("connect", () => {
    console.log("[Redis] Connecting...");
  });

  client.on("ready", () => {
    console.log("[Redis] Connected and ready.");
  });

  await client.connect();

  return client;
}

export function getClient() {
  if (!client) {
    throw new Error("Redis client has not been initialized");
  }

  return client;
}

// ---------------------------------------------------------
// Live product cache
// ---------------------------------------------------------

export async function getLiveProduct(id) {
  const redis = getClient();

  const value = await redis.get(`live:product:${id}`);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(
      `Failed to parse live product ${id}: ${error.message}`
    );
  }
}

export async function setLiveProduct(product) {
  if (!product?.item_id) {
    throw new Error(
      "Cannot cache product without item_id"
    );
  }

  const redis = getClient();

  const key = `live:product:${product.item_id}`;

  await redis.set(key, JSON.stringify(product), {
    EX: 10800,
  });

  await redis.sAdd(
    "live:products:index",
    product.item_id
  );

  return product;
}

export async function getAllLiveProducts() {
  const redis = getClient();

  const ids = await redis.sMembers(
    "live:products:index"
  );

  if (ids.length === 0) {
    return [];
  }

  const products = [];

  for (const id of ids) {
    const product = await getLiveProduct(id);

    if (product) {
      products.push(product);
    } else {
      // Remove expired products from the index.
      await redis.sRem(
        "live:products:index",
        id
      );
    }
  }

  return products;
}

// ---------------------------------------------------------
// Price/value history
// ---------------------------------------------------------

export async function addHistoryEntry(
  id,
  entry
) {
  if (!id) {
    throw new Error(
      "History entry requires a product id"
    );
  }

  if (
    !entry?.recorded_at ||
    typeof entry.primary_value !== "number" ||
    typeof entry.status !== "string"
  ) {
    throw new Error(
      "History entry requires recorded_at, numeric primary_value, and status"
    );
  }

  const redis = getClient();

  const key = `history:product:${id}`;

  const timestamp = new Date(entry.recorded_at).getTime();

  if (!Number.isFinite(timestamp)) {
    throw new Error(
      `Invalid recorded_at value: ${entry.recorded_at}`
    );
  }

  const member = JSON.stringify({
    recorded_at: entry.recorded_at,
    primary_value: entry.primary_value,
    status: entry.status,
  });

  await redis.zAdd(key, {
    score: timestamp,
    value: member,
  });

  // Keep only the newest 200 entries.
  const count = await redis.zCard(key);

  if (count > 200) {
    await redis.zRemRangeByRank(
      key,
      0,
      count - 201
    );
  }
}

export async function getHistory(id) {
  const redis = getClient();

  const values = await redis.zRange(
    `history:product:${id}`,
    0,
    -1
  );

  return values.map((value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(
        `Failed to parse history entry for ${id}: ${error.message}`
      );
    }
  });
}

// ---------------------------------------------------------
// Healing audit events
// ---------------------------------------------------------

export async function createHealingEvent({
  event_id,
  collector_id,
  reason,
  prompt,
  rows_before,
  rows_after,
  status,
  created_at,
}) {
  const redis = getClient();

  if (!event_id) {
    throw new Error(
      "Healing event requires event_id"
    );
  }

  const key = `healing:event:${event_id}`;

  await redis.hSet(key, {
    collector_id: String(collector_id ?? ""),
    reason: String(reason ?? ""),
    prompt: String(prompt ?? ""),
    rows_before: String(rows_before ?? 0),
    rows_after: String(rows_after ?? 0),
    status: String(status ?? "PENDING"),
    created_at: String(created_at ?? new Date().toISOString()),
  });

  const timestamp = new Date(
    created_at ?? new Date().toISOString()
  ).getTime();

  await redis.zAdd("healing:events:index", {
    score: timestamp,
    value: event_id,
  });

  return event_id;
}

export async function updateHealingEventStatus(
  eventId,
  status,
  rowsAfter
) {
  const redis = getClient();

  const key = `healing:event:${eventId}`;

  const exists = await redis.exists(key);

  if (!exists) {
    throw new Error(
      `Healing event ${eventId} does not exist`
    );
  }

  const fields = {
    status: String(status),
  };

  if (rowsAfter !== undefined) {
    fields.rows_after = String(rowsAfter);
  }

  await redis.hSet(key, fields);
}

export async function getHealingEvents(
  limit = 50
) {
  const redis = getClient();

  const eventIds = await redis.zRange(
    "healing:events:index",
    0,
    Math.max(0, limit - 1),
    {
      REV: true,
    }
  );

  const events = [];

  for (const eventId of eventIds) {
    const event = await redis.hGetAll(
      `healing:event:${eventId}`
    );

    if (Object.keys(event).length === 0) {
      continue;
    }

    events.push({
      event_id: eventId,
      collector_id: event.collector_id,
      reason: event.reason,
      prompt: event.prompt,
      rows_before: Number(event.rows_before),
      rows_after: Number(event.rows_after),
      status: event.status,
      created_at: event.created_at,
    });
  }

  return events;
}