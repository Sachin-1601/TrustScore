import { prisma } from "@/lib/prisma";
import { getInstagramApiVersion } from "@/lib/instagramOAuth";
import { decryptSecret } from "@/lib/encryption";
import { TrustScoreEngine, CreatorTelemetryInput } from "@/services/trustScoreEngine";

export interface InstagramProfileData {
  id: string;
  username: string;
  name?: string;
  account_type?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  biography?: string;
  website?: string;
}

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

export interface InstagramMediaInsights {
  reach?: number;
  saved?: number;
  engagement?: number;
  impressions?: number;
  views?: number;
  total_interactions?: number;
}

export interface InstagramSyncResult {
  success: boolean;
  username: string;
  followers: number;
  totalPosts: number;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  trustScore: number;
  verifiedBadge: boolean;
  syncedAt: string;
  error?: string;
}

export class InstagramService {
  /**
   * Fetch creator's Instagram professional profile details
   * GET https://graph.instagram.com/{version}/me
   */
  public static async getInstagramProfile(accessToken: string): Promise<InstagramProfileData> {
    const version = getInstagramApiVersion();
    const fields = "id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count,biography,website";
    const url = `https://graph.instagram.com/${version}/me?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(url, { method: "GET" });
    const data = await response.json();

    if (!response.ok || data.error || !data.id) {
      // Fallback without version prefix if required
      const fallbackUrl = `https://graph.instagram.com/me?fields=${fields}&access_token=${encodeURIComponent(accessToken)}`;
      const fallbackRes = await fetch(fallbackUrl, { method: "GET" });
      const fallbackData = await fallbackRes.json();

      if (!fallbackRes.ok || fallbackData.error || !fallbackData.id) {
        const errorMsg = fallbackData.error?.message || data.error?.message || "Failed to fetch Instagram profile";
        throw new Error(errorMsg);
      }
      return fallbackData;
    }

    return data;
  }

  /**
   * Fetch recent media items
   * GET https://graph.instagram.com/{version}/me/media
   */
  public static async getInstagramMedia(
    accessToken: string,
    limit: number = 25
  ): Promise<InstagramMediaItem[]> {
    const version = getInstagramApiVersion();
    const fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count";
    const url = `https://graph.instagram.com/${version}/me/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(accessToken)}`;

    try {
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      if (!response.ok || data.error || !Array.isArray(data.data)) {
        console.warn("[Instagram API] getInstagramMedia returned error:", data.error?.message);
        return [];
      }

      return data.data;
    } catch (err) {
      console.error("[Instagram API] getInstagramMedia network failure:", err);
      return [];
    }
  }

  /**
   * Fetch account level daily insights
   * GET https://graph.instagram.com/{version}/me/insights
   */
  public static async getInstagramAccountInsights(accessToken: string): Promise<any[]> {
    const version = getInstagramApiVersion();
    const metrics = "impressions,reach,profile_views";
    const url = `https://graph.instagram.com/${version}/me/insights?metric=${metrics}&period=day&access_token=${encodeURIComponent(accessToken)}`;

    try {
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      if (!response.ok || data.error || !Array.isArray(data.data)) {
        return [];
      }

      return data.data;
    } catch {
      return [];
    }
  }

  /**
   * Fetch individual media item insights
   * GET https://graph.instagram.com/{version}/{media_id}/insights
   */
  public static async getInstagramMediaInsights(
    mediaId: string,
    accessToken: string
  ): Promise<InstagramMediaInsights | null> {
    const version = getInstagramApiVersion();
    const metrics = "reach,saved,total_interactions";
    const url = `https://graph.instagram.com/${version}/${mediaId}/insights?metric=${metrics}&access_token=${encodeURIComponent(accessToken)}`;

    try {
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      if (!response.ok || data.error || !Array.isArray(data.data)) {
        return null;
      }

      const insights: InstagramMediaInsights = {};
      for (const item of data.data) {
        const val = item.values?.[0]?.value ?? item.total_value?.value;
        if (item.name === "reach") insights.reach = Number(val) || 0;
        if (item.name === "saved") insights.saved = Number(val) || 0;
        if (item.name === "total_interactions" || item.name === "engagement") insights.engagement = Number(val) || 0;
        if (item.name === "impressions" || item.name === "views") insights.impressions = Number(val) || 0;
      }
      return insights;
    } catch {
      return null;
    }
  }

  /**
   * Complete synchronization pipeline for a creator's connected Instagram account
   * Retrieves profile, media, snapshots, updates DB models, and calculates real TrustScore.
   */
  public static async syncInstagramDataForCreator(
    userId: string,
    explicitAccessToken?: string
  ): Promise<InstagramSyncResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creatorProfile: {
          include: {
            socialAccounts: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User account not found");
    }

    let creatorProfile = user.creatorProfile;

    // Resolve Access Token
    let token = explicitAccessToken;
    const existingIgAccount = creatorProfile?.socialAccounts?.find(
      (sa) => sa.platform === "INSTAGRAM"
    );

    if (!token && existingIgAccount?.oauthTokenEnc) {
      try {
        token = decryptSecret(existingIgAccount.oauthTokenEnc);
      } catch (err) {
        console.error("[Instagram Sync] Failed to decrypt access token:", err);
        throw new Error("Unable to decrypt stored Instagram access token. Please reconnect your account.");
      }
    }

    if (!token) {
      throw new Error("No active Instagram access token found for this creator. Please connect your Instagram account.");
    }

    // 1. Fetch Instagram Profile Details
    const profile = await this.getInstagramProfile(token);
    const cleanUsername = (profile.username || "creator").replace(/^@+/, "");
    const followers = Number(profile.followers_count) || (creatorProfile?.followers || 0);
    const following = Number(profile.follows_count) || (creatorProfile?.following || 0);
    const totalPosts = Number(profile.media_count) || (creatorProfile?.totalPosts || 0);

    // 2. Fetch Recent Media Items
    const mediaItems = await this.getInstagramMedia(token, 25);

    let totalLikes = 0;
    let totalComments = 0;
    let validPostCount = 0;

    const engagementHistory: any[] = [];

    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      const likes = typeof item.like_count === "number" ? item.like_count : 0;
      const comments = typeof item.comments_count === "number" ? item.comments_count : 0;
      totalLikes += likes;
      totalComments += comments;
      validPostCount++;

      const postEngagementRate = followers > 0
        ? Number((((likes + comments) / followers) * 100).toFixed(2))
        : 0;

      engagementHistory.push({
        postIndex: i + 1,
        postId: item.id,
        date: item.timestamp ? new Date(item.timestamp).toLocaleDateString() : `Post ${i + 1}`,
        recordedAt: item.timestamp ? new Date(item.timestamp) : new Date(),
        likes,
        comments,
        views: Math.round(likes * 1.8),
        engagementRate: postEngagementRate,
        isAnomaly: false,
      });
    }

    const avgLikes = validPostCount > 0 ? Math.round(totalLikes / validPostCount) : (creatorProfile?.avgLikes || 0);
    const avgComments = validPostCount > 0 ? Math.round(totalComments / validPostCount) : (creatorProfile?.avgComments || 0);
    const calculatedEngagementRate = followers > 0 && validPostCount > 0
      ? Number((((avgLikes + avgComments) / followers) * 100).toFixed(2))
      : (creatorProfile?.engagementRate || 0.0);

    const now = new Date();

    // 3. Persist or Upsert CreatorProfile
    if (!creatorProfile) {
      creatorProfile = await prisma.creatorProfile.create({
        data: {
          userId: user.id,
          username: `@${cleanUsername}`,
          name: profile.name || user.name,
          avatar: profile.profile_picture_url || user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          bio: profile.biography || "Verified Instagram Content Creator",
          category: "Lifestyle",
          location: "Global",
          country: "Australia",
          platform: "INSTAGRAM",
          followers,
          following,
          totalPosts,
          avgLikes,
          avgComments,
          avgViews: Math.round(avgLikes * 2),
          engagementRate: calculatedEngagementRate,
          verifiedBadge: true,
          verifiedAt: now,
          dataCoverage: validPostCount >= 10 ? "EXCELLENT" : "GOOD",
        },
        include: { socialAccounts: true },
      });
    } else {
      creatorProfile = await prisma.creatorProfile.update({
        where: { id: creatorProfile.id },
        data: {
          followers: followers > 0 ? followers : creatorProfile.followers,
          following: following > 0 ? following : creatorProfile.following,
          totalPosts: totalPosts > 0 ? totalPosts : creatorProfile.totalPosts,
          avgLikes,
          avgComments,
          avgViews: Math.round(avgLikes * 2),
          engagementRate: calculatedEngagementRate,
          verifiedBadge: true,
          verifiedAt: now,
          dataCoverage: validPostCount >= 10 ? "EXCELLENT" : "GOOD",
          avatar: profile.profile_picture_url || creatorProfile.avatar,
          bio: profile.biography || creatorProfile.bio,
        },
        include: { socialAccounts: true },
      });
    }

    // 4. Update or Upsert SocialAccount
    await prisma.socialAccount.upsert({
      where: {
        platform_externalId: {
          platform: "INSTAGRAM",
          externalId: profile.id,
        },
      },
      create: {
        creatorId: creatorProfile.id,
        platform: "INSTAGRAM",
        externalId: profile.id,
        username: cleanUsername,
        isVerified: true,
        lastSyncedAt: now,
      },
      update: {
        creatorId: creatorProfile.id,
        username: cleanUsername,
        isVerified: true,
        lastSyncedAt: now,
      },
    });

    // 5. Record Verification Evidence
    await prisma.verificationRecord.create({
      data: {
        creatorId: creatorProfile.id,
        method: "OAUTH_GRAPH_API",
        evidenceRef: `ig_user_${profile.id}`,
        verifiedAt: now,
      },
    });

    // 6. Record Engagement Snapshots for Recent Posts
    if (engagementHistory.length > 0) {
      // Clear previous snapshots to avoid duplicate postIndex keys
      await prisma.engagementSnapshot.deleteMany({
        where: { creatorId: creatorProfile.id },
      });

      await prisma.engagementSnapshot.createMany({
        data: engagementHistory.map((snap) => ({
          creatorId: creatorProfile.id,
          postIndex: snap.postIndex,
          postId: snap.postId,
          recordedAt: snap.recordedAt,
          likes: snap.likes,
          comments: snap.comments,
          views: snap.views,
          engagementRate: snap.engagementRate,
          isAnomaly: false,
        })),
      });
    }

    // 7. Run Bayesian TrustScore Evaluation Engine
    const telemetryInput: CreatorTelemetryInput = {
      followers,
      following,
      totalPosts,
      avgLikes,
      avgComments,
      engagementRate: calculatedEngagementRate,
      engagementHistory: engagementHistory.map((h) => ({
        postIndex: h.postIndex,
        date: h.date,
        likes: h.likes,
        comments: h.comments,
        engagementRate: h.engagementRate,
        views: h.views,
        isAnomaly: false,
      })),
      category: creatorProfile.category,
      isVerified: true,
    };

    const evaluation = TrustScoreEngine.evaluate(telemetryInput);

    // 8. Persist TrustScore Record & Factor Breakdown
    const trustScoreRecord = await prisma.trustScoreRecord.create({
      data: {
        creatorId: creatorProfile.id,
        score: evaluation.score,
        scoreBand: evaluation.scoreBand.toUpperCase().replace(/\s+/g, "_") as any,
        riskLevel: evaluation.riskLevel.toUpperCase() as any,
        inflatedProbability: evaluation.inflatedProbability,
        uncertaintyMargin: evaluation.uncertaintyMargin,
        authenticityProbability: evaluation.authenticityProbability,
        commentDiversityPercent: evaluation.commentDiversityPercent,
        growthStabilityScore: evaluation.growthStabilityScore,
        consistencyScore: evaluation.consistencyScore,
        volatilityIndex: evaluation.volatilityIndex,
        dataCoverage: evaluation.dataCoverage.toUpperCase() as any,
        modelVersion: evaluation.modelVersion,
        calculatedAt: now,
        factors: {
          create: evaluation.factors.map((f) => ({
            name: f.name,
            score: f.score,
            signalType: f.signalType,
            description: f.description,
          })),
        },
      },
    });

    return {
      success: true,
      username: cleanUsername,
      followers,
      totalPosts,
      engagementRate: calculatedEngagementRate,
      avgLikes,
      avgComments,
      trustScore: trustScoreRecord.score,
      verifiedBadge: true,
      syncedAt: now.toISOString(),
    };
  }
}
