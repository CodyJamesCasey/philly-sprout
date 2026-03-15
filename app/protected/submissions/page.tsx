import Link from "next/link";
import { ArrowLeft, PlusCircle, TreePine, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DeleteButton } from "./delete-button";

type TreeCandidate = {
  id: string;
  created_at: string;
  latitude: number;
  longitude: number;
  street_address: string | null;
  overall_suitability: string | null;
  notes: string | null;
  user_id: string | null;
  pit_size: string | null;
  pit_edge_clearance: string | null;
  no_obstructions: string | null;
  driveway_clearance: string | null;
  corner_clearance: string | null;
  pole_hydrant_clearance: string | null;
  tree_clearance: string | null;
};

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

function criteriaCount(row: TreeCandidate) {
  const fields = [
    row.pit_size,
    row.pit_edge_clearance,
    row.no_obstructions,
    row.driveway_clearance,
    row.corner_clearance,
    row.pole_hydrant_clearance,
    row.tree_clearance,
  ];
  const pass = fields.filter((f) => f === "pass").length;
  const total = fields.filter((f) => f !== null).length;
  return { pass, total };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

async function getSubmissions(view: "mine" | "all") {
  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.getClaims();
  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  const currentUserId = authData.claims.sub as string;

  let query = supabase
    .from("tree_candidates")
    .select("*")
    .order("created_at", { ascending: false });

  if (view === "mine") {
    query = query.eq("user_id", currentUserId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    submissions: (data ?? []) as TreeCandidate[],
    currentUserId,
  };
}

function ViewToggle({ current }: { current: "mine" | "all" }) {
  return (
    <div className="flex rounded-lg border border-border bg-muted p-0.5">
      <Link
        href="/protected/submissions"
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          current === "mine"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Mine
      </Link>
      <Link
        href="/protected/submissions?view=all"
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
          current === "all"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        All
      </Link>
    </div>
  );
}

function SubmissionCard({
  row,
  isOwner,
}: {
  row: TreeCandidate;
  isOwner: boolean;
}) {
  const { pass, total } = criteriaCount(row);
  return (
    <Card className="border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="truncate">
                {row.street_address ??
                  `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`}
              </span>
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {formatDate(row.created_at)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge variant={suitabilityVariant(row.overall_suitability)}>
              {row.overall_suitability ?? "Unrated"}
            </Badge>
            {isOwner && <DeleteButton id={row.id} />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Criteria: {pass}/{total} pass
          </span>
          {row.notes && (
            <span className="truncate max-w-[200px]">{row.notes}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view = params.view === "all" ? "all" : "mine";
  const { submissions, currentUserId } = await getSubmissions(view);

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/protected">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Submissions
            </h1>
            <p className="text-sm text-muted-foreground">
              {submissions.length} site{submissions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button asChild size="sm">
          <Link href="/protected/submission/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            New
          </Link>
        </Button>
      </div>

      <ViewToggle current={view} />

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl">
          <TreePine className="w-10 h-10 text-primary/40 mb-3" />
          <h3 className="font-semibold text-foreground mb-1">
            {view === "mine" ? "No submissions yet" : "No submissions found"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {view === "mine"
              ? "Head out and find a potential tree pit to get started."
              : "No one has submitted a site yet. Be the first!"}
          </p>
          <Button asChild className="mt-5">
            <Link href="/protected/submission/new">
              Start Your First Submission
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {submissions.map((row) => (
            <SubmissionCard
              key={row.id}
              row={row}
              isOwner={row.user_id === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
