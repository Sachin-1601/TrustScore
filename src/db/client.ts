import { Creator } from "@/types/creator";
import { Business, SponsoredAd, CollaborationRequest } from "@/types/creator";
import { SEED_USERS, SEED_CREATORS, SEED_BUSINESSES, SEED_ADS, SEED_COLLABORATIONS, SeedUser } from "./seed";
import { TrustScoreEvaluation } from "@/types/schema";

export interface DBMessage {
  id: string;
  collaborationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface DBSubscription {
  id: string;
  userId: string;
  planId: "starter" | "growth" | "agency" | "enterprise";
  status: "Active" | "Trialing" | "Past_Due" | "Cancelled";
  creatorChecksRemaining: number;
  creatorChecksLimit: number;
  currentPeriodEnd: string;
}

export interface DBNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "COLLABORATION" | "CAMPAIGN" | "PAYMENT" | "VERIFICATION";
  link?: string;
  read: boolean;
  createdAt: string;
}

// In-Memory Reactive Store (Serves as seed/development cache, ready to map to PostgreSQL)
class DatabaseRepository {
  private users: SeedUser[] = [...SEED_USERS];
  private creators: Creator[] = [...SEED_CREATORS];
  private businesses: Business[] = [...SEED_BUSINESSES];
  private ads: SponsoredAd[] = [...SEED_ADS];
  private collaborations: CollaborationRequest[] = [...SEED_COLLABORATIONS];
  private messages: DBMessage[] = [
    {
      id: "msg-1",
      collaborationId: "collab-101",
      senderId: "user-sarah-business",
      senderName: "Sarah Jenkins",
      text: "Hi Alex! We've dispatched the GymFuel Hydrate samples to your Melbourne address. Let us know when tracking arrives.",
      createdAt: "2026-08-27T11:00:00Z",
      read: true,
    },
    {
      id: "msg-2",
      collaborationId: "collab-101",
      senderId: "user-alex-creator",
      senderName: "Alex Rivera",
      text: "Thanks Sarah! Received the parcel today. Testing out the citrus electrolyte blend during tomorrow morning's deadlift session.",
      createdAt: "2026-08-28T09:30:00Z",
      read: true,
    },
  ];
  private subscriptions: Record<string, DBSubscription> = {
    "user-sarah-business": {
      id: "sub-1",
      userId: "user-sarah-business",
      planId: "growth",
      status: "Active",
      creatorChecksRemaining: 37,
      creatorChecksLimit: 50,
      currentPeriodEnd: "2026-09-28T00:00:00Z",
    },
  };
  private notifications: DBNotification[] = [
    {
      id: "notif-1",
      userId: "user-sarah-business",
      title: "Proposal Accepted",
      message: "Alex Rivera (@alexfitness) accepted your campaign proposal.",
      type: "COLLABORATION",
      link: "/dashboard/collaborations",
      read: false,
      createdAt: "2026-08-28T09:30:00Z",
    },
  ];

  // ----------------------------------------------------
  // User Operations
  // ----------------------------------------------------
  async findUserByEmail(email: string): Promise<SeedUser | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id: string): Promise<SeedUser | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async createUser(user: Omit<SeedUser, "id">): Promise<SeedUser> {
    const newUser: SeedUser = {
      id: `user-${Date.now()}`,
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

  // ----------------------------------------------------
  // Creator Operations
  // ----------------------------------------------------
  async listCreators(): Promise<Creator[]> {
    return [...this.creators];
  }

  async findCreatorById(id: string): Promise<Creator | null> {
    const target = id.replace("@", "").toLowerCase();
    return (
      this.creators.find(
        (c) => c.id.toLowerCase() === target || c.username.replace("@", "").toLowerCase() === target
      ) || null
    );
  }

  async createCreatorProfile(creator: Creator): Promise<Creator> {
    this.creators.unshift(creator);
    return creator;
  }

  async updateCreatorTrustScore(creatorId: string, evaluation: TrustScoreEvaluation): Promise<Creator | null> {
    const creator = await this.findCreatorById(creatorId);
    if (!creator) return null;

    creator.trustScore = evaluation.score;
    creator.scoreBand = evaluation.scoreBand;
    creator.riskLevel = evaluation.riskLevel;
    creator.inflatedEngagementProbability = evaluation.inflatedProbability;
    creator.uncertaintyMargin = evaluation.uncertaintyMargin;
    creator.authenticityProbability = evaluation.authenticityProbability;
    creator.commentDiversityPercent = evaluation.commentDiversityPercent;
    creator.growthStabilityScore = evaluation.growthStabilityScore;
    creator.engagementConsistencyScore = evaluation.consistencyScore;
    creator.analyzedAt = evaluation.calculatedAt;
    return creator;
  }

  // ----------------------------------------------------
  // Business Operations
  // ----------------------------------------------------
  async listBusinesses(): Promise<Business[]> {
    return [...this.businesses];
  }

  async findBusinessBySlug(slug: string): Promise<Business | null> {
    const target = slug.toLowerCase();
    return this.businesses.find((b) => b.slug.toLowerCase() === target || b.id === target) || null;
  }

  async createBusiness(business: Business): Promise<Business> {
    this.businesses.unshift(business);
    return business;
  }

  // ----------------------------------------------------
  // Collaboration Operations
  // ----------------------------------------------------
  async listCollaborations(): Promise<CollaborationRequest[]> {
    return [...this.collaborations];
  }

  async findCollaborationById(id: string): Promise<CollaborationRequest | null> {
    return this.collaborations.find((c) => c.id === id) || null;
  }

  async createCollaboration(collab: CollaborationRequest): Promise<CollaborationRequest> {
    this.collaborations.unshift(collab);
    return collab;
  }

  async updateCollaborationStatus(id: string, status: CollaborationRequest["status"]): Promise<CollaborationRequest | null> {
    const collab = await this.findCollaborationById(id);
    if (!collab) return null;
    collab.status = status;
    return collab;
  }

  // ----------------------------------------------------
  // Message Operations
  // ----------------------------------------------------
  async listMessagesByCollaborationId(collaborationId: string): Promise<DBMessage[]> {
    return this.messages.filter((m) => m.collaborationId === collaborationId);
  }

  async createMessage(msg: Omit<DBMessage, "id" | "createdAt" | "read">): Promise<DBMessage> {
    const newMsg: DBMessage = {
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...msg,
    };
    this.messages.push(newMsg);
    return newMsg;
  }

  // ----------------------------------------------------
  // Advertisement Operations
  // ----------------------------------------------------
  async listAdvertisements(): Promise<SponsoredAd[]> {
    return [...this.ads];
  }

  async listAdvertisementsByPlacement(placement: SponsoredAd["placement"]): Promise<SponsoredAd[]> {
    return this.ads.filter((a) => a.placement === placement);
  }

  async createAdvertisement(ad: SponsoredAd): Promise<SponsoredAd> {
    this.ads.unshift(ad);
    return ad;
  }

  async recordAdClick(adId: string): Promise<void> {
    const ad = this.ads.find((a) => a.id === adId);
    if (ad && ad.impressionsCount) {
      ad.impressionsCount++;
    }
  }

  // ----------------------------------------------------
  // Subscription & Usage Quota Operations
  // ----------------------------------------------------
  async getSubscriptionByUserId(userId: string): Promise<DBSubscription> {
    if (!this.subscriptions[userId]) {
      this.subscriptions[userId] = {
        id: `sub-${Date.now()}`,
        userId,
        planId: "growth",
        status: "Active",
        creatorChecksRemaining: 42,
        creatorChecksLimit: 50,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    return this.subscriptions[userId];
  }

  async decrementCreatorCheckQuota(userId: string): Promise<boolean> {
    const sub = await this.getSubscriptionByUserId(userId);
    if (sub.creatorChecksRemaining <= 0) return false;
    sub.creatorChecksRemaining--;
    return true;
  }

  // ----------------------------------------------------
  // Notifications Operations
  // ----------------------------------------------------
  async listNotificationsByUserId(userId: string): Promise<DBNotification[]> {
    return this.notifications.filter((n) => n.userId === userId || n.userId === "user-sarah-business");
  }

  async createNotification(notif: Omit<DBNotification, "id" | "createdAt" | "read">): Promise<DBNotification> {
    const newNotif: DBNotification = {
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notif,
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }
}

// Singleton database instance across Next.js runtime
export const db = new DatabaseRepository();
