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

      normalized.movie =
        normalized.movie ||
        normalized.movie_name ||
        normalized.film ||
        normalized.title ||
        "";

      normalized.version =
        normalized.version ||
        normalized.format ||
        normalized.type ||
        "";

      normalized.audience =
        Number(
          normalized.audience ||
          normalized.tickets ||
          normalized.attendance ||
          0
        ) || 0;

      normalized.revenue =
        Number(
          normalized.revenue ||
          normalized.gross ||
          normalized.boxoffice ||
          0
        ) || 0;

      return normalized;
    })
    .filter(
      (row) =>
        row.movie ||
        row.revenue ||
        row.audience
    );
}