import { prisma } from "@/lib/prisma";
import { SponsoredAd, AdPackage } from "@/types/creator";
import { AD_PACKAGES } from "@/data/adPackages";
import { AdPlacement, AdStatus } from "@prisma/client";

const PLACEMENT_TO_ENUM: Record<string, AdPlacement> = {
  left_sidebar: "LEFT_SIDEBAR",
  right_sidebar: "RIGHT_SIDEBAR",
  banner: "BANNER",
  feed: "FEED",
};
const ENUM_TO_PLACEMENT: Record<AdPlacement, SponsoredAd["placement"]> = {
  LEFT_SIDEBAR: "left_sidebar",
  RIGHT_SIDEBAR: "right_sidebar",
  BANNER: "banner",
  FEED: "feed",
};

function mapToSponsoredAd(ad: any): SponsoredAd {
  return {
    id: ad.id,
    businessId: ad.business?.slug || ad.businessId,
    businessName: ad.business?.name || "Business",
    businessLogo: ad.business?.logo || "",
    category: ad.business?.category || "",
    tagline: ad.tagline,
    description: ad.description,
    badgeText: (ad.badgeText as any) || "Sponsored",
    ctaText: ad.ctaText || "View Business",
    ctaLink: ad.ctaLink,
    placement: ENUM_TO_PLACEMENT[ad.placement as AdPlacement],
    impressionsCount: ad.impressions,
    clicksCount: ad.clicks,
  };
}

/**
 * AdvertisementService — Prisma-backed. Only ACTIVE (paid & non-expired)
 * advertisements are ever exposed publicly. Commercial advertising is strictly
 * isolated from creator TrustScore calculations.
 */
export class AdvertisementService {
  public static getPackages(): AdPackage[] {
    return AD_PACKAGES;
  }

  private static activeWhere() {
    return { status: AdStatus.ACTIVE, endDate: { gte: new Date() } };
  }

  public static async getAdvertisements(): Promise<SponsoredAd[]> {
    const ads = await prisma.advertisement.findMany({
      where: this.activeWhere(),
      include: { business: true },
      orderBy: { createdAt: "desc" },
    });
    return ads.map(mapToSponsoredAd);
  }

  public static async getAdsByPlacement(placement: SponsoredAd["placement"]): Promise<SponsoredAd[]> {
    const enumPlacement = PLACEMENT_TO_ENUM[placement];
    if (!enumPlacement) return [];
    const ads = await prisma.advertisement.findMany({
      where: { ...this.activeWhere(), placement: enumPlacement },
      include: { business: true },
      orderBy: { createdAt: "desc" },
    });
    return ads.map(mapToSponsoredAd);
  }

  /**
   * Create an advertisement DRAFT for a business. It is created as
   * PENDING_REVIEW and does NOT appear publicly until payment is verified
   * (activation happens in the Stripe webhook handler).
   */
  public static async createDraft(data: {
    businessProfileId: string;
    packageId: string;
    tagline: string;
    description: string;
    ctaLink: string;
    placement: SponsoredAd["placement"];
  }) {
    const enumPlacement = PLACEMENT_TO_ENUM[data.placement] || "LEFT_SIDEBAR";
    const ctaLink = /^https?:\/\//.test(data.ctaLink) ? data.ctaLink : `https://${data.ctaLink}`;

    const ad = await prisma.advertisement.create({
      data: {
        businessId: data.businessProfileId,
        packageId: data.packageId,
        tagline: data.tagline,
        description: data.description,
        ctaLink,
        placement: enumPlacement as AdPlacement,
        status: AdStatus.PENDING_REVIEW,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000),
      },
      include: { business: true },
    });
    return mapToSponsoredAd(ad);
  }

  /** Record a de-duplicated impression via AdEvent + counter increment. */
  public static async recordImpression(adId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const ad = await prisma.advertisement.findUnique({ where: { id: adId }, select: { id: true } });
    if (!ad) return;

    // Basic de-duplication: skip if same IP recorded an impression in last 60s.
    if (ipAddress) {
      const recent = await prisma.adEvent.findFirst({
        where: {
          advertisementId: adId,
          eventType: "IMPRESSION",
          ipAddress,
          createdAt: { gte: new Date(Date.now() - 60_000) },
        },
      });
      if (recent) return;
    }

    await prisma.$transaction([
      prisma.adEvent.create({ data: { advertisementId: adId, eventType: "IMPRESSION", ipAddress, userAgent } }),
      prisma.advertisement.update({ where: { id: adId }, data: { impressions: { increment: 1 } } }),
    ]);
  }

  /** Record a click via AdEvent + counter increment. */
  public static async recordClick(adId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const ad = await prisma.advertisement.findUnique({ where: { id: adId }, select: { id: true } });
    if (!ad) return;
    await prisma.$transaction([
      prisma.adEvent.create({ data: { advertisementId: adId, eventType: "CLICK", ipAddress, userAgent } }),
      prisma.advertisement.update({ where: { id: adId }, data: { clicks: { increment: 1 } } }),
    ]);
  }
}
