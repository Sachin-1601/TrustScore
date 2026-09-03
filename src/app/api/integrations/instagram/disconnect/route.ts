import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
    }

    // Delete connected Instagram SocialAccount record
    await prisma.socialAccount.deleteMany({
      where: {
        creatorId: creator.id,
        platform: "INSTAGRAM",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Instagram account disconnected successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to disconnect Instagram account" },
      { status: 500 }
    );
  }
}
