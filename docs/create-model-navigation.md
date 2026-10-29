# Create 3D Model navigation

## Audit before changes

Four navigation references targeted `/reconstruction/demo`:

| Source | Original use | Final behavior |
| --- | --- | --- |
| `src/features/customer/pages/CustomerHomePage.tsx` | Main customer create CTA | Always `/create-keepsake` |
| `src/features/home/components/HeroSection.tsx` | Public hero create CTA | CUSTOMER goes to creation; other roles/guests retain existing demo behavior |
| `src/features/home/components/Footer.tsx` | Public footer create link | Same role-aware behavior |
| `src/features/home/components/Navbar.tsx` | Mobile create menu | Same role-aware behavior; desktop already uses creation |

The demo is intentionally implemented by the generic protected `/reconstruction/:scanId` route. `ScanReconstructionPage` explicitly handles `demo` and `scan-demo`, fetching existing demo outputs through `scanReconstructionService.getDemoOutputs()` (`/reconstruction-jobs/demo/outputs`). It is not dead code and was retained, including its existing authentication protection. It is no longer the entry point for authenticated customer create CTAs.

Other entry links were reviewed: Navbar desktop, Personalized3DSection, MyModelsPage creation/empty actions, and reconstruction back/retry links already target `/create-keepsake`. MyModels view/result actions correctly target an existing scan/job. FinalCTA opens the authenticated user's workspace or Login and is not a direct reconstruction-start action. Product detail's create-page prompt was informational; its checkout action was not changed.

`Create3DKeepsakePage` already navigates to `/reconstruction/${scan.id}` with the returned job ID after creating/uploading input. That logic remains intact.

## Changes

- Customer Home's existing styled CTA now navigates to `/create-keepsake`; its styling and position are unchanged.
- Added **Tạo mô hình 3D** immediately after Trang chủ in customer navigation, using the existing lucide Box icon.
- Central navigation metadata maps `/create-keepsake`, `/reconstruction/*`, and `/scans/*` to this item. Other menu mappings are unchanged. Dashboard titles reuse this metadata rather than a separate create-route title check.
- `/create-keepsake` remains inside the existing Customer Dashboard shell.
- Processing route aliases now use CustomerExperienceLayout and the same ShoppingPageFrame, keeping the customer sidebar/topbar visible and the create item active. Only route layout composition and processing-page chrome changed. Guards, role decisions, scan resolution, polling, output handling, and all API contracts remain unchanged.
- Public Hero/Footer/mobile Navbar use the backend-facing ROLE_USER check to select the real customer entry. Existing guest/staff behavior remains unchanged.

## Files changed

- `src/features/customer/pages/CustomerHomePage.tsx`
- `src/components/layout/navigationConfig.ts`
- `src/components/layout/DashboardLayout.tsx`
- `src/features/home/components/{HeroSection,Footer,Navbar}.tsx`
- `src/App.tsx`
- `src/features/reconstruction/pages/ScanReconstructionPage.tsx`
- `src/test/customer-shell.test.tsx`
- `src/test/create-entry-links.test.tsx` (new)
- `src/test/domHarness.tsx` (optional test route pattern; existing default retained)
- This report and the follow-up note in `customer-shell-consistency.md`.

## Verification

The App-level suite now covers the real Home CTA click, sidebar click/item label, creation shell/active state, both processing aliases, and retained demo output lookup without a demo sidebar link. Central route matching checks cover creation and processing routes. Six additional DOM interaction tests verify Hero, Footer, and mobile Navbar customer/guest targets.

- Relevant navigation tests: **38 shell tests + 6 public-entry tests passed**.
- Full suite: **228 tests passed across 17 files** (13 new cases over the prior 215).
- `npm run build`: passed, including `tsc -b`; no standalone typecheck script exists. Existing Vite bundle-size advisory remains.
- Changed-file `npm run lint -- <files>`: passed with existing dashboard/footer/reconstruction warnings; unrelated warnings were not changed.
- `git diff --check`: passed.

Backend processing and real uploads were not executed. Tests mock processing/service boundaries; no backend, API, or reconstruction-business changes were made.
