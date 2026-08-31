import { NextResponse } from "next/server";
import { PaymentService } from "@/services/paymentService";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.warn("⚠️ STRIPE_WEBHOOK_SECRET is not configured. Webhook verification cannot proceed safely.");
      return NextResponse.json(
        { error: "Webhook secret unconfigured on server" },
        { status: 500 }
      );
    }

    // Verify Stripe signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error("❌ Stripe webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Process event idempotently
    const result = await PaymentService.handleWebhookEvent(event);
    return NextResponse.json({ received: true, ...result });
  } catch (err: any) {
    console.error("❌ Webhook processing error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook handler encountered an internal error" },
      { status: 500 }
    );
  }
}
