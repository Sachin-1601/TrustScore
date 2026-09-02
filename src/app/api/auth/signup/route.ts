import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
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

    const cleanEmail = String(email || "").trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    const safeRole = normalizePublicRole(role);
    if (!safeRole) {
      return NextResponse.json(
        { error: "Invalid account type. You may register as a Creator or a Business." },
        { status: 400 }
      );
    }

    if (safeRole === "CREATOR" && !cleanEmail.endsWith("@gmail.com")) {
      return NextResponse.json(
        { error: "Creator accounts require a Gmail address ending in @gmail.com." },
        { status: 400 }
      );
    }

    const result = await AuthService.signup({
      email: cleanEmail,
      passwordPlain: password,
      name,
      role: safeRole,
      handleOrCompany,
      category,
      platform,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // DO NOT set session cookie. Account is created in UNVERIFIED state.
    return NextResponse.json(
      {
        success: true,
        requiresVerification: true,
        email: result.email,
        message: "Account created. Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
