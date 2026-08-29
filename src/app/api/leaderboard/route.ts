import { NextResponse } from "next/server";
import { CreatorService } from "@/services/creatorService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";
    const platform = searchParams.get("platform") || "all";
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;

    const leaderboard = await CreatorService.getLeaderboard(category, platform, limit);
    return NextResponse.json({ leaderboard });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch leaderboard" }, { status: 500 });
  }
}
