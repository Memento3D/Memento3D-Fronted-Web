# Cart authentication audit and implementation

## Audit completed before implementation

- `src/App.tsx` registered `/cart` publicly, allowing guests to render its empty-cart UI. `/checkout` used `ProtectedRoute`, redirecting guests to `/login?redirect=...`, but allowing any authenticated role.
- `CartContext` owns every cart API call: read, add, quantity update, remove, and clear. It skipped guest reads and guest adds, but guest adds only displayed a warning. Other mutations had no auth checks. Staff could read/mutate carts. The API itself remains unchanged (`GET/DELETE /cart`, `POST /cart/items`, `PATCH/DELETE /cart/items/:id`). No guest cart is introduced.
- `ProductCard.handleAddToCartClick` supplies list/category cards. It calls `CartContext.addToCart`, with an optional custom callback that could bypass this handler. No current custom callback usage was found. `ProductShowcase` has a separate inline quick-add. `ProductDetailPage.handleAddToCart` and `handleBuyNow` both use the context with quantity/customization. Buy Now navigates to checkout only after a successful add. A separate detail-page checkout CTA also exists and is covered by the checkout route guard.
- Cart quantity controls, delete buttons, and clear confirmation all use `CartContext`; checkout links navigate to `/checkout`. Checkout reads the authenticated user/cart, rejects empty-cart submission, and validates shipping fields through its existing form. Reconstruction's `FreemiumModelViewer` and payment-result actions can also navigate to checkout. They are covered by the route guard; existing checkout query handling is unchanged.
- Navbar menu, desktop icon/link, mobile icon, and mobile drawer all navigated directly to `/cart`; so did the footer. Shared layout navigation also has a cart link, covered by the route guard.
- Batch 1 password login cleared stored intended URL and used the backend role-home map unconditionally. OAuth did the same after fetching `/auth/me`, except for required onboarding. `GuestRoute` used role home too. `ProtectedRoute` and `RoleGuard` produced `redirect` queries, but no flow honored them. Google buttons could store an intended URL in localStorage. There was no shared safe redirect validator and no supported `returnUrl`, `next`, or router `state.from` continuation flow.
- Customer is exactly `ROLE_USER` in the backend-facing `UserRole` contract. Staff must not inherit cart rights from their existing access to other customer pages. Changing role data, role guard permissions elsewhere, or backend contracts is unnecessary.

This can be implemented safely frontend-only. The chosen strategy is **simple return (Option A)**: return guests to the originating product and require another Add click. Quantity/customization are not persisted across login, and no mutation is automatically replayed.

## Implemented behavior

| Flow | Before | After |
| --- | --- | --- |
| Guest `/cart` | Public empty-cart UI | Login with intended `/cart`; cart never mounts |
| Guest `/checkout` | Login, then role home | Login, then checkout for customer |
| Customer cart/checkout | Accessible | Accessible with existing cart/form validation |
| Staff cart/checkout | Accessible | Own role home; customer page never mounts |
| Guest Add/Buy Now | Warning only | Login with originating product return; no cart API call |
| Staff Add/cart mutation | Allowed | Own role home; no cart API call |
| Guest header/footer Cart | Public cart page | Direct login with `/cart` intent |
| Customer header/footer Cart | Cart | Cart |
| Logout/session expiry | Cart route remained public | Customer guard removes protected page and preserves return destination |

`postLoginDestination.ts` is the single continuation validator/resolver. It accepts only `/cart`, `/checkout`, `/products`, and a single product slug/id path, including query/hash. It rejects external/protocol-relative URLs, backslashes, control characters, malformed escaping, and unrelated paths (including staff/login/callback routes). URL parsing also normalizes paths before the allowlist check. These restrictions intentionally provide shopping continuation rather than a generic arbitrary internal redirect feature.

Only `ROLE_USER` may honor shopping continuation. All other roles use the unchanged shared role-home mapping. The destination never changes session identity or role. Password login and `GuestRoute` resolve the validated query. Google initiation replaces stale stored intent with a validated shopping path; callback consumes and validates it after `/auth/me`. Required OAuth consent onboarding remains first, then consumes the same continuation. Without a continuation, existing OAuth onboarding completion still returns customers to `/products`.

`CartContext` checks customer authorization before every operation and exposes cart data only for its owning account and customer role. BrowserRouter now wraps CartProvider so these checks can navigate without a new state framework. Guest/staff refreshes do not call the cart API. Quick-adds supply a product return path; detail-page adds preserve their current product pathname/search through the context. ProductCard checks auth before invoking even an optional custom add callback.

Cart and checkout errors now use fixed friendly messages instead of raw backend error text. The existing shared interceptor performs token refresh and expires the session on refresh failure; the route guard then preserves the cart/checkout location. No new mutation retries or replay loop was added. Backend enforcement remains necessary, as with all frontend guards, but this task requires no backend/API change.

## Files changed

- `src/App.tsx`: customer route wrappers; router/provider placement.
- `src/features/auth/components/CustomerRoute.tsx`: authentication plus customer-only guard, staff role-home fallback.
- `src/features/auth/utils/postLoginDestination.ts`: shared role and safe continuation helpers.
- `src/features/auth/components/LoginForm.tsx`, `GuestRoute.tsx`: password and already-authenticated login continuation.
- `src/features/auth/components/GoogleLoginButton.tsx`, `GoogleSignInButton.tsx`: validated stored OAuth continuation.
- `src/features/auth/pages/OAuthCallbackPage.tsx`, `CompleteRegistrationPage.tsx`: OAuth and required-onboarding continuation.
- `src/features/cart/context/CartContext.tsx`: checks around reads/mutations, product return context, account-scoped cart visibility, safe error messages.
- `src/features/home/components/Navbar.tsx`, `Footer.tsx`: direct role-aware cart entry.
- `src/features/home/components/ProductShowcase.tsx`, `src/features/products/components/ProductCard.tsx`: quick-add product return and callback protection.
- `src/features/orders/pages/CheckoutPage.tsx`: friendly error messages; existing validation retained.
- `src/features/auth/components/__tests__/loginRouting.test.tsx`: actual login handlers, route guards, logout/expiry auth-state checks.
- `src/features/auth/utils/__tests__/postLoginDestination.test.ts`: continuation allowlist, hostile URLs, staff fallbacks, cart entry helper.
- `src/features/cart/context/__tests__/CartContext.test.tsx`: actual context handlers with mocked API; no guest/staff reads/mutations and unchanged customer mutations.

## Validation and limits

- Tests: 117 passed in 9 files, covering all requested scenarios through handler/guard/helper tests. Existing Batch 1 regressions remain passing.
- Build: `npm run build` includes `tsc -b` and Vite production compilation. No separate typecheck script exists.
- Changed-file lint: exits successfully; existing warnings remain in the OAuth callback, footer, and cart context. Unrelated repository-wide lint failures were not changed.
- No credentials were provided; no live backend login, OAuth redirect, browser click-through, or real token-expiry test was performed. Route/auth-state transitions are server-rendered tests; navigation and API boundaries are mocked. Header behavior is checked through its shared helper and source review rather than full browser interaction.
- No backend dependency blocks the implemented flow. Preserving exact product configuration or automatically replaying a cart mutation would require a separate product decision and is intentionally excluded.
