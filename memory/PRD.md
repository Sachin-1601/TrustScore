# TrustScore — PRD & Engineering Log

## Product
Two-sided creator/business marketplace + creator authenticity intelligence (probabilistic TrustScore for micro/nano influencers). Real production SaaS (Australia-based). Next.js 16 + Prisma + PostgreSQL + Stripe.

## Environment (this pod)
- Next.js app lives at `/app` (single origin serves pages + `/api`).
- Pod routing adapter: `/app/frontend` runs `next start` on :3000; `/app/backend/server.py` (FastAPI) proxies `/api/*` from :8001 → :3000 (Kubernetes ingress sends `/api` to 8001, everything else to 3000).
- PostgreSQL is supervisor-managed (`/etc/supervisor/conf.d/postgresql.conf`), data dir `/app/.pgdata` (MUST stay under /app to persist), trust auth on 127.0.0.1.
- `npm run seed` = explicit dev fixtures. `npm run build` then restart `frontend` to deploy changes to the live preview.

## Original problem statement
Full production hardening across 60 phases: make Prisma the single source of truth, remove all in-memory/mock fallbacks & fake success, harden auth/authorization, real collaborations/messaging/campaigns, Stripe subscriptions + advertising via webhooks, real TrustScore persistence, preserve existing dark visual identity.

## Completed (2026-06 / session 1 — architecture + security foundation)
- **Infra**: PostgreSQL installed + persistent under /app; env wired (DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_APP_URL, Stripe test key); Prisma schema pushed & client generated; pod routing adapter; prod build serving live.
- **Single source of truth**: authService, creatorService, businessService, collaborationService, advertisementService rewritten to be Prisma-only. Removed silent in-memory (`db`) and mock fallbacks from core read/write paths. DB failures now surface as 5xx (no fake data).
- **Auth/security**: session.ts requires AUTH_SECRET in prod (no hardcoded secret); public signup role-whitelist (CREATOR/BUSINESS only — ADMIN/AGENCY blocked server-side); login demo-fill & hardcoded creds removed.
- **Marketplace**: /api/creators fully DB-driven with server-side filter/sort/pagination; no fabricated telemetry; new creators = pending/insufficient.
- **Saved creators**: Prisma + strict per-business ownership (isolation verified).
- **Collaborations**: Prisma persistence + lifecycle state machine (PENDING→ACCEPTED/DECLINED→ACTIVE→COMPLETED/CANCELLED) + participant authorization (IDOR blocked).
- **Messaging**: Prisma + participant-only read/write authorization.
- **TrustScore**: engine preserved; /api/trustscore/analyze persists auditable TrustScoreRecord + factors, atomic server-side quota decrement tied to active subscription, quota refunded on failure/insufficient-data.
- **Ads**: central production package config (`src/data/adPackages.ts`); Prisma-backed; only ACTIVE ads public; AdEvent impression/click tracking; drafts created PENDING_REVIEW.
- **Campaigns**: removed `gymfuel` fallback; business ownership enforced.
- **Seed**: rewritten as guarded dev fixture (blocks NODE_ENV=production).

### Verified (curl + engine tests + live UI)
Role escalation blocked; saved isolation; collaboration create→accept + cross-tenant read blocked; messaging authz; TrustScore audit persists + quota; marketplace renders real cards; TrustScore engine 3/3; `npm run build` passes (0 TS errors).

## Backlog (next sessions — remaining stages)
- **P0 Stripe**: real checkout/subscription/webhook wiring needs a valid Stripe test key (env `sk_test_emergent` won't drive the raw Stripe SDK) + Price IDs. Verify webhook-driven activation, upgrade/downgrade/cancel/past_due, idempotency, ad checkout → ACTIVE.
- **P1**: creator profile page (tags persistence UI), business profile completion UI, leaderboard "Top X%" population math, social OAuth provider abstraction + encrypted token storage.
- **P1 remaining mock cleanup**: recommendations route, admin/metrics route, sitemap, notificationService still import in-memory `db` fixture — migrate to Prisma.
- **P2**: full API-route authorization audit pass; remove `example.com` remnants; SEO metadata; accessibility; expand test suite; fix pre-existing React-compiler lint errors (16) in legacy UI components.
- Currency centralization (AUD) config.

## Known limitations / mocked
- Social telemetry (Instagram/TikTok/YouTube) is NOT live — architecture returns "connection required" (no fabricated metrics).
- Stripe flows are code-correct but NOT verified end-to-end in this env (needs real test key).
