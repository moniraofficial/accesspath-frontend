"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Edit3,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  MapPin,
  MessageSquarePlus,
  Star,
  Trash2,
} from "lucide-react";
import { favoritesApi, feedbackApi, locationsApi } from "@/lib/api";
import { ApiClientError, resolveUploadUrl } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import {
  FeedbackStatus,
  Permissions,
  type IFeedback,
  type ILocation,
  type IPaginationMeta,
} from "@/types/api";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import AccessibilityScoreBadge from "@/components/ui/AccessibilityScoreBadge";
import FormAlert from "@/components/ui/FormAlert";
import Pagination from "@/components/ui/Pagination";
import AccessibilityFeaturesGrid from "@/components/locations/AccessibilityFeaturesGrid";
import AccessPathMap from "@/components/map/AccessPathMap";

function LocationDetailsContent() {
  const params = useParams<{ id: string }>();
  const locationId = params?.id ?? "";
  const { user, isAuthenticated, hasPermission } = useAuth();

  const [location, setLocation] = useState<ILocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const [feedbackList, setFeedbackList] = useState<IFeedback[]>([]);
  const [feedbackMeta, setFeedbackMeta] = useState<IPaginationMeta | null>(null);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState<{
    variant: "success" | "error";
    message: string;
  } | null>(null);

  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(
    null
  );
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const canManageFavorites =
    isAuthenticated && hasPermission(Permissions.MANAGE_FAVORITES);
  const canSubmitFeedback =
    isAuthenticated && hasPermission(Permissions.SUBMIT_FEEDBACK);
  const canModerateFeedback =
    isAuthenticated && hasPermission(Permissions.MODERATE_FEEDBACK);

  const loadLocation = useCallback(async () => {
    if (!locationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await locationsApi.getById(locationId);
      setLocation(res.data ?? null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Unable to load location details.");
      }
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  const loadFeedback = useCallback(async () => {
    if (!locationId) return;
    setFeedbackLoading(true);
    setFeedbackError(null);
    try {
      const res = await feedbackApi.list({
        locationId,
        page: feedbackPage,
        limit: 10,
      });
      setFeedbackList(res.data ?? []);
      setFeedbackMeta(res.meta ?? null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFeedbackError(err.message);
      } else {
        setFeedbackError("Unable to load community feedback.");
      }
    } finally {
      setFeedbackLoading(false);
    }
  }, [locationId, feedbackPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLocation();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadLocation]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFeedback();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadFeedback]);

  useEffect(() => {
    let active = true;
    async function checkFavoriteStatus() {
      if (!canManageFavorites || !locationId) {
        if (active) setIsFavorite(false);
        return;
      }
      try {
        const res = await favoritesApi.list({ page: 1, limit: 100 });
        const found = (res.data ?? []).some(
          (fav) => fav.location.id === locationId
        );
        if (active) setIsFavorite(found);
      } catch {
        // Ignore silent favorite check errors
      }
    }
    void checkFavoriteStatus();
    return () => {
      active = false;
    };
  }, [canManageFavorites, locationId]);

  const handleToggleFavorite = async () => {
    if (!location || !canManageFavorites) return;
    setFavoriteBusy(true);
    setFavoriteError(null);
    try {
      if (isFavorite) {
        await favoritesApi.remove(location.id);
        setIsFavorite(false);
      } else {
        await favoritesApi.add(location.id);
        setIsFavorite(true);
      }
    } catch (err) {
      setFavoriteError(
        err instanceof ApiClientError
          ? err.message
          : "Could not update favorite status."
      );
    } finally {
      setFavoriteBusy(false);
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    setReviewNotice(null);

    const trimmed = comment.trim();
    if (trimmed.length < 5 || trimmed.length > 1000) {
      setReviewNotice({
        variant: "error",
        message: "Review comment must be between 5 and 1000 characters.",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await feedbackApi.create({
        locationId: location.id,
        rating,
        comment: trimmed,
      });
      setComment("");
      setRating(5);
      setFeedbackPage(1);
      setReviewNotice({
        variant: "success",
        message: "Thank you! Your accessibility review has been published.",
      });
      await loadFeedback();
    } catch (err) {
      setReviewNotice({
        variant: "error",
        message:
          err instanceof ApiClientError
            ? err.message
            : "Could not submit your review.",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSaveEdit = async (feedbackId: string) => {
    const trimmed = editComment.trim();
    if (trimmed.length < 5 || trimmed.length > 1000) {
      setReviewNotice({
        variant: "error",
        message: "Review comment must be between 5 and 1000 characters.",
      });
      return;
    }
    try {
      await feedbackApi.update(feedbackId, {
        rating: editRating,
        comment: trimmed,
      });
      setEditingFeedbackId(null);
      await loadFeedback();
    } catch (err) {
      setReviewNotice({
        variant: "error",
        message:
          err instanceof ApiClientError
            ? err.message
            : "Could not update feedback.",
      });
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await feedbackApi.remove(feedbackId);
      await loadFeedback();
    } catch (err) {
      setReviewNotice({
        variant: "error",
        message:
          err instanceof ApiClientError
            ? err.message
            : "Could not delete feedback.",
      });
    }
  };

  const handleModerateFeedback = async (
    feedbackId: string,
    nextStatus: "active" | "hidden"
  ) => {
    try {
      await feedbackApi.moderate(feedbackId, { status: nextStatus });
      await loadFeedback();
    } catch (err) {
      setReviewNotice({
        variant: "error",
        message:
          err instanceof ApiClientError
            ? err.message
            : "Could not moderate feedback.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-xs">
          <Loader2 className="h-5 w-5 animate-spin text-[#0A3B3F]" />
          <span className="text-sm font-semibold text-slate-700">
            Loading location details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <main className="min-h-[60vh] bg-[#F8FAFC] py-12">
        <div className="mx-auto max-w-2xl px-4">
          <FormAlert
            variant="error"
            title="Location unavailable"
            message={error ?? "Location not found."}
          />
          <Link
            href="/explore"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0A3B3F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#072B2E]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Explore</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16">
      <PageHeader
        badge={location.category}
        title={location.name}
        description={location.address}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Explore", href: "/explore" },
          { label: location.name },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <AccessibilityScoreBadge score={location.accessibilityScore} />
            <StatusBadge status={location.verificationStatus} />
            {canManageFavorites && (
              <button
                type="button"
                disabled={favoriteBusy}
                onClick={handleToggleFavorite}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-colors sm:text-sm ${
                  isFavorite
                    ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "border-white/30 bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-rose-600 text-rose-600" : ""}`}
                />
                <span>{isFavorite ? "Saved" : "Save Favorite"}</span>
              </button>
            )}
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {favoriteError && (
          <FormAlert
            variant="error"
            message={favoriteError}
            className="mb-5"
          />
        )}

        {/* Unverified Notice (AGENTS.md Section 6) */}
        {!location.isVerified && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold">
                Unverified Accessibility Information (
                {location.verificationStatus})
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-800 sm:text-sm">
                This location&apos;s accessibility attributes have not yet been
                verified by an AccessPath moderator.
                {location.rejectionReason
                  ? ` Rejection note: ${location.rejectionReason}`
                  : ""}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Photos, Description, 7 Accessibility Features, Reviews */}
          <div className="space-y-6 lg:col-span-8">
            {/* Photos */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
              {location.photos.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {location.photos.map((photo, idx) => {
                    const src = resolveUploadUrl(photo);
                    return src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={`${photo}-${idx}`}
                        src={src}
                        alt={`${location.name} photo ${idx + 1}`}
                        className={`h-60 w-full rounded-xl object-cover ${
                          idx === 0 && location.photos.length % 2 === 1
                            ? "sm:col-span-2 sm:h-72"
                            : ""
                        }`}
                      />
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="flex h-52 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#DCEEF6] via-[#ECF7F4] to-[#D4ECE4] text-[#0A3B3F]/80">
                  <Building2 className="h-12 w-12" />
                  <p className="mt-2 text-sm font-semibold">
                    No photographs uploaded yet
                  </p>
                </div>
              )}

              <div className="mt-5">
                <h2 className="text-lg font-extrabold text-[#0F172A]">
                  About This Location
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                  {location.description}
                </p>
              </div>
            </section>

            {/* 7 Required Accessibility Features */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-[#0F172A]">
                    Accessibility Information
                  </h2>
                  <p className="text-xs text-slate-600 sm:text-sm">
                    Detailed facility breakdown contributing to the{" "}
                    {location.accessibilityScore}% score.
                  </p>
                </div>
                <AccessibilityScoreBadge score={location.accessibilityScore} />
              </div>

              <div className="mt-4">
                <AccessibilityFeaturesGrid
                  features={location.accessibilityFeatures}
                  variant="detailed"
                />
              </div>
            </section>

            {/* Community Reviews & Feedback */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs sm:p-6">
              <h2 className="text-lg font-extrabold text-[#0F172A]">
                Community Feedback &amp; Reviews
              </h2>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Real experiences shared by AccessPath community members.
              </p>

              {reviewNotice && (
                <FormAlert
                  variant={reviewNotice.variant}
                  message={reviewNotice.message}
                  className="mt-4"
                />
              )}

              {/* Submit Feedback Form (Regular User Role) */}
              {canSubmitFeedback ? (
                <form
                  onSubmit={handleCreateFeedback}
                  className="mt-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 sm:p-5"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                    <MessageSquarePlus className="h-4 w-4 text-[#0A5C4A]" />
                    <span>Write an Accessibility Review</span>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="mr-2 text-xs font-semibold text-slate-700">
                      Rating:
                    </span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        aria-label={`Rate ${star} out of 5`}
                        className="cursor-pointer rounded p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= rating
                              ? "fill-amber-400 text-amber-500"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share details about ramps, entrance width, restrooms, or staff assistance (5–1000 characters)..."
                    className="mt-3 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A3B3F] focus:outline-none"
                  />

                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#0A3B3F] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#072B2E] disabled:opacity-60 sm:text-sm"
                    >
                      {submittingReview && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      <span>Post Review</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:text-sm">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        href={`/login?redirect=${encodeURIComponent(`/locations/${location.id}`)}`}
                        className="font-bold text-[#0A5C4A] hover:underline"
                      >
                        Sign in as a Regular Member
                      </Link>{" "}
                      to post accessibility feedback or save this place to
                      favorites.
                    </>
                  ) : (
                    <span>
                      Feedback submission is enabled for Regular Member accounts
                      (current role: <strong>{user?.role}</strong>).
                    </span>
                  )}
                </div>
              )}

              {/* Feedback List */}
              {feedbackError && (
                <FormAlert
                  variant="error"
                  message={feedbackError}
                  className="mt-4"
                />
              )}

              {feedbackLoading ? (
                <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading reviews...</span>
                </div>
              ) : feedbackList.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">
                  No community reviews yet for this location.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {feedbackList.map((item) => {
                    const isOwner = user?.id === item.userId;
                    const isEditing = editingFeedbackId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200/90 bg-white p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= item.rating
                                    ? "fill-amber-400 text-amber-500"
                                    : "text-slate-200"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-xs font-semibold text-slate-500">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.status === FeedbackStatus.HIDDEN && (
                              <StatusBadge status="hidden" />
                            )}

                            {isOwner && canSubmitFeedback && !isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingFeedbackId(item.id);
                                  setEditRating(item.rating);
                                  setEditComment(item.comment);
                                }}
                                aria-label="Edit review"
                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </button>
                            )}

                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => void handleDeleteFeedback(item.id)}
                                aria-label="Delete review"
                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            )}

                            {canModerateFeedback && (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleModerateFeedback(
                                    item.id,
                                    item.status === FeedbackStatus.ACTIVE
                                      ? FeedbackStatus.HIDDEN
                                      : FeedbackStatus.ACTIVE
                                  )
                                }
                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                {item.status === FeedbackStatus.ACTIVE ? (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5" />
                                    <span>Hide</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>Restore</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="mt-3 space-y-2.5">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEditRating(star)}
                                  className="cursor-pointer p-0.5"
                                >
                                  <Star
                                    className={`h-4 w-4 ${
                                      star <= editRating
                                        ? "fill-amber-400 text-amber-500"
                                        : "text-slate-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <textarea
                              rows={2}
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-[#0A3B3F] focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => void handleSaveEdit(item.id)}
                                className="cursor-pointer rounded-full bg-[#0A3B3F] px-3.5 py-1 text-xs font-bold text-white"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingFeedbackId(null)}
                                className="cursor-pointer rounded-full border border-slate-300 px-3.5 py-1 text-xs font-semibold text-slate-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            {item.comment}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {feedbackMeta && (
                    <Pagination
                      meta={feedbackMeta}
                      onPageChange={setFeedbackPage}
                      className="mt-4"
                    />
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Map & Metadata */}
          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
              <h2 className="text-base font-extrabold text-[#0F172A]">
                Location Map
              </h2>
              <p className="mt-1 mb-3 flex items-start gap-1.5 text-xs text-slate-600">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0A5C4A]" />
                <span>
                  {location.coordinates.latitude.toFixed(5)},{" "}
                  {location.coordinates.longitude.toFixed(5)}
                </span>
              </p>

              <AccessPathMap
                locations={[location]}
                center={[
                  location.coordinates.latitude,
                  location.coordinates.longitude,
                ]}
                zoom={15}
                enableClustering={false}
                selectedLocationId={location.id}
                heightClassName="h-64"
              />

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Added
                  </span>
                  <span className="font-semibold text-slate-800">
                    {new Date(location.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {location.verifiedAt && (
                  <div className="flex items-center justify-between">
                    <span>Verified On</span>
                    <span className="font-semibold text-emerald-700">
                      {new Date(location.verifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href="/route-planner"
                  className="inline-flex items-center justify-center rounded-full bg-[#0A3B3F] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#072B2E]"
                >
                  Plan Accessible Route Here
                </Link>
                <Link
                  href="/report"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Report a Nearby Barrier
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function LocationDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC]">
          <Loader2 className="h-6 w-6 animate-spin text-[#0A3B3F]" />
        </div>
      }
    >
      <LocationDetailsContent />
    </Suspense>
  );
}
