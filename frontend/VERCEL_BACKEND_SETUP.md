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

Catalog thumbnail requests for Hat, Mesh, MeshPart, Model, Image, Head and Emote now call the bundled RCCService 2020 SOAP client directly. Configure `RCC_SOAP_ENDPOINT` to a private/VPN/loopback SOAP endpoint, `RCC_SOAP_NAMESPACE` if your RCC build uses a non-default namespace, and `RCC_SOAP_SCRIPTS_DIRECTORY` when the bundled thumbnail scripts are outside the repository's default path. Head rendering also requires `RCC_HEAD_MANNEQUIN_ID`. The client rejects public RCC SOAP hosts and submits only bundled Lua scripts. Other render types still require a separate JSON adapter via `RENDERING_SERVICE_BASE_URL` and optional `RENDERING_SERVICE_TOKEN`. Do not expose the raw RCCService port publicly.

The repository contains RCCService 2020 binaries/content, but this change does not claim the service is running: Windows runtime, licensed assets, storage, and a tested job adapter must be deployed separately.

## Validation

The .NET workflow builds `Roblox/Roblox.sln` in Release and runs the solution's unit/integration test projects on pushes to `main`. Vercel proxy validation still requires a real `KANDI_BACKEND_URL` and a deployment environment.
