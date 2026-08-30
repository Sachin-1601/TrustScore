"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  isLoading: boolean;
  login: (email: string, passwordPlain: string) => Promise<{ success: boolean; error?: string; session?: UserSession }>;
  signup: (data: SignupParams) => Promise<{ success: boolean; error?: string; session?: UserSession }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setUser(data.session);
        } else {
          setUser(null);
        }
      }
    } catch {
      // Offline or network failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const role: UserRole = user?.role || "BUSINESS";

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

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network error on logout
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshSession,
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
