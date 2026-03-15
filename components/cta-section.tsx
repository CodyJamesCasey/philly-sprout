import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative bg-primary py-14 sm:py-24 px-4 sm:px-6 overflow-hidden">
      {/* Decorative background leaf */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex items-center justify-center">
        <Leaf className="w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] text-white" />
      </div>

      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6 leading-tight">
          Ready to plant your first tree?
        </h2>
        <p className="text-primary-foreground/80 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
          Join Philly residents who are helping grow the city&apos;s urban
          canopy — one tree pit at a time.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-white text-primary hover:bg-green-50 font-semibold text-base min-h-[52px]"
          >
            <Link href="/auth/sign-up">Get Started — It&apos;s Free</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-white/40 text-primary-foreground hover:bg-white/10 text-base min-h-[52px]"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
