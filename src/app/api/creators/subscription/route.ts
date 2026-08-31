import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { CreatorSubscriptionInfo } from "@/types/subscription";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Creators have free accounts by default with standard marketplace features
    const subscription: CreatorSubscriptionInfo = {
      id: `sub-creator-${session.userId}`,
      userId: session.userId,
      plan: "FREE",
      priceMonthly: 0,
      status: "ACTIVE",
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      usage: {
        trustScoreChecks: {
          used: 2,
          limit: 5,
        },
        profileViews: {
          used: 120,
          limit: 1000,
        },
        socialConnections: {
          used: 1,
          limit: 3,
        },
      },
    };

    return NextResponse.json({ subscription, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch creator account status" }, { status: 500 });
  }
}

export async function POST() {
  // Disallow simulated paid upgrades for creators
  return NextResponse.json(
    {
      error: "Creator accounts are free on TrustScore. Paid upgrades for creators are not currently active.",
      success: false,
    },
    { status: 400 }
  );
}
