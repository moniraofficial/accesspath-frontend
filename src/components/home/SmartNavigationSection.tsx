"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Plus,
  Minus,
  Accessibility,
  MapPin,
} from "lucide-react";

const ROUTE_HIGHLIGHTS = [
  "Accessibility-based route scoring",
  "Real-time barrier alerts",
  "Multiple route options",
] as const;

export default function SmartNavigationSection() {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(125, prev + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(85, prev - 10));
  };

  return (
    <section
      aria-label="Smart Accessible Route Navigation"
      className="bg-white py-10 sm:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-7">
          {/* Left: Interactive Route Preview Map Card */}
          <div className="lg:col-span-6">
            <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-slate-200 bg-[#EEF1EC] shadow-sm sm:h-96">
              {/* Scalable Street Map Canvas */}
              <div
                style={{ transform: `scale(${zoomLevel / 100})` }}
                className="relative h-full w-full origin-center transition-transform duration-200"
              >
                {/* Urban Blocks & Parks */}
                <div className="absolute inset-0 bg-[#F4F5F2]" />
                <div className="absolute top-6 left-8 h-20 w-24 rounded-md bg-[#DFEAD9]" />
                <div className="absolute top-28 right-12 h-24 w-28 rounded-md bg-[#DFEAD9]" />
                <div className="absolute bottom-8 left-20 h-20 w-28 rounded-md bg-[#E3ECDF]" />

                {/* Secondary Roads */}
                <div className="absolute top-14 inset-x-0 h-2 bg-white shadow-2xs" />
                <div className="absolute top-36 inset-x-0 h-2.5 bg-white shadow-2xs" />
                <div className="absolute bottom-20 inset-x-0 h-2 bg-white shadow-2xs" />
                <div className="absolute inset-y-0 left-16 w-2 bg-white shadow-2xs" />
                <div className="absolute inset-y-0 left-44 w-2.5 bg-white shadow-2xs" />
                <div className="absolute inset-y-0 right-24 w-2 bg-white shadow-2xs" />

                {/* Diagonal / Major Avenue Accent */}
                <div
                  aria-hidden="true"
                  className="absolute -top-6 left-12 h-[130%] w-4 -rotate-12 bg-[#FCE8A6]/85"
                />

                {/* Accessible Route Path & Pins (SVG) */}
                <svg
                  viewBox="0 0 520 340"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Accessible route path from start to destination"
                >
                  {/* Route Shadow */}
                  <polyline
                    points="118,162 152,148 188,166 226,124 268,144 304,174 334,162 358,196 382,186"
                    stroke="#1D4ED8"
                    strokeOpacity="0.22"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Primary Blue Route Line */}
                  <polyline
                    points="118,162 152,148 188,166 226,124 268,144 304,174 334,162 358,196 382,186"
                    stroke="#2563EB"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Start Pin (Wheelchair Origin) */}
                  <circle
                    cx="112"
                    cy="160"
                    r="18"
                    fill="#2563EB"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                  />
                  <circle cx="114" cy="153.5" r="2.2" fill="#FFFFFF" />
                  <path
                    d="M111 157.5H115L113.2 162.5H117.5L119 166"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M108.5 162A4.2 4.2 0 1 0 112.7 166.2"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Destination Pin (Red Marker) */}
                  <path
                    d="M382 158C374.5 158 368.5 164 368.5 171.5C368.5 181.5 382 194 382 194C382 194 395.5 181.5 395.5 171.5C395.5 164 389.5 158 382 158Z"
                    fill="#DC2626"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  <circle cx="382" cy="171" r="4.2" fill="#FFFFFF" />
                </svg>

                {/* Route Info Callout Card */}
                <div className="absolute top-12 right-8 z-10 w-48 rounded-xl border border-slate-200/90 bg-white/95 p-3.5 shadow-md backdrop-blur-xs sm:top-14 sm:right-12 sm:w-52">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Accessible Route
                    </span>
                    <CheckCircle2 className="h-4 w-4 shrink-0 fill-emerald-600 text-white" />
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    1.8 km • 12 min
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#0A5C4A]">
                    Score: 95%
                  </p>
                </div>
              </div>

              {/* Bottom-Left Wheelchair Friendly Route Pill */}
              <div className="absolute bottom-3.5 left-3.5 z-10 inline-flex items-center gap-2 rounded-lg border border-slate-200/90 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 fill-emerald-600 text-white" />
                <span>Wheelchair Friendly Route</span>
              </div>

              {/* Bottom-Right Zoom Controls */}
              <div
                aria-label="Map zoom controls"
                className="absolute right-3.5 bottom-3.5 z-10 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs"
              >
                <button
                  type="button"
                  onClick={handleZoomIn}
                  aria-label="Zoom in map"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center border-b border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#0A3B3F]"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  aria-label="Zoom out map"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#0A3B3F]"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Middle: Smart Navigation Copy & CTA */}
          <div className="lg:col-span-4">
            <span className="inline-block rounded-full bg-[#DDF2EC] px-3.5 py-1 text-xs font-bold text-[#0A5C4A]">
              Smart Navigation
            </span>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-[34px] sm:leading-[1.18]">
              Find the Best
              <br />
              Accessible Routes
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Get route recommendations that consider ramps, elevators, and avoid
              accessibility barriers.
            </p>

            <ul className="mt-4 space-y-2.5">
              {ROUTE_HIGHLIGHTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 sm:text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 fill-emerald-600 text-white" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link
                href="/route-planner"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0A3B3F] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#072B2E]"
              >
                <span>Plan Your Route</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: Accessible Urban Illustration Card */}
          <div className="lg:col-span-2">
            <div className="relative mx-auto flex h-72 w-full max-w-[260px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-[#DCEEF7] via-[#EBF5FA] to-[#DCEBE4] p-4 shadow-xs sm:h-80 lg:h-96 lg:max-w-none">
              {/* Background Skyline */}
              <div
                aria-hidden="true"
                className="mt-4 flex items-end justify-center gap-1.5 opacity-70"
              >
                <div className="h-20 w-7 rounded-t-sm bg-[#9DBEC9]" />
                <div className="h-32 w-8 rounded-t-sm bg-[#86AEC0]" />
                <div className="h-24 w-6 rounded-t-sm bg-[#A6C5D1]" />
                <div className="h-28 w-8 rounded-t-sm bg-[#7FA4B6]" />
              </div>

              {/* Top Location Pin Badge */}
              <div className="pointer-events-none absolute top-7 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#15803D] shadow-xs">
                <MapPin className="h-5 w-5 fill-[#16A34A] text-white" />
              </div>

              {/* Trees & Smooth Walkway Foreground */}
              <div className="relative z-10 mt-auto">
                <div className="mb-2 flex items-end justify-between px-1">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-[#3A8E6B]" />
                    <div className="h-3 w-1.5 bg-[#5C4638]" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-[#2F7D5D]" />
                    <div className="h-3.5 w-1.5 bg-[#5C4638]" />
                  </div>
                </div>

                {/* Wheelchair Figure on Accessible Path */}
                <div className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 backdrop-blur-xs">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A3B3F] text-white">
                    <Accessibility className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold text-[#0A3B3F]">
                    Step-Free Path
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}