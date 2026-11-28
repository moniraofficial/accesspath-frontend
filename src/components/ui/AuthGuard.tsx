"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { PermissionType, UserRoleType } from "@/types/api";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRoleType[];
  requiredPermissions?: PermissionType[];
}

export default function AuthGuard({
  children,
  allowedRoles,
  requiredPermissions,
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F8FAFC] px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-xs">
          <Loader2 className="h-5 w-5 animate-spin text-[#0A3B3F]" />
          <span className="text-sm font-semibold text-slate-700">
            Verifying your session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const roleAllowed =
    !allowedRoles || allowedRoles.length === 0 || hasRole(...allowedRoles);
  const permsAllowed =
    !requiredPermissions ||
    requiredPermissions.length === 0 ||
    requiredPermissions.every((p) => hasPermission(p));

  if (!roleAllowed || !permsAllowed) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center bg-[#F8FAFC] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-[#0F172A]">
            Access Restricted
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your current account role (<span className="font-semibold">{user.role}</span>) does not have permission to view this page.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-[#0A3B3F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#072B2E]"
            >
              Return Home
            </Link>
            <Link
              href="/explore"
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Explore Places
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
