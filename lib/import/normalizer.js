export function normalizeData(rows = []) {
  return rows
    .map((row) => {
      const normalized = {};

      Object.keys(row || {}).forEach((key) => {
        const cleanKey = String(key)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");

        let value = row[key];

        if (typeof value === "string") {
          value = value.trim();
        }

        normalized[cleanKey] = value;
      });

      // Movie
      normalized.movie =
        normalized.movie ||
        normalized.movie_name ||
        normalized.film ||
        normalized.title ||
        normalized["الفيلم"] ||
        "";

      // Version
      normalized.version =
        normalized.version ||
        normalized.format ||
        normalized.type ||
        normalized["النسخة"] ||
        "";

      // Tickets
      normalized.audience =
        Number(
          String(
            normalized.audience ??
              normalized.tickets ??
              normalized.attendance ??
              normalized["التذاكر"] ??
              0
          ).replace(/,/g, "")
        ) || 0;

      // Revenue
      normalized.revenue =
        Number(
          String(
            normalized.revenue ??
              normalized.gross ??
              normalized.boxoffice ??
              normalized["الصافي"] ??
              normalized["الإيراد"] ??
              0
          ).replace(/,/g, "")
        ) || 0;

      // Cinema
      normalized.cinema =
        normalized.cinema ||
        normalized.cinema_name ||
        normalized.branch ||
        normalized["السينما"] ||
        normalized["cinema"] ||
        "";

      return normalized;
    })

    .filter((row) => {
      return (
        row.movie &&
        (row.audience > 0 || row.revenue > 0)
      );
    });
}