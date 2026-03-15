import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { TreePine, FileCheck, PlusCircle, Map, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { SubmissionsMapLoader } from "@/components/submissions-map-loader";
import type { Submission } from "@/components/submissions-map";

async function WelcomeBanner() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }
  const email = data.claims.email as string | undefined;
  const name = email ? email.split("@")[0] : "there";

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        Welcome back, {name}!
      </h1>
      <p className="text-muted-foreground mt-1">
        Ready to find a new tree planting site?
      </p>
    </div>
  );
}

const quickActions = [
  {
    icon: PlusCircle,
    title: "New Submission",
    description: "Photograph and submit a new street tree planting site.",
    href: "/submission/new",
    cta: "Start",
    primary: true,
  },
  {
    icon: FileCheck,
    title: "My Submissions",
    description: "View the status of all your previously submitted sites.",
    href: "/submissions",
    cta: "View All",
    primary: false,
  },
  {
    icon: Globe,
    title: "All Submissions",
    description: "Browse every submitted site across the community.",
    href: "/submissions?view=all",
    cta: "Browse",
    primary: false,
  },
  {
    icon: Map,
    title: "Map View",
    description: "See all submitted sites plotted on a map.",
    href: "/map",
    cta: "Open Map",
    primary: false,
  },
];

async function DashboardStats() {
  const supabase = await createClient();

  const { count: totalCount } = await supabase
    .from("tree_candidates")
    .select("*", { count: "exact", head: true });

  const { count: suitableCount } = await supabase
    .from("tree_candidates")
    .select("*", { count: "exact", head: true })
    .eq("overall_suitability", "Likely Suitable");

  const stats = [
    { label: "Submissions", value: totalCount ?? 0, icon: FileCheck },
    { label: "Suitable", value: suitableCount ?? 0, icon: TreePine },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="border-border">
          <CardContent className="flex flex-col items-center justify-center gap-1 pt-4 pb-3 px-2 text-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-foreground leading-none">{value}</p>
            <p className="text-xs text-muted-foreground leading-tight">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function RecentSubmissionsMap() {
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("tree_candidates")
    .select(
      "id, latitude, longitude, street_address, overall_suitability, created_at, notes",
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const list = (submissions as Submission[]) ?? [];

  if (list.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          Recent Submissions
        </h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/map">View Full Map</Link>
        </Button>
      </div>
      <div className="rounded-xl overflow-hidden border border-border">
        <SubmissionsMapLoader submissions={list} height="300px" />
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          Likely Suitable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          Possibly Suitable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          Likely Unsuitable
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-6 sm:gap-10">
      <Suspense
        fallback={
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          </div>
        }
      >
        <WelcomeBanner />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-3">
            {["Submissions", "Suitable"].map((label) => (
              <Card key={label} className="border-border">
                <CardContent className="flex flex-col items-center justify-center gap-1 pt-4 pb-3 px-2 text-center">
                  <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
                  <div className="w-6 h-5 rounded bg-muted animate-pulse" />
                  <p className="text-xs text-muted-foreground leading-tight">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      <Suspense
        fallback={
          <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-xl">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Map className="w-6 h-6 animate-pulse" />
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        }
      >
        <RecentSubmissionsMap />
      </Suspense>

      <div>
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3">
          Quick Actions
        </h2>
        <div className="flex flex-col gap-3">
          {quickActions.map(({ icon: Icon, title, description, href, cta, primary }) => (
            <div
              key={title}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{title}</p>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                  {description}
                </p>
              </div>
              <Button
                asChild
                size="sm"
                variant={primary ? "default" : "outline"}
                className="flex-shrink-0 min-h-[40px] px-4"
              >
                <Link href={href}>{cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center border border-dashed border-border rounded-2xl">
        <TreePine className="w-10 h-10 text-primary/40 mb-3" />
        <h3 className="font-semibold text-foreground mb-1">No submissions yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs px-4">
          Find a potential tree pit on your block and start your first submission to
          get the ball rolling.
        </p>
        <Button asChild className="mt-5 min-h-[44px] px-6">
          <Link href="/submission/new">Start Your First Submission</Link>
        </Button>
      </div>
    </div>
  );
}
