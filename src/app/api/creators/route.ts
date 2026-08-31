import { NextResponse } from "next/server";
import { CreatorService } from "@/services/creatorService";

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
      query,
      category,
      platform,
      minTrustScore,
      followerRange,
      location,
      verifiedOnly,
      socialVerifiedOnly,
      availableOnly,
      sortBy,
      limit,
      page,
      offset,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Creators API GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch creators" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, category, location, platform, followers, bio } = body;

    if (!name || !username || !category || !location || !platform) {
      return NextResponse.json({ error: "Missing required creator onboarding fields" }, { status: 400 });
    }

    const creator = await CreatorService.onboardCreator({
      name,
      username,
      category,
      location,
      platform,
      followers: followers ? Number(followers) : undefined,
      bio,
    });

    return NextResponse.json({ creator }, { status: 201 });
  } catch (err: any) {
    console.error("Creators API POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to onboard creator" }, { status: 500 });
  }
}
