import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.userId },
      include: {
        socialAccounts: {
          where: { platform: "INSTAGRAM" },
        },
      },
    });

    if (!creator) {
      return NextResponse.json({
        connected: false,
        message: "Creator profile not initialized",
      });
    }

    const igAccount = creator.socialAccounts[0];
    if (!igAccount) {
      return NextResponse.json({
        connected: false,
        platform: "INSTAGRAM",
      });
    }

    return NextResponse.json({
      connected: true,
      platform: "INSTAGRAM",
      username: igAccount.username,
      isVerified: igAccount.isVerified,
      lastSyncedAt: igAccount.lastSyncedAt?.toISOString() || null,
      tokenExpiresAt: igAccount.tokenExpiresAt?.toISOString() || null,
      followers: creator.followers,
      totalPosts: creator.totalPosts,
      engagementRate: creator.engagementRate,
      verifiedBadge: creator.verifiedBadge,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch Instagram status" },
      { status: 500 }
    );
  }
}
