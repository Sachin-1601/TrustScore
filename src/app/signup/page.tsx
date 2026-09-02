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
  AtSign,
  Send,
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

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, resendVerification } = useAuth();

  const typeParam = searchParams.get("type");
  const isCreatorInitial = typeParam === "creator";
  const [accountType, setAccountType] = useState<AccountType>(
    isCreatorInitial ? "creator" : "business"
  );

  // Form fields
  const [name, setName] = useState("");
  const [handleOrCompany, setHandleOrCompany] = useState("");
  const [category, setCategory] = useState("Fitness");
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "youtube">("instagram");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get("error") || null
  );

  // Verification Pending Screen State
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
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
  };

  const handleGoogleClick = () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    window.location.href = `/api/auth/google?type=${accountType}&action=signup`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (accountType === "creator" && !cleanEmail.endsWith("@gmail.com")) {
      setErrorMessage("Creator accounts require a Gmail address ending in @gmail.com.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your password.");
      return;
    }

    setIsLoading(true);

    const res = await signup({
      name: name.trim(),
      email: cleanEmail,
      passwordPlain: password,
      role: accountType === "creator" ? "CREATOR" : "BUSINESS",
      handleOrCompany: handleOrCompany.trim(),
      category,
      platform,
    });

    setIsLoading(false);

    if (res.success && res.requiresVerification) {
      setPendingEmail(res.email || cleanEmail);
      setIsPendingVerification(true);
      setResendCooldown(60);
    } else if (res.success && res.session) {
      // Fallback for non-verification flows if applicable
      router.push(res.session.role === "CREATOR" ? "/dashboard/creator" : "/dashboard");
    } else {
      setErrorMessage(res.error || "Signup failed. Please check your information and try again.");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending || !pendingEmail) return;
    setIsResending(true);
    setResendStatus(null);
    setResendError(null);

    const res = await resendVerification(pendingEmail);
    setIsResending(false);

    if (res.success) {
      setResendStatus(res.message || "A new verification link has been sent to your email.");
      setResendCooldown(60);
    } else {
      setResendError(res.error || "Failed to resend email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/25 via-[#090d16] to-[#090d16]">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: TrustScore Credibility & Features (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 pr-4">
          <div className="space-y-6">
            <Logo size="lg" href="/" showTagline={false} variant="light" showBadge={false} />

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join the Trusted Marketplace</span>
              </div>
              <h1 className="text-3xl font-black text-slate-100 tracking-tight leading-tight">
                Build partnerships on verified data.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Whether you&apos;re an authentic creator demonstrating engagement quality or a brand scaling high-ROI campaigns, TrustScore provides the verified infrastructure.
              </p>
            </div>

            {/* Credibility Checklist */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Verified Authenticity Badge</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Stand out with cryptographic proof of authentic audience engagement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Escrow Protected Sponsorships</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Milestone-based campaign delivery guaranteeing fair and timely compensation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-500">
            <span>© 2026 TrustScore SaaS</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Secure 256-bit TLS Encryption
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign Up Form OR Check Your Email Card */}
        <div className="lg:col-span-7 w-full max-w-lg mx-auto">
          {isPendingVerification ? (
            /* ============================================================ */
            /* CHECK YOUR EMAIL / PENDING VERIFICATION SCREEN               */
            /* ============================================================ */
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Mail className="w-8 h-8 text-blue-400 animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                  <Send className="w-3 h-3" />
                  <span>Activation Email Sent</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                  Check your email
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                  We&apos;ve sent a secure verification link to:
                </p>
                <div className="py-2 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 font-bold text-sm tracking-wide inline-block max-w-full truncate">
                  {pendingEmail}
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Click the link in your email to activate your TrustScore account. The verification link expires in <strong>30 minutes</strong>.
              </p>

              {/* Resend Feedback Alerts */}
              {resendStatus && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 text-left">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span className="leading-relaxed">{resendStatus}</span>
                </div>
              )}

              {resendError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span className="leading-relaxed">{resendError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Sending verification link...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Resend available in {resendCooldown}s</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/login?type=${accountType}`}
                  className="block w-full py-3 px-4 bg-transparent hover:bg-slate-850 text-slate-400 hover:text-slate-200 font-semibold text-xs rounded-2xl transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                Didn&apos;t receive it? Check your spam folder or ensure your email address was entered correctly.
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* STANDARD REGISTRATION FORM                                   */
            /* ============================================================ */
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Mobile Header Logo */}
              <div className="lg:hidden text-center space-y-2 pb-2">
                <Logo size="md" href="/" showTagline={false} variant="light" showBadge={false} className="justify-center" />
              </div>

              {/* Header Title */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
                  Create your account
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Join the trusted creator and business intelligence marketplace.
                </p>
              </div>

              {/* Account Type Segmented Control */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleSelectAccountType("creator")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      accountType === "creator"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    <User className="w-4 h-4 shrink-0" />
                    <span>Creator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectAccountType("business")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      accountType === "business"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>Business</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 px-1">
                  {accountType === "creator"
                    ? "For creators, influencers, and talent looking to verify metrics and receive brand sponsorships."
                    : "For brands, direct-to-consumer businesses, and marketing agencies seeking authentic partnerships."}
                </p>
              </div>

              {/* Google Registration Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={isGoogleLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <span className="w-4 h-4 border-2 border-slate-400 border-t-blue-500 rounded-full animate-spin" />
                  ) : (
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-slate-800" />
                  <span className="absolute px-3 bg-slate-900 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    or register with email
                  </span>
                </div>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Row 1: Name & Handle/Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                      {accountType === "creator" ? "Your Full Name" : "Contact Full Name"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={accountType === "creator" ? "e.g. Alex Rivera" : "e.g. Sarah Jenkins"}
                        className="w-full py-2.5 px-3.5 pl-9 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        required
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                      {accountType === "creator" ? "Social Handle" : "Company / Brand Name"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={handleOrCompany}
                        onChange={(e) => setHandleOrCompany(e.target.value)}
                        placeholder={accountType === "creator" ? "@username" : "Acme Nutrition Co"}
                        className="w-full py-2.5 px-3.5 pl-9 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        required
                      />
                      {accountType === "creator" ? (
                        <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      ) : (
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Category & Platform/Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                      {accountType === "creator" ? "Primary Niche" : "Industry Category"}
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="Fitness">Fitness &amp; Health</option>
                        <option value="Beauty">Beauty &amp; Skincare</option>
                        <option value="Fashion">Fashion &amp; Style</option>
                        <option value="Technology">Technology &amp; Gadgets</option>
                        <option value="Food">Food &amp; Cooking</option>
                        <option value="Travel">Travel &amp; Hospitality</option>
                        <option value="Gaming">Gaming &amp; Esports</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Brand">General Brand</option>
                      </select>
                    </div>
                  </div>

                  {accountType === "creator" ? (
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                        Primary Platform
                      </label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as any)}
                        className="w-full py-2.5 px-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-500 transition-all cursor-pointer"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                        Work Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full py-2.5 px-3.5 pl-9 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          required
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Creator Email Address (if Creator selected) */}
                {accountType === "creator" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                        Creator Email Address
                      </label>
                      <span className="text-[11px] text-blue-400 font-medium">
                        Creator accounts require a Gmail address.
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@gmail.com"
                        className="w-full py-2.5 px-3.5 pl-9 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        required
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Row 3: Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                      Password (Min 8 chars)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full py-2.5 px-3.5 pl-9 pr-9 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        required
                        minLength={8}
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
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

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full py-2.5 px-3.5 pl-9 pr-9 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-semibold focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        required
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Match Indicator */}
                {password && confirmPassword && (
                  <div className="text-[11px] flex items-center gap-1.5">
                    {password === confirmPassword ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Passwords do not match yet
                      </span>
                    )}
                  </div>
                )}

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
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

              {/* Bottom Sign In Navigation Link */}
              <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/80">
                Already have a TrustScore account?{" "}
                <Link
                  href={`/login?type=${accountType}`}
                  className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign in
                </Link>
              </div>

              {/* Legal Terms & Conditions */}
              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                By creating an account, you agree to TrustScore&apos;s{" "}
                <Link href="/terms" className="text-slate-400 hover:text-slate-200 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-slate-400 hover:text-slate-200 underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-xs text-slate-400">
          Loading registration...
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
