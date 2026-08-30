import { NextResponse } from "next/server";
import { MessageService } from "@/services/collaborationService";
import { getServerSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const collaborationId = searchParams.get("collaborationId");

    if (!collaborationId) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await MessageService.getMessages(collaborationId);
    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const body = await req.json();
    const { collaborationId, text } = body;

    if (!collaborationId || !text) {
      return NextResponse.json({ error: "Missing required message parameters" }, { status: 400 });
    }

    const senderId = session?.userId || "user-sarah-business";
    const senderName = session?.name || "Member";

    const message = await MessageService.sendMessage(
      collaborationId,
      senderId,
      senderName,
      text
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }
}
