"use client";

import dynamic from "next/dynamic";
import { Map } from "lucide-react";
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

export function SubmissionsMapLoader({
  submissions,
  height,
}: {
  submissions: Submission[];
  height?: string;
}) {
  return <SubmissionsMap submissions={submissions} height={height} />;
}
