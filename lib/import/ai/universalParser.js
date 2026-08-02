/* ==========================================================
   UNIVERSAL PARSER
========================================================== */

function clean(value) {

  return String(value ?? "")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();

}

function splitLine(line) {

  //----------------------------------
  // Tab
  //----------------------------------

  if (line.includes("\t")) {

    return line
      .split("\t")
      .map(clean);

  }

  //----------------------------------
  // Multiple Spaces
  //----------------------------------

  if (line.match(/\s{2,}/)) {

    return line
      .split(/\s{2,}/)
      .map(clean);

  }

  //----------------------------------
  // Single Space
  //----------------------------------

  return line
    .split(" ")
    .map(clean);

}

/* ========================================= */

export function universalParser(text) {

  const rows = [];

  const lines =

    text

      .split(/\r?\n/)

      .map(clean)

      .filter(Boolean);

  for (const line of lines) {

    const row =
      splitLine(line);

    if (
      row.length > 1
    ) {

      rows.push(row);

    }

  }

  return rows;

}