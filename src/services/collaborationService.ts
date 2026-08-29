import { db } from "@/db/client";
import { CollaborationRequest } from "@/types/creator";
import { DBMessage } from "@/db/client";

export class CollaborationService {
  public static async getCollaborations(): Promise<CollaborationRequest[]> {
    return db.listCollaborations();
  }

  public static async getCollaborationById(id: string): Promise<CollaborationRequest | null> {
    return db.findCollaborationById(id);
  }

  public static async createProposal(data: {
    creatorId: string;
    businessName: string;
    campaignName: string;
    campaignDescription: string;
    budget: number;
    deliverables: string;
    timeline: string;
    contactEmail: string;
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

    // Also trigger in-app notification
    await db.createNotification({
      userId: "user-sarah-business",
      title: "Proposal Transmitted",
      message: `Your collaboration offer for ${data.campaignName} was sent to ${newCollab.creatorUsername}.`,
      type: "COLLABORATION",
      link: "/dashboard/collaborations",
    });

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
