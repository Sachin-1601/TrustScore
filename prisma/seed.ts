/**
 * TrustScore — DEVELOPMENT / DEMO SEED
 * ------------------------------------------------------------------
 * This script is a DEVELOPMENT FIXTURE. It is only ever executed
 * explicitly via `npm run seed` (never automatically at build/deploy).
 * It must NOT be run against a production database.
 *
 *   npm run seed
 * ------------------------------------------------------------------
 */
import { PrismaClient, ScoreBand, RiskLevel, DataCoverage, SocialPlatform } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEV_PASSWORD = "TrustScore123!";

function bandFor(score: number): ScoreBand {
  if (score >= 90) return "VERY_HIGH_TRUST";
  if (score >= 75) return "HIGH_TRUST";
  if (score >= 50) return "MODERATE_RISK";
  if (score >= 25) return "HIGH_RISK";
  return "VERY_HIGH_RISK";
}
function riskFor(score: number): RiskLevel {
  if (score >= 75) return "LOW";
  if (score >= 50) return "MODERATE";
  if (score >= 25) return "HIGH";
  return "CRITICAL";
}

interface CreatorSeed {
  email: string;
  name: string;
  username: string;
  category: string;
  location: string;
  platform: SocialPlatform;
  followers: number;
  following: number;
  totalPosts: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  score: number;
  verified: boolean;
  avatar: string;
}

const CREATORS: CreatorSeed[] = [
  { email: "alex@dev.trustscore.local", name: "Alex Rivera", username: "alexfitness", category: "Fitness", location: "Melbourne, Australia", platform: "INSTAGRAM", followers: 24200, following: 420, totalPosts: 124, avgLikes: 1120, avgComments: 88, engagementRate: 5.0, score: 91, verified: true, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80" },
  { email: "mia@dev.trustscore.local", name: "Mia Chen", username: "beautybymia", category: "Beauty", location: "Sydney, Australia", platform: "INSTAGRAM", followers: 41800, following: 610, totalPosts: 208, avgLikes: 2100, avgComments: 150, engagementRate: 5.4, score: 84, verified: true, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80" },
  { email: "jordan@dev.trustscore.local", name: "Jordan Blake", username: "jordantravel", category: "Travel", location: "Brisbane, Australia", platform: "YOUTUBE", followers: 16800, following: 80, totalPosts: 54, avgLikes: 950, avgComments: 110, engagementRate: 6.3, score: 78, verified: true, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
  { email: "sofia@dev.trustscore.local", name: "Sofia Martinez", username: "sofiacooks", category: "Food", location: "Perth, Australia", platform: "TIKTOK", followers: 38500, following: 210, totalPosts: 185, avgLikes: 2400, avgComments: 140, engagementRate: 6.6, score: 88, verified: false, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80" },
  { email: "liam@dev.trustscore.local", name: "Liam O'Brien", username: "liamtech", category: "Technology", location: "Adelaide, Australia", platform: "YOUTUBE", followers: 52100, following: 130, totalPosts: 96, avgLikes: 3100, avgComments: 220, engagementRate: 6.4, score: 72, verified: true, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80" },
  { email: "ava@dev.trustscore.local", name: "Ava Thompson", username: "avastyle", category: "Fashion", location: "Melbourne, Australia", platform: "INSTAGRAM", followers: 9800, following: 340, totalPosts: 61, avgLikes: 540, avgComments: 41, engagementRate: 5.9, score: 63, verified: false, avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80" },
];

interface BusinessSeed {
  email: string;
  contactName: string;
  slug: string;
  name: string;
  category: string;
  location: string;
  tagline: string;
  description: string;
  website: string;
  logo: string;
}

const BUSINESSES: BusinessSeed[] = [
  { email: "sarah@dev.trustscore.local", contactName: "Sarah Jenkins", slug: "gymfuel", name: "GymFuel Nutrition", category: "Health & Fitness", location: "Melbourne, Australia", tagline: "Clean electrolytes for serious athletes", description: "Direct-to-consumer sports nutrition brand partnering with authentic fitness creators.", website: "https://gymfuel.com.au", logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&auto=format&fit=crop&q=80" },
  { email: "marcus@dev.trustscore.local", contactName: "Marcus Lee", slug: "glowlab", name: "GlowLab Skincare", category: "Beauty", location: "Sydney, Australia", tagline: "Dermatologist-formulated skincare", description: "Australian skincare brand seeking beauty creators for honest product reviews.", website: "https://glowlab.com.au", logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=160&auto=format&fit=crop&q=80" },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to run development seed against a production environment.");
  }

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: "admin@dev.trustscore.local" },
    update: {},
    create: {
      email: "admin@dev.trustscore.local",
      passwordHash,
      name: "Platform Admin",
      role: "ADMIN",
    },
  });

  for (const c of CREATORS) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { email: c.email, passwordHash, name: c.name, role: "CREATOR", avatar: c.avatar },
    });

    const existing = await prisma.creatorProfile.findUnique({ where: { userId: user.id } });
    if (existing) continue;

    const inflated = Number((100 - c.score).toFixed(1));
    await prisma.creatorProfile.create({
      data: {
        userId: user.id,
        username: `@${c.username}`,
        name: c.name,
        avatar: c.avatar,
        bio: `${c.category} creator based in ${c.location}.`,
        category: c.category,
        location: c.location,
        country: "Australia",
        platform: c.platform,
        followers: c.followers,
        following: c.following,
        totalPosts: c.totalPosts,
        avgLikes: c.avgLikes,
        avgComments: c.avgComments,
        engagementRate: c.engagementRate,
        startingRate: 350,
        isAvailable: true,
        availabilityStatus: "OPEN_TO_WORK",
        profileTags: ["Open to Work", "Available for Collaboration", "Open to Brand Deals"],
        verifiedBadge: c.verified,
        verifiedAt: c.verified ? new Date() : null,
        dataCoverage: DataCoverage.GOOD,
        trustScores: {
          create: {
            score: c.score,
            scoreBand: bandFor(c.score),
            riskLevel: riskFor(c.score),
            inflatedProbability: inflated,
            uncertaintyMargin: 2.4,
            authenticityProbability: c.score,
            commentDiversityPercent: Math.min(95, c.score + 3),
            growthStabilityScore: Math.min(95, c.score + 5),
            consistencyScore: Math.min(95, c.score + 2),
            volatilityIndex: 14.0,
            dataCoverage: DataCoverage.GOOD,
            modelVersion: "v1.2",
            factors: {
              create: [
                { name: "Comment Lexical Entropy", score: Math.min(95, c.score + 3), signalType: "positive", description: "High linguistic variety with natural conversational questions." },
                { name: "Follower Growth Monotonicity", score: Math.min(95, c.score + 5), signalType: "positive", description: "Stable organic follower acquisition curve." },
              ],
            },
          },
        },
      },
    });
  }

  for (const b of BUSINESSES) {
    const user = await prisma.user.upsert({
      where: { email: b.email },
      update: {},
      create: { email: b.email, passwordHash, name: b.contactName, role: "BUSINESS", avatar: b.logo },
    });

    const existing = await prisma.businessProfile.findUnique({ where: { userId: user.id } });
    if (existing) continue;

    await prisma.businessProfile.create({
      data: {
        userId: user.id,
        slug: b.slug,
        name: b.name,
        logo: b.logo,
        category: b.category,
        location: b.location,
        tagline: b.tagline,
        description: b.description,
        website: b.website,
        isSponsored: b.slug === "gymfuel",
      },
    });

    await prisma.subscription.upsert({
      where: { stripeSubscriptionId: `dev_seed_${user.id}` },
      update: {},
      create: {
        userId: user.id,
        planId: "growth",
        status: "ACTIVE",
        billingCycle: "monthly",
        stripeSubscriptionId: `dev_seed_${user.id}`,
        creatorChecksRemaining: 100,
        creatorChecksLimit: 100,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  console.log("✅ Development seed complete.");
  console.log(`   Demo password for all seeded accounts: ${DEV_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
