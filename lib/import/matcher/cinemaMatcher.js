"use server";

import { supabase } from "../../supabase";
import { baseMatcher } from "./baseMatcher";

let cinemaCache = null;
let aliasCache = null;

async function load() {
  if (!cinemaCache) {
    const { data } = await supabase
      .from("cinemas")
      .select("id,name");

    cinemaCache = data || [];
  }

  if (!aliasCache) {
    const { data } = await supabase
      .from("cinema_aliases")
      .select(`
        alias,
        cinema:cinema_id(
          id,
          name
        )
      `);

    aliasCache =
      (data || []).map((a) => ({
        alias: a.alias,
        item: a.cinema,
      }));
  }
}

export async function matchCinema(name) {
  await load();

  const result = baseMatcher(
    name,
    cinemaCache,
    {
      textField: "name",
      aliasField: "alias",
      aliasList: aliasCache,
      fuzzyThreshold: 75,
    }
  );

  return result;
}