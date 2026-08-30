import { db } from "@/db/client";
import { SponsoredAd, AdPackage } from "@/types/creator";
import { MOCK_AD_PACKAGES } from "@/data/mockAdvertisements";

export class AdvertisementService {
  /**
   * Get advertising packages
   */
  public static getPackages(): AdPackage[] {
    return MOCK_AD_PACKAGES;
  }

  /**
   * Get all active advertisements
   */
  public static async getAdvertisements(): Promise<SponsoredAd[]> {
    return db.listAdvertisements();
  }

  /**
   * Get ads for a specific placement slot
   */
  public static async getAdsByPlacement(placement: SponsoredAd["placement"]): Promise<SponsoredAd[]> {
    return db.listAdvertisementsByPlacement(placement);
  }

  /**
   * Create a new sponsored advertisement placement
   * Note: Commercial advertising is strictly isolated from creator TrustScore calculations.
   */
  public static async createAdvertisement(data: {
    businessName: string;
    category: string;
    tagline: string;
    description: string;
    ctaLink: string;
    packageId: "starter" | "growth" | "premium";
    placement: SponsoredAd["placement"];
  }): Promise<SponsoredAd> {
    const newAd: SponsoredAd = {
      id: `ad-${Date.now()}`,
      businessId: data.businessName.toLowerCase().replace(/\s+/g, "-"),
      businessName: data.businessName,
      businessLogo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&auto=format&fit=crop&q=80",
      tagline: data.tagline,
      description: data.description,
      category: data.category,
      badgeText: "Sponsored",
      ctaText: "Learn More",
      ctaLink: data.ctaLink.startsWith("http") ? data.ctaLink : `https://${data.ctaLink}`,
      placement: data.placement,
      impressionsCount: 0,
      clicksCount: 0,
    };

    return db.createAdvertisement(newAd);
  }

  /**
   * Track ad impression without altering click count
   */
  public static async recordImpression(adId: string): Promise<void> {
    return db.recordAdImpression(adId);
  }

  /**
   * Track ad click without altering impression count
   */
  public static async recordClick(adId: string): Promise<void> {
    return db.recordAdClick(adId);
  }
}
