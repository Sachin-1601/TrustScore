import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@prisma/client";

export interface CreateCampaignDTO {
  businessId: string;
  title: string;
  category: string;
  budget: number;
  deliverables: string;
  targetMinTrustScore?: number;
  targetFollowerRange?: string;
  startDate?: string;
  endDate?: string;
}

export interface CampaignFilterDTO {
  category?: string;
  status?: CampaignStatus;
  minTrustScore?: number;
  query?: string;
  businessId?: string;
}

export class CampaignService {
  /**
   * List campaigns with optional filtering
   */
  public static async getCampaigns(filters: CampaignFilterDTO = {}) {
    try {
      const where: any = {};

      if (filters.businessId) {
        where.businessId = filters.businessId;
      }
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.category && filters.category !== "all") {
        where.category = { equals: filters.category, mode: "insensitive" };
      }
      if (filters.minTrustScore) {
        where.targetMinTrustScore = { lte: filters.minTrustScore };
      }
      if (filters.query?.trim()) {
        where.OR = [
          { title: { contains: filters.query, mode: "insensitive" } },
          { category: { contains: filters.query, mode: "insensitive" } },
          { deliverables: { contains: filters.query, mode: "insensitive" } },
        ];
      }

      const campaigns = await prisma.campaign.findMany({
        where,
        include: {
          business: true,
          applications: {
            include: {
              creator: true,
            },
          },
          _count: {
            select: { applications: true, collaborations: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return campaigns;
    } catch (err) {
      console.warn("Prisma getCampaigns fallback", err);
      return [];
    }
  }

  /**
   * Get single campaign by ID
   */
  public static async getCampaignById(id: string) {
    try {
      return await prisma.campaign.findUnique({
        where: { id },
        include: {
          business: true,
          applications: {
            include: {
              creator: true,
            },
          },
          collaborations: true,
        },
      });
    } catch {
      return null;
    }
  }

  /**
   * Create a new campaign for a business
   */
  public static async createCampaign(data: CreateCampaignDTO) {
    return prisma.campaign.create({
      data: {
        businessId: data.businessId,
        title: data.title,
        category: data.category,
        budget: data.budget,
        deliverables: data.deliverables,
        targetMinTrustScore: data.targetMinTrustScore || 80,
        targetFollowerRange: data.targetFollowerRange || "10k-50k",
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: "ACTIVE",
      },
      include: {
        business: true,
      },
    });
  }

  /**
   * Apply to a campaign as a creator
   */
  public static async applyToCampaign(data: {
    campaignId: string;
    creatorId: string;
    pitch: string;
    proposedRate: number;
  }) {
    return prisma.campaignApplication.create({
      data: {
        campaignId: data.campaignId,
        creatorId: data.creatorId,
        pitch: data.pitch,
        proposedRate: data.proposedRate,
        status: "PENDING",
      },
      include: {
        campaign: true,
        creator: true,
      },
    });
  }

  /**
   * Get applications for a creator
   */
  public static async getCreatorApplications(creatorId: string) {
    try {
      return await prisma.campaignApplication.findMany({
        where: { creatorId },
        include: {
          campaign: {
            include: {
              business: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      return [];
    }
  }

  /**
   * Update application status (ACCEPT / DECLINE)
   */
  public static async updateApplicationStatus(applicationId: string, status: "ACCEPTED" | "DECLINED") {
    return prisma.campaignApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        campaign: true,
        creator: true,
      },
    });
  }
}
