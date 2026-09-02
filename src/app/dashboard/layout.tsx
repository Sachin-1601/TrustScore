"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";

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

    // Role-based route guards
    if (role === "CREATOR") {
      if (pathname === "/dashboard" || pathname.startsWith("/dashboard/businesses")) {
        router.replace("/dashboard/creator");
      }
    } else if (role === "BUSINESS" || role === "AGENCY") {
      if (pathname === "/dashboard" || pathname.startsWith("/dashboard/creator")) {
        router.replace("/dashboard/businesses");
      }
    } else if (role !== "ADMIN" && (pathname === "/admin" || pathname === "/dashboard/model-insights")) {
      router.replace(role === "CREATOR" ? "/dashboard/creator" : "/dashboard/businesses");
    }
  }, [user, role, isLoading, pathname, router]);

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
