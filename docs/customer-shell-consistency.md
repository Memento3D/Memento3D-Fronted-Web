# Customer shell consistency

## Audit before implementation

`DashboardLayout` is the existing customer application shell used by `/customer/home`: it owns `Sidebar`, `Topbar`, responsive navigation, and a React Router Outlet. The topbar already provides title, sync, notifications, language, theme, and account controls. There is no separate CustomerLayout implementation.

`PublicLayout` exists with Navbar/Footer and an Outlet, but the catalog/account routes in App.tsx do not use it. Their page components directly embed Navbar/Footer and public-header spacing. AuthProvider is above the router, so layout selection can use the authenticated backend role.

| Routes | Original layout issue | Final composition |
| --- | --- | --- |
| `/customer/home` | Already dashboard | Existing dashboard retained |
| `/products`, `/products/:slug` | Embedded public chrome for everyone | Same content; dashboard for customer, public for guest/staff browsing |
| `/categories`, `/categories/:slug` | Embedded public chrome for everyone | Same role-aware composition as catalog |
| `/cart`, `/checkout` | Customer-only guards but public chrome | Existing customer-only guards + dashboard |
| `/profile`, `/profile/addresses`, `/profile/security` | Protected pages with public chrome | Customer dashboard; permitted staff get their own role dashboard |
| `/orders`, `/customer/orders` | Already dashboard | Existing dashboard retained |
| `/orders/:id`, `/customer/orders/:id` | Dashboard plus duplicate public navbar/footer inside detail page | Single dashboard with shared detail content |
| `/create-keepsake` | Protected page with public chrome | Dashboard for customer; creation logic unchanged |
| `/my-models`, `/customer/models` | Protected page with public chrome | Dashboard for customer; model-list logic unchanged |
| `/scans/:scanId`, `/reconstruction/:scanId` | Protected processing screens with public chrome | Intentionally unchanged; reconstruction processing excluded from this layout batch |
| `/payment/result`, `/payment/vnpay/return` | Callback/result pages with their own chrome | Intentionally unchanged; payment flows excluded |

The sidebar already contained the six requested customer links. Its original pathname-prefix matching missed `/checkout` and `/customer/orders` aliases. Legacy customer/orders dashboard wrappers also forced ROLE_USER navigation even for staff who were already allowed by existing guards.

## Implementation

- `CustomerExperienceLayout` selects DashboardLayout for authenticated ROLE_USER. It otherwise renders the same child routes without granting access; all existing guards remain responsible for authorization. Shared profile routes explicitly support the authenticated staff dashboard as well.
- `DashboardShellContext` lets reused content detect that its enclosing layout already supplies application chrome. DashboardLayout provides it for both customer and existing staff dashboards.
- `ShoppingPageFrame` reuses page children and original public styling. Outside a dashboard it renders the existing public Navbar/Footer; inside a dashboard it renders content only, with no marketing footer or public top offset. It avoids nested main landmarks.
- Catalog, cart, checkout, profile, order-detail, keepsake-create, and model-list components now compose this shared frame rather than duplicating page content or embedding public chrome unconditionally. Product detail loading/error/missing states follow the same composition.
- Existing customer/orders wrappers use the actual authenticated role instead of forcing customer navigation. Their allowed roles are unchanged; staff are not assigned customer identity or cart privileges.
- Topbar itself was reused unchanged. DashboardLayout adds catalog/cart/account page titles using shared customer navigation metadata.
- Customer catalog grids use container queries based on available dashboard width: one column below 560px, two from 560px, three from 900px, four from 1200px. These overrides are scoped to dashboard page content; guest grids retain their original breakpoints. Cards, filters, sorting, API data, and handlers are unchanged.

## Active sidebar mapping

| Current path | Active item |
| --- | --- |
| `/customer/home` | Trang chủ |
| `/products` and descendants | Khám phá sản phẩm |
| `/categories` and descendants | Danh mục kỷ vật |
| `/orders` and descendants; `/customer/orders` and descendants | Đơn hàng của tôi |
| `/cart`, `/checkout` and descendants | Giỏ hàng |
| `/profile` and descendants | Hồ sơ & Bảo mật |

Active matching lives in navigationConfig, not in individual pages. Sidebar uses this same result for active styling and aria-current. Creation/model-list routes have descriptive header titles but do not invent an unrelated active item among the six requested links.

## Files changed

- `src/App.tsx`: role-aware layout route composition; existing guards and URL paths retained.
- `src/components/layout/CustomerExperienceLayout.tsx` (new).
- `src/components/layout/DashboardShellContext.ts` (new).
- `src/components/layout/ShoppingPageFrame.tsx` (new).
- `src/components/layout/shoppingPageFrame.css` (new).
- `src/components/layout/DashboardLayout.tsx`: shell context and customer titles.
- `src/components/layout/navigationConfig.ts`: central route matching and aliases.
- `src/components/layout/Sidebar.tsx`: matching helper and active aria-current.
- `src/features/products/pages/{ProductListPage,ProductDetailPage,CategoryListPage}.tsx`: frame composition and scoped catalog-grid class.
- `src/features/cart/pages/CartPage.tsx`: frame composition only.
- `src/features/orders/pages/{CheckoutPage,CustomerOrderDetailPage}.tsx`: frame composition; dashboard-aware detail loading spacing.
- `src/features/profile/pages/ProfilePage.tsx`: frame composition; existing tabs retained.
- `src/features/reconstruction/pages/{Create3DKeepsakePage,MyModelsPage}.tsx`: frame composition only; no reconstruction business changes.
- `src/test/customer-shell.test.tsx` (new): App-level routing and navigation regressions.
- This document.

## Validation

**215 tests passed across 16 files**, including 31 new shell regressions. New tests mount the actual App router, DashboardLayout, Sidebar, Topbar, and content pages with mocked auth/API boundaries. Public Navbar/Footer are sentinel mocks so their presence or absence can be asserted. Notification transport is mocked, while existing topbar composition is retained.

Coverage includes guest catalog/product-detail browsing; customer home/catalog/product-detail/category/cart/checkout/profile tabs/orders/details/creation/models; sidebar navigation clicks and active aliases; absence of public chrome inside customer pages; guest cart login continuation; staff cart denial; staff catalog browsing; and staff profile navigation using its actual role.

- `npm run test`: pass, 215 tests.
- `npm run build`: pass, including TypeScript project compilation. No separate typecheck script exists. Vite retains its large-bundle advisory.
- Changed-file `npm run lint -- <files>`: pass, with existing warnings in dashboard/profile/product-list hooks.
- `git diff --check`: pass.
- No backend, API endpoints, API payloads, auth contracts/guard implementations, cart context, payment logic, or reconstruction processing logic were changed.
- No live backend credentials or real-browser visual checks were used. Responsive rules are scoped and compiled, but physical device rendering has not been visually verified.
