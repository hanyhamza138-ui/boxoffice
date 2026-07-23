"use server";

import { supabase } from "../../supabase";
import { baseMatcher } from "./baseMatcher";

let movieCache = null;
let aliasCache = null;

async function load() {
  if (!movieCache) {
    const { data } = await supabase
      .from("movies")
      .select("id,title");

    movieCache = data || [];
  }

  if (!aliasCache) {
    const { data } = await supabase
      .from("movie_aliases")
      .select(`
        alias,
        movie:movie_id(
          id,
          title
        )
      `);

    aliasCache =
      (data || []).map((a) => ({
        alias: a.alias,
        item: a.movie,
      }));
  }
}

export async function matchMovie(name) {
  await load();

  const result = baseMatcher(
    name,
    movieCache,
    {
      textField: "title",
      aliasField: "alias",
      aliasList: aliasCache,
      fuzzyThreshold: 75,
    }
  );

  return result;
}