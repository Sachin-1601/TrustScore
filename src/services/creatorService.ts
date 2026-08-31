import { prisma } from "@/lib/prisma";
import { db } from "@/db/client";
import { Creator } from "@/types/creator";
import { TrustScoreEngine } from "./trustScoreEngine";
import { SocialPlatform, DataCoverage, Prisma, ScoreBand, RiskLevel } from "@prisma/client";

export interface CreatorFilterParams {
  query?: string;
  category?: string;
  platform?: string;
  minTrustScore?: number;
  followerRange?: "all" | "nano" | "micro" | "mid" | "macro";
  location?: string;
  verifiedOnly?: boolean;
  socialVerifiedOnly?: boolean;
  availableOnly?: boolean;
  sortBy?: "trust" | "risk" | "engagement" | "followers" | "verified" | "recent";
  limit?: number;
  offset?: number;
  page?: number;
}

export class CreatorService {
  /**
   * Maps a Prisma CreatorProfile database record to the frontend Creator type
   */
  public static mapPrismaToCreator(profile: any): Creator {
    const latestScore = profile.trustScores && profile.trustScores.length > 0 ? profile.trustScores[0] : null;
    const cleanUsername = profile.username.replace("@", "");
    const hasInsufficientData = profile.dataCoverage === "INSUFFICIENT" || !latestScore || profile.followers === 0;

    // Generate contextual insight summary
    let insightText = "Strong engagement consistency";
    if (hasInsufficientData) {
      insightText = "Awaiting initial authenticity audit";
    } else if (latestScore?.factors && latestScore.factors.length > 0) {
      const posFactor = latestScore.factors.find((f: any) => f.signalType === "positive");
      if (posFactor) insightText = posFactor.name || posFactor.description;
    } else if (profile.verifiedBadge) {
      insightText = "Verified account with stable audience growth";
    }

    return {
      id: cleanUsername.toLowerCase(),
      userId: profile.userId,
      username: `@${cleanUsername}`,
      name: profile.name,
      avatar: profile.avatar || profile.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      platform: (profile.platform?.toLowerCase() as any) || "instagram",
      category: profile.category as any,
      bio: profile.bio || `Verified creator on TrustScore.`,
      location: profile.location || "Global",
      country: profile.country || "Australia",
      joinedDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "August 2026",
      verifiedBadge: profile.verifiedBadge ?? false,
      verifiedDate: profile.verifiedAt ? new Date(profile.verifiedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : undefined,
      profileUrl: profile.website || `https://${profile.platform?.toLowerCase() || "instagram"}.com/${cleanUsername}`,

      // Audience & Authenticity Metrics
      followers: profile.followers ?? 0,
      following: profile.following ?? 0,
      totalPosts: profile.totalPosts ?? 0,
      avgLikes: profile.avgLikes ?? 0,
      avgComments: profile.avgComments ?? 0,
      avgViews: profile.avgViews ?? 0,
      engagementRate: profile.engagementRate ?? 0,

      // TrustScore Engine Metrics
      trustScore: latestScore ? latestScore.score : (hasInsufficientData ? 0 : 85),
      scoreBand: latestScore ? (latestScore.scoreBand as any) : (hasInsufficientData ? "MODERATE_RISK" : "HIGH_TRUST"),
      riskLevel: latestScore ? (latestScore.riskLevel as any) : "LOW",
      inflatedEngagementProbability: latestScore ? latestScore.inflatedProbability : 5.0,
      uncertaintyMargin: latestScore ? latestScore.uncertaintyMargin : 1.5,
      authenticityProbability: latestScore ? latestScore.authenticityProbability : (hasInsufficientData ? 0 : 95.0),
      commentDiversityPercent: latestScore ? latestScore.commentDiversityPercent : 85,
      growthStabilityScore: latestScore ? latestScore.growthStabilityScore : 90,
      engagementConsistencyScore: latestScore ? latestScore.consistencyScore : 90,
      engagementVolatilityIndex: latestScore ? latestScore.volatilityIndex : 12.0,

      // Marketplace & Collaboration
      website: profile.website || undefined,
      isAvailableForCollaboration: profile.isAvailable ?? true,
      availabilityStatus: profile.availabilityStatus as any || "OPEN_TO_WORK",
      profileTags: profile.profileTags && profile.profileTags.length > 0 ? profile.profileTags : ["Open to Work", "Available for Collaboration"],
      startingRate: profile.startingRate ?? 300,
      preferredCampaignTypes: ["Dedicated Reel", "Story Series", "Product Review"],

      subScores: {
        followerAuthenticity: latestScore?.authenticityProbability ? Math.round(latestScore.authenticityProbability) : 92,
        engagementAuthenticity: latestScore?.growthStabilityScore ?? 90,
        commentQuality: latestScore?.commentDiversityPercent ?? 85,
        growthPattern: latestScore?.growthStabilityScore ?? 90,
        engagementConsistency: latestScore?.consistencyScore ?? 90,
      },

      commentQuality: {
        uniqueCommentsPercent: latestScore?.commentDiversityPercent ?? 85,
        repeatedPatternsPercent: 5,
        genericCommentsPercent: 6,
        emojiOnlyPercent: 4,
        sampleAnalyzedComments: [
          { text: "Detailed review, really appreciated!", type: "organic", timestamp: "1d ago" },
        ],
        podClusterDetected: false,
        crowdTurfingRisk: "Very Low",
      },

      prescriptiveGuidance: {
        primaryRecommendation: "Proceed with standard campaign agreement",
        recommendedPaymentAdjustment: "Standard negotiated base rate",
        confidenceLevel: hasInsufficientData ? "Low" : "High",
        alternativeAction: "Request 30-day verified Graph API link",
        riskMitigationChecklist: [
          "Confirm live campaign tracking tags",
          "Ensure deliverable scope alignment",
        ],
      },

      followerGrowthHistory: [
        { month: "Prior", followers: Math.max(0, (profile.followers || 1000) - 500), expectedOrganic: Math.max(0, (profile.followers || 1000) - 500) },
        { month: "Current", followers: profile.followers || 1000, expectedOrganic: profile.followers || 1000 },
      ],

      engagementHistory: profile.engagementSnapshots?.map((snap: any, idx: number) => ({
        postIndex: idx + 1,
        date: snap.recordedAt ? new Date(snap.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : `Post ${idx + 1}`,
        likes: snap.likes,
        comments: snap.comments,
        engagementRate: snap.engagementRate,
        isAnomaly: snap.isAnomaly,
      })) || [],

      positiveFactors: latestScore?.factors?.filter((f: any) => f.signalType === "positive").map((f: any) => f.name) || [
        insightText,
      ],
      warningFactors: latestScore?.factors?.filter((f: any) => f.signalType === "warning").map((f: any) => f.name) || [],

      analyzedAt: latestScore?.calculatedAt?.toISOString() || profile.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * Search and filter creators with real database persistence and server-side pagination
   */
  public static async getCreators(params: CreatorFilterParams = {}): Promise<{
    creators: Creator[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }> {
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const page = Math.max(1, params.page || 1);
    const offset = params.offset !== undefined ? params.offset : (page - 1) * limit;

    try {
      // Build Prisma Where Clause
      const where: Prisma.CreatorProfileWhereInput = {};

      if (params.query?.trim()) {
        const q = params.query.trim();
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
        ];
      }

      if (params.category && params.category !== "all") {
        where.category = { equals: params.category, mode: "insensitive" };
      }

      if (params.platform && params.platform !== "all") {
        const platUpper = params.platform.toUpperCase();
        if (["INSTAGRAM", "TIKTOK", "YOUTUBE"].includes(platUpper)) {
          where.platform = platUpper as SocialPlatform;
        }
      }

      if (params.followerRange && params.followerRange !== "all") {
        if (params.followerRange === "nano") {
          where.followers = { gte: 1000, lte: 10000 };
        } else if (params.followerRange === "micro") {
          where.followers = { gt: 10000, lte: 50000 };
        } else if (params.followerRange === "mid") {
          where.followers = { gt: 50000, lte: 500000 };
        } else if (params.followerRange === "macro") {
          where.followers = { gt: 500000 };
        }
      }

      if (params.location && params.location !== "all") {
        where.location = { contains: params.location, mode: "insensitive" };
      }

      if (params.verifiedOnly) {
        where.verifiedBadge = true;
      }

      if (params.socialVerifiedOnly) {
        where.socialAccounts = {
          some: { isVerified: true },
        };
      }

      if (params.availableOnly) {
        where.isAvailable = true;
      }

      // Order By
      let orderBy: Prisma.CreatorProfileOrderByWithRelationInput = { createdAt: "desc" };
      if (params.sortBy === "followers") {
        orderBy = { followers: "desc" };
      } else if (params.sortBy === "engagement") {
        orderBy = { engagementRate: "desc" };
      } else if (params.sortBy === "verified") {
        orderBy = { verifiedBadge: "desc" };
      } else if (params.sortBy === "recent") {
        orderBy = { createdAt: "desc" };
      }

      // Execute queries
      const [total, profiles] = await Promise.all([
        prisma.creatorProfile.count({ where }),
        prisma.creatorProfile.findMany({
          where,
          include: {
            user: true,
            trustScores: {
              orderBy: { calculatedAt: "desc" },
              take: 1,
              include: { factors: true },
            },
            socialAccounts: true,
            verifications: true,
            engagementSnapshots: {
              orderBy: { recordedAt: "desc" },
              take: 15,
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
      ]);

      let creators = profiles.map(CreatorService.mapPrismaToCreator);

      // In-memory filter/sort for calculated trustScore threshold if requested
      if (params.minTrustScore && params.minTrustScore > 0) {
        creators = creators.filter((c) => c.trustScore >= params.minTrustScore!);
      }

      if (params.sortBy === "trust") {
        creators.sort((a, b) => b.trustScore - a.trustScore);
      } else if (params.sortBy === "risk") {
        creators.sort((a, b) => a.inflatedEngagementProbability - b.inflatedEngagementProbability);
      }

      const totalPages = Math.ceil(total / limit) || 1;

      return {
        creators,
        total,
        page,
        totalPages,
        limit,
      };
    } catch (err) {
      console.warn("Prisma query failed, checking fallback:", err);

      // Fallback for demo environments if DB is unreachable
      let all = await db.listCreators();

      if (params.query?.trim()) {
        const q = params.query.toLowerCase();
        all = all.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.username.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.bio.toLowerCase().includes(q) ||
            c.location.toLowerCase().includes(q)
        );
      }

      if (params.category && params.category !== "all") {
        all = all.filter((c) => c.category.toLowerCase() === params.category!.toLowerCase());
      }

      if (params.platform && params.platform !== "all") {
        all = all.filter((c) => c.platform.toLowerCase() === params.platform!.toLowerCase());
      }

      if (params.minTrustScore && params.minTrustScore > 0) {
        all = all.filter((c) => c.trustScore >= params.minTrustScore!);
      }

      if (params.followerRange === "nano") {
        all = all.filter((c) => c.followers >= 1000 && c.followers <= 10000);
      } else if (params.followerRange === "micro") {
        all = all.filter((c) => c.followers > 10000 && c.followers <= 50000);
      } else if (params.followerRange === "mid") {
        all = all.filter((c) => c.followers > 50000 && c.followers <= 500000);
      } else if (params.followerRange === "macro") {
        all = all.filter((c) => c.followers > 500000);
      }

      if (params.location && params.location !== "all") {
        all = all.filter((c) => c.location.toLowerCase().includes(params.location!.toLowerCase()));
      }

      if (params.verifiedOnly) {
        all = all.filter((c) => c.verifiedBadge);
      }

      if (params.availableOnly) {
        all = all.filter((c) => c.isAvailableForCollaboration);
      }

      // Sort
      all.sort((a, b) => {
        if (params.sortBy === "risk") return a.inflatedEngagementProbability - b.inflatedEngagementProbability;
        if (params.sortBy === "engagement") return b.engagementRate - a.engagementRate;
        if (params.sortBy === "followers") return b.followers - a.followers;
        if (params.sortBy === "verified") return (b.verifiedBadge ? 1 : 0) - (a.verifiedBadge ? 1 : 0);
        return b.trustScore - a.trustScore;
      });

      const total = all.length;
      const paginated = all.slice(offset, offset + limit);
      const totalPages = Math.ceil(total / limit) || 1;

      return { creators: paginated, total, page, totalPages, limit };
    }
  }

  public static async getCreatorById(idOrUsername: string): Promise<Creator | null> {
    const cleanId = idOrUsername.replace("@", "").toLowerCase();

    try {
      const profile = await prisma.creatorProfile.findFirst({
        where: {
          OR: [
            { id: idOrUsername },
            { username: { equals: cleanId, mode: "insensitive" } },
            { username: { equals: `@${cleanId}`, mode: "insensitive" } },
          ],
        },
        include: {
          user: true,
          trustScores: {
            orderBy: { calculatedAt: "desc" },
            take: 1,
            include: { factors: true },
          },
          socialAccounts: true,
          verifications: true,
          engagementSnapshots: {
            orderBy: { recordedAt: "desc" },
            take: 15,
          },
        },
      });

      if (profile) {
        return CreatorService.mapPrismaToCreator(profile);
      }
    } catch (err) {
      console.warn("Prisma getCreatorById error, checking fallback:", err);
    }

    return db.findCreatorById(idOrUsername);
  }

  public static async getLeaderboard(category = "all", platform = "all", limit = 15): Promise<Creator[]> {
    const { creators } = await this.getCreators({
      category,
      platform,
      sortBy: "trust",
      limit,
    });
    return creators;
  }

  /**
   * Onboard a new creator and evaluate their TrustScore with database persistence
   */
  public static async onboardCreator(data: {
    userId?: string;
    name: string;
    username: string;
    category: string;
    location: string;
    platform: "instagram" | "tiktok" | "youtube";
    followers?: number;
    bio?: string;
  }): Promise<Creator> {
    const rawFollowers = data.followers || 15000;
    const rawEngagement = 5.0;
    const cleanUsername = data.username.replace("@", "").toLowerCase();

    // Run TrustScore Engine evaluation
    const evaluation = TrustScoreEngine.evaluate({
      followers: rawFollowers,
      following: 340,
      totalPosts: 120,
      avgLikes: 890,
      avgComments: 65,
      engagementRate: rawEngagement,
      category: data.category,
      isVerified: true,
    });

    try {
      let userId = data.userId;
      if (!userId) {
        const user = await prisma.user.create({
          data: {
            email: `${cleanUsername}@creators.trustscore.io`,
            passwordHash: "unauthenticated_creator_account",
            name: data.name,
            role: "CREATOR",
          },
        });
        userId = user.id;
      }

      const profile = await prisma.creatorProfile.create({
        data: {
          userId,
          username: `@${cleanUsername}`,
          name: data.name,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          bio: data.bio || `Creator in ${data.category}. ${data.location}`,
          category: data.category,
          location: data.location,
          country: "Australia",
          platform: data.platform.toUpperCase() as SocialPlatform,
          followers: rawFollowers,
          following: 340,
          totalPosts: 120,
          avgLikes: 890,
          avgComments: 65,
          engagementRate: rawEngagement,
          startingRate: 350,
          isAvailable: true,
          availabilityStatus: "OPEN_TO_WORK",
          verifiedBadge: true,
          verifiedAt: new Date(),
          dataCoverage: DataCoverage.GOOD,
          trustScores: {
            create: {
              score: evaluation.score,
              scoreBand: evaluation.score >= 90 ? ScoreBand.VERY_HIGH_TRUST : evaluation.score >= 80 ? ScoreBand.HIGH_TRUST : evaluation.score >= 70 ? ScoreBand.MODERATE_RISK : evaluation.score >= 60 ? ScoreBand.HIGH_RISK : ScoreBand.VERY_HIGH_RISK,
              riskLevel: evaluation.score >= 80 ? RiskLevel.LOW : evaluation.score >= 70 ? RiskLevel.MODERATE : evaluation.score >= 60 ? RiskLevel.HIGH : RiskLevel.CRITICAL,
              inflatedProbability: evaluation.inflatedProbability,
              uncertaintyMargin: evaluation.uncertaintyMargin,
              authenticityProbability: evaluation.authenticityProbability,
              commentDiversityPercent: evaluation.commentDiversityPercent,
              growthStabilityScore: evaluation.growthStabilityScore,
              consistencyScore: evaluation.consistencyScore,
              volatilityIndex: evaluation.volatilityIndex,
              dataCoverage: DataCoverage.GOOD,
              modelVersion: "v1.2",
            },
          },
        },
        include: {
          user: true,
          trustScores: {
            orderBy: { calculatedAt: "desc" },
            take: 1,
            include: { factors: true },
          },
        },
      });

      return CreatorService.mapPrismaToCreator(profile);
    } catch (err) {
      console.warn("Prisma creator creation failed, using fallback:", err);
    }

    const newCreator: Creator = {
      id: cleanUsername,
      username: `@${cleanUsername}`,
      name: data.name,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      platform: data.platform,
      category: data.category as any,
      bio: data.bio || `Creator in ${data.category}. ${data.location}`,
      location: data.location,
      joinedDate: "August 2026",
      verifiedBadge: true,
      verifiedDate: "August 2026",
      profileUrl: `https://${data.platform}.com/${cleanUsername}`,
      followers: rawFollowers,
      following: 340,
      totalPosts: 120,
      avgLikes: 890,
      avgComments: 65,
      engagementRate: rawEngagement,
      trustScore: evaluation.score,
      scoreBand: evaluation.scoreBand,
      riskLevel: evaluation.riskLevel,
      inflatedEngagementProbability: evaluation.inflatedProbability,
      uncertaintyMargin: evaluation.uncertaintyMargin,
      authenticityProbability: evaluation.authenticityProbability,
      commentDiversityPercent: evaluation.commentDiversityPercent,
      growthStabilityScore: evaluation.growthStabilityScore,
      engagementConsistencyScore: evaluation.consistencyScore,
      isAvailableForCollaboration: true,
      startingRate: 350,
      preferredCampaignTypes: ["Dedicated Reel", "Story Series"],
      subScores: {
        followerAuthenticity: 94,
        engagementAuthenticity: 92,
        commentQuality: evaluation.commentDiversityPercent,
        growthPattern: evaluation.growthStabilityScore,
        engagementConsistency: evaluation.consistencyScore,
      },
      commentQuality: {
        uniqueCommentsPercent: evaluation.commentDiversityPercent,
        repeatedPatternsPercent: 5,
        genericCommentsPercent: 6,
        emojiOnlyPercent: 4,
        sampleAnalyzedComments: [
          { text: "Great quality advice on this post!", type: "organic", timestamp: "2h ago" },
        ],
        podClusterDetected: false,
        crowdTurfingRisk: "Very Low",
      },
      prescriptiveGuidance: {
        primaryRecommendation: evaluation.prescriptiveGuidance.recommendation,
        recommendedPaymentAdjustment: evaluation.prescriptiveGuidance.paymentAdjustment,
        confidenceLevel: evaluation.confidence,
        alternativeAction: "Standard campaign terms",
        riskMitigationChecklist: evaluation.prescriptiveGuidance.riskChecklist,
      },
      followerGrowthHistory: [
        { month: "Jan", followers: rawFollowers - 1000, expectedOrganic: rawFollowers - 1000 },
        { month: "Dec", followers: rawFollowers, expectedOrganic: rawFollowers },
      ],
      engagementHistory: [],
      positiveFactors: ["Verified direct Graph API connection", "High comment lexical diversity"],
      warningFactors: [],
      engagementVolatilityIndex: evaluation.volatilityIndex,
      analyzedAt: evaluation.calculatedAt,
    };

    return db.createCreatorProfile(newCreator);
  }

  public static async getCreatorByUserId(userId: string): Promise<Creator | null> {
    try {
      const profile = await prisma.creatorProfile.findUnique({
        where: { userId },
        include: {
          user: true,
          trustScores: {
            orderBy: { calculatedAt: "desc" },
            take: 1,
            include: { factors: true },
          },
          socialAccounts: true,
          verifications: true,
          engagementSnapshots: {
            orderBy: { recordedAt: "desc" },
            take: 15,
          },
        },
      });

      if (profile) {
        return CreatorService.mapPrismaToCreator(profile);
      }
    } catch (err) {
      console.warn("Prisma getCreatorByUserId error:", err);
    }

    return db.findCreatorByUserId(userId);
  }

  /**
   * Securely update a creator's profile with server-side ownership authorization
   */
  public static async updateCreatorProfile(
    userId: string,
    creatorId: string,
    updates: {
      name?: string;
      avatar?: string;
      bio?: string;
      category?: string;
      location?: string;
      country?: string;
      platform?: "instagram" | "tiktok" | "youtube";
      website?: string;
      startingRate?: number;
      availabilityStatus?: "OPEN_TO_WORK" | "AVAILABLE_FOR_COLLABORATION" | "NOT_AVAILABLE";
      profileTags?: string[];
      isAvailableForCollaboration?: boolean;
      preferredCampaignTypes?: string[];
    },
    userRole: string = "CREATOR"
  ): Promise<{ success: boolean; creator?: Creator; error?: string }> {
    try {
      const existing = await prisma.creatorProfile.findFirst({
        where: {
          OR: [
            { id: creatorId },
            { userId },
            { username: creatorId.replace("@", "") },
          ],
        },
      });

      if (existing) {
        const isOwner = existing.userId === userId || userRole === "ADMIN";
        if (!isOwner) {
          return { success: false, error: "Unauthorized: You can only edit your own creator profile" };
        }

        const data: Prisma.CreatorProfileUpdateInput = {};
        if (updates.name?.trim()) data.name = updates.name.trim();
        if (updates.avatar?.trim()) data.avatar = updates.avatar.trim();
        if (updates.bio !== undefined) data.bio = updates.bio.trim();
        if (updates.category) data.category = updates.category;
        if (updates.location?.trim()) data.location = updates.location.trim();
        if (updates.country?.trim()) data.country = updates.country.trim();
        if (updates.platform) data.platform = updates.platform.toUpperCase() as SocialPlatform;
        if (updates.website !== undefined) data.website = updates.website.trim() || null;
        if (typeof updates.startingRate === "number") data.startingRate = Math.max(0, updates.startingRate);
        if (updates.availabilityStatus) data.availabilityStatus = updates.availabilityStatus;
        if (Array.isArray(updates.profileTags)) data.profileTags = updates.profileTags;
        if (typeof updates.isAvailableForCollaboration === "boolean") {
          data.isAvailable = updates.isAvailableForCollaboration;
        }

        const updated = await prisma.creatorProfile.update({
          where: { id: existing.id },
          data,
          include: {
            user: true,
            trustScores: {
              orderBy: { calculatedAt: "desc" },
              take: 1,
              include: { factors: true },
            },
            socialAccounts: true,
            verifications: true,
          },
        });

        return { success: true, creator: CreatorService.mapPrismaToCreator(updated) };
      }
    } catch (err) {
      console.warn("Prisma updateCreatorProfile error, trying fallback:", err);
    }

    const creator = await db.findCreatorById(creatorId);
    if (!creator) {
      return { success: false, error: "Creator profile not found" };
    }

    const isOwner = creator.userId === userId || userRole === "ADMIN";
    if (!isOwner) {
      return { success: false, error: "Unauthorized: You can only edit your own creator profile" };
    }

    const cleanUpdates: Partial<Creator> = {};
    if (typeof updates.name === "string" && updates.name.trim()) cleanUpdates.name = updates.name.trim();
    if (typeof updates.avatar === "string" && updates.avatar.trim()) cleanUpdates.avatar = updates.avatar.trim();
    if (typeof updates.bio === "string") cleanUpdates.bio = updates.bio.trim();
    if (typeof updates.category === "string") cleanUpdates.category = updates.category as any;
    if (typeof updates.location === "string") cleanUpdates.location = updates.location.trim();
    if (typeof updates.country === "string") cleanUpdates.country = updates.country.trim();
    if (typeof updates.platform === "string") cleanUpdates.platform = updates.platform;
    if (typeof updates.website === "string") cleanUpdates.website = updates.website.trim();
    if (typeof updates.startingRate === "number") cleanUpdates.startingRate = Math.max(0, updates.startingRate);
    if (updates.availabilityStatus) cleanUpdates.availabilityStatus = updates.availabilityStatus;
    if (Array.isArray(updates.profileTags)) cleanUpdates.profileTags = updates.profileTags;
    if (typeof updates.isAvailableForCollaboration === "boolean") {
      cleanUpdates.isAvailableForCollaboration = updates.isAvailableForCollaboration;
    }
    if (Array.isArray(updates.preferredCampaignTypes)) {
      cleanUpdates.preferredCampaignTypes = updates.preferredCampaignTypes;
    }

    const updated = await db.updateCreatorProfile(creator.id, cleanUpdates);
    if (!updated) {
      return { success: false, error: "Failed to persist profile update" };
    }

    return { success: true, creator: updated };
  }
}
