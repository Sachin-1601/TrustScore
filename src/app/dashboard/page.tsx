import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

/**
 * Canonical /dashboard entry route.
 * Performs immediate server-side role-based redirection to the appropriate primary workspace:
 * - CREATOR -> /dashboard/creator
 * - BUSINESS / AGENCY -> /dashboard/businesses
 * - ADMIN -> /admin
 */
export default async function DashboardEntryPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "CREATOR") {
    redirect("/dashboard/creator");
  } else if (session.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/dashboard/businesses");
  }
}
