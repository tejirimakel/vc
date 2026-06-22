# TheValueChain — Full-App Audit & Remediation Design

**Date:** 2026-06-11
**Scope:** Whole application (`app/`, `components/`, `lib/`, `middleware.js`, `next.config.js`, `public/sw.js`, `public/manifest.json`).
**Stack:** Next.js 15 (App Router) · React 19 · Tailwind 4 · react-pdf/pdfjs · hls.js · Swiper. PWA delivering public news / e-copy PDFs / YouTube video / HLS live stream, behind a soft "app access" cookie gate.

---

## 1. Context & guiding decision

The app surfaces content (WordPress news, e-copy PDFs, YouTube) that is **already public** on `thevaluechainng.com` and YouTube. There is no confidential data.

**Decision — the access gate is a soft "install nudge", not security.** The `tvc_pwa_access` cookie is treated as an app-session marker that keeps the installed-PWA experience distinct and redirects non-installed visitors to the landing page. We keep the mechanism, remove the security framing, and apply only cheap hardening. Real identity-based gating is explicitly **out of scope** unless genuinely subscriber-only content is introduced later (that would be a separate sub-project: accounts, sessions, identity).

This decision de-scopes any auth redesign and focuses the work on hygiene, correctness, DRY, and performance.

---

## 2. Findings (the audit)

Severity: 🔴 security · 🟠 dead code / hygiene · 🟡 correctness & DRY · 🟢 performance.

### 🔴 Security
1. **Access gate is not authentication.** `lib/pwaAccess.js` HMACs only `v1.<timestamp>` — no identity. Any client can mint a 30-day cookie by POSTing `/api/pwa/access` with header `x-tvc-pwa-launch: standalone`; the Origin + static header checks are forgeable by non-browser clients. **Resolution: accept as soft gate (see §1); strip security framing.**
2. **`Origin: 'null'` accepted** in `getAllowedOrigin` (`app/api/pwa/access/route.js`). Widens CSRF surface (sandboxed iframes / `file://`). Remove.
3. **CSP ships `'unsafe-inline'` + `'unsafe-eval'` in `script-src`** (`next.config.js`). Defeats most CSP XSS value. `unsafe-eval` is only needed by the pdf.js worker. Tighten (nonce for inline, scope eval) — **best-effort, Phase 4**, highest break risk.
4. **PDF proxy has no timeout / size cap** (`app/api/pdf/route.js`). Add `AbortController` timeout + max-bytes ceiling.
5. **Secret overloading.** `getAccessSecret` falls back to `REVALIDATION_SECRET`, coupling two unrelated trust boundaries. Separate.

### 🟠 Dead code / hygiene
6. **Six committed `" 2.js"` duplicate files** (Finder/iCloud conflict copies): `app/page 2.js`, `app/mobile/page 2.js`, `app/ecopy/page 2.js`, `app/ecopy/[id]/page 2.js`, `app/news/[id]/page 2.js`, `components/protectedRoutes 2.js`. Stale forks; the only importer of `PdfViewerComponent`. Delete all six.
7. **`ProtectedRoutes` is a no-op** (`components/protectedRoutes.js` returns `children`). Eight pages wrap in it believing they are protected; all real routing protection is in `middleware.js`. Make it a real client-side 401 guard or remove it.
8. **Redux Toolkit + react-redux installed but unused** (no store/slice/selector). Remove deps.
9. **`AppReadyProvider` has no consumers** (`useAppReady` never imported). Remove from `layout.js` and delete.
10. **`PdfViewerComponent` is dead** (only the stray `" 2.js"` referenced it). Delete after #6.

### 🟡 Correctness & DRY
11. **`cleanText` / `makeExcerpt` / `cutTitle` / `getParagraphs` / `formatDate` are copy-pasted across 4 files** with subtly different implementations. Extract to `lib/text.js` + `lib/format.js`.
12. **Excerpt ellipsis bug:** `app/mobile/page.js` `makeExcerpt` slices 10 words but only appends `"..."` when `words.length > 16`, so 11–16-word excerpts are truncated without an ellipsis. Slice limit and threshold must match.
13. **Per-page fetch boilerplate duplicated** (`loading/error/retryCount + useEffect`). Extract a `useFetch` hook; dedupe the two independent `/api/news` full-feed fetches (`/mobile` + `/news`).
14. **PWA-access POST duplicated 3×** with drift (`mobileRed.js`, `OpenAppBtn.jsx`, `pwa-launch/page.js`). Extract `lib/pwaClient.js#requestPwaAccess()`.
15. **Protected-prefix lists maintained in two places** (`middleware.js`, `public/sw.js`) — manual sync = drift risk. Middleware imports a shared const; SW keeps a documented mirror (separate bundle, cannot import).
16. **Video pagination edge case:** `app/video/page.js` computes `Math.ceil(0/6)=0` → "Page 1 of 0" when empty; no retry button on error (every other page has one). Bring to parity with the `Math.max(1, …)` + retry pattern.
17. **Stream type detection** via `streamUrl.includes('.m3u8')` breaks on query strings / signed URLs. Parse `new URL(streamUrl).pathname` instead.

### 🟢 Performance
18. **Both pdf workers shipped** — `pdf.worker.js` (2.2 MB) and `pdf.worker.min.mjs` (1 MB); `lib/pdfConfig.js` points at the **non-minified** one. Switch to min, delete the larger.
19. **~18 MB of oversized PNGs** in `/public` (`25/26/27/28.png`, 4–5 MB each). Re-compress to display size. **Flagged: own task — modifies binary assets, needs an image tool (sharp/squoosh).**
20. **Six live YouTube `<iframe>`s render at once** (`app/video/page.js`). Replace with thumbnail facade + click-to-load (thumbnails already proxied/cached by SW; `next.config.js` now allows `img.youtube.com`/`i.ytimg.com`). TTI + privacy win.
21. **Mixed icon packages** (`io5`, `io`, `fa`, `ci`, `bs`, `md`) — consolidate where trivial. Optional/opportunistic.

---

## 3. Remediation plan (phased)

Phases are ordered by risk-adjusted value; each is independently shippable. Earlier phases de-risk later ones (e.g. Phase 2 extraction prevents recurrence of the Phase 1 bug class).

### Phase 0 — Hygiene (zero behavior change)
- Delete the six `" 2.js"` files (#6).
- Delete `PdfViewerComponent` (#10).
- Remove `AppReadyProvider`; unwrap `layout.js` (#9).
- Remove `@reduxjs/toolkit` + `react-redux` from `package.json` (#8).
- `lib/pdfConfig.js` → `/pdf.worker.min.mjs`; delete `public/pdf.worker.js` (#18).

### Phase 1 — Correctness bugs
- Fix excerpt ellipsis threshold (#12).
- Video empty-state pagination + retry-button parity (#16).
- Stream `.m3u8` detection via pathname (#17).

### Phase 2 — DRY extraction
- `lib/text.js` (`cleanText`, `makeExcerpt`, `cutTitle`, `getParagraphs`) + `lib/format.js` (`formatDate`); refactor the 4 pages (#11).
- `lib/pwaClient.js#requestPwaAccess()`; refactor 3 callers (#14).
- Shared protected-prefix constant imported by `middleware.js`; documented mirror in `sw.js` (#15).
- `useFetch` hook; refactor pages; dedupe news fetch (#13).

### Phase 3 — Security hardening (soft-gate model)
- Remove `Origin:'null'` (#2).
- Split access secret from revalidation secret (#5).
- PDF proxy: `AbortController` timeout + max-bytes cap (#4).
- Reframe `ProtectedRoutes`: real client 401 guard, or delete and rely on middleware (#7).

### Phase 4 — Performance (some flagged)
- YouTube thumbnail facade / click-to-load (#20).
- CSP tightening — **best-effort, highest break risk, test locally** (#3).
- PNG re-compression — **own task, binary assets** (#19).
- Icon consolidation — opportunistic (#21).

---

### ⚙️ CI / GitHub Actions (audited 2026-06-11, fixed in commit d7806ca)

22. **`dependency-audit.yml` outdated job silently never works.** `OUTPUT=$(npm outdated --json … || echo '{}')` concatenates two JSON values when packages are outdated (npm prints JSON *and* exits 1), so `jq` returns a 2-line count and the `JSON.parse` in the issue-creation step throws → the outdated-deps issue is never opened. Reproduced and fixed (capture stdout to file directly).
23. **`dependency-audit.yml` audit report corruption.** `npm audit --json > audit-report.json 2>&1` lets npm stderr warnings pollute the JSON → jq + the PR-comment `JSON.parse` can break. Changed to `2>/dev/null`.
24. **`security.yml` CodeQL runs `autobuild` for JS/TS** — unnecessary (no compilation) and a failure source. Replaced with `build-mode: none`.
25. **`security.yml` audit-summary redirect reversed** — `npm audit 2>&1 >> $SUMMARY` leaves stderr on the console; corrected to `>> $SUMMARY 2>&1`.
26. **`lighthouse.yml` audited gated routes.** `.lighthouserc.js` listed `/news` and `/ecopy`, which `middleware.js` redirects to `/?access=required` for unauthenticated CI runs — Lighthouse scored the redirect target. Restricted to public routes (`/`, `/offline`). *Trade-off: protected content pages are no longer perf-audited in CI; revisit with a seeded access cookie if that coverage is wanted.*

## 4. Out of scope
- Identity / accounts / real paywall (revisit only if subscriber-only content is introduced).
- Backend/WordPress changes.
- Visual redesign beyond aligning the `video` page with the existing red theme.

## 4a. Remediation status (updated 2026-06-21)

- **Phase 0 (hygiene)** — done (commit 6103268).
- **Phase 1 (correctness)** — done (commit 2e26eab).
- **Phase 2 (DRY)** — done. `lib/text.js`, `lib/format.js`, `lib/useFetch.js`,
  `lib/pwaClient.js`, `lib/protectedRoutes.js` extracted; five pages + four PWA-access
  callers refactored; dead `app/actions.ts` deleted.
- **Phase 3 (security)** — done. Dropped `Origin: 'null'`; split access secret from
  `REVALIDATION_SECRET`; PDF proxy gained a 10s timeout + 50 MB streaming cap; the no-op
  `ProtectedRoutes` component was deleted and its importers unwrapped.
- **Phase 4 (performance)** — done. `25.png`/`27.png` were unreferenced dead assets
  (deleted, ~9.8 MB); `2.png`/`26.png` re-encoded to WebP (0.57 MB→40 KB, 3.87 MB→60 KB)
  and the secondary mockup dropped `priority`. CSP `script-src` dropped `'unsafe-eval'`
  (pdf.js now runs with `isEvalSupported:false`); `'unsafe-inline'` kept (needs a Next
  nonce pipeline to remove). YouTube facade item (#20) was already satisfied — only the
  selected video is a live iframe.

### New findings beyond the original audit (fixed 2026-06-21)
- **Service-worker caching was unreachable.** The protected-API branch returned
  network-only before the SWR/CacheFirst branches, so no API JSON or PDF was ever cached
  and the offline page's "Saved articles" promise never held. Router reordered: `/api/pdf`
  CacheFirst, `/api/news|ecopy|youtube` SWR, `/api/stream` network-only; caches bumped to v3.
- **Video titles rendered raw HTML entities** — the page's local `cleanText` omitted
  `he.decode`; fixed by the shared helper.
- PWA-access POST was duplicated **4×** (not 3) — all now call `requestPwaAccess`.
- `app/actions.ts` was dead and was removed.

## 5. Success criteria
- `next build` + `next lint` clean after each phase.
- No `" 2.js"` files, no unused deps, no dead modules.
- Shared text/format/pwa helpers are single-sourced; the four pages import them.
- Each behavioral change verified by running the affected route.
- Net repo size reduced (workers + PNGs).
