import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import { Leaf, Map } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-background">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-border bg-card sticky top-0 z-40">
          <div className="w-full max-w-5xl flex justify-between items-center h-14 px-4 sm:px-5 text-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Leaf className="h-5 w-5" />
              <span className="font-bold text-base">Philly Sprout</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/map"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-accent"
              >
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Map</span>
              </Link>
              <ThemeSwitcher />
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-6 sm:gap-10 max-w-5xl w-full p-4 sm:p-5 pb-10">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t border-border text-center text-xs gap-6 py-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="h-3 w-3 text-primary" />
            <span>Philly Sprout</span>
          </div>
          <p>Supporting PHS TreeVitalize</p>
        </footer>
      </div>
    </main>
  );
}
