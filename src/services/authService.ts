import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { UserSession } from "@/types/schema";

/**
 * AuthService — PostgreSQL/Prisma is the single source of truth.
 * There is NO in-memory fallback: database failures surface as thrown errors
 * so the API layer can return a proper 5xx instead of silently serving fake data.
 */
export class AuthService {
  /** Roles a member of the public is permitted to self-register as. */
  public static readonly PUBLIC_SIGNUP_ROLES: UserRole[] = ["CREATOR", "BUSINESS"];

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public static async verifyPassword(plain: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plain, hash);
    } catch {
      return false;
    }
  }

  public static async login(
    email: string,
    passwordPlain: string,
    expectedRole?: "creator" | "business" | "admin"
  ): Promise<{ session: UserSession | null; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { creatorProfile: true, businessProfile: true },
    });

    if (!user) {
      return { session: null, error: "Invalid email or password" };
    }

    const isValid = await this.verifyPassword(passwordPlain, user.passwordHash);
    if (!isValid) {
      return { session: null, error: "Invalid email or password" };
    }

    if (expectedRole === "creator" && user.role !== "CREATOR") {
      return { session: null, error: "These credentials belong to a Business account. Please use Business login." };
    }
    if (expectedRole === "business" && user.role === "CREATOR") {
      return { session: null, error: "These credentials belong to a Creator account. Please use Creator login." };
    }
    if (expectedRole === "admin" && user.role !== "ADMIN") {
      return { session: null, error: "This account does not have administrator access." };
    }

    return {
      session: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as any,
        avatar: user.avatar || undefined,
        creatorProfileId: user.creatorProfile?.id,
        businessProfileId: user.businessProfile?.id,
      },
    };
  }

  public static async signup(data: {
    email: string;
    passwordPlain: string;
    name: string;
    role: UserRole;
    handleOrCompany?: string;
    category?: string;
    platform?: "instagram" | "tiktok" | "youtube";
  }): Promise<{ session: UserSession | null; error?: string }> {
    const cleanEmail = data.email.trim().toLowerCase();

    // Hard server-side guard against privilege escalation.
    if (!this.PUBLIC_SIGNUP_ROLES.includes(data.role)) {
      return { session: null, error: "Invalid account type. You may register as a Creator or a Business." };
    }

    if (data.passwordPlain.length < 8) {
      return { session: null, error: "Password must be at least 8 characters." };
    }

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return { session: null, error: "An account with this email already exists" };
    }

    const passwordHash = await this.hashPassword(data.passwordPlain);
    const defaultAvatar =
      data.role === "CREATOR"
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80";

    const result = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          name: data.name.trim(),
          role: data.role,
          avatar: defaultAvatar,
        },
      });

      let creatorProfileId: string | undefined;
      let businessProfileId: string | undefined;

      if (data.role === "CREATOR") {
        const rawHandle = (data.handleOrCompany || data.name).toLowerCase().replace(/[^a-z0-9_]/g, "");
        const baseUsername = rawHandle || `creator${Date.now().toString().slice(-6)}`;
        // Ensure username uniqueness
        let username = `@${baseUsername}`;
        if (await tx.creatorProfile.findUnique({ where: { username } })) {
          username = `@${baseUsername}${Date.now().toString().slice(-4)}`;
        }

        const creator = await tx.creatorProfile.create({
          data: {
            userId: createdUser.id,
            username,
            name: data.name.trim(),
            avatar: defaultAvatar,
            bio: "",
            category: data.category || "Lifestyle",
            location: "",
            country: "Australia",
            platform: data.platform === "tiktok" ? "TIKTOK" : data.platform === "youtube" ? "YOUTUBE" : "INSTAGRAM",
            // No fabricated telemetry — a brand new creator starts empty.
            followers: 0,
            following: 0,
            totalPosts: 0,
            avgLikes: 0,
            avgComments: 0,
            avgViews: 0,
            engagementRate: 0,
            startingRate: 250,
            isAvailable: true,
            availabilityStatus: "OPEN_TO_WORK",
            profileTags: ["Open to Work", "Available for Collaboration"],
            verifiedBadge: false,
            dataCoverage: "INSUFFICIENT",
          },
        });
        creatorProfileId = creator.id;
      } else if (data.role === "BUSINESS") {
        const companyName = data.handleOrCompany?.trim() || `${data.name.trim()}`;
        const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const slug = `${baseSlug || "brand"}-${Date.now().toString().slice(-5)}`;

        const business = await tx.businessProfile.create({
          data: {
            userId: createdUser.id,
            slug,
            name: companyName,
            logo: defaultAvatar,
            category: data.category || "Brand",
            location: "",
            tagline: "",
            description: "",
            // No placeholder website — the business enters this during onboarding.
            website: "",
            isSponsored: false,
          },
        });
        businessProfileId = business.id;
      }

      // Baseline free/starter subscription record (no paid entitlement granted here).
      await tx.subscription.create({
        data: {
          userId: createdUser.id,
          planId: data.role === "CREATOR" ? "free" : "starter",
          status: "ACTIVE",
          creatorChecksRemaining: data.role === "CREATOR" ? 0 : 25,
          creatorChecksLimit: data.role === "CREATOR" ? 0 : 25,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        session: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role as any,
          avatar: createdUser.avatar || undefined,
          creatorProfileId,
          businessProfileId,
        } as UserSession,
      };
    });

    return result;
  }

  public static async getUserById(userId: string): Promise<UserSession | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true, businessProfile: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      avatar: user.avatar || undefined,
      creatorProfileId: user.creatorProfile?.id,
      businessProfileId: user.businessProfile?.id,
    };
  }
}
