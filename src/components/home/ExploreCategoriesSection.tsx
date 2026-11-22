"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryCardItem {
  id: string;
  label: string;
  categoryQuery: string;
  icon: React.ReactNode;
}

const ACCESSIBLE_CATEGORIES: CategoryCardItem[] = [
  {
    id: "public-buildings",
    label: "Public Buildings",
    categoryQuery: "Public Buildings",
    icon: (
      <svg
        viewBox="0 0 48 48"
        className="h-11 w-11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Side Wings */}
        <rect x="8" y="21" width="8" height="19" rx="1" fill="#0E4A5C" />
        <rect x="32" y="21" width="8" height="19" rx="1" fill="#0E4A5C" />
        {/* Center Tower */}
        <path d="M16 14L24 8L32 14V40H16V14Z" fill="#0A3B3F" />
        <path
          d="M14 15L24 7.5L34 15"
          stroke="#0A3B3F"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Windows */}
        <rect x="19" y="17" width="3.5" height="4" rx="0.6" fill="#FFFFFF" />
        <rect x="25.5" y="17" width="3.5" height="4" rx="0.6" fill="#FFFFFF" />
        <rect x="19" y="24" width="3.5" height="4" rx="0.6" fill="#FFFFFF" />
        <rect x="25.5" y="24" width="3.5" height="4" rx="0.6" fill="#FFFFFF" />
        <rect x="10.5" y="25" width="3" height="3.5" rx="0.5" fill="#FFFFFF" />
        <rect x="10.5" y="31" width="3" height="3.5" rx="0.5" fill="#FFFFFF" />
        <rect x="34.5" y="25" width="3" height="3.5" rx="0.5" fill="#FFFFFF" />
        <rect x="34.5" y="31" width="3" height="3.5" rx="0.5" fill="#FFFFFF" />
        {/* Entrance Door */}
        <path
          d="M21.5 40V33.5C21.5 32.1 22.6 31 24 31C25.4 31 26.5 32.1 26.5 33.5V40H21.5Z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    id: "parks",
    label: "Parks",
    categoryQuery: "Parks",
    icon: (
      <svg
        viewBox="0 0 48 48"
        className="h-11 w-11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Tree Canopy */}
        <circle cx="24" cy="16" r="8.5" fill="#138A63" />
        <circle cx="17.5" cy="21" r="6.5" fill="#199B6E" />
        <circle cx="30.5" cy="21" r="6.5" fill="#0F7654" />
        {/* Trunk & Branches */}
        <path
          d="M24 21V39M24 27L19 23M24 25L29 21.5"
          stroke="#0A3B3F"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M19 39H29"
          stroke="#0A3B3F"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "educational-institutions",
    label: "Educational\nInstitutions",
    categoryQuery: "Educational Institutions",
    icon: (
      <svg
        viewBox="0 0 48 48"
        className="h-11 w-11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Mortarboard Top */}
        <path d="M24 11L6 19.5L24 28L42 19.5L24 11Z" fill="#0A3B3F" />
        {/* Cap Base */}
        <path
          d="M14 24.5V31.5C14 34.5 18.5 37 24 37C29.5 37 34 34.5 34 31.5V24.5L24 29.2L14 24.5Z"
          fill="#0E4A5C"
        />
        {/* Tassel */}
        <path
          d="M39 21V31"
          stroke="#0A3B3F"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="39" cy="32" r="2" fill="#0A3B3F" />
      </svg>
    ),
  },
  {
    id: "transportation-facilities",
    label: "Transportation\nFacilities",
    categoryQuery: "Transportation Facilities",
    icon: (
      <svg
        viewBox="0 0 48 48"
        className="h-11 w-11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Transit Vehicle Body */}
        <rect x="12" y="9" width="24" height="27" rx="5" fill="#0A3B3F" />
        {/* Route Display Bar */}
        <rect x="18" y="12" width="12" height="2.2" rx="1.1" fill="#A7F3D0" />
        {/* Windshield */}
        <rect x="15" y="16" width="18" height="10" rx="2" fill="#FFFFFF" />
        {/* Headlights */}
        <circle cx="17" cy="30.5" r="2" fill="#FFFFFF" />
        <circle cx="31" cy="30.5" r="2" fill="#FFFFFF" />
        {/* Wheels */}
        <rect x="15" y="36" width="4" height="4" rx="1.2" fill="#0A3B3F" />
        <rect x="29" y="36" width="4" height="4" rx="1.2" fill="#0A3B3F" />
      </svg>
    ),
  },
  {
    id: "government-offices",
    label: "Government Offices",
    categoryQuery: "Government Offices",
    icon: (
      <svg
        viewBox="0 0 48 48"
        className="h-11 w-11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Roof Pediment */}
        <path d="M24 9L8 18H40L24 9Z" fill="#0A3B3F" />
        <circle cx="24" cy="14.5" r="1.4" fill="#FFFFFF" />
        {/* Architrave */}
        <rect x="10" y="19.5" width="28" height="2.2" rx="0.8" fill="#0E4A5C" />
        {/* Classical Pillars */}
        <rect x="13" y="23" width="2.8" height="11" rx="0.6" fill="#0A3B3F" />
        <rect x="19.4" y="23" width="2.8" height="11" rx="0.6" fill="#0A3B3F" />
        <rect x="25.8" y="23" width="2.8" height="11" rx="0.6" fill="#0A3B3F" />
        <rect x="32.2" y="23" width="2.8" height="11" rx="0.6" fill="#0A3B3F" />
        {/* Stepped Base */}
        <rect x="10" y="35.2" width="28" height="2.2" rx="0.8" fill="#0E4A5C" />
        <rect x="8" y="38.5" width="32" height="2.4" rx="1" fill="#0A3B3F" />
      </svg>
    ),
  },
  {
    id: "community-centers",
    label: "Community Centers",
    categoryQuery: "Community Centers",
    icon: (
      <svg
        viewBox="0 0 48 48"
        className="h-11 w-11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Left Person */}
        <circle cx="14.5" cy="17.5" r="4.2" fill="#0E4A5C" />
        <path
          d="M7.5 34.5C7.5 29.8 10.6 26.8 14.5 26.8C16.2 26.8 17.8 27.4 19 28.4"
          fill="#0E4A5C"
        />
        <path
          d="M7.5 34.5C7.5 29.8 10.6 26.8 14.5 26.8C16.5 26.8 18.2 27.6 19.4 28.9L17 34.5H7.5Z"
          fill="#0E4A5C"
        />
        {/* Right Person */}
        <circle cx="33.5" cy="17.5" r="4.2" fill="#0E4A5C" />
        <path
          d="M40.5 34.5C40.5 29.8 37.4 26.8 33.5 26.8C31.5 26.8 29.8 27.6 28.6 28.9L31 34.5H40.5Z"
          fill="#0E4A5C"
        />
        {/* Center Person */}
        <circle cx="24" cy="14.5" r="5.2" fill="#0A3B3F" />
        <path
          d="M14.5 36.5C14.5 30.8 18.7 27 24 27C29.3 27 33.5 30.8 33.5 36.5H14.5Z"
          fill="#0A3B3F"
        />
      </svg>
    ),
  },
];

export default function ExploreCategoriesSection() {
  return (
    <section
      aria-label="Discover Accessible Places by Category"
      className="bg-white py-10 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Row: Badge + Title on Left, Browse All Categories Link on Right */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="inline-block rounded-full bg-[#DDF2EC] px-3.5 py-1 text-xs font-bold text-[#0A5C4A]">
              Explore Categories
            </span>
            <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
              Discover Accessible Places
            </h2>
          </div>

          <Link
            href="/explore"
            className="group inline-flex items-center gap-1.5 self-start text-xs font-bold text-[#0F172A] underline decoration-slate-400 underline-offset-4 transition-colors hover:text-[#0A5C4A] hover:decoration-[#0A5C4A] sm:self-end sm:text-sm"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {ACCESSIBLE_CATEGORIES.map((item) => (
            <Link
              key={item.id}
              href={`/explore?category=${encodeURIComponent(item.categoryQuery)}`}
              className="group relative flex flex-col items-center justify-between rounded-2xl border border-slate-200/90 bg-white px-4 pt-6 pb-4 text-center shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0A5C4A]/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3B3F]"
            >
              {/* Category Illustration */}
              <div className="mb-3 flex h-12 items-center justify-center transition-transform duration-200 group-hover:scale-105">
                {item.icon}
              </div>

              {/* Label + Bottom-Right Circular Arrow */}
              <div className="flex w-full items-center justify-center gap-2 pt-1">
                <span className="whitespace-pre-line text-xs font-bold leading-snug text-[#0F172A] group-hover:text-[#0A3B3F] sm:text-[13px]">
                  {item.label}
                </span>

                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEF2F6] text-[#0F172A] transition-colors group-hover:bg-[#0A3B3F] group-hover:text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}