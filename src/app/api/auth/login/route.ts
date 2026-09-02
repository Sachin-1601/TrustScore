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
      return NextResponse.json({ error: result.error || "Authentication failed" }, { status: 401 });
    }

    await setSessionCookie({
      userId: result.session.id,
      email: result.session.email,
      name: result.session.name,
      role: result.session.role as any,
      avatar: result.session.avatar,
      creatorProfileId: result.session.creatorProfileId,
      businessProfileId: result.session.businessProfileId,
    });

    return NextResponse.json({ session: result.session, success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
