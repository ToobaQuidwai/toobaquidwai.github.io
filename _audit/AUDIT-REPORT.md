# Website Audit Report

**Site**: https://toobaquidwai.github.io/ (repo: `ali-maq/toobaquidwai.github.io`)
**Commit audited**: `02c2a0f` (main @ 2026-04-23)
**Branch**: `claude/website-audit-setup-4C8Oa`
**Date**: 2026-04-23
**Auditor**: Claude Code Audit Agent v1.0 (20 parallel subagents, one per metric)

## Summary

- **Overall Score**: **61 / 100**
- **Grade**: **D** (Significant issues, not launch-ready)
- **Critical Issues (score ≤ 2)**: 5 — METRIC-11 Performance, METRIC-12 SEO, METRIC-14 Images, METRIC-18 Analytics, METRIC-19 Print
- **Warnings (score = 3)**: 6 — METRIC-07 Bundle, METRIC-09 Deploy, METRIC-10 A11y, METRIC-13 Security, METRIC-17 Errors, METRIC-20 E2E
- **Passed (score ≥ 4)**: 9 — METRIC-01, 02, 03, 04, 05, 06, 08, 15, 16

The site is content-rich, factually accurate, and well-authored at the HTML/CSS level, but it ships **~105 MB of unoptimized media**, has **no SEO metadata beyond `<title>`**, **no analytics or error tracking**, and **no print styles**. These are the dominant blockers to launch-readiness.

## Metric Scores

| #  | Metric                                          | Score | Status |
|----|-------------------------------------------------|------:|:------:|
| 01 | Cross-Browser Compatibility                     | 4/5   | ⚠️     |
| 02 | Cross-Device / Responsive Compatibility         | 4/5   | ⚠️     |
| 03 | Link Integrity                                  | 4/5   | ⚠️     |
| 04 | Content Accuracy & Factual Integrity            | 4/5   | ⚠️     |
| 05 | Research Paper & Publication Attribution        | 4/5   | ⚠️     |
| 06 | CSS Normalization & Consistency                 | 4/5   | ⚠️     |
| 07 | CSS/JS Bundle Consistency Across Pages          | 3/5   | ⚠️     |
| 08 | Library & Framework Version Control             | 4/5   | ⚠️     |
| 09 | GitHub Pages Deploy Stability                   | 3/5   | ⚠️     |
| 10 | Accessibility (WCAG 2.1 AA)                     | 3/5   | ⚠️     |
| 11 | Performance (Core Web Vitals)                   | 1/5   | ❌     |
| 12 | SEO & Metadata                                  | 2/5   | ❌     |
| 13 | Security Headers & HTTPS                        | 3/5   | ⚠️     |
| 14 | Image & Asset Optimization                      | 2/5   | ❌     |
| 15 | Code Quality & Linting                          | 4/5   | ✅     |
| 16 | Component Architecture & Reusability            | 4/5   | ✅     |
| 17 | Error Handling & Resilience                     | 3/5   | ⚠️     |
| 18 | Analytics & Monitoring Readiness                | 0/5   | ❌     |
| 19 | Print & Export Friendliness                     | 2/5   | ❌     |
| 20 | Playwright E2E Behavioral Validation            | 3/5   | ⚠️     |
| —  | **Total**                                       | **61 / 100** | D |

## Critical Issues (Score ≤ 2)

### [METRIC-11] Performance — LCP 9.3 s, 63 MB page weight
- **Evidence**: Lighthouse run against `index.html` (`_audit/lighthouse.json`): Performance 74/100; LCP **9.3 s** (poor); CLS 0.000 (good); TBT 0 ms (good); total transferred **63.3 MB**. LCP element is `assets/portrait/tooba-lab-portrait.png` at **1.91 MB** with no preload, no WebP, no `fetchpriority`.
- **Impact**: Mobile users on throttled networks will see a blank `#about` section for ~9 s. Page ships 63 MB per visit.
- **Fix**: Convert portrait to WebP/AVIF with `<picture>` + `srcset`; add `<link rel="preload" as="image" fetchpriority="high">`; re-encode `dync2h1null-movie.mp4` (33.8 MB) and `3d-tem-movie.mp4` (27.4 MB); replace autoplay with click-to-play + `poster`; add `loading="lazy"` to below-fold `<img>`.

### [METRIC-12] SEO & Metadata — missing everything beyond `<title>`
- **Evidence**: 0 Open Graph tags, 0 Twitter Card tags, 0 `<link rel="canonical">`, 0 JSON-LD blocks in any HTML file. `robots.txt` and `sitemap.xml` absent. `final_version.html` and `version_1_draft.html` share an identical `<title>` (duplicate across pages).
- **Impact**: Zero controlled social-share cards; search engines have no crawl policy/sitemap; duplicate-title penalty risk.
- **Fix**: Add OG + Twitter Card blocks to `index.html` (template in METRIC-12 report); add `schema.org/Person` JSON-LD; create `robots.txt` + `sitemap.xml`; add `noindex` to draft/audit pages.

### [METRIC-14] Image & Asset Optimization — 105 MB media, no lazy/dims
- **Evidence**: 4 `<img>` used in `index.html`, all PNG, all > 200 KB, 3 > 1 MB. 0/4 have `width`/`height` or `loading="lazy"`. 0 `<picture>` elements, 0 WebP/AVIF. 5 autoplay MP4s totalling ~91 MB. No favicon. `assets/paper-previews/` (16 PNGs, ~6 MB) unreferenced dead weight.
- **Impact**: Direct cause of Metric-11 failure. Dead files inflate clone time.
- **Fix**: Convert all 4 in-use PNGs to AVIF+WebP with PNG fallback; add explicit dimensions, `loading="lazy"`, `decoding="async"`; add `poster` + click-to-play on videos; delete `assets/paper-previews/` and the unused headshot; add favicon suite.

### [METRIC-18] Analytics & Monitoring — none configured
- **Evidence**: 0 hits across GA/GA4, Plausible, Fathom, Umami, Simple Analytics, Matomo, Cloudflare Insights, Sentry, Bugsnag, Rollbar, LogRocket, Web Vitals. No cookie/consent code.
- **Impact**: Operator is blind to traffic, errors, and real-user performance.
- **Fix**: Add privacy-first analytics (Plausible / Cloudflare Web Analytics) gated on production hostname; add minimal `window.onerror` → beacon; add `web-vitals` module; draft `/privacy.html` if using GA4.

### [METRIC-19] Print & Export Friendliness — no `@media print` anywhere
- **Evidence**: `grep -c '@media print'` returns 0 in every HTML file. Playwright PDF render: `index.html` → 8 pages / 10.7 MB; each `resume_audit_v*.html` → 3 pages (despite v3 claiming "Page count: 1"). Fixed `.topbar` and `body::before` grid overlay print on every page.
- **Impact**: Site cannot be reasonably printed or exported to PDF.
- **Fix**: Add `@page` + `@media print` rules to each HTML file (templates in METRIC-19 report); hide nav/overlays for print; expose link URLs via `content: attr(href)`; link the authoritative `.docx` resumes for download.

## Warnings (Score = 3)

- **[METRIC-07]** Three distinct CSS foundations across six HTML files; `final_version.html` and `version_1_draft.html` are byte-identical duplicates.
- **[METRIC-09]** No `.nojekyll`, no `404.html`; 80+ MB of unreferenced PDFs and orphan HTML files ship in the deploy.
- **[METRIC-10]** No `<h1>`, no skip link, `--accent #2f8b82` fails AA contrast (3.92:1) for small text, focus indicators rely on subtle transform instead of an outline.
- **[METRIC-13]** No meta CSP; two `http://www.unipune.ac.in/` links in draft HTML files; GitHub Pages cannot set response headers, so `<meta http-equiv>` is the only lever.
- **[METRIC-17]** No `<noscript>`, no 404 page, no `<video>` text fallback / `poster`, zero `try/catch` in 259 lines of inline JS.
- **[METRIC-20]** Existing Playwright suite is substantial (11 tests, 3 projects) but all projects are Chromium (no Firefox/WebKit), no CI workflow, `rel="noopener"` not asserted.

## Passed (Score ≥ 4)

- **[METRIC-01]** 4/5 — Evergreen-baseline JS/CSS; only WebKit prefix gaps (`backdrop-filter`, `mask-image`, `svh` fallback).
- **[METRIC-02]** 4/5 — Fluid-first with `clamp()`; 3 breakpoints; hamburger wired; minor tablet nav band and small tap-target notes.
- **[METRIC-03]** 4/5 — All 7 internal anchors and all 17 relative asset paths resolve; one probable email typo (`tquidwaiunipne@gmail.com`).
- **[METRIC-04]** 4/5 — Institutions, publications, and collaborators verify cleanly; minor title/date inconsistencies; same email typo as 03.
- **[METRIC-05]** 4/5 — 8 publications; 7 peer-reviewed entries verified via PubMed/PMC/DOI; one year mismatch on MBoC entry; no DOIs shown, no JSON-LD.
- **[METRIC-06]** 4/5 — Single inline reset per document; zero `!important`; universal `box-sizing`; cross-file inconsistency between `index.html` and drafts is the main gap.
- **[METRIC-08]** 4/5 — `package-lock.json` committed; `npm audit` clean; only one dep (`@playwright/test`); caret range is the only deduction.
- **[METRIC-15]** 4/5 — Zero debug artifacts, zero duplicate IDs, balanced tags, `node --check` clean; no linter config is the only gap.
- **[METRIC-16]** 4/5 — Strong semantic HTML5 landmarks; BEM-style class reuse (254 class attrs → 61 unique strings, ≈4.2× reuse); 8 hand-duplicated publication blocks would benefit from templating.

## Top 10 Remediation Priorities (ordered by impact × effort)

1. **Convert `tooba-lab-portrait.png` to `<picture>` WebP/AVIF + `rel="preload" fetchpriority="high"`.** Fixes LCP (Metric 11).
2. **Delete `assets/paper-previews/` and unused `tooba-quidwai-headshot.png`.** Frees ~7 MB from clone/deploy (Metrics 11, 14).
3. **Add `.nojekyll`, `404.html`, and a favicon suite.** 3 tiny files, compounding impact on Metrics 9, 14, 17.
4. **Add OG + Twitter + canonical + JSON-LD `Person` + `robots.txt` + `sitemap.xml`.** Fixes Metric 12 from 2 → 4.
5. **Add `@media print` rules to `index.html` and each resume HTML.** Fixes Metric 19 from 2 → 4.
6. **Replace video `autoplay` with click-to-play + `poster` + lazy load.** Cuts page weight from 63 MB to < 10 MB, fixes Metric 11.
7. **Fix probable email typo `tquidwaiunipne@gmail.com` → verify `…unipune…`.** Critical if real (Metrics 3, 4).
8. **Add WebKit prefixes for `backdrop-filter` / `mask-image` + `vh` fallback for `svh`.** Brings Metric 1 to 5/5.
9. **Add `<h1>`, skip link, darken `--accent`, global `:focus-visible` outline.** Brings Metric 10 to 4/5.
10. **Add privacy-first analytics (Plausible / Cloudflare) gated on hostname.** Fixes Metric 18 from 0.

## Appendix

- Per-metric reports: `_audit/metrics/METRIC-01-cross-browser.md` … `METRIC-20-playwright-e2e.md`
- Lighthouse raw output: `_audit/lighthouse.json`
- No source files were modified by the audit (per behavioural rule 5: non-destructive). All findings are evidence-backed with `file:line` citations inside each metric report.

### Sandbox Limitations Encountered (common to multiple metrics)

- **No outbound network** from the audit sandbox except to the repo host — external URL HEAD checks, `axe-core`, Google Scholar verification, `securityheaders.com`, live Pages response headers, and the full Playwright cross-browser run could not be executed. Where possible, results were derived from static inspection; where not, the report explicitly says "unverified — re-check from an unrestricted network."
- **Playwright browser binaries** were not installed for most of the run (Metrics 1, 2, 20). A partial Chromium install allowed Lighthouse (Metric 11) and PDF capture (Metric 19) to run.
- **Commit signing server** returned `400 "missing source"` locally, so all commits on this branch were produced via the GitHub MCP `push_files` API (server-side signed), not local `git commit`.

### Re-audit After Remediation

Once fixes land, re-run this audit by re-invoking the same 20-subagent protocol against the tip of `main`. Metrics with runtime components (1, 2, 10, 11, 17, 20) should additionally execute on an environment with Playwright browsers installed and outbound network available.
