/* ==========================================================
   EXCEL PARSER
   BoxOffice Smart Import
========================================================== */

import {
  detectHeader,
  guessColumns,
  detectReportDate,
} from "../smartParser";

/* ==========================================================
   EXCEL PARSER
========================================================== */

export function excelParser(document) {
  const rows = [];
  let reportDate = "";

  const sheets = document?.sheets || [];

  for (const sheet of sheets) {
    const data = sheet?.rows || [];

    if (!data.length) {
      continue;
    }

    /* ======================================================
       Detect Report Date
    ====================================================== */

    if (!reportDate) {
      reportDate = detectReportDate(data) || "";
    }

    /* ======================================================
       Find Header
    ====================================================== */

    let header = null;
    let headerIndex = -1;

    for (
      let i = 0;
      i < Math.min(30, data.length);
      i++
    ) {
      const detected = detectHeader(data[i]);

      if (detected) {
        header = detected;
        headerIndex = i;
        break;
      }
    }

    /* ======================================================
       Guess Header
    ====================================================== */

    if (!header) {
      header = guessColumns(
        data.slice(0, 30)
      );

      if (header) {
        headerIndex = 0;
      }
    }

    if (!header) {
      continue;
    }

    /* ======================================================
       Extract Data Rows
    ====================================================== */

    for (
      let i = headerIndex + 1;
      i < data.length;
      i++
    ) {
      const row = data[i];

      if (!Array.isArray(row)) {
        continue;
      }

      /* ----------------------------------------------------
         Get Values
      ---------------------------------------------------- */

      const cinema =
        typeof header.cinemaCol === "number"
          ? row[header.cinemaCol] ?? ""
          : "";

      const movie =
        typeof header.movieCol === "number"
          ? row[header.movieCol] ?? ""
          : "";

      const version =
        typeof header.versionCol === "number"
          ? row[header.versionCol] ?? ""
          : "";

      const tickets =
        typeof header.ticketsCol === "number"
          ? row[header.ticketsCol] ?? ""
          : "";

      const revenue =
        typeof header.revenueCol === "number"
          ? row[header.revenueCol] ?? ""
          : "";

      /* ----------------------------------------------------
         Ignore Empty Rows
      ---------------------------------------------------- */

      const hasData =
        String(cinema).trim() !== "" ||
        String(movie).trim() !== "" ||
        String(version).trim() !== "" ||
        String(tickets).trim() !== "" ||
        String(revenue).trim() !== "";

      if (!hasData) {
        continue;
      }

      /* ----------------------------------------------------
         Ignore Total Rows
      ---------------------------------------------------- */

      const text = row
        .map((value) =>
          String(value ?? "")
            .trim()
            .toLowerCase()
        )
        .join(" ");

      if (
        text.includes("grand total") ||
        text.includes("total revenue") ||
        text === "total" ||
        text.includes("الإجمالي") ||
        text.includes("الاجمالي")
      ) {
        continue;
      }

      /* ----------------------------------------------------
         Add Row
      ---------------------------------------------------- */

      rows.push({
        cinema,
        movie,
        version,
        tickets,
        revenue,
      });
    }
  }

  /* ======================================================
     Return
  ====================================================== */

  return {
    reportDate,
    rows,
  };
}
