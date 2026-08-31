import { NextResponse } from "next/server";
import { AdvertisementService } from "@/services/advertisementService";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get("placement") as any;

    const ads = placement
      ? await AdvertisementService.getAdsByPlacement(placement)
      : await AdvertisementService.getAdvertisements();

    const packages = AdvertisementService.getPackages();
    return NextResponse.json({ advertisements: ads, packages });
  } catch (err) {
    console.error("Advertisements GET error:", err);
    return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const business = await prisma.businessProfile.findUnique({ where: { userId: session.userId } });
    if (!business) {
      return NextResponse.json({ error: "Only business accounts can create advertisements" }, { status: 403 });
    }

    const body = await req.json();
    const { tagline, description, ctaLink, packageId, placement } = body;
    if (!tagline || !description || !ctaLink) {
      return NextResponse.json({ error: "Missing required advertisement fields" }, { status: 400 });
    }

    // Draft is created as PENDING_REVIEW — it only goes live after verified payment.
    const ad = await AdvertisementService.createDraft({
      businessProfileId: business.id,
      packageId: packageId || "growth",
      tagline,
      description,
      ctaLink,
      placement: placement || "left_sidebar",
    });

    return NextResponse.json(
      { advertisement: ad, message: "Advertisement draft created. Complete checkout to activate." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Advertisements POST error:", err);
    return NextResponse.json({ error: "Failed to create advertisement" }, { status: 500 });
  }
}
