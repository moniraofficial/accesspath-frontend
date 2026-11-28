"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart2,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { barriersApi, locationsApi } from "@/lib/api";
import { ApiClientError } from "@/lib/api-client";
import {
  ALL_BARRIER_CATEGORIES,
  type BarrierCategoryType,
  type IBarrier,
  type ILocation,
  type IPaginationMeta,
} from "@/types/api";
import AuthGuard from "@/components/ui/AuthGuard";
import PageHeader from "@/components/ui/PageHeader";
import FormAlert from "@/components/ui/FormAlert";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";

/* ─── helpers ─── */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function truncate(str: string, max = 120): string {
  return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}

/* ─── Edit Barrier Modal ─── */
interface EditBarrierModalProps {
  barrier: IBarrier;
  onClose: () => void;
  onSaved: (updated: IBarrier) => void;
}

function EditBarrierModal({ barrier, onClose, onSaved }: EditBarrierModalProps) {
  const [category, setCategory] = useState<BarrierCategoryType>(
    barrier.category
  );
  const [description, setDescription] = useState(barrier.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (description.trim().length < 10 || description.trim().length > 1500) {
        setError("Description must be between 10 and 1500 characters.");
        return;
      }
      setSaving(true);
      try {
        const res = await barriersApi.update(barrier.id, {
          category,
          description: description.trim(),
        });
        if (res.data) {
          onSaved(res.data);
        }
      } catch (err) {
        const msg =
          err instanceof ApiClientError ? err.message : "Update failed.";
        setError(msg);
      } finally {
        setSaving(false);
      }
    },
    [barrier.id, category, description, onSaved]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id="edit-modal-title"
            className="text-base font-extrabold text-[#0F172A]"
          >
            Edit Report
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <FormAlert variant="error" message={error} className="mb-4" />
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Barrier Type
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as BarrierCategoryType)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#0A3B3F] focus:ring-2 focus:ring-[#0A3B3F]/10"
            >
              {ALL_BARRIER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1500}
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 outline-none focus:border-[#0A3B3F] focus:ring-2 focus:ring-[#0A3B3F]/10"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {description.length}/1500
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#0A3B3F] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#072B2E] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── My Barrier Reports Tab ─── */
function MyBarrierReports() {
  const [barriers, setBarriers] = useState<IBarrier[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<IBarrier | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchMy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await barriersApi.listMy({ page, limit: 15 });
      setBarriers(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load your reports.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMy();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchMy]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this report?")) return;
      setDeletingId(id);
      setDeleteError(null);
      try {
        await barriersApi.remove(id);
        setBarriers((prev) => prev.filter((b) => b.id !== id));
        if (meta) {
          setMeta((m) =>
            m ? { ...m, totalRecords: m.totalRecords - 1 } : m
          );
        }
      } catch (err) {
        const msg =
          err instanceof ApiClientError ? err.message : "Delete failed.";
        setDeleteError(msg);
      } finally {
        setDeletingId(null);
      }
    },
    [meta]
  );

  if (loading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0A3B3F]" />
      </div>
    );
  }

  if (error) {
    return <FormAlert variant="error" message={error} />;
  }

  if (barriers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <AlertTriangle className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <p className="font-extrabold text-[#0F172A]">No barrier reports yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Help the community by reporting accessibility barriers.
          </p>
        </div>
        <Link
          href="/report"
          className="rounded-full bg-[#0A3B3F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#072B2E]"
        >
          Report a Barrier
        </Link>
      </div>
    );
  }

  return (
    <>
      {deleteError && (
        <FormAlert variant="error" message={deleteError} className="mb-4" />
      )}

      <div className="space-y-3">
        {barriers.map((barrier) => (
          <article
            key={barrier.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="text-sm font-extrabold text-[#0F172A]">
                  {barrier.category}
                </span>
                <StatusBadge status={barrier.status} />
              </div>
              <p className="mb-2 text-sm text-slate-600">
                {truncate(barrier.description)}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {barrier.coordinates.latitude.toFixed(5)},{" "}
                  {barrier.coordinates.longitude.toFixed(5)}
                </span>
                <span>{formatDate(barrier.createdAt)}</span>
              </div>
              {barrier.rejectionReason && (
                <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700">
                  <span className="font-semibold">Rejection reason:</span>{" "}
                  {barrier.rejectionReason}
                </p>
              )}
            </div>

            {/* Actions — only on pending reports */}
            {barrier.status === "pending" && (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(barrier)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  disabled={deletingId === barrier.id}
                  onClick={() => void handleDelete(barrier.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60"
                >
                  {deletingId === barrier.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      {editTarget && (
        <EditBarrierModal
          barrier={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(updated) => {
            setBarriers((prev) =>
              prev.map((b) => (b.id === updated.id ? updated : b))
            );
            setEditTarget(null);
          }}
        />
      )}
    </>
  );
}

/* ─── My Location Submissions Tab ─── */
function MyLocationSubmissions({ userId }: { userId: string }) {
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await locationsApi.list({
        submittedBy: userId,
        page,
        limit: 15,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      setLocations(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Failed to load your location submissions.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMy();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchMy]);

  if (loading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0A3B3F]" />
      </div>
    );
  }

  if (error) {
    return <FormAlert variant="error" message={error} />;
  }

  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <MapPin className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <p className="font-extrabold text-[#0F172A]">
            No location submissions yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Contribute by submitting accessible locations to the directory.
          </p>
        </div>
        <Link
          href="/submit-location"
          className="rounded-full bg-[#0A3B3F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#072B2E]"
        >
          Submit a Location
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {locations.map((loc) => (
          <article
            key={loc.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Link
                  href={`/locations/${loc.id}`}
                  className="text-sm font-extrabold text-[#0A3B3F] transition-colors hover:underline"
                >
                  {loc.name}
                </Link>
                <StatusBadge status={loc.verificationStatus} />
              </div>
              <p className="mb-1.5 text-xs font-medium text-slate-500">
                {loc.category}
              </p>
              <p className="mb-2 text-sm text-slate-600">
                {truncate(loc.description)}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {loc.address}
                </span>
                <span>{formatDate(loc.createdAt)}</span>
              </div>
              {loc.rejectionReason && (
                <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700">
                  <span className="font-semibold">Rejection reason:</span>{" "}
                  {loc.rejectionReason}
                </p>
              )}
            </div>
            <div className="shrink-0">
              <Link
                href={`/locations/${loc.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}
    </>
  );
}

/* ─── Main Page ─── */
type Tab = "barriers" | "locations";

function MyReportsContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("barriers");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "barriers",
      label: "My Barrier Reports",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      id: "locations",
      label: "My Location Submissions",
      icon: <MapPin className="h-4 w-4" />,
    },
  ];

  if (!user) return null;

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <PageHeader
        title="My Reports"
        description="Track your barrier reports and location submissions."
        badge="My Activity"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "My Reports" }]}
        actions={
          <div className="flex gap-2">
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25"
            >
              <FileText className="h-4 w-4" />
              Report Barrier
            </Link>
            <Link
              href="/submit-location"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/25"
            >
              <BarChart2 className="h-4 w-4" />
              Submit Location
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-[#0A3B3F] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.id === "barriers" ? "Barriers" : "Locations"}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "barriers" ? (
          <MyBarrierReports />
        ) : (
          <MyLocationSubmissions userId={user.id} />
        )}
      </div>
    </div>
  );
}

export default function MyReportsPage() {
  return (
    <AuthGuard>
      <MyReportsContent />
    </AuthGuard>
  );
}
