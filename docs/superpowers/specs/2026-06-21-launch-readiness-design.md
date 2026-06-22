# TheValueChain — Launch Readiness & Forward Roadmap

**Date:** 2026-06-21
**Scope:** Pre-launch readiness for the public PWA, plus the legal/data/security/operational landscape to track and the future improvements deferred beyond MVP.
**Stack:** Next.js 15 (App Router) · React 19 · Tailwind 4 · react-pdf/pdfjs · hls.js · Swiper. PWA surfacing public WordPress news, e-copy PDFs, YouTube video, and an HLS live stream, behind a soft "app access" cookie gate.
**Companion doc:** [`2026-06-11-app-audit-remediation-design.md`](./2026-06-11-app-audit-remediation-design.md) (the audit/hardening pass that precedes this).

> ⚠️ **Not legal advice.** This document maps the regimes, obligations, and standards to take to Nigerian counsel and a licensed Data Protection Compliance Organisation (DPCO). Treat all named thresholds and dates as "verify current" — they change.

---

## 1. Framing decisions (confirmed)

- **Purpose:** compliance / launch-readiness — covering legal, data, and operational bases before a public launch.
- **Audience & jurisdiction:** Nigeria-primary with a meaningful diaspora/international tail → **NDPA 2023** plus **GDPR / UK GDPR** both apply.
- **Monetization / accounts:** none planned for the next 6–18 months. No payments, no real auth, minimal PII. This keeps PCI, identity, and paywall work explicitly out of scope (see §9).
- **NBC online-broadcast licensing:** confirmed **not a concern** for the live stream — removed from scope.
- **Legal pages:** none exist today — greenfield; a core deliverable of this effort (§8).

**Key reframe:** "free + no accounts" is *not* zero-data. The app processes personal data in four quiet places — the `tvc_pwa_access` cookie, Vercel Analytics, embedded YouTube iframes (Google tracking), and server/IP logs on proxy routes. That is enough to trigger consent and privacy-policy obligations, especially for EU/UK diaspora readers. Compliance here is real but lightweight.

---

## 2. Legal & regulatory landscape

### Data protection
- **Nigeria Data Protection Act (NDPA) 2023**, enforced by the **Nigeria Data Protection Commission (NDPC)** (succeeds the NDPR 2019 regime under NITDA). Core duties even for a free app: a lawful basis for processing, a published privacy policy, data-subject-rights handling, and **breach notification to NDPC within 72 hours**.
- **NDPC registration / DPO determination / annual audit.** Under the NDPA's implementation directive (GAID 2025) and prior NDPR practice, organisations above defined data-subject-volume thresholds must register with NDPC, may need to appoint a **DPO**, and may need to **file an annual compliance audit** prepared by a licensed DPCO. A small free news site likely sits at the lower tier — **confirm the exact tier with a DPCO before launch.**
- **GDPR / UK GDPR (diaspora).** Apply extraterritorially when EU/UK readers are targeted or monitored (analytics + embeds qualify). Practical effect: a **cookie/consent banner for EU users** before YouTube/analytics load (ePrivacy), and a privacy policy naming legal bases and processors.

### Media / press / content
- **Nigeria Press Council** — press registration/ethics regime relevant to the editorial operation.
- **Cybercrimes (Prohibition, Prevention) Act 2015 (amended 2024)** — online-content liability, defamation exposure, and data-retention/cooperation duties on service providers. Governs publication risk and responses to takedown/disclosure requests.
- **Copyright Act 2022** — covers the e-copy PDFs and any reused content. Confirm rights/licenses for everything distributed; maintain a takedown process.
- **YouTube / Google Terms** — embedding rules and the duty to disclose Google's data collection (ties to consent).

### Adjacent (track, not launch-blocking)
- **ARCON Act 2022** (advertising) — only relevant if ads/sponsorships are added later.
- **FCCPC** (consumer protection) — minimal without transactions.

---

## 3. Data & privacy

Maintain a one-page **data inventory** (the backbone of NDPA/GDPR compliance):

| Data | Source | Purpose | Concern |
|---|---|---|---|
| `tvc_pwa_access` cookie (HMAC, no identity) | First-party | App-session marker | Disclose in cookie policy; functional, low-risk |
| Vercel Analytics IDs | First-party telemetry | Audience metrics | Consent for EU readers; use a privacy-friendly mode |
| YouTube iframe cookies | Google (third-party) | Video playback | **Highest-risk**: loads Google tracking pre-consent. Audit fix #20 (thumbnail facade / click-to-load) doubles as the privacy remedy |
| IP + request logs | Vercel / proxy routes | Ops, abuse | Set a retention window; IP is personal data |

Also required:
- **Processors named** (Vercel, Google/YouTube, WordPress host), ideally under DPAs.
- **Cross-border transfer** addressed — Vercel likely hosts diaspora/EU data in the US; NDPA and GDPR both regulate this. Name the transfer and the safeguard relied on.
- **Breach-response runbook** — owner, the 72-hour NDPC clock, what is logged, notification template.

---

## 4. Security (beyond the completed audit)

The audit ([companion doc](./2026-06-11-app-audit-remediation-design.md)) covered correctness and soft-gate hardening. Launch-level gaps it de-scoped or did not reach:

- **Rate limiting on public proxy routes** (`/api/pdf`, `/api/news`, `/api/youtube`, `/api/stream`) — unauthenticated routes that call third parties; without limits they are a cost-and-abuse vector. **Highest-value addition.**
- **CSP tightening** (audit #3) — finish the deferred nonce work; the main XSS lever.
- **Secrets hygiene** — confirm `.env` / `.env.local` are gitignored; the access secret is split from the revalidation secret (audit #5); secrets rotated for launch.
- **Security CI as a merge gate** — keep `dependency-audit.yml` + CodeQL green.
- **Standard to track:** OWASP Top 10 / ASVS Level 1.

---

## 5. Technical & operational maturity

- **Automated tests — currently zero** (no test runner in `package.json`). Largest single readiness gap. Minimum: smoke tests on proxy routes + the middleware gate, plus a render test per page. (`derive-tests` skill can map coverage.)
- **Error monitoring / observability** — none today; production errors are invisible. Add error + uptime monitoring before launch.
- **SEO / distribution (existential for news)** — `NewsArticle` structured data, Open Graph / Twitter cards, `sitemap.xml` + Google News sitemap, `robots.txt`, RSS feed, canonical URLs.
- **Image pipeline** (audit #19) — re-compress the ~18 MB of oversized PNGs; Core Web Vitals feed Google's news ranking.
- **Accessibility** — target **WCAG 2.2 AA**.
- **PWA depth** — define the service-worker caching strategy; decide whether push notifications (breaking-news) are a fast-follow.

---

## 6. Business & sustainability (free model)

- **Cost curve** — "free forever" still incurs hosting + proxy costs that scale with traffic; know the Vercel cost curve.
- **Credibility signals** — masthead/About, named editorial team, corrections policy, contact; these also gate **Google News / Discover** eligibility.
- **Audience growth** — define analytics goals; RSS/newsletter reserved as a future re-engagement channel.

---

## 7. Prioritized "what you're missing"

### 🔴 Launch-blocking
- Privacy Policy + Cookie Policy + consent banner (EU diaspora) + Terms of Use
- NDPC registration / DPO determination (confirm tier with a DPCO)
- Editorial & corrections policy; copyright/takedown notice; About/Contact (imprint)
- Rate limiting on proxy routes
- Secrets confirmed gitignored + split + rotated
- Basic error monitoring

### 🟠 Fast-follow (first weeks)
- Smoke/render test suite + CI gate
- SEO / structured data / news sitemap / RSS
- Image re-compression; CSP tightening; YouTube facade (audit #19, #3, #20)
- Breach-response runbook + data-inventory document

### 🟢 Later
- Accessibility AA pass; push notifications; full-text search; newsletter

---

## 8. Legal pages to create

A Nigerian news PWA with diaspora readers needs:

1. **Privacy Policy** — NDPA + GDPR; covers the four data sources (§3), processors, cross-border transfer, retention, data-subject rights, NDPC reference, contact/DPO. *Highest priority — drafted first via the `privacy-policy` skill.*
2. **Cookie Policy** — standalone or merged into the Privacy Policy; lists `tvc_pwa_access`, analytics, YouTube cookies.
3. **Terms of Use** — acceptable use, IP ownership, disclaimers, governing law (Nigeria).
4. **Editorial & Corrections Policy** — credibility + Google News eligibility.
5. **Copyright / Takedown Notice** — process under the Copyright Act 2022.
6. **About / Contact (imprint)** — masthead, named team, contact channel.
7. **Accessibility Statement** *(optional, fast-follow)*.

---

## 9. Out of scope

- Identity / accounts / paywall / payments (revisit only if subscriber-only content is introduced — a separate sub-project).
- NBC online-broadcast licensing (confirmed not a concern).
- Ads / ARCON compliance (no monetization planned).
- Backend / WordPress changes; visual redesign.

---

## 10. Success criteria

- All 🔴 launch-blocking items closed or have a counsel-confirmed disposition before public launch.
- Legal pages live and linked in the footer/nav; consent banner gates EU tracking.
- Data inventory + breach runbook exist as living documents.
- `next build` + `next lint` clean; security CI green as a merge gate.
- A smoke test suite exists and runs in CI (fast-follow target).
