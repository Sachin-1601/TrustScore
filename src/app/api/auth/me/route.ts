import { NextResponse } from "next/server";
import { db } from "@/db/client";

export async function GET(req: Request) {
  // In a cookie/session architecture, decode the JWT/Session ID from header
  const user = await db.findUserById("user-sarah-business");
  if (!user) {
    return NextResponse.json({ session: null }, { status: 200 });
  }

  return NextResponse.json({
    session: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
  });
}
