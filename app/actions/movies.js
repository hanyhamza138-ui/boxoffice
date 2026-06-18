"use server";

import { supabase } from "../../lib/supabase";
import { revalidatePath } from "next/cache";

// 🗑️ Delete Movie (Production Safe)
export async function deleteMovie(formData) {
  const id = formData.get("id");

  if (!id) {
    throw new Error("Movie ID is required");
  }

  const { error } = await supabase
    .from("movies")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete error:", error.message);
    throw new Error("Failed to delete movie");
  }

  // 🔄 إعادة تحديث الصفحة بدون refresh كامل
  revalidatePath("/admin/movies");
}