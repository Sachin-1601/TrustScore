import { prisma } from "@/lib/prisma";
import { Business } from "@/types/creator";
import { getServerSession } from "@/lib/session";

/**
 * BusinessService — backed exclusively by PostgreSQL/Prisma.
 */
export class BusinessService {
  private static mapToBusiness(bp: any): Business {
    return {
      id: bp.slug,
      slug: bp.slug,
      name: bp.name,
      logo: bp.logo,
      category: bp.category,
      location: bp.location || "Global",
      tagline: bp.tagline || "",
      description: bp.description || "",
      website: bp.website || "",
      isSponsored: bp.isSponsored ?? false,
      activeCampaignsCount: bp._count?.campaigns ?? bp.activeCampaignsCount ?? 0,
      productsOrServices: [],
      openOpportunities: (bp.campaigns || [])
        .filter((c: any) => c.status === "ACTIVE" || c.status === "PENDING")
        .map((c: any) => ({
          title: c.title,
          budget: `$${Math.round(c.budget).toLocaleString()}`,
          deliverables: c.deliverables,
          category: c.category as any,
        })),
      contactEmail: bp.user?.email || "",
      joinedDate: bp.createdAt
        ? new Date(bp.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "",
    };
  }

  public static async getBusinesses(query?: string, category?: string): Promise<Business[]> {
    const where: any = {};
    if (query?.trim()) {
      const q = query.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
      ];
    }
    if (category && category !== "all") {
      where.category = { equals: category, mode: "insensitive" };
    }

    const businesses = await prisma.businessProfile.findMany({
      where,
      include: {
        user: { select: { email: true } },
        campaigns: true,
        _count: { select: { campaigns: true } },
      },
      orderBy: [{ isSponsored: "desc" }, { createdAt: "desc" }],
    });

    return businesses.map(BusinessService.mapToBusiness);
  }

  public static async getBusinessBySlug(slug: string): Promise<Business | null> {
    const bp = await prisma.businessProfile.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      include: {
        user: { select: { email: true } },
        campaigns: true,
        _count: { select: { campaigns: true } },
      },
    });
    if (!bp) return null;
    return BusinessService.mapToBusiness(bp);
  }

  public static async getBusinessProfileByUserId(userId: string) {
    return prisma.businessProfile.findUnique({ where: { userId } });
  }

  /**
   * Update the authenticated user's own business profile (real, user-entered data).
   */
  public static async updateOwnBusiness(
    userId: string,
    updates: {
      name?: string;
      logo?: string;
      category?: string;
      location?: string;
      tagline?: string;
      description?: string;
      website?: string;
    }
  ): Promise<{ success: boolean; business?: Business; error?: string }> {
    const bp = await prisma.businessProfile.findUnique({ where: { userId } });
    if (!bp) return { success: false, error: "Business profile not found" };

    const data: any = {};
    if (typeof updates.name === "string" && updates.name.trim()) data.name = updates.name.trim();
    if (typeof updates.logo === "string" && updates.logo.trim()) data.logo = updates.logo.trim();
    if (typeof updates.category === "string" && updates.category.trim()) data.category = updates.category.trim();
    if (typeof updates.location === "string") data.location = updates.location.trim();
    if (typeof updates.tagline === "string") data.tagline = updates.tagline.trim();
    if (typeof updates.description === "string") data.description = updates.description.trim();
    if (typeof updates.website === "string") {
      const w = updates.website.trim();
      if (w && !/^https?:\/\/.+/.test(w)) {
        return { success: false, error: "Website must be a valid URL starting with http(s)://" };
      }
      data.website = w;
    }

    const updated = await prisma.businessProfile.update({
      where: { id: bp.id },
      data,
      include: { user: { select: { email: true } }, campaigns: true, _count: { select: { campaigns: true } } },
    });

    return { success: true, business: BusinessService.mapToBusiness(updated) };
  }
}
