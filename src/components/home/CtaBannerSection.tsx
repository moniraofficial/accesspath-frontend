"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaBannerSection() {
  return (
    <section
      aria-label="Join the AccessPath Community"
      className="bg-white pt-4 pb-12 sm:pt-6 sm:pb-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2D8D7E] via-[#11444E] to-[#135458] px-6 py-8 shadow-md sm:px-10 sm:py-9 lg:px-12">
          {/* Left City Skyline Silhouette */}
          <svg
            aria-hidden="true"
            viewBox="0 0 380 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute bottom-0 left-0 h-32 w-auto opacity-85 sm:h-40"
          >
            {/* Curved Hill Ground */}
            <path
              d="M-10 150C45 112 165 108 265 150H-10Z"
              fill="#0B333C"
            />
            {/* Skyline Buildings */}
            <rect x="26" y="84" width="14" height="52" fill="#0D3C46" />
            <rect x="44" y="64" width="18" height="68" fill="#0A333C" />
            <path d="M53 46L53 64" stroke="#0A333C" strokeWidth="2.5" />
            <rect x="66" y="76" width="15" height="54" fill="#0F4651" />
            <rect x="85" y="50" width="22" height="78" fill="#092E37" />
            <rect x="111" y="62" width="18" height="66" fill="#0D3C46" />
            <rect x="133" y="42" width="24" height="88" fill="#082A32" />
            <rect x="161" y="58" width="19" height="74" fill="#0D3C46" />
            <rect x="184" y="72" width="16" height="64" fill="#0A333C" />
            <rect x="204" y="86" width="15" height="54" fill="#0E444F" />

            {/* Subtle Lit Windows */}
            <g fill="#5EEAD4" fillOpacity="0.45">
              <rect x="49" y="72" width="2.2" height="2.2" />
              <rect x="55" y="72" width="2.2" height="2.2" />
              <rect x="49" y="80" width="2.2" height="2.2" />
              <rect x="90" y="58" width="2.5" height="2.5" />
              <rect x="97" y="58" width="2.5" height="2.5" />
              <rect x="90" y="66" width="2.5" height="2.5" />
              <rect x="97" y="66" width="2.5" height="2.5" />
              <rect x="90" y="74" width="2.5" height="2.5" />
              <rect x="139" y="50" width="2.5" height="2.5" />
              <rect x="147" y="50" width="2.5" height="2.5" />
              <rect x="139" y="58" width="2.5" height="2.5" />
              <rect x="147" y="58" width="2.5" height="2.5" />
              <rect x="139" y="66" width="2.5" height="2.5" />
              <rect x="166" y="66" width="2.2" height="2.2" />
              <rect x="172" y="66" width="2.2" height="2.2" />
              <rect x="166" y="74" width="2.2" height="2.2" />
            </g>
          </svg>

          {/* Right Decorative Heart + Leaves Emblem */}
          <svg
            aria-hidden="true"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute top-1/2 right-4 hidden h-28 w-28 -translate-y-1/2 opacity-30 sm:block lg:right-6"
          >
            {/* Heart Outline */}
            <path
              d="M60 66C60 66 36 50 36 33.5C36 25.5 42.2 20 49.5 20C54.2 20 58.1 22.4 60 26C61.9 22.4 65.8 20 70.5 20C77.8 20 84 25.5 84 33.5C84 50 60 66 60 66Z"
              stroke="#6EE7B7"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Left & Right Supportive Hands / Leaves */}
            <path
              d="M28 74C28 63 39 58 54 68C58 71 60 76 60 84C45 84 28 82 28 74Z"
              fill="#5EEAD4"
            />
            <path
              d="M92 74C92 63 81 58 66 68C62 71 60 76 60 84C75 84 92 82 92 74Z"
              fill="#34D399"
            />
          </svg>

          {/* Foreground Content */}
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center lg:pl-56 xl:pl-64">
            <div className="max-w-xl text-left">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-[28px] sm:leading-tight">
                Together for an Accessible Tomorrow
              </h2>
              <p className="mt-1.5 text-sm font-medium text-teal-50/90 sm:text-[15px]">
                Join our community and help make cities more accessible for
                everyone.
              </p>
            </div>

            <div className="shrink-0 lg:pr-14">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0A3B3F] shadow-sm transition-all duration-200 hover:bg-teal-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}