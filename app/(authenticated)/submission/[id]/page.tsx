import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Camera,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  Navigation,
  FileSearch,
  ClipboardCheck,
  TreePine,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SubmissionsMapLoader } from "@/components/submissions-map-loader";
import type { Submission } from "@/components/submissions-map";
import { PhotoCarousel } from "./photo-carousel";

type TreeCandidate = {
  id: string;
  created_at: string;
  latitude: number;
  longitude: number;
  street_address: string | null;
  overall_suitability: string | null;
  notes: string | null;
  photo_url: string | null;
  pit_size: string | null;
  pit_edge_clearance: string | null;
  no_obstructions: string | null;
  driveway_clearance: string | null;
  corner_clearance: string | null;
  pole_hydrant_clearance: string | null;
  tree_clearance: string | null;
  ai_confidence_notes: string | null;
  submission_status: string;
};

const STATUS_STEPS = [
  { key: "submitted", label: "Submitted", icon: Circle },
  { key: "under_review", label: "Under Review", icon: FileSearch },
  { key: "approved", label: "Approved", icon: ClipboardCheck },
  { key: "tree_planted", label: "Tree Planted", icon: TreePine },
] as const;

function suitabilityVariant(suitability: string | null) {
  switch (suitability) {
    case "Likely Suitable":
      return "default" as const;
    case "Possibly Suitable":
      return "secondary" as const;
    case "Likely Unsuitable":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function CriterionRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  const icon =
    value === "pass" ? (
      <CheckCircle2 className="w-4 h-4 text-green-500" />
    ) : value === "fail" ? (
      <XCircle className="w-4 h-4 text-red-500" />
    ) : (
      <HelpCircle className="w-4 h-4 text-yellow-500" />
    );

  const text =
    value === "pass" ? "Pass" : value === "fail" ? "Fail" : "Unclear";

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-sm font-medium">
        {icon}
        {text}
      </span>
    </div>
  );
}

function StatusTracker({ status }: { status: string }) {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const isComplete = i < activeIndex;
        const isCurrent = i === activeIndex;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  isComplete
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted border-border text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-medium text-center leading-tight max-w-[60px] ${
                  isComplete || isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 min-w-[16px] mx-1 mb-5 ${
                  i < activeIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

async function SubmissionDetail({ id }: { id: string }) {
  const supabase = await createClient();

  const { data: claims, error: authError } = await supabase.auth.getClaims();
  if (authError || !claims?.claims) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("tree_candidates")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const row = data as TreeCandidate;
  if (!row.submission_status) row.submission_status = "submitted";

  const criteria = [
    { label: "Pit Size (3' × 3' min)", value: row.pit_size },
    { label: "Pit Edge Clearance (2' from curb)", value: row.pit_edge_clearance },
    { label: "No Obstructions", value: row.no_obstructions },
    { label: "Driveway Clearance (3' min)", value: row.driveway_clearance },
    { label: "Corner Clearance (25' min)", value: row.corner_clearance },
    { label: "Pole/Hydrant Clearance", value: row.pole_hydrant_clearance },
    { label: "Tree Clearance (20' min)", value: row.tree_clearance },
  ];

  const passCount = criteria.filter((c) => c.value === "pass").length;
  const totalCount = criteria.filter((c) => c.value !== null).length;

  const mapSubmission: Submission = {
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    street_address: row.street_address,
    overall_suitability: row.overall_suitability,
    created_at: row.created_at,
    notes: row.notes,
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0 mt-0.5">
          <Link href="/submissions">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">
              {row.street_address || "Unnamed Site"}
            </h1>
            <Badge variant={suitabilityVariant(row.overall_suitability)}>
              {row.overall_suitability ?? "Unrated"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(row.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {row.latitude.toFixed(5)}, {row.longitude.toFixed(5)}
            </span>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${row.latitude},${row.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <Navigation className="w-3.5 h-3.5" />
              Directions
            </a>
          </div>
        </div>
      </div>

      {/* Status */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTracker status={row.submission_status} />
        </CardContent>
      </Card>

      {/* Photo(s) */}
      {row.photo_url ? (() => {
        let urls: string[];
        try {
          const parsed = JSON.parse(row.photo_url);
          urls = Array.isArray(parsed) ? parsed : [row.photo_url];
        } catch {
          urls = [row.photo_url];
        }
        return <PhotoCarousel urls={urls} alt={row.street_address || "Site"} />;
      })() : (
        <Card className="border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center h-[200px] bg-muted/30 text-muted-foreground">
              <Camera className="w-8 h-8 mb-2" />
              <p className="text-sm">No photo available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Site Criteria */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            Site Criteria
            <span className="text-sm font-normal text-muted-foreground">
              {passCount}/{totalCount} pass
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {criteria.map((c) => (
            <CriterionRow key={c.label} label={c.label} value={c.value} />
          ))}
        </CardContent>
      </Card>

      {/* Notes */}
      {row.notes && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {row.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Notes */}
      {row.ai_confidence_notes && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AI Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {row.ai_confidence_notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
            {(() => {
              const events: { label: string; date: string; active: boolean }[] = [
                {
                  label: "Site submitted",
                  date: row.created_at,
                  active: true,
                },
              ];
              if (row.ai_confidence_notes) {
                events.push({
                  label: "AI analysis completed",
                  date: row.created_at,
                  active: true,
                });
              }
              const statusIndex = STATUS_STEPS.findIndex(
                (s) => s.key === row.submission_status
              );
              if (statusIndex >= 1) {
                events.push({
                  label: "Marked as under review",
                  date: row.created_at,
                  active: true,
                });
              }
              if (statusIndex >= 2) {
                events.push({
                  label: "Approved for planting",
                  date: row.created_at,
                  active: true,
                });
              }
              if (statusIndex >= 3) {
                events.push({
                  label: "Tree planted!",
                  date: row.created_at,
                  active: true,
                });
              }
              return events.map((event, i) => (
                <div key={i} className="relative flex items-start gap-3 pb-4 last:pb-0">
                  <div className="absolute left-[-20px] top-1.5 w-[15px] h-[15px] rounded-full border-2 border-primary bg-background" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {event.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Location map */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <SubmissionsMapLoader
            submissions={[mapSubmission]}
            height="250px"
            defaultZoom={17}
          />
        </CardContent>
      </Card>
    </>
  );
}

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex-1 w-full flex flex-col gap-4">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SubmissionDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function SubmissionDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubmissionDetail id={id} />;
}
