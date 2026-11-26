# Kandi API integration status

All edits in this integration pass are committed directly to `main`.

## Connected route families

The frontend modules now have explicit paths for verified Pekora routes in these areas:

- Authentication session lookup and logout.
- Users, friends, groups, inventory, badges.
- Catalog search/details/favorites/purchases and reseller reads.
- Avatar reads, outfit operations, wear/remove, scales and body colors.
- Chat and private messages.
- Trades.
- Thumbnails.
- Notifications read endpoint.
- Economy balance, group funds and reseller listings.
- Develop asset/version reads and existing upload/update endpoints.
- Ads.
- Forums.
- Membership product/subscription reads.
- Account description, username/password, privacy and promotion-channel routes.

A path being mapped does not guarantee the Kandi request/response DTO is identical to Pekora's. Each method still needs a contract test against the exact page call site and server DTO. Methods with no verified matching route deliberately keep an empty path so the client reports `Not connected yet` rather than sending a guessed request.

## Still not implemented / not production-ready

- JSON login/signup and application/Discord verification methods: the backend's JSON login/signup actions are commented out. Session lookup and logout are connected, but this is not a complete auth flow.
- Referral, feed, reports, site aggregation, and several library/account methods: no compatible backend route was confirmed.
- Promocode redemption: the route exists but its current implementation always returns a fixed invalid-code response.
- Notifications: the current route returns placeholder data; persistence and mark-read semantics are not complete.
- Several Kandi methods in catalog, develop, groups, avatar, and economy still need request/response adapters or matching server handlers.
- Full API module coverage is not complete; do not describe all 191 Kandi methods as integrated.

## Rendering

The hardcoded third-party renderer IP has been removed. `Roblox.Rendering.RenderingHandler` now uses `RENDERING_SERVICE_BASE_URL` and optional `RENDERING_SERVICE_TOKEN`, validates HTTP(S) configuration, applies a timeout, checks HTTP status, and rejects empty/unsuccessful render responses.

This renderer interface is a JSON adapter contract. The repository's RCCService 2020 executable uses a different native job protocol. A separately deployed, tested adapter must translate the existing JSON render routes into RCCService 2020 jobs. The Windows RCCService binary cannot run inside the Linux Vercel Function proxy. Run RCCService on compatible Windows infrastructure and keep its port private.

## Deployment

See [VERCEL_BACKEND_SETUP.md](../frontend/VERCEL_BACKEND_SETUP.md). The Vercel project must use `frontend` as its root directory and set `KANDI_BACKEND_URL` to the public HTTPS origin of the separately hosted ASP.NET backend. This repository connection cannot set Vercel project environment variables or deploy external VPS services.

## Build and tests

The GitHub Actions workflow now targets .NET 8, builds `Roblox/Roblox.sln`, runs unit tests, and runs the database-backed integration suite through Docker Compose. The integration test container was upgraded from .NET 6 to .NET 8, and its missing isolated Knex/PostgreSQL test config was added.

No workflow run has been reported by GitHub for the current `main` commit yet, and this environment has no local `dotnet` SDK. Therefore the build and test results remain **unverified** until Actions executes successfully.
