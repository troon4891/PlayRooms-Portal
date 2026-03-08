import { readFileSync, existsSync } from "fs";
import type { LogLevel } from "./logger.js";

interface PortalConfig {
  serverPort: number;
  portalSecret: string | null;
  logLevel: LogLevel;
  corsOrigins: string;
  gracePeriodMs: number;
}

function loadConfig(): PortalConfig {
  // Try reading HA add-on options first
  const optionsPath = "/data/options.json";
  let haOptions: Record<string, unknown> = {};

  if (existsSync(optionsPath)) {
    try {
      haOptions = JSON.parse(readFileSync(optionsPath, "utf-8"));
    } catch {
      // Fall back to env vars
    }
  }

  const portalSecret =
    (haOptions.shared_secret as string) ||
    process.env.SHARED_SECRET ||
    process.env.PORTAL_SECRET ||
    process.env.RELAY_SECRET ||
    null;

  return {
    serverPort: Number(haOptions.port ?? process.env.PORTAL_PORT ?? 3001),
    portalSecret,
    logLevel: ((haOptions.log_level as string) ?? process.env.LOG_LEVEL ?? "info") as LogLevel,
    corsOrigins: process.env.CORS_ORIGINS ?? "*",
    gracePeriodMs: Number(process.env.PORTAL_GRACE_PERIOD_MS ?? 60_000),
  };
}

export const config = loadConfig();
