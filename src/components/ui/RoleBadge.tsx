import React from "react";
import type { UserRoleType } from "@/types/api";

const ROLE_CONFIG: Record<
  UserRoleType,
  { label: string; classes: string }
> = {
  admin: {
    label: "Admin",
    classes: "border-slate-300 bg-[#0E2238] text-white",
  },
  moderator: {
    label: "Moderator",
    classes: "border-teal-200 bg-[#0A3B3F] text-white",
  },
  contributor: {
    label: "Contributor",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  regular: {
    label: "Member",
    classes: "border-slate-200 bg-slate-100 text-slate-700",
  },
};

export default function RoleBadge({
  role,
  className = "",
}: {
  role: UserRoleType;
  className?: string;
}) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.regular;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}
