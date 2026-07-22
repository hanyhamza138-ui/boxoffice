"use server";

import { supabase } from "../../supabase";
import { similarity } from "./fuzzy";

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[()]/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "");
}

let cinemaCache = null;
let aliasCache = null;

async function loadData() {
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

    aliasCache = data || [];
  }
}

export async function matchCinema(name) {
  if (!name) return null;

  await loadData();

  const search = normalize(name);

  // Exact Cinema
  const exactCinema = cinemaCache.find(
    (c) => normalize(c.name) === search
  );

  if (exactCinema) return exactCinema;

  // Exact Alias
  const exactAlias = aliasCache.find(
    (a) => normalize(a.alias) === search
  );

  if (exactAlias) return exactAlias.cinema;

  // Partial Cinema
  const partialCinema = cinemaCache.find((c) => {
    const n = normalize(c.name);

    return (
      search.includes(n) ||
      n.includes(search)
    );
  });

  if (partialCinema) return partialCinema;

  // Partial Alias
  const partialAlias = aliasCache.find((a) => {
    const n = normalize(a.alias);

    return (
      search.includes(n) ||
      n.includes(search)
    );
  });

  if (partialAlias) return partialAlias.cinema;

  // Fuzzy Cinema Matching
  let bestCinema = null;
  let bestScore = 0;

  for (const cinema of cinemaCache) {
    const score = similarity(
      search,
      normalize(cinema.name)
    );

    if (score > bestScore) {
      bestScore = score;
      bestCinema = cinema;
    }
  }

  if (bestScore >= 85) {
    return bestCinema;
  }

  // Fuzzy Alias Matching
  let bestAlias = null;
  bestScore = 0;

  for (const alias of aliasCache) {
    const score = similarity(
      search,
      normalize(alias.alias)
    );

    if (score > bestScore) {
      bestScore = score;
      bestAlias = alias;
    }
  }

  if (bestAlias && bestScore >= 85) {
    return bestAlias.cinema;
  }

  return null;
}