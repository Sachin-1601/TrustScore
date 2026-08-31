import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { db } from "@/db/client";
import { getServerSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      // Find business profile or query saved creators directly
      let businessProfileId = session.businessProfileId;
      if (!businessProfileId) {
        const bp = await prisma.businessProfile.findUnique({ where: { userId: session.userId } });
        businessProfileId = bp?.id;
      }

      if (businessProfileId) {
        const savedRecords = await prisma.savedCreator.findMany({
          where: { businessId: businessProfileId },
          include: { creator: true },
          orderBy: { savedAt: "desc" },
        });

        const saved = savedRecords.map((r) => r.creator.username.replace("@", ""));
        return NextResponse.json({ saved, success: true });
      }
    } catch (dbErr) {
      console.warn("Prisma saved creators query failed, using fallback:", dbErr);
    }

    const saved = await db.listSavedCreators(session.userId);
    return NextResponse.json({ saved, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch saved creators" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { creatorId } = body;

    if (!creatorId) {
      return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
    }

    const cleanCreatorId = creatorId.replace("@", "").toLowerCase();

    try {
      let businessProfileId = session.businessProfileId;
      if (!businessProfileId) {
        const bp = await prisma.businessProfile.findUnique({ where: { userId: session.userId } });
        businessProfileId = bp?.id;
      }

      // Look up target creator profile
      const creatorProfile = await prisma.creatorProfile.findFirst({
        where: {
          OR: [
            { id: cleanCreatorId },
            { username: { equals: cleanCreatorId, mode: "insensitive" } },
            { username: { equals: `@${cleanCreatorId}`, mode: "insensitive" } },
          ],
        },
      });

      if (businessProfileId && creatorProfile) {
        await prisma.savedCreator.upsert({
          where: {
            businessId_creatorId: {
              businessId: businessProfileId,
              creatorId: creatorProfile.id,
            },
          },
          create: {
            businessId: businessProfileId,
            creatorId: creatorProfile.id,
          },
          update: {
            savedAt: new Date(),
          },
        });

        return NextResponse.json({ success: true });
      }
    } catch (dbErr) {
      console.warn("Prisma save creator failed, using fallback:", dbErr);
    }

    await db.saveCreator(session.userId, cleanCreatorId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save creator" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json({ error: "Missing creatorId" }, { status: 400 });
    }

    const cleanCreatorId = creatorId.replace("@", "").toLowerCase();

    try {
      let businessProfileId = session.businessProfileId;
      if (!businessProfileId) {
        const bp = await prisma.businessProfile.findUnique({ where: { userId: session.userId } });
        businessProfileId = bp?.id;
      }

      const creatorProfile = await prisma.creatorProfile.findFirst({
        where: {
          OR: [
            { id: cleanCreatorId },
            { username: { equals: cleanCreatorId, mode: "insensitive" } },
            { username: { equals: `@${cleanCreatorId}`, mode: "insensitive" } },
          ],
        },
      });

      if (businessProfileId && creatorProfile) {
        await prisma.savedCreator.deleteMany({
          where: {
            businessId: businessProfileId,
            creatorId: creatorProfile.id,
          },
        });

        return NextResponse.json({ success: true });
      }
    } catch (dbErr) {
      console.warn("Prisma remove saved creator failed, using fallback:", dbErr);
    }

    await db.removeSavedCreator(session.userId, cleanCreatorId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to remove saved creator" }, { status: 500 });
  }
}
