"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiClientError } from "@/lib/api-client";
import FormAlert from "@/components/ui/FormAlert";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)/;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasLetterAndNumber = PASSWORD_REGEX.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Full name must be between 2 and 100 characters.");
      return;
    }
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Please provide a valid email address.");
      return;
    }
    if (!hasMinLength) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!hasLetterAndNumber) {
      setError("Password must contain at least one letter and one number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(trimmedName, normalizedEmail, password);
      router.push("/explore");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Unable to create account right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-[#F4FAF8] via-[#F8FAFC] to-[#DCEEF6] py-10 sm:py-14">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md sm:p-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/15 bg-[#F2FBF8] px-3 py-1 text-xs font-semibold text-[#0A5C4A]">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Join the AccessPath Community</span>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            New accounts start as Regular Members so you can save favorite
            places, submit accessibility feedback, and report barriers.
          </p>

          {error && (
            <FormAlert variant="error" message={error} className="mt-5" />
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label
                htmlFor="register-name"
                className="block text-sm font-semibold text-slate-800"
              >
                Full Name
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A3B3F] focus:bg-white focus:ring-2 focus:ring-[#0A3B3F]/15 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-semibold text-slate-800"
              >
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-email"
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
                htmlFor="register-password"
                className="block text-sm font-semibold text-slate-800"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <span
                  className={`inline-flex items-center gap-1 ${
                    hasMinLength ? "text-emerald-700 font-semibold" : "text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  8+ characters
                </span>
                <span
                  className={`inline-flex items-center gap-1 ${
                    hasLetterAndNumber
                      ? "text-emerald-700 font-semibold"
                      : "text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Letter &amp; number
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-sm font-semibold text-slate-800"
              >
                Confirm Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="register-confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/60 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A3B3F] focus:bg-white focus:ring-2 focus:ring-[#0A3B3F]/15 focus:outline-none"
                />
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#0A5C4A] underline-offset-4 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
