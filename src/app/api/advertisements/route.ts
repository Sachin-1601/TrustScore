import { NextResponse } from "next/server";
import { AdvertisementService } from "@/services/advertisementService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const placement = searchParams.get("placement") as any;

    const ads = placement
      ? await AdvertisementService.getAdsByPlacement(placement)
      : await AdvertisementService.getAdvertisements();

    const packages = AdvertisementService.getPackages();

    return NextResponse.json({ advertisements: ads, packages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch advertisements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessName, category, tagline, description, ctaLink, packageId, placement } = body;

    if (!businessName || !category || !tagline || !description || !ctaLink) {
      return NextResponse.json({ error: "Missing required advertisement fields" }, { status: 400 });
    }

    const ad = await AdvertisementService.createAdvertisement({
      businessName,
      category,
      tagline,
      description,
      ctaLink,
      packageId: packageId || "growth",
      placement: placement || "left_sidebar",
    });

    return NextResponse.json({ advertisement: ad }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create advertisement" }, { status: 500 });
  }
}
