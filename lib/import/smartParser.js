function clean(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const COLUMN_NAMES = {
  movie: [
    "movie",
    "movie name",
    "film",
    "film name",
    "title",
    "feature",
    "الفيلم",
    "اسم الفيلم",
    "اسم الفلم"
  ],

  tickets: [
    "tickets",
    "ticket",
    "audience",
    "attendance",
    "adm",
    "admission",
    "التذاكر",
    "الحضور"
  ],

  revenue: [
    "revenue",
    "net",
    "gross",
    "box office",
    "total net",
    "total gross",
    "الصافي",
    "الايراد",
    "الإيراد"
  ],

  version: [
    "version",
    "format",
    "screen",
    "type",
    "experience",
    "presentation",
    "نسخة",
    "الصالة",
    "القاعة"
  ]
};

function matchHeader(cell, list) {
  const text = normalize(cell);

  return list.some((word) =>
    text.includes(normalize(word))
  );
}

function detectColumns(row) {
  const columns = {
    movie: -1,
    tickets: -1,
    revenue: -1,
    version: -1,
  };

  row.forEach((cell, index) => {
    if (
      columns.movie === -1 &&
      matchHeader(cell, COLUMN_NAMES.movie)
    ) {
      columns.movie = index;
    }

    if (
      columns.tickets === -1 &&
      matchHeader(cell, COLUMN_NAMES.tickets)
    ) {
      columns.tickets = index;
    }

    if (
      columns.revenue === -1 &&
      matchHeader(cell, COLUMN_NAMES.revenue)
    ) {
      columns.revenue = index;
    }

    if (
      columns.version === -1 &&
      matchHeader(cell, COLUMN_NAMES.version)
    ) {
      columns.version = index;
    }
  });

  return columns;
}

function looksLikeHeader(columns) {
  return (
    columns.movie >= 0 &&
    (
      columns.revenue >= 0 ||
      columns.tickets >= 0
    )
  );
}

function detectDate(rows) {
  const patterns = [

    /\b(20\d\d)[-\/](\d\d?)[-\/](\d\d?)\b/,

    /\b(\d\d?)[-\/](\d\d?)[-\/](20\d\d)\b/

  ];

  for (const row of rows) {

    for (const cell of row) {

      const text = clean(cell);

      for (const pattern of patterns) {

        const match = text.match(pattern);

        if (!match) continue;

        if (
          match[1].startsWith("20")
        ) {

          return `${match[1]}-${match[2].padStart(
            2,
            "0"
          )}-${match[3].padStart(
            2,
            "0"
          )}`;

        }

        return `${match[3]}-${match[2].padStart(
          2,
          "0"
        )}-${match[1].padStart(
          2,
          "0"
        )}`;
      }
    }
  }

  return "";
}

function detectVersion(text = "") {

  const value =
    normalize(text).toUpperCase();

  if (value.includes("IMAX"))
    return "IMAX";

  if (value.includes("4DX"))
    return "4DX";

  if (value.includes("MX4D"))
    return "MX4D";

  if (value.includes("SCREENX"))
    return "SCREENX";

  if (value.includes("VIP"))
    return "VIP";

  if (value.includes("DOLBY"))
    return "Dolby";

  if (value.includes("3D"))
    return "3D";

  if (value.includes("2D"))
    return "2D";

  return "";
}
function isEmptyRow(row) {
  if (!row) return true;

  return row.every(
    (cell) => clean(cell) === ""
  );
}

function isTotalRow(row) {
  const text = normalize(
    row.join(" ")
  );

  return (
    text.includes("total") ||
    text.includes("grand total") ||
    text.includes("subtotal") ||
    text.includes("الاجمالي") ||
    text.includes("الإجمالي") ||
    text.includes("اجمالي")
  );
}

function looksLikeCinema(text) {
  const value = normalize(text);

  if (!value) return false;

  if (
    value.includes("cinema") ||
    value.includes("cine") ||
    value.includes("vox") ||
    value.includes("renaissance") ||
    value.includes("imax") ||
    value.includes("ciné") ||
    value.includes("سينما")
  ) {
    return true;
  }

  return false;
}

function detectCinema(rows, headerIndex) {

  //----------------------------------
  // Search Above Header
  //----------------------------------

  for (
    let i = headerIndex - 1;
    i >= Math.max(0, headerIndex - 5);
    i--
  ) {

    for (const cell of rows[i]) {

      if (
        looksLikeCinema(cell)
      ) {

        return clean(cell);

      }

    }

  }

  return "";
}

function extractRows(
  rows,
  startIndex,
  cinema,
  columns,
  reportDate
) {

  const result = [];

  for (
    let i = startIndex;
    i < rows.length;
    i++
  ) {

    const row = rows[i];

    //----------------------------------

    if (isEmptyRow(row)) {

      if (result.length) {
        break;
      }

      continue;
    }

    //----------------------------------

    if (isTotalRow(row)) {
      break;
    }

    //----------------------------------

    if (
      looksLikeHeader(
        detectColumns(row)
      )
    ) {
      break;
    }

    //----------------------------------

    const movie =
      clean(
        row[columns.movie]
      );

    if (!movie) {
      continue;
    }

    //----------------------------------

    let version = "";

    if (
      columns.version >= 0
    ) {

      version = clean(
        row[
          columns.version
        ]
      );

    }

    if (!version) {

      version =
        detectVersion(movie);

    }

    //----------------------------------

    result.push({

      reportDate,

      cinema,

      movie,

      version,

      tickets:
        columns.tickets >= 0
          ? row[
              columns.tickets
            ]
          : 0,

      revenue:
        columns.revenue >= 0
          ? row[
              columns.revenue
            ]
          : 0,

    });

  }

  return result;

}