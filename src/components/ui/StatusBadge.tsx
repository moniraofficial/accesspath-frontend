import React from "react";
import { CheckCircle2, Clock, XCircle, ShieldCheck, EyeOff } from "lucide-react";

type AnyStatus =
  | "verified"
  | "pending"
  | "rejected"
  | "resolved"
  | "active"
  | "hidden";

const STATUS_STYLES: Record<
  AnyStatus,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  verified: {
    label: "Verified",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
  },
  pending: {
    label: "Pending Review",
    classes: "border-amber-200 bg-amber-50 text-amber-800",
    icon: <Clock className="h-3.5 w-3.5 text-amber-600" />,
  },
  rejected: {
    label: "Rejected",
    classes: "border-rose-200 bg-rose-50 text-rose-800",
    icon: <XCircle className="h-3.5 w-3.5 text-rose-600" />,
  },
  resolved: {
    label: "Resolved",
    classes: "border-teal-200 bg-teal-50 text-teal-800",
    icon: <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />,
  },
  active: {
    label: "Active",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
  },
  hidden: {
    label: "Hidden",
    classes: "border-slate-200 bg-slate-100 text-slate-700",
    icon: <EyeOff className="h-3.5 w-3.5 text-slate-500" />,
  },
};

export default function StatusBadge({
  status,
  className = "",
}: {
  status: AnyStatus;
  className?: string;
}) {
  const config = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.classes} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
