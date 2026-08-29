import { NextResponse } from "next/server";
import { PaymentService } from "@/services/paymentService";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    const result = await PaymentService.handleWebhookEvent(rawBody);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Webhook processing failed" }, { status: 400 });
  }
}
