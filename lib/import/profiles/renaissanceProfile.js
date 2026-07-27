import { BaseProfile } from "./baseProfile";

function clean(v) {
  return String(v ?? "").trim();
}

function isHeader(row) {
  const text = row.join(" ").toLowerCase();

  return (
    text.includes("الفيلم") &&
    (
      text.includes("التذاكر") ||
      text.includes("الصافي")
    )
  );
}

function isTotal(row) {
  const text = row.join(" ").toLowerCase();

  return (
    text.includes("الإجمالي") ||
    text.includes("الاجمالي") ||
    text.includes("total")
  );
}

export class RenaissanceProfile extends BaseProfile {

  constructor() {
    super("Renaissance");
  }

  detect(document) {

    const sheet = document?.sheets?.[0];

    if (!sheet) return false;

    const rows = sheet.rows || [];

    for (const row of rows) {

      const text = row.join(" ").toLowerCase();

      if (
        text.includes("الفيلم") &&
        text.includes("الصافي")
      ) {
        return true;
      }

    }

    return false;

  }

  parse(document) {

    const result = [];

    const sheet = document.sheets[0];

    const rows = sheet.rows || [];

    let cinema = "";

    let reading = false;

    let movieCol = 0;
    let ticketsCol = 1;
    let revenueCol = 2;

    for (let i = 0; i < rows.length; i++) {

      const row = rows[i];

      if (!row) continue;

      if (isHeader(row)) {

        cinema = clean(rows[i - 1]?.[0]);

        movieCol = row.findIndex(c =>
          clean(c).includes("الفيلم")
        );

        ticketsCol = row.findIndex(c =>
          clean(c).includes("التذاكر")
        );

        revenueCol = row.findIndex(c =>
          clean(c).includes("الصافي")
        );

        reading = true;

        continue;
      }

      if (!reading) continue;

      if (isTotal(row)) {

        reading = false;

        continue;

      }

      const movie = clean(row[movieCol]);

      if (!movie) continue;

      result.push({

        cinema,

        movie,

        tickets: row[ticketsCol],

        revenue: row[revenueCol],

      });

    }

    return result;

  }

}