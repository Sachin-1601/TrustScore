import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { setSessionCookie } from "@/lib/session";
import { UserRole } from "@prisma/client";

/**
 * Normalize a client-supplied role string into an allowed public signup role.
 * ADMIN / AGENCY can NEVER be created through this public endpoint.
 */
function normalizePublicRole(raw: unknown): UserRole | null {
  const value = String(raw || "").trim().toUpperCase();
  if (value === "CREATOR") return "CREATOR";
  if (value === "BUSINESS") return "BUSINESS";
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role, handleOrCompany, category, platform } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required signup fields" }, { status: 400 });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(String(email).trim())) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    const safeRole = normalizePublicRole(role);
    if (!safeRole) {
      return NextResponse.json(
        { error: "Invalid account type. You may register as a Creator or a Business." },
        { status: 400 }
      );
    }

    const { session, error } = await AuthService.signup({
      email,
      passwordPlain: password,
      name,
      role: safeRole,
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
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
