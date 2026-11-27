# Kandi deployment — one repository, two deployment targets

The frontend and ASP.NET Core backend live in this same repository. They are not separate source projects.

## Production / VPS (single application and domain)

For the intended VPS deployment, build and run the repository's root `Dockerfile` (not a frontend-only deployment). The image publishes `Roblox/Roblox.Website` and copies the repository's `frontend/` directory into the ASP.NET application's content root.

The ASP.NET application serves the Kandi frontend from that directory and handles its API/controllers on the same origin. Therefore:

- No `KANDI_BACKEND_URL` is needed on the VPS.
- Do not point the application to itself through the Vercel proxy.
- Set `BaseUrl` to the public VPS domain, for example `https://kandi.example.com`.
- Keep PostgreSQL, Redis, asset storage, and private rendering services configured for the backend host.
- Keep secrets (database credentials, Discord secrets, renderer tokens, hCaptcha private key) in server-side environment variables or a secret manager, never in frontend files.

The container listens on port `10000` by default (`ASPNETCORE_URLS`). Put a reverse proxy such as Caddy/Nginx in front for HTTPS and forward requests to that port.

## Vercel preview (temporary frontend preview)

Vercel does not run this ASP.NET Core application from the same repository as a normal static frontend deployment. If the frontend is deployed to Vercel with **Root Directory** set to `frontend`, its API requests must be forwarded to a separately running, reachable instance of the ASP.NET backend.

For that preview-only arrangement, configure:

- `KANDI_BACKEND_URL`: HTTPS origin of the running ASP.NET backend, e.g. `https://api-preview.example.net`.

This variable belongs only to the Vercel preview deployment. It is not a source-code split, a second repository, or a requirement for the single-domain VPS deployment. Never set it to the Vercel frontend domain, which would proxy requests back into itself.

The Vercel proxy is implemented in `frontend/api/backend/[...path].js` and rewrites are in `frontend/vercel.json`. It forwards cookies, CSRF headers, query strings, methods and response cookies. It limits request bodies to 4 MiB; large asset uploads should go directly to the backend/VPS.

## Backend configuration

Set `BaseUrl` to the public origin used by the active deployment:

- VPS: the VPS domain serving both frontend and backend.
- Vercel preview: the public frontend origin, while `KANDI_BACKEND_URL` points to the separate preview backend.

Do not expose database credentials, Discord secrets, hCaptcha private keys, or renderer tokens in frontend/Vercel client variables.

## RCCService 2020 rendering

Catalog thumbnail requests for Hat, Mesh, MeshPart, Model, Image, Head and Emote call the bundled RCCService 2020 SOAP client. Configure `RCC_SOAP_ENDPOINT` to a private/VPN/loopback SOAP endpoint, `RCC_SOAP_NAMESPACE` if your RCC build uses a non-default namespace, and `RCC_SOAP_SCRIPTS_DIRECTORY` when the bundled thumbnail scripts are outside the repository's default path. Head rendering also requires `RCC_HEAD_MANNEQUIN_ID`. The client rejects public RCC SOAP hosts and submits only bundled Lua scripts. Other render types still require a separate JSON adapter via `RENDERING_SERVICE_BASE_URL` and optional `RENDERING_SERVICE_TOKEN`. Do not expose the raw RCCService port publicly.

The repository contains RCCService 2020 binaries/content and the SOAP client integration. Live rendering is still unverified until the compatible Windows runtime, licensed assets, persistent asset storage, and private SOAP endpoint are configured and exercised.

## Quick signup

The Kandi signup page uses hCaptcha, matching the ASP.NET `HCaptcha.IsValid` validation. Set `KANDI_QUICK_SIGNUP_ENABLED=true` on the isolated test backend and configure `HCaptcha:Public` and `HCaptcha:Private` there. Signup is disabled by default.

## Validation

The .NET workflow builds `Roblox/Roblox.sln` in Release and runs the solution's unit/integration test projects on pushes to `main`. A successful .NET build does not by itself verify live Vercel proxy connectivity or RCC rendering; those require their respective running services.
