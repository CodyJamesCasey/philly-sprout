"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TreePine, MapPin, Camera } from "lucide-react";

export function LandingContent() {
  return (
    <div className="max-w-5xl mx-auto space-y-24">
      {/* Intro */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Find a spot. Snap a photo. Plant a tree.
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Philly Sprout uses AI vision to pre-screen potential street tree
          planting sites against PHS TreeVitalize criteria — so your submission
          is verified before it ever reaches an arborist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
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

      {/* Three-column highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            className="flex flex-col items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 text-primary">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
