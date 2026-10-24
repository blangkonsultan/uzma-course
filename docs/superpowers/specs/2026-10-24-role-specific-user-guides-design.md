# Role-Specific User Guides — Uzma Course

Date: 2026-10-24
Status: Approved by the user on 2026-10-24; implementation plan review and execution-method selection remain.
Active feature: `feat-012` — Role-Specific Admin and Teacher User Guides.

## Intent

Give admins and teachers independent, practical instructions for completing their actual Uzma Course work. Replace repeated verbal onboarding with Indonesian, task-based instructions, real application screenshots, clear system rules, and actionable troubleshooting.

The user explicitly requested separate guide pages for admin and guru, complete steps, screenshots, and usage rules. They accepted the recommended role-specific scope and requested browser mockups. The companion recorded selection `illustrated` from **Gunakan susunan ini**. The user subsequently approved this full reviewed design on 2026-10-24, including the assistant-proposed decisions below.

## Decisions and authority

### User-selected requirements

- Two separate guides: admin and guru, not a single mixed-role manual.
- Numbered, practical instructions with screenshots and usage rules.
- The recommended coverage of existing master data, scheduling, SPP, payroll, CMS, teacher attendance, teaching cards, honor, and account use.
- Illustrated task reader: steps and relevant screenshots side by side on wide screens, with a readable mobile sequence.

### Assistant-proposed decisions approved with this document

- Indonesian guide copy with the application's exact menu, status, and button labels.
- Protected routes `/admin/panduan` and `/guru/panduan`, preserving existing role boundaries.
- An admin sidebar entry under a small help group; a teacher **Panduan Pengguna** entry on Profil, without adding a sixth bottom-navigation tab.
- Start at **Mulai menggunakan portal** rather than the SPP/Submitted examples initially shown in the mockup.
- Stable, shareable `?topik=<slug>` links for individual tasks. Missing or unknown slugs select the getting-started topic for that role.
- Locally authored, version-controlled content; no new CMS, database schema, third-party documentation service, or search dependency.
- Sanitized screenshot assets under `public/guides/admin/` and `public/guides/guru/`. These files are publicly retrievable; the guide pages remain role-protected. Only demonstrably dummy, non-sensitive screenshots may be published there.
- Separate **Aturan sistem** from **Saran penggunaan**, rather than treating recommendations as enforced application behavior.

## Goals

1. A new admin can set up and run existing operational workflows without using teacher-only instructions.
2. A teacher can find the next action quickly from a phone, including what to do when attendance cannot be recorded normally.
3. Every instruction names a real control, states prerequisites, explains the result, and documents relevant limitations.
4. Screenshots depict the current application, with no credentials or real student, guardian, teacher, or financial information.
5. Both guides remain maintainable as application controls and business rules change.

## Non-goals and anti-goals

- Do not add or change scheduling, accounting, enrollment, authentication, geofencing, or attendance business rules.
- Do not expose operational data, publish credentials, or place both roles' guide bodies in one client bundle.
- Do not add admin impersonation of a teacher. The existing guards redirect admins away from guru pages and vice versa.
- Do not promise that the whole teacher portal or guide works offline. Document only existing offline attendance behavior.
- Do not add automated WhatsApp delivery. Existing reminder links open a composed message for the operator to send.
- Do not add full-text search infrastructure, progress tracking, quizzes, videos, onboarding tours, or a new document-management module.
- No dedicated PDF generator. A print-friendly version of the selected article may use the browser's existing print/save-as-PDF capability.
- Do not ship prototype HTML, fabricated screenshots, placeholder images, copied screenshots of obsolete controls, or a partially filled manual as the production feature.
- Do not add wording, source-text, mock-forwarding, or implementation-plumbing tests for guide copy.

## Existing evidence and constraints

- Stack: Next.js 16.3.7 App Router, React 19, Tailwind v4, TypeScript, Supabase, existing Vitest harness.
- `src/lib/auth.ts` exposes `requireAdminPage()` and `requireGuruPage()`; preserve those access rules without inline profile queries in UI components.
- `src/components/admin/admin-shell.tsx` owns admin navigation.
- `src/app/guru/layout.tsx` already guards the guru area and uses a `max-w-md` reading/application surface with bottom navigation.
- `PRODUCT.md` prioritizes desktop/tablet admin use and mobile/PWA teacher use. Its old statement that payroll/SPP are future work is superseded by current routes, `feature_list.json`, and implementation records; do not copy that stale statement into the guides.
- `DESIGN.md` remains the visual authority: Poppins, Nurturing Purple, Deep Purple, slate neutrals, pill actions, rounded containers. Do not redesign the brand or repair unrelated design sidecar drift.
- Existing source records show submitted teaching-card locking, branch-configured geofencing, teacher-scoped offline queues, WIB-aware dates, a 28-day SPP cycle, and open/closed/paid payroll states. Verify the exact relevant action/DAL contracts while authoring each tutorial.
- `public/docs/` is ignored. Production assets must not depend on that existing generated-documentation directory.
- Before writing Next.js implementation code, read the installed version's relevant documentation under `node_modules/next/dist/docs/`.
- An existing combined manual is available at `docs/buku-panduan-pengguna.md` with a companion PDF. Reuse verified explanations and genuinely current assets as source material; do not blindly copy older terminology such as calendar-month SPP wording. When the new pages ship, add links to both role-specific pages in the existing Markdown manual. Regenerating or deleting the legacy PDF is outside this request.

## Information architecture and navigation

Each role has its own page entry point and its own content import. Reuse rendering components and guide types, not a combined role dataset delivered to every reader.

A guide has chapters containing task articles. The chapter index and search contain only the current role's topics. An article is selected by a stable kebab-case slug in `topik`; query input selects a known article, never a filesystem path or arbitrary HTML. Direct links must resolve after login under the existing authentication behavior.

On desktop, the admin guide uses a searchable contents rail and a main reading surface. Teachers keep the incumbent narrow portal width, even on a large display. On narrow screens, the same contents navigation becomes an expandable **Daftar isi panduan**; choosing a topic closes the index and exposes the article. Preserve visible focus and a meaningful article heading after navigation.

Search is a simple, local, case-insensitive filter of topic names and authored task keywords. Provide an honest no-results state and a clear way to reset it. It filters navigation, not operational application data. Do not describe it as semantic search.

Previous/next task links supplement, but do not replace, the contents index. Every task must also be reachable directly through its URL.

## Article contract

Every production tutorial contains:

1. A specific task title and a short explanation of when to use it.
2. **Sebelum mulai**: account, data, device, or status prerequisites.
3. An ordered sequence naming exact controls and expected choices.
4. One or more current screenshots relevant to that sequence, with meaningful captions and alt text.
5. **Hasil yang diharapkan**: an observable application result, not just “finished.”
6. **Aturan sistem**: relevant enforced permissions, validation, status locks, time boundaries, or data dependencies.
7. **Saran penggunaan** when needed: operational recommendations clearly distinguished from application restrictions.
8. Contextual troubleshooting that states the symptom, likely condition, and a real recovery path or when to contact admin.

Explain potentially irreversible or financial actions immediately before the affected step. Do not invent universal attendance radii, payroll rates, grace periods, late penalties, notification guarantees, or refund/correction workflows that the application does not implement.

The guide is documentation of application behavior, not permission to perform an action. Existing buttons, forms, and server authorization remain authoritative.

## Admin guide coverage

Split the following into focused task articles, rather than one article per entire module. All currently available controls within this coverage must be accounted for; do not substitute a module overview for executable steps.

### 1. First use and navigation

- Log in with an admin account, identify dashboard information and navigation groups, use filters, and log out safely.
- Explain admin versus guru access. Do not document a password-recovery/reset function unless it actually exists.

### 2. Cabang, program, and shift setup

- Create, inspect, edit, and activate/deactivate branches using existing controls.
- Explain the address/location fields, map input, coordinates, and branch attendance radius visible in the current form.
- Create, inspect, and edit programs and variants, including the actual duration, frequency, capacity, and fee fields.
- Document actual restrictions on removing or changing referenced variants, without recommending destructive workarounds.
- Create/edit shifts and change their operational status. Explain ordered time ranges, class boundaries, and restrictions when narrowing an occupied shift.

### 3. Teacher management

- Create the teacher account through Data Guru, fill required fields, assign branch(es) and program(s), and verify the result.
- Edit teacher details, inspect assignments and relevant compensation fields, filter across branches, and manage active status.
- Explain what teachers can do through their own portal; do not promise admin impersonation or unsupported account-management controls.

### 4. Student management and enrollments

- Register a student, record guardian contact details, select branch and program variants, and verify the generated student identity.
- Edit and inspect student details and multiple enrollments, including existing discount controls where present.
- Distinguish profile active status from enrollment statuses `active`, `cuti`, `lulus`, and `keluar` using the actual displayed labels.
- Explain prerequisites for finding a student on the scheduling board.

### 5. Draf Jadwal and Papan Jadwal

- Create/edit a draft, open the board, and explain every existing draft status and supported status transition.
- Place teachers, create classes, specify class time, place/remove students, and inspect allocations.
- Use the board's search and program filters; explain why a teacher or student may not appear as available.
- Document enforced shift bounds, teacher overlap across branches, student/program compatibility, capacity, and other actual placement constraints.
- Use the existing printable schedule view where exposed by the app. Do not invent a new scheduling publication state.

### 6. SPP and receipts

- Generate due cycle invoices using the existing control; explain the rolling 28-day cycle, not a calendar-month assumption.
- Find invoices through combined branch, status, and text filters, including multi-program students.
- Record an actual received payment through **Catat Bayar**, verify the invoice/amount/cycle, fill the existing payment fields, and save.
- Explain the implemented settlement contract; do not promise partial-payment inputs or reversal controls absent from the current form/actions.
- View/print the official receipt, use the WhatsApp reminder link correctly, and export the filtered grouped SPP recap through **Export Rekap PDF**.
- Distinguish a UI retry from recording a duplicate payment; direct readers to verify transaction state and errors first.

### 7. Payroll

- Select/create a period and inspect sessions, components, allowances, minimum-income treatment, and totals as implemented.
- Add signed adjustments with their reason while the period allows them.
- Close a period with an explicit warning about fixed results and allowed subsequent operations.
- Mark it paid only after payment actually happens; explain open, closed, and paid states and the difference between an estimate and a statement.
- Do not invent reopening or paid-period editing.

### 8. Landing-page CMS

- Find and edit all 14 existing sections: hero, programs, why_us, facilities, team, gallery, testimonials, videos, locations, faq, cta, footer, navbar, and floating_wa.
- Cover text/media input, reorder/delete where available, previews, save, and verification on the public page.
- Explain actual image/Google Drive/video-link requirements using current supported behavior and validation messages.
- Warn that CMS output is public and must not contain internal or personal information.

## Teacher guide coverage

### 1. First use on a phone

- Log in with the account provided by admin and recognize Beranda, Jadwal, Presensi, Honor, and Profil.
- Explain optional PWA installation using browser-appropriate conditional instructions. Installation availability varies; do not invent a universal in-app install button or fabricate OS screenshots.
- Explain location and notification permission setup only where relevant to existing features. Include the existing profile notification test if exposed.

### 2. Jadwal

- Select the correct day, inspect branch/time/program, expand the student list, and identify the card action.
- Distinguish a day without assignments from a connection/error condition; explain when to ask admin to check allocation.

### 3. Presensi

- Select/confirm the assigned branch and relevant shift, grant GPS access, wait for location, and perform check-in/check-out through actual controls.
- Explain assignment/date/shift validation, branch-configured distance limits, missing branch coordinates, GPS denial or unstable GPS, and **Hari Ini Libur**.
- Explain the relationship between a check-in and its check-out. Do not instruct teachers to bypass server-side validation.

### 4. Offline attendance queue

- Explain online success versus locally queued attendance, the visible queue/sync indicators, and reconnecting with the same account/device.
- Instruct readers to verify synchronization before treating a queued action as received by the server.
- Recommend not deleting site/browser data while unsynced records remain; label this as data-preservation advice.
- Do not imply teaching cards, payroll, admin pages, or every PWA feature are included in this queue.

### 5. Kartu Mengajar

- Open **Isi Kartu Mengajar** for an editable session and select/verify the correct session date.
- Record each student's actual attendance status, achievement, and teacher notes.
- Save a draft, reopen it, review changes, and submit; explain that submit saves current edits before locking the result.
- Open **Lihat Kartu Mengajar** for a submitted session, distinguish its stored date, and explain its read-only state.
- Explain actual date/day restrictions and error recovery without describing unsupported correction/unsubmit controls.

### 6. Honor

- Choose the period, inspect the teacher's own session/components and total, and understand estimate versus closed/paid results.
- Direct discrepancies to admin with the relevant period and session, without exposing other teachers' information.

### 7. Profil and account safety

- Inspect own profile and branch assignment, use the current password-change form, and log out.
- Locate **Panduan Pengguna** here. Explain which identity/assignment corrections require admin.
- Do not publish test account passwords in the guide or screenshot assets.

## Screenshots and content verification

Use the running local app with the existing local demo accounts/data, not production. The current mockup already contains fresh local examples of the SPP payment form, teacher schedule, and a submitted teaching card. Those examples are evidence for the selected layout, not a complete production screenshot set.

For implementation:

- Capture the existing list, form, board, dialog, confirmation, and result states needed to support each tutorial. Include key error/empty/locked states where they explain a real limitation.
- Prioritize desktop captures for admin and phone captures for guru. The guide itself must work at all required viewports.
- Prefer existing demo state. If an illustrated state needs additional records, create only isolated, explicitly dummy local records through existing supported workflows; do not overwrite/reseed unrelated local data or write to production. Remove only records created for the capture once no longer needed.
- Do not make real payment or attendance submissions merely to stage a screenshot. Existing safe demo results may be inspected; any needed demonstration transaction must be explicitly dummy and local.
- Never publish passwords, auth tokens, keys, browser storage, real contacts, real financial records, or identifying production data. Review every capture visually before adding it.
- Preserve unaltered source captures; crops and numbered callouts must clarify the view, not conceal errors or fabricate states. Use descriptive filenames, accurate intrinsic dimensions, captions, and alt text.
- Any callout number must map clearly to a nearby instruction. At mobile widths, put each relevant image immediately after its associated step or short step group.
- Browser/OS permission instructions may be text when a genuine device screenshot is unavailable; do not mislabel a drawing as a real screenshot.
- Record source route and the task/state each screenshot demonstrates in its authored content metadata. Keep asset lookup a fixed authored mapping.

## Reading interaction and accessibility

- Preserve the purple/Poppins incumbent identity, hierarchy, and existing UI primitives.
- Prefer readable body text of at least 14px. Form/search text is at least 16px on mobile. Avoid reducing text to make a column fit.
- Meet the project's 36–44px touch-target requirement, using 44px for the new navigation, disclosure, zoom, and action controls.
- Expand screenshots in an accessible, keyboard-operable viewer. If using a native dialog, provide a labelled close control, Escape dismissal, appropriate focus handling, and a usable scroll area for full-resolution images.
- Use semantic headings, an ordered step list, meaningful images, visible focus, a skip link, and `aria-current` on the selected topic.
- Do not rely on color alone for draft/submitted, success, errors, warnings, or navigation state.
- Respect reduced-motion settings; no unnecessary entrance effects or animated reading content.
- Both the contents index and article must remain usable at 360px, 375px, and 1280px+, with zero horizontal overflow and no clipped controls.
- Keep the teacher bottom navigation usable and avoid covering the final instruction or footer controls.
- If print is included, print the current article without app navigation or prototype controls, retaining images, warnings, and troubleshooting content. Do not advertise a downloadable generated PDF.

## Implementation boundaries

The subsequent implementation plan may choose exact filenames and component boundaries following existing conventions. The intended shape is two protected route components, separate role content files, shared typed article/screenshot rendering, and only the client-side interaction necessary for search/index/zoom.

Server-render article content for direct links and retain the normal role guard for every protected route. Do not put database queries in guide UI components. No operational database changes, schema migrations, new permissions, dependencies, or changes to the service worker's admin/auth cache boundary are required.

Do not add aliases for obsolete help routes; none are currently implemented in the route inventory. Do not treat the ignored `.superpowers/brainstorm/` prototype as production source.

## Verification and acceptance

Implementation is accepted only when:

1. Both role-specific routes and their real navigation entry points work, including direct links and sensible unknown-topic behavior.
2. Logged-out access follows login protection. Guru cannot enter the admin guide, and admin cannot enter guru-only pages under the existing guards. No other role's guide body is shipped in the current role's client payload.
3. All coverage listed above is authored with executable steps, current screenshots, observable outcomes, correctly classified rules/advice, and troubleshooting. No blank sections or placeholder assets remain.
4. Each screenshot is visually checked against its source workflow and confirmed to use safe demo data.
5. The browser exercises role-specific contents/search, empty-search recovery, article links, previous/next navigation, mobile index, screenshot open/close/Escape/focus behavior, and any print surface.
6. Browser verification at 360px, 375px, and 1280px+ finds zero horizontal overflow, no clipped controls, comfortable targets, legible text, and loaded screenshot assets.
7. Existing `./init.sh` passes lint, Vitest, and production build after implementation. Add permanent tests only for meaningful uncertain consumer-visible behavior or affected contracts, not for copied guide prose or component wiring.
8. Update `feature_list.json`, `progress.md`, and `session-handoff.md` honestly; `feat-012` is not completed until the production guides and their verification are complete.

## Design-phase evidence

- Baseline `./init.sh` passed: clean lint, 80 Vitest suites / 462 tests, and production Webpack build.
- The local demo app was exercised for admin SPP and teacher schedule/teaching-card reads; no operational transaction was saved for the prototype.
- Browser mockup supports both roles, all three presented compositions, topic filtering/navigation, screenshot zoom, contextual help, and browser printing.
- Initial layout smoke covered both roles and all three compositions at 360px, 375px, 1280px, and 1440px with zero horizontal overflow, no clipped controls, and loaded sample images.
- The design detector was run once. Mechanical legibility/dialog-image issues were addressed; it also flagged the explicitly pinned purple/Poppins identity and structural-shell padding, so no “zero detector findings” claim is made.
- Prototype: `.superpowers/brainstorm/152828-1792805980/content/role-guides-v1.html` (ignored, not production code). The companion stores the user's `illustrated` selection in its session events.

## Remaining gate

The fresh builder check returned **nothing important left**. The independent boundary reviewer returned **no material boundary findings**, covering role guards, role-specific payloads, screenshot privacy, offline attendance, submitted teaching cards, SPP settlement, and payroll boundaries.

The user approved this full reviewed design on 2026-10-24. The implementation plan is `docs/superpowers/plans/2026-10-24-role-specific-user-guides.md`. Review that plan and select an execution method before production implementation begins.
