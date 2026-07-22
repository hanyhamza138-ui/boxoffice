"use server";

import { supabase } from "../../lib/supabase";
import { revalidatePath } from "next/cache";

/* ===========================
   Create Cinema Alias
=========================== */

export async function createCinemaAlias({
  alias,
  cinemaId,
}) {
  if (!alias || !cinemaId) {
    return {
      success: false,
      message: "Missing alias or cinema.",
    };
  }

  // منع التكرار
  const { data: exists } = await supabase
    .from("cinema_aliases")
    .select("id")
    .ilike("alias", alias.trim())
    .maybeSingle();

  if (exists) {
    return {
      success: true,
      message: "Alias already exists.",
    };
  }

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

/* ===========================
   Create Movie Alias
=========================== */

export async function createMovieAlias({
  alias,
  movieId,
}) {
  if (!alias || !movieId) {
    return {
      success: false,
      message: "Missing alias or movie.",
    };
  }

  // منع التكرار
  const { data: exists } = await supabase
    .from("movie_aliases")
    .select("id")
    .ilike("alias", alias.trim())
    .maybeSingle();

  if (exists) {
    return {
      success: true,
      message: "Alias already exists.",
    };
  }

  const { error } = await supabase
    .from("movie_aliases")
    .insert({
      alias: alias.trim(),
      movie_id: Number(movieId),
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