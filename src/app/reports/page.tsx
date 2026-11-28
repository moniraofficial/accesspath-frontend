"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Filter,
  Loader2,
  MapPin,
  Navigation,
  RotateCcw,
  Search,
} from "lucide-react";
import { barriersApi, type BarrierListParams } from "@/lib/api";
import { resolveUploadUrl } from "@/lib/api-client";
import { ApiClientError } from "@/lib/api-client";
import {
  ALL_BARRIER_CATEGORIES,
  ALL_BARRIER_STATUSES,
  type BarrierCategoryType,
  type BarrierStatusType,
  type IBarrier,
  type IPaginationMeta,
} from "@/types/api";
import PageHeader from "@/components/ui/PageHeader";
import FormAlert from "@/components/ui/FormAlert";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";

const BARRIER_CATEGORY_ICONS: Record<BarrierCategoryType, string> = {
  "Broken Footpath": "🚧",
  "Missing Ramp": "♿",
  "Blocked Sidewalk": "🚫",
  "Broken Elevator": "🛗",
  "Unsafe Crossing": "⚠️",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function truncate(str: string, max = 140): string {
  return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}

function BarrierCard({ barrier }: { barrier: IBarrier }) {
  const icon = BARRIER_CATEGORY_ICONS[barrier.category] ?? "⚠️";
  const imgSrc = resolveUploadUrl(barrier.imageUrl);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-sm">
      {imgSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={`${barrier.category} photo`}
          className="h-40 w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              {icon}
            </span>
            <span className="text-sm font-extrabold text-[#0F172A]">
              {barrier.category}
            </span>
          </div>
          <StatusBadge status={barrier.status} />
        </div>

        <p className="mb-3 flex-1 text-sm leading-relaxed text-slate-600">
          {truncate(barrier.description)}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {barrier.coordinates.latitude.toFixed(5)},{" "}
              {barrier.coordinates.longitude.toFixed(5)}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {formatDate(barrier.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

function ReportsContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("q") ?? ""
  );
  const [category, setCategory] = useState<BarrierCategoryType | "">(
    (searchParams.get("category") as BarrierCategoryType) ?? ""
  );
  const [status, setStatus] = useState<BarrierStatusType | "">(
    (searchParams.get("status") as BarrierStatusType) ?? ""
  );
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [geoCoords, setGeoCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [barriers, setBarriers] = useState<IBarrier[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /* ── debounce search ── */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  /* ── fetch ── */
  const fetchBarriers = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params: BarrierListParams = {
        page,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category) params.category = category;
      if (status) params.status = status;
      if (geoCoords) {
        params.lat = geoCoords.latitude;
        params.lng = geoCoords.longitude;
        params.radiusKm = radiusKm;
      }

      const res = await barriersApi.list(params);
      setBarriers(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load barrier reports.";
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category, status, geoCoords, radiusKm]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchBarriers();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchBarriers]);

  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) {
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
        setPage(1);
        setGeoLoading(false);
      },
      () => {
        setGeoError("Unable to retrieve your location.");
        setGeoLoading(false);
      }
    );
  }, []);

  const handleReset = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
    setStatus("");
    setGeoCoords(null);
    setRadiusKm(5);
    setPage(1);
    setGeoError(null);
  }, []);

  const hasActiveFilters =
    debouncedSearch || category || status || geoCoords !== null;

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <PageHeader
        title="Barrier Reports"
        description="Community-reported accessibility barriers. Help us keep the platform accurate by verifying or adding new reports."
        badge="Community"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Reports" }]}
        actions={
          <Link
            href="/report"
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            + Report Barrier
          </Link>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Search + filter bar */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reports…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-[#0F172A] shadow-xs outline-none transition focus:border-[#0A3B3F] focus:ring-2 focus:ring-[#0A3B3F]/10"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-xs transition-colors ${
              showFilters
                ? "border-[#0A3B3F] bg-[#0A3B3F] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          <button
            type="button"
            onClick={handleNearMe}
            disabled={geoLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            {geoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Near Me
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-[#0A3B3F]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mb-5 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as BarrierCategoryType | "");
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0A3B3F]"
              >
                <option value="">All Categories</option>
                {ALL_BARRIER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as BarrierStatusType | "");
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0A3B3F]"
              >
                <option value="">All Statuses</option>
                {ALL_BARRIER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {geoCoords && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600">
                  Radius (km)
                </label>
                <select
                  value={radiusKm}
                  onChange={(e) => {
                    setRadiusKm(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0A3B3F]"
                >
                  {[1, 2, 5, 10, 20].map((r) => (
                    <option key={r} value={r}>
                      {r} km
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {geoError && (
          <FormAlert
            variant="error"
            message={geoError}
            className="mb-4"
          />
        )}
        {geoCoords && (
          <FormAlert
            variant="info"
            message={`Showing barriers within ${radiusKm} km of your current location.`}
            className="mb-4"
          />
        )}

        {/* Results */}
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-xs">
              <Loader2 className="h-5 w-5 animate-spin text-[#0A3B3F]" />
              <span className="text-sm font-semibold text-slate-700">
                Loading reports…
              </span>
            </div>
          </div>
        ) : fetchError ? (
          <FormAlert variant="error" message={fetchError} />
        ) : barriers.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <AlertTriangle className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="font-extrabold text-[#0F172A]">No reports found</p>
              <p className="mt-1 text-sm text-slate-500">
                {hasActiveFilters
                  ? "Try adjusting your filters or search term."
                  : "No barrier reports have been submitted yet."}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {meta && (
              <p className="mb-4 text-sm text-slate-500">
                <span className="font-bold text-[#0F172A]">
                  {meta.totalRecords.toLocaleString()}
                </span>{" "}
                report{meta.totalRecords !== 1 ? "s" : ""} found
              </p>
            )}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {barriers.map((b) => (
                <BarrierCard key={b.id} barrier={b} />
              ))}
            </div>
            {meta && meta.totalPages > 1 && (
              <Pagination meta={meta} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-[#F8FAFC]">
          <Loader2 className="h-6 w-6 animate-spin text-[#0A3B3F]" />
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
