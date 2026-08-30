import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role, handleOrCompany, category, platform } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required signup fields" }, { status: 400 });
    }

    const { session, error } = await AuthService.signup({
      email,
      passwordPlain: password,
      name,
      role: role || "BUSINESS",
      handleOrCompany,
      category,
      platform,
    });

    if (error || !session) {
      return NextResponse.json({ error: error || "Registration failed" }, { status: 400 });
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

    return NextResponse.json({ session, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
