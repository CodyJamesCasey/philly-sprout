"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TreePine, MapPin, Camera } from "lucide-react";

export function LandingContent() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 sm:space-y-20">
      {/* Intro — site suitability and skeptical audience */}
      <div className="text-center space-y-5">
        <p className="text-sm sm:text-base font-semibold text-primary uppercase tracking-wider">
          Street trees through PHS
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
          Want to know if a spot qualifies for a street tree?
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Submit a photo of any spot. Philly Sprout uses AI to pre-screen a
          site against PHS criteria — minimum tree pit size, ADA sidewalk
          clearance, no immediate obstructions, etc — to identify suitable planting
          sites with confidence.
        </p>
        {/* Full-width buttons on mobile, inline on sm+ */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center pt-1">
          <Button asChild size="lg" className="w-full sm:w-auto text-base min-h-[52px]">
            <Link href="/auth/sign-up">Start a Submission</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full sm:w-auto text-base min-h-[52px]"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Three feature highlights — single column on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {[
          {
            icon: Camera,
            title: "Photograph a Site",
            body: "Open Philly Sprout, find a tree pit on your block, and snap a photo. GPS coordinates are captured automatically.",
          },
          {
            icon: TreePine,
            title: "Know If Your Site Qualifies",
            body: "AI checks pit size, utility clearance, driveway proximity, and other PHS criteria — the stuff most people can't eyeball. No guesswork.",
          },
          {
            icon: MapPin,
            title: "Connect to Tree Tenders",
            body: "Your verified site record supports the official PHS application. Philly Sprout helps you get on the radar of your local Tree Tenders group — they handle permits and planting.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border"
          >
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
