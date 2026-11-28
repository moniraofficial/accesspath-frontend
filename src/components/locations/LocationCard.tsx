"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, Navigation } from "lucide-react";
import type { ILocation } from "@/types/api";
import { resolveUploadUrl } from "@/lib/api-client";
import StatusBadge from "@/components/ui/StatusBadge";
import AccessibilityScoreBadge from "@/components/ui/AccessibilityScoreBadge";
import AccessibilityFeaturesGrid from "@/components/locations/AccessibilityFeaturesGrid";

interface LocationCardProps {
  location: ILocation;
  isSelected?: boolean;
  onSelect?: (location: ILocation) => void;
}

export default function LocationCard({
  location,
  isSelected = false,
  onSelect,
}: LocationCardProps) {
  const coverPhoto =
    location.photos.length > 0
      ? resolveUploadUrl(location.photos[0])
      : undefined;

  const distanceLabel =
    typeof location.distanceMeters === "number"
      ? location.distanceMeters < 1000
        ? `${Math.round(location.distanceMeters)} m away`
        : `${(location.distanceMeters / 1000).toFixed(1)} km away`
      : null;

  return (
    <article
      onClick={() => onSelect?.(location)}
      className={`group flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isSelected
          ? "border-[#0A3B3F] ring-2 ring-[#0A3B3F]/20"
          : "border-slate-200/90"
      } ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div>
        {/* Photo / Visual Header */}
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#DCEEF6] via-[#ECF7F4] to-[#D4ECE4]">
          {coverPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverPhoto}
              alt={location.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#0A3B3F]/70">
              <Building2 className="h-10 w-10" />
              <span className="text-xs font-semibold">{location.category}</span>
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={location.verificationStatus} />
          </div>

          <div className="absolute top-3 right-3">
            <AccessibilityScoreBadge
              score={location.accessibilityScore}
              size="sm"
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-block rounded-full bg-[#EEF2F5] px-2.5 py-0.5 text-[11px] font-bold text-[#0A3B3F]">
              {location.category}
            </span>
            {distanceLabel && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A5C4A]">
                <Navigation className="h-3 w-3" />
                {distanceLabel}
              </span>
            )}
          </div>

          <h3 className="mt-2.5 line-clamp-1 text-lg font-extrabold tracking-tight text-[#0F172A] group-hover:text-[#0A3B3F]">
            {location.name}
          </h3>

          <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0A5C4A]" />
            <span className="line-clamp-1">{location.address}</span>
          </p>

          <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
            {location.description}
          </p>

          <div className="mt-3.5">
            <AccessibilityFeaturesGrid
              features={location.accessibilityFeatures}
              variant="compact"
            />
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
        {!location.isVerified ? (
          <span className="text-[11px] font-medium text-amber-700">
            Unverified community data
          </span>
        ) : (
          <span className="text-[11px] font-medium text-emerald-700">
            Moderator verified
          </span>
        )}

        <Link
          href={`/locations/${location.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0A3B3F] transition-colors hover:text-[#0E7C66]"
        >
          <span>View Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
