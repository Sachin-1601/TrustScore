"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  Building2,
  UserCheck,
  AtSign,
  Layers,
  Sparkles,
  AlertCircle,
} from "lucide-react";

type AccountType = "creator" | "business";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();

  const typeParam = searchParams.get("type");
  const isCreatorInitial = typeParam === "creator";
  const [accountType, setAccountType] = useState<AccountType>(
    isCreatorInitial ? "creator" : "business"
  );

  // Form fields
  const [name, setName] = useState(isCreatorInitial ? "Alex Rivera" : "Sarah Jenkins");
  const [handleOrCompany, setHandleOrCompany] = useState(isCreatorInitial ? "@alexfitness" : "Acme Brand Co");
  const [category, setCategory] = useState("Fitness");
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "youtube">("instagram");
  const [email, setEmail] = useState(isCreatorInitial ? "alex@fitness.example.com" : "sarah@acmebrand.com");
  const [password, setPassword] = useState("password123!");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectAccountType = (type: AccountType) => {
    setAccountType(type);
    setErrorMessage(null);
    if (type === "creator") {
      setName("Alex Rivera");
      setHandleOrCompany("@alexfitness");
      setEmail("alex@fitness.example.com");
    } else {
      setName("Sarah Jenkins");
      setHandleOrCompany("Acme Brand Co");
      setEmail("sarah@acmebrand.com");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await signup({
      name,
      email,
      passwordPlain: password,
      role: accountType === "creator" ? "CREATOR" : "BUSINESS",
      handleOrCompany,
      category,
      platform,
    });

    setIsLoading(false);

    if (res.success && res.session) {
      if (res.session.role === "CREATOR") {
        router.push("/dashboard/creator");
      } else {
        router.push("/dashboard");
      }
    } else {
      setErrorMessage(res.error || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-radial-gradient">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo size="lg" href="/" showTagline={false} className="justify-center" />
        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your TrustScore account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={`/login?type=${accountType}`}
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200 space-y-6">
          {/* Explicit Account Type Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectAccountType("creator")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  accountType === "creator"
                    ? "bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/20 text-blue-900 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className={`w-4 h-4 ${accountType === "creator" ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="font-bold text-xs">Creator / Influencer</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">
                  Verify authenticity, showcase TrustScore &amp; get brand deals
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccountType("business")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  accountType === "business"
                    ? "bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/20 text-blue-900 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className={`w-4 h-4 ${accountType === "business" ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="font-bold text-xs">Business</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">
                  Audit creators, prevent fake follower fraud &amp; run campaigns
                </span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {accountType === "creator" ? "Your Name / Stage Name" : "Contact Full Name"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {accountType === "creator" ? "Creator Social Handle" : "Company / Brand Name"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={handleOrCompany}
                    onChange={(e) => setHandleOrCompany(e.target.value)}
                    placeholder={accountType === "creator" ? "@username" : "Acme Corp"}
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                    required
                  />
                  {accountType === "creator" ? (
                    <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  ) : (
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Primary Niche / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium bg-white"
                >
                  <option value="Fitness">Fitness &amp; Health</option>
                  <option value="Beauty">Beauty &amp; Skincare</option>
                  <option value="Fashion">Fashion &amp; Style</option>
                  <option value="Technology">Technology &amp; Gadgets</option>
                  <option value="Food">Food &amp; Cooking</option>
                  <option value="Travel">Travel &amp; Hospitality</option>
                  <option value="Gaming">Gaming &amp; Esports</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>

              {accountType === "creator" ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Primary Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium bg-white"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {accountType === "creator" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              By creating an account, you agree to TrustScore&apos;s Terms of Service and Privacy Policy.
            </p>

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
                    Create {accountType === "creator" ? "Creator Account" : "Business Account"}
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

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Loading registration...</div>}>
      <SignupContent />
    </Suspense>
  );
}
