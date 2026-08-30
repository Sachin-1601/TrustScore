import { NextResponse } from "next/server";
import { PaymentService } from "@/services/paymentService";
import { getServerSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const body = await req.json();
    const { itemType, itemId, billingCycle, quantity, successUrl, cancelUrl } = body;

    const userId = session?.userId || "user-sarah-business";
    const userEmail = session?.email || "billing@example.com";

    const result = await PaymentService.createCheckoutSession({
      userId,
      userEmail,
      itemType: itemType || "SUBSCRIPTION",
      itemId: itemId || "growth",
      billingCycle: billingCycle || "monthly",
      quantity: quantity || 1,
      successUrl: successUrl || "/dashboard/billing",
      cancelUrl: cancelUrl || "/dashboard/billing",
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Checkout session creation failed" }, { status: 500 });
  }
}
