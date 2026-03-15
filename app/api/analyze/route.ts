import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CriterionVerdict = "pass" | "fail" | "unclear";
export type OverallSuitability =
  | "likely_suitable"
  | "possibly_suitable"
  | "likely_unsuitable";

export interface CriterionResult {
  verdict: CriterionVerdict;
  confidence: number; // 0–1
  reason: string; // plain-English explanation shown to user
  suggested_angle?: string; // only present when verdict === "unclear"
}

export interface AnalysisResponse {
  overall_suitability: OverallSuitability;
  overall_notes: string;
  criteria: {
    pit_size: CriterionResult;
    pit_edge_clearance: CriterionResult;
    no_obstructions: CriterionResult;
    driveway_clearance: CriterionResult;
    utility_line_clearance: CriterionResult;
  };
  // Address info Gemini can sometimes read from street signs / house numbers
  inferred_address?: string;
}

// ─── Master prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert urban forestry site assessor helping volunteers pre-screen potential street tree planting sites for the Philadelphia Horticultural Society (PHS) TreeVitalize program.

You will be given one or more photos of a sidewalk location. Your job is to evaluate the site against the official PHS TreeVitalize site criteria and return a structured JSON response.

## PHS Site Criteria to Evaluate

### 1. pit_size
The open soil area (tree pit) must be at least 3 feet × 3 feet (9 sq ft). Larger is better.
- PASS: The pit appears to be at least 3×3 ft based on visual scale cues (curb height ~6", standard brick ~2.25"×3.75", car wheel ~24" diameter, adult shoe ~11").
- FAIL: The pit is clearly smaller than 3×3 ft.
- UNCLEAR: Cannot determine pit dimensions from the available photos.
- suggested_angle (if unclear): "Take a photo from directly above the pit, or place a common object (shoe, water bottle) in the pit for scale."

### 2. pit_edge_clearance
The pit must have at least 1 foot of clearance from any building foundation, wall, or structure edge.
- PASS: Visible gap of ≥1 ft between pit edge and any structure.
- FAIL: Pit is immediately adjacent to a building foundation or wall.
- UNCLEAR: Cannot determine clearance from available photos.
- suggested_angle (if unclear): "Take a photo showing the full distance between the pit and the nearest building wall."

### 3. no_obstructions
The pit must be free of pipes, vents, grates, utility boxes, or other underground infrastructure markers on the surface.
- PASS: No visible obstructions in or immediately around the pit.
- FAIL: Visible utility covers, grates, vents, or infrastructure markers in the pit area.
- UNCLEAR: Cannot determine from available photos.
- suggested_angle (if unclear): "Take a close-up photo of the pit surface and the surrounding 3 feet of sidewalk."

### 4. driveway_clearance
The site must be at least 15 feet from the nearest driveway curb cut.
- PASS: No driveway curb cut visible within approximately 15 feet.
- FAIL: A driveway curb cut is clearly within 15 feet of the site.
- UNCLEAR: Cannot determine from available photos.
- suggested_angle (if unclear): "Take a photo looking up and down the block to show the nearest driveway curb cut."

### 5. utility_line_clearance
There must be no overhead utility lines (electric, cable, phone) directly above or within 10 feet horizontally of the site.
- PASS: No overhead utility lines visible above or near the site.
- FAIL: Overhead utility lines are clearly present above or near the site.
- UNCLEAR: Sky is not visible or lines cannot be determined.
- suggested_angle (if unclear): "Take a photo looking straight up from the pit location to show the sky and any overhead lines."

## Overall Suitability
- likely_suitable: All 5 criteria pass or are unclear with high confidence they would pass on inspection.
- possibly_suitable: 3–4 criteria pass; 1–2 are unclear or borderline.
- likely_unsuitable: 2 or more criteria fail.

## Output Format
Return ONLY valid JSON matching this exact schema. Do not include markdown fences or any text outside the JSON.

{
  "overall_suitability": "likely_suitable" | "possibly_suitable" | "likely_unsuitable",
  "overall_notes": "string — 1–2 sentence plain-English summary for the user",
  "criteria": {
    "pit_size": {
      "verdict": "pass" | "fail" | "unclear",
      "confidence": 0.0–1.0,
      "reason": "string",
      "suggested_angle": "string (only if unclear)"
    },
    "pit_edge_clearance": { ... },
    "no_obstructions": { ... },
    "driveway_clearance": { ... },
    "utility_line_clearance": { ... }
  },
  "inferred_address": "string or null — only if a street address is clearly visible in the photos"
}`;

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const images: string[] = body.images; // array of base64 data URLs

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build the parts array: system instruction + all images + final user message
    const parts: Part[] = [
      {
        text: SYSTEM_PROMPT,
      },
      {
        text: `I am submitting ${images.length} photo(s) of a potential street tree planting site in Philadelphia. Please evaluate the site against all PHS TreeVitalize criteria and return your structured JSON assessment.`,
      },
      ...images.map((dataUrl) => {
        // dataUrl is "data:image/jpeg;base64,<data>"
        const [header, base64Data] = dataUrl.split(",");
        const mimeType = header.split(":")[1].split(";")[0];
        return {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        } as Part;
      }),
      {
        text: "Return your JSON assessment now.",
      },
    ];

    const result = await model.generateContent(parts);
    const responseText = result.response.text().trim();

    // Strip markdown fences if Gemini wraps the JSON anyway
    const jsonText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed: AnalysisResponse = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[/api/analyze] error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
