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
    <section className="bg-background py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            From sidewalk to submission in minutes
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Philly Sprout guides you through the entire PHS TreeVitalize
            pre-screening process with AI-powered assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="flex flex-col items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-4xl font-black text-primary/20 leading-none">
                {step}
              </span>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
