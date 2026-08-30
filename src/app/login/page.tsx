"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Lock, Mail, UserCheck, Building2, Sparkles, AlertCircle } from "lucide-react";

type AccountType = "creator" | "business";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const typeParam = searchParams.get("type");
  const isCreatorInitial = typeParam === "creator";
  const [accountType, setAccountType] = useState<AccountType>(
    isCreatorInitial ? "creator" : "business"
  );
  const [email, setEmail] = useState(
    isCreatorInitial ? "alex@fitness.example.com" : "sarah@acmebrand.com"
  );
  const [password, setPassword] = useState("password123!");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectAccountType = (type: AccountType) => {
    setAccountType(type);
    setErrorMessage(null);
    if (type === "creator") {
      setEmail("alex@fitness.example.com");
    } else {
      setEmail("sarah@acmebrand.com");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await login(email, password, accountType);
    setIsLoading(false);

    if (res.success && res.session) {
      if (res.session.role === "CREATOR") {
        router.push("/dashboard/creator");
      } else if (res.session.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      setErrorMessage(res.error || "Invalid login credentials. Please try again.");
    }
  };

  const handleQuickDemo = (roleChoice: "business" | "creator" | "admin") => {
    if (roleChoice === "creator") {
      setAccountType("creator");
      setEmail("alex@fitness.example.com");
    } else if (roleChoice === "admin") {
      setAccountType("business");
      setEmail("admin@trustscore.io");
    } else {
      setAccountType("business");
      setEmail("sarah@acmebrand.com");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-radial-gradient">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo size="lg" href="/" showTagline={false} className="justify-center" />
        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Or{" "}
          <Link
            href={`/signup?type=${accountType}`}
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            create a new {accountType === "creator" ? "creator" : "business"} account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200 space-y-6">
          {/* Explicit Account Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Choose how you want to sign in:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectAccountType("creator")}
                className={`py-3 px-4 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 font-bold text-xs sm:text-sm ${
                  accountType === "creator"
                    ? "bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/20 text-blue-900 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <UserCheck className={`w-4 h-4 shrink-0 ${accountType === "creator" ? "text-blue-600" : "text-slate-400"}`} />
                <span>Creator</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccountType("business")}
                className={`py-3 px-4 rounded-2xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 font-bold text-xs sm:text-sm ${
                  accountType === "business"
                    ? "bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/20 text-blue-900 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Building2 className={`w-4 h-4 shrink-0 ${accountType === "business" ? "text-blue-600" : "text-slate-400"}`} />
                <span>Business</span>
              </button>
            </div>
          </div>

          {/* Quick 1-Click Demo Fill */}
          <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-500">Demo Fill:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickDemo("creator")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  accountType === "creator"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Creator (@alexfitness)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("business")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  accountType === "business" && email.includes("acme")
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Brand (Sarah)
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {accountType === "creator" ? "Creator Email or Login" : "Work Email Address"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={accountType === "creator" ? "alex@fitness.example.com" : "sarah@acmebrand.com"}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <a href="#" className="text-xs text-blue-600 hover:text-blue-500 font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Remember this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    Sign in to {accountType === "creator" ? "Creator Hub" : "Business Dashboard"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
