import { NextResponse } from "next/server";
import { getServerSession, setSessionCookie } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        creatorProfile: {
          include: {
            socialAccounts: true,
          },
        },
        businessProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
      },
      creatorProfile: user.creatorProfile,
      businessProfile: user.businessProfile,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch onboarding state" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        creatorProfile: { include: { socialAccounts: true } },
        businessProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { step, complete, creatorData, businessData } = body;

    // Security: Only allow updating current user's profile matching their role
    if (user.role === "CREATOR") {
      if (businessData) {
        return NextResponse.json({ error: "Forbidden: Creators cannot modify business data" }, { status: 403 });
      }

      // Handle Creator Profile Updates
      if (creatorData) {
        const updateData: any = {};
        if (creatorData.name) {
          updateData.name = creatorData.name.trim();
          await prisma.user.update({ where: { id: user.id }, data: { name: creatorData.name.trim() } });
        }
        if (creatorData.avatar) {
          updateData.avatar = creatorData.avatar.trim();
          await prisma.user.update({ where: { id: user.id }, data: { avatar: creatorData.avatar.trim() } });
        }
        if (creatorData.bio !== undefined) updateData.bio = creatorData.bio.trim();
        if (creatorData.location) updateData.location = creatorData.location.trim();
        if (creatorData.country) updateData.country = creatorData.country.trim();
        if (creatorData.category) updateData.category = creatorData.category.trim();
        if (creatorData.platform) updateData.platform = creatorData.platform.toUpperCase();
        if (creatorData.website !== undefined) updateData.website = creatorData.website.trim();
        if (creatorData.startingRate !== undefined) updateData.startingRate = Number(creatorData.startingRate) || 300;
        if (creatorData.availabilityStatus) {
          updateData.availabilityStatus = creatorData.availabilityStatus;
          updateData.isAvailable = creatorData.availabilityStatus !== "NOT_AVAILABLE";
        }
        if (Array.isArray(creatorData.profileTags)) updateData.profileTags = creatorData.profileTags;

        // Check handle / username uniqueness if provided
        if (creatorData.username) {
          const rawHandle = creatorData.username.trim().replace(/^@+/, "").toLowerCase();
          const cleanHandle = `@${rawHandle}`;
          
          if (cleanHandle.length >= 3) {
            const existingWithHandle = await prisma.creatorProfile.findFirst({
              where: {
                username: { equals: cleanHandle, mode: "insensitive" },
                userId: { not: user.id },
              },
            });
            if (!existingWithHandle) {
              updateData.username = cleanHandle;
            }
          }
        }

        if (user.creatorProfile) {
          await prisma.creatorProfile.update({
            where: { id: user.creatorProfile.id },
            data: updateData,
          });
        } else {
          const defaultHandle = `@${(creatorData.username || user.name.replace(/\s+/g, "").toLowerCase() || "creator")}`;
          await prisma.creatorProfile.create({
            data: {
              userId: user.id,
              username: updateData.username || defaultHandle,
              name: updateData.name || user.name,
              avatar: updateData.avatar || user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              bio: updateData.bio || "Content creator on TrustScore.",
              category: updateData.category || "Lifestyle",
              location: updateData.location || "Global",
              country: updateData.country || "Australia",
              platform: updateData.platform || "INSTAGRAM",
              startingRate: updateData.startingRate || 300,
              availabilityStatus: updateData.availabilityStatus || "OPEN_TO_WORK",
              profileTags: updateData.profileTags || ["Open to Work"],
              ...updateData,
            },
          });
        }

        // Handle Social Account connection info if provided
        if (creatorData.socialHandle && creatorData.socialPlatform) {
          const creatorProfile = await prisma.creatorProfile.findUnique({ where: { userId: user.id } });
          if (creatorProfile) {
            const plat = creatorData.socialPlatform.toUpperCase() as "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
            const cleanSocialUsername = creatorData.socialHandle.trim().replace(/^@+/, "");
            const extId = `${plat.toLowerCase()}_${cleanSocialUsername}`;

            await prisma.socialAccount.upsert({
              where: {
                platform_externalId: {
                  platform: plat,
                  externalId: extId,
                },
              },
              create: {
                creatorId: creatorProfile.id,
                platform: plat,
                externalId: extId,
                username: cleanSocialUsername,
                isVerified: false,
              },
              update: {
                creatorId: creatorProfile.id,
                username: cleanSocialUsername,
                lastSyncedAt: new Date(),
              },
            });
          }
        }
      }
    } else if (user.role === "BUSINESS" || user.role === "AGENCY") {
      if (creatorData) {
        return NextResponse.json({ error: "Forbidden: Businesses cannot modify creator data" }, { status: 403 });
      }

      // Handle Business Profile Updates
      if (businessData) {
        const updateData: any = {};
        if (businessData.name) {
          updateData.name = businessData.name.trim();
          await prisma.user.update({ where: { id: user.id }, data: { name: businessData.name.trim() } });
        }
        if (businessData.logo) updateData.logo = businessData.logo.trim();
        if (businessData.website !== undefined) updateData.website = businessData.website.trim();
        if (businessData.category) updateData.category = businessData.category.trim();
        if (businessData.location) updateData.location = businessData.location.trim();
        if (businessData.description !== undefined) updateData.description = businessData.description.trim();
        if (businessData.tagline !== undefined) updateData.tagline = businessData.tagline.trim();
        if (Array.isArray(businessData.goals)) updateData.goals = businessData.goals;
        if (Array.isArray(businessData.targetCategories)) updateData.targetCategories = businessData.targetCategories;
        if (Array.isArray(businessData.preferredPlatforms)) updateData.preferredPlatforms = businessData.preferredPlatforms;
        if (businessData.targetFollowerRange) updateData.targetFollowerRange = businessData.targetFollowerRange;
        if (businessData.approxBudget !== undefined) updateData.approxBudget = Number(businessData.approxBudget) || null;

        if (user.businessProfile) {
          await prisma.businessProfile.update({
            where: { id: user.businessProfile.id },
            data: updateData,
          });
        } else {
          const slugBase = (businessData.name || user.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const slug = `${slugBase}-${Math.floor(1000 + Math.random() * 9000)}`;
          await prisma.businessProfile.create({
            data: {
              userId: user.id,
              slug,
              name: updateData.name || user.name,
              logo: updateData.logo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80",
              category: updateData.category || "General",
              location: updateData.location || "Global",
              tagline: updateData.tagline || "",
              description: updateData.description || "",
              website: updateData.website || "",
              goals: updateData.goals || [],
              targetCategories: updateData.targetCategories || [],
              preferredPlatforms: updateData.preferredPlatforms || [],
              targetFollowerRange: updateData.targetFollowerRange || null,
              approxBudget: updateData.approxBudget || null,
            },
          });
        }
      }
    }

    // Save step progress & completion
    const newStep = typeof step === "number" ? Math.max(1, Math.min(5, step)) : user.onboardingStep;
    const isCompleted = complete === true;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingStep: isCompleted ? 5 : newStep,
        onboardingCompleted: isCompleted ? true : user.onboardingCompleted,
      },
      include: { creatorProfile: true, businessProfile: true },
    });

    // Re-issue updated session cookie
    await setSessionCookie({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role as any,
      avatar: updatedUser.avatar || undefined,
      onboardingCompleted: updatedUser.onboardingCompleted,
      onboardingStep: updatedUser.onboardingStep,
      creatorProfileId: updatedUser.creatorProfile?.id,
      businessProfileId: updatedUser.businessProfile?.id,
    });

    return NextResponse.json({
      success: true,
      onboardingCompleted: updatedUser.onboardingCompleted,
      onboardingStep: updatedUser.onboardingStep,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        onboardingCompleted: updatedUser.onboardingCompleted,
        onboardingStep: updatedUser.onboardingStep,
      },
    });
  } catch (err: any) {
    console.error("Onboarding POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to save onboarding data" }, { status: 500 });
  }
}
