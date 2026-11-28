"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { barriersApi, uploadsApi } from "@/lib/api";
import { ApiClientError } from "@/lib/api-client";
import {
  ALL_BARRIER_CATEGORIES,
  type BarrierCategoryType,
  type IBarrier,
} from "@/types/api";
import AuthGuard from "@/components/ui/AuthGuard";
import PageHeader from "@/components/ui/PageHeader";
import FormAlert from "@/components/ui/FormAlert";
import AccessPathMap from "@/components/map/AccessPathMap";

function ReportBarrierForm() {
  const [category, setCategory] = useState<BarrierCategoryType | "">("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [mapPickMode, setMapPickMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<IBarrier | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const latValid = !latitude || (Number.isFinite(lat) && lat >= -90 && lat <= 90);
  const lngValid =
    !longitude || (Number.isFinite(lng) && lng >= -180 && lng <= 180);

  const handleMapClick = useCallback(
    (pt: { latitude: number; longitude: number }) => {
      setLatitude(String(pt.latitude));
      setLongitude(String(pt.longitude));
      setMapPickMode(false);
    },
    []
  );

  const handleImageSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || !files[0]) return;
      const file = files[0];

      if (imagePreview) URL.revokeObjectURL(imagePreview);
      const preview = URL.createObjectURL(file);
      setImageFile(file);
      setImagePreview(preview);
      setImageUrl(null);
      setImageError(null);
      setImageUploading(true);

      try {
        const res = await uploadsApi.uploadImage(file);
        if (res.data?.url) {
          setImageUrl(res.data.url);
        }
      } catch (err) {
        const msg =
          err instanceof ApiClientError ? err.message : "Image upload failed.";
        setImageError(msg);
      } finally {
        setImageUploading(false);
      }
    },
    [imagePreview]
  );

  const removeImage = useCallback(() => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    setImageError(null);
  }, [imagePreview]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!category) {
        setError("Please select a barrier category.");
        return;
      }
      if (!description.trim() || description.length < 10 || description.length > 1500) {
        setError("Description must be between 10 and 1500 characters.");
        return;
      }
      if (!latitude || !longitude || !latValid || !lngValid) {
        setError("Please enter valid GPS coordinates.");
        return;
      }
      if (imageUploading) {
        setError("Please wait for the image to finish uploading.");
        return;
      }
      if (imageFile && !imageUrl) {
        setError("Image upload failed. Remove it and try again.");
        return;
      }

      setSubmitting(true);
      try {
        const payload: Parameters<typeof barriersApi.create>[0] = {
          category: category as BarrierCategoryType,
          description: description.trim(),
          coordinates: { latitude: lat, longitude: lng },
        };
        if (imageUrl) {
          payload.imageUrl = imageUrl;
        }
        const res = await barriersApi.create(payload);
        if (res.data) {
          setSuccess(res.data);
        }
      } catch (err) {
        const msg =
          err instanceof ApiClientError
            ? err.message
            : "An unexpected error occurred.";
        setError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [
      category,
      description,
      latitude,
      longitude,
      lat,
      lng,
      latValid,
      lngValid,
      imageFile,
      imageUrl,
      imageUploading,
    ]
  );

  if (success) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-[#0F172A]">
            Barrier Reported!
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Your report for{" "}
            <span className="font-semibold">{success.category}</span> has been
            submitted. Moderators will review it shortly.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/my-reports"
              className="rounded-full bg-[#0A3B3F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#072B2E]"
            >
              View My Reports
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccess(null);
                setCategory("");
                setDescription("");
                setLatitude("");
                setLongitude("");
                removeImage();
                setError(null);
              }}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Report Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <PageHeader
        title="Report Accessibility Barrier"
        description="Help keep AccessPath accurate by reporting barriers that affect people with mobility challenges."
        badge="Community"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Report Barrier" },
        ]}
      />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {error && <FormAlert variant="error" message={error} />}

          {/* Barrier Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="mb-4 text-base font-extrabold text-[#0F172A]">
              Barrier Details
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="barrier-category"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Barrier Type <span className="text-rose-500">*</span>
                </label>
                <select
                  id="barrier-category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as BarrierCategoryType | "")
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#0A3B3F] focus:bg-white focus:ring-2 focus:ring-[#0A3B3F]/10"
                >
                  <option value="">Select barrier type…</option>
                  {ALL_BARRIER_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="barrier-desc"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="barrier-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={1500}
                  placeholder="Describe the barrier and how it affects accessibility..."
                  required
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 outline-none transition focus:border-[#0A3B3F] focus:bg-white focus:ring-2 focus:ring-[#0A3B3F]/10"
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {description.length}/1500
                </p>
              </div>
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-[#0F172A]">
                Location
              </h2>
              <button
                type="button"
                onClick={() => setMapPickMode((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  mapPickMode
                    ? "border-[#0A3B3F] bg-[#0A3B3F] text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                {mapPickMode ? "Click map to pick" : "Pick on Map"}
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="barrier-lat"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Latitude <span className="text-rose-500">*</span>
                </label>
                <input
                  id="barrier-lat"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 23.8103"
                  required
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 outline-none transition focus:bg-white focus:ring-2 ${
                    !latValid
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-[#0A3B3F] focus:ring-[#0A3B3F]/10"
                  }`}
                />
                {!latValid && (
                  <p className="mt-1 text-xs text-rose-600">
                    Must be between -90 and 90
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="barrier-lng"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Longitude <span className="text-rose-500">*</span>
                </label>
                <input
                  id="barrier-lng"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 90.4125"
                  required
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 outline-none transition focus:bg-white focus:ring-2 ${
                    !lngValid
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 focus:border-[#0A3B3F] focus:ring-[#0A3B3F]/10"
                  }`}
                />
                {!lngValid && (
                  <p className="mt-1 text-xs text-rose-600">
                    Must be between -180 and 180
                  </p>
                )}
              </div>
            </div>

            <div
              className={`overflow-hidden rounded-xl border transition-all ${
                mapPickMode ? "border-[#0A3B3F] shadow-sm" : "border-slate-200"
              }`}
            >
              <AccessPathMap
                routeStart={
                  Number.isFinite(lat) && Number.isFinite(lng)
                    ? { latitude: lat, longitude: lng }
                    : null
                }
                center={
                  Number.isFinite(lat) && Number.isFinite(lng)
                    ? [lat, lng]
                    : [23.8103, 90.4125]
                }
                zoom={13}
                onMapClick={mapPickMode ? handleMapClick : undefined}
                heightClassName="h-[280px]"
              />
            </div>
            {mapPickMode && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#0A3B3F]">
                <MapPin className="h-3.5 w-3.5" />
                Click anywhere on the map to set the barrier location
              </p>
            )}
          </div>

          {/* Photo (optional) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-4">
              <h2 className="text-base font-extrabold text-[#0F172A]">
                Photo{" "}
                <span className="text-sm font-normal text-slate-400">
                  (optional)
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                PNG, JPEG, or WebP only · max 5 MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                void handleImageSelect(e.target.files);
                e.target.value = "";
              }}
            />

            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 transition-colors hover:border-[#0A3B3F]/40 hover:bg-[#F2FBF8]"
              >
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="text-sm font-semibold text-slate-500">
                  Click to upload a photo
                </span>
              </button>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Barrier photo preview"
                  className="max-h-56 w-full object-contain"
                />
                {imageUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <Loader2 className="h-7 w-7 animate-spin text-[#0A3B3F]" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove photo"
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition-colors hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
                {imageError && (
                  <div className="border-t border-rose-200 bg-rose-50 px-4 py-2">
                    <p className="text-xs text-rose-700">{imageError}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || imageUploading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0A3B3F] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#072B2E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <AuthGuard>
      <ReportBarrierForm />
    </AuthGuard>
  );
}
