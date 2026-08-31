import { NextResponse } from "next/server";
import { MessageService } from "@/services/collaborationService";
import { getServerSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const collaborationId = searchParams.get("collaborationId");
    if (!collaborationId) return NextResponse.json({ error: "Missing collaborationId" }, { status: 400 });

    const result = await MessageService.getMessagesAuthorized(collaborationId, session);
    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status || 400 });

    return NextResponse.json({ messages: result.messages });
  } catch (err) {
    console.error("Messages GET error:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { collaborationId, text } = body;
    if (!collaborationId || !text) {
      return NextResponse.json({ error: "Missing required message parameters" }, { status: 400 });
    }

    const result = await MessageService.sendMessageAuthorized(collaborationId, session, text);
    if (result.error || !result.message) {
      return NextResponse.json({ error: result.error || "Failed to send" }, { status: result.status || 400 });
    }

    return NextResponse.json({ message: result.message }, { status: 201 });
  } catch (err) {
    console.error("Messages POST error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
