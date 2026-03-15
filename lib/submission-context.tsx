"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from "react";
import type { AnalysisResponse, CriterionVerdict } from "@/app/api/analyze/route";

// ─── Photo state ──────────────────────────────────────────────────────────────

export interface LocalPhoto {
  id: string; // uuid-ish, generated client-side
  file: File;
  previewUrl: string; // ObjectURL — revoked on delete
}

// ─── Form state ───────────────────────────────────────────────────────────────

export type TriState = CriterionVerdict | ""; // "" = not yet assessed

export interface SubmissionFormState {
  // Location
  street_address: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  notes: string;

  // AI-assessed criteria (auto-filled by Gemini, user-overridable)
  pit_size: TriState;
  pit_edge_clearance: TriState;
  no_obstructions: TriState;
  driveway_clearance: TriState;
  utility_line_clearance: TriState;
  overall_suitability: string;
  ai_confidence_notes: string;

  // User-confirmed criteria (checkboxes)
  corner_clearance: TriState;
  pole_hydrant_clearance: TriState;
  tree_clearance: TriState;
  not_for_sale: TriState;

  // Owner info
  street_trees_requested: string;
  yard_trees_requested: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  owner_mailing_address: string;

  // Attestations
  attest_is_owner: boolean;
  attest_read_agreement: boolean;
  attest_care_responsibility: boolean;
  attest_no_duplicate_request: boolean;
  attest_pavement_permission: boolean;
  attest_volunteer: boolean;
}

const defaultForm: SubmissionFormState = {
  street_address: "",
  zip_code: "",
  latitude: "",
  longitude: "",
  notes: "",
  pit_size: "",
  pit_edge_clearance: "",
  no_obstructions: "",
  driveway_clearance: "",
  utility_line_clearance: "",
  overall_suitability: "",
  ai_confidence_notes: "",
  corner_clearance: "",
  pole_hydrant_clearance: "",
  tree_clearance: "",
  not_for_sale: "",
  street_trees_requested: "",
  yard_trees_requested: "",
  owner_name: "",
  owner_phone: "",
  owner_email: "",
  owner_mailing_address: "",
  attest_is_owner: false,
  attest_read_agreement: false,
  attest_care_responsibility: false,
  attest_no_duplicate_request: false,
  attest_pavement_permission: false,
  attest_volunteer: false,
};

// ─── Analysis state ───────────────────────────────────────────────────────────

export interface AnalysisState {
  status: "idle" | "loading" | "done" | "error";
  result: AnalysisResponse | null;
  error: string | null;
  // Track which fields were AI-filled (so we know to show override indicator)
  aiFilled: Set<keyof SubmissionFormState>;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

interface State {
  photos: LocalPhoto[];
  form: SubmissionFormState;
  analysis: AnalysisState;
}

type Action =
  | { type: "ADD_PHOTOS"; photos: LocalPhoto[] }
  | { type: "DELETE_PHOTO"; id: string }
  | { type: "UPDATE_FIELD"; field: keyof SubmissionFormState; value: string | boolean }
  | { type: "ANALYSIS_START" }
  | { type: "ANALYSIS_SUCCESS"; result: AnalysisResponse }
  | { type: "ANALYSIS_ERROR"; error: string }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_PHOTOS":
      return { ...state, photos: [...state.photos, ...action.photos] };

    case "DELETE_PHOTO": {
      const photo = state.photos.find((p) => p.id === action.id);
      if (photo) URL.revokeObjectURL(photo.previewUrl);
      return {
        ...state,
        photos: state.photos.filter((p) => p.id !== action.id),
      };
    }

    case "UPDATE_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
      };

    case "ANALYSIS_START":
      return {
        ...state,
        analysis: { ...state.analysis, status: "loading", error: null },
      };

    case "ANALYSIS_SUCCESS": {
      const r = action.result;
      const aiFilled = new Set<keyof SubmissionFormState>();

      // Build the partial form update from Gemini output
      const patch: Record<string, string> = {};

      const criteriaMap: Array<[keyof SubmissionFormState, keyof typeof r.criteria]> = [
        ["pit_size", "pit_size"],
        ["pit_edge_clearance", "pit_edge_clearance"],
        ["no_obstructions", "no_obstructions"],
        ["driveway_clearance", "driveway_clearance"],
        ["utility_line_clearance", "utility_line_clearance"],
      ];

      for (const [formKey, aiKey] of criteriaMap) {
        // Only auto-fill if the user hasn't already set this field
        if (!state.form[formKey]) {
          patch[formKey] = r.criteria[aiKey].verdict as TriState;
          aiFilled.add(formKey);
        }
      }

      if (!state.form.overall_suitability) {
        patch.overall_suitability = r.overall_suitability;
        aiFilled.add("overall_suitability");
      }

      if (!state.form.ai_confidence_notes) {
        patch.ai_confidence_notes = r.overall_notes;
        aiFilled.add("ai_confidence_notes");
      }

      // Inferred address — only fill if user hasn't entered one
      if (r.inferred_address && !state.form.street_address) {
        patch.street_address = r.inferred_address;
        aiFilled.add("street_address");
      }

      return {
        ...state,
        form: { ...state.form, ...(patch as Partial<SubmissionFormState>) },
        analysis: {
          status: "done",
          result: r,
          error: null,
          aiFilled: new Set([...state.analysis.aiFilled, ...aiFilled]),
        },
      };
    }

    case "ANALYSIS_ERROR":
      return {
        ...state,
        analysis: {
          ...state.analysis,
          status: "error",
          error: action.error,
        },
      };

    case "RESET": {
      state.photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return {
        photos: [],
        form: defaultForm,
        analysis: { status: "idle", result: null, error: null, aiFilled: new Set() },
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface SubmissionContextValue {
  state: State;
  addPhotos: (files: File[]) => void;
  deletePhoto: (id: string) => void;
  updateField: (field: keyof SubmissionFormState, value: string | boolean) => void;
  runAnalysis: () => Promise<void>;
  reset: () => void;
}

const SubmissionContext = createContext<SubmissionContextValue | null>(null);

export function SubmissionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    photos: [],
    form: defaultForm,
    analysis: { status: "idle", result: null, error: null, aiFilled: new Set<keyof SubmissionFormState>() },
  });

  // Use a ref so runAnalysis always sees the latest photos without stale closure
  const stateRef = useRef(state);
  stateRef.current = state;

  const addPhotos = useCallback((files: File[]) => {
    const newPhotos: LocalPhoto[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    dispatch({ type: "ADD_PHOTOS", photos: newPhotos });
  }, []);

  const deletePhoto = useCallback((id: string) => {
    dispatch({ type: "DELETE_PHOTO", id });
  }, []);

  const updateField = useCallback(
    (field: keyof SubmissionFormState, value: string | boolean) => {
      dispatch({ type: "UPDATE_FIELD", field, value });
    },
    []
  );

  const runAnalysis = useCallback(async () => {
    const { photos } = stateRef.current;
    if (photos.length === 0) return;

    dispatch({ type: "ANALYSIS_START" });

    try {
      // Convert each File to a base64 data URL
      const base64Images = await Promise.all(
        photos.map(
          (p) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(p.file);
            })
        )
      );

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: base64Images }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Analysis failed");
      }

      const result = await res.json();
      dispatch({ type: "ANALYSIS_SUCCESS", result });
    } catch (err) {
      dispatch({
        type: "ANALYSIS_ERROR",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return (
    <SubmissionContext.Provider
      value={{ state, addPhotos, deletePhoto, updateField, runAnalysis, reset }}
    >
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmission() {
  const ctx = useContext(SubmissionContext);
  if (!ctx) throw new Error("useSubmission must be used inside <SubmissionProvider>");
  return ctx;
}
