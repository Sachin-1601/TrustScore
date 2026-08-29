import { NextResponse } from "next/server";
import { AuthService } from "@/services/authService";

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

    return NextResponse.json({ session }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
