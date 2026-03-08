import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import { config } from "./config.js";
import { setLevel, createLogger } from "./logger.js";
import { setupRelayNamespace } from "./portal/relay-namespace.js";
import { setupGuestNamespace } from "./portal/guest-namespace.js";
import { portalRouter } from "./portal/routes.js";

const logger = createLogger("Portal");

/**
 * Starts the PlayRooms Portal relay server.
 * This is a lightweight Express + Socket.IO server that:
 * - Accepts Host instance connections on /relay namespace
 * - Accepts guest connections on default namespace
 * - Proxies token validation to Host via the relay channel
 *
 * No Intiface Engine, no SQLite, no device control, no frontend.
 */
async function main(): Promise<void> {
  setLevel(config.logLevel);

  logger.info("Starting PlayRooms Portal server...");

  if (!config.portalSecret) {
    logger.error("FATAL: SHARED_SECRET is required. Set it in addon options or SHARED_SECRET env var.");
    process.exit(1);
  }

  const app = express();
  const server = createServer(app);

  const corsOrigin = config.corsOrigins === "*" || config.corsOrigins === ""
    ? "*"
    : config.corsOrigins.split(",").map((s) => s.trim());

  const io = new Server(server, {
    cors: { origin: corsOrigin, methods: ["GET", "POST"] },
    maxHttpBufferSize: 1e6, // 1MB max message size
  });

  // Middleware
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  // Portal API routes (health, token validation proxy)
  app.use(portalRouter);

  // Setup Socket.IO namespaces
  setupRelayNamespace(io);
  setupGuestNamespace(io);

  // Start listening
  server.listen(config.serverPort, () => {
    logger.info(`Portal server listening on port ${config.serverPort}`);
    logger.info("Waiting for Host instances to connect on /relay namespace...");
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("Shutting down...");
    server.close();
    process.exit(0);
  });

  process.on("SIGINT", () => {
    logger.info("Interrupted, shutting down...");
    server.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal error starting Portal:", err);
  process.exit(1);
});
