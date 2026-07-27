function clean(value) {
  return String(value ?? "").trim();
}

function isEmpty(row) {
  return !row || row.every(c => clean(c) === "");
}

function isHeader(row) {
  const text = row
    .map(clean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("الفيلم") &&
    (
      text.includes("التذاكر") ||
      text.includes("tickets")
    )
  );
}

function isTotal(row) {
  const text = row
    .map(clean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("الإجمالي") ||
    text.includes("الاجمالي") ||
    text.includes("total")
  );
}

export function layoutAnalyzer(document) {

  const sections = [];

  if (!document?.sheets) {
    return sections;
  }

  for (const sheet of document.sheets) {

    const rows = sheet.rows || [];

    let cinema = null;
    let collecting = false;
    let header = null;
    let dataRows = [];

    for (let i = 0; i < rows.length; i++) {

      const row = rows[i];

      if (isEmpty(row)) {
        continue;
      }

      //----------------------------------
      // Header Found
      //----------------------------------

      if (isHeader(row)) {

        header = row;

        cinema = clean(
          rows[i - 1]?.[0]
        );

        collecting = true;

        dataRows = [];

        continue;
      }

      //----------------------------------
      // End Table
      //----------------------------------

      if (collecting && isTotal(row)) {

        sections.push({

          cinema,

          sheetName: sheet.sheetName,

          header,

          rows: dataRows,

        });

        collecting = false;

        cinema = null;

        header = null;

        dataRows = [];

        continue;
      }

      //----------------------------------
      // Data
      //----------------------------------

      if (collecting) {

        dataRows.push(row);

      }

    }

  }

  return sections;

}