import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { CreatorPlanType } from "@/types/subscription";
import { getServerSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await db.getCreatorSubscription(session.userId);
    return NextResponse.json({ subscription, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch creator subscription" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    if (!plan || !["FREE", "PRO", "VERIFIED"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan specified" }, { status: 400 });
    }

    const updated = await db.updateCreatorSubscription(session.userId, plan as CreatorPlanType);

    // Notify user of plan update
    await db.createNotification({
      userId: session.userId,
      title: "Plan Updated",
      message: `Your creator workspace plan is now ${plan}.`,
      type: "PAYMENT",
      link: "/dashboard/settings?section=subscription",
    });

    return NextResponse.json({ subscription: updated, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update subscription" }, { status: 500 });
  }
}
