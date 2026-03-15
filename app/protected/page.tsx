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
    href: "#",
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
    <div className="flex-1 w-full flex flex-col gap-10">
      {/* Welcome banner */}
      <div className="flex items-center justify-between">
        <Suspense
          fallback={
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            </div>
          }
        >
          <WelcomeBanner />
        </Suspense>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Submissions", value: "0", icon: FileCheck },
          { label: "Approved Sites", value: "0", icon: TreePine },
          { label: "Reports Filed", value: "0", icon: MapPin },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map(({ icon: Icon, title, description, href, cta, primary }) => (
            <Card
              key={title}
              className="border-border hover:border-primary/40 transition-colors"
            >
              <CardHeader>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="text-sm">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  size="sm"
                  variant={primary ? "default" : "outline"}
                  className="w-full"
                >
                  <Link href={href}>{cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty state for submissions */}
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl">
        <TreePine className="w-12 h-12 text-primary/40 mb-4" />
        <h3 className="font-semibold text-foreground mb-1">
          No submissions yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Find a potential tree pit on your block and start your first
          submission to get the ball rolling.
        </p>
        <Button asChild size="sm" className="mt-6">
          <Link href="#">Start Your First Submission</Link>
        </Button>
      </div>
    </div>
  );
}
