import Stripe from "stripe";
import { prisma } from "./prisma";

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === "production") {
  console.warn("⚠️ STRIPE_SECRET_KEY environment variable is missing!");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key", {
  apiVersion: "2025-02-24.acacia" as any,
  typescript: true,
  appInfo: {
    name: "TrustScore SaaS",
    version: "1.0.0",
  },
});

export type PlanTier = "starter" | "growth" | "agency";
export type BillingCycle = "monthly" | "annual";

/**
 * Resolve configured Stripe Price ID from environment variables
 */
export function getStripePriceId(planId: PlanTier, billingCycle: BillingCycle): string | undefined {
  const normalizedPlan = planId.toLowerCase() as PlanTier;
  const isAnnual = billingCycle === "annual";

  if (normalizedPlan === "starter") {
    return isAnnual ? process.env.STRIPE_PRICE_STARTER_ANNUAL : process.env.STRIPE_PRICE_STARTER_MONTHLY;
  }
  if (normalizedPlan === "growth") {
    return isAnnual ? process.env.STRIPE_PRICE_GROWTH_ANNUAL : process.env.STRIPE_PRICE_GROWTH_MONTHLY;
  }
  if (normalizedPlan === "agency") {
    return isAnnual ? process.env.STRIPE_PRICE_AGENCY_ANNUAL : process.env.STRIPE_PRICE_AGENCY_MONTHLY;
  }
  return undefined;
}

/**
 * Get or create a Stripe Customer for a given authenticated user
 */
export async function getOrCreateStripeCustomer(params: {
  userId: string;
  email: string;
  name?: string;
}): Promise<string> {
  const { userId, email, name } = params;

  // 1. Check existing subscription in DB
  const existingSub = await prisma.subscription.findFirst({
    where: { userId },
    select: { stripeCustomerId: true },
  });

  if (existingSub?.stripeCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingSub.stripeCustomerId);
      if (!customer.deleted) {
        return existingSub.stripeCustomerId;
      }
    } catch {
      // Customer not found on Stripe, recreate below
    }
  }

  // 2. Lookup existing customer on Stripe by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    const customerId = existingCustomers.data[0].id;
    // Update local DB
    await prisma.subscription.updateMany({
      where: { userId },
      data: { stripeCustomerId: customerId },
    });
    return customerId;
  }

  // 3. Create a new Stripe customer
  const newCustomer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
      app: "TrustScore",
    },
  });

  // Update DB with newly created customerId
  await prisma.subscription.updateMany({
    where: { userId },
    data: { stripeCustomerId: newCustomer.id },
  });

  return newCustomer.id;
}

/**
 * Retrieve safe payment method details (brand, last4, expiry) for customer
 */
export async function getCustomerPaymentMethodInfo(stripeCustomerId: string): Promise<{
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
} | null> {
  try {
    const customer = await stripe.customers.retrieve(stripeCustomerId, {
      expand: ["invoice_settings.default_payment_method", "subscriptions.data.default_payment_method"],
    });

    if (customer.deleted) return null;

    let pm = (customer as Stripe.Customer).invoice_settings?.default_payment_method as Stripe.PaymentMethod | undefined;

    if (!pm && (customer as Stripe.Customer).subscriptions?.data?.length) {
      pm = (customer as Stripe.Customer).subscriptions?.data[0].default_payment_method as Stripe.PaymentMethod | undefined;
    }

    if (!pm) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: "card",
        limit: 1,
      });
      if (paymentMethods.data.length > 0) {
        pm = paymentMethods.data[0];
      }
    }

    if (pm?.card) {
      return {
        brand: pm.card.brand.toUpperCase(),
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      };
    }

    return null;
  } catch (err) {
    console.error("Error retrieving payment method from Stripe:", err);
    return null;
  }
}
