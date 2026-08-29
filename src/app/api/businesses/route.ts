import { NextResponse } from "next/server";
import { BusinessService } from "@/services/businessService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || undefined;
    const category = searchParams.get("category") || undefined;

    const businesses = await BusinessService.getBusinesses(query, category);
    return NextResponse.json({ businesses, total: businesses.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch businesses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, location, website, tagline, description } = body;

    if (!name || !category || !website) {
      return NextResponse.json({ error: "Missing required business onboarding fields" }, { status: 400 });
    }

    const business = await BusinessService.onboardBusiness({
      name,
      category,
      location: location || "Australia",
      website,
      tagline: tagline || `${name} Creator Partnerships`,
      description: description || "Direct-to-consumer brand collaborating with authentic creators.",
    });

    return NextResponse.json({ business }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to onboard business" }, { status: 500 });
  }
}
