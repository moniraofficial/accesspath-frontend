import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <section className="border-b border-slate-200/80 bg-gradient-to-r from-[#0E2238] via-[#0A3B3F] to-[#0E5650] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-medium text-teal-100/85"
          >
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={`${crumb.label}-${idx}`}>
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-white"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            {badge && (
              <span className="mb-2.5 inline-block rounded-full border border-teal-300/30 bg-white/10 px-3 py-1 text-xs font-semibold text-teal-100">
                {badge}
              </span>
            )}
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-200 sm:text-base">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </section>
  );
}
