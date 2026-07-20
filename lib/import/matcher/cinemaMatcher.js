import { supabase } from "../../supabase";

export async function cinemaMatcher(rows = []) {
  const { data: cinemas } = await supabase
    .from("cinemas")
    .select("id,name,code");

  return rows.map((row) => {
    const value = String(
      row.cinema ||
      row.cinema_name ||
      row.branch ||
      row.location ||
      ""
    )
      .toLowerCase()
      .trim();

    const cinema = cinemas?.find((c) => {
      const name = String(c.name || "")
        .toLowerCase()
        .trim();

      const code = String(c.code || "")
        .toLowerCase()
        .trim();

      return (
        name === value ||
        code === value
      );
    });

    return {
      ...row,
      cinemaId: cinema?.id || null,
      cinemaMatched: !!cinema,
    };
  });
}