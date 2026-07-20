import { supabase } from "../../supabase";

export async function versionMatcher(rows = []) {
  const { data: versions } = await supabase
    .from("movie_versions")
    .select("id,name");

  return rows.map((row) => {
    const value = String(row.version || "")
      .toLowerCase()
      .trim();

    const version = versions?.find((v) =>
      String(v.name || "")
        .toLowerCase()
        .trim() === value
    );

    return {
      ...row,
      versionId: version?.id || null,
      versionMatched: !!version,
    };
  });
}