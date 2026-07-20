import { supabase } from "../../supabase";

export async function movieMatcher(rows = []) {
  const { data: movies } = await supabase
    .from("movies")
    .select("id,title,code");

  return rows.map((row) => {
    const movie = movies?.find((m) => {
      const title =
        String(m.title || "").toLowerCase().trim();

      const code =
        String(m.code || "").toLowerCase().trim();

      const value =
        String(row.movie || "")
          .toLowerCase()
          .trim();

      return (
        title === value ||
        code === value
      );
    });

    return {
      ...row,
      movieId: movie?.id || null,
      movieMatched: !!movie,
    };
  });
}