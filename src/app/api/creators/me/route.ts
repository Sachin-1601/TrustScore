import { NextResponse } from "next/server";
import { CreatorService } from "@/services/creatorService";
import { getServerSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creator = await CreatorService.getCreatorByUserId(session.userId);
    if (!creator) {
      return NextResponse.json({ creator: null, message: "Creator profile not initialized" });
    }

    return NextResponse.json({ creator });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch creator profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "CREATOR" && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only creators or admins can update a creator profile" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      avatar,
      bio,
      category,
      location,
      country,
      platform,
      website,
      startingRate,
      availabilityStatus,
      profileTags,
      isAvailableForCollaboration,
      preferredCampaignTypes,
    } = body;

    const existingCreator = await CreatorService.getCreatorByUserId(session.userId);
    const targetCreatorId = existingCreator?.id || session.creatorProfileId || "me";

    const result = await CreatorService.updateCreatorProfile(
      session.userId,
      targetCreatorId,
      {
        name,
        avatar,
        bio,
        category,
        location,
        country,
        platform,
        website,
        startingRate,
        availabilityStatus,
        profileTags,
        isAvailableForCollaboration,
        preferredCampaignTypes,
      },
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
