import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { UserSession } from "@/types/schema";
import { generateVerificationToken, hashVerificationToken, EMAIL_VERIFICATION_EXPIRY_MS } from "@/lib/tokenSecurity";
import { EmailService } from "@/lib/email";

export interface SignupResult {
  requiresVerification?: boolean;
  email?: string;
  emailSent?: boolean;
  emailDeliveryError?: boolean;
  emailErrorMessage?: string;
  error?: string;
}

export interface LoginResult {
  session: UserSession | null;
  emailUnverified?: boolean;
  email?: string;
  error?: string;
}

export interface VerifyEmailResult {
  success: boolean;
  user?: UserSession;
  error?: string;
}

export interface ResendVerificationResult {
  success: boolean;
  emailSent?: boolean;
  rateLimited?: boolean;
  isServiceError?: boolean;
  error?: string;
  message?: string;
}

/**
 * AuthService — PostgreSQL/Prisma is the single source of truth.
 * All password-based signups require email verification before sessions can be established.
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
  ): Promise<LoginResult> {
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

    // Role expectations check
    if (expectedRole === "creator" && user.role !== "CREATOR") {
      return { session: null, error: "These credentials belong to a Business account. Please use Business login." };
    }
    if (expectedRole === "business" && user.role === "CREATOR") {
      return { session: null, error: "These credentials belong to a Creator account. Please use Creator login." };
    }
    if (expectedRole === "admin" && user.role !== "ADMIN") {
      return { session: null, error: "This account does not have administrator access." };
    }

    // Email Ownership Verification Gate
    if (!user.emailVerifiedAt) {
      return {
        session: null,
        emailUnverified: true,
        email: user.email,
        error: "Please verify your email address before signing in.",
      };
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
  }): Promise<SignupResult> {
    const cleanEmail = data.email.trim().toLowerCase();

    // Guard against privilege escalation
    if (!this.PUBLIC_SIGNUP_ROLES.includes(data.role)) {
      return { error: "Invalid account type. You may register as a Creator or a Business." };
    }

    // Creator accounts require a Gmail address ending in @gmail.com
    if (data.role === "CREATOR" && !cleanEmail.endsWith("@gmail.com")) {
      return { error: "Creator accounts require a Gmail address ending in @gmail.com." };
    }

    if (data.passwordPlain.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return { error: "An account with this email already exists" };
    }

    const passwordHash = await this.hashPassword(data.passwordPlain);
    const defaultAvatar =
      data.role === "CREATOR"
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80";

    const { rawToken, tokenHash, expiresAt } = generateVerificationToken(EMAIL_VERIFICATION_EXPIRY_MS);

    await prisma.$transaction(async (tx) => {
      // 1. Create User with emailVerifiedAt = null
      const createdUser = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          name: data.name.trim(),
          role: data.role,
          avatar: defaultAvatar,
          emailVerifiedAt: null, // Unverified upon password signup
        },
      });

      // 2. Create Profile Data
      if (data.role === "CREATOR") {
        const rawHandle = (data.handleOrCompany || data.name).toLowerCase().replace(/[^a-z0-9_]/g, "");
        const baseUsername = rawHandle || `creator${Date.now().toString().slice(-6)}`;
        let username = `@${baseUsername}`;
        if (await tx.creatorProfile.findUnique({ where: { username } })) {
          username = `@${baseUsername}${Date.now().toString().slice(-4)}`;
        }

        await tx.creatorProfile.create({
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
      } else if (data.role === "BUSINESS") {
        const companyName = data.handleOrCompany?.trim() || `${data.name.trim()}`;
        const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const slug = `${baseSlug || "brand"}-${Date.now().toString().slice(-5)}`;

        await tx.businessProfile.create({
          data: {
            userId: createdUser.id,
            slug,
            name: companyName,
            logo: defaultAvatar,
            category: data.category || "Brand",
            location: "",
            tagline: "",
            description: "",
            website: "",
            isSponsored: false,
          },
        });
      }

      // 3. Baseline subscription record
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

      // 4. Create Email Verification Token
      await tx.emailVerificationToken.create({
        data: {
          userId: createdUser.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    // 5. Send Verification Email & capture actual result
    const appUrl = EmailService.getAppUrl();
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${rawToken}`;
    const emailResult = await EmailService.sendVerificationEmail({
      to: cleanEmail,
      name: data.name.trim(),
      verificationUrl,
    });

    return {
      requiresVerification: true,
      email: cleanEmail,
      emailSent: emailResult.success,
      emailDeliveryError: !emailResult.success,
      emailErrorMessage: emailResult.error,
    };
  }

  public static async verifyEmailToken(rawToken: string): Promise<VerifyEmailResult> {
    if (!rawToken || typeof rawToken !== "string") {
      return { success: false, error: "Missing or invalid verification token." };
    }

    const tokenHash = hashVerificationToken(rawToken.trim());

    const tokenRecord = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: { creatorProfile: true, businessProfile: true },
        },
      },
    });

    if (!tokenRecord) {
      return { success: false, error: "Invalid or expired verification token." };
    }

    if (tokenRecord.usedAt) {
      return {
        success: false,
        error: "This verification link has already been used. Please sign in to your account.",
      };
    }

    if (tokenRecord.expiresAt < new Date()) {
      return {
        success: false,
        error: "This verification link has expired. Please request a new verification email.",
      };
    }

    const user = tokenRecord.user;
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // Mark token as used
      await tx.emailVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: now },
      });

      // Set user emailVerifiedAt
      await tx.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: now },
      });

      // Invalidate any other outstanding tokens for this user
      await tx.emailVerificationToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
          id: { not: tokenRecord.id },
        },
        data: { usedAt: now },
      });
    });

    return {
      success: true,
      user: {
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

  public static async resendVerification(email: string): Promise<ResendVerificationResult> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: "Please provide an email address." };
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { emailVerificationTokens: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    // Generic response if account doesn't exist or is already verified (prevents user enumeration)
    if (!user || user.emailVerifiedAt) {
      return {
        success: true,
        emailSent: true,
        message: "If an unverified account exists for this email, a new verification link has been sent.",
      };
    }

    // Rate-limiting: prevent resending within 60 seconds
    const latestToken = user.emailVerificationTokens[0];
    if (latestToken && Date.now() - latestToken.createdAt.getTime() < 60 * 1000) {
      const waitSec = Math.ceil((60 * 1000 - (Date.now() - latestToken.createdAt.getTime())) / 1000);
      return {
        success: false,
        rateLimited: true,
        error: `Please wait ${waitSec} seconds before requesting another verification email.`,
      };
    }

    const { rawToken, tokenHash, expiresAt } = generateVerificationToken(EMAIL_VERIFICATION_EXPIRY_MS);
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // Invalidate existing unused tokens
      await tx.emailVerificationToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: { usedAt: now },
      });

      // Create new token record
      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    const appUrl = EmailService.getAppUrl();
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${rawToken}`;
    const emailResult = await EmailService.sendVerificationEmail({
      to: cleanEmail,
      name: user.name,
      verificationUrl,
    });

    if (!emailResult.success) {
      return {
        success: false,
        emailSent: false,
        isServiceError: true,
        error: emailResult.error || "We couldn't send the verification email. Please check your SMTP configuration or try again shortly.",
      };
    }

    return {
      success: true,
      emailSent: true,
      message: "A new verification link has been sent to your email address.",
    };
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
