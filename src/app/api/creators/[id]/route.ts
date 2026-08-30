import { NextResponse } from "next/server";
import { CreatorService } from "@/services/creatorService";
import { getServerSession } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const creator = await CreatorService.getCreatorById(resolvedParams.id);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }
    return NextResponse.json({ creator });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch creator" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await req.json();
    const { userId, role, ...updates } = body;

    const result = await CreatorService.updateCreatorProfile(
      session.userId,
      resolvedParams.id,
      updates,
      session.role
    );

    if (!result.success || !result.creator) {
      return NextResponse.json({ error: result.error || "Update failed" }, { status: 400 });
    }

    return NextResponse.json({ creator: result.creator, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
