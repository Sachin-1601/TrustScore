import { db } from "@/db/client";
import { PricingService } from "./pricingService";

export interface CheckoutSessionParams {
  userId: string;
  userEmail: string;
  itemType: "SUBSCRIPTION" | "ADVERTISEMENT" | "CREDIT_TOP_UP";
  itemId: string; // planId, packageId, or addonId
  billingCycle?: "monthly" | "annual";
  quantity?: number;
  successUrl: string;
  cancelUrl: string;
}

export class PaymentService {
  /**
   * Create a simulated / real Stripe Checkout Session
   */
  public static async createCheckoutSession(params: CheckoutSessionParams): Promise<{ checkoutUrl: string; sessionId: string }> {
    const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // In a live production environment with STRIPE_SECRET_KEY:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.checkout.sessions.create(...);

    const redirectUrl = `${params.successUrl}?session_id=${sessionId}&item_type=${params.itemType}&item_id=${params.itemId}&billing=${params.billingCycle || "monthly"}`;

    return {
      checkoutUrl: redirectUrl,
      sessionId,
    };
  }

  /**
   * Handle verified Stripe Webhook Events
   */
  public static async handleWebhookEvent(event: {
    type: string;
    data: {
      object: {
        id: string;
        customer_email?: string;
        metadata?: { userId?: string; planId?: string; packageId?: string; addonId?: string; itemType?: string };
      };
    };
  }): Promise<{ processed: boolean; message: string }> {
    const userId = event.data.object.metadata?.userId;
    if (!userId) {
      return { processed: false, message: "Missing userId in webhook metadata" };
    }
    const itemType = event.data.object.metadata?.itemType || "SUBSCRIPTION";

    switch (event.type) {
      case "checkout.session.completed":
      case "invoice.paid": {
        if (itemType === "CREDIT_TOP_UP") {
          const addonId = event.data.object.metadata?.addonId || "addon-25";
          const pack = PricingService.getAddonPackById(addonId) || PricingService.getAddonPacks()[0];

          const sub = await db.getSubscriptionByUserId(userId);
          sub.creatorChecksRemaining += pack.checksCount;
          sub.creatorChecksLimit += pack.checksCount;

          await db.createNotification({
            userId,
            title: "Credits Added Successfully",
            message: `+${pack.checksCount} Creator Authenticity Audits added to your quota.`,
            type: "PAYMENT",
            link: "/dashboard/billing",
          });

          return { processed: true, message: `Added ${pack.checksCount} checks from ${pack.name}` };
        }

        const planId = event.data.object.metadata?.planId || "growth";
        const plan = PricingService.getPlanById(planId);

        // Update database subscription and reset creator checks
        const sub = await db.getSubscriptionByUserId(userId);
        sub.planId = plan.id;
        sub.creatorChecksRemaining = plan.creatorChecksMonthly;
        sub.creatorChecksLimit = plan.creatorChecksMonthly;
        sub.status = "Active";

        await db.createNotification({
          userId,
          title: "Plan Activated",
          message: `Your ${plan.name} plan is now active with ${plan.creatorChecksMonthly} creator audits / month.`,
          type: "PAYMENT",
          link: "/dashboard/billing",
        });

        return { processed: true, message: `Subscription updated to ${plan.name}` };
      }

      case "customer.subscription.deleted": {
        const sub = await db.getSubscriptionByUserId(userId);
        sub.status = "Cancelled";
        return { processed: true, message: "Subscription marked cancelled" };
      }

      default:
        return { processed: true, message: `Event ${event.type} handled` };
    }
  }
}
