import { spawn } from "child_process";

import { env } from "../config/env.js";

function runBdata(args) {
  return new Promise((resolve, reject) => {
    const process = spawn("bdata.cmd", args, {
      shell: true,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    process.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    process.on("error", (error) => {
      reject(
        new Error(`Failed to start Bright Data CLI: ${error.message}`)
      );
    });

    process.on("close", (code) => {
      if (code !== 0) {
        const details = stderr.trim();

        reject(
          new Error(
            `Bright Data CLI exited with code ${code}${
              details ? `: ${details}` : ""
            }`
          )
        );

        return;
      }

      resolve(stdout.trim());
    });
  });
}

export async function runScrape() {
  const stdout = await runBdata([
    "scraper",
    "run",
    env.collectorId,
    env.targetUrl,
    "--pretty",
  ]);

  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(
      `Failed to parse Bright Data scrape output as JSON: ${error.message}`
    );
  }
}

export async function runHeal(prompt) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Heal prompt must be a non-empty string");
  }

  const stdout = await runBdata([
    "scraper",
    "heal",
    env.collectorId,
    prompt,
    "--auto-approve",
    "--auto-save",
    "--pretty",
  ]);

  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(
      `Failed to parse Bright Data heal output as JSON: ${error.message}`
    );
  }
}