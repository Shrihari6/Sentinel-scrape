import "dotenv/config";

const requiredVariables = [
  "REDIS_URL",
  "COLLECTOR_ID",
  "TARGET_URL",
  "SCRAPE_INTERVAL_MINUTES",
  "PORT",
];

for (const variable of requiredVariables) {
  if (!process.env[variable]?.trim()) {
    throw new Error(
      `Missing required environment variable: ${variable}`
    );
  }
}

const scrapeIntervalMinutes = Number(
  process.env.SCRAPE_INTERVAL_MINUTES
);

const port = Number(process.env.PORT);

if (
  !Number.isInteger(scrapeIntervalMinutes) ||
  scrapeIntervalMinutes <= 0
) {
  throw new Error(
    "SCRAPE_INTERVAL_MINUTES must be a positive integer"
  );
}

if (
  !Number.isInteger(port) ||
  port <= 0 ||
  port > 65535
) {
  throw new Error(
    "PORT must be a valid number between 1 and 65535"
  );
}

export const env = {
  redisUrl: process.env.REDIS_URL,
  collectorId: process.env.COLLECTOR_ID,
  targetUrl: process.env.TARGET_URL,
  scrapeIntervalMinutes,
  port,
  frontendUrl:
    process.env.FRONTEND_URL || "*",
};