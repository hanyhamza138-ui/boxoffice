"use server";

import { similarity } from "./fuzzy";
import { supabase } from "../../supabase";

let moviesCache = null;
let aliasesCache = null;

async function load() {
  if (!moviesCache) {
    const { data } = await supabase
      .from("movies")
      .select("id,title");

    moviesCache = data || [];
  }

  if (!aliasesCache) {
    const { data } = await supabase
      .from("movie_aliases")
      .select(`
        alias,
        movie:movie_id(
          id,
          title
        )
      `);

    aliasesCache = data || [];
  }
}

function normalize(text = "") {
  return String(text)
    .toLowerCase()

    // Arabic normalize
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")

    // Remove tashkeel
    .replace(/[\u064B-\u065F]/g, "")

    // English cleanup
    .replace(/\bthe\b/g, "")

    // Quality
    .replace(/\b2d\b/gi, "")
    .replace(/\b3d\b/gi, "")
    .replace(/\bimax\b/gi, "")
    .replace(/\b4dx\b/gi, "")
    .replace(/\bdolby\b/gi, "")
    .replace(/\bvip\b/gi, "")

    // Arabic words
    .replace(/مدبلج/g, "")
    .replace(/مترجم/g, "")
    .replace(/نسخه عربيه/g, "")
    .replace(/نسخه انجليزيه/g, "")

    // Brackets
    .replace(/\(.*?\)/g, " ")

    // punctuation
    .replace(/[^\p{L}\p{N}]+/gu, " ")

    .replace(/\s+/g, " ")
    .trim();
}

export async function matchMovie(name) {
  if (!name) return null;

  await load();

  const search = normalize(name);

  //
  // 1- Exact Movie
  //

  const exactMovie = moviesCache.find(
    (movie) =>
      normalize(movie.title) === search
  );

  if (exactMovie) return exactMovie;

  //
  // 2- Exact Alias
  //

  const exactAlias = aliasesCache.find(
    (alias) =>
      normalize(alias.alias) === search
  );

  if (exactAlias) return exactAlias.movie;

  //
  // 3- Partial Movie
  //

  const partialMovie = moviesCache.find(
    (movie) => {
      const title = normalize(movie.title);

      return (
        search.includes(title) ||
        title.includes(search)
      );
    }
  );

  if (partialMovie) return partialMovie;

  //
  // 4- Partial Alias
  //

  const partialAlias = aliasesCache.find(
    (alias) => {
      const value = normalize(alias.alias);

      return (
        search.includes(value) ||
        value.includes(search)
      );
    }
  );

  if (partialAlias) return partialAlias.movie;

  //
  // 5- Fuzzy Search
  //

  let bestMovie = null;
  let bestScore = 0;
    //
  // Fuzzy Movies
  //

  for (const movie of moviesCache) {
    const score = similarity(
      search,
      normalize(movie.title)
    );

    if (score > bestScore) {
      bestScore = score;
      bestMovie = movie;
    }
  }

  //
  // Fuzzy Aliases
  //

  for (const alias of aliasesCache) {
    const score = similarity(
      search,
      normalize(alias.alias)
    );

    if (score > bestScore) {
      bestScore = score;
      bestMovie = alias.movie;
    }
  }

  //
  // Accept only high confidence
  //

  if (bestScore >= 85) {
    return bestMovie;
  }

  return null;
}