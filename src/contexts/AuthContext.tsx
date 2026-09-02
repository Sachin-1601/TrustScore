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

export interface LoginResponse {
  success: boolean;
  error?: string;
  session?: UserSession;
  emailUnverified?: boolean;
  email?: string;
}

export interface SignupResponse {
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
  accountCreated?: boolean;
  emailSent?: boolean;
  email?: string;
  message?: string;
  session?: UserSession;
}

export interface ResendResponse {
  success: boolean;
  message?: string;
  error?: string;
  emailSent?: boolean;
  rateLimited?: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, passwordPlain: string, accountType?: "creator" | "business") => Promise<LoginResponse>;
  signup: (data: SignupParams) => Promise<SignupResponse>;
  resendVerification: (email: string) => Promise<ResendResponse>;
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

  const role: UserRole | null = user?.role ?? null;

  const login = async (
    email: string,
    passwordPlain: string,
    accountType?: "creator" | "business"
  ): Promise<LoginResponse> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordPlain, accountType }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return {
          success: false,
          error: data.error || "Login failed",
          emailUnverified: data.emailUnverified,
          email: data.email,
        };
      }
      setUser(data.session);
      return { success: true, session: data.session };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const signup = async (data: SignupParams): Promise<SignupResponse> => {
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
      return {
        success: true,
        accountCreated: resData.accountCreated ?? true,
        requiresVerification: resData.requiresVerification ?? true,
        emailSent: resData.emailSent ?? false,
        email: resData.email,
        message: resData.message,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const resendVerification = async (email: string): Promise<ResendResponse> => {
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || "Failed to resend verification email",
          emailSent: false,
          rateLimited: data.rateLimited,
        };
      }
      return {
        success: true,
        emailSent: data.emailSent ?? true,
        message: data.message,
      };
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
        resendVerification,
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
