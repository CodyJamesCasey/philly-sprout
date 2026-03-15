"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Map, Trees } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Submission } from "@/components/submissions-map";

const SubmissionsMap = dynamic(
  () =>
    import("@/components/submissions-map").then((mod) => mod.SubmissionsMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[300px] flex items-center justify-center bg-muted/30 rounded-xl">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Map className="w-6 h-6 animate-pulse" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    ),
  }
);

const FILTERS = [
  { key: "Likely Suitable", color: "bg-green-500", activeRing: "ring-green-500/50" },
  { key: "Possibly Suitable", color: "bg-yellow-500", activeRing: "ring-yellow-500/50" },
  { key: "Likely Unsuitable", color: "bg-red-500", activeRing: "ring-red-500/50" },
  { key: "Not Rated", color: "bg-gray-500", activeRing: "ring-gray-500/50" },
] as const;

const CANOPY_LEGEND = [
  { label: "Very Low", color: "bg-red-500" },
  { label: "Low", color: "bg-orange-500" },
  { label: "Moderate", color: "bg-yellow-500" },
  { label: "Good", color: "bg-green-500" },
  { label: "High", color: "bg-green-700" },
];

export function SubmissionsMapLoader({
  submissions,
  height,
  showFilters = false,
  defaultZoom,
}: {
  submissions: Submission[];
  height?: string;
  showFilters?: boolean;
  defaultZoom?: number;
}) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    () => new Set(FILTERS.map((f) => f.key))
  );
  const [showCanopy, setShowCanopy] = useState(false);

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (activeFilters.size === FILTERS.length) return submissions;
    return submissions.filter((s) => {
      const suitability = s.overall_suitability ?? "Not Rated";
      return activeFilters.has(suitability);
    });
  }, [submissions, activeFilters]);

  return (
    <div className="flex flex-col gap-3">
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const active = activeFilters.has(f.key);
            return (
              <button
                key={f.key}
                onClick={() => toggleFilter(f.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  active
                    ? "bg-card border-border text-foreground ring-2 " + f.activeRing
                    : "bg-muted/50 border-transparent text-muted-foreground opacity-50"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full", f.color)} />
                {f.key}
              </button>
            );
          })}

          <div className="w-px h-5 bg-border mx-1" />

          <button
            onClick={() => setShowCanopy((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              showCanopy
                ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400 ring-2 ring-green-500/30"
                : "bg-muted/50 border-transparent text-muted-foreground"
            )}
          >
            <Trees className="w-3.5 h-3.5" />
            Needs Trees
          </button>

          <span className="flex items-center text-xs text-muted-foreground ml-1">
            {filtered.length} of {submissions.length}
          </span>
        </div>
      )}

      {showFilters && showCanopy && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium">Canopy coverage:</span>
          {CANOPY_LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-1">
              <span className={cn("w-2.5 h-2.5 rounded-sm", item.color)} />
              {item.label}
            </span>
          ))}
        </div>
      )}

      <SubmissionsMap
        submissions={filtered}
        height={height}
        showCanopy={showCanopy}
        defaultZoom={defaultZoom}
      />
    </div>
  );
}
