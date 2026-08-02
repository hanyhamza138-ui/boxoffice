import { supabase } from "../../supabase";
import { fuzzyMatch } from "./fuzzyMatch";
import {
  findAlias,
  saveAlias,
} from "./aliasMatcher";

let cache = null;

/* =====================================
   Load Movies
===================================== */

async function loadMovies() {

  if (cache) {
    return cache;
  }

  const { data, error } =
    await supabase
      .from("movies")
      .select("id,title");

  if (error) {
    throw error;
  }

  cache = data || [];

  return cache;

}

/* =====================================
   Match Movie
===================================== */

export async function matchMovie(name) {

  if (!name) {
    return null;
  }

  //--------------------------------------------------
  // 1) Alias
  //--------------------------------------------------

  const alias =
    await findAlias(
      "movie",
      name
    );

  if (alias) {

    return {

      item: {

        id: alias.target_id,

        title: alias.target_name,

      },

      score: 100,

      method: "alias",

    };

  }

  //--------------------------------------------------
  // Load Movies
  //--------------------------------------------------

  const movies =
    await loadMovies();

  //--------------------------------------------------
  // 2) Exact
  //--------------------------------------------------

  const exact =
    movies.find(

      movie =>

        movie.title
          .trim()
          .toLowerCase() ===

        name
          .trim()
          .toLowerCase()

    );

  if (exact) {

    await saveAlias({

      type: "movie",

      sourceName: name,

      targetId: exact.id,

      targetName: exact.title,

    });

    return {

      item: exact,

      score: 100,

      method: "exact",

    };

  }

  //--------------------------------------------------
  // 3) Fuzzy
  //--------------------------------------------------

  const fuzzy =
    fuzzyMatch(
      name,
      movies
    );

  if (fuzzy) {

    await saveAlias({

      type: "movie",

      sourceName: name,

      targetId: fuzzy.item.id,

      targetName: fuzzy.item.title,

    });

    return {

      ...fuzzy,

      method: "fuzzy",

    };

  }

  //--------------------------------------------------
  // Not Found
  //--------------------------------------------------

  return null;

}

/* =====================================
   Clear Cache
===================================== */

export function clearMovieCache() {

  cache = null;

}