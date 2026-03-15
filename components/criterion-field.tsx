"use client";

import { Camera, CheckCircle2, XCircle, HelpCircle, Sparkles } from "lucide-react";
import type { TriState } from "@/lib/submission-context";
import type { CriterionResult } from "@/app/api/analyze/route";

interface CriterionFieldProps {
  label: string;
  description: string;
  fieldKey: string;
  value: TriState;
  aiResult?: CriterionResult;
  isAiFilled: boolean;
  onChange: (value: TriState) => void;
  /** If true, this is a user-confirmed boolean (pass/fail only, no unclear) */
  userConfirmed?: boolean;
}

const verdictConfig = {
  pass: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    label: "Pass",
  },
  fail: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    label: "Fail",
  },
  unclear: {
    icon: HelpCircle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    label: "Unclear",
  },
};

export function CriterionField({
  label,
  description,
  fieldKey,
  value,
  aiResult,
  isAiFilled,
  onChange,
  userConfirmed = false,
}: CriterionFieldProps) {
  const config = value ? verdictConfig[value] : null;
  const Icon = config?.icon;

  // Show angle re-prompt when:
  // - AI returned "unclear" for this field AND
  // - the user hasn't manually overridden it to something else
  const showAnglePrompt =
    aiResult?.verdict === "unclear" &&
    aiResult?.suggested_angle &&
    (value === "unclear" || value === "");

  return (
    <div className="flex flex-col gap-2">
      {/* Label row */}
      <div className="flex items-center gap-2 flex-wrap">
        <label htmlFor={fieldKey} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {isAiFilled && (
          <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            AI filled
          </span>
        )}
        {value && config && Icon && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${config.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

      {/* AI reason */}
      {aiResult && aiResult.reason && (
        <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">
          {aiResult.reason}
        </p>
      )}

      {/* Angle re-prompt banner */}
      {showAnglePrompt && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2.5">
          <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Better angle needed
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              {aiResult.suggested_angle}
            </p>
          </div>
        </div>
      )}

      {/* Verdict selector */}
      <div className="flex gap-2 flex-wrap">
        {(["pass", "fail"] as TriState[]).map((v) => {
          const cfg = verdictConfig[v as "pass" | "fail"];
          const VIcon = cfg.icon;
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              id={v === "pass" ? fieldKey : undefined}
              onClick={() => onChange(selected ? "" : v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all min-h-[36px] ${
                selected
                  ? `${cfg.bg} ${cfg.color} border-current`
                  : "bg-card border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <VIcon className="w-3.5 h-3.5" />
              {cfg.label}
            </button>
          );
        })}

        {!userConfirmed && (
          <button
            type="button"
            onClick={() => onChange(value === "unclear" ? "" : "unclear")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all min-h-[36px] ${
              value === "unclear"
                ? `${verdictConfig.unclear.bg} ${verdictConfig.unclear.color} border-current`
                : "bg-card border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Unclear
          </button>
        )}
      </div>
    </div>
  );
}
