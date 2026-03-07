# Security Policy — PlayRooms Portal

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | Yes       |

Only the latest release on the `main` branch receives security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in PlayRooms Portal, **please do not open a public issue.**

Instead, report it privately via GitHub's security advisory feature:

1. Go to the [Security Advisories](https://github.com/troon4891/PlayRooms-Portal/security/advisories) page
2. Click **"Report a vulnerability"**
3. Provide a clear description of the issue, steps to reproduce, and any relevant details

You can expect an initial response within **7 days**. We will work with you to understand the issue and coordinate a fix before any public disclosure.

## Scope

The following areas are in scope for security reports on this repository:

### Connection Security
- WebSocket transport security between guests and the Portal
- WebSocket transport security between the Portal and the Host
- TLS/SSL configuration issues in standalone deployments
- Connection hijacking or impersonation vulnerabilities

### Authentication & Token Handling
- Shared secret exposure or bypass between Host and Portal
- Guest token validation bypass or forgery
- Token forwarding vulnerabilities (leaking tokens to unintended parties)
- Replay attacks against token validation

### Rate Limiting & Denial of Service
- Connection flooding that bypasses rate limiting
- Resource exhaustion through crafted WebSocket messages
- Memory leaks exploitable through connection patterns
- Slowloris-style attacks against the relay server

### Protocol Security
- Relay protocol version mismatch exploitation
- Message injection or tampering in the relay pipeline
- Cross-guest data leakage through the relay

### Out of Scope

The following are **not** in scope for this repository:

- Vulnerabilities in the PlayRooms Host — report those to the [PlayRooms](https://github.com/troon4891/PlayRooms) repository
- Vulnerabilities in Device Provider plugins — report those to the respective plugin repository
- Issues requiring physical access to the deployment host
- Social engineering attacks
- Denial of service via volumetric network flooding (infrastructure-level, not application-level)

## Disclosure Policy

- We follow coordinated disclosure. Please allow us reasonable time to address the issue before public disclosure.
- We will credit reporters in the changelog and release notes unless they prefer to remain anonymous.
- We do not currently offer a bug bounty program.
