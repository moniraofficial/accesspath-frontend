"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { locationsApi, uploadsApi } from "@/lib/api";
import { ApiClientError } from "@/lib/api-client";
import {
  ALL_LOCATION_CATEGORIES,
  UserRole,
  type IAccessibilityFeatures,
  type ILocation,
  type LocationCategoryType,
} from "@/types/api";
import { ACCESSIBILITY_FEATURE_LABELS } from "@/components/locations/AccessibilityFeaturesGrid";
import AuthGuard from "@/components/ui/AuthGuard";
import PageHeader from "@/components/ui/PageHeader";
import FormAlert from "@/components/ui/FormAlert";
import AccessPathMap from "@/components/map/AccessPathMap";

const DEFAULT_FEATURES: IAccessibilityFeatures = {
  wheelchairAccess: false,
  rampAvailability: false,
  elevatorAvailability: false,
  accessibleRestroom: false,
  accessibleParking: false,
  stairFreeEntry: false,
  doorAccessibility: false,
};

interface PhotoEntry {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  uploading: boolean;
  error?: string;
}

function SubmitLocationForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [category, setCategory] = useState<LocationCategoryType | "">("");
  const [features, setFeatures] = useState<IAccessibilityFeatures>(DEFAULT_FEATURES);
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);

  const [mapPickMode, setMapPickMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<ILocation | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── coordinate validation helpers ── */
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const latValid = !latitude || (Number.isFinite(lat) && lat >= -90 && lat <= 90);
  const lngValid = !longitude || (Number.isFinite(lng) && lng >= -180 && lng <= 180);

  /* ── map click handler ── */
  const handleMapClick = useCallback(
    (pt: { latitude: number; longitude: number }) => {
      setLatitude(String(pt.latitude));
      setLongitude(String(pt.longitude));
      setMapPickMode(false);
    },
    []
  );

  /* ── photo upload ── */
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const remaining = 10 - photos.length;
      const toProcess = Array.from(files).slice(0, remaining);
      if (!toProcess.length) return;

      const newEntries: PhotoEntry[] = toProcess.map((f) => ({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        uploading: true,
      }));

      setPhotos((prev) => [...prev, ...newEntries]);

      /* Upload each in parallel */
      const results = await Promise.allSettled(
        newEntries.map(async (entry) => {
          const res = await uploadsApi.uploadImage(entry.file);
          return { id: entry.id, url: res.data!.url };
        })
      );

      setPhotos((prev) =>
        prev.map((p) => {
          const result = results.find((r, i) => newEntries[i].id === p.id);
          if (!result) return p;
          if (result.status === "fulfilled") {
            return { ...p, uploading: false, uploadedUrl: result.value.url };
          }
          const msg =
            result.reason instanceof ApiClientError
              ? result.reason.message
              : "Upload failed";
          return { ...p, uploading: false, error: msg };
        })
      );
    },
    [photos.length]
  );

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const entry = prev.find((p) => p.id === id);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  /* ── cleanup object URLs ── */
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── submit ── */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!name.trim() || name.length < 2 || name.length > 150) {
        setError("Name must be between 2 and 150 characters.");
        return;
      }
      if (!description.trim() || description.length < 10 || description.length > 2000) {
        setError("Description must be between 10 and 2000 characters.");
        return;
      }
      if (!address.trim() || address.length < 5 || address.length > 300) {
        setError("Address must be between 5 and 300 characters.");
        return;
      }
      if (!category) {
        setError("Please select a location category.");
        return;
      }
      if (!latitude || !longitude || !latValid || !lngValid) {
        setError("Please enter valid GPS coordinates.");
        return;
      }
      const pendingUploads = photos.filter((p) => p.uploading);
      if (pendingUploads.length > 0) {
        setError("Please wait for all photos to finish uploading.");
        return;
      }
      const failedUploads = photos.filter((p) => p.error);
      if (failedUploads.length > 0) {
        setError("Some photos failed to upload. Remove them and try again.");
        return;
      }

      const photoUrls = photos
        .map((p) => p.uploadedUrl)
        .filter(Boolean) as string[];

      setSubmitting(true);
      try {
        const res = await locationsApi.create({
          name: name.trim(),
          description: description.trim(),
          address: address.trim(),
          coordinates: { latitude: lat, longitude: lng },
          category: category as LocationCategoryType,
          accessibilityFeatures: features,
          photos: photoUrls,
        });
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
      name,
      description,
      address,
      category,
      latitude,
      longitude,
      lat,
      lng,
      latValid,
      lngValid,
      photos,
      features,
    ]
  );

  /* ── success state ── */
  if (success) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-[#0F172A]">
            Location Submitted!
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            <span className="font-semibold">{success.name}</span> has been
            submitted for moderation. It will appear in the directory once a
            moderator reviews it.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/locations/${success.id}`}
              className="rounded-full bg-[#0A3B3F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#072B2E]"
            >
              View Location
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccess(null);
                setName("");
                setDescription("");
                setAddress("");
                setLatitude("");
                setLongitude("");
                setCategory("");
                setFeatures(DEFAULT_FEATURES);
                setPhotos([]);
                setError(null);
              }}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <PageHeader
        title="Submit New Location"
        description="Contribute an accessible place to the AccessPath directory. Your submission will be reviewed by a moderator before it goes live."
        badge="Contributor"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Submit Location" },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {error && <FormAlert variant="error" message={error} />}

          {/* Basic Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="mb-4 text-base font-extrabold text-[#0F172A]">
              Basic Details
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="loc-name"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Location Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="loc-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={150}
                  placeholder="e.g. City Hall, Dhaka"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 outline-none transition focus:border-[#0A3B3F] focus:bg-white focus:ring-2 focus:ring-[#0A3B3F]/10"
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {name.length}/150
                </p>
              </div>

              <div>
                <label
                  htmlFor="loc-desc"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="loc-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Describe the location and its accessibility features..."
                  required
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 outline-none transition focus:border-[#0A3B3F] focus:bg-white focus:ring-2 focus:ring-[#0A3B3F]/10"
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {description.length}/2000
                </p>
              </div>

              <div>
                <label
                  htmlFor="loc-address"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="loc-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  maxLength={300}
                  placeholder="Full street address"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 outline-none transition focus:border-[#0A3B3F] focus:bg-white focus:ring-2 focus:ring-[#0A3B3F]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="loc-category"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="loc-category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as LocationCategoryType | "")
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#0F172A] outline-none transition focus:border-[#0A3B3F] focus:bg-white focus:ring-2 focus:ring-[#0A3B3F]/10"
                >
                  <option value="">Select a category…</option>
                  {ALL_LOCATION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-[#0F172A]">
                GPS Coordinates
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
                  htmlFor="loc-lat"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Latitude <span className="text-rose-500">*</span>
                </label>
                <input
                  id="loc-lat"
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
                  htmlFor="loc-lng"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Longitude <span className="text-rose-500">*</span>
                </label>
                <input
                  id="loc-lng"
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
                heightClassName="h-[300px]"
              />
            </div>
            {mapPickMode && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-[#0A3B3F] font-medium">
                <MapPin className="h-3.5 w-3.5" />
                Click anywhere on the map to set coordinates
              </p>
            )}
          </div>

          {/* Accessibility Features */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="mb-4 text-base font-extrabold text-[#0F172A]">
              Accessibility Features
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ACCESSIBILITY_FEATURE_LABELS.map((item) => (
                <label
                  key={item.key}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                    features[item.key]
                      ? "border-emerald-300 bg-[#F2FBF8]"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      features[item.key] ? "text-[#0A3B3F]" : "text-slate-600"
                    }`}
                  >
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={features[item.key]}
                    onChange={(e) =>
                      setFeatures((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#0A3B3F]"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  Photos
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  PNG, JPEG, or WebP only · max 5 MB each · up to 10 photos
                </p>
              </div>
              {photos.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Photos
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                void handleFileSelect(e.target.files);
                e.target.value = "";
              }}
            />

            {photos.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 transition-colors hover:border-[#0A3B3F]/40 hover:bg-[#F2FBF8]"
              >
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="text-sm font-semibold text-slate-500">
                  Click to upload photos
                </span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.previewUrl}
                      alt="Photo preview"
                      className="h-full w-full object-cover"
                    />
                    {p.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <Loader2 className="h-6 w-6 animate-spin text-[#0A3B3F]" />
                      </div>
                    )}
                    {p.error && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50/90 p-2 text-center">
                        <X className="h-5 w-5 text-rose-600" />
                        <span className="mt-1 text-[10px] text-rose-700">
                          {p.error}
                        </span>
                      </div>
                    )}
                    {!p.uploading && (
                      <button
                        type="button"
                        onClick={() => removePhoto(p.id)}
                        aria-label="Remove photo"
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/explore"
              className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || photos.some((p) => p.uploading)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0A3B3F] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#072B2E] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Location"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SubmitLocationPage() {
  return (
    <AuthGuard
      allowedRoles={[UserRole.CONTRIBUTOR, UserRole.MODERATOR, UserRole.ADMIN]}
    >
      <SubmitLocationForm />
    </AuthGuard>
  );
}
