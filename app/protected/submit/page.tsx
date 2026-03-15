"use client";

import { SubmissionProvider } from "@/lib/submission-context";
import { PhotoUploadManager } from "@/components/photo-upload-manager";
import { SubmissionForm } from "@/components/submission-form";
import { ArrowLeft, Camera, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Tab = "photos" | "form";

function SubmissionPageInner() {
  const [activeTab, setActiveTab] = useState<Tab>("photos");

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
      {/* Back nav */}
      <Link
        href="/protected"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-foreground">New Site Submission</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload photos of the potential tree pit, let AI pre-screen the site,
          then complete the form.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-xl border border-border bg-card p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("photos")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "photos"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Camera className="w-4 h-4" />
          Photos & Analysis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("form")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "form"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          Site Form
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "photos" ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-1">
              Upload Site Photos
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Add up to 8 photos from different angles. Include shots of the
              pit from above, the surrounding sidewalk, the sky above the site,
              and the nearest driveway. Then hit{" "}
              <strong>Analyze with AI</strong> to auto-fill the site criteria.
            </p>
            <PhotoUploadManager />
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Photo Tips
            </h2>
            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
              {[
                "Stand directly above the pit to show its full size — place a shoe or water bottle for scale.",
                "Take a wide shot showing the full block to reveal nearby driveways and intersections.",
                "Look straight up from the pit to show any overhead utility lines.",
                "Show the gap between the pit edge and the nearest building wall.",
                "Include a close-up of the pit surface to reveal any grates, vents, or utility covers.",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Switch to form CTA */}
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className="w-full text-sm text-primary font-medium py-2 hover:underline"
          >
            Go to Site Form →
          </button>
        </div>
      ) : (
        <SubmissionForm />
      )}
    </div>
  );
}

export default function SubmitPage() {
  return (
    <SubmissionProvider>
      <SubmissionPageInner />
    </SubmissionProvider>
  );
}
