# Deploy Kandi + PekoraSource on Vercel

This repository is intentionally kept as **one source repository**. The Vercel deployment runs the existing ASP.NET Core application, which also serves the Kandi frontend from `wwwroot`.

## Vercel project settings

- Import this repository into one Vercel project.
- Set **Root Directory** to the repository root (not `frontend/` or `Roblox/Roblox.Website/`).
- Keep the framework setting on **Other / Container** if Vercel asks; the root `vercel.json` selects the Container framework.
- Deploy the branch containing `Dockerfile.vercel` and `vercel.json`.

Vercel builds `Dockerfile.vercel`, publishes `Roblox/Roblox.Website/Roblox.Website.csproj`, copies `frontend/` into the ASP.NET Core web root, and serves both the website and API from the same origin.

## Environment variables

Configure the backend's existing settings in **Vercel → Project → Settings → Environment Variables**. Do not put credentials in the repository or frontend JavaScript.

At minimum, supply the same production configuration currently required by PekoraSource, including:

- PostgreSQL connection string (`Postgres`)
- Redis connection string (`Redis`)
- Base URL and CDN URL
- All existing storage/template/script directory settings
- JWT session signing configuration
- Application, game-server, bot, and authorization secrets
- hCaptcha settings, if enabled
- Discord OAuth settings, using a newly rotated client secret

For nested .NET configuration keys, use double underscores in environment variable names (for example, `Directories__Asset`, `Discord__ClientId`, and `Jwt__Sessions`). For scalar root keys, use their existing names (for example, `Postgres`, `Redis`, and `BaseUrl`). Array settings use indexed keys such as `OwnerUserId__0`.

Use managed/external PostgreSQL and Redis services. Do not rely on files written inside the container for durable user data, sessions, uploaded assets, or databases.

## Important runtime limitations

Vercel container deployments run as request-serving, stateless instances and may scale down when idle. Treat this as an integration/preview environment first. Pekora features that require always-on workers, local persistent storage, stable outbound IPs, long-lived game-server processes, or guaranteed WebSocket lifetime need separate validation and may need to stay on a VPS.

The current backend startup code also launches background tasks. Confirm those tasks behave correctly when an instance is restarted or scaled to zero before treating this deployment as production-ready.

## Local validation

Build the Vercel image from the repository root with Docker:

```sh
docker build -f Dockerfile.vercel -t kandi-pekora-vercel .
docker run --rm -p 8080:80 --env-file .env kandi-pekora-vercel
```

Then check:

- `http://localhost:8080/health`
- `http://localhost:8080/` for the Kandi frontend
- The actual login/API flows against the configured external services

The health endpoint only confirms that the ASP.NET Core process is responding; it does not prove database connectivity, authentication, or all Pekora services are healthy.
