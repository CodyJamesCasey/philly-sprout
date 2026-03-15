import { LoginForm } from "@/components/login-form";
import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Leaf className="h-6 w-6" />
          <span>Philly Sprout</span>
        </Link>
        <div>
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            &ldquo;Every tree planted is a gift to the next generation of
            Philadelphians.&rdquo;
          </blockquote>
          <p className="text-primary-foreground/70 text-sm">
            Supporting PHS tree programs.
          </p>
        </div>
        <p className="text-primary-foreground/50 text-xs">
          &copy; 2025 Philly Sprout
        </p>
      </div>

      {/* Form panel — full width on mobile */}
      <div className="flex flex-1 flex-col items-center justify-center p-5 sm:p-8 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-primary mb-8 lg:hidden"
          >
            <Leaf className="h-5 w-5" />
            <span>Philly Sprout</span>
          </Link>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
