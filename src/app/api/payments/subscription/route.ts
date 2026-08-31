import { NextResponse } from "next/server";
import { PaymentService } from "@/services/paymentService";
import { getServerSession } from "@/lib/session";
import { UserRole } from "@prisma/client";
import { PlanTier, BillingCycle } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to view subscription details." },
        { status: 401 }
      );
    }

    const data = await PaymentService.getSubscriptionDetails(session.userId);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Fetch subscription error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load subscription details" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to change your subscription." },
        { status: 401 }
      );
    }

    if (session.role === UserRole.CREATOR) {
      return NextResponse.json(
        { error: "Forbidden. Creator accounts cannot modify business SaaS plans." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { planId, billingCycle = "monthly" } = body;

    const validPlans: PlanTier[] = ["starter", "growth", "agency"];
    if (!validPlans.includes(planId?.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid plan specified" },
        { status: 400 }
      );
    }

    const result = await PaymentService.changeSubscriptionPlan({
      userId: session.userId,
      newPlanId: planId.toLowerCase() as PlanTier,
      billingCycle: billingCycle as BillingCycle,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Change subscription error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update subscription" },
      { status: 500 }
    );
  }
}
