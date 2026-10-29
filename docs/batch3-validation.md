# Batch 3 pre-merge validation

**Recommendation: SAFE TO MERGE based on the automated checks and diff review below.**

Reviewed implementation: `1739291` against parent `d3896d5`, on `fix/api-ui-states`. Validation was run with Node v24.14.0. The validation changes add tests and a development-only jsdom dependency; no application implementation was changed.

## Existing coverage reviewed

The original 130 tests include ReadState server-rendered loading, success, empty, error, retry callback, and cached-data cases; System Health null/undefined/zero/numeric latency and initial error/loading/empty cases; cart presentation and API access checks; auth routing/guards; query cache isolation; API client and category response behavior. They all remain passing.

Server rendering alone cannot verify hook order across rerenders or real button/form interactions. Added a small jsdom/createRoot/React act harness using the actual QueryClientProvider, router, theme, and Ant Design form/table components. No extra testing framework or application state abstraction was introduced.

## New integration coverage

**54 new tests** in three files, plus one shared test harness:

- `src/test/batch3-pages.test.tsx`: 42 tests. Existing read hooks run against mocked API/service methods. Pending promises, records, successful absence, failed reads, retry clicks, and recovery are exercised for ten representative pages. Two additional tests retain a single mounted order-detail component through loading, data, failed refetch, missing data, and recovery.
- `src/test/batch3-cart-checkout.test.tsx`: 9 tests. Uses the real CartProvider with mocked cart API reads. Both cart and checkout cover pending/records/empty/error/retry recovery. A real checkout form submission verifies required phone/address validation without calling order/payment APIs.
- `src/test/batch3-table-readstate.test.tsx`: 3 tests. Uses the real useServerTable and ServerDataTable to test transitions, row rendering, pagination, retry, and loading precedence. ReadState is exercised with real retry clicks, rerenders, empty success, and explicitly cached content with a visible failure notice.
- `src/test/domHarness.tsx`: test-only DOM/polyfill, provider, mount, and asynchronous assertion helpers.

| Representative screen | Pending | Records | Successful empty/missing | Failure distinct from empty | Retry/recovery |
| --- | --- | --- | --- | --- | --- |
| CustomerOrdersPage | pass | pass | pass | pass | pass |
| CustomerOrderDetailPage | pass | pass | pass | pass | pass |
| CartPage with CartProvider | pass | pass | pass | pass | pass |
| CheckoutPage with CartProvider | pass | pass | pass | pass | pass |
| ManagerOrdersPage | pass | pass | pass | pass | pass |
| ManagerOrderDetailPage | pass | pass | pass | pass | pass |
| MaterialManagementPage / ServerDataTable | pass | pass | pass | pass | pass |
| AdminUserDetailPage | pass | pass | pass | pass | pass |
| AdminSystemHealthPage | pass | pass | pass | pass | pass |
| GoodsReceiptsManagementPage (warehouse) | pass | pass | pass | pass | pass |
| OperatorHomePage | pass | pass | valid zero summary | pass | pass |
| MyModelsPage | pass | pass | pass | pass | pass |

Operator jobs with zero records are valid zero-valued dashboard data; the tests do not impose an artificial absent-dashboard state.

## Specific regression results

- **Hook ordering:** both detail pages pass same-mount query transitions and a final rerender. Console errors are captured, and hook-order/invalid-hook violations fail the tests. No violations occurred.
- **ServerDataTable:** records and empty/error/loading states remain compatible with the actual TanStack table hook. Page 2 renders correctly; clicking page 3 sends the expected pagination update (`pageIndex: 2`, `pageSize: 10`), including the hook's functional-updater contract.
- **Cart versus failure:** failed reads show retryable errors without empty-cart UI. Retry calls getCart exactly once more, displays loading without stale error/false empty, and restores product content. No cart mutation is replayed.
- **Checkout:** dependencies pending or failed do not render an empty cart or submit the order. Successful data restores the existing form. Missing phone/address fails actual Ant Design validation and makes no order/payment request.
- **System Health:** existing tests verify null and undefined latency render N/A, 346 renders `346 ms`, and zero renders `0 ms`. Integration tests also cover request retry and recovery. The status-badge classification function is identical to the parent commit.
- **ReadState:** error never becomes empty; retry uses the supplied callback; cached content can remain visible with an explicit read-failure notice; retry/loading clears stale failure presentation.

## Diff review

No Batch 3 changes were found to API/service files, endpoint definitions, request payloads, App routing, role utilities, or auth guard components.

- Cart authorization checks and mutation API calls are retained. Changes add read status, account-scoped read completion/error, and stale-read protection.
- Checkout's only submission behavior addition is an early return while its cart read is pending/failed. Empty-cart and shipping validation, order payload, and payment branches remain intact.
- Order detail memo calculations were moved before conditional returns, with a no-order guard and local equivalents of existing derived values. Existing item/fallback transformations and order mutations remain intact.
- Health status classification and existing numeric latency color thresholds are unchanged. Missing-value presentation is the intended difference.
- VNPAY return changes only replace raw request error copy with a fixed friendly message. Verification endpoint, arguments, success/cancel decisions, and backend behavior are unchanged.
- Keepsake submission changes only replace raw failure copy. Upload/start requests and success navigation are unchanged. MyModels adds presentation-only GET retry; reconstruction service, polling, and fallback architecture remain unchanged.

No application regression was exposed by the automated tests, so no application fix was made. Initial test failures were harness issues (missing theme provider, an incorrect assumed empty-state CSS class, pagination updater expectations) and a test-only TypeScript annotation; those were corrected before the final checks.

## Final checks

| Check | Result |
| --- | --- |
| `npm run test` | **184 passed, 15 files**; 130 existing + 54 new |
| `npm run build` | pass: `tsc -b` and production Vite build |
| Standalone typecheck | no script defined; covered by build |
| `npm run lint -- <Batch 3 changed TS/TSX files and new tests>` | pass; existing application warnings only |
| `npm run lint` | pass; existing repository warnings remain |
| `git diff --check d3896d5` | pass |

Vite retains its large-bundle advisory. Development server, preview, and deploy scripts are not validation checks and were not run. No deployment or merge was performed.

These tests use mocked backend boundaries and jsdom, not a real browser/backend. They do not verify visual fidelity, real credentials, reconstruction GPU processing, or payment-gateway behavior. Existing secondary-lookup/polling limitations documented in the Batch 3 audit remain outside this validation's implementation scope.
