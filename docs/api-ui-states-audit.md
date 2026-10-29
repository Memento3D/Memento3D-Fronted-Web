# API-driven UI state audit

This table records the source audit **before implementation**. File names resolve under `src/features/<feature>/pages/` unless a full path is given. L/S/E/F mean loading/success/empty/failure; `~` means partial or ambiguous; `—` means not applicable. A successful zero-valued dashboard is usable data, not an empty response. Secondary queries are called out separately from the main content.

| Screen / route | File | Data source / hook | L | S | E | F | Classification | Recommended fix |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Admin users `/admin/users` | admin/AdminUsersPage.tsx | adminApi.getUsers / useQuery | yes | yes | yes | yes | COMPLETE | Retain ServerDataTable states |
| Admin orders `/admin/orders` | admin/AdminOrdersPage.tsx | adminApi / useQuery | yes | yes | yes | yes | COMPLETE | Retain ServerDataTable states |
| Admin payments `/admin/payments` | admin/AdminPaymentsPage.tsx | adminApi / useQuery | yes | yes | yes | yes | COMPLETE | Retain ServerDataTable states |
| Admin printers `/admin/printers` | admin/AdminPrintersPage.tsx | adminApi / useQuery | yes | yes | yes | yes | COMPLETE | Retain ServerDataTable states |
| Admin print jobs `/admin/print-jobs` | admin/AdminPrintJobsPage.tsx | adminApi / useQuery | yes | yes | yes | yes | COMPLETE | Retain ServerDataTable states |
| Admin reconstruction `/admin/reconstruction` | admin/AdminReconstructionPage.tsx | adminApi / useQuery | yes | yes | yes | yes | COMPLETE | Keep list error separate from retry mutation |
| Admin audit `/admin/audit-logs` | admin/AdminAuditLogsPage.tsx | adminApi / useQuery | yes | yes | yes | yes | COMPLETE | Retain ServerDataTable states |
| Materials `/manager/materials` | material/MaterialManagementPage.tsx | useMaterials | yes | yes | yes | yes | COMPLETE | Retain ServerDataTable states |
| Manager products `/manager/products` | manager/ManagerProductsPage.tsx | productApi / categoryApi | yes | yes | yes | ~ | PARTIAL | Main table complete; category lookup failure hidden |
| Products `/products`, `/categories/:slug` | products/ProductListPage.tsx | productApi / categoryApi | yes | yes | yes | ~ | PARTIAL | Primary grid complete; category lookup failure hidden |
| Product `/products/:slug` | products/ProductDetailPage.tsx | productApi.getBySlug | yes | yes | ~ | ~ | PARTIAL | Separate failed request from missing product; retry |
| Categories `/categories` | products/CategoryListPage.tsx | categoryApi.list | yes | yes | yes | no | PARTIAL | Error before empty; refetch action |
| Customer orders `/customer/orders`, `/orders` | customer/CustomerOrdersPage.tsx | useOrders / useOrderStatusCounts | yes | yes | yes | ~ | PARTIAL | Fixed safe error copy; counts lookup also has no error presentation |
| Customer order `/orders/:id`, `/customer/orders/:id` | orders/CustomerOrderDetailPage.tsx | useOrderDetail / payment queries | yes | yes | ~ | ~ | PARTIAL | Separate missing/error; remove raw error; existing conditional hooks need careful handling |
| Manager orders `/manager/orders` | orders/ManagerOrdersPage.tsx | useOrders / useManagerOrderStatusCounts | yes | yes | yes | no | PARTIAL | Primary list error and retry; counts failure hidden |
| Manager order `/manager/orders/:id` | orders/ManagerOrderDetailPage.tsx | useOrderDetail / payments / jobs | yes | yes | ~ | ~ | PARTIAL | Separate missing/error; existing conditional hooks need careful handling |
| Cart `/cart` | cart/CartPage.tsx | CartContext / cartApi.getCart | ~ | yes | yes | no | PARTIAL | Context read error, initial pending state, retry |
| Checkout `/checkout` | orders/CheckoutPage.tsx | CartContext | ~ | yes | yes | no | PARTIAL | Same read failure must block empty/form UI |
| Inventory `/warehouse/inventory`, `/manager/inventory` | inventory/WarehouseDashboardPage.tsx | useInventoryBalances / lookups | yes | yes | yes | no | PARTIAL | Query error + retry; secondary lookup states |
| Receipts `/warehouse/receipts`, `/manager/receipts` | inventory/GoodsReceiptsManagementPage.tsx | wmsEnterpriseApi / useQuery | yes | yes | yes | no | PARTIAL | Error before table; retry; lookup failures |
| Issues `/warehouse/issues`, `/manager/issues` | inventory/StockIssuesManagementPage.tsx | wmsEnterpriseApi / useQuery | yes | yes | yes | no | PARTIAL | Error before table; retry; lookup failures |
| Transfers `/manager/transfers` | inventory/WarehouseTransfersPage.tsx | wmsEnterpriseApi / useQuery | yes | yes | yes | no | PARTIAL | Error before table; retry; lookup failures |
| Adjustments `/manager/adjustments` | inventory/StockAdjustmentsPage.tsx | wmsEnterpriseApi / useQuery | yes | yes | yes | no | PARTIAL | Error before table; retry; lookup failures |
| Counts `/manager/stock-counts` | inventory/StockCountsPage.tsx | wmsEnterpriseApi / useQuery | yes | yes | yes | no | PARTIAL | Error before table; retry; warehouse lookup failure |
| Receipt history/form `/manager/inventory/receipts/new` | inventory/StockReceiptPage.tsx | useStockReceipts / warehouses / materials | yes | yes | yes | no | PARTIAL | History error and retry; lookup feedback |
| Issue history/form `/manager/inventory/issues/new` | inventory/StockIssuePage.tsx | useStockIssues / warehouses / materials | yes | yes | yes | no | PARTIAL | History error and retry; lookup feedback |
| Transactions `/manager/inventory/transactions` | inventory/StockMovementReportPage.tsx | useInventoryTransactions / warehouses | yes | yes | yes | no | PARTIAL | Error before table; retry |
| Print operations `/operator/jobs`, `/manager/print-jobs` | printjob/PrintJobOperationsPage.tsx | usePrintJobs / lookups | yes | yes | yes | no | PARTIAL | Error before table; retry; lookup feedback |
| Warehouses `/manager/warehouses` | warehouse/WarehouseManagementPage.tsx | useWarehouses | yes | yes | yes | no | PARTIAL | Error before table; retry |
| Manager categories `/manager/categories` | manager/ManagerCategoriesPage.tsx | categoryApi / useQuery | yes | yes | yes | no | PARTIAL | Error before table; retry |
| Approval center `/manager/approvals` | manager/ManagerApprovalsCenterPage.tsx | four wmsEnterpriseApi queries | yes | yes | yes | no | PARTIAL | Independent error/retry per tab |
| Admin products `/admin/products` | admin/AdminProductsPage.tsx | products + categories / useQuery | yes | yes | yes | no | PARTIAL | Independent error/retry per tab |
| Admin user `/admin/users/:id` | admin/AdminUserDetailPage.tsx | user detail + audit / useQuery | yes | yes | yes | no | PARTIAL | Failed lookup must not mean user absent; audit table error |
| System health `/admin/system` | admin/AdminSystemHealthPage.tsx | adminApi.getSystemHealth | ~ | yes | no | no | PARTIAL | No assumed HEALTHY before response; error/empty/retry; null latency N/A |
| Admin home `/admin/home` | admin/AdminHomePage.tsx | dashboard overview + audit | ~ | yes | ~ | no | PARTIAL | Independent query feedback; avoid false zero summaries |
| Admin dashboard `/admin/dashboard`, `/manager/admin` | admin/AdminDashboardPage.tsx | overview/revenue/growth/categories | yes | yes | ~ | no | PARTIAL | Independent query feedback |
| Manager home `/manager/home` | manager/ManagerHomePage.tsx | dashboard + inventory queries | ~ | yes | ~ | no | PARTIAL | Independent query feedback |
| Manager dashboard `/manager/dashboard` | manager/ManagerDashboardPage.tsx | useDashboard / realtime | yes | yes | ~ | ~ | PARTIAL | Safe failure copy; retain useful cached data |
| Warehouse home `/warehouse/home` | warehouse/WarehouseHomePage.tsx | balances/receipts/issues/materials/warehouses | ~ | yes | ~ | no | PARTIAL | Per-section loading/error; zero is not proof of success |
| Operator home `/operator/home` | operator/OperatorHomePage.tsx | printJobs/printers | ~ | yes | ~ | no | PARTIAL | Independent query feedback |
| Customer home `/customer/home` | customer/CustomerHomePage.tsx | useOrders + categoryApi | ~ | yes | ~ | no | PARTIAL | Independent query feedback |
| Public home `/` | home/HomePage.tsx | ProductShowcase queries in child | yes | yes | yes | ~ | PARTIAL | Category lookup failure hidden; inspect child grid |
| Warehouse selection `/warehouse/select` | auth/WarehouseSelectPage.tsx | warehouseApi.getMyWarehouses | yes | yes | yes | ~ | PARTIAL | Separate request failure from no warehouse assignment |
| My models `/my-models`, `/customer/models` | reconstruction/MyModelsPage.tsx | getMyJobs in useEffect | yes | yes | yes | no | PARTIAL | Stop swallowing failure; presentation-only retry |
| Reconstruction `/reconstruction/:scanId`, `/scans/:scanId` | reconstruction/ScanReconstructionPage.tsx | resolve job / poll / outputs | ~ | yes | no | ~ | PARTIAL | Poll/output failures swallowed; backend-dependent; avoid changing business polling |
| Create keepsake `/create-keepsake` | reconstruction/Create3DKeepsakePage.tsx | capabilities + upload/start mutations | ~ | yes | — | ~ | PARTIAL | Capabilities fallback silent; safe failure copy, no business change |
| Profile `/profile` | profile/ProfilePage.tsx | profileApi.getProfile + auth context | yes | yes | ~ | ~ | PARTIAL | Failed refresh silently falls back to context identity |
| Payment result `/payment/result` | payment/PaymentResultPage.tsx | payment status polling / realtime | yes | yes | — | ~ | PARTIAL | Timeouts exist; keep payment verification business logic |
| VNPAY return `/payment/vnpay/return` | payment/VnpayReturnPage.tsx | paymentApi verification | yes | yes | — | ~ | PARTIAL | Error exists; safe error copy; no payment logic changes |
| Provider home `/provider/home` | provider/ProviderHomePage.tsx | static cards | — | — | — | — | NOT APPLICABLE | Leave demo/static screen unchanged |
| Provider orders `/provider/orders` | provider/ProviderOrdersPage.tsx | MOCK_PROVIDER_ORDERS / local state | — | — | — | — | NOT APPLICABLE | Do not fabricate remote behavior |
| Driver home `/driver/home` | driver/DriverHomePage.tsx | static cards | — | — | — | — | NOT APPLICABLE | Leave unchanged |
| Driver deliveries `/driver/deliveries` | driver/DriverDeliveriesPage.tsx | MOCK_DELIVERIES / local state | — | — | — | — | NOT APPLICABLE | Leave unchanged |

Scope: 53 distinct routed read-oriented screens, including remote-data child components and four static/demo role screens. Seven `src/pages` files are re-export aliases, not additional implementations. Auth command forms, static legal/403/no-access pages, and account subcomponents are outside this read-state tally. Initial classifications: **8 COMPLETE, 41 PARTIAL, 0 MISSING, 4 NOT APPLICABLE**. PARTIAL includes screens with substantial existing state UI; no audited remote screen lacks both loading and success entirely.

## Shared components and risks

Existing `components/ui/{LoadingState,EmptyState,ErrorState}` and product-specific skeleton/error/empty components already fit the visual system. Reuse them; no new framework is needed. `ServerDataTable` already has shared error/empty presentation, but should prioritize an in-progress retry over stale failure and avoid empty copy under its loading overlay.

Highest risks: cart reads silently fail into empty checkout; health shows assumed HEALTHY before data and null latency as `ms`; operational query errors become empty tables; model-list failures become no-models messaging. Secondary lookup queries and multi-query dashboards also need visible query feedback without discarding successful cached panels. Reconstruction output/demo service methods themselves swallow failures into arrays; changing their fallback contracts or polling lifecycle is outside a safe presentation-only patch and must be documented.

Likely changes: the shared table, cart context and both consumers, category/detail pages, operational list tables, approvals/admin product tabs, role home/dashboard query feedback, health and user detail, warehouse selection, model-list presentation, safe error text, and targeted regression tests. No backend/API contract changes or health threshold changes are authorized or needed.


## Implementation outcome

Safe presentation changes were applied directly to **36 page implementations**, plus the cart context and shared server table. The audit table above remains a record of the initial findings, not a claim that every secondary query or mutation has been standardized.

- Added the small `ReadState` presentation wrapper, built from the existing LoadingState, ErrorState, and EmptyState. It does not fetch data, retry automatically, alter API responses, or classify business statuses. Loading takes precedence over stale errors; failure takes precedence over empty. Callers with complete cached data can keep it visible with an explicit stale-data error notice.
- Operational lists, admin product tabs, and approval tabs now use existing read refetch callbacks for retry. Their existing table/card/pagination UI and legitimate empty states remain in successful branches. Multi-query role dashboards wait for required initial reads and show failures rather than silently substituting zero summaries. Cached data is retained rather than cleared.
- Category and product detail requests, admin user detail/audit, warehouse selection, profile refresh, and the model list distinguish read failure from absent records. Model-list retry repeats only the existing GET request and cancels stale presentation updates through the existing mounted check.
- CartContext now exposes an account-scoped read error and tracks whether the current account read settled. Cart/checkout show a spinner during initial read/retry, error after failure, and empty only after success. The latest-read counter prevents older reads from overwriting a later read; no cart mutation is replayed. Checkout submission remains blocked while its cart is loading or failed.
- Order details now distinguish request errors from successful missing orders. Their existing memo/state hooks were moved before loading/error returns so state transitions do not violate hook ordering. Item fallback calculations were preserved.
- System Health no longer assumes HEALTHY without a response, shows empty services intentionally, and formats both null and undefined latency as N/A (zero remains 0 ms). Existing status classification and latency color thresholds were preserved; no new health thresholds were added.
- Fixed safe Vietnamese error text on customer orders, order details, manager dashboard, VNPAY verification failure, and keepsake submission. Existing mutation validation/business messaging elsewhere was not comprehensively rewritten.

### Directly changed page files

- `src/features/admin/pages/AdminDashboardPage.tsx`
- `src/features/admin/pages/AdminHomePage.tsx`
- `src/features/admin/pages/AdminProductsPage.tsx`
- `src/features/admin/pages/AdminSystemHealthPage.tsx`
- `src/features/admin/pages/AdminUserDetailPage.tsx`
- `src/features/auth/pages/WarehouseSelectPage.tsx`
- `src/features/cart/pages/CartPage.tsx`
- `src/features/customer/pages/CustomerHomePage.tsx`
- `src/features/customer/pages/CustomerOrdersPage.tsx`
- `src/features/inventory/pages/GoodsReceiptsManagementPage.tsx`
- `src/features/inventory/pages/StockAdjustmentsPage.tsx`
- `src/features/inventory/pages/StockCountsPage.tsx`
- `src/features/inventory/pages/StockIssuePage.tsx`
- `src/features/inventory/pages/StockIssuesManagementPage.tsx`
- `src/features/inventory/pages/StockMovementReportPage.tsx`
- `src/features/inventory/pages/StockReceiptPage.tsx`
- `src/features/inventory/pages/WarehouseDashboardPage.tsx`
- `src/features/inventory/pages/WarehouseTransfersPage.tsx`
- `src/features/manager/pages/ManagerApprovalsCenterPage.tsx`
- `src/features/manager/pages/ManagerCategoriesPage.tsx`
- `src/features/manager/pages/ManagerDashboardPage.tsx`
- `src/features/manager/pages/ManagerHomePage.tsx`
- `src/features/operator/pages/OperatorHomePage.tsx`
- `src/features/orders/pages/CheckoutPage.tsx`
- `src/features/orders/pages/CustomerOrderDetailPage.tsx`
- `src/features/orders/pages/ManagerOrderDetailPage.tsx`
- `src/features/orders/pages/ManagerOrdersPage.tsx`
- `src/features/payment/pages/VnpayReturnPage.tsx`
- `src/features/printjob/pages/PrintJobOperationsPage.tsx`
- `src/features/products/pages/CategoryListPage.tsx`
- `src/features/products/pages/ProductDetailPage.tsx`
- `src/features/profile/pages/ProfilePage.tsx`
- `src/features/reconstruction/pages/Create3DKeepsakePage.tsx`
- `src/features/reconstruction/pages/MyModelsPage.tsx`
- `src/features/warehouse/pages/WarehouseHomePage.tsx`
- `src/features/warehouse/pages/WarehouseManagementPage.tsx`

### Other changed files

- `src/components/ui/ReadState.tsx` (new)
- `src/components/ui/data-table/ServerDataTable.tsx`
- `src/features/cart/context/CartContext.tsx`
- `src/components/ui/__tests__/ReadState.test.tsx` (new)
- `src/features/admin/pages/__tests__/AdminSystemHealthPage.test.tsx` (new)
- `src/features/cart/pages/__tests__/CartPageStates.test.tsx` (new)
- This audit document.

### Intentionally unchanged or remaining partial areas

- Provider/driver static/demo pages: no remote requests to standardize.
- Already complete ServerDataTable callers: retained their page implementations; they inherit the shared table retry/loading improvement.
- ProductListPage, ManagerProductsPage, and ProductShowcase: their primary product/table states already distinguish failure from empty. Secondary category/option lookups remain a documented gap; this patch does not claim to fix every lookup or mutation dialog.
- Other operational form lookups/status counts and secondary payment queries still have incomplete independent feedback. Primary list/detail errors are now separate, but these secondary queries remain PARTIAL in the initial audit. Retrying a failed read never retries a mutation.
- ScanReconstructionPage and scanReconstructionService: existing output/demo/capability service fallbacks swallow failures; polling also tolerates transient errors. These cannot be fully distinguished by a page-only change while preserving those existing fallbacks. No reconstruction authentication, API contract, polling lifecycle, demo data, or scan business logic was changed. Backend reconstruction/auth failures remain genuine external failures, not successful UI results. MyModelsPage and keepsake submission presentation were safely improved.
- PaymentResultPage verification/polling/realtime decisions were left unchanged to avoid altering payment business behavior. VNPAY request error copy was safely improved.
- Command-only auth forms, nested account settings/forms, and unrelated global lint concerns were not broadly rewritten.

### Verification

- `npm run test`: **130 passed in 12 files**, including 13 new regression cases for ReadState, actual System Health rendering, and cart loading/failure/empty transitions. Tests use server rendering, mocked query/context boundaries, and an explicit callback check; they do not simulate a live browser/network recovery.
- `npm run build`: TypeScript project compilation (`tsc -b`) and Vite production build passed; Vite retains its large-chunk advisory. There is no separate typecheck script.
- Changed-file `npm run lint -- <files>`: passed with existing warnings in profile/cart effects and receipt render-time Date/random usage. No unrelated repository-wide lint fixes were made.
- `git diff --check`: passed.
- No live backend credentials, endpoint fault injection, or browser visual verification were available. Backend-dependent reconstruction failures and secondary-query gaps are documented rather than reported as fixed.
