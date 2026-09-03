import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

/**
 * Canonical /dashboard entry route.
 * Performs immediate server-side role-based and onboarding-aware redirection:
 * - ADMIN -> /admin
 * - CREATOR (incomplete onboarding) -> /onboarding/creator
 * - CREATOR (complete onboarding) -> /dashboard/creator
 * - BUSINESS / AGENCY (incomplete onboarding) -> /onboarding/business
 * - BUSINESS / AGENCY (complete onboarding) -> /dashboard/businesses
 */
export default async function DashboardEntryPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "ADMIN") {
    redirect("/admin");
  }

  const isOnboardingComplete = session.onboardingCompleted === true;

  if (session.role === "CREATOR") {
    if (!isOnboardingComplete) {
      redirect("/onboarding/creator");
    }
    redirect("/dashboard/creator");
  } else {
    if (!isOnboardingComplete) {
      redirect("/onboarding/business");
    }
    redirect("/dashboard/businesses");
  }
}
