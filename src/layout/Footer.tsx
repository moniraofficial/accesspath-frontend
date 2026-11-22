"use client";

import React from "react";
import Link from "next/link";

interface FooterLinkItem {
  label: string;
  href: string;
}

const FOOTER_LINKS: FooterLinkItem[] = [
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Help", href: "/help" },
];

export default function Footer() {
  return (
    <footer
      aria-label="Site Footer"
      className="w-full border-t border-slate-800 bg-[#0E2238] text-white"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        {/* Left: Brand Logo & Tagline */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 focus:outline-none"
          aria-label="AccessPath Home"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#168A72] bg-[#0B2D38] transition-transform duration-200 group-hover:scale-105">
            <svg
              viewBox="0 0 36 36"
              className="h-7 w-7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="18"
                cy="18"
                r="14.5"
                stroke="#168A72"
                strokeWidth="2.3"
                strokeDasharray="74 18"
              />
              <circle cx="19.5" cy="9.5" r="2.5" fill="#FFFFFF" />
              <path
                d="M15.5 14.5H21L18.5 21H24.5L26.5 26"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.5 20.5A5.5 5.5 0 1 0 18 26"
                stroke="#2DD4BF"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              AccessPath
            </span>
            <span className="text-[11px] font-medium text-slate-300 sm:text-xs">
              Navigate Freely. Live Independently.
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links with Vertical Dividers */}
        <nav
          aria-label="Footer Navigation"
          className="flex flex-wrap items-center justify-center gap-y-2 text-xs font-medium text-slate-200 sm:text-sm"
        >
          {FOOTER_LINKS.map((item, index) => (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className="px-3.5 py-1 transition-colors hover:text-teal-300"
              >
                {item.label}
              </Link>
              {index < FOOTER_LINKS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-px bg-slate-500/70"
                />
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Right: Social Icons + Copyright */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-7">
          {/* Social Links */}
          <div className="flex items-center gap-3.5">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AccessPath on Facebook"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#0E2238] transition-transform duration-150 hover:scale-110 hover:bg-teal-200"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
                aria-hidden="true"
              >
                <path d="M13.5 21v-8.2h2.7l.4-3.2h-3.1V7.6c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.5H7.7v3.2h2.7V21h3.1Z" />
              </svg>
            </a>

            {/* X (Twitter) */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AccessPath on X"
              className="flex h-7 w-7 items-center justify-center text-white transition-transform duration-150 hover:scale-110 hover:text-teal-300"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AccessPath on YouTube"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#0E2238] transition-transform duration-150 hover:scale-110 hover:bg-teal-200"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
                aria-hidden="true"
              >
                <path d="M10 15.5V8.5L16 12L10 15.5Z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AccessPath on LinkedIn"
              className="flex h-7 w-7 items-center justify-center rounded-xs bg-white text-[#0E2238] transition-transform duration-150 hover:scale-110 hover:bg-teal-200"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current"
                aria-hidden="true"
              >
                <path d="M6.94 8.5H4.1V19h2.84V8.5ZM5.52 4C4.56 4 3.8 4.76 3.8 5.7c0 .93.76 1.7 1.72 1.7.95 0 1.72-.77 1.72-1.7 0-.94-.77-1.7-1.72-1.7ZM20.2 12.9c0-3.02-1.61-4.43-3.76-4.43-1.73 0-2.51.95-2.94 1.62V8.5h-2.84c.04.88 0 10.5 0 10.5h2.84v-5.86c0-.31.02-.63.12-.85.25-.63.82-1.28 1.78-1.28 1.26 0 1.76.96 1.76 2.37V19h2.84v-6.1Z" />
              </svg>
            </a>
          </div>

          {/* Copyright Text */}
          <p className="text-center text-xs font-medium text-slate-300 sm:text-right">
            © 2025 AccessPath. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}