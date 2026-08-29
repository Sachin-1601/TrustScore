import { NextResponse } from "next/server";
import { CreatorService } from "@/services/creatorService";

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
