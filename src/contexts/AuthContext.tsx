"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSession, UserRole } from "@/types/schema";

interface AuthContextType {
  user: UserSession | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, passwordPlain: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; name: string; role: UserRole }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>({
    id: "user-sarah-business",
    email: "sarah@acmebrand.com",
    name: "Sarah Jenkins",
    role: "BUSINESS",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    businessProfileId: "gymfuel",
  });

  const role = user?.role || "BUSINESS";

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
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const signup = async (data: { email: string; password: string; name: string; role: UserRole }) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok || resData.error) {
        return { success: false, error: resData.error || "Signup failed" };
      }
      setUser(resData.session);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    setUser({
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
      businessProfileId: newRole === "BUSINESS" ? "gymfuel" : undefined,
    });
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
