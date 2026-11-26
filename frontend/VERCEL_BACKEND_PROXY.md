# Vercel + PekoraSource backend proxy

The frontend remains static in this repository. Vercel does not run the ASP.NET Core application or the Windows RCCService executable. The rewrites in `vercel.json` send supported API/admin requests through `api/proxy.js` to the separately hosted ASP.NET backend.

## Required Vercel setting

In the Vercel project that deploys the `frontend/` directory, add this environment variable for Preview and Production:

- `KANDI_BACKEND_URL`: the origin of the running ASP.NET Core backend, for example `https://api.example.invalid` (replace with the real backend origin; do not include a route path).

Do not put database passwords, Discord secrets, RCC keys, or other credentials in frontend JavaScript or commit them to GitHub.

The proxy forwards session cookies and the CSRF token and preserves `Set-Cookie`, `Location`, and `x-csrf-token` response headers. It only accepts a fixed list of backend route prefixes; it is not an arbitrary URL proxy.

## Backend requirements

- Serve the ASP.NET application over HTTPS.
- Configure `BaseUrl` to the backend's public origin.
- Keep PostgreSQL and Redis private.
- Keep the RCC SOAP port private to the backend/worker network. RCCService SOAP can execute submitted Lua scripts and is not an internet-facing API; do not expose its port publicly.
- Vercel is only the frontend/API proxy in this test setup. It is not the Windows RCC host.

## Limits

Large file uploads and large binary responses should go directly to the backend's storage/CDN or a private upload path, not through a Vercel Function. The proxy is intended for auth, JSON APIs, and the admin interface.
