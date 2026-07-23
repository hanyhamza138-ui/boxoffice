"use server";

import { supabase } from "../../supabase";
import { similarity } from "./fuzzy";

function normalize(text = "") {
  return String(text)
    .toLowerCase()

    // عربي
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")

    // إنجليزي
    .replace(/\bcinemas?\b/g, "")
    .replace(/\bcinema\b/g, "")
    .replace(/\bmall\b/g, "")
    .replace(/\bcomplex\b/g, "")
    .replace(/\bbranch\b/g, "")
    .replace(/\bimax\b/g, "")
    .replace(/\bvip\b/g, "")
    .replace(/\b4dx\b/g, "")
    .replace(/\bthe\b/g, "")

    // عربي
    .replace(/سينما/g, "")
    .replace(/سينمات/g, "")
    .replace(/مول/g, "")

    // أسماء شائعة
    .replace(/renaissance/g, "")
    .replace(/vox/g, "")

    // توحيد أسماء الفروع
    .replace(/san\s*stefano/g, "سان ستيفانو")
    .replace(/sanstefano/g, "سان ستيفانو")
    .replace(/madinaty/g, "مدينتي")
    .replace(/mall of egypt/g, "مول مصر")
    .replace(/city center almaza/g, "سيتي سنتر الماظه")
    .replace(/citystars/g, "سيتي ستارز")

    .replace(/\(.*?\)/g, " ")
    .replace(/[-_]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenScore(a, b) {
  const aa = normalize(a)
    .split(" ")
    .filter(Boolean);

  const bb = normalize(b)
    .split(" ")
    .filter(Boolean);

  if (!aa.length || !bb.length) return 0;

  let hits = 0;

  for (const word of aa) {
    if (bb.includes(word)) hits++;
  }

  return hits / Math.max(aa.length, bb.length);
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
  for (const cinema of cinemaCache) {
    if (normalize(cinema.name) === search) {
      return cinema;
    }
  }

  // Exact Alias
  for (const alias of aliasCache) {
    if (normalize(alias.alias) === search) {
      return alias.cinema;
    }
  }

  // Partial Cinema
  for (const cinema of cinemaCache) {
    const n = normalize(cinema.name);

    if (search.includes(n) || n.includes(search)) {
      return cinema;
    }
  }

  // Partial Alias
  for (const alias of aliasCache) {
    const n = normalize(alias.alias);

    if (search.includes(n) || n.includes(search)) {
      return alias.cinema;
    }
  }

  // Token Match Cinema
  let bestCinema = null;
  let bestToken = 0;

  for (const cinema of cinemaCache) {
    const score = tokenScore(search, cinema.name);

    if (score > bestToken) {
      bestToken = score;
      bestCinema = cinema;
    }
  }

  if (bestToken >= 0.6) {
    return bestCinema;
  }

  // Token Match Alias
  let bestAlias = null;
  bestToken = 0;

  for (const alias of aliasCache) {
    const score = tokenScore(search, alias.alias);

    if (score > bestToken) {
      bestToken = score;
      bestAlias = alias.cinema;
    }
  }

  if (bestToken >= 0.6) {
    return bestAlias;
  }

  // Fuzzy Cinema
  bestCinema = null;
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

  if (bestScore >= 65) {
    return bestCinema;
  }

  // Fuzzy Alias
  bestAlias = null;
  bestScore = 0;

  for (const alias of aliasCache) {
    const score = similarity(
      search,
      normalize(alias.alias)
    );

    if (score > bestScore) {
      bestScore = score;
      bestAlias = alias.cinema;
    }
  }

  if (bestScore >= 65) {
    return bestAlias;
  }

  return null;
}