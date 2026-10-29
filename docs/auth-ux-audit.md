# Authentication UX audit and implementation

## Audit before changes

- `LoginPage.tsx` resolves the actor from a prop or login pathname, then passes `ACTOR_PORTAL_CONFIGS` to `AuthLayout` and `LoginForm`. `AuthLayout.tsx` rendered the portal switcher (also on registration, which shares this layout).
- `LoginForm.onFinish` sends trimmed, lowercased `email` and `password` to `AuthContext.login`, which calls `authApi.login`: `POST /auth/login`. No portal or role is sent. Authentication is performed by the backend independently of the selected portal; the client did not reject valid credentials for a mismatched portal.
- The declared `AuthResponse` is `{ accessToken, refreshToken, tokenType, expiresIn, user }`. `User` has one required `role: UserRole`. Supported values are `ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_WAREHOUSE`, `ROLE_OPERATOR`, `ROLE_PROVIDER`, `ROLE_DRIVER`, and `ROLE_USER` (customer). There is no declared `roles`, `authorities`, `permissions`, `defaultRole`, or `primaryRole` in the auth response. No JWT decoding is used to determine roles.
- Password login uses `response.user`; OAuth `loginWithTokens` and session bootstrap use `GET /auth/me`, declared as the same `User`. Refresh responses are declared as `AuthResponse`; the HTTP interceptor updates tokens but does not replace the context user with refresh response data. This audit establishes the frontend contract and usage, not a live backend response capture.
- `AuthProvider` keeps the user in React state. `tokenStorage` stores access/refresh tokens and intended URL in localStorage. The legacy current-user key is removed on cleanup but is not used to restore identity. Requests use bearer tokens. A synchronized interceptor refreshes expired tokens and dispatches a session-expired event on failure. Logout calls `/auth/logout`, clears tokens/intended URL and private query caches, and resets the context user.
- Original password routing first checked the portal's allowed roles. A mismatch went straight to the user's role home. A match could instead trigger warehouse selection based on either the login pathname or warehouse role, then use an arbitrary `redirect` query parameter before the role home. Consequently, warehouse scope initialization was skipped for warehouse users entering some other portals, and ADMIN/MANAGER entering warehouse login could be sent to warehouse home. OAuth (except existing onboarding), `GuestRoute`, and `RootRoute` already use the shared role-home helper.
- The shared map is `src/utils/roleHomeRoutes.ts`, re-exported by `resolveActorRoute.ts`. It includes unprefixed aliases and `ROLE_CUSTOMER`, although guards use exact `UserRole` values. No evidence establishes those aliases as backend response values. Unknown string roles currently fall back to customer home; portal guards still deny unrecognized roles. This existing compatibility behavior was not expanded.
- No multi-role user structure, priority, documented default, or post-login role switch was found. Warehouse selection selects a facility, not a user role. Backend multi-role support cannot be established from this repository; the frontend supports one role.

## Login routes and guards

All routes below render the same Login components. They change branding, Google availability, and the allowed-role check used by the original client routing. None changes the login payload. They are redundant as authentication endpoints, but remain useful as backward-compatible entry URLs.

| Entry | Original allowed roles | Google |
| --- | --- | --- |
| `/login` | USER, ADMIN, MANAGER | yes |
| `/admin/login` | ADMIN | no |
| `/manager/login` | ADMIN, MANAGER | no |
| `/warehouse/login` | ADMIN, MANAGER, WAREHOUSE | no |
| `/operator/login` | ADMIN, MANAGER, OPERATOR | no |
| `/provider/login` | ADMIN, PROVIDER | yes |
| `/driver/login` | ADMIN, DRIVER | no |

`ProtectedRoute` checks authentication; `RoleGuard` checks the backend user's exact role and sends unauthorized users to `/403`. ADMIN routes require ADMIN, so MANAGER cannot enter. OPERATOR routes allow ADMIN/OPERATOR; the original login config incorrectly also allowed MANAGER. WAREHOUSE allows ADMIN/MANAGER/WAREHOUSE. PROVIDER and DRIVER allow their own role plus ADMIN. CUSTOMER uses ROLE_USER plus ADMIN/MANAGER. These existing cross-role permissions are retained.

The `/manager` parent deliberately allows ADMIN/MANAGER/WAREHOUSE/OPERATOR for shared operations; management-only children have narrower guards. Some inventory/material routes inherit this broader permission. General account, checkout, scans, orders, and model pages use authentication without customer-only role restrictions; this audit does not establish that those shared features should be customer-exclusive. `/customer/models` is also authentication-only. Product decisions would be needed before tightening these permissions broadly.

`/warehouse/select` and `/warehouse/no-access` originally required authentication only, despite being warehouse utilities. Their guards now match the warehouse portal's existing roles.

## Implemented changes

Backend role data is sufficient under the existing single-role frontend contract. No backend or API contract changes were needed.

- `src/features/auth/components/AuthLayout.tsx`: removed the portal switcher; kept branding, form card, and security footer. This also removes the shared switcher from registration.
- `src/features/auth/components/LoginForm.tsx`: successful password login clears intended URL and uses the existing shared role-home helper, regardless of portal or query parameter. Removed login-time warehouse routing; warehouse home already offers facility selection and `WarehouseContext` resolves an authorized active facility. Login no longer saves a portal-based OAuth intended URL. Invalid credentials retain the friendly message, unexpected errors show a fixed fallback, and verification failures retain the resend link without displaying raw backend payloads.
- `src/features/auth/utils/resolveActorRoute.ts`: aligned operator allowed roles with its actual route guard by removing MANAGER.
- `src/App.tsx`: guarded both warehouse utility pages with ADMIN/MANAGER/WAREHOUSE.
- `src/features/auth/components/__tests__/loginRouting.test.tsx`: exercises every role through every legacy login entry with a conflicting redirect query, normalized credential payload, invalid credential handling, and MANAGER denial from ADMIN/OPERATOR portals.

## Final landing routes

| Backend role | Landing route |
| --- | --- |
| ROLE_ADMIN | /admin/home |
| ROLE_MANAGER | /manager/home |
| ROLE_WAREHOUSE | /warehouse/home |
| ROLE_OPERATOR | /operator/home |
| ROLE_PROVIDER | /provider/home |
| ROLE_DRIVER | /driver/home |
| ROLE_USER (customer) | /customer/home |

All legacy login routes remain and preserve their branding/actions. Successful authentication always uses backend role data. Existing OAuth onboarding still goes to `/complete-registration` when required; normal OAuth uses `/auth/me` role data and the same home helper. No multi-role selection or arbitrary first-role fallback was added. Future multiple-role responses need an explicit backend default or product-defined priority before support can be implemented safely.

## Verification

- `npm run test`: 78 tests passed across 7 files, including 51 new auth regressions. These use mocked authentication and server rendering, not a real backend/browser session.
- `npm run build`: TypeScript project build and Vite production build passed; Vite reports large bundle chunks.
- `npm run lint`: fails on existing conditional-hook errors in `ManagerOrderDetailPage.tsx` and `CustomerOrderDetailPage.tsx`, plus existing warnings. These files were not changed.
- No standalone typecheck script exists; type checking is included in `build`.
- No live credential tests were performed; no credentials were supplied. Backend response values and real OAuth/token expiry behavior were not runtime-tested.
