import { supabase } from "../../supabase";
import { normalizeName } from "./normalizeName";

/* ==========================================================
   CACHE
========================================================== */

let cinemaCache = null;
let aliasCache = null;

/* ==========================================================
   LOAD DATA
========================================================== */

async function loadData() {

  if (!cinemaCache) {

    const { data, error } = await supabase
      .from("cinemas")
      .select("id,name");

    if (error) {

      console.error(error);
      cinemaCache = [];

    } else {

      cinemaCache = data || [];

    }

  }

  if (!aliasCache) {

    const { data, error } = await supabase
      .from("cinema_aliases")
      .select("*");

    if (error) {

      console.error(error);
      aliasCache = [];

    } else {

      aliasCache = data || [];

    }

  }

}

/* ==========================================================
   TOKEN SCORE
========================================================== */

function tokenScore(a, b) {

  const aa = normalizeName(a)
    .split(" ")
    .filter(Boolean);

  const bb = normalizeName(b)
    .split(" ")
    .filter(Boolean);

  let score = 0;

  for (const word of aa) {

    for (const other of bb) {

      if (

        word === other ||

        word.includes(other) ||

        other.includes(word)

      ) {

        score++;
        break;

      }

    }

  }

  return score;

}

/* ==========================================================
   MATCH CINEMA
========================================================== */

export async function matchCinema(name) {

  await loadData();

  if (!name)
    return null;

  const input =
    normalizeName(name);

  //---------------------------------
  // Alias
  //---------------------------------

  const alias =
    aliasCache.find(

      a =>

        normalizeName(a.alias) === input

    );

  if (alias) {

    const cinema =
      cinemaCache.find(

        c => c.id === alias.cinema_id

      );

    if (cinema) {

      return {

        item: cinema,

        score: 100,

        method: "alias",

      };

    }

  }

  //---------------------------------
  // Exact
  //---------------------------------

  const exact =
    cinemaCache.find(

      c =>

        normalizeName(c.name) === input

    );

  if (exact) {

    return {

      item: exact,

      score: 98,

      method: "exact",

    };

  }

  //---------------------------------
  // Contains
  //---------------------------------

  const contains =
    cinemaCache.find(c => {

      const db =
        normalizeName(c.name);

      return (

        db.includes(input) ||

        input.includes(db)

      );

    });

  if (contains) {

    return {

      item: contains,

      score: 94,

      method: "contains",

    };

  }

  //---------------------------------
  // Smart Token Match
  //---------------------------------

  let best = null;
  let bestScore = 0;

  for (const cinema of cinemaCache) {

    const db =
      normalizeName(cinema.name);

    let score =
      tokenScore(db, input);

    if (

      db.includes(input) ||

      input.includes(db)

    ) {

      score += 10;

    }

    if (score > bestScore) {

      best = cinema;
      bestScore = score;

    }

  }

  if (best && bestScore >= 2) {

    return {

      item: best,

      score: Math.min(95, bestScore * 10),

      method: "smart",

    };

  }

  //---------------------------------
  // Debug
  //---------------------------------

  console.log("Cinema Not Matched:", name);

  console.log(
    "Normalized:",
    input
  );

  //---------------------------------
  // Not Found
  //---------------------------------

  return null;

}