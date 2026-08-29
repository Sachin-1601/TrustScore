import { NextResponse } from "next/server";
import { BusinessService } from "@/services/businessService";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const business = await BusinessService.getBusinessBySlug(resolvedParams.id);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    return NextResponse.json({ business });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch business" }, { status: 500 });
  }
}
