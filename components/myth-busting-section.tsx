"use client";

import { ShieldCheck, Leaf, HelpCircle } from "lucide-react";

const myths = [
  {
    icon: ShieldCheck,
    myth: "Trees destroy sidewalks and pipes.",
    reality:
      "Modern PHS planting uses species sized for urban environments and larger pit sizes. Most tree roots stay within 18 inches of the surface; Philly sewer laterals are typically six feet down. Past damage came from wrong species and poor maintenance — not today's program.",
  },
  {
    icon: Leaf,
    myth: "I'll be stuck with leaves and maintenance forever.",
    reality:
      "Leaves are real friction. PHS selects species suited to urban blocks, and you're mainly responsible for watering (15–20 gallons/week for two years — less than $1/year) and protecting the tree from damage. The city handles pruning and removal.",
  },
  {
    icon: HelpCircle,
    myth: "What if something goes wrong? Am I liable?",
    reality:
      "Property owners are responsible for sidewalk damage — that's a valid concern. The honest answer: modern species selection and larger pit sizes significantly reduce that risk. Philly Sprout helps verify your site qualifies before anyone shows up with a shovel.",
  },
];

export function MythBustingSection() {
  return (
    <section className="bg-muted/30 py-14 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Common Concerns
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Modern tree planting isn&apos;t what your block saw 30 years ago
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            The wrong species were planted then. Today PHS selects trees that
            won&apos;t heave your sidewalk — and Philly Sprout helps verify your
            site qualifies before anyone shows up.
          </p>
        </div>

        <div className="space-y-6">
          {myths.map(({ icon: Icon, myth, reality }) => (
            <div
              key={myth}
              className="flex gap-4 p-5 rounded-2xl bg-card border border-border"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base mb-1">
                  &ldquo;{myth}&rdquo;
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {reality}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
