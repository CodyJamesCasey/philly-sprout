import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";
import { Leaf } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background">
      <div className="flex-1 w-full flex flex-col gap-10 items-center">
        {/* Navbar */}
        <nav className="w-full flex justify-center border-b border-border bg-card">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link
                href="/"
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Leaf className="h-5 w-5" />
                <span className="font-bold text-base">Philly Sprout</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className="flex-1 flex flex-col gap-10 max-w-5xl w-full p-5">
          {children}
        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-center border-t border-border text-center text-xs gap-8 py-8 text-muted-foreground">
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
