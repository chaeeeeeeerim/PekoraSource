# Kandi test setup and persistence

The ZIP's frontend, route registry, Creator Hub, and Admin UI are already present under `frontend/` in this repository. Do not replace the integrated `frontend/js/api/pekora.js` adapter with the older unconnected API files from the ZIP.

## Quick username/password account flow

- Pages: `/kandi/login` and `/kandi/signup`.
- Login uses the existing Pekora `POST /v1/login` endpoint, including the existing rate limits, feature flag, password verification, session creation, and optional TOTP code.
- Signup is implemented by `Roblox/Roblox.Website/Controllers/v1/KandiAuth.cs`. It validates the username and password through the existing UsersService, verifies Cloudflare Turnstile, rate-limits by IP, creates the account using the existing password hasher and database transaction, grants 100 Robux (KANBUX) and 100 Tickets (TIX), then issues the normal HttpOnly Pekora session cookie.
- Quick signup is **disabled by default**. Set `KANDI_QUICK_SIGNUP_ENABLED=true` only on the isolated test backend. The Turnstile public/private keys must already be configured in the ASP.NET environment. Do not enable this on a public production revival without additional abuse controls and an explicit launch decision.

## Persistence

Account records and balances are stored by the existing Pekora PostgreSQL services; session/rate-limit state uses Redis. They are not stored in a committed `.db` file. Committing user passwords, session cookies, or a live database dump to Git would expose account data, and Vercel's filesystem is not persistent storage. The repository contains the application code and setup documentation; keep PostgreSQL/Redis data on the backend host and use a disposable test database for testing.

## Admin

The Admin frontend now checks the authenticated session and only renders for numeric UID 1 or UID 2. Its current tables remain clearly marked demonstration data; unsupported admin mutations fail explicitly and are not simulated as successful. The backend's existing `/admin-api/api/*` endpoints continue to enforce their own StaffFilter permissions. UID 1/2 access to real moderation mutations is not implied by this frontend gate and requires server-side authorization work before those actions can be enabled.
