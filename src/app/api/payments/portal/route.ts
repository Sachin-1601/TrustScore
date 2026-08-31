import { NextResponse } from "next/server";
import { PaymentService } from "@/services/paymentService";
import { getServerSession } from "@/lib/session";
import { UserRole } from "@prisma/client";

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to manage your billing portal." },
        { status: 401 }
      );
    }

    if (session.role === UserRole.CREATOR) {
      return NextResponse.json(
        { error: "Forbidden. Creator accounts do not have a business customer billing portal." },
        { status: 403 }
      );
    }

    const result = await PaymentService.createBillingPortalSession(session.userId);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Billing portal error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to open Stripe Billing Portal" },
      { status: 500 }
    );
  }
}
