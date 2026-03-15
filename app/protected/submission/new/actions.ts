"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type SubmissionState = {
  error?: string;
  success?: boolean;
};

export async function createSubmission(
  _prevState: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.getClaims();
  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  const latitude = formData.get("latitude");
  const longitude = formData.get("longitude");

  if (!latitude || !longitude) {
    return { error: "Location is required. Please allow GPS access." };
  }

  const photoUrls = (formData.getAll("photo_url") as string[]).filter(Boolean);
  const photoUrl =
    photoUrls.length > 0
      ? photoUrls.length === 1
        ? photoUrls[0]
        : JSON.stringify(photoUrls)
      : null;

  const row = {
    user_id: authData.claims.sub as string,
    latitude: parseFloat(latitude as string),
    longitude: parseFloat(longitude as string),
    street_address: (formData.get("street_address") as string) || null,
    notes: (formData.get("notes") as string) || null,
    photo_url: photoUrl,
    overall_suitability:
      (formData.get("overall_suitability") as string) || null,
    pit_size: (formData.get("pit_size") as string) || null,
    pit_edge_clearance:
      (formData.get("pit_edge_clearance") as string) || null,
    no_obstructions: (formData.get("no_obstructions") as string) || null,
    driveway_clearance:
      (formData.get("driveway_clearance") as string) || null,
    corner_clearance:
      (formData.get("corner_clearance") as string) || null,
    pole_hydrant_clearance:
      (formData.get("pole_hydrant_clearance") as string) || null,
    tree_clearance: (formData.get("tree_clearance") as string) || null,
    ai_overrides: {},
    ai_confidence_notes: null,
  };

  const { error } = await supabase.from("tree_candidates").insert(row);

  if (error) {
    return { error: error.message };
  }

  redirect("/protected");
}
