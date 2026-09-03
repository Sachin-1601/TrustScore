import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, accountType } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const result = await AuthService.login(email, password, accountType);

    if (result.emailUnverified) {
      console.log(`[AUTH DEBUG] login email: ${email} -> emailUnverified: true`);
      return NextResponse.json(
        {
          error: result.error || "Please verify your email address before signing in.",
          emailUnverified: true,
          email: result.email,
        },
        { status: 403 }
      );
    }

    if (result.error || !result.session) {
      console.log(`[AUTH DEBUG] login email: ${email} -> error: ${result.error}`);
      return NextResponse.json({ error: result.error || "Authentication failed" }, { status: 401 });
    }

    console.log(`[AUTH DEBUG] login email: ${result.session.email} | database role: ${result.session.role} | session role: ${result.session.role}`);

    await setSessionCookie({
      userId: result.session.id,
      email: result.session.email,
      name: result.session.name,
      role: result.session.role as any,
      avatar: result.session.avatar,
      onboardingCompleted: result.session.onboardingCompleted,
      onboardingStep: result.session.onboardingStep,
      creatorProfileId: result.session.creatorProfileId,
      businessProfileId: result.session.businessProfileId,
    });

    return NextResponse.json({ session: result.session, success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
