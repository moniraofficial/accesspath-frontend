"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type {
  IBarrier,
  ILocation,
  IRouteOption,
  IRoutePoint,
} from "@/types/api";

export interface AccessPathMapProps {
  locations?: ILocation[];
  barriers?: IBarrier[];
  routeOptions?: IRouteOption[];
  selectedRouteId?: string | null;
  routeStart?: IRoutePoint | null;
  routeDestination?: IRoutePoint | null;
  onMapClick?: (point: IRoutePoint) => void;
  center?: [number, number];
  zoom?: number;
  heightClassName?: string;
  enableClustering?: boolean;
  userPosition?: { latitude: number; longitude: number; radiusKm?: number } | null;
  selectedLocationId?: string | null;
  onSelectLocation?: (location: ILocation) => void;
  onSelectBarrier?: (barrier: IBarrier) => void;
}

interface ClusterBucket {
  latSum: number;
  lngSum: number;
  items: ILocation[];
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createLocationPinIcon(loc: ILocation, isSelected: boolean): L.DivIcon {
  const bg =
    loc.verificationStatus === "verified"
      ? "#0A5C4A"
      : loc.verificationStatus === "pending"
        ? "#D97706"
        : "#E11D48";
  const ring = isSelected
    ? "0 0 0 4px rgba(10, 59, 63, 0.35)"
    : "0 2px 6px rgba(15, 23, 42, 0.35)";
  const size = isSelected ? 34 : 28;

  return L.divIcon({
    className: "accesspath-location-pin",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};border:2.5px solid #ffffff;box-shadow:${ring};display:flex;align-items:center;justify-content:center;color:#ffffff;font-weight:800;font-size:11px;font-family:sans-serif;">${Math.round(loc.accessibilityScore)}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createClusterIcon(count: number): L.DivIcon {
  const size = count >= 50 ? 46 : count >= 10 ? 40 : 34;
  return L.divIcon({
    className: "accesspath-cluster-pin",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:#0E2238;border:3px solid #2DD4BF;box-shadow:0 4px 10px rgba(14,34,56,0.35);display:flex;align-items:center;justify-content:center;color:#ffffff;font-weight:800;font-size:12px;font-family:sans-serif;">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createBarrierPinIcon(isVerified: boolean): L.DivIcon {
  const bg = isVerified ? "#DC2626" : "#D97706";
  return L.divIcon({
    className: "accesspath-barrier-pin",
    html: `<div style="width:24px;height:24px;border-radius:8px;background:${bg};border:2px solid #ffffff;box-shadow:0 2px 6px rgba(15,23,42,0.35);display:flex;align-items:center;justify-content:center;color:#ffffff;font-weight:900;font-size:13px;font-family:sans-serif;">!</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createEndpointIcon(label: "S" | "D", bg: string): L.DivIcon {
  return L.divIcon({
    className: "accesspath-endpoint-pin",
    html: `<div style="width:30px;height:30px;border-radius:9999px;background:${bg};border:3px solid #ffffff;box-shadow:0 3px 8px rgba(15,23,42,0.4);display:flex;align-items:center;justify-content:center;color:#ffffff;font-weight:800;font-size:12px;font-family:sans-serif;">${label}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function LeafletMapInner({
  locations = [],
  barriers = [],
  routeOptions = [],
  selectedRouteId = null,
  routeStart = null,
  routeDestination = null,
  onMapClick,
  center,
  zoom = 12,
  heightClassName = "h-[480px]",
  enableClustering = true,
  userPosition = null,
  selectedLocationId = null,
  onSelectLocation,
  onSelectBarrier,
}: AccessPathMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const onSelectLocationRef = useRef(onSelectLocation);
  const onSelectBarrierRef = useRef(onSelectBarrier);
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    onSelectLocationRef.current = onSelectLocation;
    onSelectBarrierRef.current = onSelectBarrier;
    onMapClickRef.current = onMapClick;
  }, [onSelectLocation, onSelectBarrier, onMapClick]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = center ??
      (routeStart
        ? [routeStart.latitude, routeStart.longitude]
        : userPosition
          ? [userPosition.latitude, userPosition.longitude]
          : locations[0]
            ? [locations[0].coordinates.latitude, locations[0].coordinates.longitude]
            : [23.8103, 90.4125]);

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClickRef.current?.({
        latitude: Number(e.latlng.lat.toFixed(6)),
        longitude: Number(e.latlng.lng.toFixed(6)),
      });
    });

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = group;

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeOptions.length > 0) {
      const points: [number, number][] = [];
      for (const route of routeOptions) {
        for (const wp of route.waypoints) {
          points.push([wp.latitude, wp.longitude]);
        }
      }
      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
          return;
        }
      }
    }

    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    } else if (userPosition) {
      map.setView(
        [userPosition.latitude, userPosition.longitude],
        Math.max(map.getZoom(), 13),
        { animate: true }
      );
    } else if (locations.length > 0 && !selectedLocationId) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [
          loc.coordinates.latitude,
          loc.coordinates.longitude,
        ])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [center, userPosition, locations, selectedLocationId, routeOptions]);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    const renderMarkers = () => {
      group.clearLayers();

      if (userPosition) {
        L.circleMarker([userPosition.latitude, userPosition.longitude], {
          radius: 8,
          color: "#ffffff",
          weight: 3,
          fillColor: "#2563EB",
          fillOpacity: 1,
        })
          .bindPopup("<strong>Your Location</strong>")
          .addTo(group);

        if (userPosition.radiusKm) {
          L.circle([userPosition.latitude, userPosition.longitude], {
            radius: userPosition.radiusKm * 1000,
            color: "#0A5C4A",
            weight: 1.5,
            fillColor: "#0E7C66",
            fillOpacity: 0.08,
          }).addTo(group);
        }
      }

      // Route polylines (alternative routes first, selected route on top)
      if (routeOptions.length > 0) {
        const activeRouteId =
          selectedRouteId ??
          routeOptions.find((r) => r.isRecommended)?.routeId ??
          routeOptions[0]?.routeId;

        for (const route of routeOptions) {
          if (route.routeId === activeRouteId) continue;
          const latlngs = route.waypoints.map(
            (wp) => [wp.latitude, wp.longitude] as [number, number]
          );
          L.polyline(latlngs, {
            color: "#64748B",
            weight: 4,
            opacity: 0.55,
            dashArray: "6 6",
          })
            .bindPopup(
              `<strong>${escapeHtml(route.name)}</strong><br/>Score: ${Math.round(route.accessibilityScore)}% • ${route.estimatedTravelMinutes} min`
            )
            .addTo(group);
        }

        const activeRoute = routeOptions.find(
          (r) => r.routeId === activeRouteId
        );
        if (activeRoute) {
          const latlngs = activeRoute.waypoints.map(
            (wp) => [wp.latitude, wp.longitude] as [number, number]
          );
          L.polyline(latlngs, {
            color: "#0A5C4A",
            weight: 6,
            opacity: 0.92,
          })
            .bindPopup(
              `<strong>${escapeHtml(activeRoute.name)}</strong><br/>Score: ${Math.round(activeRoute.accessibilityScore)}% • ${activeRoute.estimatedTravelMinutes} min`
            )
            .addTo(group);

          for (const b of activeRoute.barriers) {
            L.marker([b.coordinates.latitude, b.coordinates.longitude], {
              icon: createBarrierPinIcon(b.isVerified),
            })
              .bindPopup(
                `<div style="min-width:190px;font-family:sans-serif;">
                  <p style="margin:0;font-weight:700;color:#991B1B;font-size:13px;">${escapeHtml(b.category)}</p>
                  <p style="margin:3px 0 0;color:#475569;font-size:12px;">${escapeHtml(b.description.slice(0, 120))}</p>
                  <p style="margin:5px 0 0;font-size:11px;font-weight:600;color:#0F172A;">${b.isVerified ? "Verified" : "Unverified (Pending)"} • ${Math.round(b.distanceFromRouteMeters)}m from route</p>
                </div>`
              )
              .addTo(group);
          }
        }
      }

      if (routeStart) {
        L.marker([routeStart.latitude, routeStart.longitude], {
          icon: createEndpointIcon("S", "#2563EB"),
        })
          .bindPopup("<strong>Start Point</strong>")
          .addTo(group);
      }

      if (routeDestination) {
        L.marker([routeDestination.latitude, routeDestination.longitude], {
          icon: createEndpointIcon("D", "#0E2238"),
        })
          .bindPopup("<strong>Destination Point</strong>")
          .addTo(group);
      }

      const currentZoom = map.getZoom();
      const shouldCluster =
        enableClustering && currentZoom < 15 && locations.length > 12;

      if (shouldCluster) {
        const cellSizePx = 64;
        const buckets = new Map<string, ClusterBucket>();

        for (const loc of locations) {
          const pt = map.project(
            [loc.coordinates.latitude, loc.coordinates.longitude],
            currentZoom
          );
          const key = `${Math.floor(pt.x / cellSizePx)}:${Math.floor(pt.y / cellSizePx)}`;
          const existing = buckets.get(key);
          if (existing) {
            existing.latSum += loc.coordinates.latitude;
            existing.lngSum += loc.coordinates.longitude;
            existing.items.push(loc);
          } else {
            buckets.set(key, {
              latSum: loc.coordinates.latitude,
              lngSum: loc.coordinates.longitude,
              items: [loc],
            });
          }
        }

        for (const bucket of buckets.values()) {
          if (bucket.items.length === 1) {
            addSingleLocationMarker(bucket.items[0], group);
          } else {
            const avgLat = bucket.latSum / bucket.items.length;
            const avgLng = bucket.lngSum / bucket.items.length;
            const clusterMarker = L.marker([avgLat, avgLng], {
              icon: createClusterIcon(bucket.items.length),
            });
            clusterMarker.on("click", () => {
              map.setView([avgLat, avgLng], Math.min(currentZoom + 2, 16), {
                animate: true,
              });
            });
            clusterMarker.addTo(group);
          }
        }
      } else {
        for (const loc of locations) {
          addSingleLocationMarker(loc, group);
        }
      }

      for (const barrier of barriers) {
        const marker = L.marker(
          [barrier.coordinates.latitude, barrier.coordinates.longitude],
          { icon: createBarrierPinIcon(barrier.isVerified) }
        );
        marker.bindPopup(
          `<div style="min-width:180px;font-family:sans-serif;">
            <p style="margin:0;font-weight:700;color:#991B1B;font-size:13px;">${escapeHtml(barrier.category)}</p>
            <p style="margin:4px 0 0;color:#475569;font-size:12px;">${escapeHtml(barrier.description.slice(0, 110))}</p>
            <p style="margin:6px 0 0;font-size:11px;font-weight:600;color:#0F172A;">Status: ${escapeHtml(barrier.status)}</p>
          </div>`
        );
        marker.on("click", () => {
          onSelectBarrierRef.current?.(barrier);
        });
        marker.addTo(group);
      }
    };

    function addSingleLocationMarker(loc: ILocation, targetGroup: L.LayerGroup) {
      const marker = L.marker(
        [loc.coordinates.latitude, loc.coordinates.longitude],
        {
          icon: createLocationPinIcon(loc, loc.id === selectedLocationId),
        }
      );

      marker.bindPopup(
        `<div style="min-width:200px;font-family:sans-serif;">
          <p style="margin:0;font-weight:800;color:#0F172A;font-size:13px;">${escapeHtml(loc.name)}</p>
          <p style="margin:2px 0 0;color:#0A5C4A;font-weight:600;font-size:11px;">${escapeHtml(loc.category)} • Score ${Math.round(loc.accessibilityScore)}%</p>
          <p style="margin:4px 0 8px;color:#475569;font-size:12px;">${escapeHtml(loc.address)}</p>
          <a href="/locations/${encodeURIComponent(loc.id)}" style="display:inline-block;background:#0A3B3F;color:#ffffff;padding:5px 10px;border-radius:9999px;font-size:11px;font-weight:700;text-decoration:none;">View Details</a>
        </div>`
      );

      marker.on("click", () => {
        onSelectLocationRef.current?.(loc);
      });

      marker.addTo(targetGroup);
    }

    renderMarkers();
    map.on("zoomend moveend", renderMarkers);
    return () => {
      map.off("zoomend moveend", renderMarkers);
    };
  }, [
    locations,
    barriers,
    routeOptions,
    selectedRouteId,
    routeStart,
    routeDestination,
    enableClustering,
    userPosition,
    selectedLocationId,
  ]);

  return (
    <div
      ref={containerRef}
      aria-label="Interactive Accessibility Map"
      className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs ${heightClassName}`}
    />
  );
}
