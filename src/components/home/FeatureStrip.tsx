"use client";

import React from "react";
import Link from "next/link";

interface FeatureItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const FEATURES: FeatureItem[] = [
  {
    id: "directory",
    label: "Accessible\nLocation Directory",
    href: "/explore",
    icon: (
      <svg
        viewBox="0 0 40 36"
        className="h-7 w-8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4 11L14 7L26 12L36 8V27L26 31L14 26L4 30V11Z"
          fill="#D4ECE4"
          stroke="#6AA896"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M14 7V26M26 12V31"
          stroke="#6AA896"
          strokeWidth="1.4"
          strokeDasharray="2 2"
        />
        <path
          d="M20 4C15.8 4 12.5 7.3 12.5 11.4C12.5 16.8 20 23.5 20 23.5C20 23.5 27.5 16.8 27.5 11.4C27.5 7.3 24.2 4 20 4Z"
          fill="#0E7C66"
        />
        <circle cx="20" cy="11.2" r="2.8" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: "route-planning",
    label: "Accessibility-Aware\nRoute Planning",
    href: "/route-planner",
    icon: (
      <svg
        viewBox="0 0 44 36"
        className="h-7 w-9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M11 15C11 21 20 20 22 15C24 10 33 10 33 18C33 24 25 26 20 26"
          stroke="#0E7C66"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="3.5 3.5"
        />
        <circle cx="11" cy="10.5" r="4.5" fill="#0A3B3F" />
        <circle cx="11" cy="10.5" r="1.6" fill="#FFFFFF" />
        <path
          d="M11 15L11 17.5"
          stroke="#0A3B3F"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M33 9C30.5 9 28.5 11 28.5 13.5C28.5 16.8 33 20.5 33 20.5C33 20.5 37.5 16.8 37.5 13.5C37.5 11 35.5 9 33 9Z"
          fill="#0A3B3F"
        />
        <circle cx="33" cy="13.4" r="1.5" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: "community",
    label: "Community\nContributions",
    href: "/submit-location",
    icon: (
      <svg
        viewBox="0 0 44 36"
        className="h-7 w-9"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="13.5" cy="12.5" r="3.4" fill="#1E5266" />
        <path
          d="M7.5 24.5C7.5 20.8 10.2 18.5 13.5 18.5C15.1 18.5 16.5 19.1 17.5 20.1"
          stroke="#1E5266"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="30.5" cy="12.5" r="3.4" fill="#1E5266" />
        <path
          d="M26.5 20.1C27.5 19.1 28.9 18.5 30.5 18.5C33.8 18.5 36.5 20.8 36.5 24.5"
          stroke="#1E5266"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="22" cy="10.5" r="4.2" fill="#0A3B3F" />
        <path
          d="M14.5 25.5C14.5 20.8 17.9 17.8 22 17.8C26.1 17.8 29.5 20.8 29.5 25.5H14.5Z"
          fill="#0A3B3F"
        />
      </svg>
    ),
  },
  {
    id: "verified",
    label: "Verified Information",
    href: "/reports",
    icon: (
      <svg
        viewBox="0 0 36 36"
        className="h-7 w-8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M18 4L7 8.5V16.8C7 24.1 11.7 30.7 18 32.8C24.3 30.7 29 24.1 29 16.8V8.5L18 4Z"
          fill="#0A3B3F"
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
  {
    id: "analytics",
    label: "Real-Time Analytics",
    href: "/admin",
    icon: (
      <svg
        viewBox="0 0 36 36"
        className="h-7 w-8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="8" y="18" width="5" height="10" rx="1.2" fill="#2B8A78" />
        <rect x="15.5" y="12" width="5" height="16" rx="1.2" fill="#146C5B" />
        <rect x="23" y="6" width="5" height="22" rx="1.2" fill="#0A3B3F" />
        <path
          d="M5 30.5H31"
          stroke="#0A3B3F"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function FeatureStrip() {
  return (
    <section
      aria-label="Key Platform Highlights"
      className="bg-white py-5 sm:py-6"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 divide-y divide-slate-200/90 rounded-2xl bg-[#EEF2F5] sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
          {FEATURES.map((item, idx) => (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex flex-col items-center justify-center px-4 py-5 text-center transition-colors hover:bg-[#E4EBF0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3B3F] ${
                idx === FEATURES.length - 1 && FEATURES.length % 2 === 1
                  ? "col-span-2 sm:col-span-1"
                  : ""
              } ${
                idx === 0
                  ? "rounded-t-2xl sm:rounded-tl-2xl sm:rounded-tr-none lg:rounded-l-2xl lg:rounded-tr-none"
                  : ""
              } ${
                idx === FEATURES.length - 1
                  ? "rounded-b-2xl sm:rounded-br-2xl lg:rounded-r-2xl lg:rounded-bl-none"
                  : ""
              }`}
            >
              <div className="mb-2.5 flex h-9 items-center justify-center transition-transform duration-200 group-hover:-translate-y-0.5">
                {item.icon}
              </div>
              <span className="whitespace-pre-line text-xs font-bold leading-snug text-[#0F172A] group-hover:text-[#0A3B3F] sm:text-[13px]">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}