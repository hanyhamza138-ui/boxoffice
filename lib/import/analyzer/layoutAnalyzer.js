function clean(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function isEmptyRow(row) {
  return row.every((c) => clean(c) === "");
}

function hasHeader(row) {
  const text = row.join(" ").toLowerCase();

  return (
    text.includes("الفيلم") ||
    text.includes("movie") ||
    text.includes("film")
  );
}

export function layoutAnalyzer(document) {
  const sections = [];

  for (const sheet of document.sheets) {
    let currentCinema = "";
    let header = null;
    let rows = [];

    for (const row of sheet.rows) {
      if (isEmptyRow(row)) continue;

      if (hasHeader(row)) {
        header = row;
        continue;
      }

      if (!header) {
        if (row.length <= 3) {
          currentCinema = clean(row[0]);
        }

        continue;
      }

      rows.push(row);
    }

    sections.push({
      sheetName: sheet.sheetName,
      cinema: currentCinema,
      header,
      rows,
    });
  }

  return sections;
}