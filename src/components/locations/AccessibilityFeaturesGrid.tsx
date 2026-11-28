import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { IAccessibilityFeatures } from "@/types/api";

export const ACCESSIBILITY_FEATURE_LABELS: ReadonlyArray<{
  key: keyof IAccessibilityFeatures;
  label: string;
  shortLabel: string;
}> = [
  {
    key: "wheelchairAccess",
    label: "Wheelchair Access",
    shortLabel: "Wheelchair",
  },
  {
    key: "stairFreeEntry",
    label: "Stair-Free Entry",
    shortLabel: "Stair-Free",
  },
  {
    key: "rampAvailability",
    label: "Ramp Availability",
    shortLabel: "Ramp",
  },
  {
    key: "elevatorAvailability",
    label: "Elevator Availability",
    shortLabel: "Elevator",
  },
  {
    key: "accessibleRestroom",
    label: "Accessible Restroom",
    shortLabel: "Restroom",
  },
  {
    key: "accessibleParking",
    label: "Accessible Parking",
    shortLabel: "Parking",
  },
  {
    key: "doorAccessibility",
    label: "Door Accessibility",
    shortLabel: "Wide Doors",
  },
];

interface AccessibilityFeaturesGridProps {
  features: IAccessibilityFeatures;
  variant?: "compact" | "detailed";
}

export default function AccessibilityFeaturesGrid({
  features,
  variant = "compact",
}: AccessibilityFeaturesGridProps) {
  if (variant === "compact") {
    const available = ACCESSIBILITY_FEATURE_LABELS.filter(
      (item) => features[item.key]
    );
    if (available.length === 0) {
      return (
        <span className="text-xs text-slate-500">
          No accessibility features listed
        </span>
      );
    }

    const visible = available.slice(0, 4);
    const remaining = available.length - visible.length;

    return (
      <div className="flex flex-wrap gap-1.5">
        {visible.map((item) => (
          <span
            key={item.key}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-[#F2FBF8] px-2.5 py-0.5 text-[11px] font-semibold text-[#0A5C4A]"
          >
            <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
            <span>{item.shortLabel}</span>
          </span>
        ))}
        {remaining > 0 && (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            +{remaining} more
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {ACCESSIBILITY_FEATURE_LABELS.map((item) => {
        const enabled = Boolean(features[item.key]);
        return (
          <div
            key={item.key}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
              enabled
                ? "border-emerald-200 bg-[#F2FBF8] text-[#0A3B3F]"
                : "border-slate-200 bg-slate-50/70 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {enabled ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-slate-400" />
              )}
              <span className="text-sm font-semibold">{item.label}</span>
            </div>
            <span
              className={`text-xs font-bold ${
                enabled ? "text-emerald-700" : "text-slate-400"
              }`}
            >
              {enabled ? "Available" : "Not Listed"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
