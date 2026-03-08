# PlayRooms Portal

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

Lightweight, stateless relay server that enables remote guests to connect to a [PlayRooms Host](https://github.com/troon4891/PlayRooms) without the Host being publicly accessible. The Portal accepts guest WebSocket connections, forwards token validation to the Host via the relay channel, and relays messages bidirectionally. It has no concept of rooms, devices, users, or content — it is a dumb pipe with authentication.

## Deployment Options

### Home Assistant Addon

Install as a sister addon alongside the PlayRooms Host addon on the same HA instance.

1. Add this repository to your HA addon store: `https://github.com/troon4891/PlayRooms-Portal`
2. Install **PlayRooms Portal** from the store
3. Configure the **Shared Secret** — this must match the `portal_secret` in your PlayRooms Host addon
4. Start the addon
5. In the PlayRooms Host addon, set `portal_url` to `http://local-playrooms-portal:3001` and `portal_secret` to the same shared secret
6. Restart the PlayRooms Host addon

### Standalone Docker

Deploy on a VPS or cloud server with a public IP address.

```bash
git clone https://github.com/troon4891/PlayRooms-Portal.git
cd PlayRooms-Portal

# Edit docker-compose.yml to set your SHARED_SECRET
docker compose up -d
```

Then configure the PlayRooms Host addon:
- `portal_url`: `https://your-server.example.com:3001`
- `portal_secret`: the same shared secret

## Configuration

### HA Addon Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | int | `3001` | Relay server listen port |
| `shared_secret` | string | — | **Required.** Must match Host's `portal_secret` |
| `log_level` | string | `"info"` | Log verbosity (`debug`, `info`, `warn`, `error`) |

### Environment Variables (Standalone Docker)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORTAL_PORT` | `3001` | Server listen port |
| `SHARED_SECRET` | — | **Required.** Host authentication secret |
| `LOG_LEVEL` | `"info"` | Log verbosity |
| `CORS_ORIGINS` | `"*"` | Allowed CORS origins |

## Verifying It Works

```bash
curl http://localhost:3001/api/health
```

```json
{
  "status": "ok",
  "mode": "portal",
  "version": "1.0.0",
  "connectedInstances": 0,
  "connectedGuests": 0
}
```

Once the Host connects, `connectedInstances` increments to `1`. When guests join through the Portal, `connectedGuests` reflects the active count.

## Architecture

```
Guest (browser) ──WebSocket──→ Portal ←──WebSocket── Host (HA)
                               (relay)
```

The Host connects **outbound** to the Portal on the `/relay` namespace using a shared secret. Guests connect on the default namespace. The Portal routes guest events upstream to the correct Host instance and relays Host responses back downstream.

## Related Repositories

| Repository | Description |
|---|---|
| [PlayRooms](https://github.com/troon4891/PlayRooms) | Host platform — rooms, guest access, device control |
| PlayRooms-DP-* | Device Provider plugins (loaded by Host only) |

## License

[Apache 2.0](LICENSE)