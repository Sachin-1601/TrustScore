import { prisma } from "@/lib/prisma";
import { CollaborationRequest } from "@/types/creator";
import { CollaborationStatus } from "@prisma/client";
import { SessionPayload } from "@/lib/session";

interface DBMessageView {
  id: string;
  collaborationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

function toRequest(c: any): CollaborationRequest {
  return {
    id: c.id,
    creatorId: c.creatorId,
    creatorUsername: c.creator?.username || `@${c.creatorId}`,
    creatorAvatar: c.creator?.avatar || "",
    businessName: c.business?.name || "Business",
    campaignName: c.campaignName,
    campaignDescription: c.campaignDescription,
    budget: c.budget,
    deliverables: c.deliverables,
    timeline: c.timeline,
    contactEmail: c.contactEmail,
    status: (c.status.charAt(0) + c.status.slice(1).toLowerCase()) as any,
    createdAt: c.createdAt.toISOString(),
  };
}

/** Valid collaboration lifecycle transitions. */
const TRANSITIONS: Record<CollaborationStatus, CollaborationStatus[]> = {
  PENDING: ["ACCEPTED", "DECLINED", "CANCELLED"],
  ACCEPTED: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["COMPLETED", "CANCELLED"],
  DECLINED: [],
  COMPLETED: [],
  CANCELLED: [],
};

export class CollaborationService {
  /** Resolve the authenticated actor's business/creator profile ids. */
  private static async resolveActor(session: SessionPayload) {
    const [business, creator] = await Promise.all([
      prisma.businessProfile.findUnique({ where: { userId: session.userId }, select: { id: true } }),
      prisma.creatorProfile.findUnique({ where: { userId: session.userId }, select: { id: true } }),
    ]);
    return {
      isAdmin: session.role === "ADMIN",
      businessProfileId: business?.id,
      creatorProfileId: creator?.id,
    };
  }

  /** List collaborations visible to the authenticated user only. */
  public static async getCollaborationsForSession(session: SessionPayload): Promise<CollaborationRequest[]> {
    const actor = await this.resolveActor(session);

    const where: any = {};
    if (!actor.isAdmin) {
      const or: any[] = [];
      if (actor.businessProfileId) or.push({ businessId: actor.businessProfileId });
      if (actor.creatorProfileId) or.push({ creatorId: actor.creatorProfileId });
      if (or.length === 0) return [];
      where.OR = or;
    }

    const collabs = await prisma.collaboration.findMany({
      where,
      include: { creator: true, business: true },
      orderBy: { createdAt: "desc" },
    });
    return collabs.map(toRequest);
  }

  /** Fetch a single collaboration if the session user is an authorized participant. */
  public static async getAuthorizedCollaboration(id: string, session: SessionPayload) {
    const actor = await this.resolveActor(session);
    const c = await prisma.collaboration.findUnique({
      where: { id },
      include: { creator: true, business: true },
    });
    if (!c) return { collaboration: null, authorized: false, notFound: true };

    const authorized =
      actor.isAdmin ||
      (!!actor.businessProfileId && c.businessId === actor.businessProfileId) ||
      (!!actor.creatorProfileId && c.creatorId === actor.creatorProfileId);

    return { collaboration: c, authorized, notFound: false };
  }

  /**
   * Business creates a collaboration proposal for a creator. Business identity
   * is derived from the authenticated session — never trusted from the client.
   */
  public static async createProposal(
    session: SessionPayload,
    data: {
      creatorIdOrUsername: string;
      campaignName: string;
      campaignDescription: string;
      budget: number;
      deliverables: string;
      timeline: string;
      contactEmail: string;
    }
  ): Promise<{ collaboration?: CollaborationRequest; error?: string; status?: number }> {
    const business = await prisma.businessProfile.findUnique({ where: { userId: session.userId } });
    if (!business) {
      return { error: "Only a business account can send collaboration proposals", status: 403 };
    }

    if (!Number.isFinite(data.budget) || data.budget <= 0) {
      return { error: "Budget must be a positive number", status: 400 };
    }

    const cleanId = data.creatorIdOrUsername.replace("@", "").toLowerCase();
    const creator = await prisma.creatorProfile.findFirst({
      where: {
        OR: [
          { id: data.creatorIdOrUsername },
          { username: { equals: cleanId, mode: "insensitive" } },
          { username: { equals: `@${cleanId}`, mode: "insensitive" } },
        ],
      },
      include: { user: true },
    });
    if (!creator) return { error: "Creator not found", status: 404 };

    const created = await prisma.collaboration.create({
      data: {
        businessId: business.id,
        creatorId: creator.id,
        campaignName: data.campaignName,
        campaignDescription: data.campaignDescription,
        budget: data.budget,
        deliverables: data.deliverables,
        timeline: data.timeline,
        contactEmail: data.contactEmail,
        status: "PENDING",
      },
      include: { creator: true, business: true },
    });

    // Notify the creator's user account.
    await prisma.notification.create({
      data: {
        userId: creator.userId,
        title: "New Collaboration Proposal",
        message: `${business.name} sent you a proposal for "${data.campaignName}".`,
        type: "COLLABORATION",
        link: "/dashboard/collaborations",
      },
    });

    return { collaboration: toRequest(created) };
  }

  /** Transition a collaboration's status with authorization + a valid state machine. */
  public static async updateStatusAuthorized(
    id: string,
    nextTitleCase: string,
    session: SessionPayload
  ): Promise<{ collaboration?: CollaborationRequest; error?: string; status?: number }> {
    const { collaboration: c, authorized, notFound } = await this.getAuthorizedCollaboration(id, session);
    if (notFound || !c) return { error: "Collaboration not found", status: 404 };
    if (!authorized) return { error: "You are not authorized to modify this collaboration", status: 403 };

    const next = String(nextTitleCase).toUpperCase() as CollaborationStatus;
    if (!(next in TRANSITIONS)) return { error: "Invalid status", status: 400 };

    const current = c.status as CollaborationStatus;
    if (!TRANSITIONS[current].includes(next)) {
      return { error: `Cannot change status from ${current} to ${next}`, status: 409 };
    }

    const actor = await this.resolveActor(session);
    const isBusiness = actor.isAdmin || c.businessId === actor.businessProfileId;
    const isCreator = actor.isAdmin || c.creatorId === actor.creatorProfileId;

    // Only the creator may ACCEPT / DECLINE a pending proposal.
    if ((next === "ACCEPTED" || next === "DECLINED") && !isCreator) {
      return { error: "Only the creator can accept or decline this proposal", status: 403 };
    }
    // Only the business may ACTIVATE / COMPLETE.
    if ((next === "ACTIVE" || next === "COMPLETED") && !isBusiness) {
      return { error: "Only the business can activate or complete this collaboration", status: 403 };
    }

    const updated = await prisma.collaboration.update({
      where: { id },
      data: { status: next },
      include: { creator: true, business: true },
    });

    return { collaboration: toRequest(updated) };
  }
}

export class MessageService {
  /** Only participants (or admin) may read a collaboration's message thread. */
  public static async getMessagesAuthorized(
    collaborationId: string,
    session: SessionPayload
  ): Promise<{ messages?: DBMessageView[]; error?: string; status?: number }> {
    const { collaboration, authorized, notFound } = await CollaborationService.getAuthorizedCollaboration(
      collaborationId,
      session
    );
    if (notFound || !collaboration) return { error: "Collaboration not found", status: 404 };
    if (!authorized) return { error: "You are not authorized to view these messages", status: 403 };

    const messages = await prisma.message.findMany({
      where: { collaborationId },
      include: { sender: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });

    return {
      messages: messages.map((m) => ({
        id: m.id,
        collaborationId: m.collaborationId,
        senderId: m.senderId,
        senderName: m.sender?.name || "Member",
        text: m.text,
        createdAt: m.createdAt.toISOString(),
        read: m.read,
      })),
    };
  }

  /** Only participants (or admin) may post into a collaboration thread. */
  public static async sendMessageAuthorized(
    collaborationId: string,
    session: SessionPayload,
    text: string
  ): Promise<{ message?: DBMessageView; error?: string; status?: number }> {
    const { collaboration, authorized, notFound } = await CollaborationService.getAuthorizedCollaboration(
      collaborationId,
      session
    );
    if (notFound || !collaboration) return { error: "Collaboration not found", status: 404 };
    if (!authorized) return { error: "You are not authorized to message in this collaboration", status: 403 };

    const trimmed = String(text).trim();
    if (!trimmed) return { error: "Message text is required", status: 400 };

    const created = await prisma.message.create({
      data: { collaborationId, senderId: session.userId, text: trimmed },
      include: { sender: { select: { name: true } } },
    });

    return {
      message: {
        id: created.id,
        collaborationId: created.collaborationId,
        senderId: created.senderId,
        senderName: created.sender?.name || session.name,
        text: created.text,
        createdAt: created.createdAt.toISOString(),
        read: created.read,
      },
    };
  }
}
