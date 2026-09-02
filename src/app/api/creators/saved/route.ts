import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { CreatorService } from "@/services/creatorService";

/**
 * SavedCreator ownership is always scoped to the authenticated business profile.
 * Business A saving a creator never affects Business B.
 */
async function requireBusinessProfileId(userId: string): Promise<string | null> {
  const bp = await prisma.businessProfile.findUnique({ where: { userId }, select: { id: true } });
  return bp?.id || null;
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const businessProfileId = await requireBusinessProfileId(session.userId);
    if (!businessProfileId) {
      // Non-business accounts have no saved list.
      return NextResponse.json({ saved: [], creators: [], success: true });
    }

    const records = await prisma.savedCreator.findMany({
      where: { businessId: businessProfileId },
      include: {
        creator: {
          include: {
            user: true,
            trustScores: { orderBy: { calculatedAt: "desc" }, take: 1, include: { factors: true } },
            socialAccounts: true,
            verifications: true,
            engagementSnapshots: { orderBy: { recordedAt: "desc" }, take: 15 },
          },
        },
      },
      orderBy: { savedAt: "desc" },
    });

    const saved = records.map((r) => r.creator.username.replace("@", ""));
    const creators = records.map((r) => CreatorService.mapPrismaToCreator(r.creator));

    return NextResponse.json({ saved, creators, success: true });
  } catch (err) {
    console.error("Saved creators GET error:", err);
    return NextResponse.json({ error: "Failed to fetch saved creators" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const businessProfileId = await requireBusinessProfileId(session.userId);
    if (!businessProfileId) {
      return NextResponse.json({ error: "Only business accounts can save creators" }, { status: 403 });
    }

    const { creatorId } = await req.json();
    if (!creatorId) return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });

    const cleanCreatorId = String(creatorId).replace("@", "").toLowerCase();
    const creatorProfile = await prisma.creatorProfile.findFirst({
      where: {
        OR: [
          { id: cleanCreatorId },
          { username: { equals: cleanCreatorId, mode: "insensitive" } },
          { username: { equals: `@${cleanCreatorId}`, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    if (!creatorProfile) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    await prisma.savedCreator.upsert({
      where: { businessId_creatorId: { businessId: businessProfileId, creatorId: creatorProfile.id } },
      create: { businessId: businessProfileId, creatorId: creatorProfile.id },
      update: { savedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Saved creators POST error:", err);
    return NextResponse.json({ error: "Failed to save creator" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const businessProfileId = await requireBusinessProfileId(session.userId);
    if (!businessProfileId) {
      return NextResponse.json({ error: "Only business accounts can modify saved creators" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");
    if (!creatorId) return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });

    const cleanCreatorId = creatorId.replace("@", "").toLowerCase();
    const creatorProfile = await prisma.creatorProfile.findFirst({
      where: {
        OR: [
          { id: cleanCreatorId },
          { username: { equals: cleanCreatorId, mode: "insensitive" } },
          { username: { equals: `@${cleanCreatorId}`, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });
    if (!creatorProfile) return NextResponse.json({ success: true });

    await prisma.savedCreator.deleteMany({
      where: { businessId: businessProfileId, creatorId: creatorProfile.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Saved creators DELETE error:", err);
    return NextResponse.json({ error: "Failed to remove saved creator" }, { status: 500 });
  }
}
