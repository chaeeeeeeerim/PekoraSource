# Kandi + Pekora unified deployment

## Architecture

- Kandi is served as static files by the same ASP.NET Core application as Pekora.
- Browser requests use the existing Pekora HttpOnly session cookie (.PEKOSECURITY); the Vercel preview forwards cookies and CSRF headers through its same-origin proxy.
- /apisite/ requests are routed to Pekora MVC controllers, not to the legacy frontend proxy.
- Kandi quick login/signup use Pekora's existing password hashing and session creation. New users authenticate with Username + Password; Discord application verification is not required for this route.
- The old account-application flow is disabled by default. The quick signup route retains username/password validation, IP cooldown and abuse checks; login retains the existing password and 2FA checks.
- CSRF protection remains enabled; the shared API transport retains the x-csrf-token challenge/retry behavior.
- The root Docker image includes frontend/; a separate Node frontend server is not required.

## Connected to verified controller routes

- Authentication: POST /apisite/v1/login, POST /apisite/v1/signup, GET /apisite/v1/me and POST /apisite/v1/logout, using the Pekora cookie session.
- Session and profile: authenticated user, user details, username search/history, user groups, friends, badges and collectible inventory.
- Friends: friend lists, requests, accept/decline, unfriend and follow.
- Games: game list/search, universe details, recommendations, voting, badges and game icon thumbnails.
- Catalog/library: catalog search, item details, favorites, resellers and read-only library search/details.
- Avatar: current avatar, recent items, outfits, wear/remove assets, wear/update/rename/delete/create outfits, redraw, body scales and avatar type.
- Groups: search, details, members, roles, audit log, join/leave, primary group, description, icon, role management, member role changes, ownership transfer, payouts and wall posting.
- Messages: inbox listing, unread count, message details, sending, marking unread and archive/unarchive.
- Trades: inbound/outbound/completed/inactive lists, details, create, counter, accept and decline.
- Economy: current currency balance and item reseller listings.
- Other verified read routes: current membership subscription, account description, username change, ad listing and public announcements.

## Intentionally not connected

These Kandi methods have no matching implemented Pekora controller route, or the current UI does not send the complete request contract. They remain unavailable rather than being pointed at guessed endpoints:

- Catalog purchases (the UI purchase modal does not yet send the required expected seller, price and currency contract), comments, sales history and recommendations.
- Game joining, server lists and game favorites.
- Group wall reading and group game lists.
- Avatar body colors (Kandi uses color inputs, while Pekora requires validated BrickColor IDs), chat conversations, feed, notifications, promo codes, referral rewards and reports.
- Email/password changes, combined account privacy settings and account deletion.
- Economy transaction history/exchanges and membership product purchases. Pekora's products endpoint currently throws NotImplementedException.
- Ad creation/sponsorship management and developer upload workflows.

Do not simulate purchases, balances, trade outcomes, moderation, or application approval. Features listed above must be implemented against real backend contracts before enabling their UI actions.

## Security and deployment

Keep password verification, 2FA, session signing keys, database credentials and Discord secrets on the server. Admin routes and the admin bundle are restricted to UID 1 and UID 2. The Docker build compiles the Svelte admin bundle; Vercel routes /admin and /admin-api to the ASP.NET backend. External UGC imports require an explicit source-asset allowlist so only owned or licensed assets can be republished. RCCService 2020 handles the supported catalog thumbnail types through a private SOAP endpoint; do not expose the SOAP port publicly. Configure PostgreSQL, Redis, storage volumes, base URL, Vercel KANDI_BACKEND_URL and HTTPS in the deployment environment. Never commit secrets or private keys.

## Verification status

The Vercel preview check only reports that there are no unresolved preview comments; it is not a .NET build result. A successful .NET solution build and live integration test are still required. The Vercel preview also needs KANDI_BACKEND_URL set to a running ASP.NET host. Verify database/Redis connectivity, login/session round-trip, CSRF, admin bundle loading, private RCC connectivity and authorized asset imports before merging to main or calling it production-ready.