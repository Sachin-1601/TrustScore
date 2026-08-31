import { NextResponse } from "next/server";
import { TrustScoreEngine } from "@/services/trustScoreEngine";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { SubscriptionStatus, ScoreBand, RiskLevel, DataCoverage } from "@prisma/client";

const toEnum = (v: string) => v.trim().toUpperCase().replace(/\s+/g, "_");

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in to perform creator authenticity audits." },
      { status: 401 }
    );
  }

  let quotaDecremented = false;

  try {
    const body = await req.json();
    const { creatorId, followers, following, totalPosts, avgLikes, avgComments, engagementRate, category, isVerified } = body;

    // 1. Atomic, server-side quota decrement tied to a real active subscription.
    const updateResult = await prisma.subscription.updateMany({
      where: {
        userId: session.userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] },
        creatorChecksRemaining: { gt: 0 },
      },
      data: { creatorChecksRemaining: { decrement: 1 } },
    });

    if (updateResult.count === 0) {
      const sub = await prisma.subscription.findFirst({ where: { userId: session.userId } });
      if (!sub || (sub.status !== SubscriptionStatus.ACTIVE && sub.status !== SubscriptionStatus.TRIALING)) {
        return NextResponse.json(
          { error: "NO_ACTIVE_SUBSCRIPTION", message: "An active business subscription is required to run creator authenticity audits." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "AUDIT_LIMIT_REACHED", message: "You've used all creator checks included in your plan. Please upgrade or top up audits." },
        { status: 403 }
      );
    }
    quotaDecremented = true;

    // 2. Resolve real creator telemetry from the database when a creatorId is provided.
    let creatorProfile = null as any;
    if (creatorId) {
      const cleanId = String(creatorId).replace("@", "").toLowerCase();
      creatorProfile = await prisma.creatorProfile.findFirst({
        where: {
          OR: [
            { id: creatorId },
            { username: { equals: cleanId, mode: "insensitive" } },
            { username: { equals: `@${cleanId}`, mode: "insensitive" } },
          ],
        },
        include: { engagementSnapshots: { orderBy: { recordedAt: "desc" }, take: 20 } },
      });
    }

    // Require real inputs — do not fabricate telemetry to manufacture a score.
    const resolvedFollowers = followers ?? creatorProfile?.followers;
    if (!resolvedFollowers || resolvedFollowers <= 0) {
      // Refund the consumed quota since no valid analysis could be produced.
      await prisma.subscription.updateMany({
        where: { userId: session.userId },
        data: { creatorChecksRemaining: { increment: 1 } },
      });
      quotaDecremented = false;
      return NextResponse.json(
        { error: "INSUFFICIENT_DATA", message: "Not enough telemetry to compute a reliable TrustScore. Connect a social account or provide analytics." },
        { status: 422 }
      );
    }

    const evaluation = TrustScoreEngine.evaluate({
      followers: resolvedFollowers,
      following: following ?? creatorProfile?.following ?? 0,
      totalPosts: totalPosts ?? creatorProfile?.totalPosts ?? 0,
      avgLikes: avgLikes ?? creatorProfile?.avgLikes ?? 0,
      avgComments: avgComments ?? creatorProfile?.avgComments ?? 0,
      engagementRate: engagementRate ?? creatorProfile?.engagementRate ?? 0,
      category: category ?? creatorProfile?.category ?? "General",
      isVerified: isVerified ?? creatorProfile?.verifiedBadge ?? false,
    });

    // 3. Persist an auditable TrustScoreRecord (history preserved — never overwritten).
    if (creatorProfile) {
      await prisma.trustScoreRecord.create({
        data: {
          creatorId: creatorProfile.id,
          score: evaluation.score,
          scoreBand: toEnum(evaluation.scoreBand) as ScoreBand,
          riskLevel: toEnum(evaluation.riskLevel) as RiskLevel,
          inflatedProbability: evaluation.inflatedProbability,
          uncertaintyMargin: evaluation.uncertaintyMargin,
          authenticityProbability: evaluation.authenticityProbability,
          commentDiversityPercent: evaluation.commentDiversityPercent,
          growthStabilityScore: evaluation.growthStabilityScore,
          consistencyScore: evaluation.consistencyScore,
          volatilityIndex: evaluation.volatilityIndex,
          dataCoverage: toEnum(evaluation.dataCoverage) as DataCoverage,
          modelVersion: evaluation.modelVersion,
          factors: {
            create: evaluation.factors.map((f) => ({
              name: f.name,
              score: f.score,
              signalType: f.signalType,
              description: f.description,
            })),
          },
        },
      });

      await prisma.creatorProfile.update({
        where: { id: creatorProfile.id },
        data: { dataCoverage: toEnum(evaluation.dataCoverage) as DataCoverage },
      });
    }

    return NextResponse.json({ evaluation, quotaDecremented: true });
  } catch (err: any) {
    console.error("TrustScore analysis error:", err);
    // Refund quota if the analysis failed after decrement.
    if (quotaDecremented) {
      try {
        await prisma.subscription.updateMany({
          where: { userId: session.userId },
          data: { creatorChecksRemaining: { increment: 1 } },
        });
      } catch {
        /* best-effort refund */
      }
    }
    return NextResponse.json({ error: "TrustScore analysis failed" }, { status: 500 });
  }
}
