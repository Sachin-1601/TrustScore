import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { UserSession } from "@/types/schema";
import { db } from "@/db/client";

export class AuthService {
  /**
   * Securely hash a plaintext password with bcrypt
   */
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare a plaintext password against a stored hash
   */
  public static async verifyPassword(plain: string, hash: string): Promise<boolean> {
    try {
      if (hash.startsWith("pbkdf2_sha256$mockhash$") || hash.startsWith("pbkdf2$")) {
        const parts = hash.split("$");
        const storedPlain = parts[parts.length - 1];
        return plain === storedPlain;
      }
      return await bcrypt.compare(plain, hash);
    } catch {
      return false;
    }
  }

  /**
   * Authenticate a user with email & password
   */
  public static async login(
    email: string,
    passwordPlain: string
  ): Promise<{ session: UserSession | null; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Try Prisma first
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: {
          creatorProfile: true,
          businessProfile: true,
        },
      });

      if (user) {
        const isValid = await this.verifyPassword(passwordPlain, user.passwordHash);
        if (!isValid) {
          return { session: null, error: "Invalid email or password" };
        }

        const session: UserSession = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as any,
          avatar: user.avatar || undefined,
          creatorProfileId: user.creatorProfile?.id,
          businessProfileId: user.businessProfile?.id,
        };

        return { session };
      }
    } catch (err) {
      console.warn("Prisma login check fallback to local db repository", err);
    }

    // 2. DatabaseRepository fallback
    const user = await db.findUserByEmail(cleanEmail);
    if (!user) {
      return { session: null, error: "Invalid email or password" };
    }

    const isValid = await this.verifyPassword(passwordPlain, user.passwordHash);
    if (!isValid) {
      return { session: null, error: "Invalid email or password" };
    }

    let creatorProfileId: string | undefined = undefined;
    let businessProfileId: string | undefined = undefined;

    if (user.role === "CREATOR") {
      const creator = await db.findCreatorByUserId(user.id);
      creatorProfileId = creator?.id || creator?.username.replace("@", "");
    } else if (user.role === "BUSINESS" || user.role === "AGENCY") {
      const business = await db.findBusinessByUserId(user.id);
      businessProfileId = business?.slug || business?.id;
    }

    const session: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      avatar: user.avatar || undefined,
      creatorProfileId,
      businessProfileId,
    };

    return { session };
  }

  /**
   * Register a new user with dedicated role separation and clean zero-fake initial metrics
   */
  public static async signup(data: {
    email: string;
    passwordPlain: string;
    name: string;
    role: UserRole;
    handleOrCompany?: string;
    category?: string;
    platform?: "instagram" | "tiktok" | "youtube";
  }): Promise<{ session: UserSession | null; error?: string }> {
    const cleanEmail = data.email.trim().toLowerCase();
    const passwordHash = await this.hashPassword(data.passwordPlain);

    try {
      // 1. Try Prisma creation
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        return { session: null, error: "An account with this email already exists" };
      }

      const defaultAvatar =
        data.role === "CREATOR"
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80";

      const createdUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          name: data.name.trim(),
          role: data.role,
          avatar: defaultAvatar,
        },
      });

      let creatorProfileId: string | undefined = undefined;
      let businessProfileId: string | undefined = undefined;

      if (data.role === "CREATOR") {
        const rawHandle = data.handleOrCompany || data.name.toLowerCase().replace(/[^a-z0-9_]/g, "");
        const username = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;

        const creator = await prisma.creatorProfile.create({
          data: {
            userId: createdUser.id,
            username,
            name: data.name.trim(),
            avatar: defaultAvatar,
            bio: `Creator focused on ${data.category || "Lifestyle"}.`,
            category: data.category || "Fitness",
            location: "Melbourne, Australia",
            country: "Australia",
            platform: data.platform === "tiktok" ? "TIKTOK" : data.platform === "youtube" ? "YOUTUBE" : "INSTAGRAM",
            followers: 0,
            following: 0,
            totalPosts: 0,
            avgLikes: 0,
            avgComments: 0,
            avgViews: 0,
            engagementRate: 0,
            startingRate: 250,
            isAvailable: true,
            availabilityStatus: "OPEN_TO_WORK",
            profileTags: ["Open to Work", "Available for Collaboration"],
            verifiedBadge: false,
            dataCoverage: "INSUFFICIENT",
          },
        });
        creatorProfileId = creator.id;
      } else if (data.role === "BUSINESS" || data.role === "AGENCY") {
        const companyName = data.handleOrCompany || `${data.name}'s Brand`;
        const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

        const business = await prisma.businessProfile.create({
          data: {
            userId: createdUser.id,
            slug: `${slug}-${Date.now().toString().slice(-4)}`,
            name: companyName,
            logo: defaultAvatar,
            category: data.category || "Brand",
            location: "Global",
            tagline: "Connecting with authentic creators",
            description: "Verified brand on TrustScore seeking quality creator partnerships.",
            website: "https://example.com",
            isSponsored: false,
          },
        });
        businessProfileId = business.id;
      }

      // Initial subscription
      await prisma.subscription.create({
        data: {
          userId: createdUser.id,
          planId: data.role === "CREATOR" ? "free" : "starter",
          status: "ACTIVE",
          creatorChecksRemaining: data.role === "CREATOR" ? 5 : 25,
          creatorChecksLimit: data.role === "CREATOR" ? 5 : 25,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      const session: UserSession = {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role as any,
        avatar: createdUser.avatar || undefined,
        creatorProfileId,
        businessProfileId,
      };

      return { session };
    } catch (err) {
      console.warn("Prisma signup fallback to local db repository", err);
    }

    // 2. DatabaseRepository fallback
    const existing = await db.findUserByEmail(cleanEmail);
    if (existing) {
      return { session: null, error: "An account with this email already exists" };
    }

    const defaultAvatar =
      data.role === "CREATOR"
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80";

    const newUser = await db.createUser({
      email: cleanEmail,
      passwordHash,
      name: data.name.trim(),
      role: data.role as any,
      avatar: defaultAvatar,
    });

    let creatorProfileId: string | undefined = undefined;
    let businessProfileId: string | undefined = undefined;

    if (data.role === "CREATOR") {
      const rawHandle = data.handleOrCompany || data.name.toLowerCase().replace(/[^a-z0-9_]/g, "");
      const username = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;

      const creator = await db.createCreator({
        id: username.replace("@", ""),
        userId: newUser.id,
        username,
        name: data.name.trim(),
        avatar: defaultAvatar,
        bio: `Creator focused on ${data.category || "Lifestyle"}.`,
        category: (data.category as any) || "Fitness",
        location: "Melbourne, Australia",
        country: "Australia",
        platform: data.platform || "instagram",
        followers: 0,
        following: 0,
        totalPosts: 0,
        avgLikes: 0,
        avgComments: 0,
        avgViews: 0,
        engagementRate: 0,
        trustScore: 0,
        scoreBand: "Moderate Risk" as any,
        riskLevel: "Moderate" as any,
        inflatedEngagementProbability: 0,
        uncertaintyMargin: 5.0,
        authenticityProbability: 0,
        commentDiversityPercent: 0,
        growthStabilityScore: 0,
        engagementConsistencyScore: 0,
        isAvailableForCollaboration: true,
        availabilityStatus: "OPEN_TO_WORK",
        profileTags: ["Open to Work"],
        startingRate: 250,
        preferredCampaignTypes: ["Sponsored Post"],
        subScores: {
          followerAuthenticity: 0,
          engagementAuthenticity: 0,
          commentQuality: 0,
          growthPattern: 0,
          engagementConsistency: 0,
        },
        commentQuality: {
          uniqueCommentsPercent: 0,
          repeatedPatternsPercent: 0,
          genericCommentsPercent: 0,
          emojiOnlyPercent: 0,
          sampleAnalyzedComments: [],
          podClusterDetected: false,
          crowdTurfingRisk: "Very Low",
        },
        prescriptiveGuidance: {
          primaryRecommendation: "Connect social telemetry to compute score",
          recommendedPaymentAdjustment: "0%",
          confidenceLevel: "Low",
          alternativeAction: "Provide verified analytics data",
          riskMitigationChecklist: [],
        },
        followerGrowthHistory: [],
        engagementHistory: [],
        positiveFactors: [],
        warningFactors: ["Insufficient post telemetry for comprehensive scoring"],
        engagementVolatilityIndex: 0,
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        verifiedBadge: false,
        profileUrl: `https://trustscore.io/creators/${username.replace("@", "")}`,
        analyzedAt: new Date().toISOString(),
      });
      creatorProfileId = creator.id;
    } else if (data.role === "BUSINESS" || data.role === "AGENCY") {
      const companyName = data.handleOrCompany || `${data.name}'s Brand`;
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

      const business = await db.createBusiness({
        id: `biz-${Date.now()}`,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        name: companyName,
        logo: defaultAvatar,
        category: (data.category as any) || "Brand",
        location: "Global",
        tagline: "Connecting with authentic creators",
        description: "Verified brand on TrustScore seeking quality creator partnerships.",
        website: "https://example.com",
        isSponsored: false,
        activeCampaignsCount: 0,
        productsOrServices: [],
        openOpportunities: [],
        contactEmail: cleanEmail,
        joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
      businessProfileId = business.slug;
    }

    const session: UserSession = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as any,
      avatar: newUser.avatar || undefined,
      creatorProfileId,
      businessProfileId,
    };

    return { session };
  }

  /**
   * Find user by ID
   */
  public static async getUserById(userId: string): Promise<UserSession | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          creatorProfile: true,
          businessProfile: true,
        },
      });

      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as any,
          avatar: user.avatar || undefined,
          creatorProfileId: user.creatorProfile?.id,
          businessProfileId: user.businessProfile?.id,
        };
      }
    } catch {
      // Fallback
    }

    const user = await db.findUserById(userId);
    if (!user) return null;

    let creatorProfileId: string | undefined = undefined;
    let businessProfileId: string | undefined = undefined;

    if (user.role === "CREATOR") {
      const creator = await db.findCreatorByUserId(user.id);
      creatorProfileId = creator?.id || creator?.username.replace("@", "");
    } else if (user.role === "BUSINESS" || user.role === "AGENCY") {
      const business = await db.findBusinessByUserId(user.id);
      businessProfileId = business?.slug || business?.id;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      avatar: user.avatar,
      creatorProfileId,
      businessProfileId,
    };
  }
}
