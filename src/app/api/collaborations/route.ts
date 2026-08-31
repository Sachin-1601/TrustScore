import { NextResponse } from "next/server";
import { CollaborationService } from "@/services/collaborationService";
import { getServerSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const collaborations = await CollaborationService.getCollaborationsForSession(session);
    return NextResponse.json({ collaborations });
  } catch (err) {
    console.error("Collaborations GET error:", err);
    return NextResponse.json({ error: "Failed to fetch collaborations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { creatorId, campaignName, campaignDescription, budget, deliverables, timeline, contactEmail } = body;

    if (!creatorId || !campaignName || budget === undefined || !deliverables) {
      const missing = [
        !creatorId && "creatorId",
        !campaignName && "campaignName",
        budget === undefined && "budget",
        !deliverables && "deliverables",
      ].filter(Boolean).join(", ");
      return NextResponse.json({ error: `Missing required collaboration field(s): ${missing}` }, { status: 400 });
    }

    const result = await CollaborationService.createProposal(session, {
      creatorIdOrUsername: creatorId,
      campaignName,
      campaignDescription: campaignDescription || "Product showcase with honest review.",
      budget: Number(budget),
      deliverables,
      timeline: timeline || "2 weeks",
      contactEmail: contactEmail || session.email,
    });

    if (result.error || !result.collaboration) {
      return NextResponse.json({ error: result.error || "Failed to create proposal" }, { status: result.status || 400 });
    }

    return NextResponse.json({ collaboration: result.collaboration }, { status: 201 });
  } catch (err) {
    console.error("Collaborations POST error:", err);
    return NextResponse.json({ error: "Failed to create collaboration proposal" }, { status: 500 });
  }
}
