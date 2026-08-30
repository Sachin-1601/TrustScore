import { PrismaClient, UserRole, SocialPlatform, DataCoverage, CampaignStatus, AdPlacement, AdStatus, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding TrustScore PostgreSQL Database...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Default Demo Users
  const alexUser = await prisma.user.upsert({
    where: { email: "alex@trustscore.io" },
    update: {},
    create: {
      email: "alex@trustscore.io",
      passwordHash,
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      role: UserRole.CREATOR,
    },
  });

  const sarahUser = await prisma.user.upsert({
    where: { email: "sarah@acmebrand.com" },
    update: {},
    create: {
      email: "sarah@acmebrand.com",
      passwordHash,
      name: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      role: UserRole.BUSINESS,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@trustscore.io" },
    update: {},
    create: {
      email: "admin@trustscore.io",
      passwordHash,
      name: "TrustScore Admin",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      role: UserRole.ADMIN,
    },
  });

  // 2. Create Creator Profile for Alex
  const alexCreator = await prisma.creatorProfile.upsert({
    where: { userId: alexUser.id },
    update: {},
    create: {
      userId: alexUser.id,
      username: "@alexfitness",
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      bio: "High-intensity functional fitness, evidence-based nutrition coaching, and Melbourne specialty coffee culture.",
      category: "Fitness",
      location: "Melbourne, Australia",
      country: "Australia",
      platform: SocialPlatform.INSTAGRAM,
      followers: 32400,
      following: 684,
      totalPosts: 342,
      avgLikes: 1450,
      avgComments: 105,
      avgViews: 8200,
      engagementRate: 4.8,
      startingRate: 350,
      isAvailable: true,
      availabilityStatus: "OPEN_TO_WORK",
      profileTags: ["Open to Work", "Available for Collaboration", "Open to Brand Deals"],
      website: "https://instagram.com/alexfitness",
      verifiedBadge: true,
      verifiedAt: new Date("2026-03-15"),
      dataCoverage: DataCoverage.EXCELLENT,
    },
  });

  // 3. Create Business Profile for Sarah (GymFuel)
  const gymfuelBusiness = await prisma.businessProfile.upsert({
    where: { slug: "gymfuel" },
    update: {},
    create: {
      userId: sarahUser.id,
      slug: "gymfuel",
      name: "GymFuel Nutrition",
      logo: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=120&auto=format&fit=crop&q=80",
      category: "Fitness & Nutrition",
      location: "Sydney, Australia",
      tagline: "Pure plant-based performance nutrition for athletes",
      description: "Clean supplements, electrolyte formulations, and organic protein designed for high-performance fitness athletes.",
      website: "https://gymfuel.example.com",
      isSponsored: false,
      activeCampaignsCount: 2,
    },
  });

  // 4. Create Initial Campaign
  const initialCampaign = await prisma.campaign.create({
    data: {
      businessId: gymfuelBusiness.id,
      title: "Spring Performance Hydration Campaign",
      category: "Fitness",
      budget: 1200,
      deliverables: "1x Dedicated Reel, 2x Story Sets with Trackable Link",
      targetMinTrustScore: 85,
      targetFollowerRange: "10k-50k",
      status: CampaignStatus.ACTIVE,
    },
  });

  // 5. Subscriptions
  await prisma.subscription.upsert({
    where: { id: "sub-alex-creator" },
    update: {},
    create: {
      id: "sub-alex-creator",
      userId: alexUser.id,
      planId: "pro",
      status: SubscriptionStatus.ACTIVE,
      creatorChecksRemaining: 25,
      creatorChecksLimit: 25,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Database seeded successfully with initial entities.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
