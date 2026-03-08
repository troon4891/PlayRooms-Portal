# Changelog

## 1.0.1 — 2026-03-08

### Fixed

- Replaced MIT LICENSE with Apache License 2.0 (matching PlayRooms Host repo)
- Added missing `relay-bridge.ts` — bidirectional relay utility module for Host↔guest message forwarding

## 1.0.0 — 2026-03-08

### Added

- Initial release — lightweight relay server for remote guest access
- Accepts Host connections on `/relay` namespace with shared secret auth
- Accepts guest connections on default namespace
- Token validation proxy via relay channel
- Rate limiting (50 events/sec per guest)
- Grace period for Host reconnection (60 seconds)
- Health check endpoint at `/api/health`
- Configurable via HA addon options or environment variables

### Relay Protocol

- Protocol version: 1 (synced with PlayRooms Host v1.0.1)
