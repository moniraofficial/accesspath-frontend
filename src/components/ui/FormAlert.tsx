import React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface FormAlertProps {
  variant?: "error" | "success" | "info";
  title?: string;
  message: string;
  className?: string;
}

const VARIANT_STYLES = {
  error: {
    container: "border-rose-200 bg-rose-50 text-rose-900",
    icon: <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />,
  },
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />,
  },
  info: {
    container: "border-sky-200 bg-sky-50 text-sky-900",
    icon: <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />,
  },
} as const;

export default function FormAlert({
  variant = "error",
  title,
  message,
  className = "",
}: FormAlertProps) {
  const style = VARIANT_STYLES[variant];
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${style.container} ${className}`}
    >
      {style.icon}
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p className="leading-snug">{message}</p>
      </div>
    </div>
  );
}
