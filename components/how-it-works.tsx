import { Camera, Brain, FileCheck, TreePine } from "lucide-react";

const steps = [
  {
    icon: Camera,
    step: "01",
    title: "Photograph a Site",
    description:
      "Find a potential tree pit on your block. Open Philly Sprout and snap a photo — the app captures your GPS location automatically.",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Pre-Screening",
    description:
      "Our Claude Vision AI analyzes the photo for pit size, clearance from driveways, utility lines, and other PHS criteria — in seconds.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Review & Confirm",
    description:
      "Review the AI assessment, override any unclear judgments, and complete the property owner attestation form.",
  },
  {
    icon: TreePine,
    step: "04",
    title: "Submit to PHS",
    description:
      "Your verified, AI-assisted site record is ready to support the official PHS TreeVitalize application. Help a tree find its home.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-background py-14 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            From sidewalk to submission in minutes
          </h2>
        </div>

        {/* Steps — horizontal card on mobile, 2-col on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="flex gap-4 items-start p-4 rounded-2xl bg-card border border-border">
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-primary/40 tracking-widest">
                  {step}
                </span>
              </div>
              <div className="pt-0.5">
                <h3 className="font-semibold text-foreground text-base mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
