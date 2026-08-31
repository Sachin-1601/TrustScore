import { NextResponse } from "next/server";
import { CollaborationService } from "@/services/collaborationService";
import { getServerSession } from "@/lib/session";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { collaboration, authorized, notFound } = await CollaborationService.getAuthorizedCollaboration(id, session);
    if (notFound || !collaboration) return NextResponse.json({ error: "Collaboration not found" }, { status: 404 });
    if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ collaboration });
  } catch (err) {
    console.error("Collaboration GET error:", err);
    return NextResponse.json({ error: "Failed to fetch collaboration" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status } = body;
    if (!status) return NextResponse.json({ error: "Missing status field" }, { status: 400 });

    const result = await CollaborationService.updateStatusAuthorized(id, status, session);
    if (result.error || !result.collaboration) {
      return NextResponse.json({ error: result.error || "Update failed" }, { status: result.status || 400 });
    }

    return NextResponse.json({ collaboration: result.collaboration });
  } catch (err) {
    console.error("Collaboration PATCH error:", err);
    return NextResponse.json({ error: "Failed to update collaboration" }, { status: 500 });
  }
}
