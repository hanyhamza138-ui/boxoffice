"use server";

import { supabase } from "../../lib/supabase";
import { revalidatePath } from "next/cache";

export async function createCinemaAlias({
  alias,
  cinemaId,
}) {
  const { error } = await supabase
    .from("cinema_aliases")
    .insert({
      alias: alias.trim(),
      cinema_id: Number(cinemaId),
    });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/aliases");

  return {
    success: true,
  };
}