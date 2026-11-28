import React from "react";

export default function AccessibilityScoreBadge({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const colorClasses =
    clamped >= 80
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : clamped >= 50
        ? "border-teal-200 bg-teal-50 text-teal-800"
        : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold ${colorClasses} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs sm:text-sm"
      }`}
    >
      <span>Score:</span>
      <span>{clamped}%</span>
    </span>
  );
}
