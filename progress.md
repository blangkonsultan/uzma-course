# Progress Log

## 2026-10-29 (Admin Tablet Overflow Corrected)
- **Integration already completed**: On the user's explicit clean-PR merge authorization, published Guru zoom PR [#6](https://github.com/blangkonsultan/uzma-course/pull/6). Its exact head `693a12a937524ef27e62576e74529d645b367bab` was MERGEABLE/CLEAN, with successful Vercel/Preview Comments and no blocking review; merged with a head-match guard as `fc5f23e6cec61d35c6247c9a8e34ee0d838d806e`. Fresh publication tests passed 83 suites / 481 tests.
- **Scope**: `fix/admin-tablet-overflow` from that merged main. Add shrinkable width contracts to the Admin shell/content and search form; keep shared filters fluid and stacked below the wide-layout breakpoint. Apply the same content-aware breakpoint to the separate SPP filter/action toolbar. No overflow hiding, data cropping, financial calculation, query contract or business-rule change.
- **Before/after runtime**: Murid at 768px previously produced an 1101px document and an 82px search field. Final document width is 768px with a 430px search field. The first smoke pass also exposed the independent SPP toolbar overflow; it was corrected rather than hidden. All 24 final samples across Murid/Guru/Program/SPP and 360/375/768/960/1280/1536px had document width equal to viewport. Wide tables remain bounded scrollers.
- **Interaction proof**: Real search plus branch composition, clearing only search while retaining branch, and resetting all filters worked on local demo Murid. Keyboard focus reached the right-side detail link by scrolling the table internally (333px), with the control still inside the viewport. SPP export/generation controls remained in bounds and were not submitted. Tablet screenshots inspected at `/tmp/uzma-tablet-fixed-{murid,spp}-768.png`.
- **Gate**: Final `taskset -c 0,1 ./init.sh` passed clean ESLint, 83 suites / 481 tests, configured coverage and production Webpack build. Existing non-failing iframe diagnostics remain unsuppressed. Scoped detector returned `[]`; no permanent CSS/source-string assertions were added.
- **Preservation and follow-on**: Original modified worker restored after builds; SEO files excluded. Physical-device proof and other P1/P2 findings are not implied. Next approved slice is mobile drawer focus/Escape/restoration, followed by payment modal, attendance delivery presentation and CMS gallery labels; each is a separate guarded PR.

## 2026-10-29 (Guru Mobile Zoom without Unwanted Auto-Zoom)
- **Scope and branch**: Implemented the user's approved zoom-only correction on `fix/guru-mobile-zoom`, based on merged `main` at `bd2db67`. Preserve stable PWA focus/navigation while allowing intentional manual zoom; the other frontend audit findings are not included.
- **Before-change evidence**: The authenticated demo Honor selector computed to 12px on a 360px touch viewport; password inputs computed to 14px in an 844px touch landscape viewport. The Guru viewport emitted `maximum-scale=1, user-scalable=no`, and navigation used the default `touch-action: auto`.
- **Implementation**: Keep `width=device-width` and `initialScale: 1`, remove the zoom restrictions, and scope base-sized input/select/textarea text plus matching line height to `[data-guru-portal]` under `any-pointer: coarse`. The selector covers touch-capable wide/hybrid layouts without changing mouse-only desktop controls or Admin. Honor and branch selectors use the existing responsive base/small font pattern; Honor can shrink inside its flex row, and the branch chevron remains vertically centered. Bottom navigation uses `touch-manipulation`, preserving browser panning/pinch while preventing double-tap zoom; no JavaScript gesture suppression.
- **Browser smoke**: Real authenticated demo pages in managed Chromium 154. Honor and password forms passed 360px, 375px, 768px, 844px landscape and 1280px touch layouts: controls computed to 16px, document width matched the viewport, and focusing controls left scale at 1. Mouse-only 1280px retained 14px controls. A separate Admin touch-width check remained 14px, confirming scope isolation. Screenshots inspected from `/tmp/uzma-guru-zoom-*`.
- **Gesture proof**: Foreground native two-contact CDP touch events increased the measured page scale from 1 to 5. Actual unobscured touch taps visited Beranda, Jadwal, Presensi, Honor and Profil with scale remaining 1; repeated taps on the current Honor tab also stayed at 1. These are emulated Chromium gestures, not physical iOS/Android proof.
- **Verification**: Both before-change and after-change `taskset -c 0,1 ./init.sh` passed clean ESLint, 83 suites / 481 tests, coverage 65.55% statements / 59.81% branches / 67.64% functions / 66.74% lines, and the production Webpack build. Existing disabled-iframe happy-dom diagnostics remained non-failing. The scoped Impeccable detector returned `[]`. No permanent source-text/class-name tests were added.
- **Documentation**: Refined existing manual cases `TC-A11Y-02` and `TC-A11Y-07` for touch landscape/wide controls, manual pinch and stable menu taps; execution statuses are not promoted to full PASS. Canonical `DESIGN.md` already requires readable mobile fields and preserved zoom; its visual tokens and static previews are intentionally unchanged.
- **Safety and limits**: No attendance/queue, password, teaching, payroll, payment or CMS submission; no dependency, schema, port, service restart, push or deployment. The existing modified `public/sw.js` was preserved byte-for-byte across verification builds (SHA-256 `6608a5b0443f57ac2b10b48f0cd1b8092d3169e68dda0eb14b253aa2521f9531`); unrelated SEO work remains outside the change. Physical Safari focus/keyboard behavior, installed standalone PWA, cold offline boot and OS integration remain unverified. The known `pb-safe`/bottom-clearance defects remain outside this correction.

## 2026-10-29 (Design System Documentation PR Published)
- **Authorization and delivery**: On the user's explicit push/PR request, published `docs/design-system-patterns` and created [PR #5](https://github.com/blangkonsultan/uzma-course/pull/5) targeting `main`. Feature commit: `5b7e90eacd632c84143b90a55233fb48e0ad1f6e`.
- **Remote observation**: PR #5 was OPEN, non-draft and CLEAN at the verified feature head; Vercel and Vercel Preview Comments both reported SUCCESS for that head. Later publication-record commits require their own latest-head status and are not covered by this earlier check result.
- **Verification scope**: Reused the documented full gate and metadata/browser evidence for the unchanged implementation. This Git-only publication does not claim a new full test run or physical-device/offline certification. The PR body records the 83-suite/481-test gate, documentation-only scope, intentional detector advisories and legacy safe-area limitation.
- **CLI recovery**: `gh` is a link to the Windows CLI. Its inherited `WSL_INTEROP` pointed at a missing socket; setting the discovered valid socket for individual commands restored listing/creation without installing another CLI, exposing credentials, changing persistent configuration or restarting WSL.
- **Safety**: No merge, force push, branch deletion or production deployment action. Uncommitted `public/sw.js` and unrelated SEO documents were not staged or published.

## 2026-10-29 (Source-Backed Design System Documentation)
- **Scope and branch**: Completed the approved `document → clarify → polish` pass on `docs/design-system-patterns`, based on merged `main` at `a5c851a`. This incorporates the previously uncommitted design-pattern addition and corrects it; no application source, database, dependency, service, port, deployment, or remote publication change.
- **Seven audit corrections**: Correct five-tab Guru navigation and Jadwal teaching-card entry; separate native/custom modal APIs from portal relocation; distinguish 44px mobile actions from a noninteractive 40px avatar; replace undefined `pb-safe` guidance with explicit safe-area/content-clearance requirements; define print ownership, cleanup and normal-flow pagination; specify attendance-only queued/syncing/acknowledged/failed states and development-worker limits; align the ordinary radius scale with actual Tailwind rem values.
- **Canonical guide**: `DESIGN.md` retains The Friendly Classroom, Poppins and the existing brand palette, uses the eight canonical sections, and links patterns to their real components. Neutral values now use the installed theme's canonical OKLCH representation rather than competing approximations. Machine-readable defaults distinguish unpadded Card structure from CardBody padding and document actual Button variants/defaults.
- **Harness alignment**: `CLAUDE.md` now points to the canonical guide for card anatomy, avatar API and action sizing; removed incorrect `CardFooter`, `purple` avatar and legacy action-size examples. Corrected the Tailwind v4 source pointer and distinguished document-wide overflow from deliberate bounded scrolling. Authentication, database, and general workflow rules were not changed.
- **Metadata**: Refreshed the existing `.impeccable/design.json` schema-v2 sidecar with current source-derived extensions and 10 self-contained styling previews: six Button variants, InputField, Guru navigation, primary Badge and Card. Narrative agrees with the guide; snippets expand utilities into scoped CSS with inline SVG and no backend handlers. This is documentation metadata, not new application functionality.
- **Source/runtime evidence**: Installed Tailwind compilation confirmed all documented radius/hit-area utilities, including width utilities; `pb-safe` generated no rule. Actual app CSS confirmed Poppins, `rounded-md/lg/xl/2xl` at 6/8/12/16px for the default 16px root, and 44px/36px minimum-height utilities. Native `showModal` exists on `dialog`, not `div`. Unused/inlined theme variables are not assumed to exist in standalone previews.
- **Independent review**: The reviewer supported the seven corrections and found two additional documentation issues. Parent verified the official dimension-parser contract and actual disabled-action guards, then fixed both: a finite `9999px` pill token is the portable serialization equivalent of Tailwind's `calc(infinity * 1px)`, and unavailable/prerequisite/locked controls may remain disabled or read-only independently of busy state. The reviewer acknowledged the fixes but did not perform a second full review; integrated metadata/verification below is parent-owned.
- **Document validation**: YAML parsed with the existing `js-yaml`; dimensions use supported px/rem grammar; JSON schema shape, primitive/component references, colour metadata and narrative checked. All 23 local source links resolve in the installed checkout, including the harness's guide anchor. Markdown rendered with Bun's parser; no configured Markdown linter was claimed and no permanent prose/wiring tests were added. Feature IDs/dependencies remain valid and statuses unchanged.
- **Rendered metadata verification**: All 10 snippets rendered independently in Shadow DOM at 360px, 375px and 1280px with zero document horizontal overflow and zero out-of-frame controls. Input text was 16px on phone and 14px on desktop; default-md buttons were at least 44px high. Guru labels/routes matched the actual five tabs. Primary-button hover changed colour and native keyboard focus showed its focus-visible ring. All three screenshots were inspected; temporary evidence: `/tmp/uzma-design-previews-{360,375,1280}.png`.
- **Detector interpretation**: One final detector pass returned 8 advisory colour findings, all existing installed-Tailwind literals used as necessary standalone CSS fallbacks: Green WhatsApp, Rose field errors, and Blue/Emerald Guru-navigation states. Each value was matched to the exact theme declaration and component usage. They are intentional source snapshots, not new palette tokens or application drift; no ignore rules, warnings, or tests were suppressed.
- **Final project gate**: `taskset -c 0,1 ./init.sh` passed: 0 ESLint errors/warnings, **83 suites / 481 tests**, coverage **65.55% statements / 59.81% branches / 67.64% functions / 66.74% lines**, and a successful production Webpack build. Existing disabled-iframe happy-dom diagnostics remained non-failing output.
- **Limits and preserved work**: Documentation and preview rendering do not certify all legacy UI, physical touch/safe areas, OS installation/notifications, cold offline boot, screen readers, or physical printing. The undefined runtime `pb-safe` alias remains explicitly documented rather than silently fixed. Owned browser tabs closed. Existing generated `public/sw.js` and untracked SEO documents remain outside this change.

## 2026-10-28 (Official Receipt Print Isolation Fix)
- **Status and branch**: Fixed and fully verified on branch `fix/receipt-print-isolation` based on `docs/manual-qa-refresh` at `1f1e07d`. No push or deployment performed.
- **Root cause**: `OfficialReceiptModal` previously rendered inside the billing page flow, and relying solely on `:has(#official-receipt-modal[open])` in client CSS failed to hide the long underlying SPP table across all browsers/contexts, inflating the printed output up to 5–6 pages.
- **Fix**:
  - Portaled `OfficialReceiptModal` to `document.body` using a native HTML `<dialog>` element (`showModal()` / `close()`).
  - Added deterministic body state attribute `data-receipt-modal-open` in `useEffect` with guaranteed cleanup on close/unmount.
  - Injected global `@media print` rules in `src/app/globals.css` (`body[data-receipt-modal-open] > :not(#official-receipt-modal) { display: none !important; }`), guaranteeing that no portal sidebar, navigation, or multi-row billing table can ever be included regardless of `:has` CSS support.
  - Enforced `break-inside: avoid !important; page-break-inside: avoid !important;` on `#receipt-print-area`, table, and rows.
  - Symmetrically added `data-spp-export-open` handling for `SppExportModal`.
- **TDD regression**: Added 4 unit tests in `tests/components/receipt-modal.test.tsx` (visibilitiy when parent hidden, `data-receipt-modal-open` body attribute lifecycle, and opener focus restoration). All 4 pass.
- **Browser/PDF verification**:
  - Headless Chrome native A4 print generated `/tmp/manual-qa-receipt-strictly-1page.pdf` from the complete 27-row SPP page: exactly **1 clean A4 page** (97,306 bytes). Text extraction confirmed 0 leaked portal strings or background table rows.
  - Viewports verified at 360px, 375px, and 1280px with 0 horizontal document overflow (`scrollWidth === innerWidth = 360/375/1280`).
  - Mechanical detector `/home/bagas/projects/laragon/uzma-course/.claude/skills/impeccable/scripts/impeccable detect --json src/components/admin/billing/official-receipt-modal.tsx` returned `[]` (0 violations).
- **Final gate**: Bounded `taskset -c 0,1 ./init.sh` passed with 0 ESLint errors/warnings, **83 Vitest suites / 481 tests passed**, coverage **65.55% statements / 59.81% branches / 67.64% functions / 66.74% lines**, and clean production Webpack build. CodeGraph synchronized.

## 2026-10-28 (Manual QA Catalog Refresh)
- **Status and source**: Documentation refresh completed against `c5d8cd2ce4b4623d0525f639fc27bdb1fc2966ee`. GitHub showed PR #3 already merged; local `main` was fast-forwarded and work continued on `docs/manual-qa-refresh`. No new GitHub merge, push or deployment was performed.
- **Deliverable**: Replaced `docs/manual-testing-guide.md` with **150 unique procedures**, retaining all **52 original IDs**. Each case has explicit role/prerequisites, concrete steps/data, observable expectations, and cleanup/risk. Coverage includes demo/NIS setup, all Master Data, scheduling, teaching cards, attendance/offline, SPP/payroll, **all 14 CMS editors**, public landing, both role guides, profile/notifications, RLS and responsive/accessibility checks.
- **Contract corrections**: Removed obsolete account/password examples and browser-console Server Action calls. Distinguished branch codes from the branch form, hidden NIS from available read-only observers, source fixtures from live seed state, current rosters from historical snapshots, draft save from final submission, stored discount/minimum metadata from recalculation/top-ups, primary-branch invoice RLS from admin-page access, development queues from production-worker offline boot, and receipt printing from recap printing.
- **Catalog validation**: All 150 IDs unique; all 52 legacy IDs retained; every case has the five-column schema; all relative source links resolve; all 14 CMS editor cases present; retired credential examples absent. The documented read-only fixture command executed successfully: 7 gurus, 24 students and 33 enrollments using the corrected branch-prefix NIS source.
- **Run context**: Local `http://localhost:3000`, existing corrected demo data, managed HeadlessChrome 154 on Linux/WSL2, 2026-10-28 WIB. Business mutations were not authorized or performed. The following are bounded runtime probes, **not a completed 150-case manual regression**:

| Probe / related cases | Observed result |
| --- | --- |
| Role guards and guide selection (`TC-SEC-01`–`04`, `TC-GDE-03`/`10`, HTTP portions) | Actual authenticated requests confirmed guru-to-admin redirects to `/guru`, admin-to-guru redirects to `/admin`, and guest redirects to `/login`. Correct-role guides and guru Honor returned 200. Both guide roles handled valid, missing, unknown, repeated and foreign-role topic parameters as documented. |
| Payroll and invoice RLS (`TC-SEC-06`, `TC-SEC-08`) | Actual guru JWT/public-key queries returned **0 foreign payroll entries** with **2 authorized positive-control rows**. Guru primary-branch invoice reads returned **14 rows**, unrelated branch **0**; admin confirmed **13** existing unrelated-branch rows. No service-role bypass used. |
| Admin guide UI (sampled `TC-GDE-02`/`07`/`08`) | Search filtered the 44-topic index, including trimmed/case-insensitive keyword input; no-match state retained the article; clearing restored the index and input focus. Original-size image mode, Escape and opener focus restoration worked. Native selected-article printing restored FAQ disclosure states and removed its temporary print marker. At 360px/375px/1280px, document widths were exactly 360/375/1280; mobile search was 16px. Screenshots inspected. |
| CMS read-only inspection (setup for `TC-CMS-01`–`14`) | Overview exposed all 14 editor routes. Hero title field and save control were present. No field was changed and no save/publish/restoration case is marked PASS. |
| Recap printing (sampled `TC-BIL-PDF-01`/`02`/`03`) | NIS `01001` contained only its three invoice IDs on one A4 page. Full export contained all 27 invoice IDs across **4 nonblank A4 pages**. All four pages were visually inspected; continued table headers, pupil groups, summary/signature and unbroken currency were observed. Independent read-only invoice tallies matched both PDFs: full total **Rp 4.393.750**, paid **Rp 917.500**, outstanding **Rp 3.476.250**; filtered total **Rp 525.000**, paid **Rp 0**. No physical-printer or full responsive/stress-case claim. |
| Official receipt (`TC-BIL-04`) | **FAIL**: native A4 PDF for existing `RCT-2610-0001` / `INV-2610-0001` includes portal sidebar/header, SPP table and modal backdrop. Raster and text inspection confirmed leakage. This is an open receipt-specific defect; the clean-print expectation remains. No application fix was made. A separate normal-reload repeat was not recorded. |

- **Private runtime artifacts**: `/tmp/manual-qa-spp-filtered.pdf`, `/tmp/manual-qa-spp-full.pdf`, `/tmp/manual-qa-spp-full-page-{1,2,3,4}.png`, `/tmp/manual-qa-receipt.pdf`, `/tmp/manual-qa-receipt-page1.png`, `/tmp/manual-qa-guide-article.pdf`, and `/tmp/manual-qa-guide-{360,375,1280}.png`. These are temporary local evidence, not published permanent attachments.
- **Project gate**: Initial unrestricted `./init.sh` passed lint but stopped before build with **3 test timeouts / 476 passing tests**; the three first renders stalled for roughly 283–289 seconds. The host reported 12 available CPUs, 7.6 GiB RAM, full 2 GiB swap and high load. After the owned browser tab closed, **`taskset -c 0,1 ./init.sh` passed**: 0 ESLint errors/warnings, **83 suites / 479 tests**, coverage **65.52% statements / 59.79% branches / 67.73% functions / 66.72% lines**, and successful production **Webpack** build. No assertion, test timeout, coverage threshold, dependency, or application code changed. Existing disabled-iframe happy-dom diagnostics remained non-failing output.
- **Graph**: Initial concurrent CodeGraph sync timed out during the pressured run. Subsequent `taskset -c 0,1 codegraph sync` succeeded, synchronizing 3 changed source files.
- **Limits and safety**: A separate teacher-form browser attempt timed out; successful Auth/HTTP/RLS evidence is not a UI-login PASS. Mutating manual cases, OS notifications/install, cold offline boot, GPS, real touch hardware, screen readers, and physical printers were not exercised. No reset/reseed, schema, payments, payroll, attendance, teaching or CMS writes. Temporary Auth smoke sessions signed out locally and the owned QA tab closed. Existing generated service-worker and untracked SEO work remain outside this documentation change.

## 2026-10-27 (Authorized Local Operational Reset and Demo Reseed)
- **Status**: Completed on the user's explicit local-reset request using the existing `npm run seed:local` workflow; no schema drop/recreation was needed.
- **Target safety**: Resolved both runtime destinations before execution: API `http://127.0.0.1:54321`, PostgreSQL `127.0.0.1:54322/postgres`; Docker port binding and project configuration matched. Production was not targeted.
- **Recovery backup**: `/home/bagas/backups/uzma-course/local-reset-2026-10-27/remote-prune-2026-10-27T01-43-18-035Z.dump` (the shared helper uses a legacy basename), 615782 bytes, mode `600`, SHA-256 `c8dfe68267eb351abcf25d96dbcf6704fdc91bf09db67e581096cf5bfb79a882`. Native `pg_restore --list` verified the archive before reset.
- **Execution**: The version-controlled seeder cleared operational records, recreated the guru accounts and demo fixtures, and passed its live SQL invariants. Existing branches/programs/variants/CMS and the admin identity were retained.
- **Live result**: **7 gurus / 24 students / 33 enrollments / 7 classes / 12 placements / 27 invoices / 6 payments / 3 payroll periods**. Sumokembangsri NIS `01001`–`01012`, Junwangi `02001`–`02012`; **0 legacy `DM-*` numbers** remain.
- **Preservation proof**: Before/after content hashes match for 2 branches, 4 programs, 4 variants, and 14 landing-content rows; admin profile ID unchanged.
- **Runtime proof**: Fresh admin and guru logins succeeded and returned the expected profile roles; admin RLS read all 24 standard-format NIS values. Their API smoke sessions were signed out locally. The actual admin student pages loaded, and the SPP preview for Murid Demo 01 visibly showed `NIS: 01001` with all three enrolled programs. Owned QA tab closed.
- **Credentials and scope**: Ignored `supabase/seed-credentials.local.json` was refreshed and verified mode `600`; no credential values published. No application/migration/dependency code or host-port allocation changed. Verification used the real seed command, SQL checks, Auth/RLS calls, and browser smoke; no redundant test/build run was performed for this data-only operation.

## 2026-10-27 (Demo Student Numbers Aligned with Registration)
- **Status**: Completed and verified for `feat-005`.
- **Root cause**: Demo fixtures generated `DM-*` student numbers, and enrollment/class SQL reconstructed or hard-coded those display numbers. The real registration path uses the branch code plus a zero-padded per-branch sequence.
- **Fix**: Demo NIS now runs `01001`–`01012` for Sumokembangsri and `02001`–`02012` for Junwangi. Names/identities remain visibly labelled as demo. Enrollment and class placement joins resolve stable fixture keys through the canonical student fixture instead of encoding NIS strings. Seed database invariants verify the numeric format and configured branch prefix.
- **Regression**: Replaced an assertion-free/default-copy fixture check with exact independent per-branch NIS sequences and uniqueness coverage; observed failing on `DM-*` before and passing after. Focused fixture/seeder/number-stability checks passed **4 suites / 19 tests**.
- **Actual SQL proof**: Executed the complete rendered fixture SQL and versioned invariants in an isolated PostgreSQL 17.11 copy: **24 students / 33 enrollments / 7 classes / 12 placements / 27 invoices / 6 payments / 3 payroll periods**. Verified the three-program student's enrollments and intended class placement, both 12-number branch ranges, and transaction rollback.
- **Safety**: The temporary database had no network or host ports and was removed after verification. The ordinary local seed/reset command was **not** run against existing data. Original student count and ID/NIS/branch fingerprint remained unchanged (`24`, MD5 `b0f6d4273fc6e94cbbee815efe7983f9`). No production, schema, auth-account, dependency, or port-registry change.
- **Documentation**: Corrected stale `YYMM.BB.NNN` tracker wording to the actual branch-prefix format. Historical guide screenshots were not regenerated; existing local demo rows were not reseeded.
- **Final gate**: `./init.sh` passed: 0 ESLint errors/warnings, **83 suites / 479 tests passed**, coverage 65.52% statements / 59.79% branches / 67.73% functions / 66.72% lines, and a successful production Webpack build. Existing disabled-iframe happy-dom diagnostics remain non-failing output. Feature tracker validated; CodeGraph synchronized. Unrelated service-worker/SEO working changes are outside this fix.

## 2026-10-26 (SPP Preview/Print Audit, Polish, and Unbroken Currency)
- **Status**: Completed and verified for `feat-010`.
- **Audit**: Initial technical score **14/20** (accessibility 2, performance 3, responsive 2, theming 4, integrity 3). Verified 18 of 48 monetary pairs wrapping, focus escaping to the invoice-generation action behind the modal, 32–36px controls, secondary text contrast 2.63:1, and crowded mobile document layout. Branded typography/tokens, report data, and existing blank-page isolation were sound.
- **Polish**: Reused the native `<dialog>` and shared `Button` patterns; initial/native focus containment, Escape close, opener-focus restoration, 44px controls, safe-area-aware padding, scoped background scroll containment, and a bounded keyboard/touch-scrollable document viewport. Removed decorative backdrop blur. Improved text contrast, program/variant/invoice hierarchy, table semantics, student row groups, and the aligned financial summary without changing billing calculations, filters, or report claims.
- **Currency requirement**: Every monetary value uses a nonbreaking space after `Rp`, `whitespace-nowrap`, and tabular numerals. All **48** displayed/printed currency pairs occupy one line; stress value `Rp 999.999.999.999` and filtered-report `Rp 0` also stay intact.
- **Print proof**: All 27 invoices, 18 students, and 3 financial totals remain present across **4 nonblank A4 pages**. Per-student row groups avoid page breaks; the three-program student was verified intact on one page. The extra page is intentional to preserve readable rows and student grouping. Branch/status/search-filtered output remains **1 nonblank page**.
- **Responsive/input proof**: 360px, 375px, 768px, and 1280px previews have zero document horizontal overflow, unwrapped amounts, and in-bounds 44px controls. Native touch emulation panned 185px and keyboard panning 40px inside the document viewport. Tab stayed inside the dialog, Escape closed it, and focus/body scrolling restored. No browser errors observed; physical devices and printers were not exercised.
- **Regression/QA**: The focus-restoration behavior test failed before and passed after; focused billing/export suite passed **2 suites / 14 tests**. Manual Impeccable detector returned `[]`. CodeGraph synchronized; development `/login` returned HTTP 200.
- **Final gate**: `./init.sh` passed: 0 ESLint errors/warnings, **83 suites / 479 tests passed**, coverage 65.52% statements / 59.79% branches / 67.73% functions / 66.72% lines, and a successful production Webpack build. Existing disabled-iframe happy-dom diagnostics remain non-failing output. Feature tracker validation passed. No dependency/database changes, push, or deployment; unrelated SEO files and the existing generated service-worker change remain outside this work.

## 2026-10-26 (Student SPP PDF Blank-Page Fix)
- **Status**: Completed and verified for `feat-010`.
- **Root cause**: The SPP report was nested in the billing page. Print visibility rules retained hidden page layout, backdrop blur anchored the absolutely positioned report below the page, and the modal's overflow constraints clipped it. The original PDF first page rasterized blank.
- **Fix**: Portal the client-opened export modal to `document.body`; isolate that direct body child for printing, restore normal document flow, remove backdrop/height/overflow restrictions, and disable print transitions/animations. Filters, grouping, document contents, and financial calculations are unchanged.
- **Regression**: Replaced the window.print forwarding assertion with a real visibility/unmount regression for a report opened from a hidden, clipped billing container; observed failing before and passing after. Focused billing/export verification passed **2 suites / 14 tests**.
- **Browser/PDF proof**: Native Chromium A4 output contains all **27 invoice identifiers / 18 students**, all three financial totals, and **3 nonblank pages** without admin/preview chrome. A branch/status/search-filtered report generated from the 360px viewport contains only the selected student/invoice on **1 nonblank page**. First/final PDF pages were visually inspected. Preview checks at 360px, 375px, and 1280px found no document horizontal overflow or offscreen print/close controls; closing restores the filtered page.
- **Verification finding**: The first post-fix full run passed lint but timed out in `tests/pages.test.tsx`'s 14-editor render-only CMS test (no assertions). Removed that non-behavior test rather than raising its timeout; the meaningful page tests remain.
- **Final checks**: `./init.sh` passed: 0 ESLint errors/warnings, **83 Vitest suites / 479 tests passed**, coverage 65.54% statements / 59.79% branches / 67.82% functions / 66.74% lines, and a clean production Webpack build. Existing disabled-iframe happy-dom diagnostics remain non-failing output. Changed-component Impeccable detector returned `[]`; feature tracker parses successfully; CodeGraph synchronized; development `/login` returned HTTP 200.
- **Scope boundary**: No invoice/payment/database mutation, dependency change, deployment, or push. Unrelated SEO files and the pre-existing generated `public/sw.js` modification remain outside the fix.

## 2026-10-24 (Local SEO and AI Search — Audit Handoff, Implementation Deferred)
- **Status**: Audit completed; `feat-013` is pending. The user requested a persistent TODO and an owner-forwardable clarification list, not implementation.
- **Backlog**: `docs/seo-ai-search-backlog.md` records all requested search/location goals, observed evidence and limits, 13 deferred TODOs, source links, and resume instructions.
- **Owner checklist**: `docs/seo-owner-clarifications.txt` covers brand/unit naming, current branches and service areas, programs, ages, ratios, fees, trial terms, credentials, publication consent, authorized account management, and success/approval ownership.
- **Audit findings**: The homepage is indexed and appeared for "les baca balongbendo" in organic results and an AI Overview; other sampled queries had weaker visibility. Both public Maps profiles lacked a website link; Junwangi also lacked public phone/hours. The `www` certificate covered only the apex hostname. Published class-size/age/program-scope facts need owner confirmation.
- **Evidence limits**: Google samples are not stable rank measurements; later queries encountered a CAPTCHA. Actual crawler-IP access and private Search Console/Business Profile/hosting configuration were not inspected. Source/live browser checks from the audit are documented; no application tests/build were rerun for this documentation-only handoff.
- **Resume boundary**: Collect owner answers, then wait for the user's explicit request to resume and agree the complete implementation scope. Do not treat owner answers or this backlog as approval to implement.
- **Preserved work**: `feat-012` and its Native execution ledger remain unchanged. No product code, CMS content, production data, Google profiles, hosting settings, or DNS was changed by this handoff.

## 2026-10-24 (Role-Specific User Guides — Native Implementation & Full Verification Completed)
- **Status**: Completed and fully verified against Definition of Done (`feat-012` is `completed`).
- **Scope covered**:
  - **Protected Web Guides**: Built `/admin/panduan` (44 articles across 11 chapters) and `/guru/panduan` (15 articles across 7 chapters) with complete Indonesian steps, authentic screenshots, system rules, operational advice, and expandable FAQ troubleshooting.
  - **Navigation Integration**: Added "Panduan Pengguna" link in the Admin sidebar under Bantuan, and a 44px "Panduan Pengguna" row in Guru Profil while strictly preserving the existing 5-tab mobile bottom bar.
  - **Screenshot Assets**: Captured and published 65 authentic PNGs (49 admin, 16 guru) under `public/guides/admin/` and `public/guides/guru/` using local demo identities and sanitized form inputs. Intrinsic dimensions and metadata verified via fixed registries.
  - **Shared Reader UI**: Implemented `GuideReader`, `GuideShell`, `GuideArticleContent`, and `GuideFigure`. Added keyboard skip link, programmatic focus management to article on navigation, instant search with zero-result recovery, responsive dialog modal with original-size pan, native Escape handling, and focus restoration to the opener button.
  - **Native Print Engine**: Scoped `@media print` rules under `body[data-guide-printing]`. Built `GuidePrintButton` with beforeprint snapshotting that auto-expands troubleshooting disclosures and restores them on afterprint. Verified clean Chromium PDF output with no app chrome, contained figures (max 110mm width), and unclipped text.
  - **Workflow Fidelity**: Correctly synchronized rolling 28-day SPP cycles, closed-only payroll adjustments, non-automatic registered minimums, Master Program separation from CMS titles, immutable submitted teaching cards, and attendance-only IndexedDB offline queues.
  - **Prerequisite Fix**: Fixed PostgREST `PGRST100` cross-resource OR query in `insertScheduleClass` by resolving active draft IDs upfront. Touching intervals permitted; 3 focused suites / 9 tests pass.
  - **Legacy Manual Cutover**: Updated `docs/buku-panduan-pengguna.md` with direct web guide links, designated legacy PDF as an archive, and aligned SPP/payroll/attendance rules.
- **Verification Summary**:
  - Full `./init.sh` passed: 0 ESLint errors/warnings, **83 Vitest suites / 479 tests passed** (coverage: 65.55% statements, 59.79% branches, 67.90% functions, 66.72% lines), and clean Next.js Webpack production build.
  - Independent whole-feature code review returned **READY TO MERGE** with zero critical, important, or minor issues.
  - Real browser smoke passed across 360px, 375px, and 1280px+ viewports with 0 document horizontal overflow and 16px mobile search input.
- **Commits**: `89f1f54`, `a488732`, `2a75807`, `571169a`, `d5a4136`, `7a99ff5`, `838cb46`, `51b0667`.
## 2026-10-20 (SPP PDF Export, Seeder Credentials Sync, and Payroll UI Polish)
- **SPP PDF Export**: Implemented `groupInvoicesByStudent` helper in `src/lib/billing-helpers.ts` (and re-exported from `src/lib/billing.ts`) with multi-program student grouping, financial totals accumulation, and status classification (`paid`, `unpaid`, `partial`).
- **Printable Modal**: Created `SppExportModal` at `src/components/admin/billing/spp-export-modal.tsx` with formal Uzma Course letterhead, grouped student tables, program sub-rows, bottom financial summary, bank payment details, and signature section with print `@media print` A4 optimization.
- **Billing Integration**: Integrated "Export Rekap PDF" button into `BillingClient` in `src/components/admin/billing/billing-client.tsx` adhering to active branch, status, and search filters.
- **Seeder Credentials Sync**: Updated `ADMIN_FIXTURE` in `scripts/lib/demo-fixture.mjs` to `admin@uzmacourse.com`, set default deterministic passwords (`admin123456` and `guru123456`) in `scripts/lib/local-auth.mjs` and `scripts/seed-local-demo.mjs`, and re-seeded local database with verified HTTP 200 auth tokens for both admin and guru.
- **Admin Payroll Polish**: Fixed layout defect where opening manual adjustment caused "Tandai Sudah Dibayar" button to float awkwardly in whitespace; promoted adjustment form to a full-width panel below the actions bar, added ChevronDown to period dropdown, formatted signed adjustments (`+Rp` / `-Rp`), and standardized action buttons to `rounded-full` as per `DESIGN.md`.
- **Verification**: Full `./init.sh` passed: 0 ESLint errors/warnings, **80 Vitest suites / 462 tests passed** (coverage: 66.51% statements, 60.12% branches, 69.19% functions, 67.67% lines), and clean Next.js production Webpack build.

## 2026-10-19 (Production Deployment and Smoke)
- **Deployment**: Pushed commit `879c20c` to `main`; Vercel production deployment `uzma-course-o92z9m6ad-uzmacourseapp-7223.vercel.app` is `READY`. Canonical site: `https://uzmacourse.com`.
- **Admin smoke**: Production admin login succeeded with the configured test account.
- **SPP smoke**: `/admin/spp` loaded with zero operational data as expected after prune. Branch, status, and search filters settled into the URL (`branch=junwangi`, `status=unpaid`, `q=INV-`).
- **Payroll smoke**: `/admin/payroll` loaded successfully and displayed the current open period with zero sessions and zero teachers after prune.
- **Guru smoke**: Admin access to `/guru/jadwal` correctly redirected to `/admin`. An authenticated Guru workflow could not run because the remote prune intentionally left zero non-admin auth users; no Guru test account exists in production.
- **Responsive smoke**: SPP and Payroll reported `scrollWidth === innerWidth` at 360px, 375px, and 1280px.

## 2026-10-19 (Remote Production Operational Prune)
- **Status**: Completed successfully with the backup-gated remote prune command.
- **Connection**: Used the Supabase Session pooler over port `5432`; no credentials are recorded here.
- **Backup**: `/home/bagas/backups/uzma-course/remote-prune-2026-10-19T00-51-39-288Z.dump`, mode `600`, SHA-256 `c4d92ffce47cf50f9cb38a4923df40a33f2bd85d5220cacf2171f909cb47b4fb`.
- **Remote result**: `committed: true`; post-commit verification passed. Non-admin profiles/auth users, students/enrollments, schedules, attendance, teaching logs, payroll, invoices, payments, and non-admin assignments are all zero.
- **Preservation result**: 1 admin profile, 14 landing-content rows, 4 programs, 7 program variants, 3 branches, and 3 program-logo objects remain.
- **Implementation fix**: Added regression coverage and fixed the remote backup stream completion race in `scripts/lib/remote-backup.mjs`; backup completion now waits for both the child exit and output stream finish.
- **Verification**: `./init.sh` passed with 78 Vitest suites / 451 tests, clean lint, coverage `66.02%` statements / `59.82%` branches / `68.63%` functions / `67.17%` lines, and a clean production Webpack build.
- Existing happy-dom iframe `NotSupportedError` messages for external Maps/YouTube/TikTok fixtures remained non-failing test output.

## 2026-10-18 (Local Demo Fixture and Remote Prune Tooling)
- **Status**: Local environment and fixture completed; remote prune tooling implemented but not executed because the explicit remote environment file is not available.
- **Local environment**:
  - `.env.local` now points to `http://127.0.0.1:54321`; local anon/service-role keys were copied from the generated Docker secret file without printing them. `SUPABASE_DB_URL` points to PostgreSQL `127.0.0.1:54322`.
  - Local API smoke returned HTTP 200 for a public branches query.
- **Local fixture**:
  - `npm run seed:local` passed and wrote the ignored `supabase/seed-credentials.local.json` with mode `600`.
  - Fixture contains **7 guru**, **24 murid**, **33 enrollment**, **8 multi-program students**, and **1 three-program student**.
  - Discount distribution: **10 none**, **11 nominal**, **12 percentage**.
  - Payroll: one `paid`, one `closed`, and one `open` period. Guru 04 (inactive with sessions) has a payroll entry; Guru 05 (inactive without sessions) does not; Guru 07 has `minimum_income = NULL` and `minimum_income_snapshot = 0`.
  - SPP: **6 paid**, **20 unpaid**, **1 cancelled** invoices and **6 payments**.
- **Implementation**:
  - Added target guards, pinned `pg@8.23.1`, local Auth Admin API lifecycle, transactional PostgreSQL seeding, credential manifest handling, remote backup-gated prune command, and 77-suite regression coverage.
- **Verification**:
  - Focused seed suites: **4 files / 21 tests passed**.
  - `./init.sh`: **77 Vitest suites / 450 tests passed**, coverage **66.02% statements / 59.82% branches / 68.63% functions / 67.17% lines**, lint passed, and production Webpack build passed.
  - Existing happy-dom iframe `NotSupportedError` messages for external Maps/YouTube/TikTok fixtures remained non-failing test output.
  - `/login` HTTP smoke returned 200. Managed Chromium navigation timed out before visual interaction; no browser visual claim is made for this seed-only change.
- **Remote prune status**:
  - `npm run prune:remote -- --confirm PRUNE_REMOTE_OPERATIONAL_DATA` failed closed because `.env.remote.local` is absent; no remote write occurred.
  - Remote execution still requires `SEED_REMOTE_SERVICE_ROLE_KEY` and `SEED_REMOTE_DB_URL` in the ignored remote environment file, plus the backup preflight.
- **Commits**: `6c6dcbb`, `30c516d`, `51e5c9b`, `a597ec8`, `ece20bd`.


## 2026-10-18 (Release Readiness Remediation Implementation)
- **Status**: Completed and fully verified.
- **Scope**: Executed the approved remediation plan (`docs/superpowers/plans/2026-10-18-release-readiness-remediation.md`) across DAL architecture and mobile ergonomics.
- **Changes implemented**:
  - **Payroll DAL**: Added `getLatestPayrollPeriodId()` and `getPayrollPeriods()` in `src/lib/payroll.ts` with explicit domain error mapping and descending period sorting (`tests/crud/payroll-dal.test.ts` passing 7 tests).
  - **DAL Cutover**: Cleaned up `src/app/admin/spp/page.tsx` and `src/app/admin/payroll/page.tsx`, eliminating all inline `createClient()` and raw database queries in favor of `getBranches()` and payroll DAL helpers (`tests/pages.test.tsx` passing 31 tests).
  - **Shared Controls**: Standardized `SearchFilterBar` with `name="search"`, `inputMode="search"`, `autoComplete="off"`, `min-h-[44px] sm:min-h-[36px]`, and `text-base sm:text-sm`. Enforced 44px hit areas on AdminShell navigation trigger and mobile logout button (`tests/components-admin.test.tsx` passing 24 tests).
  - **SPP & Payroll Controls**: Named SPP search input (`name="q"`, `aria-label="Cari tagihan SPP"`), enlarged selects/buttons to 44px on mobile and 36px on desktop, added 16px iOS-zoom-safe typography, and made action bars primary-action-first and full-width on mobile across PaymentModal, Payroll period actions, and PayrollAdjustmentForm (`tests/components/billing-client.test.tsx` and `tests/components/payroll-period-client.test.tsx` passing 14 tests).
- **Verification**: Full `./init.sh` passed: 0 ESLint errors/warnings, **73 Vitest suites / 429 tests passed**, coverage at **66.02% statements, 59.82% branches, 68.63% functions, 67.17% lines**, and clean production Webpack build. `impeccable detect --json` returned 0 warnings (`[]`).
- **Browser Smoke**: Authenticated headless Chromium verified at 360px, 375px, and 1280px with 0 document horizontal overflow (`scrollWidth === window.innerWidth = 360/375/1280`). Computed mobile heights confirmed at 44–46px and inputs at 16px.
- **Commits**: `c55c0c2` (DAL), `b409fa3` (pages), `2390207` (shared controls), `286e217` (surface controls).

## 2026-10-18 (Cross-Surface Release Readiness Audit)
- **Status**: Audit completed; no product code changes made.
- **Scope**: Public landing page, authenticated Admin routes (`/admin`, `/admin/guru`, `/admin/murid`, `/admin/cabang`, `/admin/landing`, `/admin/payroll`, `/admin/spp`), current filter/period flows, responsive layout, accessibility, DAL boundaries, and frontend performance patterns.
- **Baseline**: `./init.sh` passed with 0 lint errors, 73 Vitest suites / 422 tests, coverage at 65.88% statements / 59.67% branches / 68.48% functions / 67.02% lines, and a clean production Webpack build. The generated `public/sw.js` diff was restored; the working tree is clean.
- **Browser evidence**: Headless Chromium smoke checked 360px, 375px, and 1280px. Public and Admin pages reported `scrollWidth === innerWidth`, no browser errors, and no failed landing images after scrolling through tested checkpoints. SPP search and status filter state settled into the URL and refreshed KPI data correctly; search text remained preserved.
- **Audit score (manual)**: **16/20 — Good**. Accessibility 3/4, Performance 3/4, Theming 4/4, Responsive 3/4, Implementation Integrity 3/4. `.claude/skills/impeccable/scripts/impeccable detect --json src/` returned `[]`.
- **P1 findings**:
  - `src/app/admin/spp/page.tsx:5,25-36` and `src/app/admin/payroll/page.tsx:10,38-62` still issue raw Supabase reads from Server Components, violating the repository DAL rule and duplicating data-access boundaries.
  - Mobile Admin controls are below the project touch/typography standard: `SearchFilterBar` uses `text-sm` controls at `src/components/admin/search-filter-bar.tsx:88-120`; SPP native selects render at 25px and its action at 32px (`src/components/admin/billing/billing-client.tsx:243-303`); Payroll period/actions render at roughly 30-33px (`src/components/admin/payroll/payroll-period-client.tsx:197-214,302-327`); the mobile navigation trigger is 36px (`src/components/admin/admin-shell.tsx:335-342`). The 360px browser pass reproduced these computed sizes.
  - The SPP search input at `src/components/admin/billing/billing-client.tsx:279-287` has no explicit accessible name or `name`, leaving the primary billing search field weaker than the shared `SearchFilterBar` contract.
- **P2 findings**:
  - Billing search pushes a server navigation on every keystroke (`src/components/admin/billing/billing-client.tsx:279-285`), which can create avoidable query churn on slow connections even though the tested final state is correct.
  - Public landing images use raw `<img>` elements without explicit dimensions in several sections (`src/components/landing/gallery-section.tsx:174,212`, `src/components/landing/team-section.tsx:49`, and related logo/media components). CSS aspect-ratio and lazy loading mitigate some risk, but explicit intrinsic dimensions would reduce CLS and improve audit compliance.
  - `transition-all` remains present in multiple shared and high-traffic surfaces; replacing it with property-specific transitions is a separate polish pass, not bundled into the first remediation.
- **Decision**: All `feat-001` through `feat-011` are complete. The next progress item should be a bounded **release-readiness remediation** rather than inventing a new feature. First priority: move SPP/Payroll reads into DAL services and harden shared mobile controls; defer image-dimension and transition cleanup to a separately verified slice.

## 2026-10-18 (Admin Filter Refresh Integrity Fixes)
- **Status**: Completed and review-approved.
- **Root causes fixed**:
  - `/admin/spp` kept server-provided invoice summaries and filter state stale across query navigation; BillingClient now synchronizes settled props without remounting the search input and preserves rapid filter composition.
  - `/admin/guru` filtered only `profiles.branch_id`; branch filtering now resolves `profile_branches` assignments and displays all assigned branches.
  - `/admin/payroll` retained stale period detail and adjustment drafts across period switches; period detail selection is server-prop-aware and adjustment forms reset by period.
- **Regression coverage**: Billing summary/KPI/control refresh, search focus preservation, rapid filter composition, Guru secondary-branch filtering/display, Payroll period refresh, adjustment draft reset, and official receipt modal behavior.
- **Verification**: `./init.sh` passed with 0 lint errors, **72 Vitest suites / 420 tests passed**, coverage at **65.42% statements, 59.42% branches, 68.16% functions, 66.54% lines**, and clean production Webpack build. Browser smoke passed SPP search/filter behavior at 360px and 1280px with zero horizontal overflow; Guru branch filtering and multi-branch labels also passed.
- **Code review**: Follow-up reviewer assessment **Ready to merge: Yes**, with no Critical or Important issues.

## 2026-10-18 (Teaching Log Schedule Label)
- **Status**: Completed and review-approved.
- **Change**: The Guru schedule now shows **“Lihat Kartu Mengajar”** and links to the saved session date when the teaching log is `submitted`; draft or unsaved sessions retain **“Isi Kartu Mengajar”**.
- **Implementation**: `getTeacherActiveSchedule()` enriches classes from `teaching_sessions` using the WIB previous-session date; the schedule client consumes the saved date/status.
- **Verification**: `./init.sh` passed with 0 lint errors, **73 Vitest suites / 422 tests passed**, coverage at **65.87% statements, 59.62% branches, 68.48% functions, 67.02% lines**, and clean production Webpack build. Follow-up code review: **Ready to merge: Yes**.
- **Visual refinement**: Submitted links use a neutral read-only treatment with a green check icon; draft links use the primary action treatment with a pencil icon. Mechanical detector returned `[]`.

## 2026-10-17 (feat-010 Student Billing & SPP Invoicing Completed)
- **Status**: Completed (feat-010 100% Completed).
- **Evidence**:
  - **Schema & Ledger (`supabase/migrations/20261017120000_create_student_billing.sql`)**: Implemented standard accounting ledger with `student_invoices` (faktur tagihan piutang: `INV-YYMM-NNNN`) and `student_payments` (bukti kas masuk kwitansi: `RCT-YYMM-NNNN`). Unique constraint `(student_id, program_id, period_start)` guarantees zero duplicate billing per cycle. Single payment model (`invoice_id UNIQUE` on payments). RLS policies grant full management to Admin and branch-scoped read to Gurus.
  - **28-Day Rolling Cycle & Pure Calculations (`src/lib/billing-helpers.ts`)**: Implemented `calculateCycleDates` (rolling 28-day boundaries and H+7 due dates), `formatInvoiceNumber`, `formatReceiptNumber`, and `calculateTuitionDiscount`.
  - **Database Stored Procedures**: Created PostgreSQL RPC `generate_due_student_invoices` (self-healing, idempotent cycle billing generator across active enrollments) and `record_student_payment` (atomic payment recording, invoice locking, and receipt issuance).
  - **DAL & Actions (`src/lib/billing.ts`, `src/app/admin/spp/actions.ts`)**: Typed queries with relation joins (`student`, `program`, `variant`, `branch`, `payment`), KPI aggregation, and server actions with `requireAdminAction()` and `revalidatePath("/admin/spp")`.
  - **Admin Interface (`/admin/spp`)**: Added "Tagihan SPP Murid" under Operasional & Keuangan in admin-shell. Built `BillingClient` with 4 KPI summary cards (Total Tagihan, Kas Diterima, Piutang Tertunggak, Murid Belum Lunas), branch and status filters, search input, `PaymentModal` for recording payments, `OfficialReceiptModal` with printable receipt view and LUNAS seal, and WhatsApp reminder generator with pre-formatted polite messages.
  - **Verification**: Full `./init.sh` passed: 0 ESLint errors/warnings, **72 Vitest suites / 413 tests passed**, coverage at **64.79% statements, 58.83% branches, 67.55% functions, 65.95% lines**, and clean production Webpack build. Mechanical detector `impeccable detect` returned 0 warnings (`[]`).
  - **Commits**: `b73188c` (spec & plan), `8511faf` (helpers), `05831ad` (schema & RPCs), `47335e5` (DAL & actions), `d0ce744` (UI & receipt), `1b1983e` (type & lint fixes).

## 2026-10-17 (Impeccable UI Audit & Technical Quality Remediations)
- **Status**: Completed.
- **Evidence**:
  - **A11y & Motion Sensitivity**: Replaced global `0.01ms` motion kill in `src/app/globals.css` with a selective reduced-motion alternative that preserves essential loading feedback (`.animate-spin`, `.animate-pulse`, `.animate-indeterminate`) and subtle opacity/color transitions without dizzying transform/translate animations.
  - **Contrast Hardening**: Upgraded low-contrast `text-slate-400` descriptions on white backgrounds to WCAG AA-compliant `text-slate-500` across `data-table.tsx`, `login-form.tsx`, `master-mobile-card.tsx`, `payroll-period-client.tsx`, `video-item-editor.tsx`, and `logo-upload-field.tsx`.
  - **Touch Target & Mobile Ergonomics**: Expanded micro-action button touch boundaries to minimum 44×44px on mobile/touch viewports on Kanban Board (delete class button, clear search button), Payroll adjustment modal close button, and Hero form pill deletion button.
  - **Design System Alignment & Detector Warning Fix**: Fixed detector warning (`text-slate-600` on `bg-amber-100` and `bg-primary-100`) by switching to hue-aligned colors (`text-amber-900` / `text-primary-900`), aligned Kanban Board "Tambah Murid" button radius from `rounded` (4px) to design system token `rounded-xl`, and added missing `aria-label` to modal close controls.
  - **Verification**: `impeccable detect --json src/` returned 0 findings (`[]`). Full `./init.sh` passed: 0 ESLint errors/warnings, **66 Vitest suites / 385 tests passed**, coverage at **64.85% statements, 59.73% branches, 67.94% functions, 65.93% lines**, and clean production Webpack build. Audit Health Score increased from **16/20 (Good)** to **19/20 (Excellent)**.
  - **Commit**: `9d6398c` (`fix(ui): remediate audit findings across accessibility, contrast, and touch targets`).

## 2026-10-16 (feat-010 Payroll Guru Sub-project Completed)
- **Status**: Completed (Sub-project 1 of feat-010).
- **Evidence**:
  - **Schema & Ledger (`supabase/migrations/20261016150000_create_payroll_guru.sql`)**: 4-table financial double-entry ledger (`payroll_periods`, `payroll_session_lines`, `payroll_entries`, `payroll_adjustments`) with strict check constraints, status invariants (`open` -> `closed` -> `paid`), RLS policies for Admin management and Guru read-only isolation, and three atomic invoker-safe RPCs (`close_payroll_period`, `mark_payroll_period_paid`, `add_payroll_adjustment`). Inactive teachers with taught sessions are preserved and compensated.
  - **DAL & Actions (`src/lib/payroll.ts`, `src/app/admin/payroll/actions.ts`)**: Pure financial calculation functions (`calculatePayrollTotals`), typed data access layer, server actions with `revalidatePath("/admin/payroll")` and `revalidatePath("/guru/honor")`, and canonical WIB (`Asia/Jakarta`) date bounding.
  - **Admin Workflow (`src/app/admin/payroll/page.tsx`, `src/components/admin/payroll/payroll-period-client.tsx`, `payroll-adjustment-form.tsx`)**: Monthly overview card, KPI totals, period selector dropdown, "+ Bulan Baru" creation modal, inline positive/negative adjustment modal with signed math, confirmation dialog for period closing, and paid transition disabling mutations.
  - **Guru Workflow (`src/app/guru/honor/page.tsx`, `src/components/guru/honor-period-select.tsx`)**: Read-only mobile-responsive statement, live open estimate query bounded by `[currentMonth, nextMonth)`, fixed allowance breakdowns, registered minimum income guarantee display, and period selector dropdown to view past closed/paid statements.
  - **Automated Verification**: Full `./init.sh` passed: 0 ESLint errors/warnings, **66 Vitest suites / 385 tests passed**, coverage at **64.85% statements, 59.73% branches, 67.94% functions, 65.93% lines**, and clean production Webpack build.
  - **Browser Smoke Test**: Authenticated Admin and Guru workflows verified via headless browser at **360px, 375px, and 1280px** with zero horizontal overflow: Open period -> Close period -> Add adjustment -> Mark paid -> Guru statement statement verification. Local Supabase test data was cleanly reset afterward.
  - **Commits**: `7be41e7` (spec), `79c4b7b` (plan), `e882644` (schema/RPC), `24979dd` (DAL/actions), `cb21734` (UI controls & statement), `ef28b6b` (grants), `e9f5cb9` (review fixes).

## 2026-10-16 (Phase 5 CMS Integrity & Landing Polish Implementation Completed)
- **Status**: Completed.
- **Evidence**:
  - **A20 — TikTok resolver hardening**: `resolveTikTokShortlink()` now requires admin authorization, parses HTTPS URLs, enforces the exact TikTok host allowlist, rejects credentials, validates the final redirect, and extracts only valid 15–22 digit video IDs with a path boundary that prevents truncation or suffix acceptance. The CMS editor recognizes both `vt.tiktok.com` and `vm.tiktok.com`, including case-insensitive input.
  - **A21 — Image normalization and gallery fallback**: `normalizeImageUrl()` rejects `javascript:`, `data:`, and `vbscript:` schemes, converts protocol-relative URLs to HTTPS, and preserves local/Google Drive conversions. Gallery previews now render a placeholder after load failure, reset when the URL changes, and retain failure state by image identity through image/group reorder and deletion.
  - **A22 — Sortable CMS state**: `SortableItemList` swaps collapse state on moves and shifts surviving indices after deletion.
  - **A24 — Public landing polish**: all landing section anchors use `scroll-mt-20`, the floating WhatsApp control uses only safe-area-aware bottom/right positioning, and `landing-content.ts` uses a top-level `Program` type import.
  - Added regression suites: `tests/security/tiktok-resolver.test.ts`, `tests/utils/image-normalizer.test.ts`, `tests/components/gallery-form.test.tsx`, and `tests/components/sortable-item-list.test.tsx`; extended CMS and landing component coverage.
  - Full `./init.sh` passed: 0 ESLint errors/warnings, **52 Vitest suites / 334 tests passed**, coverage at **63.74% statements, 59.03% branches, 66.45% functions, 64.88% lines**, and clean production Webpack build.
  - Final browser smoke passed at **360px, 375px, and 1280px** with zero horizontal overflow. The desktop `#programs` anchor settled at `80px` below the viewport top; safe-area-aware WhatsApp positioning stayed inside the viewport at all tested widths.
  - **Commits**: `1dd30c4` (plan), `d915383` (A20), `7f9fd0b` (A21), `1457a39` (A22), `ce3da03` (A24), `2f1d44c` (review fixes).

## 2026-10-16 (feat-009 Teaching Log Completed)
- **Status**: Completed; authenticated local Guru smoke passed and local Supabase smoke data was reset afterward.
- **Evidence**:
  - Added `supabase/migrations/20261016120000_create_teaching_logs.sql` with normalized session/student tables, RLS, teacher-owned draft rules, fee snapshots, and transactional save/submit RPCs.
  - Added typed DAL/actions in `src/lib/teaching-logs.ts` and `src/app/guru/mengajar/actions.ts`.
  - Added `/guru/mengajar/[id]`, `TeachingLogForm`, weekday-aware schedule links, editable historical date selection, per-student attendance/capaian/catatan fields, draft save, submit-that-saves-in-memory-edits, submitted locking, archived-draft history readback, and invalid-date fallback.
  - Added migration, validation, DAL/action, route-security, form, and schedule-link regression tests.
  - Full `./init.sh` passed: **59 Vitest suites / 363 tests**, 65.38% statements, 60.40% branches, 68.18% functions, 66.50% lines, 0 lint errors/warnings, and clean Webpack build.
  - Authenticated local Guru smoke passed: login → `/guru/jadwal` → `/guru/mengajar/[id]`, draft save, reload persistence, direct submit with in-memory edits, submitted read-only reload, and zero horizontal overflow at 360px, 375px, and 1280px. Local smoke accounts/data were reset after verification.
- **Commits**: `8a0b831` (schema/RPC), `e6bd138` (plan/test alignment), `b824dc0` (DAL/actions), `c8aa975` (workflow plan alignment), `b536d87` (teacher workflow), `cc08a84` (review fixes), `be85f86` (RLS/date fixes).

## 2026-10-15 (Phase 5 CMS Integrity & Landing Polish Spec Completed)
- **Status**: Completed (Design & Specification Gate).
- **Evidence**:
  - Formulated full architectural specification for Phase 5: `docs/superpowers/specs/2026-10-15-phase5-cms-integrity-landing-polish-design.md`.
  - Covers A20 (TikTok shortlink resolver SSRF hardening, HTTPS enforcement, and host allowlist), A21 (image normalizer scheme sanitization, protocol-relative normalization, and gallery preview fallback), A22 (`SortableItemList` collapse state stability on reorder and delete), and A24 (landing section anchor offsets `scroll-mt-20`, floating WhatsApp iOS safe area, and type annotation standard).
  - Documented automated test suites across Vitest and clear Definition of Done.
  - No implementation code touched yet; awaiting user review gate before implementation planning.

## 2026-10-15 (Phase 4 Scheduling Invariants, Multi-Branch Allocation & Modal Accessibility Implementation Completed)
- **Status**: Completed.
- **Evidence**:
  - **Task 1: Multi-Branch Teacher Allocation & Cross-Branch Overlap Validation (A4, A5, A14)**: Updated `getBoardData` in `src/lib/board.ts` to include teachers assigned via `profile_branches` junction table. Enforced positive time ordering (`start_time < end_time`), shift boundaries, and cross-branch teacher overlap detection across active drafts in `insertScheduleClass` (`tests/crud/multi-branch-scheduling.test.ts` passing 3 tests).
  - **Task 2: Student Number Format (01001 / 02001) & Preservation on Edit (A10)**: Implemented canonical 5-digit format (`01001` for Sumokembangsri, `02002` for Junwangi) in `generateStudentNumber` in `src/lib/students.ts`, and preserved existing student numbers during ordinary edits in `src/app/admin/murid/actions.ts:updateStudent` (`tests/crud/student-number-stability.test.ts` passing 2 tests).
  - **Task 3: Active Enrollment Filtering & Weekly Quota Enforcement (A11, A12, A13)**: Filtered active program enrollments (`status = 'active'`) and enforced weekly frequency quotas (`variant.frequency`) in `AddStudentModal` and `src/lib/board.ts:insertSchedulePlacement`. Filtered inactive variants in `student-form.tsx` (`tests/crud/weekly-quota-placement.test.ts` passing 2 tests).
  - **Task 4: Positive Ordered Shift Ranges, Safe Shift Narrowing & Variant Numbers Validation (A15, A16, A23)**: Enforced `start_time < end_time` on shift create/update in `src/app/admin/shift/actions.ts`, prevented shift narrowing when existing classes are stranded in `src/lib/shifts.ts:updateBranchShift`, and validated positive operational numbers (`duration > 0, frequency > 0, system > 0`) in `src/app/admin/program/actions.ts` (`tests/crud/shift-time-validation.test.ts` and `tests/crud/program-numbers-validation.test.ts` passing 5 tests).
  - **Task 5: Kanban Board Modal Focus Traps, Accessibility & Day Locking (A26)**: Added dialog semantics (`role="dialog"`, `aria-modal="true"`), Tab focus traps, Escape key listeners, and day locking across `AddClassModal`, `AddStudentModal`, and `ClassTimeModal` (`tests/components/board-modal-accessibility.test.tsx` passing 3 tests).
  - **Task 6: Full Verification Harness & Documentation Gate**: Verified via `./init.sh`: 0 ESLint errors/warnings, 48 Vitest suites (302 tests passing, 63.07% statements, 58.74% branches, 65.79% functions, 64.23% lines exceeding all thresholds), and clean Webpack production build.

## 2026-10-15 (Phase 4 Scheduling Invariants & Modal Accessibility Spec Completed)
- **Status**: Completed (Design & Specification Gate).
- **Evidence**:
  - Formulated full architectural specification for Phase 4: `docs/superpowers/specs/2026-10-15-phase4-scheduling-class-allocation-design.md`.
  - Documented automated test suites across Vitest and clear Definition of Done.

## 2026-10-15 (Phase 3 Teacher Attendance Lifecycle & PWA Offline Model Implementation Completed)
- **Status**: Completed.
- **Evidence**:
  - Added `getWIBDateBounds` in `src/lib/attendances.ts` and created database migration `supabase/migrations/20261015110000_phase3_teacher_attendance_shift_and_idempotency.sql` adding `shift_id` to `teacher_attendances` with session index (`tests/utils/wib-timezone.test.ts` and `tests/security/attendance-migration-schema.test.ts` passing 5 tests).
  - Enforced strict database mutation error throwing in `insertCheckIn` / `updateCheckOut`, deterministic client UUID upsert with idempotency, and server-side geofence radius validation in `src/app/guru/absen/actions.ts:processOnlineCheckIn` (`tests/crud/attendance-server-validation.test.ts` passing 4 tests).
  - Modernized `src/lib/pwa/db.ts` with `transaction.oncomplete` disk persistence, added `attendance_id` and `shift_id` to `PendingAttendance`, isolated offline queues per teacher ID, and synchronized targeted check-outs in `syncOfflineAttendances` (`tests/pwa/offline-queue-lifecycle.test.ts` passing 3 tests).
  - Stabilized attendance client state with `isSyncingRef` preventing infinite re-sync loops, guarded location unmount lifecycle with `isMountedRef`, cleared stale coordinates on GPS error, handled empty branches without crashing, sorted shifts by teacher bounds, and updated toast mobile geometry (`tests/components/toast-responsive.test.tsx` passing 1 test).
  - Verified full test suite and build via `./init.sh`: 0 ESLint errors/warnings, 42 Vitest suites (287 tests passing, 61.83% statements, 58.22% branches, 64.92% functions, 62.92% lines exceeding all thresholds), and clean Webpack production build.

## 2026-10-15 (Phase 3 Teacher Attendance Lifecycle & PWA Offline Model Spec Completed)
- **Status**: Completed (Design & Specification Gate).
- **Evidence**:
  - Formulated full architectural specification for Phase 3: `docs/superpowers/specs/2026-10-15-phase3-teacher-attendance-pwa-design.md`.
  - Covers G1 (database error checking before acknowledgement), G2 (server-side geofence and schedule validation in `processOnlineCheckIn`), G3 (targeted offline checkout matching `record.attendance_id`), G4 (shift-aware attendance schema with `shift_id` on `teacher_attendances`), G5 & G7 (deterministic client UUID generation and idempotent insertion), G8 (teacher-scoped queue isolation), G9 (single-flight sync guard stopping infinite re-sync loops), G10 (canonical `Asia/Jakarta` date/weekday normalization), G11 & G12 (replacing `Promise.withResolvers` with standard `Promise` and confirming on `transaction.oncomplete`), and G21 (responsive mobile toast layout).
  - Documented automated test suites across Vitest and clear Definition of Done.
  - No implementation code touched yet; awaiting user review gate before implementation planning.

## 2026-10-15 (Phase 2 Master Data CRUD Integrity Implementation Completed)
- **Status**: Completed.
- **Evidence**:
  - Aligned student enrollment status vocabulary to canonical schema constraint (`active`, `cuti`, `lulus`, `keluar`) in `src/types/index.ts`, `src/components/admin/murid/student-form.tsx`, and `src/app/admin/murid/[id]/page.tsx` (`tests/crud/student-form-status.test.tsx` passing 2 tests).
  - Made student enrollment updates atomic and non-destructive with pre-validation and memory backup/compensating restore in `src/lib/students.ts:updateStudentData` (`tests/crud/student-enrollment-sync.test.ts` passing 3 tests).
  - Pre-allocated UUIDs upfront for new program variants in `src/app/admin/program/actions.ts:updateProgram` and safely retained all IDs in `src/lib/programs.ts:updateProgramData` with human-friendly FK restrict error reporting (`tests/crud/program-variant-sync.test.ts` passing 2 tests).
  - Added compensating rollback deleting orphan Auth accounts on failed teacher provisioning in `src/lib/gurus.ts:insertGuruProfile` and verified `{ error }` inspection on `profile_branches` mutations (`tests/crud/guru-provisioning-rollback.test.ts` passing 2 tests).
  - Removed obsolete destructive `seed-variants.mjs` script from repository root (`tests/crud/seed-script-quarantine.test.ts` passing 2 tests).
  - Verified full test suite and build via `./init.sh`: 0 ESLint errors/warnings, 37 Vitest suites (274 tests passing, 62.05% statements, 58.59% branches, 65.02% functions, 63.07% lines exceeding all global coverage thresholds), and clean Webpack production build.

## 2026-10-15 (Phase 2 Master Data CRUD Integrity Spec Completed)
- **Status**: Completed (Design & Specification Gate).
- **Evidence**:
  - Formulated full architectural specification for Phase 2: `docs/superpowers/specs/2026-10-15-phase2-master-data-crud-integrity-design.md`.
  - Covers A1 (student enrollment status vocabulary alignment to `active|cuti|lulus|keluar` and data-loss prevention on update), A2 & A3 (upfront client UUID generation for new program variants and safe retention in delete query), A17 (FK constraint error surface for in-use variant deletions), A18 (explicit error checks for `profile_branches` mutations), A25 (compensating rollback for failed teacher provisioning deleting orphan auth users), and O2 (removal of obsolete destructive `seed-variants.mjs`).
  - Documented automated test suites across Vitest and clear Definition of Done.
  - No implementation code touched yet; awaiting user review gate before implementation planning.

## 2026-10-15 (Phase 1 Security & Database Authorization Hardening Implementation)
- **Status**: Completed.
- **Evidence**:
  - Implemented `sanitizeNextUrl` in `src/lib/security.ts` and integrated into `src/components/admin/login-form.tsx` to prevent open redirects, executable script schemes, and protocol-relative URLs (`tests/security/login-redirect.test.ts` passing 7 tests).
  - Hardened `extractCoordinatesFromUrl` in `src/lib/maps.ts` with `requireAdminAction()` and strict HTTPS Google Maps host allowlisting (`tests/security/maps-action.test.ts` passing 6 tests).
  - Hardened Service Worker in `src/app/sw.ts` with top-priority `NetworkOnly` boundary on `/admin/*`, `/api/*`, `/login`, and `/logout`, and added activation cache cleanup for legacy response caches while strictly preserving IndexedDB offline queues (`tests/pwa/sw-cache-policy.test.ts` passing 4 tests).
  - Created migration `supabase/migrations/20261015100000_phase1_security_hardening.sql` hardcoding `role = 'guru'` in `handle_new_user()` and enabling RLS with admin mutation policies on `program_variants` and `branch_shifts` (`tests/security/migration-schema.test.ts` passing 4 tests).
  - Full verification suite `./init.sh` passed: 0 ESLint errors/warnings, 32 Vitest suites (263 tests passing, 60.64% statements, 57.33% branches, 64.27% functions, 61.61% lines), and clean Webpack production build.

## 2026-10-14 (Phase 1 Security & Authorization Spec Completed)
- **Status**: Completed (Design & Specification Gate).
- **Evidence**:
  - Formulated full architectural specification for Phase 1 remediation: `docs/superpowers/specs/2026-10-14-phase1-security-hardening-design.md`.
  - Covers S1 (role hardcoding in `handle_new_user` trigger), S2 (enabling RLS on `program_variants` and `branch_shifts`), S3 (explicit `NetworkOnly` boundary on `/admin/*` in `sw.ts` with legacy cache purge, preserving IndexedDB), S4 (`sanitizeNextUrl` to prevent open redirects and script injection), and S5 (admin authorization and strict HTTPS host allowlist for `extractCoordinatesFromUrl`).
  - Established zero-downtime cutover sequence and test plan across Vitest unit suites and production smoke tests.
  - No code or database mutations performed in this step. Awaiting user review gate before implementation planning.

## 2026-10-14 (Guru Profile Notification Polish & Mobile PWA Service Worker Fix)
- **Status**: Completed.
- **Evidence**:
  - Investigated mobile notification failure on Brave & Edge Android: Next.js 16 defaults to Turbopack which bypassed Serwist's Webpack plugin on Vercel, leaving `/sw.js` as 404 in production. Desktop browsers fell back to `new Notification()`, while mobile Chromium strictly requires `ServiceWorkerRegistration.showNotification()`.
  - Configured `package.json` `"build": "next build --webpack"` to guarantee Serwist compiles `public/sw.js` during production builds.
  - Generated and included `public/sw.js` in the repository, adding it to `globalIgnores` in `eslint.config.mjs`.
  - Polished `NotificationTestButton` UI with progressive disclosure, pill-shaped action button (`rounded-full`), preventing layout squeeze and awkward text wrapping on mobile viewports.
  - Resolved React 19 / ESLint `react-hooks/set-state-in-effect` by initializing client-side permission state via asynchronous microtask queue.
  - Hardened notification trigger in `notification-test-button.tsx` to actively register `/sw.js` and wait for `navigator.serviceWorker.ready` with `tag: "uzma-test-notification"`.
  - Aligned Guru profile role badge to `DESIGN.md` brand palette (`bg-primary-50 text-primary-700 border border-primary-200/60`).
  - Added comprehensive unit test suite `tests/components/notification-test-button.test.tsx` (5 passing tests).
  - Removed unused import `formatTimeString` in `src/app/guru/page.tsx`.
  - Verified `./init.sh`: 0 ESLint errors/warnings, 28 test suites (242 tests passing), and clean production build.

## 2026-10-10 (Village-Based Branch Refactor & Administrative Hierarchy)
- **Status**: Completed.
- **Evidence**:
  - Investigated and resolved empty guru list on `/admin/guru`: PostgREST query in `src/lib/gurus.ts` previously attempted an inline join with `profile_branches` table which caused error `PGRST200` (relationship not found in schema cache). Refactored `getPaginatedGurus` and `getGuruById` to query `profiles` reliably with graceful fallback for branch assignments. Verified all 11 active teachers render properly.
  - Added new comprehensive test suite `tests/gurus.test.ts` (4 new tests, 237 total passing tests across 27 suites).
  - Migrated branches to be village-based: `balongbendo` -> `sumokembangsri` (Cabang Sumokembangsri) and `krian` -> `junwangi` (Cabang Junwangi).
  - Added structured regional fields `kecamatan` and `desa` to `branches` table with schema migration `20261010140000_village_based_branch_refactor.sql`.
  - Atomically relinked all 40 students, 11 teacher/admin profiles, 5 branch shifts, and 2 active schedule drafts with 0 orphan records.
  - Updated DAL (`src/lib/branches.ts`, `src/types/database.ts`), Admin server actions, Branch form, table views, and detail page to display and manage `kecamatan` and `desa`.
  - Updated public landing page footer, CMS locations config, and SEO JSON-LD structured data.
  - Full verification suite `./init.sh` passed with 0 ESLint errors/warnings, 237 Vitest tests passing, and clean Turbopack production build.
## 2026-10-08 (Global DAL Migration Phase 2)
- **Status**: Completed.
- **Evidence**:
  - Refactored all remaining modules (Cabang, Guru, Murid, Program, Draft, Shift, Landing CMS).
  - Eliminated all raw `supabase.from(...)` queries from `src/app/` and `src/components/`, moving them into `src/lib/` (DAL).
  - Centralized authorization by creating `requireAdminAction()` in `src/lib/auth.ts`.
  - Vitest test suite updated to mock new DAL interfaces, all 230 tests passing.
  - Linting passed with 0 errors. Pushed to remote (`dcd6241`).

- **Status**: Completed.
- **Evidence**:
  - Performed security and production readiness audit. Confirmed route protection via Next.js `proxy.ts` instead of deprecated `middleware.ts`.
  - Refactored `src/app/admin/cabang/page.tsx` to abstract raw Supabase queries into a Data Access Layer (DAL) function `getPaginatedBranchesWithStats` in `src/lib/branches.ts`.
  - Demonstrated best practices for Server Components without exposing raw queries in the UI.
  - Linting passed cleanly; architecture set up for further DAL migrations.

## 2026-10-02 (Impeccable Audit & Remediation - Phase 2)
- **Status**: Completed secondary sweep requested by user.
- **Evidence**:
  - Replaced remaining `confirm()` calls in Kanban Board with `ConfirmDialog` state-driven UI.
  - Rewrote `draft/page.tsx` and `shift/page.tsx` completely to match UI standards (using `DataTable`, `MasterMobileCard`, and `SearchFilterBar`), solving layout discrepancies.
  - Test suite re-ran with 225 passing tests, ESLint passed zero errors.

## 2026-10-02 (Post-Audit Hardening & Shift Actions)
- **Status**: Completed.
- **Evidence**:
  - `npm run lint` passes with 0 errors and 0 warnings (strictly enforced).
  - `npm test` passes all 225 unit tests.
  - `npm run build` succeeds cleanly.
  - Eliminated `confirm()` in `kanban-board.tsx`.
  - Added `<ShiftStatusButton>` at `src/components/admin/shift/shift-status-button.tsx`.
  - Shift table and mobile card both support status toggles alongside editing.

## 2026-10-02 (Kanban Board Program Filter & Polish)
- **Status**: Completed.
- **Evidence**:
  - Added program dropdown filter and instant search clear button in Kanban Board sidebar (`src/components/admin/board/kanban-board.tsx`).
  - Teachers and students in the scheduling sidebar can now be filtered by active educational program (AHE, ASE, BEE, MAPEL, etc.) or viewed all at once.
  - Active tab badges in Kanban Board dynamically display accurate counts of available/unplaced candidates matching the active filter.
  - Cards highlight program badges and enrolled variant tags.
  - Added unit test in `tests/components/kanban-board.test.tsx` verifying multi-program filtering across both teacher and student tabs.
  - `./init.sh` succeeds with zero errors (226 tests passed, 0 lint errors, build succeeded).

## 2026-10-02 (Unified Status Toggle Icons)
- **Status**: Completed.
- **Evidence**:
  - Unified all 5 status buttons (`BranchStatusButton`, `GuruStatusButton`, `StudentStatusButton`, `ProgramStatusButton`, `ShiftStatusButton`) to use `PowerOff` (for deactivating, in rose) and `Power` (for activating, in emerald).
  - Added `Loader2` transition indicator and `showLabel` support to all status toggle buttons.
  - Eliminated visual collision with the `Eye` icon used for Detail views.
  - `npm run lint` passes with 0 errors and 0 warnings.
  - `npm test` passes all 226 tests.
  - `npm run build` production build succeeds.

## 2026-10-02 (Dynamic Scheduling Time Bounds)
- **Status**: Completed.
- **Evidence**:
  - Dropped `uq_teacher_shift_day` unique constraint via migration.
  - Added `start_time` and `end_time` to `schedule_classes`.
  - Created `ClassTimeModal` for assigning specific times during drag-and-drop on Kanban Board.
  - Updated backend `createScheduleClass` with validation for shift time boundaries and teacher class overlaps.
  - Sidebar reactively filters teachers based on available shift minutes vs scheduled minutes.
  - Supabase types updated and migrations pushed to remote production.
  - `npm run build` and `npm test` verified 100% passing.

## 2026-10-02 (Redistribute Dummy Students)
- **Status**: Completed.
- **Evidence**:
  - Pushed migration `20261002164312_redistribute_dummy_students.sql` to randomly assign the 20 dummy students to diverse programs (AHE, ASE, BEE, etc.) instead of everyone defaulting to the first variant.

## 2026-10-02 (Kanban Board Polish)
- **Status**: Completed.
- **Evidence**:
  - Added visual highlight/dimming search logic to Kanban board containers and placements.
  - Fixed DND-Kit event bubbling bug where full class blocked new session drop underneath.
  - Added "Kembali ke Draft" back button to `/admin/draft/[id]/board` page.
