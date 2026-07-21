"use server";

import { supabase } from "../../supabase";

let aliasesCache = null;
let moviesCache = null;

function clean(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/2d|3d|imax|4dx|vip/gi, "")
    .replace(/مدبلج|مترجم/g, "")
    .replace(/[-_()]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "");
}

async function loadAliases() {
  if (aliasesCache) return aliasesCache;

  const { data } = await supabase
    .from("movie_aliases")
    .select(`
      alias,
      movie:movie_id (
        id,
        title
      )
    `);

  aliasesCache = data || [];

  return aliasesCache;
}

async function loadMovies() {
  if (moviesCache) return moviesCache;

  const { data } = await supabase
    .from("movies")
    .select("id,title");

  moviesCache = data || [];

  return moviesCache;
}

export async function matchMovie(name) {
  if (!name) return null;

  const search = clean(name);

  // 1- Alias
  const aliases = await loadAliases();

  const alias = aliases.find(
    (a) => clean(a.alias) === search
  );

  if (alias?.movie) {
    return alias.movie;
  }

  // 2- Exact
  const movies = await loadMovies();

  const exact = movies.find(
    (m) => clean(m.title) === search
  );

  if (exact) return exact;

  // 3- Partial
  const partial = movies.find(
    (m) =>
      search.includes(clean(m.title)) ||
      clean(m.title).includes(search)
  );

  return partial || null;
}