"use client";

import { useSubmission } from "@/lib/submission-context";
import { CriterionField } from "@/components/criterion-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MapPin,
  TreePine,
  User,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import type { TriState } from "@/lib/submission-context";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-5 border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Overall suitability badge ────────────────────────────────────────────────

const suitabilityConfig = {
  likely_suitable: { label: "Likely Suitable", color: "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" },
  possibly_suitable: { label: "Possibly Suitable", color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800" },
  likely_unsuitable: { label: "Likely Unsuitable", color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800" },
};

// ─── Main form ────────────────────────────────────────────────────────────────

export function SubmissionForm() {
  const { state, updateField } = useSubmission();
  const { form, analysis } = state;
  const aiResult = analysis.result;

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateField(key, e.target.value),
  });

  const criterionProps = (
    key: "pit_size" | "pit_edge_clearance" | "no_obstructions" | "driveway_clearance" | "utility_line_clearance"
  ) => ({
    value: form[key] as TriState,
    aiResult: aiResult?.criteria[key],
    isAiFilled: analysis.aiFilled.has(key),
    onChange: (v: TriState) => updateField(key, v),
  });

  const userCriterionProps = (
    key: "corner_clearance" | "pole_hydrant_clearance" | "tree_clearance" | "not_for_sale"
  ) => ({
    value: form[key] as TriState,
    aiResult: undefined,
    isAiFilled: false,
    onChange: (v: TriState) => updateField(key, v),
    userConfirmed: true,
  });

  // Check if all required fields are filled for submit readiness
  const aiCriteriaDone = (
    ["pit_size", "pit_edge_clearance", "no_obstructions", "driveway_clearance", "utility_line_clearance"] as const
  ).every((k) => form[k] !== "");
  const userCriteriaDone = (
    ["corner_clearance", "pole_hydrant_clearance", "tree_clearance", "not_for_sale"] as const
  ).every((k) => form[k] !== "");
  const ownerDone = form.owner_name && form.owner_phone && form.owner_email;
  const attestDone =
    form.attest_is_owner &&
    form.attest_read_agreement &&
    form.attest_care_responsibility &&
    form.attest_no_duplicate_request &&
    form.attest_pavement_permission;
  const addressDone = form.street_address && form.zip_code;
  const canSubmit = aiCriteriaDone && userCriteriaDone && ownerDone && attestDone && addressDone;

  return (
    <div className="flex flex-col gap-4">
      {/* Overall suitability banner */}
      {aiResult && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
            suitabilityConfig[aiResult.overall_suitability]?.color ?? ""
          }`}
        >
          <TreePine className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">
              {suitabilityConfig[aiResult.overall_suitability]?.label}
            </p>
            <p className="text-xs mt-0.5 opacity-80">{aiResult.overall_notes}</p>
          </div>
        </div>
      )}

      {/* ── Location ─────────────────────────────────────────────────── */}
      <Section icon={MapPin} title="Location">
        <div className="flex flex-col gap-2">
          <Label htmlFor="street_address" className="text-sm font-medium">
            Street Address
          </Label>
          <Input
            id="street_address"
            placeholder="1234 Spruce St"
            className="text-base h-12"
            {...field("street_address")}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="zip_code" className="text-sm font-medium">
              ZIP Code
            </Label>
            <Input
              id="zip_code"
              inputMode="numeric"
              placeholder="19103"
              className="text-base h-12"
              {...field("zip_code")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Input
              id="notes"
              placeholder="Optional"
              className="text-base h-12"
              {...field("notes")}
            />
          </div>
        </div>
      </Section>

      {/* ── AI-Assessed Criteria ──────────────────────────────────────── */}
      <Section icon={TreePine} title="Site Criteria — AI Assessed">
        <p className="text-xs text-muted-foreground -mt-2">
          These fields are auto-filled by AI analysis of your photos. You can
          override any result manually.
        </p>

        <CriterionField
          label="Pit Size"
          description="The open soil area must be at least 3 ft × 3 ft (9 sq ft)."
          fieldKey="pit_size"
          {...criterionProps("pit_size")}
        />
        <CriterionField
          label="Pit Edge Clearance"
          description="At least 1 ft of clearance from any building foundation or wall."
          fieldKey="pit_edge_clearance"
          {...criterionProps("pit_edge_clearance")}
        />
        <CriterionField
          label="No Obstructions"
          description="No pipes, vents, grates, or utility boxes in or around the pit."
          fieldKey="no_obstructions"
          {...criterionProps("no_obstructions")}
        />
        <CriterionField
          label="Driveway Clearance"
          description="At least 15 ft from the nearest driveway curb cut."
          fieldKey="driveway_clearance"
          {...criterionProps("driveway_clearance")}
        />
        <CriterionField
          label="Utility Line Clearance"
          description="No overhead utility lines directly above or within 10 ft of the site."
          fieldKey="utility_line_clearance"
          {...criterionProps("utility_line_clearance")}
        />
      </Section>

      {/* ── User-Confirmed Criteria ───────────────────────────────────── */}
      <Section icon={ClipboardCheck} title="Site Criteria — You Confirm">
        <p className="text-xs text-muted-foreground -mt-2">
          These criteria require your on-the-ground judgment. Please confirm
          each one based on what you observe at the site.
        </p>

        <CriterionField
          label="Corner Clearance"
          description="The site is not on a corner lot or within 25 ft of a street intersection."
          fieldKey="corner_clearance"
          {...userCriterionProps("corner_clearance")}
        />
        <CriterionField
          label="Pole & Hydrant Clearance"
          description="No utility poles, fire hydrants, or bus stop signs within 10 ft."
          fieldKey="pole_hydrant_clearance"
          {...userCriterionProps("pole_hydrant_clearance")}
        />
        <CriterionField
          label="Existing Tree Clearance"
          description="No existing street tree within 20 ft of the proposed site."
          fieldKey="tree_clearance"
          {...userCriterionProps("tree_clearance")}
        />
        <CriterionField
          label="Property Not For Sale"
          description="The property is not currently listed for sale or under contract."
          fieldKey="not_for_sale"
          {...userCriterionProps("not_for_sale")}
        />
      </Section>

      {/* ── Owner Information ─────────────────────────────────────────── */}
      <Section icon={User} title="Property Owner Information" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-2">
            <Label htmlFor="owner_name" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="owner_name"
              autoComplete="name"
              placeholder="Jane Smith"
              className="text-base h-12"
              {...field("owner_name")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="owner_phone" className="text-sm font-medium">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="owner_phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(215) 555-0100"
              className="text-base h-12"
              {...field("owner_phone")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="owner_email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="owner_email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="jane@example.com"
              className="text-base h-12"
              {...field("owner_email")}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <Label htmlFor="owner_mailing_address" className="text-sm font-medium">
              Mailing Address{" "}
              <span className="text-muted-foreground font-normal">
                (if different from property)
              </span>
            </Label>
            <Input
              id="owner_mailing_address"
              autoComplete="street-address"
              placeholder="Leave blank if same as property"
              className="text-base h-12"
              {...field("owner_mailing_address")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="street_trees_requested" className="text-sm font-medium">
              Street Trees Requested
            </Label>
            <Input
              id="street_trees_requested"
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              placeholder="1"
              className="text-base h-12"
              {...field("street_trees_requested")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="yard_trees_requested" className="text-sm font-medium">
              Yard Trees Requested
            </Label>
            <Input
              id="yard_trees_requested"
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              placeholder="0"
              className="text-base h-12"
              {...field("yard_trees_requested")}
            />
          </div>
        </div>
      </Section>

      {/* ── Attestations ─────────────────────────────────────────────── */}
      <Section icon={ClipboardCheck} title="Attestations" defaultOpen={false}>
        <p className="text-xs text-muted-foreground -mt-2">
          You must confirm each statement individually. These are legally
          meaningful attestations required by PHS.
        </p>

        {(
          [
            {
              key: "attest_is_owner" as const,
              label:
                "I am the property owner or an authorized representative of the property owner.",
            },
            {
              key: "attest_read_agreement" as const,
              label:
                "I have read and understood the PHS TreeVitalize program agreement and maintenance responsibilities.",
            },
            {
              key: "attest_care_responsibility" as const,
              label:
                "I accept responsibility for watering and basic care of the tree(s) for the first two growing seasons.",
            },
            {
              key: "attest_no_duplicate_request" as const,
              label:
                "I have not already submitted a TreeVitalize application for this property in the current season.",
            },
            {
              key: "attest_pavement_permission" as const,
              label:
                "I give permission for PHS and the City of Philadelphia to cut pavement and install a tree pit at this location.",
            },
            {
              key: "attest_volunteer" as const,
              label:
                "I am willing to volunteer with my local Tree Tenders group for tree planting and care events. (Optional)",
            },
          ] as const
        ).map(({ key, label }) => (
          <div key={key} className="flex items-start gap-3">
            <Checkbox
              id={key}
              checked={form[key] as boolean}
              onCheckedChange={(checked) => updateField(key, !!checked)}
              className="mt-0.5 flex-shrink-0"
            />
            <label
              htmlFor={key}
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              {label}
            </label>
          </div>
        ))}
      </Section>

      {/* ── Submit button ─────────────────────────────────────────────── */}
      <div className="pt-2">
        {canSubmit ? (
          <Button
            type="button"
            className="w-full min-h-[52px] text-base font-semibold gap-2"
            onClick={() => alert("Submission flow coming soon — images will be saved to Supabase here.")}
          >
            <CheckCircle2 className="w-5 h-5" />
            Submit to PHS TreeVitalize
          </Button>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-center">
            <p className="text-sm text-muted-foreground">
              Complete all required fields above to enable submission.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
