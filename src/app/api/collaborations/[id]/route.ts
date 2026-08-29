import { NextResponse } from "next/server";
import { CollaborationService } from "@/services/collaborationService";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Missing status field" }, { status: 400 });
    }

    const updated = await CollaborationService.updateStatus(resolvedParams.id, status);
    if (!updated) {
      return NextResponse.json({ error: "Collaboration not found" }, { status: 404 });
    }

    return NextResponse.json({ collaboration: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update collaboration" }, { status: 500 });
  }
}
