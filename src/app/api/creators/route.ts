import { NextResponse } from "next/server";
import { CreatorService } from "@/services/creatorService";
import { getServerSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("q") || undefined;
    const category = searchParams.get("category") || undefined;
    const platform = searchParams.get("platform") || undefined;
    const minTrustScore = searchParams.get("minTrustScore") ? Number(searchParams.get("minTrustScore")) : undefined;
    const followerRange = (searchParams.get("followerRange") as any) || undefined;
    const location = searchParams.get("location") || undefined;
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const socialVerifiedOnly = searchParams.get("socialVerifiedOnly") === "true";
    const availableOnly = searchParams.get("availableOnly") === "true";
    const sortBy = (searchParams.get("sortBy") as any) || "trust";
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 12;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined;

    const result = await CreatorService.getCreators({
      query, category, platform, minTrustScore, followerRange, location,
      verifiedOnly, socialVerifiedOnly, availableOnly, sortBy, limit, page, offset,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Creators API GET error:", err);
    return NextResponse.json({ error: "Failed to fetch creators" }, { status: 500 });
  }
}

/**
 * Authenticated creator onboarding — creates an EMPTY (pending) creator profile
 * tied to the current session. No telemetry / TrustScore is fabricated.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "CREATOR" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Only creator accounts can create a creator profile" }, { status: 403 });
    }

    const body = await req.json();
    const { name, username, category, location, platform, bio } = body;
    if (!name || !username || !category || !location || !platform) {
      return NextResponse.json({ error: "Missing required creator onboarding fields" }, { status: 400 });
    }

    const creator = await CreatorService.onboardCreator({
      userId: session.userId,
      name, username, category, location, platform, bio,
    });

    return NextResponse.json({ creator }, { status: 201 });
  } catch (err) {
    console.error("Creators API POST error:", err);
    return NextResponse.json({ error: "Failed to onboard creator" }, { status: 500 });
  }
}
