import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { InstagramService } from "@/services/instagramService";

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "CREATOR" && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only creators or admins can sync Instagram telemetry" },
        { status: 403 }
      );
    }

    const syncResult = await InstagramService.syncInstagramDataForCreator(session.userId);

    return NextResponse.json({
      success: true,
      message: "Instagram telemetry synchronized successfully",
      syncResult: {
        username: syncResult.username,
        followers: syncResult.followers,
        totalPosts: syncResult.totalPosts,
        engagementRate: syncResult.engagementRate,
        avgLikes: syncResult.avgLikes,
        avgComments: syncResult.avgComments,
        trustScore: syncResult.trustScore,
        verifiedBadge: syncResult.verifiedBadge,
        syncedAt: syncResult.syncedAt,
      },
    });
  } catch (err: any) {
    console.error("[Instagram Sync Endpoint] Sync error:", err);
    return NextResponse.json(
      {
        error: err.message || "Failed to sync Instagram account telemetry",
      },
      { status: 400 }
    );
  }
}
