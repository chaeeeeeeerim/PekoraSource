# KSbackend ↔ Project Kandi — API route map

Branch: `ksbackend/integration`  
Frontend source inspected: `project-kandi.zip` (Kandi API modules and integration handoff document)  
Backend source inspected: `Roblox/Roblox.Website/Controllers/v1` and `v2`

## Status definitions

- **Existing — inspect DTO/adapter:** a matching backend controller route exists; the frontend still needs a response adapter and parameter verification.
- **Existing but incomplete:** a route exists, but its implementation returns placeholders, is disabled, or does not perform the requested operation.
- **Missing / unverified:** no matching JSON route has been confirmed in the inspected controllers. Do not point the frontend at a guessed URL.
- **Infrastructure:** requires an external runtime, storage, or service in addition to an HTTP route.

The Kandi archive declares **191 API methods across 26 modules**. All method definitions currently have empty paths (`p: ""`), so none is connected by this document alone.

## Verified backend route families

| Backend controller | Base route | Verified examples |
|---|---|---|
| Authentication v1 | `/apisite/auth/v1` | `GET /usernames/validate`, `POST /username` |
| Authentication v2 | `/apisite/auth/v2` | `POST /user/passwords/change`, `POST /logout` |
| Users v1 | `/apisite/users/v1` | `GET /users/authenticated`, `GET /users/{userId}`, `GET /users/{userId}/username-history` |
| Games v1 | `/apisite/games/v1` | `GET /games`, `GET /games/list`, `GET /games/recommendations/game/{universeId}`, `PATCH /games/{universeId}/user-votes` |
| Catalog v1 | `/apisite/catalog/v1` | `GET /categories`, `GET /subcategories`, `GET /search/items`, `POST /catalog/items/details`, favorite routes |
| Friends v1 | `/apisite/friends/v1` | `GET /users/{userId}/friends`, `GET /my/friends/requests`, request/accept/decline/unfriend/follow routes |
| Inventory v1 | `/apisite/inventory/v1` | `GET /users/{userId}/assets/collectibles`, owned-copy and is-owned routes |
| Economy v1 | `/apisite/economy/v1` | currency, resellers, purchases, group funds and revenue routes |
| Trades v1 | `/apisite/trades/v1` | `GET /trades/{tradeType}`, `GET /trades/{tradeId}`, accept/decline/send/counter |
| Groups v1 | `/apisite/groups/v1` | search, group details, members, roles, permissions, wall, audit log, payouts and settings |
| Private messages v1 | `/apisite/privatemessages/v1` | messages list/get/send/archive/unarchive/mark-unread and unread count |
| Chat v2 | `/apisite/chat/v2` | conversations, get-messages, send-message, mark-as-read |
| Develop v1 | `/apisite/develop/v1` | assets, saved/published versions, places, thumbnails, upload and update routes |
| Notifications v2 | `/apisite/notifications/v2` | unread count, recent notifications and settings |
| Billing v1 | `/apisite/billing/v1` | credit, payment methods, promocode redeem |
| Ads v1 | `/apisite/ads/v1` | sponsored pages, create asset/group ads, run and list ads |
| Forums v1 | `/apisite/forums/v1` | threads, replies, post info, categories |
| Avatar v1 | `/apisite/avatar/v1` | avatar, set-wearing-assets, wear/remove, scales, body colors and outfits |
| Account information v1 | `/apisite/accountinformation/v1` | description, birthdate, gender, promotion channels |
| Account settings v1 | `/apisite/accountsettings/v1` | email, theme, inventory/trade/private-message privacy |

## Kandi module mapping

This is a first-pass mapping from the actual Kandi module method names to backend capabilities. Exact request/response adapters are intentionally not guessed; those require checking each method's call sites and the backend DTO/service.

| Kandi module | Methods | Backend mapping / current assessment |
|---|---:|---|
| `users` | 10 | Users v1 + friends, inventory, catalog, groups and develop controllers. Existing routes; adapt each list/detail shape. |
| `friends` | 6 | Friends v1. Core list/request/accept/decline/remove/follow operations exist. Verify request body and status response. |
| `games` | 10 | Games v1 supports list/details/recommendations/votes; favorite, servers, badges and join need separate route/service verification. Join is also infrastructure-dependent. |
| `catalog` | 11 | Catalog v1 search/details/favorites plus Economy v1 purchases/resellers. Comments/sales-history/recommendations need verification against other controllers/services. |
| `inventory` | 2 | Inventory v1 collectibles exists. General inventory list needs asset-category mapping and pagination adapter. |
| `avatar` | 15 | Avatar v1 supports avatar read, wear/remove, redraw, scales, body colors and outfits. Kandi's getBody/items/setType operations need DTO/route matching. |
| `groups` | 22 | Groups v1 has a broad matching surface including role permissions and audit log. Group games and some UI actions need exact mapping. |
| `trades` | 6 | Trades v1 has list/get/accept/decline/send/counter. Verify trade-type values, payload DTOs and partner ID mapping. |
| `messages` | 7 | PrivateMessages v1 has all listed operation families. Confirm archive/unread response contracts. |
| `chat` | 3 | Chat v2 supports conversations/messages/send. Real-time updates are separate; SignalR hub exists at `/v1/router/signalr`. |
| `notifications` | 1 | Notifications v2 routes exist, but inspected implementation returns fixed/placeholder data. Not production-ready. |
| `promocodes` | 1 | Billing v1 redeem route exists but currently always returns `success=false` with “Invalid promo code.” The implementation explicitly says migration is TODO. |
| `account` | 15 | AccountInformation v1 + AccountSettings v1 + Authentication v1/v2. Some Kandi fields (social links, session management, year, delete) remain unverified. |
| `auth` | 13 | `me` can use Users v1 authenticated-user route. Logout exists. JSON login and signup are commented out in Authentication v2; login directs users to the Razor page. Forgot/reset/verify/2FA/Discord status need implementation or separate verification. |
| `develop` | 28 | Develop v1 has assets, versions, places, thumbnails and uploads. Create game/pass/product/badge and several update operations need route/service matching. |
| `thumbnails` | 3 | Thumbnails v1 has user avatar/headshot/avatar-3d and asset routes; game thumbnail mapping needs verification. |
| `economy` | 7 | Economy v1 supports currency, resellers, purchase and group currency/revenue. Robux/Tix exchange and transactions need verification; do not fabricate balances. |
| `ads` | 3 | Ads v1 supports create and list families. Map the Kandi creator type and response shapes. |
| `forums` | 8 | Forums v1 supports category info, threads, replies and post info. “Mine” and categories list need exact mapping. |
| `badges` | 1 | Badges v1/v2 controllers exist; verify user-owned badge listing. |
| `membership` | 3 | Billing/premium routes exist but membership tiers/purchase are not yet confirmed. |
| `referral` | 3 | No referral JSON controller confirmed in inspected route families. |
| `reports` | 1 | Abuse/report submission route not yet confirmed. |
| `site` | 4 | Home/alerts/announcements/events are composition endpoints; no Kandi-specific aggregate endpoint confirmed. |
| `feed` | 2 | No feed JSON controller confirmed in inspected route families. |
| `library` | 6 | Some operations may map to Catalog/Develop; acquire/comments/favorites need exact controller confirmation. |

## Important implementation blockers confirmed in source

### Authentication

- `GET /apisite/users/v1/users/authenticated` is present and can be used as the starting point for session introspection.
- `POST /apisite/auth/v2/logout` is implemented.
- JSON `POST /apisite/auth/v2/login` and `/signup` are commented out. The source explicitly directs login to a Razor page. Kandi's JSON login/signup cannot be wired to these disabled actions.
- Password change is implemented at `POST /apisite/auth/v2/user/passwords/change`.
- CSRF middleware issues `x-csrf-token` on a 403 challenge; Kandi's retry behavior must be tested with cookie credentials and same-origin hosting.

### Promocodes

- `POST /apisite/billing/v1/promocodes/redeem` exists syntactically but has no redemption logic. It returns a fixed failure.
- The source comment says migration from the legacy Billing controller is TODO.
- Do not mark Kandi promocodes as integrated until real validation, redemption persistence, duplicate prevention and reward delivery are implemented.

### Notifications

- Routes exist, but unread count/recent notifications are fixed placeholder responses. A real notification data source and persistence/events are required.

### Games and creator features

- Website API routes do not by themselves provide a running game execution service.
- `games.join` needs a working game server / arbiter / ticket flow and a compatible RCC runtime. This is infrastructure, not only a missing HTTP adapter.
- Develop upload routes depend on asset storage and the Go asset validation service.

### Rendering and assets

- Asset validation service is a separate Go process listening on port 4300.
- The rendering handler currently needs a configured, reachable renderer implementation. A hardcoded external renderer must not be treated as KSbackend-owned infrastructure.
- Uploaded assets and thumbnails require persistent storage; ephemeral filesystem hosting is insufficient.

## Security and deployment notes

- Prefer serving Kandi and KSbackend on one origin through a reverse proxy. This avoids relying on cross-origin cookies with wildcard CORS.
- Current CORS middleware emits `Access-Control-Allow-Origin: *` and does not emit `Access-Control-Allow-Credentials`. This is incompatible with browser credentialed cross-origin requests.
- Session cookie is `.PEKOSECURITY`; CSRF cookie is `rbxcsrf4`. Keep them HttpOnly and use HTTPS in deployment.
- `Program.cs` now uses `builder.Configuration` on this branch, so ASP.NET Core configuration providers (including environment variables) are available.
- Required runtime dependencies include PostgreSQL, Redis, persistent asset directories, the Go validator and (for game execution) separate compatible game-server infrastructure.

## Next implementation order

1. Build a safe Kandi-facing session/profile adapter using the authenticated-user endpoint and existing session cookie.
2. Add JSON login/signup only after extracting the existing Razor authentication flow and preserving its validation, cooldown, password hashing and session creation behavior.
3. Implement real promocode redemption by reusing the existing reward/legacy billing domain logic; add database-backed single-use protection.
4. Implement response adapters for games/catalog/inventory/avatar/friends/trades/groups/messages.
5. Replace placeholder notifications with persisted notification queries and mark-read operations.
6. Add integration tests for cookies, CSRF retry, permissions, pagination, error conversion and response shapes.
7. Only then connect the frontend methods and mark individual features tested.
