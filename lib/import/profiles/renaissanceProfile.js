import { BaseProfile } from "./baseProfile";

function clean(value) {
  return String(value ?? "").trim();
}

function normalize(text) {
  return clean(text).toLowerCase();
}

function isHeader(row) {
  const text = normalize(row.join(" "));

  return (
    text.includes("الفيلم") &&
    (
      text.includes("التذاكر") ||
      text.includes("الصافي")
    )
  );
}

function isTotal(row) {
  const text = normalize(row.join(" "));

  return (
    text.includes("الإجمالي") ||
    text.includes("الاجمالي") ||
    text.includes("grand total") ||
    text.includes("subtotal") ||
    text.includes("total")
  );
}

function findReportDate(rows) {
  const regex =
    /\b(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})\b/;

  for (const row of rows) {
    for (const cell of row) {
      const value = clean(cell);

      const match = value.match(regex);

      if (match) {
        return `${match[1]}-${match[2]
          .padStart(2, "0")}-${match[3].padStart(2, "0")}`;
      }
    }
  }

  return "";
}

export class RenaissanceProfile extends BaseProfile {

  constructor() {
    super("Renaissance");
  }

  detect(document) {

    const sheet = document?.sheets?.[0];

    if (!sheet) return false;

    const rows = sheet.rows || [];

    return rows.some((row) => {
      const text = normalize(row.join(" "));

      return (
        text.includes("الفيلم") &&
        text.includes("الصافي")
      );
    });

  }

  parse(document) {

    const sheet = document.sheets?.[0];

    if (!sheet) {
      return {
        reportDate: "",
        rows: [],
      };
    }

    const rows = sheet.rows || [];

    const reportDate = findReportDate(rows);

    const result = [];

    let cinema = "";

    let reading = false;

    let movieCol = -1;
    let ticketsCol = -1;
    let revenueCol = -1;

    for (let i = 0; i < rows.length; i++) {

      const row = rows[i];

      if (!row) continue;

      //----------------------------------
      // Header
      //----------------------------------

      if (isHeader(row)) {

        cinema = clean(rows[i - 1]?.[0]);

        movieCol = row.findIndex((c) =>
          clean(c).includes("الفيلم")
        );

        ticketsCol = row.findIndex((c) =>
          clean(c).includes("التذاكر")
        );

        revenueCol = row.findIndex((c) =>
          clean(c).includes("الصافي")
        );

        reading = true;

        continue;
      }

      if (!reading) continue;

      //----------------------------------
      // Total
      //----------------------------------

      if (isTotal(row)) {

        reading = false;

        continue;

      }

      //----------------------------------
      // Movie
      //----------------------------------

      const movie = clean(row[movieCol]);

      if (!movie) continue;

      result.push({

        reportDate,

        cinema,

        movie,

        tickets: row[ticketsCol],

        revenue: row[revenueCol],

      });

    }

    return {

      reportDate,

      rows: result,

    };

  }

}