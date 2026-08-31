import { NextResponse } from "next/server";
import { CampaignService } from "@/services/campaignService";
import { getServerSession } from "@/lib/session";
import { BusinessService } from "@/services/businessService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const query = searchParams.get("query") || undefined;
    const minTrustScore = searchParams.get("minTrustScore") ? Number(searchParams.get("minTrustScore")) : undefined;
    const businessId = searchParams.get("businessId") || undefined;

    const campaigns = await CampaignService.getCampaigns({
      category,
      query,
      minTrustScore,
      businessId,
    });

    return NextResponse.json({ campaigns, total: campaigns.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, budget, deliverables, targetMinTrustScore, targetFollowerRange, startDate, endDate } = body;

    if (!title || !category || !budget || !deliverables) {
      return NextResponse.json({ error: "Missing required campaign fields" }, { status: 400 });
    }

    let businessId = session.businessProfileId;
    if (!businessId) {
      const bp = await BusinessService.getBusinessProfileByUserId(session.userId);
      businessId = bp?.id;
    }
    if (!businessId) {
      return NextResponse.json({ error: "Only business accounts can create campaigns" }, { status: 403 });
    }

    const campaign = await CampaignService.createCampaign({
      businessId,
      title,
      category,
      budget: Number(budget),
      deliverables,
      targetMinTrustScore: targetMinTrustScore ? Number(targetMinTrustScore) : 80,
      targetFollowerRange: targetFollowerRange || "10k-50k",
      startDate,
      endDate,
    });

    return NextResponse.json({ campaign, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create campaign" }, { status: 500 });
  }
}
