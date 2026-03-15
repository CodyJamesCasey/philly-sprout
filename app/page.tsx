import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { Navbar } from "@/components/navbar";
import { HowItWorks } from "@/components/how-it-works";
import { FeaturesSection } from "@/components/features-section";
import { CtaSection } from "@/components/cta-section";
import { SiteFooter } from "@/components/site-footer";
import { LandingContent } from "@/components/landing-content";
import { ScrollReset } from "@/components/scroll-reset";

export default function Home() {
  return (
    <>
      <ScrollReset />
      <Navbar />
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/images/hero-street.jpg"
        bgImageSrc="/images/hero-bg.jpg"
        title="Philly Sprout"
        date="Philadelphia Tree Canopy"
        scrollToExpand="Scroll to Expand"
        textBlend={false}
      >
        <LandingContent />
      </ScrollExpandMedia>

      <HowItWorks />
      <FeaturesSection />
      <CtaSection />
      <SiteFooter />
    </>
  );
}
