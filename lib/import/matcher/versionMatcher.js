"use server";

import { supabase } from "../../supabase";
import { baseMatcher } from "./baseMatcher";

let versionCache = null;
let aliasCache = null;

async function load() {
  if (!versionCache) {
    const { data } = await supabase
      .from("movie_versions")
      .select("id,name");

    versionCache = data || [];
  }

  // هذا الجدول اختياري حالياً
  if (!aliasCache) {
    const { data, error } = await supabase
      .from("version_aliases")
      .select(`
        alias,
        version:version_id(
          id,
          name
        )
      `);

    if (error) {
      aliasCache = [];
    } else {
      aliasCache =
        (data || []).map((a) => ({
          alias: a.alias,
          item: a.version,
        }));
    }
  }
}

export async function matchVersion(name) {
  await load();

  if (!name) {
    return null;
  }

  return baseMatcher(
    name,
    versionCache,
    {
      textField: "name",
      aliasField: "alias",
      aliasList: aliasCache,
      fuzzyThreshold: 70,
    }
  );
}