import { SocialPlatform } from "@/types/schema";

export interface SocialAccountMetadata {
  platform: SocialPlatform;
  username: string;
  externalId: string;
  isVerified: boolean;
  totalPosts: number;
  followers: number;
  following: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  historicalPeriodMonths: number;
}

export abstract class SocialDataProvider {
  abstract platform: SocialPlatform;
  abstract fetchPublicOrPermissionedMetrics(username: string): Promise<SocialAccountMetadata | null>;
}

export class InstagramGraphProvider extends SocialDataProvider {
  platform: SocialPlatform = "instagram";

  async fetchPublicOrPermissionedMetrics(username: string): Promise<SocialAccountMetadata | null> {
    // In production with META Graph API tokens:
    // GET https://graph.facebook.com/v19.0/{ig_user_id}?fields=...
    return {
      platform: "instagram",
      username: username.replace("@", ""),
      externalId: `ig_${username.replace("@", "")}`,
      isVerified: true,
      totalPosts: 124,
      followers: 24200,
      following: 420,
      avgLikes: 1120,
      avgComments: 88,
      engagementRate: 5.0,
      historicalPeriodMonths: 12,
    };
  }
}

export class TikTokCreatorProvider extends SocialDataProvider {
  platform: SocialPlatform = "tiktok";

  async fetchPublicOrPermissionedMetrics(username: string): Promise<SocialAccountMetadata | null> {
    return {
      platform: "tiktok",
      username: username.replace("@", ""),
      externalId: `tt_${username.replace("@", "")}`,
      isVerified: false,
      totalPosts: 85,
      followers: 38500,
      following: 210,
      avgLikes: 2400,
      avgComments: 140,
      engagementRate: 6.6,
      historicalPeriodMonths: 6,
    };
  }
}

export class YouTubePartnerProvider extends SocialDataProvider {
  platform: SocialPlatform = "youtube";

  async fetchPublicOrPermissionedMetrics(username: string): Promise<SocialAccountMetadata | null> {
    return {
      platform: "youtube",
      username: username.replace("@", ""),
      externalId: `yt_${username.replace("@", "")}`,
      isVerified: true,
      totalPosts: 54,
      followers: 16800,
      following: 80,
      avgLikes: 950,
      avgComments: 110,
      engagementRate: 6.3,
      historicalPeriodMonths: 18,
    };
  }
}
