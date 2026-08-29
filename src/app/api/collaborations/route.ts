import { NextResponse } from "next/server";
import { CollaborationService } from "@/services/collaborationService";

export async function GET(req: Request) {
  try {
    const collabs = await CollaborationService.getCollaborations();
    return NextResponse.json({ collaborations: collabs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch collaborations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { creatorId, businessName, campaignName, campaignDescription, budget, deliverables, timeline, contactEmail } = body;

    if (!creatorId || !businessName || !campaignName || !budget || !deliverables) {
      return NextResponse.json({ error: "Missing required collaboration fields" }, { status: 400 });
    }

    const collab = await CollaborationService.createProposal({
      creatorId,
      businessName,
      campaignName,
      campaignDescription: campaignDescription || "Product showcase with honest review.",
      budget: Number(budget),
      deliverables,
      timeline: timeline || "2 weeks",
      contactEmail: contactEmail || "partnerships@brand.com",
    });

    return NextResponse.json({ collaboration: collab }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create collaboration proposal" }, { status: 500 });
  }
}
