"use client";

import dynamic from "next/dynamic";
import type { AccessPathMapProps } from "@/components/map/LeafletMapInner";

const AccessPathMap = dynamic<AccessPathMapProps>(
  () => import("@/components/map/LeafletMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-[#EEF2F5] text-sm font-semibold text-slate-600">
        Loading interactive map...
      </div>
    ),
  }
);

export default AccessPathMap;
