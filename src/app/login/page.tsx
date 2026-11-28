"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiClientError } from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";
import { UserRole, type UserRoleType } from "@/types/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEMO_ACCOUNTS: Array<{
  role: UserRoleType;
  label: string;
  email: string;
  password: string;
  summary: string;
}> = [
  {
    role: UserRole.REGULAR,
    label: "Regular User",
    email: "user@accesspath.demo",
    password: "DemoPass123!",
    summary: "Search places, save favorites, submit feedback & report barriers",
  },
  {
    role: UserRole.CONTRIBUTOR,
    label: "Contributor",
    email: "contributor@accesspath.demo",
    password: "DemoPass123!",
    summary: "Submit new accessible locations & report barriers",
  },
  {
    role: UserRole.MODERATOR,
    label: "Moderator",
    email: "moderator@accesspath.demo",
    password: "DemoPass123!",
    summary: "Verify locations & barriers, moderate community feedback",
  },
  {
    role: UserRole.ADMIN,
    label: "Admin",
    email: "admin@accesspath.demo",
    password: "DemoPass123!",
    summary: "Manage users, verify submissions & view platform analytics",
  },
];

function getDefaultRedirectForRole(role: UserRoleType): string {
  switch (role) {
    case UserRole.ADMIN:
      return "/admin";
    case UserRole.MODERATOR:
      return "/moderation";
    case UserRole.CONTRIBUTOR:
      return "/submit-location";
    default:
      return "/explore";
  }
}

function getSafeRedirect(rawRedirect: string | null): string | null {
  if (!rawRedirect) return null;
  if (!rawRedirect.startsWith("/") || rawRedirect.startsWith("//")) {
    return null;
  }
  return rawRedirect;
}

function LoginFormContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);
    try {
      const signedInUser = await login(normalizedEmail, password);
      const safeTarget =
        getSafeRedirect(searchParams.get("redirect")) ??
        getDefaultRedirectForRole(signedInUser.role);
      router.push(safeTarget);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Unable to sign in right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <main className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-[#F4FAF8] via-[#F8FAFC] to-[#DCEEF6] py-10 sm:py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left: Login Form Card */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md sm:p-9">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/15 bg-[#F2FBF8] px-3 py-1 text-xs font-semibold text-[#0A5C4A]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Secure AccessPath Sign In</span>
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
              Welcome back to AccessPath
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Sign in to explore barrier-free routes, save favorite places, or
              contribute verified accessibility data.
            </p>

            {error && (
              <FormAlert
                variant="error"
                message={error}
                className="mt-5"
              />
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A3B3F] focus:bg-white focus:ring-2 focus:ring-[#0A3B3F]/15 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2.5 pr-11 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A3B3F] focus:bg-white focus:ring-2 focus:ring-[#0A3B3F]/15 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0A3B3F] px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#072B2E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#0A5C4A] underline-offset-4 hover:underline"
              >
                Create a free account
              </Link>
            </p>
          </div>
        </div>

        {/* Right: Demo Credentials for All 4 Seeded Roles */}
        <aside className="lg:col-span-5">
          <div className="rounded-3xl border border-slate-200/90 bg-[#0E2238] p-6 text-white shadow-md sm:p-7">
            <div className="flex items-center gap-2 text-teal-300">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold tracking-wider uppercase">
                Seeded Demo Accounts
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-white">
              Quick-Fill Role Credentials
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Select any seeded role below to populate the sign-in form and test
              role-based access control.
            </p>

            <div className="mt-5 space-y-3">
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.role}
                  type="button"
                  onClick={() => handleDemoFill(acct.email, acct.password)}
                  className="w-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-3.5 text-left transition-colors hover:border-teal-400/50 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">
                      {acct.label}
                    </span>
                    <span className="rounded-full bg-teal-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-teal-200">
                      Use credentials
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-teal-100/90">{acct.email}</p>
                  <p className="mt-1 text-[11px] text-slate-300">
                    {acct.summary}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC]">
          <Loader2 className="h-6 w-6 animate-spin text-[#0A3B3F]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
