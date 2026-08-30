import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { AuthService } from "@/services/authService";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    // Refresh user state from database/service
    const userSession = await AuthService.getUserById(session.userId);
    return NextResponse.json({ session: userSession || session }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ session: null, error: err.message }, { status: 500 });
  }
}
