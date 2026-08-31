import { NextResponse } from "next/server";
import { TrustScoreEngine } from "@/services/trustScoreEngine";
import { db } from "@/db/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { SubscriptionStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to perform creator authenticity audits." },
        { status: 401 }
      );
    }

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

    // 1. Atomic Quota Decrement backed by PostgreSQL
    let quotaDecremented = false;
    try {
      const updateResult = await prisma.subscription.updateMany({
        where: {
          userId: session.userId,
          status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
          creatorChecksRemaining: { gt: 0 },
        },
        data: {
          creatorChecksRemaining: { decrement: 1 },
        },
      });

      if (updateResult.count > 0) {
        quotaDecremented = true;
      } else {
        // Check if user has no subscription or quota is exhausted
        const sub = await prisma.subscription.findFirst({ where: { userId: session.userId } });
        if (!sub || (sub.status !== SubscriptionStatus.ACTIVE && sub.status !== SubscriptionStatus.TRIALING)) {
          return NextResponse.json(
            {
              error: "NO_ACTIVE_SUBSCRIPTION",
              message: "An active business subscription is required to run creator authenticity audits.",
            },
            { status: 403 }
          );
        }

        return NextResponse.json(
          {
            error: "AUDIT_LIMIT_REACHED",
            message: "You've used all creator checks included in your plan. Please upgrade or top up audits.",
          },
          { status: 403 }
        );
      }
    } catch {
      // Fallback for demo in-memory store if DB is unreachable
      const allowed = await db.decrementCreatorCheckQuota(session.userId);
      if (!allowed) {
        return NextResponse.json(
          {
            error: "AUDIT_LIMIT_REACHED",
            message: "You've used all creator checks included in your plan. Please upgrade or top up audits.",
          },
          { status: 403 }
        );
      }
      quotaDecremented = true;
    }

    // 2. Fetch creator telemetry or build evaluation
    const existingCreator = creatorId ? await db.findCreatorById(creatorId) : null;

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

    return NextResponse.json({ evaluation, quotaDecremented });
  } catch (err: any) {
    console.error("TrustScore analysis error:", err);
    return NextResponse.json({ error: err.message || "TrustScore analysis failed" }, { status: 500 });
  }
}
