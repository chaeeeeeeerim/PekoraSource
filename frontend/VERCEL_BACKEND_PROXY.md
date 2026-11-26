# Vercel + PekoraSource backend proxy

The Vercel project should use `frontend/` as its Root Directory. The browser calls the ASP.NET API through the same-origin `/apisite/` prefix; `vercel.json` rewrites API, admin, asset and thumbnail requests through `api/proxy.js` to the separately hosted ASP.NET backend. Vercel does not run ASP.NET Core or the Windows RCCService executable.

## Required Vercel setting

In the Vercel project that deploys the `frontend/` directory, add this environment variable for Preview and Production:

- `KANDI_BACKEND_URL`: the origin of the running ASP.NET Core backend, for example `https://api.example.invalid` (replace with the real backend origin; do not include a route path).

Do not put database passwords, Discord secrets, RCC keys, or other credentials in frontend JavaScript or commit them to GitHub.

The proxy forwards session cookies and the CSRF token and preserves `Set-Cookie`, `Location`, and `x-csrf-token` response headers. It only accepts a fixed list of backend route prefixes; it is not an arbitrary URL proxy.

## Backend requirements

- Keep the legacy application-based signup flow disabled. The backend now forces `ApplicationsEnabled=false` by default; set `KANDI_DISABLE_APPLICATIONS=false` only if you intentionally restore it. Quick Username/Password signup uses the separate `/v1/signup` route.
- Serve the ASP.NET application over HTTPS.
- Configure `BaseUrl` to the ASP.NET backend's public origin (the RCC worker uses it to fetch Kandi asset content).
- The Dockerfile now builds `admin/` with Node/Webpack and copies the generated `admin/public/build/bundle.js` and CSS into the backend image. The real admin interface is served by ASP.NET at `/admin/`; `/Admin/` redirects there.
- The backend hard-codes the admin owner IDs to UID 1 and UID 2. Other staff permissions do not grant admin-panel access.
- The old account-application flow is disabled by default. `KANDI_DISABLE_APPLICATIONS=false` is the explicit opt-in to restore it. Quick Username/Password signup is enabled by default; set `KANDI_DISABLE_SIGNUP=true` to pause new registrations.
- New account creation is handled by `/apisite/v1/signup`; it does not require Discord application verification and retains username/password validation, IP cooldown and abuse checks.
- External UGC source imports are disabled unless `KANDI_UGC_ALLOWED_SOURCE_ASSET_IDS` contains comma-separated asset IDs that Kandi owns or is licensed to republish.
- Keep PostgreSQL and Redis private.
- Keep the RCC SOAP port private to the backend/worker network. RCCService SOAP can execute submitted Lua scripts and is not an internet-facing API; do not expose its port publicly.
- On the ASP.NET backend, configure `RCC_SOAP_ENDPOINT` to the private/VPN address of the RCCService 2020 catalog process (the repository's `RCCCatalogRender.bat` uses port `4621`).
- Configure `RCC_SOAP_SCRIPTS_DIRECTORY` to the absolute path of `RCCService/RCCService2020/internalscripts/thumbnails`.
- Set `RCC_SOAP_NAMESPACE` to the SOAP namespace compiled into the RCC binary (defaults to `http://roblox.com/`).
- Set `RCC_HEAD_MANNEQUIN_ID` to a valid Kandi-hosted mannequin asset ID for head thumbnails.
- Set `KANDI_UGC_ALLOWED_SOURCE_ASSET_IDS` on the ASP.NET backend to a comma-separated allowlist of source asset IDs that Kandi owns or has explicit permission to republish. An empty value intentionally disables external UGC imports.
- The backend only submits fixed scripts from the repository and rejects public RCC endpoints. The network firewall must still allow only the backend/VPN peer to reach the RCC port.
- Hat, mesh, mesh-part, model, image, head, and emote thumbnail jobs use RCCService 2020. Other render types still require a separately managed compatible renderer; configure `KANDI_LEGACY_RENDER_API_URL` only if you operate that renderer.
- Vercel is only the frontend/API proxy in this test setup. It is not the Windows RCC host.

## Limits

Large file uploads and large binary responses should go directly to the backend's storage/CDN or a private upload path, not through a Vercel Function. The proxy is intended for auth, JSON APIs, and the admin interface.
