"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { IPaginationMeta } from "@/types/api";

interface PaginationProps {
  meta: IPaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  meta,
  onPageChange,
  className = "",
}: PaginationProps) {
  const { page, totalPages, totalRecords, limit, hasPrevPage, hasNextPage } =
    meta;

  if (totalRecords === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalRecords);

  const pages: number[] = [];
  const windowSize = 2;
  const minPage = Math.max(1, page - windowSize);
  const maxPage = Math.min(totalPages, page + windowSize);
  for (let p = minPage; p <= maxPage; p++) {
    pages.push(p);
  }

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-2xs sm:flex-row sm:px-6 ${className}`}
    >
      <p className="text-xs font-medium text-slate-600 sm:text-sm">
        Showing <span className="font-bold text-[#0F172A]">{start}</span>–
        <span className="font-bold text-[#0F172A]">{end}</span> of{" "}
        <span className="font-bold text-[#0F172A]">
          {totalRecords.toLocaleString()}
        </span>{" "}
        results
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {minPage > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              1
            </button>
            {minPage > 2 && (
              <span className="px-1 text-xs text-slate-400">…</span>
            )}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-xs font-bold transition-colors ${
              p === page
                ? "bg-[#0A3B3F] text-white shadow-2xs"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        ))}

        {maxPage < totalPages && (
          <>
            {maxPage < totalPages - 1 && (
              <span className="px-1 text-xs text-slate-400">…</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
