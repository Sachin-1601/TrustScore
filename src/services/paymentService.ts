import { prisma } from "@/lib/prisma";
import { stripe, getStripePriceId, getOrCreateStripeCustomer, getCustomerPaymentMethodInfo, PlanTier, BillingCycle } from "@/lib/stripe";
import { PricingService, SaaSSubscriptionPlan } from "./pricingService";
import { SubscriptionStatus, AdPlacement, AdStatus } from "@prisma/client";
import Stripe from "stripe";

export interface CheckoutSessionParams {
  userId: string;
  userEmail: string;
  userName?: string;
  businessProfileId?: string;
  itemType: "SUBSCRIPTION" | "ADVERTISEMENT" | "CREDIT_TOP_UP";
  itemId: string; // planId ("starter" | "growth" | "agency"), addonId, or packageId
  billingCycle?: "monthly" | "annual";
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
  // Extra fields for advertisements
  adDetails?: {
    businessName: string;
    category: string;
    tagline: string;
    description: string;
    ctaLink: string;
    placement: AdPlacement;
  };
}

export class PaymentService {
  private static getAppUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  }

  /**
   * Create a production Stripe Checkout Session
   */
  public static async createCheckoutSession(params: CheckoutSessionParams): Promise<{ checkoutUrl: string; sessionId: string }> {
    const {
      userId,
      userEmail,
      userName,
      businessProfileId,
      itemType,
      itemId,
      billingCycle = "monthly",
      adDetails,
    } = params;

    const appUrl = this.getAppUrl();

    // 1. Resolve or create real Stripe Customer
    const stripeCustomerId = await getOrCreateStripeCustomer({
      userId,
      email: userEmail,
      name: userName,
    });

    // 2. Handle Item Types
    if (itemType === "SUBSCRIPTION") {
      const planId = (itemId.toLowerCase() as PlanTier) || "growth";
      const plan: SaaSSubscriptionPlan = PricingService.getPlanById(planId);
      const isAnnual = billingCycle === "annual";
      const pricePerMonth = isAnnual ? plan.priceAnnual : plan.priceMonthly;
      const totalAmount = isAnnual ? plan.priceAnnual * 12 : plan.priceMonthly;

      // Check if business already has an existing active Stripe subscription
      const existingSub = await prisma.subscription.findFirst({
        where: { userId },
      });

      // If user has an active Stripe subscription, allow updating it or redirect to checkout
      const configuredPriceId = getStripePriceId(planId, billingCycle);

      let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

      if (configuredPriceId && configuredPriceId.startsWith("price_") && !configuredPriceId.includes("placeholder")) {
        lineItems = [{ price: configuredPriceId, quantity: 1 }];
      } else {
        // Dynamically build recurring price data on Stripe
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `TrustScore ${plan.name} Plan`,
                description: `${plan.creatorChecksMonthly} Creator Authenticity Audits / month. ${plan.tagline}`,
              },
              unit_amount: Math.round(totalAmount * 100),
              recurring: {
                interval: isAnnual ? "year" : "month",
              },
            },
            quantity: 1,
          },
        ];
      }

      // Check if user is eligible for 14-day trial (new subscribers without previous active subscriptions)
      const hasPriorPaidHistory = await prisma.paymentRecord.findFirst({
        where: { userId, status: "succeeded", purpose: "SUBSCRIPTION" },
      });

      const trialDays = (!hasPriorPaidHistory && (!existingSub || existingSub.status === SubscriptionStatus.TRIALING || existingSub.planId === "free")) ? 14 : undefined;

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "subscription",
        payment_method_types: ["card"],
        payment_method_collection: "always",
        line_items: lineItems,
        subscription_data: {
          trial_period_days: trialDays,
          metadata: {
            userId,
            businessProfileId: businessProfileId || "",
            planId: plan.id,
            billingCycle,
            itemType: "SUBSCRIPTION",
          },
        },
        metadata: {
          userId,
          businessProfileId: businessProfileId || "",
          planId: plan.id,
          billingCycle,
          itemType: "SUBSCRIPTION",
        },
        success_url: `${appUrl}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard/billing/cancel`,
        allow_promotion_codes: true,
      });

      if (!session.url) {
        throw new Error("Failed to generate Stripe Checkout URL");
      }

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }

    if (itemType === "CREDIT_TOP_UP") {
      const pack = PricingService.getAddonPackById(itemId) || PricingService.getAddonPacks()[0];

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `TrustScore Add-on: ${pack.name}`,
                description: `+${pack.checksCount} Creator Authenticity Audits (never expire)`,
              },
              unit_amount: Math.round(pack.price * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          businessProfileId: businessProfileId || "",
          itemType: "CREDIT_TOP_UP",
          addonId: pack.id,
          checksCount: String(pack.checksCount),
        },
        success_url: `${appUrl}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}&type=addon`,
        cancel_url: `${appUrl}/dashboard/billing/cancel`,
      });

      if (!session.url) {
        throw new Error("Failed to generate Stripe Checkout URL for Add-on");
      }

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }

    if (itemType === "ADVERTISEMENT") {
      const adPkg = itemId === "premium" ? { name: "Platform Takeover", price: 799 } : itemId === "starter" ? { name: "Starter Showcase", price: 199 } : { name: "Growth Spotlight", price: 399 };

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `TrustScore Ad Placement: ${adPkg.name}`,
                description: `Sponsored Brand Placement for ${adDetails?.businessName || "Business"}`,
              },
              unit_amount: Math.round(adPkg.price * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          businessProfileId: businessProfileId || "",
          itemType: "ADVERTISEMENT",
          packageId: itemId,
          businessName: adDetails?.businessName || "",
          category: adDetails?.category || "",
          tagline: adDetails?.tagline || "",
          description: adDetails?.description || "",
          ctaLink: adDetails?.ctaLink || "",
          placement: adDetails?.placement || "LEFT_SIDEBAR",
        },
        success_url: `${appUrl}/dashboard/advertise?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dashboard/advertise`,
      });

      if (!session.url) {
        throw new Error("Failed to generate Stripe Checkout URL for Advertisement");
      }

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }

    throw new Error(`Unsupported checkout item type: ${itemType}`);
  }

  /**
   * Create a Stripe Billing Customer Portal session
   */
  public static async createBillingPortalSession(userId: string): Promise<{ portalUrl: string }> {
    const appUrl = this.getAppUrl();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let customerId = user.subscriptions[0]?.stripeCustomerId;

    if (!customerId) {
      customerId = await getOrCreateStripeCustomer({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/billing`,
    });

    return { portalUrl: session.url };
  }

  /**
   * Live Subscription upgrade / downgrade proration handling
   */
  public static async changeSubscriptionPlan(params: {
    userId: string;
    newPlanId: PlanTier;
    billingCycle: BillingCycle;
  }): Promise<{ success: boolean; requiresCheckout?: boolean; checkoutUrl?: string }> {
    const { userId, newPlanId, billingCycle } = params;

    const sub = await prisma.subscription.findFirst({
      where: { userId },
    });

    if (!sub || !sub.stripeSubscriptionId) {
      // User does not have an active Stripe subscription, must initiate checkout
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      const checkout = await this.createCheckoutSession({
        userId,
        userEmail: user.email,
        userName: user.name,
        itemType: "SUBSCRIPTION",
        itemId: newPlanId,
        billingCycle,
      });

      return { success: true, requiresCheckout: true, checkoutUrl: checkout.checkoutUrl };
    }

    // Retrieve existing Stripe subscription
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);

    if (stripeSub.status === "canceled") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      const checkout = await this.createCheckoutSession({
        userId,
        userEmail: user.email,
        userName: user.name,
        itemType: "SUBSCRIPTION",
        itemId: newPlanId,
        billingCycle,
      });

      return { success: true, requiresCheckout: true, checkoutUrl: checkout.checkoutUrl };
    }

    const targetPriceId = getStripePriceId(newPlanId, billingCycle);
    const plan = PricingService.getPlanById(newPlanId);
    const isAnnual = billingCycle === "annual";
    const totalAmount = isAnnual ? plan.priceAnnual * 12 : plan.priceMonthly;

    const currentItemId = stripeSub.items.data[0]?.id;
    if (!currentItemId) {
      throw new Error("No active subscription item found on Stripe");
    }

    let updatedStripeSub: Stripe.Subscription;

    if (targetPriceId && targetPriceId.startsWith("price_") && !targetPriceId.includes("placeholder")) {
      updatedStripeSub = await stripe.subscriptions.update(stripeSub.id, {
        items: [
          {
            id: currentItemId,
            price: targetPriceId,
          },
        ],
        proration_behavior: "create_prorations",
        metadata: {
          userId,
          planId: newPlanId,
          billingCycle,
        },
      });
    } else {
      // Update with price_data
      updatedStripeSub = await stripe.subscriptions.update(stripeSub.id, {
        items: [
          {
            id: currentItemId,
            price_data: {
              currency: "usd",
              product: stripeSub.items.data[0].price.product as string,
              unit_amount: Math.round(totalAmount * 100),
              recurring: {
                interval: isAnnual ? "year" : "month",
              },
            },
          },
        ],
        proration_behavior: "create_prorations",
        metadata: {
          userId,
          planId: newPlanId,
          billingCycle,
        },
      });
    }

    // Update local database
    const periodStart = (updatedStripeSub as any).current_period_start ? new Date((updatedStripeSub as any).current_period_start * 1000) : new Date();
    const periodEnd = (updatedStripeSub as any).current_period_end ? new Date((updatedStripeSub as any).current_period_end * 1000) : new Date(Date.now() + 30 * 86400000);

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        planId: newPlanId,
        billingCycle,
        status: updatedStripeSub.status === "trialing" ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
        creatorChecksLimit: plan.creatorChecksMonthly,
        creatorChecksRemaining: Math.max(sub.creatorChecksRemaining, plan.creatorChecksMonthly),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Plan Updated",
        message: `Your subscription tier was changed to ${plan.name} (${billingCycle}). Quota updated to ${plan.creatorChecksMonthly} audits.`,
        type: "PAYMENT",
        link: "/dashboard/billing",
      },
    });

    return { success: true, requiresCheckout: false };
  }

  /**
   * Handle verified Stripe Webhook Events with strict idempotency
   */
  public static async handleWebhookEvent(event: Stripe.Event): Promise<{ processed: boolean; message: string }> {
    // 1. Idempotency Check
    const existing = await prisma.processedStripeEvent.findUnique({
      where: { stripeEventId: event.id },
    });

    if (existing) {
      return { processed: true, message: `Stripe Event ${event.id} already processed (idempotent skipped)` };
    }

    // 2. Event Dispatch
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const userId = metadata.userId;
        const itemType = metadata.itemType || "SUBSCRIPTION";

        if (!userId) {
          console.warn("Stripe checkout.session.completed received without userId metadata", session.id);
          break;
        }

        // Handle Add-on Credit Top-up
        if (itemType === "CREDIT_TOP_UP") {
          const addonId = metadata.addonId || "addon-25";
          const pack = PricingService.getAddonPackById(addonId) || PricingService.getAddonPacks()[0];

          await prisma.subscription.updateMany({
            where: { userId },
            data: {
              creatorChecksRemaining: { increment: pack.checksCount },
              creatorChecksLimit: { increment: pack.checksCount },
            },
          });

          await prisma.paymentRecord.create({
            data: {
              userId,
              amount: (session.amount_total || pack.price * 100) / 100,
              currency: session.currency || "usd",
              status: "succeeded",
              purpose: "CREDIT_TOP_UP",
              description: `Add-on: ${pack.name} (+${pack.checksCount} Creator Checks)`,
              stripeCustomerId: session.customer as string,
              stripeCheckoutSessionId: session.id,
              stripePaymentIntentId: session.payment_intent as string,
            },
          });

          await prisma.notification.create({
            data: {
              userId,
              title: "Credits Added Successfully",
              message: `+${pack.checksCount} Creator Authenticity Audits have been added to your quota.`,
              type: "PAYMENT",
              link: "/dashboard/billing",
            },
          });

          break;
        }

        // Handle Sponsored Advertisement
        if (itemType === "ADVERTISEMENT") {
          const businessProfile = await prisma.businessProfile.findUnique({
            where: { userId },
          });

          if (businessProfile) {
            await prisma.advertisement.create({
              data: {
                businessId: businessProfile.id,
                packageId: metadata.packageId || "growth",
                tagline: metadata.tagline || `${metadata.businessName} Partnership`,
                description: metadata.description || "Direct-to-consumer brand collaborating with creators.",
                ctaLink: metadata.ctaLink || "https://trustscore.io",
                placement: (metadata.placement as AdPlacement) || AdPlacement.LEFT_SIDEBAR,
                status: AdStatus.ACTIVE,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 86400000),
              },
            });
          }

          await prisma.paymentRecord.create({
            data: {
              userId,
              amount: (session.amount_total || 39900) / 100,
              currency: session.currency || "usd",
              status: "succeeded",
              purpose: "ADVERTISEMENT",
              description: `Sponsored Brand Placement (${metadata.packageId || "growth"})`,
              stripeCustomerId: session.customer as string,
              stripeCheckoutSessionId: session.id,
              stripePaymentIntentId: session.payment_intent as string,
            },
          });

          break;
        }

        // Handle SaaS Subscription Activation
        const planId = (metadata.planId?.toLowerCase() as PlanTier) || "growth";
        const plan = PricingService.getPlanById(planId);
        const billingCycle = metadata.billingCycle || "monthly";

        let stripeSubscriptionId = session.subscription as string;
        let periodStart = new Date();
        let periodEnd = new Date(Date.now() + (billingCycle === "annual" ? 365 : 30) * 86400000);
        let subStatus: SubscriptionStatus = SubscriptionStatus.ACTIVE;

        if (stripeSubscriptionId) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
            if (stripeSub.status === "trialing") {
              subStatus = SubscriptionStatus.TRIALING;
            }
            if ((stripeSub as any).current_period_start) {
              periodStart = new Date((stripeSub as any).current_period_start * 1000);
            }
            if ((stripeSub as any).current_period_end) {
              periodEnd = new Date((stripeSub as any).current_period_end * 1000);
            }
          } catch (err) {
            console.error("Error retrieving Stripe subscription in webhook:", err);
          }
        }

        // Update or create Subscription in PostgreSQL
        const existingSub = await prisma.subscription.findFirst({ where: { userId } });

        if (existingSub) {
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
              planId: plan.id,
              status: subStatus,
              billingCycle,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId,
              stripeCheckoutSessionId: session.id,
              creatorChecksRemaining: plan.creatorChecksMonthly,
              creatorChecksLimit: plan.creatorChecksMonthly,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
            },
          });
        } else {
          await prisma.subscription.create({
            data: {
              userId,
              planId: plan.id,
              status: subStatus,
              billingCycle,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId,
              stripeCheckoutSessionId: session.id,
              creatorChecksRemaining: plan.creatorChecksMonthly,
              creatorChecksLimit: plan.creatorChecksMonthly,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
            },
          });
        }

        // Record payment if charged immediately
        if (session.amount_total && session.amount_total > 0) {
          await prisma.paymentRecord.create({
            data: {
              userId,
              amount: session.amount_total / 100,
              currency: session.currency || "usd",
              status: "succeeded",
              purpose: "SUBSCRIPTION",
              description: `TrustScore ${plan.name} Plan (${billingCycle})`,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId,
              stripeCheckoutSessionId: session.id,
              stripePaymentIntentId: session.payment_intent as string,
            },
          });
        }

        await prisma.notification.create({
          data: {
            userId,
            title: subStatus === SubscriptionStatus.TRIALING ? "14-Day Free Trial Active" : "Plan Activated",
            message: `Your ${plan.name} plan is now active with ${plan.creatorChecksMonthly} monthly creator authenticity audits.`,
            type: "PAYMENT",
            link: "/dashboard/billing",
          },
        });

        break;
      }

      case "customer.subscription.updated": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const customerId = stripeSub.customer as string;

        const sub = await prisma.subscription.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: stripeSub.id },
              { stripeCustomerId: customerId },
            ],
          },
        });

        if (sub) {
          let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
          if (stripeSub.status === "trialing") status = SubscriptionStatus.TRIALING;
          if (stripeSub.status === "past_due") status = SubscriptionStatus.PAST_DUE;
          if (stripeSub.status === "canceled" || stripeSub.status === "unpaid") status = SubscriptionStatus.CANCELLED;

          const periodStart = (stripeSub as any).current_period_start ? new Date((stripeSub as any).current_period_start * 1000) : sub.currentPeriodStart;
          const periodEnd = (stripeSub as any).current_period_end ? new Date((stripeSub as any).current_period_end * 1000) : sub.currentPeriodEnd;

          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status,
              stripeSubscriptionId: stripeSub.id,
              cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const sub = await prisma.subscription.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: stripeSub.id },
              { stripeCustomerId: stripeSub.customer as string },
            ],
          },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: SubscriptionStatus.CANCELLED,
            },
          });

          await prisma.notification.create({
            data: {
              userId: sub.userId,
              title: "Subscription Cancelled",
              message: "Your TrustScore SaaS subscription has been cancelled. Your access will expire at the end of the current period.",
              type: "PAYMENT",
              link: "/dashboard/billing",
            },
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = (invoice as any).subscription as string | undefined;

        const sub = await prisma.subscription.findFirst({
          where: {
            OR: [
              ...(subscriptionId ? [{ stripeSubscriptionId: subscriptionId }] : []),
              { stripeCustomerId: customerId },
            ],
          },
        });

        if (sub) {
          const plan = PricingService.getPlanById(sub.planId);

          // Reset usage quota for new billing cycle
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: SubscriptionStatus.ACTIVE,
              creatorChecksRemaining: plan.creatorChecksMonthly,
              creatorChecksLimit: plan.creatorChecksMonthly,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + (sub.billingCycle === "annual" ? 365 : 30) * 86400000),
            },
          });

          await prisma.paymentRecord.create({
            data: {
              subscriptionId: sub.id,
              userId: sub.userId,
              amount: (invoice.amount_paid || 0) / 100,
              currency: invoice.currency || "usd",
              status: "succeeded",
              purpose: "SUBSCRIPTION",
              description: `Renewal: TrustScore ${plan.name} Plan (${sub.billingCycle})`,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              stripeInvoiceId: invoice.id,
              stripePaymentIntentId: (invoice as any).payment_intent as string | undefined,
              hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
              invoicePdfUrl: invoice.invoice_pdf || undefined,
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: SubscriptionStatus.PAST_DUE },
          });

          await prisma.notification.create({
            data: {
              userId: sub.userId,
              title: "Payment Past Due",
              message: "We were unable to process your latest renewal payment. Please update your payment method to avoid account suspension.",
              type: "PAYMENT",
              link: "/dashboard/billing",
            },
          });
        }
        break;
      }

      default:
        break;
    }

    // 3. Mark event as processed in database
    await prisma.processedStripeEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
      },
    });

    return { processed: true, message: `Handled ${event.type}` };
  }

  /**
   * Load subscription data for Dashboard Billing View
   */
  public static async getSubscriptionDetails(userId: string): Promise<{
    subscription: {
      planId: string;
      planName: string;
      status: string;
      billingCycle: string;
      creatorChecksLimit: number;
      creatorChecksRemaining: number;
      checksUsed: number;
      usagePercentage: number;
      currentPeriodStart: string;
      currentPeriodEnd: string;
      cancelAtPeriodEnd: boolean;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
    };
    paymentMethod: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    } | null;
  }> {
    let sub = await prisma.subscription.findFirst({
      where: { userId },
    });

    // If no subscription exists in database, seed a default Starter trial subscription
    if (!sub) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const defaultPlan = user?.role === "CREATOR" ? "free" : "growth";
      const plan = PricingService.getPlanById(defaultPlan);

      sub = await prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          billingCycle: "monthly",
          creatorChecksRemaining: plan.creatorChecksMonthly,
          creatorChecksLimit: plan.creatorChecksMonthly,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
        },
      });
    }

    const plan = PricingService.getPlanById(sub.planId);
    const checksUsed = Math.max(0, sub.creatorChecksLimit - sub.creatorChecksRemaining);
    const usagePercentage = sub.creatorChecksLimit > 0 ? Math.min(100, Math.round((checksUsed / sub.creatorChecksLimit) * 100)) : 0;

    let paymentMethod = null;
    if (sub.stripeCustomerId) {
      paymentMethod = await getCustomerPaymentMethodInfo(sub.stripeCustomerId);
    }

    return {
      subscription: {
        planId: sub.planId,
        planName: plan.name,
        status: sub.status,
        billingCycle: sub.billingCycle,
        creatorChecksLimit: sub.creatorChecksLimit,
        creatorChecksRemaining: sub.creatorChecksRemaining,
        checksUsed,
        usagePercentage,
        currentPeriodStart: sub.currentPeriodStart.toISOString(),
        currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        stripeCustomerId: sub.stripeCustomerId,
        stripeSubscriptionId: sub.stripeSubscriptionId,
      },
      paymentMethod,
    };
  }

  /**
   * Load real invoice and payment history from PostgreSQL PaymentRecord
   */
  public static async getPaymentHistory(userId: string): Promise<Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    hostedInvoiceUrl?: string;
    invoicePdfUrl?: string;
  }>> {
    const records = await prisma.paymentRecord.findMany({
      where: {
        OR: [
          { userId },
          { subscription: { userId } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return records.map((r) => ({
      id: r.stripeInvoiceId || r.id,
      date: r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      description: r.description || `${r.purpose} Payment`,
      amount: r.amount,
      currency: r.currency.toUpperCase(),
      status: r.status === "succeeded" ? "Paid" : r.status,
      hostedInvoiceUrl: r.hostedInvoiceUrl || undefined,
      invoicePdfUrl: r.invoicePdfUrl || undefined,
    }));
  }
}
