import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const result = await AuthService.resendVerification(email);

    if (result.rateLimited) {
      return NextResponse.json({ error: result.error, rateLimited: true }, { status: 429 });
    }

    if (result.isServiceError || !result.success) {
      return NextResponse.json(
        {
          error: result.error || "We couldn't send the verification email. Please check your SMTP configuration or try again shortly.",
          isServiceError: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        emailSent: true,
        message: result.message || "If an unverified account exists for this email, a new verification link has been sent.",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Resend verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
