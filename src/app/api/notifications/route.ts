import { NextResponse } from "next/server";
import { NotificationService } from "@/services/notificationService";

export async function GET(req: Request) {
  try {
    const notifications = await NotificationService.getUserNotifications("user-sarah-business");
    return NextResponse.json({ notifications });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch notifications" }, { status: 500 });
  }
}
