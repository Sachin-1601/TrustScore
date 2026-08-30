import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const { session, error } = await AuthService.login(email, password);
    if (error || !session) {
      return NextResponse.json({ error: error || "Authentication failed" }, { status: 401 });
    }

    await setSessionCookie({
      userId: session.id,
      email: session.email,
      name: session.name,
      role: session.role as any,
      avatar: session.avatar,
      creatorProfileId: session.creatorProfileId,
      businessProfileId: session.businessProfileId,
    });

    return NextResponse.json({ session, success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
