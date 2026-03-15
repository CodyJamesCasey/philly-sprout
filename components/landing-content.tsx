"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TreePine, MapPin, Camera } from "lucide-react";

export function LandingContent() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 sm:space-y-20">
      {/* Intro */}
      <div className="text-center space-y-5">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
          Find a spot. Snap a photo. Plant a tree.
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Philly Sprout uses AI vision to pre-screen potential street tree
          planting sites against PHS TreeVitalize criteria — so your submission
          is verified before it ever reaches an arborist.
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
            title: "AI Pre-Screening",
            body: "Claude Vision analyzes pit size, utility clearance, driveway proximity, and other PHS criteria in seconds.",
          },
          {
            icon: MapPin,
            title: "Submit to PHS",
            body: "Your verified, AI-assisted site record supports the official PHS TreeVitalize property owner application.",
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
