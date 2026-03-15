"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteSubmission(id: string) {
  if (!id) return;

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.getClaims();
  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  const userId = authData.claims.sub as string;
  const admin = await isAdmin();

  let query = supabase.from("tree_candidates").delete().eq("id", id);

  if (!admin) {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/protected/submissions");
}
