---
date: 2026-10-24
type: reference
tags: [uzma-course, seo, ai-search, backlog]
---

# Local SEO and AI Search Backlog

## Status and resume boundary

- Tracker: `feat-013`, pending; audit completed, implementation deferred at the user's request.
- This is a backlog and audit handoff, not an approved design or implementation plan.
- No product code, CMS content, production data, Google profiles, hosting settings, or DNS was changed during the audit or this handoff.
- Collect the [owner clarifications](seo-owner-clarifications.txt), then wait for the user's explicit request to resume. Receiving answers alone does not authorize implementation.
- Preserve the unrelated `feat-012` user-guide work and its existing implementation ledger.

## Requested goals

1. Improve relevant Google visibility for "les baca" in Sidoarjo, Krian, Wonoayu, Balongbendo, Mojokerto, and Mojosari, including location-dependent "les baca terdekat" searches.
2. Improve visibility for "les baca tulis hitung" / calistung, accurately explaining the actual reading, writing, and arithmetic services.
3. Strengthen discovery of the "Uzma Course" brand and its relationship to Ahe SumoWangi, AHE Sumokembangsri, and AHE Junwangi.
4. Improve eligibility and useful coverage in AI search, including Google AI Overviews/AI Mode and ChatGPT search; do not promise placement, citations, or first-page rankings.

## Audit evidence snapshot

Observed on 2026-10-24; recheck mutable external facts when implementation resumes, not as a prerequisite to sending the owner checklist.

- `https://uzmacourse.com/` returned HTTP 200, with server-rendered headings, program content, branch addresses, metadata, a canonical URL, and parseable organization/local-business and FAQ JSON-LD. No homepage `noindex` was observed.
- `https://uzmacourse.com/robots.txt` permits public crawling. Probes using Googlebot and OAI-SearchBot user-agent strings returned HTTP 200; this does not establish access from those services' actual crawler IPs.
- `https://uzmacourse.com/sitemap.xml` listed only the homepage. The public route inventory had no dedicated program or branch SEO pages.
- A direct Google first-page sample for "les baca balongbendo" showed the homepage in organic results, mentioned Uzma Course in an AI Overview, and showed the Sumokembangsri business in local results.
- The website was not seen in captured first-page samples for "les baca sidoarjo", "les baca krian", "les baca wonoayu", "les baca mojokerto", "les baca mojosari", and "les baca tulis hitung". This is not evidence of deindexing or a stable rank.
- The "uzma course" sample showed the business's Instagram, but not its homepage as a regular website result. The AI response was not fully settled, so no brand-query AI inclusion/exclusion claim is made.
- Further Google queries encountered a CAPTCHA; no bypass was attempted. No reliable fixed ranking was established for "terdekat". Search results used an Indonesian locale and showed a Sidoarjo-area IP location, not controlled measurements at every parent location.
- The Sumokembangsri Maps listing offered "Add website". The Junwangi listing offered additions for website, phone, and opening hours. Public claim prompts do not establish private account ownership.
- `https://www.uzmacourse.com/` failed hostname certificate validation. OpenSSL showed a certificate with `DNS:uzmacourse.com` only. The apex hostname remained accessible; the exact Vercel/DNS configuration was not inspected.
- Published facts need owner confirmation: FAQ maximum five children per class versus program-specific ratios of two per teacher or one-to-one; Why Us also mentions a 1:4 arithmetic format; AHE age card 4-7 versus FAQ entry from 3.5; SD catalog versus SMP mentions elsewhere.
- Wonoayu, Mojokerto, and Mojosari were absent from the visible homepage text. This alone is not a ranking diagnosis; actual geographic relevance must be established before adding coverage.
- Browser checks at 360px, 375px, and 1280px showed no document horizontal overflow; inspected primary WhatsApp/registration CTAs remained in bounds. No field Core Web Vitals claim is made.
- Search Console ownership, private index/performance reports, AI inclusion settings, hosting administration, and Google Business Profile ownership were not inspected.

## Deferred TODOs

Recommended order only; scope and content must be agreed when the user resumes.

- [ ] **SEO-01 - Owner facts and authorization:** Obtain confirmed answers to the owner checklist. Separate verified facts, unknowns, and decisions; never infer branches, prices, enrollment ages, credentials, or testimonials.
- [ ] **SEO-02 - Existing Maps profiles:** Verify authorized management of both existing listings; complete website/contact/hours/services and accurate business details. Link to the homepage initially or the appropriate branch page once available. Do not create duplicate profiles or keyword-stuffed business names.
- [ ] **SEO-03 - Hostname TLS and redirect:** Inspect Vercel/DNS mapping for `www`, provision a certificate covering that hostname, then permanently redirect to the canonical HTTPS apex. Application redirects cannot repair a TLS hostname failure before HTTP.
- [ ] **SEO-04 - Public fact consistency:** Reconcile entry age, teacher-to-student ratios, class/session terminology, durations, frequency, trial terms, fees, and active SD/SMP scope across CMS content, program records, metadata, and JSON-LD using the correct source of truth.
- [ ] **SEO-05 - Brand and homepage relevance:** Describe the confirmed brand/unit relationship consistently. Make the homepage's main heading and service/location copy clearer without unnatural keyword lists or unsupported claims.
- [ ] **SEO-06 - Reading/writing/arithmetic page:** Agree and publish a useful dedicated page explaining the real AHE and ASE services, whether they are separate or bundled, eligibility, methods, sessions, trial/fees, branch availability, FAQs, and a relevant WhatsApp action. URL remains a builder proposal until scope approval.
- [ ] **SEO-07 - Real branch pages:** Agree and publish distinct Junwangi-Krian and Sumokembangsri-Balongbendo pages with verified addresses, hours, maps/directions, programs, consented photos, and contact information. Do not imply other physical branches exist.
- [ ] **SEO-08 - Page discovery and metadata:** Give every new public page its own title, description, canonical URL, appropriate social metadata, crawlable internal links, and sitemap entry. Prevent the current root-layout canonical from being inherited incorrectly by new pages; keep private portals out of public indexing.
- [ ] **SEO-09 - Structured data:** Add stable organization/branch identifiers and accurate branch URLs, addresses, map links, coordinates, and hours where verified and visible. Keep markup consistent with content; do not invent ratings, reviews, prices, or special AI schema.
- [ ] **SEO-10 - Honest regional coverage:** Decide actual coverage and priority for Sidoarjo, Krian, Wonoayu, Balongbendo, Mojokerto (city/regency distinction), and Mojosari. Explain attendance at real branches or other genuinely offered delivery modes; no fake offices, near-duplicate city pages, or unsupported travel claims.
- [ ] **SEO-11 - AI access and measurement:** Verify Search Console property ownership, URL Inspection, sitemap processing, Search generative AI inclusion, and the available Generative AI performance report. Maintain search-crawler access and check relevant hosting restrictions/logs where authorized. Keep OAI-SearchBot search access separate from GPTBot training policy; do not prioritize `llms.txt` for Google visibility.
- [ ] **SEO-12 - Authentic supporting content:** Use owner-approved teaching explanations, actual qualifications/licensing, and genuine consented photos/testimonials. Avoid generic mass-generated articles, paid/invented mentions, and guaranteed learning outcomes. Publishing cadence/content beyond the initial pages requires agreed scope.
- [ ] **SEO-13 - End-to-end verification and outcomes:** Exercise deployed URLs, valid HTTPS/redirects, crawler-readable HTML, per-page metadata/canonicals, sitemap and internal links, truthful schema, Maps destinations, WhatsApp actions, and mobile/desktop layouts. Establish a baseline for the requested query groups, AI impressions where reported, Maps actions, and qualified inquiries/trial bookings. WhatsApp clicks are not completed enrollments; tracking changes require agreed scope.

## Resume instructions

1. Read this backlog, `docs/seo-owner-clarifications.txt`, the owner's answers, and current project handoff; preserve unrelated ongoing work.
2. Recheck the external findings affected by elapsed time and inspect current code/configuration before choosing changes.
3. Distinguish owner decisions from recommendations: first focus on brand plus the actual Krian/Balongbendo branches is a recommendation, not an owner-approved priority.
4. Agree the complete implementation scope/design and then prepare the implementation plan. Do not treat this checklist as implementation approval.
5. Verify the changed paths and update this backlog, `feature_list.json`, `progress.md`, and `session-handoff.md` with actual results.

## Evidence links and official guidance

- Website: https://uzmacourse.com/
- Sumokembangsri Maps: https://maps.app.goo.gl/qaJuRjZcDDTv4qQx9
- Junwangi Maps: https://maps.app.goo.gl/KWoXUAYNvVJTYs5r5
- Google local ranking: https://support.google.com/business/answer/7091
- Google AI optimization: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Search generative AI control: https://support.google.com/webmasters/answer/16908024
- Generative AI performance report: https://support.google.com/webmasters/answer/16984139
- OpenAI search/training crawler distinctions: https://developers.openai.com/api/docs/bots.md
- Google doorway policy: https://developers.google.com/search/docs/essentials/spam-policies#doorway-abuse
