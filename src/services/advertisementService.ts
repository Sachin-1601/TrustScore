import { db } from "@/db/client";
import { SponsoredAd, AdPackage } from "@/types/creator";
import { MOCK_AD_PACKAGES } from "@/data/mockAdvertisements";

export class AdvertisementService {
  /**
   * Get packages
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
   * Note: This is strictly commercial and has ZERO effect on creator TrustScore calculations.
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
    const pkg = MOCK_AD_PACKAGES.find((p) => p.id === data.packageId) || MOCK_AD_PACKAGES[0];

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
    };

    return db.createAdvertisement(newAd);
  }

  public static async recordImpressionOrClick(adId: string): Promise<void> {
    return db.recordAdClick(adId);
  }
}
