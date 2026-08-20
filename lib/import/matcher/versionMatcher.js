"use server";

import { supabase } from "../../supabase";
import { baseMatcher } from "./baseMatcher";

let versionCache = null;
let aliasCache = null;

/* =====================================================
   Load Versions
===================================================== */

async function load() {
  if (!versionCache) {
    const {
      data,
      error,
    } = await supabase
      .from("movie_versions")
      .select("id,name")
      .order("name");

    if (error) {
      console.error(
        "Version Load Error:",
        error
      );

      versionCache = [];
    } else {
      versionCache =
        data || [];
    }
  }

  /* -----------------------------------------------
     Load Aliases
  ----------------------------------------------- */

  if (!aliasCache) {
    const {
      data,
      error,
    } = await supabase
      .from("version_aliases")
      .select(`
        alias,
        version:version_id(
          id,
          name
        )
      `);

    if (error) {
      console.log(
        "Version aliases table unavailable."
      );

      aliasCache = [];
    } else {
      aliasCache =
        (data || [])
          .filter(
            (a) =>
              a &&
              a.alias &&
              a.version &&
              a.version.id
          )
          .map((a) => ({
            alias: String(
              a.alias
            ).trim(),

            item: a.version,
          }));
    }
  }
}

/* =====================================================
   Match Version
===================================================== */

export async function matchVersion(
  name
) {
  await load();

  if (
    name === null ||
    name === undefined
  ) {
    return null;
  }

  const text =
    String(name).trim();

  if (!text) {
    return null;
  }

  /*
    Ignore values that are clearly not versions.
  */

  if (
    /^[-–—_\s]+$/.test(text)
  ) {
    return null;
  }

  if (text.length < 2) {
    return null;
  }

  if (
    !versionCache.length &&
    !aliasCache.length
  ) {
    return null;
  }

  try {
    const result =
      baseMatcher(
        text,
        versionCache,
        {
          textField: "name",
          aliasField: "alias",
          aliasList: aliasCache,
          fuzzyThreshold: 70,
        }
      );

    /*
      baseMatcher may return a result without item.
      Never allow that result to break import.
    */

    if (
      !result ||
      !result.item ||
      !result.item.id
    ) {
      return null;
    }

    return result;
  } catch (err) {
    console.error(
      "matchVersion error:",
      text,
      err
    );

    return null;
  }
}