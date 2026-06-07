# Code Review

Date: 2026-06-07

## Scope

[Certain] Reviewed the tracked Next.js app files plus visible ignored workspace artifacts that affect local behavior: `.env`, `.env.local`, `.next`, `node_modules`, `.DS_Store`, `next-env.d.ts`, and `tsconfig.tsbuildinfo`.

[Certain] Secret values from `.env` and `.env.local` were not copied into this document. Only variable names were considered.

[Likely] Generated files and binary assets should be reviewed by provenance, size, cache behavior, and usage, not by manually interpreting every bundled line.

## Current Evidence

[Certain] `npm run lint` passed with no warnings or errors. It still warns that `next lint` is deprecated.

[Certain] `npx tsc --noEmit --pretty false` passed.

[Certain] `npm run build` passed and generated 16 app routes.

[Certain] `npm audit --audit-level=moderate` now reports `found 0 vulnerabilities`.

[Certain] `npm ls postcss next @vercel/analytics` shows `next@15.5.19` using `postcss@8.5.15`.

## Fixed In This Pass

### Dependency Audit

[Certain] `package.json:40-42` adds a global npm override forcing `postcss@8.5.15`.

[Certain] `package-lock.json` no longer contains `node_modules/next/node_modules/postcss@8.4.31`.

[Certain] `npm audit --audit-level=moderate` now passes with 0 vulnerabilities.

[Likely] This is the least disruptive fix because `next@16.2.7` still declares `postcss@8.4.31`, so a framework upgrade alone would not have removed this advisory today.

### Route Protection Model

[Certain] `lib/pwaAccess.js` now creates and verifies signed PWA access tokens using HMAC SHA-256.

[Certain] `app/api/pwa/access/route.js` issues an HttpOnly `tvc_pwa_access` cookie after a same-origin launch request with an expected PWA launch-intent header.

[Certain] `middleware.js` now protects `/mobile`, `/news`, `/ecopy`, `/video`, `/stream`, and the matching content API routes before page/API code runs.

[Certain] `components/protectedRoutes.js` no longer makes client-side access decisions; it only preserves the existing component wrapper API.

[Certain] `components/splash.js` no longer writes `app_access` to `localStorage`.

[Certain] `public/sw.js` no longer precaches `/mobile`, and protected pages/APIs bypass service-worker cache so middleware remains authoritative.

[Likely] This is stronger than the old `localStorage` and query-string gate, but it is not full user authentication. Browsers do not send a cryptographic proof that a request came from an installed PWA. Truly private content still needs login, membership, or another trusted server-side entitlement.

## Remaining Highest-Risk Findings

### 1. Content Security Policy Is Too Broad For Production

[Certain] `next.config.js:5` allows both `'unsafe-inline'` and `'unsafe-eval'` for scripts.

[Certain] `next.config.js:8-10` allows broad image, media, and connection sources.

[Likely] Next.js often needs relaxed script policy during development, but production should use a tighter CSP with nonces or hashes, and remove `'unsafe-eval'` unless a measured production dependency requires it.

Risk: XSS impact is larger than it needs to be if any injection bug appears later.

### 2. Revalidation Endpoint Needs Stricter Input Limits

[Certain] `app/api/pwa/revalidate/route.ts:20-28` uses a timing-safe secret comparison.

[Certain] `app/api/pwa/revalidate/route.ts:30-35` revalidates every submitted tag and URL without validating shape, size, or allowlist.

[Likely] Add an allowlist for paths and tags, cap array lengths, reject non-string values before casting, and return counts of accepted/rejected entries.

Risk: if the secret leaks, an attacker can trigger broad cache churn or expensive invalidation.

### 3. Remote Content Inputs Need More Shape Validation

[Certain] `app/api/news/route.js:19` interpolates `id` into a remote URL path without `encodeURIComponent` or a strict ID pattern.

[Certain] `app/api/stream/route.js:1-6` returns `STREAM_URL` to the client without validating protocol, host, or media type.

[Certain] `app/api/pdf/route.js:24-40` proxies an allowlisted URL but does not verify response `Content-Type`, response size, or timeout behavior.

[Certain] `app/api/youtube/route.js:31-47` trusts parsed feed IDs when constructing YouTube links and embed IDs.

[Likely] Add normalization at API boundaries so pages receive predictable objects: string lengths, URL protocols, allowed hosts, valid date strings, and required IDs.

Risk: bad upstream data or misconfiguration can cause broken rendering, excessive downloads, or unsafe embeds.

### 4. Service Worker Caches Are Still Unbounded

[Certain] `public/sw.js:64-72` stores successful cache-first responses without a size cap.

[Certain] `public/sw.js:79-90` can resolve to `null` when there is no cached response and the network request fails.

[Likely] Protected app data now bypasses cache, but public/static caches still need max-entry and max-age limits.

Risk: user devices can accumulate stale or large cached responses.

### 5. Heavy Client Rendering Hurts Mobile Performance

[Certain] `app/ecopy/[id]/page.js:73-81` renders every PDF page once `numPages` is known.

[Certain] `app/video/page.js:76-92` renders up to six YouTube iframes at a time.

[Certain] `app/mobile/page.js:138-167` loads a Swiper carousel and autoplay module on the mobile home route.

[Likely] Render PDFs with pagination or virtualization, show video thumbnails before loading iframes, and split heavy UI libraries from routes that do not need them.

Risk: slow first interaction, high memory use, and poor performance on low-end mobile devices.

### 6. Feed APIs Are Not Scalable Yet

[Certain] `app/api/news/route.js:48-75` fetches the whole WordPress response, sorts it in memory, and slices the first 10 posts.

[Certain] `app/api/ecopy/route.js:33-54` fetches the full e-copy data array, filters it in memory, and sorts it.

[Likely] Push pagination, field selection, sorting, and category filtering upstream when the APIs support it.

Risk: API latency and memory use grow with the source datasets.

### 7. Current Lint Setup Will Break During Migration

[Certain] `package.json:9` runs `next lint`, and the command warns it is deprecated for Next.js 16.

[Likely] Add flat-config ignores for `.next/**`, `node_modules/**`, generated workers, and build artifacts before changing the script to `eslint .`.

Risk: the project appears clean under `next lint` but can fail under the future supported command.

### 8. Unused Dependencies Increase Audit Surface

[Certain] Source search found no app usage of `@headlessui/react`, `@reduxjs/toolkit`, `react-redux`, or `react-tabs`.

[Likely] Remove unused dependencies if they are not planned for near-term work.

Risk: larger installs, more audit noise, and more upgrade work.

## Standards And Accessibility

[Certain] The app uses semantic landmarks in several places and gives accessible labels to many icon buttons.

[Certain] `components/nav.js:25-37` does not mark the active navigation link with `aria-current="page"`.

[Certain] `components/searchOverlay.js:40-44` declares a modal dialog but does not trap focus or restore focus to the trigger.

[Likely] Add focus management for the search dialog, visible focus styles on custom buttons, and `aria-current` on the active nav item.

## Suggested Priority Order

[Likely] First: set `PWA_ACCESS_SECRET` or `APP_ACCESS_SECRET` in production so the access cookie is signed with a dedicated secret instead of relying on `REVALIDATION_SECRET`.

[Likely] Second: harden API input validation and revalidation request limits.

[Likely] Third: add service-worker cache bounds and lazy-load heavy PDF/video experiences.

[Likely] Fourth: migrate from `next lint` to the ESLint CLI and remove unused dependencies.

## Command Results Summary

```text
npm run lint
Result: passed, with deprecation warning for next lint.

npx tsc --noEmit --pretty false
Result: passed.

npm audit --audit-level=moderate --cache /private/tmp/vc-npm-cache
Result: passed, found 0 vulnerabilities.

npm ls postcss next @vercel/analytics --cache /private/tmp/vc-npm-cache
Result: next@15.5.19 uses postcss@8.5.15.

npm run build
Result: passed. Warning remains: edge runtime disables static generation for one route.
```
