# TrustScore — Test Credentials (DEVELOPMENT SEED)

All seeded accounts share the same password. Created via `npm run seed` (dev fixture only).

**Password (all accounts):** `TrustScore123!`

## Business accounts
- sarah@dev.trustscore.local  → GymFuel Nutrition (slug: gymfuel, sponsored, Growth plan, 100 audits)
- marcus@dev.trustscore.local → GlowLab Skincare (slug: glowlab, Growth plan, 100 audits)

## Creator accounts
- alex@dev.trustscore.local    → @alexfitness (TrustScore 91, verified)
- mia@dev.trustscore.local     → @beautybymia (84, verified)
- jordan@dev.trustscore.local  → @jordantravel (78, verified)
- sofia@dev.trustscore.local   → @sofiacooks (88)
- liam@dev.trustscore.local    → @liamtech (72, verified)
- ava@dev.trustscore.local     → @avastyle (63)

## Admin account (protected role, seed-only)
- admin@dev.trustscore.local

## Notes
- Public signup can ONLY create CREATOR or BUSINESS. ADMIN/AGENCY are rejected server-side.
- New creators start with 0 telemetry and "pending / insufficient" TrustScore (no fabrication).
- Database: local PostgreSQL (supervisor-managed) at 127.0.0.1:5432 / db `trustscore`, data dir `/app/.pgdata`.
