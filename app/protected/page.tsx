import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { TreePine, MapPin, FileCheck, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

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
    href: "/protected/submission/new",
    cta: "Start",
    primary: true,
  },
  {
    icon: FileCheck,
    title: "My Submissions",
    description: "View the status of all your previously submitted sites.",
    href: "#",
    cta: "View All",
    primary: false,
  },
  {
    icon: MapPin,
    title: "Report a Concern",
    description: "Report a sick, damaged, downed, or missing tree.",
    href: "#",
    cta: "Report",
    primary: false,
  },
];

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-6 sm:gap-10">
      {/* Welcome banner */}
      <Suspense
        fallback={
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          </div>
        }
      >
        <WelcomeBanner />
      </Suspense>

      {/* Stats row — always 3 columns (compact on mobile) */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Submissions", value: "0", icon: FileCheck },
          { label: "Approved", value: "0", icon: TreePine },
          { label: "Reports", value: "0", icon: MapPin },
        ].map(({ label, value, icon: Icon }) => (
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

      {/* Quick actions — horizontal list on mobile */}
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
                <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">{description}</p>
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

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center border border-dashed border-border rounded-2xl">
        <TreePine className="w-10 h-10 text-primary/40 mb-3" />
        <h3 className="font-semibold text-foreground mb-1">No submissions yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs px-4">
          Find a potential tree pit on your block and start your first
          submission to get the ball rolling.
        </p>
        <Button asChild className="mt-5 min-h-[44px] px-6">
          <Link href="/protected/submission/new">Start Your First Submission</Link>
        </Button>
      </div>
    </div>
  );
}
