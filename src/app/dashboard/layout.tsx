"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    console.log(`[ROUTING DEBUG] pathname: ${pathname} | authenticated: ${!!user} | role: ${role} | onboardingCompleted: ${user.onboardingCompleted}`);

    // Check onboarding completion
    if (!user.onboardingCompleted && role !== "ADMIN") {
      const onboardingPath = role === "CREATOR" ? "/onboarding/creator" : "/onboarding/business";
      console.log(`[ROUTING DEBUG] Incomplete onboarding for ${role} -> redirect: ${onboardingPath}`);
      router.replace(onboardingPath);
      return;
    }

    // Role-based route guards
    if (role === "CREATOR") {
      if (pathname === "/dashboard" || pathname.startsWith("/dashboard/businesses")) {
        console.log(`[ROUTING DEBUG] CREATOR on ${pathname} -> redirect: /dashboard/creator`);
        router.replace("/dashboard/creator");
      }
    } else if (role === "BUSINESS" || role === "AGENCY") {
      if (pathname === "/dashboard" || pathname.startsWith("/dashboard/creator")) {
        console.log(`[ROUTING DEBUG] BUSINESS on ${pathname} -> redirect: /dashboard/businesses`);
        router.replace("/dashboard/businesses");
      }
    } else if (role !== "ADMIN" && (pathname === "/admin" || pathname === "/dashboard/model-insights")) {
      const dest = role === "CREATOR" ? "/dashboard/creator" : "/dashboard/businesses";
      console.log(`[ROUTING DEBUG] NON-ADMIN on ${pathname} -> redirect: ${dest}`);
      router.replace(dest);
    }
  }, [user, role, isLoading, pathname, router]);

  // Prevent flash of unauthorized content while loading or redirecting
  if (isLoading || !user || !role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-semibold">Loading TrustScore Workspace...</p>
      </div>
    );
  }

  // Guard: Block rendering children if onboarding is incomplete
  if (!user.onboardingCompleted && role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-semibold">Redirecting to Account Onboarding...</p>
      </div>
    );
  }

  // Guard: Block rendering children if Creator is on Business route
  if (role === "CREATOR" && (pathname === "/dashboard" || pathname.startsWith("/dashboard/businesses"))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-semibold">Redirecting to Creator Workspace...</p>
      </div>
    );
  }

  // Guard: Block rendering children if Business is on Creator route
  if ((role === "BUSINESS" || role === "AGENCY") && (pathname === "/dashboard" || pathname.startsWith("/dashboard/creator"))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-semibold">Redirecting to Business Workspace...</p>
      </div>
    );
  }

  // Guard: Block rendering children if Non-Admin is on Admin route
  if (role !== "ADMIN" && (pathname === "/admin" || pathname === "/dashboard/model-insights")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-semibold">Redirecting to Authorized Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
