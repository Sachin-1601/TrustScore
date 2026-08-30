import { NextResponse } from "next/server";
import { CreatorService } from "@/services/creatorService";
import { db } from "@/db/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "user-alex-creator";

    const creator = await CreatorService.getCreatorByUserId(userId);
    if (!creator) {
      // Return default alexfitness for seamless experience
      const fallback = await CreatorService.getCreatorById("alexfitness");
      return NextResponse.json({ creator: fallback });
    }

    return NextResponse.json({ creator });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch creator profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      userId = "user-alex-creator",
      creatorId = "alexfitness",
      role = "CREATOR",
      name,
      bio,
      category,
      location,
      website,
      startingRate,
      availabilityStatus,
      profileTags,
      isAvailableForCollaboration,
      preferredCampaignTypes,
    } = body;

    // Server-side role check
    if (role !== "CREATOR" && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only creators or admins can update a creator profile" },
        { status: 403 }
      );
    }

    const result = await CreatorService.updateCreatorProfile(
      userId,
      creatorId,
      {
        name,
        bio,
        category,
        location,
        website,
        startingRate,
        availabilityStatus,
        profileTags,
        isAvailableForCollaboration,
        preferredCampaignTypes,
      },
      role
    );

    if (!result.success || !result.creator) {
      return NextResponse.json({ error: result.error || "Failed to update profile" }, { status: 400 });
    }

    return NextResponse.json({ creator: result.creator, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
