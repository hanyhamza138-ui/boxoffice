"use server";

import { supabase } from "../../supabase";

let cinemasCache = null;
let aliasesCache = null;

async function load() {
  if (!cinemasCache) {
    const { data } = await supabase
      .from("cinemas")
      .select("id,name");

    cinemasCache = data || [];
  }

  if (!aliasesCache) {
    const { data } = await supabase
      .from("cinema_aliases")
      .select(`
        alias,
        cinema:cinema_id(
          id,
          name
        )
      `);

    aliasesCache = data || [];
  }
}

export async function matchCinema(name) {
  if (!name) return null;

  await load();

  const search = name
    .trim()
    .toLowerCase();

  // 1- Exact cinema name
  const cinema = cinemasCache.find(
    c =>
      c.name
        .trim()
        .toLowerCase() === search
  );

  if (cinema) return cinema;

  // 2- Alias
  const alias = aliasesCache.find(
    a =>
      a.alias
        .trim()
        .toLowerCase() === search
  );

  if (alias)
    return alias.cinema;

  // 3- Partial cinema
  const partial = cinemasCache.find(
    c =>
      search.includes(
        c.name.toLowerCase()
      ) ||
      c.name
        .toLowerCase()
        .includes(search)
  );

  if (partial) return partial;

  // 4- Partial alias
  const partialAlias =
    aliasesCache.find(
      a =>
        search.includes(
          a.alias.toLowerCase()
        ) ||
        a.alias
          .toLowerCase()
          .includes(search)
    );

  if (partialAlias)
    return partialAlias.cinema;

  return null;
}