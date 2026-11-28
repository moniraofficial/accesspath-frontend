"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  Loader2,
  MapPin,
  Navigation,
  RotateCcw,
} from "lucide-react";
import { barriersApi, locationsApi } from "@/lib/api";
import { ApiClientError } from "@/lib/api-client";
import {
  ALL_LOCATION_CATEGORIES,
  VerificationStatus,
  type IBarrier,
  type ILocation,
  type LocationCategoryType,
  type VerificationStatusType,
} from "@/types/api";
import PageHeader from "@/components/ui/PageHeader";
import FormAlert from "@/components/ui/FormAlert";
import StatusBadge from "@/components/ui/StatusBadge";
import AccessibilityScoreBadge from "@/components/ui/AccessibilityScoreBadge";
import AccessibilityFeaturesGrid from "@/components/locations/AccessibilityFeaturesGrid";
import AccessPathMap from "@/components/map/AccessPathMap";

export default function MapViewPage() {
  const [category, setCategory] = useState<LocationCategoryType | "">("");
  const [verificationStatus, setVerificationStatus] = useState<
    VerificationStatusType | ""
  >("");
  const [showBarriers, setShowBarriers] = useState(true);

  const [geoCoords, setGeoCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [geoLoading, setGeoLoading] = useState(false);

  const [locations, setLocations] = useState<ILocation[]>([]);
  const [barriers, setBarriers] = useState<IBarrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(
    null
  );
  const [selectedBarrier, setSelectedBarrier] = useState<IBarrier | null>(null);

  const loadMapData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const locReq = locationsApi.list({
        limit: 100,
        ...(category ? { category } : {}),
        ...(verificationStatus ? { verificationStatus } : {}),
        ...(geoCoords
          ? {
              lat: geoCoords.latitude,
              lng: geoCoords.longitude,
              radiusKm,
            }
          : {}),
      });

      const barReq = showBarriers
        ? barriersApi.list({
            limit: 100,
            ...(geoCoords
              ? {
                  lat: geoCoords.latitude,
                  lng: geoCoords.longitude,
                  radiusKm,
                }
              : {}),
          })
        : Promise.resolve({ data: [] as IBarrier[] });

      const [locRes, barRes] = await Promise.all([locReq, barReq]);
      setLocations(locRes.data ?? []);
      setBarriers(barRes.data ?? []);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to load map markers."
      );
    } finally {
      setLoading(false);
    }
  }, [category, verificationStatus, showBarriers, geoCoords, radiusKm]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMapData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadMapData]);

  const handleToggleGps = () => {
    if (geoCoords) {
      setGeoCoords(null);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-14">
      <PageHeader
        badge="Interactive Geospatial Map"
        title="City Accessibility Map"
        description="Explore clustered accessible locations and reported mobility barriers across the city."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Map View" }]}
        actions={
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-teal-300/40 bg-white/10 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20 sm:text-sm"
          >
            <Compass className="h-4 w-4" />
            <span>Directory View</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Map Filter Bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as LocationCategoryType | "")
              }
              aria-label="Filter map by category"
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0A3B3F] focus:outline-none sm:text-sm"
            >
              <option value="">All Categories</option>
              {ALL_LOCATION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={verificationStatus}
              onChange={(e) =>
                setVerificationStatus(
                  e.target.value as VerificationStatusType | ""
                )
              }
              aria-label="Filter map by verification status"
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0A3B3F] focus:outline-none sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value={VerificationStatus.VERIFIED}>Verified Only</option>
              <option value={VerificationStatus.PENDING}>Pending Review</option>
            </select>

            <button
              type="button"
              onClick={() => setShowBarriers((prev) => !prev)}
              aria-pressed={showBarriers}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                showBarriers
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{showBarriers ? "Barriers Visible" : "Show Barriers"}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleGps}
              disabled={geoLoading}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                geoCoords
                  ? "border-[#0A5C4A] bg-[#F2FBF8] text-[#0A5C4A]"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {geoLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Navigation className="h-3.5 w-3.5" />
              )}
              <span>{geoCoords ? `Near Me (${radiusKm} km)` : "Near Me"}</span>
            </button>

            {geoCoords && (
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                aria-label="Map GPS radius"
                className="rounded-full border border-[#0A5C4A]/40 bg-[#F2FBF8] px-3 py-2 text-xs font-semibold text-[#0A5C4A]"
              >
                <option value={5}>5 km</option>
                <option value={15}>15 km</option>
                <option value={30}>30 km</option>
                <option value={50}>50 km</option>
              </select>
            )}

            {(category || verificationStatus || geoCoords) && (
              <button
                type="button"
                onClick={() => {
                  setCategory("");
                  setVerificationStatus("");
                  setGeoCoords(null);
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-600">
            {loading ? (
              <span>Updating markers...</span>
            ) : (
              <span>
                {locations.length} locations • {barriers.length} barriers
              </span>
            )}
          </div>
        </div>

        {error && (
          <FormAlert variant="error" message={error} className="mb-5" />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <AccessPathMap
              locations={locations}
              barriers={barriers}
              userPosition={
                geoCoords ? { ...geoCoords, radiusKm } : null
              }
              selectedLocationId={selectedLocation?.id ?? null}
              onSelectLocation={(loc) => {
                setSelectedLocation(loc);
                setSelectedBarrier(null);
              }}
              onSelectBarrier={(bar) => {
                setSelectedBarrier(bar);
                setSelectedLocation(null);
              }}
              heightClassName="h-[580px]"
            />
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
              {selectedLocation ? (
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={selectedLocation.verificationStatus} />
                    <AccessibilityScoreBadge
                      score={selectedLocation.accessibilityScore}
                      size="sm"
                    />
                  </div>
                  <h2 className="mt-3 text-lg font-extrabold text-[#0F172A]">
                    {selectedLocation.name}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-[#0A5C4A]">
                    {selectedLocation.category}
                  </p>
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0A5C4A]" />
                    <span>{selectedLocation.address}</span>
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {selectedLocation.description}
                  </p>
                  <div className="mt-4">
                    <AccessibilityFeaturesGrid
                      features={selectedLocation.accessibilityFeatures}
                      variant="compact"
                    />
                  </div>
                  <Link
                    href={`/locations/${selectedLocation.id}`}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0A3B3F] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#072B2E]"
                  >
                    <span>Open Location Details</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : selectedBarrier ? (
                <div>
                  <StatusBadge status={selectedBarrier.status} />
                  <h2 className="mt-3 text-lg font-extrabold text-rose-900">
                    {selectedBarrier.category}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
                    {selectedBarrier.description}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    Coordinates:{" "}
                    {selectedBarrier.coordinates.latitude.toFixed(5)},{" "}
                    {selectedBarrier.coordinates.longitude.toFixed(5)}
                  </p>
                  <Link
                    href="/reports"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0E2238] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#0A3B3F]"
                  >
                    <span>View All Barrier Reports</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF2F5] text-[#0A3B3F]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h2 className="mt-3 text-base font-extrabold text-[#0F172A]">
                    Select a Map Marker
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    Click any numbered cluster to zoom in, or tap a location or
                    barrier pin to inspect accessibility details here.
                  </p>
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-left text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#0A5C4A]" />
                      <span>Verified Location (with score)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#D97706]" />
                      <span>Pending / Unverified Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded bg-[#DC2626]" />
                      <span>Reported Mobility Barrier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border-2 border-[#2DD4BF] bg-[#0E2238]" />
                      <span>Clustered Locations (click to zoom)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
