# Session Handoff

Phase 5 CMS Integrity, TikTok Shortlink Hardening & Public Landing Polish is implemented, review-hardened, and verified.

- **Spec**: `docs/superpowers/specs/2026-10-15-phase5-cms-integrity-landing-polish-design.md`
- **Plan**: `docs/superpowers/plans/2026-10-16-phase5-cms-integrity-landing-polish.md`

## Completed Scope
- **A20**: `resolveTikTokShortlink()` enforces admin authorization, HTTPS, exact TikTok host allowlisting, credential rejection, safe final redirects, exact 15–22 digit ID boundaries, and valid video ID extraction. The editor supports case-insensitive `vt.tiktok.com` and `vm.tiktok.com`.
- **A21**: `normalizeImageUrl()` blocks dangerous schemes and normalizes protocol-relative URLs; gallery image previews show and recover from per-image fallback state keyed by stable in-memory image identity through reorder and deletion.
- **A22**: `SortableItemList` preserves collapse state through moves and deletes.
- **A24**: all landing anchors use `scroll-mt-20`, floating WhatsApp uses only safe-area-aware bottom/right positioning, and `Program` uses a top-level type import.

## Verification
- `./init.sh`: 0 lint errors/warnings, **52 Vitest suites / 334 tests passed**, coverage above configured thresholds, and clean Webpack production build.
- Browser smoke: 360px, 375px, and 1280px; zero horizontal overflow. `#programs` settled at 80px from the viewport top and the safe-area-aware WhatsApp control stayed inside the viewport.

## Commits
- `1dd30c4` — Phase 5 implementation plan
- `d915383` — A20 TikTok resolver hardening
- `7f9fd0b` — A21 image safety and gallery fallback
- `1457a39` — A22 sortable collapse state
- `ce3da03` — A24 landing anchor and safe-area polish
- `2f1d44c` — Phase 5 review fixes

## Working-Tree Note
- The generated `public/sw.js` build diff is restored; no unrelated generated changes are retained.

## feat-009 Teaching Log
- **Spec**: `docs/superpowers/specs/2026-10-16-teaching-log-student-session-cards-design.md`
- **Plan**: `docs/superpowers/plans/2026-10-16-teaching-log-student-session-cards.md`
- **Implementation**: schema/RPC migration, RLS, typed DAL/actions, `/guru/mengajar/[id]`, mobile form, weekday-aware date links, editable historical dates, per-student status/capaian/catatan, fee snapshots, draft save, submit-that-saves-edits, submitted locking, archived history readback, and invalid-date fallback.
- **Verification**: 59 suites / 363 tests, 65.38% statements, 60.40% branches, 68.18% functions, 66.50% lines, lint clean, production build clean, and unauthenticated route smoke at 360/375/1280px with zero overflow.
- **Commits**: `8a0b831`, `e6bd138`, `b824dc0`, `c8aa975`, `b536d87`, `cc08a84`, `be85f86`.

## Current Blocker
- Authenticated Guru draft/save/submit browser smoke is pending because the repository context provides only the Admin test account. The route correctly redirects unauthenticated requests to `/login`; no dummy external account was created.

## Recommended Next Step
- Provide or configure a non-production Guru test account, run the authenticated smoke flow, then mark `feat-009` completed. Leave `feat-010` not started.
