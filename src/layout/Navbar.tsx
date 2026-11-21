"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ChevronDown,
  Menu,
  X,
  MapPinPlus,
  AlertTriangle,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

const primaryNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Route Planner", href: "/route-planner" },
];

const secondaryNavItems: NavItem[] = [
  { label: "Reports", href: "/reports" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [contributeOpen, setContributeOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileContributeOpen, setMobileContributeOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setContributeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isContributeActive =
    pathname.startsWith("/submit-location") || pathname.startsWith("/report");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    setMobileMenuOpen(false);
    window.location.href = `/explore?q=${encodeURIComponent(trimmed)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Tagline */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 focus:outline-none"
          aria-label="AccessPath Home"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0A5C4A] bg-[#F2FBF8] text-[#0A3B3F] transition-transform duration-200 group-hover:scale-105">
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
                r="15"
                stroke="#0A5C4A"
                strokeWidth="2.2"
                strokeDasharray="78 18"
              />
              <circle cx="19.5" cy="9.5" r="2.5" fill="#0A3B3F" />
              <path
                d="M15.5 14.5H21L18.5 21H24.5L26.5 26"
                stroke="#0A3B3F"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.5 20.5A5.5 5.5 0 1 0 18 26"
                stroke="#0E7C66"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold tracking-tight text-[#0F172A] sm:text-2xl">
              Access<span className="text-[#0A3B3F]">Path</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 sm:text-xs">
              Navigate Freely. Live Independently.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden items-center gap-1 lg:flex xl:gap-2"
        >
          {primaryNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#0A3B3F] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100 hover:text-[#0A3B3F]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Contribute Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setContributeOpen((prev) => !prev)}
              aria-expanded={contributeOpen}
              aria-haspopup="menu"
              className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isContributeActive
                  ? "bg-[#0A3B3F] text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-[#0A3B3F]"
              }`}
            >
              <span>Contribute</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  contributeOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {contributeOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
              >
                <Link
                  href="/submit-location"
                  role="menuitem"
                  onClick={() => setContributeOpen(false)}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#F2FBF8]"
                >
                  <MapPinPlus className="mt-0.5 h-4 w-4 shrink-0 text-[#0A3B3F]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Submit New Location
                    </p>
                    <p className="text-xs text-slate-500">
                      Add an accessible place &amp; features
                    </p>
                  </div>
                </Link>

                <Link
                  href="/report"
                  role="menuitem"
                  onClick={() => setContributeOpen(false)}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#F2FBF8]"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#0A3B3F]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Report Barrier
                    </p>
                    <p className="text-xs text-slate-500">
                      Flag stairs, broken paths, or ramps
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {secondaryNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#0A3B3F] text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100 hover:text-[#0A3B3F]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Search, Login, Register */}
        <div className="hidden items-center gap-3 md:flex">
          {searchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 focus-within:border-[#0A3B3F] focus-within:bg-white"
            >
              <Search className="mr-2 h-4 w-4 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places..."
                aria-label="Search accessible places"
                className="w-36 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none lg:w-44"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                aria-label="Close search"
                className="ml-1 rounded-full p-0.5 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-100 hover:text-[#0A3B3F]"
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          <Link
            href="/login"
            className="rounded-full border border-[#0A3B3F]/40 bg-white px-5 py-2 text-sm font-semibold text-[#0A3B3F] transition-colors hover:border-[#0A3B3F] hover:bg-[#F2FBF8]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-[#0A3B3F] px-5 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#072B2E]"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-50"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accessible places..."
                aria-label="Search accessible places on mobile"
                className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A3B3F] focus:bg-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-[#0A3B3F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#072B2E]"
            >
              Go
            </button>
          </form>

          <div className="flex flex-col space-y-1">
            {[...primaryNavItems, ...secondaryNavItems].map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3.5 py-2.5 text-sm font-semibold ${
                    active
                      ? "bg-[#0A3B3F] text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setMobileContributeOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span>Contribute</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    mobileContributeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileContributeOpen && (
                <div className="mt-1 ml-3 flex flex-col space-y-1 border-l-2 border-[#0A3B3F]/20 pl-3">
                  <Link
                    href="/submit-location"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Submit New Location
                  </Link>
                  <Link
                    href="/report"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Report Barrier
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full border border-[#0A3B3F] py-2 text-center text-sm font-semibold text-[#0A3B3F] hover:bg-[#F2FBF8]"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full bg-[#0A3B3F] py-2 text-center text-sm font-semibold text-white hover:bg-[#072B2E]"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}