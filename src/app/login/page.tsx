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
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Clock,
} from "lucide-react";

type AccountType = "creator" | "business";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, resendVerification } = useAuth();

  const typeParam = searchParams.get("type");
  const isCreatorInitial = typeParam === "creator";
  const [accountType, setAccountType] = useState<AccountType>(
    isCreatorInitial ? "creator" : "business"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get("error") || null
  );
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);

  // Unverified state handling
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSelectAccountType = (type: AccountType) => {
    setAccountType(type);
    setErrorMessage(null);
    setForgotNotice(null);
    setIsUnverified(false);
  };

  const handleGoogleClick = () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setIsUnverified(false);
    window.location.href = `/api/auth/google?type=${accountType}&action=login`;
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotNotice(
      "Password reset instructions will be sent to " +
        (email.trim() ? email.trim() : "your registered email") +
        " if an active account exists."
    );
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setForgotNotice(null);
    setIsUnverified(false);
    setResendStatus(null);

    const res = await login(email, password, accountType);
    setIsLoading(false);

    if (res.emailUnverified) {
      setIsUnverified(true);
      setUnverifiedEmail(res.email || email.trim());
      setErrorMessage(res.error || "Please verify your email address before signing in.");
    } else if (res.success && res.session) {
      console.log(`[AUTH DEBUG] login success | email: ${res.session.email} | role: ${res.session.role} | onboardingCompleted: ${res.session.onboardingCompleted}`);
      const isComplete = res.session.onboardingCompleted === true;
      if (res.session.role === "CREATOR") {
        const dest = isComplete ? "/dashboard/creator" : "/onboarding/creator";
        console.log(`[ROUTING DEBUG] redirect destination: ${dest}`);
        router.push(dest);
      } else if (res.session.role === "BUSINESS" || res.session.role === "AGENCY") {
        const dest = isComplete ? "/dashboard/businesses" : "/onboarding/business";
        console.log(`[ROUTING DEBUG] redirect destination: ${dest}`);
        router.push(dest);
      } else if (res.session.role === "ADMIN") {
        console.log("[ROUTING DEBUG] redirect destination: /admin");
        router.push("/admin");
      } else {
        const dest = isComplete ? "/dashboard/businesses" : "/onboarding/business";
        console.log(`[ROUTING DEBUG] redirect destination: ${dest}`);
        router.push(dest);
      }
    } else {
      setErrorMessage(res.error || "Invalid login credentials. Please try again.");
    }
  };

  const handleResend = async () => {
    const targetEmail = unverifiedEmail || email.trim();
    if (resendCooldown > 0 || isResending || !targetEmail) return;

    setIsResending(true);
    setResendStatus(null);

    const res = await resendVerification(targetEmail);
    setIsResending(false);

    if (res.success) {
      setResendStatus(res.message || "A new verification email has been sent.");
      setResendCooldown(60);
    } else {
      setErrorMessage(res.error || "Failed to resend verification email.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: TrustScore Brand Value Proposition (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 pr-4">
          <div className="space-y-6">
            <Logo size="lg" href="/" showTagline={false} variant="light" showBadge={false} />

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise Authenticity Intelligence</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Authentic creator partnerships powered by data.
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access your TrustScore workspace to audit creator authenticity, track verified Graph API metrics, and manage secure collaborations.
              </p>
            </div>

            {/* Feature Telemetry Highlights */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Probabilistic TrustScore Engine</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Multivariate anomaly detection identifying engagement pods and bought followers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Verified Platform Connections</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Direct read-only API telemetry from Instagram, TikTok, and YouTube.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span>© 2026 TrustScore SaaS</span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              API Services Operational
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: SaaS Authentication Card */}
        <div className="lg:col-span-7 w-full max-w-lg mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Mobile Header Logo */}
            <div className="lg:hidden text-center space-y-2 pb-2">
              <Logo size="md" href="/" showTagline={false} variant="light" showBadge={false} className="justify-center" />
            </div>

            {/* Header Title */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Sign in to continue to your TrustScore workspace.
              </p>
            </div>

            {/* Account Type Segmented Control */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Continue As
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleSelectAccountType("creator")}
                  className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    accountType === "creator"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span>Creator</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAccountType("business")}
                  className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    accountType === "business"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>Business</span>
                </button>
              </div>

              {/* Contextual helper text */}
              <p className="text-[11px] text-slate-500 px-1">
                {accountType === "creator"
                  ? "Manage your profile, authenticity score, and brand partnerships."
                  : "Discover creators, evaluate authenticity, and manage campaigns."}
              </p>
            </div>

            {/* Google Authentication Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <span className="w-4 h-4 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                )}
                <span>Continue with Google</span>
              </button>

              {/* Forgot Password Feedback Notice */}
              {forgotNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span className="leading-relaxed">{forgotNotice}</span>
                </div>
              )}

              {/* Resend Success Notice */}
              {resendStatus && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span className="leading-relaxed">{resendStatus}</span>
                </div>
              )}

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-100" />
                <span className="absolute px-3 bg-white text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Unverified Email Warning Box */}
            {isUnverified ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2.5 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <h4 className="font-bold text-amber-900">Email not verified</h4>
                    <p className="text-amber-700 text-[11px] mt-0.5 leading-relaxed">
                      Please verify your email address before signing in. Check your inbox for the activation link.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isResending}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-800 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Resend in {resendCooldown}s</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend Verification Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Error Message Display */
              errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  {accountType === "creator" ? "Creator Email Address" : "Work Email Address"}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      accountType === "creator"
                        ? "alex@gmail.com"
                        : "name@company.com"
                    }
                    className="w-full py-3 px-4 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all shadow-xs"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full py-3 px-4 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all shadow-xs"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Remember this workstation</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Sign in to {accountType === "creator" ? "Creator Hub" : "Business Workspace"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Sign Up Navigation Link */}
            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
              Don&apos;t have a TrustScore account?{" "}
              <Link
                href={`/signup?type=${accountType}`}
                className="font-bold text-blue-600 hover:underline transition-colors"
              >
                Create an account
              </Link>
            </div>

            {/* Legal & Terms */}
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              By continuing, you agree to TrustScore&apos;s{" "}
              <Link href="/terms" className="text-slate-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-slate-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center text-xs text-slate-400">
          Loading sign in...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

