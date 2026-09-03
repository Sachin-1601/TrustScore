"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Search,
  Users,
  Cpu,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bookmark,
  Send,
  Briefcase,
  Megaphone,
  CreditCard,
  MessageSquare,
  UserCheck,
  Lock,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  highlight?: boolean;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Dedicated Creator Navigation
  const creatorSections: NavSection[] = [
    {
      items: [
        { label: "Overview", href: "/dashboard/creator", icon: LayoutDashboard },
        { label: "Profile & Tags", href: "/dashboard/creator/profile", icon: UserCheck },
        { label: "TrustScore & Analytics", href: "/dashboard/creator/analytics", icon: Sparkles },
        { label: "Verification", href: "/dashboard/creator/verification", icon: ShieldCheck },
        { label: "Collaborations", href: "/dashboard/collaborations", icon: Send },
        { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  // Dedicated Business / Brand / Marketing Navigation
  const businessSections: NavSection[] = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Overview", href: "/dashboard/businesses", icon: LayoutDashboard },
      ],
    },
    {
      title: "CREATOR INTELLIGENCE",
      items: [
        { label: "Discover Creators", href: "/creators", icon: Users },
        { label: "Analyze Creator", href: "/dashboard/analyze", icon: Search },
        { label: "Saved Creators", href: "/dashboard/saved", icon: Bookmark },
      ],
    },
    {
      title: "PARTNERSHIPS",
      items: [
        { label: "Campaigns", href: "/dashboard/campaigns", icon: Briefcase },
        { label: "Collaborations", href: "/dashboard/collaborations", icon: Send },
        { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
      ],
    },
    {
      title: "BUSINESS",
      items: [
        { label: "Advertising", href: "/dashboard/advertise", icon: Megaphone },
        { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  if (role === "ADMIN") {
    businessSections.push({
      title: "ADMINISTRATION",
      items: [
        { label: "Model Insights", href: "/dashboard/model-insights", icon: Cpu },
        { label: "Admin Console", href: "/admin", icon: Lock },
      ],
    });
  }

  const sections = role === "CREATOR" ? creatorSections : businessSections;

  return (
    <aside
      className={`relative bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 text-slate-700 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Logo Bar */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          {!isCollapsed ? (
            <Logo
              size="md"
              href={role === "CREATOR" ? "/dashboard/creator" : "/dashboard/businesses"}
              variant="dark"
            />
          ) : (
            <div className="mx-auto">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                T
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="px-3 py-3 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && !isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard/businesses" &&
                    item.href !== "/dashboard/creator" &&
                    item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600 shadow-xs"
                        : item.highlight
                        ? "text-amber-600 hover:bg-amber-50/60 hover:text-amber-700 font-medium"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? "text-blue-600"
                          : item.highlight
                          ? "text-amber-500"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section: User Profile & Logout */}
      <div className="p-3 border-t border-slate-100 shrink-0 bg-white">
        <div className={`flex items-center gap-3 px-2 ${isCollapsed ? "justify-center" : ""}`}>
          <img
            src={
              user?.avatar ||
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
            }
            alt={user?.name || "Business User"}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name || "Business Workspace"}
              </p>
              <p className="text-[11px] text-slate-500 truncate capitalize">
                {role === "CREATOR" ? "Creator Account" : role === "ADMIN" ? "Admin Account" : "Business Account"}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
