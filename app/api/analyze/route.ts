import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// ─── Types (exported so submission-form can import them) ──────────────────────

export type CriterionVerdict = "pass" | "fail" | "unclear";
export type OverallSuitability =
  | "Likely Suitable"
  | "Possibly Suitable"
  | "Likely Unsuitable";

export interface CriterionResult {
  verdict: CriterionVerdict;
  confidence: number; // 0–1
  reason: string;
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
    corner_clearance: CriterionResult;
    pole_hydrant_clearance: CriterionResult;
    tree_clearance: CriterionResult;
  };
}

// ─── Master prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert urban forestry site assessor helping volunteers pre-screen potential street tree planting sites for the Philadelphia Horticultural Society (PHS) TreeVitalize program.

You will be given one or more photos of a sidewalk location. Evaluate the site against every PHS TreeVitalize site criterion below and return a structured JSON response.

## Criteria to Evaluate

### pit_size
The open soil area (tree pit) must be at least 3 feet × 3 feet.
- pass: Pit appears ≥ 3×3 ft based on visual scale cues (curb height ~6", standard brick ~2.25"×3.75", car tire ~24" diameter, adult shoe ~11").
- fail: Pit is clearly smaller than 3×3 ft.
- unclear: Cannot determine pit dimensions from available photos.
- suggested_angle (if unclear): "Photograph the pit from directly above. Place a common object (shoe, water bottle) in the pit for scale."

### pit_edge_clearance
The pit edge must be at least 2 feet from the curb face.
- pass: Visible gap of ≥ 2 ft between pit edge and curb.
- fail: Pit edge is clearly within 2 ft of the curb.
- unclear: Cannot determine clearance from available photos.
- suggested_angle (if unclear): "Take a photo showing the full distance between the pit edge and the curb, ideally from the side."

### no_obstructions
The pit must be free of utility covers, grates, vents, pipes, or other underground infrastructure markers.
- pass: No visible obstructions in or immediately around the pit.
- fail: Utility covers, grates, vents, or infrastructure markers are visible in the pit area.
- unclear: Cannot determine from available photos.
- suggested_angle (if unclear): "Take a close-up photo of the pit surface and the surrounding 3 feet of sidewalk."

### driveway_clearance
The site must be at least 3 feet from the nearest driveway curb cut.
- pass: No driveway curb cut visible within approximately 3 feet.
- fail: A driveway curb cut is clearly within 3 feet of the site.
- unclear: Cannot determine from available photos.
- suggested_angle (if unclear): "Take a photo looking up and down the block to show the nearest driveway curb cut and its distance from the pit."

### corner_clearance
The site must be at least 25 feet from a street intersection.
- pass: No intersection visible within approximately 25 feet.
- fail: An intersection is clearly within 25 feet.
- unclear: Cannot determine from available photos.
- suggested_angle (if unclear): "Take a wide photo looking down the block in both directions to show the nearest intersection."

### pole_hydrant_clearance
The site must be at least 10 feet from a fire hydrant and at least 5 feet from a utility pole.
- pass: No fire hydrant within ~10 ft and no utility pole within ~5 ft.
- fail: A fire hydrant or utility pole is clearly within the required clearance.
- unclear: Cannot determine from available photos.
- suggested_angle (if unclear): "Take a photo showing the full sidewalk around the pit, including any nearby poles or hydrants."

### tree_clearance
The site must be at least 20 feet from the nearest existing street tree.
- pass: No existing street tree visible within approximately 20 feet.
- fail: An existing street tree is clearly within 20 feet.
- unclear: Cannot determine from available photos.
- suggested_angle (if unclear): "Take a wide photo looking up and down the block to show the nearest existing street trees."

## Overall Suitability
- "Likely Suitable": All or nearly all criteria pass.
- "Possibly Suitable": Most criteria pass; 1–2 are unclear or borderline.
- "Likely Unsuitable": One or more criteria clearly fail.

## Output Format
Return ONLY valid JSON matching this exact schema. Do not include markdown fences or any text outside the JSON.

{
  "overall_suitability": "Likely Suitable" | "Possibly Suitable" | "Likely Unsuitable",
  "overall_notes": "1–2 sentence plain-English summary for the user",
  "criteria": {
    "pit_size": {
      "verdict": "pass" | "fail" | "unclear",
      "confidence": 0.0–1.0,
      "reason": "plain-English explanation",
      "suggested_angle": "camera tip (only include this key when verdict is unclear)"
    },
    "pit_edge_clearance": { "verdict": "...", "confidence": 0.0, "reason": "...", "suggested_angle": "..." },
    "no_obstructions": { "verdict": "...", "confidence": 0.0, "reason": "..." },
    "driveway_clearance": { "verdict": "...", "confidence": 0.0, "reason": "...", "suggested_angle": "..." },
    "corner_clearance": { "verdict": "...", "confidence": 0.0, "reason": "...", "suggested_angle": "..." },
    "pole_hydrant_clearance": { "verdict": "...", "confidence": 0.0, "reason": "...", "suggested_angle": "..." },
    "tree_clearance": { "verdict": "...", "confidence": 0.0, "reason": "...", "suggested_angle": "..." }
  }
}`;

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const imageUrls: string[] = body.imageUrls;

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "At least one image URL is required." },
        { status: 400 }
      );
    }

    // Fetch each image server-side and convert to inline data for Gemini
    const imageParts: Part[] = await Promise.all(
      imageUrls.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = res.headers.get("content-type") ?? "image/jpeg";
        return {
          inlineData: { data: base64, mimeType },
        } as Part;
      })
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const parts: Part[] = [
      { text: SYSTEM_PROMPT },
      {
        text: `I am submitting ${imageUrls.length} photo(s) of a potential street tree planting site in Philadelphia. Please evaluate the site against all PHS TreeVitalize criteria and return your structured JSON assessment.`,
      },
      ...imageParts,
      { text: "Return your JSON assessment now." },
    ];

    const result = await model.generateContent(parts);
    const responseText = result.response.text().trim();

    // Strip markdown fences if Gemini wraps the JSON
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
