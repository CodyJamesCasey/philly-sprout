"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteSubmission(id: string) {
  console.log( { id } );
  if (!id) return;
  console.log( { id } );

  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.getClaims();
  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  const userId = authData.claims.sub as string;

  console.log( { id, userId } );

  const { error } = await supabase
    .from("tree_candidates")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/protected/submissions");
}
