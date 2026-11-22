"use client";

import React from "react";

interface StatItem {
  id: string;
  value: string;
  label: string;
  icon: React.ReactNode;
}

const PLATFORM_STATS: StatItem[] = [
  {
    id: "locations",
    value: "10K+",
    label: "Accessible Locations",
    icon: (
      <svg
        viewBox="0 0 36 36"
        className="h-8 w-8 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M18 4C11.9 4 7 8.9 7 15C7 22.9 18 32 18 32C18 32 29 22.9 29 15C29 8.9 24.1 4 18 4Z"
          fill="#0E6F64"
        />
        <circle cx="18" cy="14.8" r="4.2" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: "reports",
    value: "50K+",
    label: "Barrier Reports",
    icon: (
      <svg
        viewBox="0 0 36 36"
        className="h-8 w-8 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M9 6.5C9 5.4 9.9 4.5 11 4.5H21L27 10.5V29.5C27 30.6 26.1 31.5 25 31.5H11C9.9 31.5 9 30.6 9 29.5V6.5Z"
          fill="#0E6F64"
        />
        <path d="M21 4.5V10.5H27L21 4.5Z" fill="#5BB5A6" />
        <rect x="13" y="15" width="10" height="2" rx="1" fill="#FFFFFF" />
        <rect x="13" y="19.5" width="10" height="2" rx="1" fill="#FFFFFF" />
        <rect x="13" y="24" width="6.5" height="2" rx="1" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: "feedback",
    value: "100K+",
    label: "Community Feedback",
    icon: (
      <svg
        viewBox="0 0 40 36"
        className="h-8 w-9 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Front Person */}
        <circle cx="15" cy="12" r="4.5" fill="#0E6F64" />
        <path
          d="M6.5 28C6.5 22.8 10.2 19.5 15 19.5C19.8 19.5 23.5 22.8 23.5 28H6.5Z"
          fill="#0E6F64"
        />
        {/* Second Person */}
        <circle cx="26.5" cy="13.5" r="3.8" fill="#178577" />
        <path
          d="M22.2 27.5C22.7 23.5 24.8 20.8 28 20.8C31.5 20.8 34 23.5 34 27.5H22.2Z"
          fill="#178577"
        />
      </svg>
    ),
  },
  {
    id: "verified",
    value: "98%",
    label: "Verified Information",
    icon: (
      <svg
        viewBox="0 0 36 36"
        className="h-8 w-8 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M18 4L7 8.5V16.8C7 24.1 11.7 30.7 18 32.8C24.3 30.7 29 24.1 29 16.8V8.5L18 4Z"
          fill="#0E6F64"
        />
        <path
          d="M13.5 18.2L16.6 21.3L23 14.5"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function StatsSection() {
  return (
    <section
      aria-label="Platform Impact and Statistics"
      className="bg-white py-5 sm:py-7"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 divide-y divide-slate-300/80 rounded-2xl bg-[#EEF2F5] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {PLATFORM_STATS.map((stat) => (
            <div
              key={stat.id}
              className="flex items-center justify-center gap-3.5 px-6 py-6 sm:py-7"
            >
              {stat.icon}
              <div className="text-left">
                <p className="text-2xl font-extrabold leading-none tracking-tight text-[#0A3B3F] sm:text-[26px]">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-600 sm:text-[13px]">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}