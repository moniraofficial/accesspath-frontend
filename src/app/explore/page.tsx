"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  Filter,
  LayoutGrid,
  Loader2,
  Map as MapIcon,
  MapPin,
  Navigation,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { locationsApi, type LocationListParams } from "@/lib/api";
import { ApiClientError } from "@/lib/api-client";
import {
  ALL_LOCATION_CATEGORIES,
  VerificationStatus,
  type IAccessibilityFeatures,
  type ILocation,
  type IPaginationMeta,
  type LocationCategoryType,
  type VerificationStatusType,
} from "@/types/api";
import PageHeader from "@/components/ui/PageHeader";
import FormAlert from "@/components/ui/FormAlert";
import Pagination from "@/components/ui/Pagination";
import LocationCard from "@/components/locations/LocationCard";
import { ACCESSIBILITY_FEATURE_LABELS } from "@/components/locations/AccessibilityFeaturesGrid";
import AccessPathMap from "@/components/map/AccessPathMap";

type FeatureKey = keyof IAccessibilityFeatures;

function isValidCategory(val: string | null): val is LocationCategoryType {
  return (
    val !== null &&
    (ALL_LOCATION_CATEGORIES as readonly string[]).includes(val)
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCategoryParam = searchParams.get("category");
  const initialCategory = isValidCategory(initialCategoryParam)
    ? initialCategoryParam
    : "";

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [category, setCategory] = useState<LocationCategoryType | "">(
    initialCategory
  );
  const [verificationStatus, setVerificationStatus] = useState<
    VerificationStatusType | ""
  >("");
  const [features, setFeatures] = useState<Partial<Record<FeatureKey, boolean>>>(
    {}
  );
  const [sortBy, setSortBy] = useState<
    "createdAt" | "accessibilityScore" | "name" | "distance"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "split">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [geoCoords, setGeoCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [locations, setLocations] = useState<ILocation[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 350ms search debouncing
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);

    const effectiveSortBy =
      sortBy === "distance" && !geoCoords ? "createdAt" : sortBy;

    const params: LocationListParams = {
      page,
      limit: 12,
      sortBy: effectiveSortBy,
      sortOrder,
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    if (verificationStatus) params.verificationStatus = verificationStatus;
    if (geoCoords) {
      params.lat = geoCoords.latitude;
      params.lng = geoCoords.longitude;
      params.radiusKm = radiusKm;
    }

    for (const item of ACCESSIBILITY_FEATURE_LABELS) {
      if (features[item.key]) {
        params[item.key] = true;
      }
    }

    try {
      const response = await locationsApi.list(params);
      setLocations(response.data ?? []);
      setMeta(response.meta ?? null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to load accessible locations. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [
    page,
    debouncedSearch,
    category,
    verificationStatus,
    features,
    sortBy,
    sortOrder,
    geoCoords,
    radiusKm,
  ]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (active) {
        void fetchLocations();
      }
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [fetchLocations]);

  const handleToggleFeature = (key: FeatureKey) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setPage(1);
  };

  const handleUseMyLocation = () => {
    if (geoCoords) {
      setGeoCoords(null);
      setGeoError(null);
      if (sortBy === "distance") {
        setSortBy("createdAt");
        setSortOrder("desc");
      }
      setPage(1);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setSortBy("distance");
        setSortOrder("asc");
        setPage(1);
        setGeoLoading(false);
      },
      () => {
        setGeoError(
          "Unable to access your GPS location. Please allow location permissions."
        );
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setCategory("");
    setVerificationStatus("");
    setFeatures({});
    setGeoCoords(null);
    setGeoError(null);
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const activeFeatureCount = Object.values(features).filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-14">
      <PageHeader
        badge="Accessible Location Directory"
        title="Explore Accessible Places"
        description="Search verified public buildings, parks, transit stations, and community spaces with detailed wheelchair and mobility feature ratings."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Explore" }]}
        actions={
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-full border border-teal-300/40 bg-white/10 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20 sm:text-sm"
          >
            <Compass className="h-4 w-4" />
            <span>Full Map View</span>
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Search & Primary Filter Toolbar */}
        <section
          aria-label="Location Search and Filters"
          className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by place name or address..."
                aria-label="Search locations by name or address"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/70 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A3B3F] focus:bg-white focus:ring-2 focus:ring-[#0A3B3F]/15 focus:outline-none"
              />
            </div>

            {/* Category Select */}
            <div className="sm:w-56">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as LocationCategoryType | "");
                  setPage(1);
                }}
                aria-label="Filter by category"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#0A3B3F] focus:bg-white focus:outline-none"
              >
                <option value="">All Categories</option>
                {ALL_LOCATION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Status Select */}
            <div className="sm:w-44">
              <select
                value={verificationStatus}
                onChange={(e) => {
                  setVerificationStatus(
                    e.target.value as VerificationStatusType | ""
                  );
                  setPage(1);
                }}
                aria-label="Filter by verification status"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#0A3B3F] focus:bg-white focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value={VerificationStatus.VERIFIED}>Verified Only</option>
                <option value={VerificationStatus.PENDING}>Pending Review</option>
                <option value={VerificationStatus.REJECTED}>Rejected</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="sm:w-48">
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split(":") as [
                    "createdAt" | "accessibilityScore" | "name" | "distance",
                    "asc" | "desc",
                  ];
                  setSortBy(field);
                  setSortOrder(order);
                  setPage(1);
                }}
                aria-label="Sort locations"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#0A3B3F] focus:bg-white focus:outline-none"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="accessibilityScore:desc">
                  Highest Accessibility Score
                </option>
                <option value="accessibilityScore:asc">
                  Lowest Accessibility Score
                </option>
                <option value="name:asc">Name (A–Z)</option>
                {geoCoords && (
                  <option value="distance:asc">Nearest to Me</option>
                )}
              </select>
            </div>
          </div>

          {/* Secondary Action Row: GPS, Feature Filters Toggle, View Mode */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={geoLoading}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
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
                <span>{geoCoords ? "GPS Active" : "Use My Location"}</span>
              </button>

              {geoCoords && (
                <select
                  value={radiusKm}
                  onChange={(e) => {
                    setRadiusKm(Number(e.target.value));
                    setPage(1);
                  }}
                  aria-label="Search radius in kilometers"
                  className="rounded-full border border-[#0A5C4A]/40 bg-[#F2FBF8] px-3 py-1.5 text-xs font-semibold text-[#0A5C4A] focus:outline-none"
                >
                  <option value={1}>Within 1 km</option>
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={25}>Within 25 km</option>
                  <option value={50}>Within 50 km</option>
                  <option value={100}>Within 100 km</option>
                </select>
              )}

              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                aria-expanded={showFilters}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  showFilters || activeFeatureCount > 0
                    ? "border-[#0A3B3F] bg-[#0A3B3F] text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>
                  Accessibility Features
                  {activeFeatureCount > 0 ? ` (${activeFeatureCount})` : ""}
                </span>
              </button>

              {(debouncedSearch ||
                category ||
                verificationStatus ||
                activeFeatureCount > 0 ||
                geoCoords) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Grid vs Split Map View Toggle */}
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-[#0A3B3F] shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === "split"
                    ? "bg-white text-[#0A3B3F] shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span>Split Map</span>
              </button>
            </div>
          </div>

          {/* Expandable 7 Accessibility Feature Toggles */}
          {showFilters && (
            <div className="mt-3.5 border-t border-slate-100 pt-3.5">
              <p className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Filter className="h-3.5 w-3.5 text-[#0A5C4A]" />
                <span>Require Accessibility Attributes</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {ACCESSIBILITY_FEATURE_LABELS.map((item) => {
                  const active = Boolean(features[item.key]);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleToggleFeature(item.key)}
                      aria-pressed={active}
                      className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? "border-[#0A5C4A] bg-[#0A5C4A] text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-[#0A5C4A]/40 hover:bg-[#F2FBF8]"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {geoError && (
            <FormAlert variant="error" message={geoError} className="mt-3" />
          )}
        </section>

        {/* Results Count */}
        {meta && !loading && !error && (
          <div className="mt-5 flex items-center justify-between text-xs font-medium text-slate-600 sm:text-sm">
            <span>
              Found{" "}
              <strong className="text-[#0F172A]">
                {meta.totalRecords.toLocaleString()}
              </strong>{" "}
              accessible locations
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-6 space-y-3">
            <FormAlert variant="error" title="Could not load locations" message={error} />
            <button
              type="button"
              onClick={() => void fetchLocations()}
              className="cursor-pointer rounded-full bg-[#0A3B3F] px-5 py-2 text-xs font-semibold text-white hover:bg-[#072B2E]"
            >
              Retry Search
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-88 animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="h-40 rounded-xl bg-slate-200/70" />
                <div className="mt-4 h-4 w-28 rounded bg-slate-200/70" />
                <div className="mt-3 h-5 w-3/4 rounded bg-slate-200/70" />
                <div className="mt-2 h-4 w-1/2 rounded bg-slate-200/70" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && locations.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2F5] text-[#0A3B3F]">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-extrabold text-[#0F172A]">
              No matching locations found
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
              Try broadening your search keywords, clearing feature filters, or
              expanding your GPS search radius.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 cursor-pointer rounded-full bg-[#0A3B3F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#072B2E]"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Results Grid or Split View */}
        {!loading && !error && locations.length > 0 && (
          <div
            className={`mt-5 ${
              viewMode === "split"
                ? "grid grid-cols-1 gap-6 lg:grid-cols-12"
                : ""
            }`}
          >
            <div
              className={
                viewMode === "split"
                  ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7"
                  : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              }
            >
              {locations.map((loc) => (
                <LocationCard
                  key={loc.id}
                  location={loc}
                  isSelected={loc.id === selectedId}
                  onSelect={
                    viewMode === "split"
                      ? (selected) => setSelectedId(selected.id)
                      : undefined
                  }
                />
              ))}
            </div>

            {viewMode === "split" && (
              <div className="lg:col-span-5">
                <div className="sticky top-24">
                  <AccessPathMap
                    locations={locations}
                    userPosition={
                      geoCoords
                        ? { ...geoCoords, radiusKm }
                        : null
                    }
                    selectedLocationId={selectedId}
                    onSelectLocation={(loc) => setSelectedId(loc.id)}
                    heightClassName="h-[540px]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Server-Side Pagination */}
        {!loading && !error && meta && (
          <Pagination
            meta={meta}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mt-8"
          />
        )}
      </div>
    </main>
  );
}

function ExplorePageInner() {
  const searchParams = useSearchParams();
  return <ExploreContent key={searchParams.toString()} />;
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC]">
          <Loader2 className="h-6 w-6 animate-spin text-[#0A3B3F]" />
        </div>
      }
    >
      <ExplorePageInner />
    </Suspense>
  );
}
