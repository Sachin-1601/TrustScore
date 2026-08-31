import { NextResponse } from "next/server";
import { PaymentService } from "@/services/paymentService";
import { getServerSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const invoices = await PaymentService.getPaymentHistory(session.userId);
    return NextResponse.json({ invoices });
  } catch (err: any) {
    console.error("Fetch invoices error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load payment history" },
      { status: 500 }
    );
  }
}
