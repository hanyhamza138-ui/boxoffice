/* ==========================================================
   STRUCTURED PARSER
   JSON / XML / API
========================================================== */

export function structuredParser(document) {

  const rows = [];

  //---------------------------------
  // Sheets
  //---------------------------------

  for (const sheet of (document.sheets || [])) {

    for (const item of (sheet.rows || [])) {

      rows.push({

        cinema:
          item.cinema ??
          item.cinema_name ??
          item.branch ??
          "",

        movie:
          item.movie ??
          item.movie_name ??
          item.title ??
          "",

        version:
          item.version ??
          item.format ??
          item.language ??
          "",

        tickets:
          item.tickets ??
          item.audience ??
          item.qty ??
          item.count ??
          "",

        revenue:
          item.revenue ??
          item.gross ??
          item.amount ??
          item.total ??
          "",

      });

    }

  }

  return {

    reportDate:
      document.reportDate || "",

    rows,

  };

}