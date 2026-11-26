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

- JSON username/password login and signup are now exposed at `/apisite/auth/v2/login` and `/apisite/auth/v2/signup`. They create the existing Pekora session cookie, validate username/password, and apply per-IP cooldowns. The Discord application/verification flow remains separate and is not required by this quick-login path.
- Referral, feed, reports, site aggregation, and several library/account methods: no compatible backend route was confirmed.
- Promocode redemption: the route exists but its current implementation always returns a fixed invalid-code response.
- Notifications: the current route returns placeholder data; persistence and mark-read semantics are not complete.
- Several Kandi methods in catalog, develop, groups, avatar, and economy still need request/response adapters or matching server handlers.
- Full API module coverage is not complete; do not describe all 191 Kandi methods as integrated. Methods without verified Pekora contracts remain intentionally disconnected.

## Rendering

The hardcoded third-party renderer IP has been removed. Catalog thumbnail types supported by the bundled RCCService 2020 scripts now use a native SOAP job client (`RccSoapRenderer`) with fixed repository-owned scripts, job cleanup, base64 validation, and a private-address-only SOAP endpoint. Other render types still use the separately configured JSON adapter (`RENDERING_SERVICE_BASE_URL` / `RENDERING_SERVICE_TOKEN`) and are not claimed as RCC-backed. RCCService must run on compatible Windows infrastructure; never expose its SOAP port publicly.

## Deployment

See [VERCEL_BACKEND_SETUP.md](../frontend/VERCEL_BACKEND_SETUP.md). The Vercel project must use `frontend` as its root directory and set `KANDI_BACKEND_URL` to the public HTTPS origin of the separately hosted ASP.NET backend. This repository connection cannot set Vercel project environment variables or deploy external VPS services.

## Build and tests

The GitHub Actions workflow now targets .NET 8, builds `Roblox/Roblox.sln`, runs unit tests, and runs the database-backed integration suite through Docker Compose. The integration test container was upgraded from .NET 6 to .NET 8, and its missing isolated Knex/PostgreSQL test config was added.

No workflow run has been reported by GitHub for the current `main` commit yet, and this environment has no local `dotnet` SDK. Therefore the build and test results remain **unverified** until Actions executes successfully.
