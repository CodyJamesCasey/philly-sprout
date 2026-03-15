import Link from "next/link";
import { Leaf } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-background border-t border-border py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Leaf className="h-4 w-4 text-primary" />
          <span>Philly Sprout</span>
        </div>

        <p className="text-center">
          Supporting the{" "}
          <a
            href="https://phsonline.org/programs/treevitalize"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-primary transition-colors"
          >
            PHS TreeVitalize
          </a>{" "}
          program. Not affiliated with the Pennsylvania Horticultural Society.
        </p>

        <div className="flex gap-5">
          <Link href="/auth/login" className="hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/auth/sign-up" className="hover:text-primary transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
}
