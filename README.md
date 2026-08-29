# TrustScore | Creator-Business Discovery & Authenticity Intelligence SaaS

> **"Don't just find creators with reach. Find creators you can trust."**

TrustScore is a production-grade data-driven creator authenticity and marketplace SaaS platform built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and PostgreSQL/Prisma.

---

## 🌟 Core Product Capabilities

1. **Creator Authenticity Intelligence (Probabilistic TrustScore)**:
   - Evaluates micro- and nano-influencers (1,000–50,000 followers) with sparse historical data using Empirical Bayes shrinkage.
   - Calculates $P(\text{inflated engagement} \mid \text{features})$, confidence intervals ($\pm \delta$), and 5-vector factor explainability.
   - Outputs prescriptive decision support and proportional fee guidance ($0–5\%$, $10–20\%$, milestone escrow).
2. **Two-Sided Discovery Marketplace**:
   - **Business $\rightarrow$ Creator**: Discover verified creators by vertical, TrustScore, follower range, and location.
   - **Creator $\rightarrow$ Business**: Discover brand campaign briefs, ambassador retainers, and submit pitches.
   - **Campaign Matching Engine**: Recommends creators with campaign fit percentage (e.g. 94%) and human-readable matching reasons.
3. **Collaboration & Proposal Lifecycle**:
   - Structured proposals with deliverables, timelines, and budgets.
   - State machine tracking: `Pending` $\rightarrow$ `Accepted` / `Declined` $\rightarrow$ `Active` $\rightarrow$ `Completed`.
   - In-app threaded collaboration messaging.
4. **Sponsored Business Advertising**:
   - High-visibility homepage and sidebar placements.
   - **Strict Commercial Independence**: Paid advertisements never alter creator TrustScores, confidence metrics, or leaderboard rankings.
5. **Role-Based Access Control (RBAC)**:
   - Dedicated roles: `CREATOR`, `BUSINESS`, `AGENCY`, `ADMIN`.

---

## 🏗️ Architecture: Modular Monolith

```
TrustScore/
├── prisma/
│   └── schema.prisma                 # Normalized PostgreSQL relational schema
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # Server-side REST API Handlers
│   │   │   ├── auth/                 # Login, Signup, Session
│   │   │   ├── creators/             # Discovery, Onboarding, Profile
│   │   │   ├── businesses/           # Directory, Onboarding, Profile
│   │   │   ├── trustscore/           # TrustScore Engine & Quota Decrement
│   │   │   ├── leaderboard/          # Authenticity rankings
│   │   │   ├── recommendations/      # Campaign-Creator Match Engine
│   │   │   ├── collaborations/       # Proposals & Status
│   │   │   ├── messages/             # Direct messaging
│   │   │   ├── advertisements/       # Sponsored placements & CTR
│   │   │   ├── payments/             # Stripe checkout & webhooks
│   │   │   └── admin/                # Model observability & metrics
│   │   ├── dashboard/                # Business & Creator Dashboard Suite
│   │   ├── admin/                    # Admin & Model Monitoring Console
│   │   ├── creators/ & businesses/   # Public Discovery Marketplace
│   │   ├── leaderboard/ & advertise/ # Public Leaderboard & Ad Portal
│   │   ├── sitemap.ts & robots.ts    # Dynamic SEO Architecture
│   │   └── privacy/, terms/, cookies/# Production Legal Pages
│   ├── services/                     # Pure Business Logic & Domain Services
│   │   ├── trustScoreEngine.ts       # Bayesian Shrinkage & Uncertainty Bounds
│   │   ├── recommendationEngine.ts   # Campaign Fit Algorithm
│   │   ├── creatorService.ts         # Creator CRUD & Filters
│   │   ├── businessService.ts        # Brand Directory & Opportunities
│   │   ├── collaborationService.ts   # Proposal & Messaging Lifecycle
│   │   ├── advertisementService.ts   # Ad Rotation & Telemetry
│   │   ├── paymentService.ts         # Stripe Checkout & Webhook Handlers
│   │   ├── pricingService.ts         # Centralized SaaS Pricing Config
│   │   ├── socialDataProvider.ts     # Platform Graph API Abstraction
│   │   └── authService.ts            # RBAC & Session Management
│   ├── db/                           # Database Client & Repository Layer
│   ├── contexts/                     # AuthContext & ToastContext
│   ├── components/                   # Dark Premium UI Components
│   └── tests/                        # Data Science & Matching Unit Tests
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Base application URL (`http://localhost:3001` or production domain) |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | 32-character secret for signing session tokens |
| `STRIPE_SECRET_KEY` | Stripe Secret API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable client key |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Data Science Unit Tests
```bash
npx tsx src/tests/trustScoreEngine.test.ts
npx tsx src/tests/recommendationEngine.test.ts
```

### 3. Build & Type-Check for Production
```bash
npm run build
```

### 4. Run Development Server
```bash
npm run dev
```

The application is accessible at **`http://localhost:3001`**.

---

## 🧪 Verified Routes

- **Public Marketplace**: `/`, `/creators`, `/creators/[username]`, `/businesses`, `/businesses/[slug]`, `/leaderboard`, `/advertise`
- **Solutions & Methodology**: `/for-businesses`, `/for-creators`, `/how-it-works`, `/methodology`, `/pricing`
- **Dashboards**: `/dashboard`, `/dashboard/saved`, `/dashboard/collaborations`, `/dashboard/messages`, `/dashboard/campaigns`, `/dashboard/billing`, `/dashboard/creator`, `/dashboard/advertise`, `/dashboard/analyze`, `/dashboard/compare`, `/dashboard/reports`, `/dashboard/model-insights`, `/dashboard/settings`
- **Admin Console**: `/admin`
- **Legal & SEO**: `/privacy`, `/terms`, `/cookies`, `/sitemap.xml`, `/robots.txt`
