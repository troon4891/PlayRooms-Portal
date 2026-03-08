# Changelog

All notable changes to PlayRooms Portal will be documented in this file.

## [1.0.1] — 2026-03-08

### Fixed

- Replaced GitHub-generated MIT `LICENSE` with the correct Apache License 2.0 (matching PlayRooms Host repo)
- Added missing `relay-bridge.ts` — the bidirectional relay utility module providing canonical helpers for Host↔guest message forwarding (`emitToGuest`, `emitGuestApproved`, `emitGuestRejected`, `broadcastToRoom`, `broadcastToInstance`, `emitGuestConnect`, `emitGuestDisconnect`, `emitValidateRequest`, `emitUpstream`). Adapted from Host repo; all Host-specific logic (lobby, chat, toybox, buttplug, webhooks) stripped — Portal remains a stateless message pipe.

## [1.0.0] — 2026-03-08

### Added

- Initial Portal relay server extracted from HAButtPlugIO-PlayRooms v3.3.0
- Express + Socket.IO server with bidirectional relay between Host and guests
- `/relay` namespace for Host connections with shared secret authentication
- Default namespace for guest WebSocket connections with rate limiting (50 events/sec)
- Token validation proxy — forwards guest tokens to Host via relay channel
- Instance registry — tracks connected Host instances with prefix-based routing
- Guest bridge — tracks guest connections indexed by room and instance
- Token cache — 30-second TTL cache for validation results
- Grace period — 60-second window for Host reconnection before disconnecting guests
- Health endpoint (`GET /api/health`) with version, instance count, and guest count
- Portal info endpoint (`GET /api/portal/info`)
- HA addon structure with `portal/` subdirectory, `config.yaml`, `build.yaml`
- Lightweight Dockerfile — Node.js only, no Intiface Engine or hardware tools
- Standalone Docker deployment via `docker-compose.yml`
- Relay types copied from Host repo (`RELAY_PROTOCOL_VERSION = 1`)
- HA addon translations (English)
- DOCS.md for HA addon documentation tab

### Architecture

- Carried forward from HAButtPlugIO-PlayRooms portal mode (PORTAL_MODE=true)
- Split into standalone repo per v1.0 multi-repo architecture
- Removed all Host-side dependencies (lobby, chat, toybox, buttplug, database)
- Portal-specific config.ts (port, shared_secret, log_level only)
- Portal-specific logger.ts (Portal, Relay, Guest, API subsystems only)
