import { NextResponse } from "next/server";
import { PaymentService } from "@/services/paymentService";
import { getServerSession } from "@/lib/session";
import { UserRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to proceed to checkout." },
        { status: 401 }
      );
    }

    if (session.role === UserRole.CREATOR) {
      return NextResponse.json(
        { error: "Forbidden. Creator accounts cannot purchase business SaaS subscriptions." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { itemType = "SUBSCRIPTION", itemId = "growth", billingCycle = "monthly", adDetails } = body;

    // Validate billing cycle
    if (billingCycle !== "monthly" && billingCycle !== "annual") {
      return NextResponse.json(
        { error: "Invalid billing cycle. Must be 'monthly' or 'annual'." },
        { status: 400 }
      );
    }

    // Validate planId for subscriptions
    if (itemType === "SUBSCRIPTION") {
      const validPlans = ["starter", "growth", "agency"];
      if (!validPlans.includes(itemId.toLowerCase())) {
        return NextResponse.json(
          { error: "Invalid subscription plan. Must be 'starter', 'growth', or 'agency'." },
          { status: 400 }
        );
      }
    }

    const result = await PaymentService.createCheckoutSession({
      userId: session.userId,
      userEmail: session.email,
      userName: session.name,
      businessProfileId: session.businessProfileId,
      itemType,
      itemId,
      billingCycle,
      adDetails,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Checkout creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate Stripe Checkout session." },
      { status: 500 }
    );
  }
}
