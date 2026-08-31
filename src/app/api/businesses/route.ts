import { NextResponse } from "next/server";
import { BusinessService } from "@/services/businessService";
import { getServerSession } from "@/lib/session";

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

/**
 * Complete / update the authenticated user's OWN business profile.
 * The business record itself is created at signup; this persists user-entered
 * details (no example.com placeholders).
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "BUSINESS" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Only business accounts can update a business profile" }, { status: 403 });
    }

    const body = await req.json();
    const { name, logo, category, location, website, tagline, description } = body;

    const result = await BusinessService.updateOwnBusiness(session.userId, {
      name, logo, category, location, website, tagline, description,
    });

    if (!result.success || !result.business) {
      return NextResponse.json({ error: result.error || "Failed to update business" }, { status: 400 });
    }

    return NextResponse.json({ business: result.business }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update business" }, { status: 500 });
  }
}
