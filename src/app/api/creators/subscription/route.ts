import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { CreatorPlanType } from "@/types/subscription";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "user-alex-creator";

    const subscription = await db.getCreatorSubscription(userId);
    return NextResponse.json({ subscription, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch creator subscription" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId = "user-alex-creator", plan } = body;

    if (!plan || !["FREE", "PRO", "VERIFIED"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan specified" }, { status: 400 });
    }

    const updated = await db.updateCreatorSubscription(userId, plan as CreatorPlanType);

    // Notify user of plan update
    await db.createNotification({
      userId,
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
