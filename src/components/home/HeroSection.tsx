"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  Search,
  ChevronDown,
  Accessibility,
} from "lucide-react";

import { ALL_LOCATION_CATEGORIES } from "@/types/api";

const CATEGORIES = ["All Categories", ...ALL_LOCATION_CATEGORIES] as const;

const POPULAR_SEARCHES = [
  { label: "Parks", category: "Parks" },
  { label: "Public Buildings", category: "Public Buildings" },
  { label: "Community Centers", category: "Community Centers" },
  { label: "Metro Stations", category: "Transportation Facilities" },
] as const;

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All Categories");
  const [imgError, setImgError] = useState(false);

  const navigateToExplore = (searchText: string, selectedCategory: string) => {
    const params = new URLSearchParams();
    if (searchText.trim()) {
      params.set("q", searchText.trim());
    }
    if (selectedCategory && selectedCategory !== "All Categories") {
      params.set("category", selectedCategory);
    }
    const qs = params.toString();
    router.push(qs ? `/explore?${qs}` : "/explore");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToExplore(query, category);
  };

  const handlePopularClick = (label: string, mappedCategory: string) => {
    setQuery(label);
    setCategory(mappedCategory);
    navigateToExplore(label, mappedCategory);
  };

  return (
    <section
      aria-label="Hero Search and Overview"
      className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-br from-[#F4FAF8] via-[#ECF7F4] to-[#DCEEF6]"
    >
      {/* Decorative curved accent band */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 right-[26%] hidden h-[140%] w-28 -rotate-12 rounded-full bg-gradient-to-b from-[#0E7C66]/25 via-[#0A5C4A]/15 to-transparent lg:block"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-16 xl:px-8">
        {/* Left Column: Badge, Headline, Search Bar & Popular Chips */}
        <div className="relative z-10 lg:col-span-7">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/15 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#0A5C4A] shadow-2xs sm:text-sm">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Advanced Urban Accessibility Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl xl:text-[56px] xl:leading-[1.1]">
            Navigate a More Accessible City with{" "}
            <span className="text-[#0A5C4A]">AccessPath</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Discover accessible places, find barrier-free routes, and help build
            a more inclusive urban environment for all.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSubmit}
            className="mt-7 flex flex-col gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-md sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
          >
            {/* Location / Place Input */}
            <div className="flex flex-1 items-center gap-2.5 px-3 py-1.5">
              <MapPin className="h-5 w-5 shrink-0 text-[#0A5C4A]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for accessible places..."
                aria-label="Search for accessible places"
                className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-[15px]"
              />
            </div>

            {/* Divider on Desktop */}
            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

            {/* Category Select */}
            <div className="relative flex items-center px-3 py-1.5 sm:w-48">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Select location category"
                className="w-full cursor-pointer appearance-none bg-transparent pr-7 text-sm font-semibold text-slate-700 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0A3B3F] px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#072B2E] sm:rounded-full sm:py-3"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Popular Searches */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-slate-700">
              Popular Searches:
            </span>
            {POPULAR_SEARCHES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handlePopularClick(item.label, item.category)}
                className="cursor-pointer rounded-full border border-slate-300/80 bg-white/85 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-[#0A5C4A] hover:bg-white hover:text-[#0A5C4A]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Accessible Walkway Scene & Callout */}
        <div className="relative z-10 lg:col-span-5">
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-b from-sky-200/70 via-sky-100/60 to-emerald-100/70 shadow-lg">
            {!imgError ? (
              <img
                src="/images/hero-wheelchair-walkway.jpg"
                alt="Wheelchair user navigating a smooth accessible urban walkway with city skyline"
                onError={() => setImgError(true)}
                className="h-80 w-full object-cover object-center sm:h-96 lg:h-[420px]"
              />
            ) : (
              /* Clean accessible urban walkway visual */
              <div className="relative flex h-80 w-full flex-col justify-between bg-gradient-to-br from-sky-200 via-teal-100 to-emerald-200 p-6 sm:h-96 lg:h-[420px]">
                {/* Stylized City Skyline */}
                <div className="mt-6 flex items-end justify-center gap-2 opacity-40">
                  <div className="h-20 w-8 rounded-t bg-slate-600" />
                  <div className="h-32 w-10 rounded-t bg-slate-700" />
                  <div className="h-24 w-7 rounded-t bg-slate-600" />
                  <div className="h-36 w-9 rounded-t bg-slate-800" />
                  <div className="h-16 w-8 rounded-t bg-slate-600" />
                </div>

                {/* Accessible Ramp & Mobility Badge */}
                <div className="rounded-2xl border border-white/80 bg-white/90 p-4 backdrop-blur-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A3B3F] text-white">
                      <Accessibility className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Barrier-Free Walkways &amp; Ramps
                      </p>
                      <p className="text-xs text-slate-600">
                        Verified step-free routes, curb ramps, and accessible transit hubs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top-Right Handwritten-Style Callout */}
            <div className="pointer-events-none absolute top-4 right-4 rounded-xl bg-white/80 px-3.5 py-2 text-right shadow-2xs backdrop-blur-xs sm:top-5 sm:right-5">
              <p className="font-serif text-base font-semibold italic leading-snug text-[#0A3B3F] sm:text-lg">
                Accessible City,
                <br />
                Inclusive Community
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}