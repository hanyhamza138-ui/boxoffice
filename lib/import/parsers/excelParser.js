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

  for (const sheet of (document.sheets || [])) {

    const data = sheet.rows || [];

    if (!data.length) continue;

    if (!reportDate) {

      reportDate =
        detectReportDate(data);

    }

    let header = null;
    let headerIndex = -1;

    //---------------------------------
    // Find Header
    //---------------------------------

    for (
      let i = 0;
      i < Math.min(20, data.length);
      i++
    ) {

      header =
        detectHeader(data[i]);

      if (header) {

        headerIndex = i;
        break;

      }

    }

    //---------------------------------
    // Guess Header
    //---------------------------------

    if (!header) {

      header =
        guessColumns(
          data.slice(0, 10)
        );

      headerIndex = 0;

    }

    if (!header)
      continue;

    //---------------------------------
    // Extract Rows
    //---------------------------------

    for (
      let i = headerIndex + 1;
      i < data.length;
      i++
    ) {

      const row = data[i];

      if (!row)
        continue;

      rows.push({

        cinema:
          row[header.cinemaCol] ?? "",

        movie:
          row[header.movieCol] ?? "",

        version:
          row[header.versionCol] ?? "",

        tickets:
          row[header.ticketsCol] ?? "",

        revenue:
          row[header.revenueCol] ?? "",

      });

    }

  }

  return {

    reportDate,

    rows,

  };

}