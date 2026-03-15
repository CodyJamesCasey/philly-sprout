import Link from "next/link";
import { Leaf } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-5 text-sm text-muted-foreground text-center">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Leaf className="h-4 w-4 text-primary" />
          <span>Philly Sprout</span>
        </div>

        <p className="max-w-xs sm:max-w-md">
          Supporting the{" "}
          <a
            href="https://phsonline.org/programs/tree-programs"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-primary transition-colors"
          >
            PHS
          </a>{" "}
          program. Not affiliated with the Pennsylvania Horticultural Society.
        </p>

        {/* Links with generous tap targets */}
        <div className="flex gap-6">
          <Link
            href="/auth/login"
            className="py-2 hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="py-2 hover:text-primary transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
}
