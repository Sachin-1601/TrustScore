import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { getServerSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getServerSession();
    const userId = session?.userId || "user-sarah-business";
    const saved = await db.listSavedCreators(userId);
    return NextResponse.json({ saved, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch saved creators" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const userId = session?.userId || "user-sarah-business";

    const body = await req.json();
    const { creatorId } = body;

    if (!creatorId) {
      return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
    }

    await db.saveCreator(userId, creatorId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save creator" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    const userId = session?.userId || "user-sarah-business";

    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
    }

    await db.removeSavedCreator(userId, creatorId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to remove saved creator" }, { status: 500 });
  }
}
