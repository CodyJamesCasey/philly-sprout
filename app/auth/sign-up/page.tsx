import { SignUpForm } from "@/components/sign-up-form";
import Link from "next/link";
import { Leaf, TreePine, MapPin, Camera } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Leaf className="h-6 w-6" />
          <span>Philly Sprout</span>
        </Link>

        <div className="space-y-8">
          <h2 className="text-3xl font-bold leading-tight">
            Join the movement to green Philadelphia&apos;s streets.
          </h2>
          <div className="space-y-5">
            {[
              { icon: Camera, text: "Photograph potential tree planting sites on your block" },
              { icon: TreePine, text: "Get instant AI-powered site pre-screening" },
              { icon: MapPin, text: "Submit verified sites to PHS TreeVitalize" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-primary-foreground/90 text-sm leading-relaxed pt-1">
                  {text}
                </p>
              </div>
            ))}
          </div>
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
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
