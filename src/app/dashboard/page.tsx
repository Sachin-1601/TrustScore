"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Generic /dashboard entry route.
 * Performs canonical, role-based redirection to the appropriate primary workspace:
 * - CREATOR -> /dashboard/creator
 * - BUSINESS -> /dashboard/businesses
 * - AGENCY -> /dashboard/businesses
 * - ADMIN -> /admin
 */
export default function DashboardEntryRouter() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (role === "CREATOR") {
      router.replace("/dashboard/creator");
    } else if (role === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/dashboard/businesses");
    }
  }, [user, role, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-xs font-semibold">Redirecting to your dedicated workspace...</p>
    </div>
  );
}
