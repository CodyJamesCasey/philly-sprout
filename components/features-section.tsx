import { MapPin, ShieldCheck, Leaf, Users } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "GPS-Precise Location",
    description:
      "Every submission is anchored to an exact GPS coordinate, making it easy for PHS arborists to locate and inspect the site.",
  },
  {
    icon: ShieldCheck,
    title: "AI-Assisted Criteria Check",
    description:
      "Claude Vision evaluates pit size, utility clearance, driveway proximity, and more — so you submit only qualified sites.",
  },
  {
    icon: Leaf,
    title: "Aligned with PHS Standards",
    description:
      "Every form field maps directly to the official PHS TreeVitalize property owner application. No guesswork, no omissions.",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description:
      "Track your submissions, report tree health concerns, and help your Tree Tenders group build a stronger urban canopy.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-primary/5 py-14 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Why Philly Sprout
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Smarter tree planting starts here
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-border"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
