import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { SubmissionsMapLoader } from "@/components/submissions-map-loader";
import type { Submission } from "@/components/submissions-map";

async function MapContent() {
  const supabase = await createClient();

  const { data: claims, error: authError } = await supabase.auth.getClaims();
  if (authError || !claims?.claims) {
    redirect("/auth/login");
  }

  const { data: submissions } = await supabase
    .from("tree_candidates")
    .select(
      "id, latitude, longitude, street_address, overall_suitability, created_at, notes"
    )
    .order("created_at", { ascending: false });

  const list = (submissions as Submission[]) ?? [];

  return (
    <>
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href="/protected">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Submission Map</h1>
          <p className="text-sm text-muted-foreground">
            {list.length} site{list.length !== 1 ? "s" : ""} submitted
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          Likely Suitable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          Possibly Suitable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          Likely Unsuitable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-500" />
          Not Rated
        </span>
      </div>

      <div>
        <SubmissionsMapLoader submissions={list} height="70vh" />
      </div>
    </>
  );
}

export default function MapPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-4">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Map className="w-8 h-8 animate-pulse" />
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        }
      >
        <MapContent />
      </Suspense>
    </div>
  );
}
