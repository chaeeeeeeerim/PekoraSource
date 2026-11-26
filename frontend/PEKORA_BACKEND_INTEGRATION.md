# Kandi + Pekora unified deployment

## Architecture

- Kandi is served as static files by the same ASP.NET Core application as Pekora.
- Browser requests use the same origin and the existing Pekora HttpOnly session cookie (.PEKOSECURITY).
- /apisite/ requests are routed to Pekora MVC controllers, not to the legacy frontend proxy.
- Login and account applications remain on Pekora's original Razor flow. No replacement auth system or Kandi-issued session token is introduced.
- CSRF protection remains enabled; the shared API transport retains the x-csrf-token challenge/retry behavior.
- The root Docker image includes frontend/; a separate Node frontend server is not required.

## Connected to verified controller routes

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

- JSON login, signup and logout; account applications continue through the original Pekora Razor flow.
- Catalog purchases (the UI purchase modal does not yet send the required expected seller, price and currency contract), comments, sales history and recommendations.
- Game joining, server lists and game favorites.
- Group wall reading and group game lists.
- Avatar body colors (Kandi uses color inputs, while Pekora requires validated BrickColor IDs), chat conversations, feed, notifications, promo codes, referral rewards and reports.
- Email/password changes, combined account privacy settings and account deletion.
- Economy transaction history/exchanges and membership product purchases. Pekora's products endpoint currently throws NotImplementedException.
- Ad creation/sponsorship management and developer upload workflows.

Do not simulate purchases, balances, trade outcomes, moderation, or application approval. Features listed above must be implemented against real backend contracts before enabling their UI actions.

## Security and deployment

Keep CAPTCHA, password verification, 2FA, session signing keys, database credentials and Discord secrets on the server. Configure PostgreSQL, Redis, storage volumes, base URL and HTTPS in the VPS environment. Never commit secrets or private keys.

## Verification status

The JavaScript API transport and adapter files passed syntax checks and adapter initialization checks. This does not replace a .NET solution build or live integration test. The branch still needs a successful GitHub Actions build, and a configured VPS is required to verify database/Redis connectivity, login/session round-trip, CSRF, uploads and each feature against real data before merging to main or calling it production-ready.