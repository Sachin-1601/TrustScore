"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSession, UserRole } from "@/types/schema";

interface SignupParams {
  email: string;
  passwordPlain: string;
  name: string;
  role: UserRole;
  handleOrCompany?: string;
  category?: string;
  platform?: "instagram" | "tiktok" | "youtube";
}

interface AuthContextType {
  user: UserSession | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, passwordPlain: string) => Promise<{ success: boolean; error?: string; session?: UserSession }>;
  signup: (data: SignupParams) => Promise<{ success: boolean; error?: string; session?: UserSession }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ts_session");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore JSON parse error
      }
    }
    return {
      id: "user-sarah-business",
      email: "sarah@acmebrand.com",
      name: "Sarah Jenkins",
      role: "BUSINESS",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      businessProfileId: "gymfuel",
    };
  });

  const role: UserRole = user?.role || "BUSINESS";

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("ts_session", JSON.stringify(user));
      } else {
        localStorage.removeItem("ts_session");
      }
    }
  }, [user]);

  const login = async (email: string, passwordPlain: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordPlain }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { success: false, error: data.error || "Login failed" };
      }
      setUser(data.session);
      return { success: true, session: data.session };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const signup = async (data: SignupParams) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.passwordPlain,
          name: data.name,
          role: data.role,
          handleOrCompany: data.handleOrCompany,
          category: data.category,
          platform: data.platform,
        }),
      });
      const resData = await res.json();
      if (!res.ok || resData.error) {
        return { success: false, error: resData.error || "Signup failed" };
      }
      setUser(resData.session);
      return { success: true, session: resData.session };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ts_session");
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated: UserSession = {
      ...user,
      role: newRole,
      name:
        newRole === "CREATOR"
          ? "Alex Rivera"
          : newRole === "ADMIN"
          ? "TrustScore Admin"
          : newRole === "AGENCY"
          ? "David Kim"
          : "Sarah Jenkins",
      creatorProfileId: newRole === "CREATOR" ? "alexfitness" : undefined,
      businessProfileId: newRole === "BUSINESS" || newRole === "AGENCY" ? "gymfuel" : undefined,
    };
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
