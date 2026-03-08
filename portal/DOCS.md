# PlayRooms Portal Documentation

## Overview

PlayRooms Portal is a lightweight relay server that enables remote guests to connect to a PlayRooms Host without the Host being publicly accessible. The Portal accepts guest WebSocket connections, forwards token validation to the Host, and relays messages bidirectionally.

The Portal has no concept of rooms, devices, users, or content. It is a stateless message relay with authentication.

## Deployment Options

### Home Assistant Addon (Sister Addon)

Install the Portal as a Home Assistant addon alongside the PlayRooms Host addon. Both addons run on the same HA instance, connected via a shared secret.

**When to use:** Your HA instance is publicly accessible (e.g., via DuckDNS, Nabu Casa, or a reverse proxy) and you want remote guests to connect through it.

### Standalone Docker

Deploy the Portal on a VPS or cloud server with a public IP. The Host connects outbound to the Portal.

**When to use:** Your HA instance is behind NAT or a firewall and cannot be made publicly accessible.

## Configuration Reference

### HA Addon Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | int | `3001` | TCP port the Portal relay server listens on |
| `shared_secret` | string | `""` | Shared secret for authenticating Host connections. **Required.** Must match the `portal_secret` in the PlayRooms Host addon. |
| `log_level` | string | `"info"` | Server log verbosity (`debug`, `info`, `warn`, `error`) |

### Standalone Docker Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORTAL_PORT` | `3001` | Server listen port |
| `SHARED_SECRET` | — | **Required.** Shared secret for Host authentication |
| `LOG_LEVEL` | `"info"` | Log verbosity level |
| `CORS_ORIGINS` | `"*"` | Allowed CORS origins (comma-separated or `*`) |

## Connecting the Host to the Portal

In the **PlayRooms Host** addon configuration:

1. Set `portal_url` to the Portal's URL (e.g., `http://portal-hostname:3001` or `https://your-vps.example.com:3001`)
2. Set `portal_secret` to the same shared secret configured on the Portal
3. Restart the PlayRooms Host addon

The Host connects outbound to the Portal via Socket.IO. The Portal must be running before the Host attempts to connect.

## Standalone Docker Deployment

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  portal:
    build: ./portal
    ports:
      - "3001:3001"
    environment:
      - PORTAL_PORT=3001
      - SHARED_SECRET=change-me-to-a-strong-secret
      - LOG_LEVEL=info
    restart: unless-stopped
```

Then run:

```bash
docker compose up -d
```

## Verifying the Portal

Check the health endpoint:

```bash
curl http://localhost:3001/api/health
```

Expected response:

```json
{
  "status": "ok",
  "mode": "portal",
  "version": "1.0.0",
  "connectedInstances": 0,
  "connectedGuests": 0
}
```

Once the Host connects, `connectedInstances` will increment to `1`.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check with connection counts |
| `/api/portal/info` | GET | Portal status information |
| `/api/join/:token` | GET | Token validation proxy (forwards to Host) |

## Architecture

```
Guest (browser) ──WebSocket──→ Portal ←──WebSocket── Host (HA)
                               (relay)
```

- **Guest connections** arrive on the default Socket.IO namespace
- **Host connections** arrive on the `/relay` namespace with shared secret auth
- **Token validation** is proxied through the relay channel — the Portal never validates tokens itself
- **All state is ephemeral** — no database, no persistence across restarts

## Relay Protocol

The relay protocol types are defined in the Host repo at `server/src/shared/relay-types.ts` and copied to this repo. The current protocol version is `RELAY_PROTOCOL_VERSION = 1`.

If the Host and Portal protocol versions disagree, the connection will fail with a clear error message. Both repos must be updated together when the protocol changes.
