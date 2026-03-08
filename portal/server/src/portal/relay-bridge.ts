/**
 * relay-bridge.ts
 *
 * Bidirectional message relay utilities for the PlayRooms Portal.
 *
 * Adapted from the Host repo's portal/relay-bridge.ts.
 * All Host-specific business logic (lobby, chat, toybox, buttplug, webhooks)
 * has been stripped — the Portal is a stateless message pipe, not a logic layer.
 *
 * Provides helper functions for:
 *   - Emitting events to specific guests (downstream: Host → guest)
 *   - Broadcasting events to rooms or all guests of an instance (downstream)
 *   - Forwarding events to the Host relay socket (upstream: guest → Host)
 *
 * These functions are the canonical API for cross-namespace messaging.
 * relay-namespace.ts and guest-namespace.ts use these helpers so that
 * all relay routing is defined in one place.
 */

import { createLogger } from "../logger.js";
import * as guestBridge from "./guest-bridge.js";
import * as registry from "./instance-registry.js";
import type {
  RelayGuestConnect,
  RelayGuestDisconnect,
  RelayValidateRequest,
} from "../shared/relay-types.js";

const logger = createLogger("RelayBridge");

// ─── Downstream helpers (Host → guest) ──────────────────────────────────────

/**
 * Emit an arbitrary event to a specific connected guest.
 * Returns true if the guest socket was found and the event was sent.
 */
export function emitToGuest(portalGuestId: string, event: string, data: unknown): boolean {
  const socket = guestBridge.getGuestSocket(portalGuestId);
  if (!socket) {
    logger.debug(`emitToGuest: no socket for guest ${portalGuestId}`);
    return false;
  }
  socket.emit(event, data);
  return true;
}

/**
 * Mark a guest as approved and notify them via their guest socket.
 */
export function emitGuestApproved(portalGuestId: string): void {
  const socket = guestBridge.getGuestSocket(portalGuestId);
  if (socket) {
    socket.emit("guest:approved", { guestId: portalGuestId });
    guestBridge.markApproved(portalGuestId);
    logger.debug(`Guest approved: ${portalGuestId}`);
  }
}

/**
 * Reject a guest: send an error event and disconnect them.
 * Removes the guest from the bridge after disconnection.
 */
export function emitGuestRejected(portalGuestId: string, message: string): void {
  const socket = guestBridge.getGuestSocket(portalGuestId);
  if (socket) {
    socket.emit("error", { message });
    socket.disconnect();
  }
  guestBridge.removeGuest(portalGuestId);
  logger.debug(`Guest rejected: ${portalGuestId} — ${message}`);
}

/**
 * Broadcast an event to all guests in a room.
 * Optionally exclude one guest (e.g. the sender of the original event).
 */
export function broadcastToRoom(
  roomId: string,
  event: string,
  data: unknown,
  excludeGuestId?: string,
): void {
  const guests = guestBridge.getGuestsInRoom(roomId);
  for (const guest of guests) {
    if (guest.guestId === excludeGuestId) continue;
    const socket = guestBridge.getGuestSocket(guest.guestId);
    if (socket) {
      socket.emit(event, data);
    }
  }
}

/**
 * Broadcast an event to all guests connected through a specific Host instance.
 */
export function broadcastToInstance(instanceId: string, event: string, data: unknown): void {
  const guests = guestBridge.getGuestsForInstance(instanceId);
  for (const guest of guests) {
    const socket = guestBridge.getGuestSocket(guest.guestId);
    if (socket) {
      socket.emit(event, data);
    }
  }
}

// ─── Upstream helpers (guest → Host) ────────────────────────────────────────

/**
 * Notify the Host that a new guest has connected.
 * Returns false if the Host instance is not currently connected.
 */
export function emitGuestConnect(instanceId: string, data: RelayGuestConnect): boolean {
  const hostSocket = registry.getInstance(instanceId);
  if (!hostSocket) {
    logger.warn(`emitGuestConnect: Host instance ${instanceId} not connected`);
    return false;
  }
  hostSocket.emit("relay:guest:connect", data);
  return true;
}

/**
 * Notify the Host that a guest has disconnected.
 * Returns false if the Host instance is not currently connected.
 */
export function emitGuestDisconnect(instanceId: string, data: RelayGuestDisconnect): boolean {
  const hostSocket = registry.getInstance(instanceId);
  if (!hostSocket) {
    logger.debug(`emitGuestDisconnect: Host instance ${instanceId} not connected`);
    return false;
  }
  hostSocket.emit("relay:guest:disconnect", data);
  return true;
}

/**
 * Forward a token validation request to the Host for resolution.
 * The Host responds asynchronously via relay:validate:response.
 * Returns false if the Host instance is not currently connected.
 */
export function emitValidateRequest(instanceId: string, data: RelayValidateRequest): boolean {
  const hostSocket = registry.getInstance(instanceId);
  if (!hostSocket) {
    logger.warn(`emitValidateRequest: Host instance ${instanceId} not connected`);
    return false;
  }
  hostSocket.emit("relay:validate:request", data);
  return true;
}

/**
 * Forward a guest-originated event upstream to the Host.
 * The envelope is wrapped in relay:upstream so the Host can route it.
 * Returns false if the Host instance is not currently connected.
 */
export function emitUpstream(
  instanceId: string,
  event: string,
  sourceGuestId: string,
  roomId: string,
  data: unknown,
): boolean {
  const hostSocket = registry.getInstance(instanceId);
  if (!hostSocket) return false;
  hostSocket.emit("relay:upstream", { sourceGuestId, roomId, event, data });
  return true;
}
