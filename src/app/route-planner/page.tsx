"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Compass,
  Loader2,
  MapPin,
  Navigation,
  Route,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { locationsApi, routesApi } from "@/lib/api";
import { ApiClientError } from "@/lib/api-client";
import type {
  ILocation,
  IRouteDiscoveryResult,
  IRouteOption,
  IRoutePoint,
  IRoutePreferences,
} from "@/types/api";
import PageHeader from "@/components/ui/PageHeader";
import FormAlert from "@/components/ui/FormAlert";
import AccessibilityScoreBadge from "@/components/ui/AccessibilityScoreBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import AccessPathMap from "@/components/map/AccessPathMap";

function isValidLat(val: number): boolean {
  return Number.isFinite(val) && val >= -90 && val <= 90;
}

function isValidLng(val: number): boolean {
  return Number.isFinite(val) && val >= -180 && val <= 180;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

const PREFERENCE_OPTIONS: ReadonlyArray<{
  key: keyof IRoutePreferences;
  label: string;
  description: string;
}> = [
  {
    key: "wheelchairFriendly",
    label: "Wheelchair Friendly",
    description: "Prioritize smooth, step-free corridors and curb ramps",
  },
  {
    key: "requireRamp",
    label: "Require Ramp",
    description: "Penalize corridors lacking verified ramp facilities",
  },
  {
    key: "requireElevator",
    label: "Require Elevator",
    description: "Penalize corridors lacking verified elevator access",
  },
  {
    key: "avoidUnverified",
    label: "Avoid Unverified Barriers",
    description: "Apply stricter penalties near unverified barrier reports",
  },
];

export default function RoutePlannerPage() {
  const [startLat, setStartLat] = useState("23.8103");
  const [startLng, setStartLng] = useState("90.4125");
  const [destLat, setDestLat] = useState("23.8223");
  const [destLng, setDestLng] = useState("90.4255");

  const [mapPickTarget, setMapPickTarget] = useState<"start" | "destination">(
    "start"
  );
  const [preferences, setPreferences] = useState<IRoutePreferences>({
    wheelchairFriendly: true,
    requireRamp: false,
    requireElevator: false,
    avoidUnverified: false,
  });

  const [knownPlaces, setKnownPlaces] = useState<ILocation[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);

  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IRouteDiscoveryResult | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      locationsApi
        .list({ limit: 40, sortBy: "accessibilityScore", sortOrder: "desc" })
        .then((res) => {
          if (active) {
            setKnownPlaces(res.data ?? []);
          }
        })
        .catch(() => {
          // Optional quick-pick list; manual/map coordinates still work
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const parsedStartLat = Number(startLat);
  const parsedStartLng = Number(startLng);
  const parsedDestLat = Number(destLat);
  const parsedDestLng = Number(destLng);

  const validStartPoint: IRoutePoint | null =
    startLat.trim() !== "" &&
    startLng.trim() !== "" &&
    isValidLat(parsedStartLat) &&
    isValidLng(parsedStartLng)
      ? { latitude: parsedStartLat, longitude: parsedStartLng }
      : null;

  const validDestPoint: IRoutePoint | null =
    destLat.trim() !== "" &&
    destLng.trim() !== "" &&
    isValidLat(parsedDestLat) &&
    isValidLng(parsedDestLng)
      ? { latitude: parsedDestLat, longitude: parsedDestLng }
      : null;

  const handleUseMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStartLat(pos.coords.latitude.toFixed(6));
        setStartLng(pos.coords.longitude.toFixed(6));
        setGeoLoading(false);
      },
      () => {
        setError(
          "Unable to read your GPS location. Please allow location permissions or enter coordinates manually."
        );
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSwapEndpoints = () => {
    setStartLat(destLat);
    setStartLng(destLng);
    setDestLat(startLat);
    setDestLng(startLng);
  };

  const handlePickPlace = (
    target: "start" | "destination",
    locationId: string
  ) => {
    const place = knownPlaces.find((p) => p.id === locationId);
    if (!place) return;
    if (target === "start") {
      setStartLat(String(place.coordinates.latitude));
      setStartLng(String(place.coordinates.longitude));
    } else {
      setDestLat(String(place.coordinates.latitude));
      setDestLng(String(place.coordinates.longitude));
    }
  };

  const handleMapClick = (pt: IRoutePoint) => {
    if (mapPickTarget === "start") {
      setStartLat(String(pt.latitude));
      setStartLng(String(pt.longitude));
    } else {
      setDestLat(String(pt.latitude));
      setDestLng(String(pt.longitude));
    }
  };

  const handleTogglePreference = (key: keyof IRoutePreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDiscoverRoutes = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validStartPoint) {
      setError(
        "Starting coordinates must have latitude in [-90, 90] and longitude in [-180, 180]."
      );
      return;
    }
    if (!validDestPoint) {
      setError(
        "Destination coordinates must have latitude in [-90, 90] and longitude in [-180, 180]."
      );
      return;
    }
    if (
      validStartPoint.latitude === validDestPoint.latitude &&
      validStartPoint.longitude === validDestPoint.longitude
    ) {
      setError("Starting location and destination cannot be identical.");
      return;
    }

    setDiscovering(true);
    try {
      const response = await routesApi.discover({
        start: validStartPoint,
        destination: validDestPoint,
        preferences,
      });
      const data = response.data ?? null;
      setResult(data);
      const recommended =
        data?.routes.find((r) => r.isRecommended)?.routeId ??
        data?.routes[0]?.routeId ??
        null;
      setSelectedRouteId(recommended);
    } catch (err) {
      setResult(null);
      setSelectedRouteId(null);
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to discover accessible routes right now."
      );
    } finally {
      setDiscovering(false);
    }
  };

  const activeRoute: IRouteOption | null =
    result?.routes.find((r) => r.routeId === selectedRouteId) ??
    result?.routes[0] ??
    null;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16">
      <PageHeader
        badge="Accessibility-First Navigation"
        title="Accessible Route Planner"
        description="Discover and compare multi-corridor routes scored by ramps, elevators, step-free facilities, and nearby mobility barriers."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Route Planner" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Route Controls & Preferences */}
          <section
            aria-label="Route Planning Controls"
            className="lg:col-span-5"
          >
            <form
              onSubmit={handleDiscoverRoutes}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6"
              noValidate
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#0F172A]">
                  <Route className="h-5 w-5 text-[#0A5C4A]" />
                  <span>Plan Your Route</span>
                </h2>

                <button
                  type="button"
                  onClick={handleSwapEndpoints}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span>Swap</span>
                </button>
              </div>

              {error && (
                <FormAlert variant="error" message={error} className="mt-4" />
              )}

              {/* Start Coordinates */}
              <div className="mt-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-[#0A3B3F] uppercase">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    <span>Starting Location</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={geoLoading}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#0A5C4A]/30 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#0A5C4A] hover:bg-[#F2FBF8]"
                  >
                    {geoLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Navigation className="h-3 w-3" />
                    )}
                    <span>Use My GPS</span>
                  </button>
                </div>

                {knownPlaces.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={(e) => handlePickPlace("start", e.target.value)}
                    aria-label="Choose a known starting location"
                    className="mt-2.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#0A3B3F] focus:outline-none"
                  >
                    <option value="">
                      Quick-fill from existing places...
                    </option>
                    {knownPlaces.map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.name} ({place.category})
                      </option>
                    ))}
                  </select>
                )}

                <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="start-lat"
                      className="block text-[11px] font-semibold text-slate-600"
                    >
                      Latitude
                    </label>
                    <input
                      id="start-lat"
                      type="number"
                      step="any"
                      value={startLat}
                      onChange={(e) => setStartLat(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0A3B3F] focus:outline-none sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="start-lng"
                      className="block text-[11px] font-semibold text-slate-600"
                    >
                      Longitude
                    </label>
                    <input
                      id="start-lng"
                      type="number"
                      step="any"
                      value={startLng}
                      onChange={(e) => setStartLng(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0A3B3F] focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Destination Coordinates */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-[#0E2238] uppercase">
                    <Compass className="h-3.5 w-3.5 text-[#0E2238]" />
                    <span>Destination</span>
                  </span>
                </div>

                {knownPlaces.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={(e) =>
                      handlePickPlace("destination", e.target.value)
                    }
                    aria-label="Choose a known destination location"
                    className="mt-2.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#0A3B3F] focus:outline-none"
                  >
                    <option value="">
                      Quick-fill from existing places...
                    </option>
                    {knownPlaces.map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.name} ({place.category})
                      </option>
                    ))}
                  </select>
                )}

                <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="dest-lat"
                      className="block text-[11px] font-semibold text-slate-600"
                    >
                      Latitude
                    </label>
                    <input
                      id="dest-lat"
                      type="number"
                      step="any"
                      value={destLat}
                      onChange={(e) => setDestLat(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0A3B3F] focus:outline-none sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="dest-lng"
                      className="block text-[11px] font-semibold text-slate-600"
                    >
                      Longitude
                    </label>
                    <input
                      id="dest-lng"
                      type="number"
                      step="any"
                      value={destLng}
                      onChange={(e) => setDestLng(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#0A3B3F] focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Accessibility Preferences */}
              <div className="mt-5">
                <p className="text-xs font-bold tracking-wide text-slate-700 uppercase">
                  Accessibility Preferences
                </p>
                <div className="mt-2.5 space-y-2">
                  {PREFERENCE_OPTIONS.map((pref) => {
                    const checked = Boolean(preferences[pref.key]);
                    return (
                      <label
                        key={pref.key}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
                          checked
                            ? "border-[#0A5C4A]/40 bg-[#F2FBF8]"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleTogglePreference(pref.key)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#0A3B3F]"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#0F172A] sm:text-sm">
                            {pref.label}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            {pref.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={discovering}
                className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0A3B3F] px-6 py-3 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#072B2E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {discovering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Scoring Accessible Routes...</span>
                  </>
                ) : (
                  <>
                    <span>Find Accessible Routes</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Right Column: Interactive Map & Scored Route Results */}
          <section
            aria-label="Route Map and Scored Options"
            className="space-y-6 lg:col-span-7"
          >
            {/* Map Click-to-Pick Mode Toolbar + Map */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-600">
                  Click anywhere on the map to set{" "}
                  <strong className="text-[#0A3B3F]">
                    {mapPickTarget === "start" ? "Start" : "Destination"}
                  </strong>
                  :
                </p>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setMapPickTarget("start")}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                      mapPickTarget === "start"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Set Start
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapPickTarget("destination")}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                      mapPickTarget === "destination"
                        ? "bg-[#0E2238] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Set Destination
                  </button>
                </div>
              </div>

              <AccessPathMap
                routeOptions={result?.routes ?? []}
                selectedRouteId={activeRoute?.routeId ?? null}
                routeStart={validStartPoint}
                routeDestination={validDestPoint}
                onMapClick={handleMapClick}
                enableClustering={false}
                heightClassName="h-[380px]"
              />
            </div>

            {/* Empty Initial State */}
            {!discovering && !result && !error && (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-2xs">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F2FBF8] text-[#0A5C4A]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-base font-extrabold text-[#0F172A]">
                  Ready to Score Routes
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Set your starting point and destination, choose your
                  accessibility preferences, and click{" "}
                  <strong>Find Accessible Routes</strong> to compare corridor
                  scores and barrier warnings.
                </p>
              </div>
            )}

            {/* Route Options List */}
            {result && result.routes.length === 0 && (
              <FormAlert
                variant="info"
                title="No routes returned"
                message="Try adjusting your start/destination coordinates or relaxing strict preferences."
              />
            )}

            {result && result.routes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-[#0F172A]">
                    Route Options ({result.routes.length})
                  </h2>
                  <span className="text-xs font-medium text-slate-500">
                    Ranked by accessibility score
                  </span>
                </div>

                {result.routes.map((route) => {
                  const isSelected = activeRoute?.routeId === route.routeId;
                  return (
                    <article
                      key={route.routeId}
                      onClick={() => setSelectedRouteId(route.routeId)}
                      className={`cursor-pointer rounded-2xl border bg-white p-5 shadow-2xs transition-all ${
                        isSelected
                          ? "border-[#0A3B3F] ring-2 ring-[#0A3B3F]/20"
                          : "border-slate-200/90 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-[#0F172A]">
                              {route.name}
                            </h3>
                            {route.isRecommended && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                                <CheckCircle2 className="h-3 w-3" />
                                Recommended
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Route className="h-3.5 w-3.5 text-[#0A5C4A]" />
                              {formatDistance(route.distanceMeters)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-[#0A5C4A]" />
                              ~{route.estimatedTravelMinutes} min
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                              {route.barriers.length} barrier
                              {route.barriers.length === 1 ? "" : "s"} nearby
                            </span>
                          </div>
                        </div>

                        <AccessibilityScoreBadge
                          score={route.accessibilityScore}
                        />
                      </div>

                      {/* Positive Features */}
                      {route.positiveFeatures.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {route.positiveFeatures.map((feat, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-[#F2FBF8] px-2.5 py-0.5 text-[11px] font-semibold text-[#0A5C4A]"
                            >
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              {feat}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Accessibility & Unverified Data Warnings */}
                      {route.warnings.length > 0 && (
                        <div className="mt-3.5 space-y-1.5 rounded-xl border border-amber-200 bg-amber-50/90 p-3">
                          {route.warnings.map((warning, idx) => (
                            <p
                              key={idx}
                              className="flex items-start gap-2 text-xs leading-snug text-amber-900"
                            >
                              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                              <span>{warning}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Nearby Barriers List */}
                      {route.barriers.length > 0 && (
                        <div className="mt-3.5 border-t border-slate-100 pt-3">
                          <p className="text-xs font-bold text-slate-700">
                            Barriers Along Corridor
                          </p>
                          <div className="mt-2 space-y-2">
                            {route.barriers.map((barrier) => (
                              <div
                                key={barrier.id}
                                className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-xs"
                              >
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {barrier.category}{" "}
                                    <span className="font-normal text-slate-500">
                                      ({Math.round(barrier.distanceFromRouteMeters)}m from route)
                                    </span>
                                  </p>
                                  <p className="mt-0.5 text-slate-600">
                                    {barrier.description}
                                  </p>
                                </div>
                                <StatusBadge status={barrier.status} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
