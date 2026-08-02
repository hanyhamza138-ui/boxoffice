import { supabase } from "../../supabase";
import { fuzzyMatch } from "./fuzzyMatch";
import {
  findAlias,
  saveAlias,
} from "./aliasMatcher";

let cache = null;

function normalizeCinema(text) {

  return String(text ?? "")
    .toLowerCase()

    .replace(/cinemas?/gi, "")
    .replace(/cinema/gi, "")
    .replace(/theatre/gi, "")
    .replace(/theater/gi, "")
    .replace(/mall/gi, "")

    .replace(/سينما/g, "")
    .replace(/مول/g, "")

    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

}

async function loadCinemas() {

  if (cache) {

    return cache;

  }

  const { data, error } =
    await supabase

      .from("cinemas")

      .select("id,name");

  if (error) {

    throw error;

  }

  cache = data || [];

  return cache;

}

export async function matchCinema(name) {

  if (!name) {

    return null;

  }

  //----------------------------------
  // Alias
  //----------------------------------

  const alias =
    await findAlias(
      "cinema",
      name
    );

  if (alias) {

    return {

      item: {

        id: alias.target_id,

        name: alias.target_name,

      },

      score: 100,

      method: "alias",

    };

  }

  //----------------------------------
  // Load
  //----------------------------------

  const cinemas =
    await loadCinemas();

  //----------------------------------
  // Exact
  //----------------------------------

  const exact =
    cinemas.find(

      c =>

        normalizeCinema(
          c.name
        ) ===

        normalizeCinema(
          name
        )

    );

  if (exact) {

    await saveAlias({

      type: "cinema",

      sourceName: name,

      targetId: exact.id,

      targetName: exact.name,

    });

    return {

      item: exact,

      score: 100,

      method: "exact",

    };

  }

  //----------------------------------
  // Fuzzy
  //----------------------------------

  const fuzzy =
    fuzzyMatch(

      normalizeCinema(name),

      cinemas.map(

        c => ({

          ...c,

          name:
            normalizeCinema(
              c.name
            ),

        })

      )

    );

  if (fuzzy) {

    const cinema =
      cinemas.find(

        c =>
          c.id ===
          fuzzy.item.id

      );

    await saveAlias({

      type: "cinema",

      sourceName: name,

      targetId: cinema.id,

      targetName: cinema.name,

    });

    return {

      item: cinema,

      score:
        fuzzy.score,

      method:
        "fuzzy",

    };

  }

  return null;

}

export function clearCinemaCache() {

  cache = null;

}