import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative bg-primary py-24 px-6 overflow-hidden">
      {/* Decorative background leaves */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex items-center justify-center">
        <Leaf className="w-[600px] h-[600px] text-white" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
          Ready to plant your first tree?
        </h2>
        <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
          Join Philly residents who are helping grow the city&apos;s urban
          canopy — one tree pit at a time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-white text-primary hover:bg-green-50 font-semibold text-base px-8"
          >
            <Link href="/auth/sign-up">Get Started — It&apos;s Free</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 text-primary-foreground hover:bg-white/10 text-base px-8"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
