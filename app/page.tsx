import { Navbar } from "@/components/navbar";
import ScrollExpandHero from "@/components/ui/scroll-expansion-hero";
import { HowItWorks } from "@/components/how-it-works";
import { FeaturesSection } from "@/components/features-section";
import { CtaSection } from "@/components/cta-section";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <Navbar />
      <ScrollExpandHero
        bgImageSrc="/images/hero-bg.jpg"
        mediaSrc="/images/hero-street.jpg"
        title="Philly Sprout"
        subtitle="Help grow Philadelphia's urban tree canopy — one block at a time."
        scrollToExpand="Scroll to explore"
      >
        {/* Content revealed after the hero fully expands */}
        <div className="bg-background py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find a spot. Snap a photo. Plant a tree.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
              Philly Sprout uses AI vision to pre-screen potential street tree
              planting sites against PHS TreeVitalize criteria — so your
              submission is verified before it ever reaches an arborist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8">
                <Link href="/auth/sign-up">Start a Submission</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base px-8"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollExpandHero>

      <HowItWorks />
      <FeaturesSection />
      <CtaSection />
      <SiteFooter />
    </>
  );
}
