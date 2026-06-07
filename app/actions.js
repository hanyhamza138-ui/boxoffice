"use server";

import { supabase } from "../lib/supabase";
import { redirect } from "next/navigation";

export async function addMovie(formData) {
  const title = formData.get("title");
  const revenue = Number(formData.get("revenue"));
  const audience = Number(formData.get("audience"));
  const cinemas = Number(formData.get("cinemas"));
  const poster = formData.get("poster");
  const language = formData.get("language");
  const trailer = formData.get("trailer");

  const { error } = await supabase
    .from("movies")
    .insert([
      {
        title,
        revenue,
        audience,
        cinemas,
        poster,
        language,
        trailer,
      },
    ]);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin");
}

export async function updateMovie(formData) {
  const id = Number(formData.get("id"));

  const title = formData.get("title");
  const revenue = Number(formData.get("revenue"));
  const audience = Number(formData.get("audience"));
  const cinemas = Number(formData.get("cinemas"));
  const poster = formData.get("poster");
  const language = formData.get("language");
  const trailer = formData.get("trailer");

  const { error } = await supabase
    .from("movies")
    .update({
      title,
      revenue,
      audience,
      cinemas,
      poster,
      language,
      trailer,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin");
}

export async function deleteMovie(formData) {
  const id = Number(formData.get("id"));

  const { error } = await supabase
    .from("movies")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin");
}export async function addDailyStat(formData) {
  const movie_id = Number(formData.get("movie_id"));
  const cinema_id = Number(formData.get("cinema_id"));
  const revenue = Number(formData.get("revenue"));
  const audience = Number(formData.get("audience"));
  const date = formData.get("date");

  const { error } = await supabase
    .from("daily_stats")
    .insert([
      {
        movie_id,
        cinema_id,
        revenue,
        audience,
        date,
      },
    ]);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/analytics");
}