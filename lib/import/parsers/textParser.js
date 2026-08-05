import { detectHeader } from "../smartParser";

/* ==========================================================
   TEXT PARSER
========================================================== */

export function textParser(document) {

  if (!document?.text) {

    return {
      reportDate: "",
      rows: [],
    };

  }

  const lines = document.text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const table = lines.map(line => {

    return line
      .split(/\t| {2,}|,/)
      .map(cell => cell.trim());

  });

  if (!table.length) {

    return {
      reportDate: "",
      rows: [],
    };

  }

  let header = null;
  let headerIndex = -1;

  for (let i = 0; i < Math.min(15, table.length); i++) {

    header = detectHeader(table[i]);

    if (header) {

      headerIndex = i;
      break;

    }

  }

  if (!header) {

    return {
      reportDate: "",
      rows: [],
    };

  }

  const rows = [];

  for (let i = headerIndex + 1; i < table.length; i++) {

    const row = table[i];

    if (!row.length) continue;

    rows.push({

      cinema:
        row[header.cinemaCol] || "",

      movie:
        row[header.movieCol] || "",

      version:
        row[header.versionCol] || "",

      tickets:
        row[header.ticketsCol] || "",

      revenue:
        row[header.revenueCol] || "",

    });

  }

  return {

    reportDate: "",

    rows,

  };

}