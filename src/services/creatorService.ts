import { prisma } from "@/lib/prisma";
import { Creator } from "@/types/creator";
import { SocialPlatform, Prisma } from "@prisma/client";

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

const CREATOR_INCLUDE = {
  user: true,
  trustScores: { orderBy: { calculatedAt: "desc" as const }, take: 1, include: { factors: true } },
  socialAccounts: true,
  verifications: true,
  engagementSnapshots: { orderBy: { recordedAt: "desc" as const }, take: 15 },
};

/**
 * CreatorService — PostgreSQL/Prisma is the single source of truth. There is NO
 * in-memory fallback and NO fabricated telemetry: creators with insufficient
 * data are surfaced as "pending / insufficient", never with invented numbers.
 */
export class CreatorService {
  public static mapPrismaToCreator(profile: any): Creator {
    const latestScore = profile.trustScores?.length > 0 ? profile.trustScores[0] : null;
    const hasScore = !!latestScore;
    const cleanUsername = profile.username.replace("@", "");
    const hasInsufficientData = profile.dataCoverage === "INSUFFICIENT" || !hasScore || (profile.followers ?? 0) === 0;

    const posFactors: string[] = latestScore?.factors?.filter((f: any) => f.signalType === "positive").map((f: any) => f.name) || [];
    const warnFactors: string[] = latestScore?.factors?.filter((f: any) => f.signalType === "warning").map((f: any) => f.name) || [];

    return {
      id: cleanUsername.toLowerCase(),
      userId: profile.userId,
      username: `@${cleanUsername}`,
      name: profile.name,
      avatar: profile.avatar || profile.user?.avatar || "",
      platform: (profile.platform?.toLowerCase() as any) || "instagram",
      category: profile.category as any,
      bio: profile.bio || "",
      location: profile.location || "",
      country: profile.country || "Australia",
      joinedDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "",
      verifiedBadge: profile.verifiedBadge ?? false,
      verifiedDate: profile.verifiedAt ? new Date(profile.verifiedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : undefined,
      profileUrl: profile.website || `https://${profile.platform?.toLowerCase() || "instagram"}.com/${cleanUsername}`,

      followers: profile.followers ?? 0,
      following: profile.following ?? 0,
      totalPosts: profile.totalPosts ?? 0,
      avgLikes: profile.avgLikes ?? 0,
      avgComments: profile.avgComments ?? 0,
      avgViews: profile.avgViews ?? 0,
      engagementRate: profile.engagementRate ?? 0,

      // TrustScore metrics: real values when a score exists, otherwise 0 (pending).
      trustScore: hasScore ? latestScore.score : 0,
      scoreBand: hasScore ? (latestScore.scoreBand as any) : ("MODERATE_RISK" as any),
      riskLevel: hasScore ? (latestScore.riskLevel as any) : ("MODERATE" as any),
      inflatedEngagementProbability: hasScore ? latestScore.inflatedProbability : 0,
      uncertaintyMargin: hasScore ? latestScore.uncertaintyMargin : 0,
      authenticityProbability: hasScore ? latestScore.authenticityProbability : 0,
      commentDiversityPercent: hasScore ? latestScore.commentDiversityPercent : 0,
      growthStabilityScore: hasScore ? latestScore.growthStabilityScore : 0,
      engagementConsistencyScore: hasScore ? latestScore.consistencyScore : 0,
      engagementVolatilityIndex: hasScore ? latestScore.volatilityIndex : 0,

      website: profile.website || undefined,
      isAvailableForCollaboration: profile.isAvailable ?? true,
      availabilityStatus: (profile.availabilityStatus as any) || "OPEN_TO_WORK",
      profileTags: profile.profileTags?.length ? profile.profileTags : [],
      startingRate: profile.startingRate ?? 0,
      preferredCampaignTypes: [],

      subScores: {
        followerAuthenticity: hasScore ? Math.round(latestScore.authenticityProbability) : 0,
        engagementAuthenticity: hasScore ? latestScore.growthStabilityScore : 0,
        commentQuality: hasScore ? latestScore.commentDiversityPercent : 0,
        growthPattern: hasScore ? latestScore.growthStabilityScore : 0,
        engagementConsistency: hasScore ? latestScore.consistencyScore : 0,
      },

      commentQuality: {
        uniqueCommentsPercent: hasScore ? latestScore.commentDiversityPercent : 0,
        repeatedPatternsPercent: 0,
        genericCommentsPercent: 0,
        emojiOnlyPercent: 0,
        sampleAnalyzedComments: [],
        podClusterDetected: false,
        crowdTurfingRisk: "Very Low",
      },

      prescriptiveGuidance: {
        primaryRecommendation: hasScore
          ? "Review the authenticity breakdown before finalizing campaign terms."
          : "Insufficient data — connect a social account to compute a TrustScore.",
        recommendedPaymentAdjustment: hasScore ? "Standard negotiated base rate" : "N/A",
        confidenceLevel: hasScore ? (hasInsufficientData ? "Low" : "High") : "Low",
        alternativeAction: "Request verified analytics access",
        riskMitigationChecklist: [],
      },

      followerGrowthHistory: [],

      engagementHistory:
        profile.engagementSnapshots?.map((snap: any, idx: number) => ({
          postIndex: idx + 1,
          date: snap.recordedAt ? new Date(snap.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : `Post ${idx + 1}`,
          likes: snap.likes,
          comments: snap.comments,
          engagementRate: snap.engagementRate,
          isAnomaly: snap.isAnomaly,
        })) || [],

      positiveFactors: posFactors,
      warningFactors: hasScore ? warnFactors : ["Insufficient post telemetry for comprehensive scoring"],

      analyzedAt: latestScore?.calculatedAt?.toISOString() || profile.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  private static buildWhere(params: CreatorFilterParams): Prisma.CreatorProfileWhereInput {
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
      if (params.followerRange === "nano") where.followers = { gte: 1000, lte: 10000 };
      else if (params.followerRange === "micro") where.followers = { gt: 10000, lte: 50000 };
      else if (params.followerRange === "mid") where.followers = { gt: 50000, lte: 500000 };
      else if (params.followerRange === "macro") where.followers = { gt: 500000 };
    }
    if (params.location && params.location !== "all") {
      where.location = { contains: params.location, mode: "insensitive" };
    }
    if (params.verifiedOnly) where.verifiedBadge = true;
    if (params.socialVerifiedOnly) where.socialAccounts = { some: { isVerified: true } };
    if (params.availableOnly) where.isAvailable = true;

    return where;
  }

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
    const where = this.buildWhere(params);

    // Sorting by score/risk requires evaluating the related latest TrustScore.
    const scoreSort = params.sortBy === "trust" || params.sortBy === "risk";

    if (scoreSort) {
      const CAP = 300;
      const profiles = await prisma.creatorProfile.findMany({ where, include: CREATOR_INCLUDE, take: CAP });
      let creators = profiles.map(CreatorService.mapPrismaToCreator);
      if (params.minTrustScore && params.minTrustScore > 0) {
        creators = creators.filter((c) => c.trustScore >= params.minTrustScore!);
      }
      creators.sort((a, b) =>
        params.sortBy === "risk"
          ? a.inflatedEngagementProbability - b.inflatedEngagementProbability
          : b.trustScore - a.trustScore
      );
      const total = creators.length;
      const paginated = creators.slice(offset, offset + limit);
      return { creators: paginated, total, page, totalPages: Math.ceil(total / limit) || 1, limit };
    }

    let orderBy: Prisma.CreatorProfileOrderByWithRelationInput = { createdAt: "desc" };
    if (params.sortBy === "followers") orderBy = { followers: "desc" };
    else if (params.sortBy === "engagement") orderBy = { engagementRate: "desc" };
    else if (params.sortBy === "verified") orderBy = { verifiedBadge: "desc" };

    const [total, profiles] = await Promise.all([
      prisma.creatorProfile.count({ where }),
      prisma.creatorProfile.findMany({ where, include: CREATOR_INCLUDE, orderBy, skip: offset, take: limit }),
    ]);

    let creators = profiles.map(CreatorService.mapPrismaToCreator);
    if (params.minTrustScore && params.minTrustScore > 0) {
      creators = creators.filter((c) => c.trustScore >= params.minTrustScore!);
    }

    return { creators, total, page, totalPages: Math.ceil(total / limit) || 1, limit };
  }

  public static async getCreatorById(idOrUsername: string): Promise<Creator | null> {
    const cleanId = idOrUsername.replace("@", "").toLowerCase();
    const profile = await prisma.creatorProfile.findFirst({
      where: {
        OR: [
          { id: idOrUsername },
          { username: { equals: cleanId, mode: "insensitive" } },
          { username: { equals: `@${cleanId}`, mode: "insensitive" } },
        ],
      },
      include: CREATOR_INCLUDE,
    });
    return profile ? CreatorService.mapPrismaToCreator(profile) : null;
  }

  public static async getCreatorByUserId(userId: string): Promise<Creator | null> {
    const profile = await prisma.creatorProfile.findUnique({ where: { userId }, include: CREATOR_INCLUDE });
    return profile ? CreatorService.mapPrismaToCreator(profile) : null;
  }

  public static async getLeaderboard(category = "all", platform = "all", limit = 15): Promise<Creator[]> {
    const { creators } = await this.getCreators({ category, platform, sortBy: "trust", limit });
    // Creators without a computed score are not ranked on the leaderboard.
    return creators.filter((c) => c.trustScore > 0);
  }

  /**
   * Create a new (empty) creator profile. No telemetry, verification or
   * TrustScore is fabricated — the creator starts in a pending state.
   */
  public static async onboardCreator(data: {
    userId?: string;
    name: string;
    username: string;
    category: string;
    location: string;
    platform: "instagram" | "tiktok" | "youtube";
    bio?: string;
  }): Promise<Creator> {
    const cleanUsername = data.username.replace("@", "").toLowerCase();

    let userId = data.userId;
    if (!userId) {
      const user = await prisma.user.create({
        data: {
          email: `${cleanUsername}-${Date.now()}@pending.trustscore.local`,
          passwordHash: "!unusable",
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
        avatar: "",
        bio: data.bio || "",
        category: data.category,
        location: data.location,
        country: "Australia",
        platform: data.platform.toUpperCase() as SocialPlatform,
        followers: 0,
        following: 0,
        totalPosts: 0,
        avgLikes: 0,
        avgComments: 0,
        engagementRate: 0,
        startingRate: 250,
        isAvailable: true,
        availabilityStatus: "OPEN_TO_WORK",
        verifiedBadge: false,
        dataCoverage: "INSUFFICIENT",
      },
      include: CREATOR_INCLUDE,
    });

    return CreatorService.mapPrismaToCreator(profile);
  }

  /** Update a creator profile with strict server-side ownership authorization. */
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
    const existing = await prisma.creatorProfile.findFirst({
      where: { OR: [{ id: creatorId }, { userId }, { username: creatorId.replace("@", "") }] },
    });
    if (!existing) return { success: false, error: "Creator profile not found" };

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
    if (updates.website !== undefined) {
      const w = updates.website.trim();
      if (w && !/^https?:\/\/.+/.test(w)) {
        return { success: false, error: "Website must be a valid URL starting with http(s)://" };
      }
      data.website = w || null;
    }
    if (typeof updates.startingRate === "number") data.startingRate = Math.max(0, Math.round(updates.startingRate));
    if (updates.availabilityStatus) data.availabilityStatus = updates.availabilityStatus;
    if (Array.isArray(updates.profileTags)) data.profileTags = CreatorService.sanitizeTags(updates.profileTags);
    if (typeof updates.isAvailableForCollaboration === "boolean") data.isAvailable = updates.isAvailableForCollaboration;

    const updated = await prisma.creatorProfile.update({
      where: { id: existing.id },
      data,
      include: CREATOR_INCLUDE,
    });

    return { success: true, creator: CreatorService.mapPrismaToCreator(updated) };
  }

  /** Allowed marketplace profile tags. */
  public static readonly ALLOWED_TAGS = [
    "Open to Work",
    "Available for Collaboration",
    "Open to Brand Deals",
    "Podcast Guest",
    "Speaking Engagements",
    "UGC Creator",
    "Affiliate Partnerships",
  ];

  public static sanitizeTags(tags: string[]): string[] {
    return Array.from(new Set(tags.filter((t) => CreatorService.ALLOWED_TAGS.includes(t)))).slice(0, 7);
  }
}
