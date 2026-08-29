import { NextResponse } from "next/server";
import { TrustScoreEngine } from "@/services/trustScoreEngine";
import { db } from "@/db/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      creatorId,
      followers,
      following,
      totalPosts,
      avgLikes,
      avgComments,
      engagementRate,
      category,
      isVerified,
    } = body;

    // 1. Quota Check (Simulated user ID)
    const userId = "user-sarah-business";
    const quotaAllowed = await db.decrementCreatorCheckQuota(userId);
    if (!quotaAllowed) {
      return NextResponse.json(
        { error: "Monthly creator audit quota reached. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // 2. Fetch existing creator or build evaluation telemetry
    let existingCreator = creatorId ? await db.findCreatorById(creatorId) : null;

    const evaluation = TrustScoreEngine.evaluate({
      followers: followers || existingCreator?.followers || 15000,
      following: following || existingCreator?.following || 300,
      totalPosts: totalPosts || existingCreator?.totalPosts || 45,
      avgLikes: avgLikes || existingCreator?.avgLikes || 750,
      avgComments: avgComments || existingCreator?.avgComments || 45,
      engagementRate: engagementRate || existingCreator?.engagementRate || 5.0,
      category: category || existingCreator?.category || "General",
      isVerified: isVerified !== undefined ? isVerified : existingCreator?.verifiedBadge,
    });

    if (existingCreator) {
      await db.updateCreatorTrustScore(existingCreator.id, evaluation);
    }

    return NextResponse.json({ evaluation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "TrustScore analysis failed" }, { status: 500 });
  }
}
