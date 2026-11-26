# Kandi on Vercel — backend connection

Set the Vercel project's **Root Directory** to `frontend`. The frontend keeps using same-origin URLs such as `/apisite/users/v1/users/authenticated`; `frontend/vercel.json` rewrites those requests through the server-side proxy in `frontend/api/backend/[...path].js`.

## Required Vercel environment variable

- `KANDI_BACKEND_URL`: HTTPS origin of the ASP.NET Core deployment, for example `https://api.example.net`. Do not set this to the Vercel frontend domain or the proxy will loop back into itself.

Set it for Preview and Production as appropriate, then redeploy. The proxy forwards cookies, CSRF headers, query strings, request methods and response cookies. It rejects requests larger than 4 MiB; large asset uploads must go directly to the backend/VPS rather than through Vercel Functions.

## ASP.NET Core environment

The backend must be reachable from Vercel over HTTPS and listen on its configured container port. Set its canonical `BaseUrl` to the public frontend origin:

- `BaseUrl=https://pekorasource-frontend.vercel.app`

Keep PostgreSQL, Redis, asset storage, and the asset-validation service configured on the backend host. Do not put database credentials, Discord secrets, or renderer tokens in frontend/Vercel client variables.

## RCCService 2020 rendering

The existing rendering handler expects a JSON adapter with routes such as `player/thumbnail`, `catalog/hat`, and `game/thumbnail`. RCCService 2020's native job protocol is not that JSON API. Set `RENDERING_SERVICE_BASE_URL` on ASP.NET to the private HTTPS address of a trusted adapter that translates those requests into RCCService 2020 jobs. Optionally set `RENDERING_SERVICE_TOKEN` for Bearer authentication. Do not expose the raw RCCService port publicly.

The repository contains RCCService 2020 binaries/content, but this change does not claim the service is running: Windows runtime, licensed assets, storage, and a tested job adapter must be deployed separately.

## Validation

The .NET workflow builds `Roblox/Roblox.sln` in Release and runs the solution's unit/integration test projects on pushes to `main`. Vercel proxy validation still requires a real `KANDI_BACKEND_URL` and a deployment environment.
