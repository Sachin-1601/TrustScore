import { prisma } from "@/lib/prisma";
import { db, DBMessage } from "@/db/client";
import { CollaborationRequest } from "@/types/creator";

export class CollaborationService {
  /**
   * Get collaborations for the authenticated user or specific role
   */
  public static async getCollaborations(creatorId?: string, businessId?: string): Promise<CollaborationRequest[]> {
    try {
      const where: any = {};
      if (creatorId) where.creatorId = creatorId;
      if (businessId) where.businessId = businessId;

      const collabs = await prisma.collaboration.findMany({
        where,
        include: {
          creator: true,
          business: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (collabs.length > 0) {
        return collabs.map((c) => ({
          id: c.id,
          creatorId: c.creatorId,
          creatorUsername: c.creator?.username || `@${c.creatorId}`,
          creatorAvatar: c.creator?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          businessName: c.business?.name || "Verified Brand",
          campaignName: c.campaignName,
          campaignDescription: c.campaignDescription,
          budget: c.budget,
          deliverables: c.deliverables,
          timeline: c.timeline,
          contactEmail: c.contactEmail,
          status: (c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase()) as any,
          createdAt: c.createdAt.toISOString(),
        }));
      }
    } catch {
      // fallback to db
    }

    return db.listCollaborations();
  }

  public static async getCollaborationById(id: string): Promise<CollaborationRequest | null> {
    try {
      const c = await prisma.collaboration.findUnique({
        where: { id },
        include: { creator: true, business: true },
      });
      if (c) {
        return {
          id: c.id,
          creatorId: c.creatorId,
          creatorUsername: c.creator?.username || `@${c.creatorId}`,
          creatorAvatar: c.creator?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          businessName: c.business?.name || "Verified Brand",
          campaignName: c.campaignName,
          campaignDescription: c.campaignDescription,
          budget: c.budget,
          deliverables: c.deliverables,
          timeline: c.timeline,
          contactEmail: c.contactEmail,
          status: (c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase()) as any,
          createdAt: c.createdAt.toISOString(),
        };
      }
    } catch {
      // fallback
    }
    return db.findCollaborationById(id);
  }

  public static async createProposal(data: {
    creatorId: string;
    businessId?: string;
    businessName: string;
    campaignName: string;
    campaignDescription: string;
    budget: number;
    deliverables: string;
    timeline: string;
    contactEmail: string;
    senderUserId?: string;
  }): Promise<CollaborationRequest> {
    const creator = await db.findCreatorById(data.creatorId);

    const newCollab: CollaborationRequest = {
      id: `collab-${Date.now()}`,
      creatorId: data.creatorId,
      creatorUsername: creator?.username || `@${data.creatorId}`,
      creatorAvatar: creator?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      businessName: data.businessName,
      campaignName: data.campaignName,
      campaignDescription: data.campaignDescription,
      budget: data.budget,
      deliverables: data.deliverables,
      timeline: data.timeline,
      contactEmail: data.contactEmail,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const saved = await db.createCollaboration(newCollab);

    if (data.senderUserId) {
      await db.createNotification({
        userId: data.senderUserId,
        title: "Proposal Transmitted",
        message: `Your collaboration offer for ${data.campaignName} was sent to ${newCollab.creatorUsername}.`,
        type: "COLLABORATION",
        link: "/dashboard/collaborations",
      });
    }

    return saved;
  }

  public static async updateStatus(id: string, status: CollaborationRequest["status"]): Promise<CollaborationRequest | null> {
    return db.updateCollaborationStatus(id, status);
  }
}

export class MessageService {
  public static async getMessages(collaborationId: string): Promise<DBMessage[]> {
    return db.listMessagesByCollaborationId(collaborationId);
  }

  public static async sendMessage(collaborationId: string, senderId: string, senderName: string, text: string): Promise<DBMessage> {
    return db.createMessage({
      collaborationId,
      senderId,
      senderName,
      text,
    });
  }
}
