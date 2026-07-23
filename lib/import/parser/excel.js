import * as XLSX from "xlsx";

const MOVIE_HEADERS = [
  "movie",
  "film",
  "title",
  "movie name",
  "الفيلم",
  "اسم الفيلم",
];

const TICKETS_HEADERS = [
  "tickets",
  "attendance",
  "audience",
  "admissions",
  "التذاكر",
  "الحضور",
];

const REVENUE_HEADERS = [
  "revenue",
  "gross",
  "net",
  "boxoffice",
  "الإيراد",
  "الايراد",
  "الصافي",
];

function clean(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isEmptyRow(row = []) {
  return row.every(
    (cell) =>
      cell === null ||
      cell === undefined ||
      String(cell).trim() === ""
  );
}

function findColumn(headers, targets) {
  return headers.findIndex((header) => {
    const h = clean(header);

    return targets.some((target) =>
      h.includes(clean(target))
    );
  });
}

function isTotalRow(text = "") {
  const value = clean(text);

  return (
    value.includes("total") ||
    value.includes("grand total") ||
    value.includes("الاجمالي") ||
    value.includes("الإجمالي")
  );
}

function looksLikeCinemaName(text = "") {
  const value = clean(text);

  if (!value) return false;

  if (value.length < 3) return false;

  if (
    value.includes("worksheet") ||
    value.includes("sheet")
  ) {
    return false;
  }

  if (
    MOVIE_HEADERS.some((x) =>
      value.includes(clean(x))
    )
  ) {
    return false;
  }

  if (
    TICKETS_HEADERS.some((x) =>
      value.includes(clean(x))
    )
  ) {
    return false;
  }

  if (
    REVENUE_HEADERS.some((x) =>
      value.includes(clean(x))
    )
  ) {
    return false;
  }

  return true;
}
export async function parseExcel(file) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const result = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    let cinema = "";
    let movieCol = -1;
    let ticketsCol = -1;
    let revenueCol = -1;

    for (const row of rows) {
      if (isEmptyRow(row)) continue;

      const values = row.map((v) =>
        String(v ?? "").trim()
      );

      // اكتشاف اسم السينما قبل الهيدر
      if (movieCol === -1) {
        const possibleCinema = values.find((v) =>
          looksLikeCinemaName(v)
        );

        if (
          possibleCinema &&
          values.length <= 3
        ) {
          cinema = possibleCinema;
        }
      }

      // اكتشاف الهيدر
      if (movieCol === -1) {
        movieCol = findColumn(
          values,
          MOVIE_HEADERS
        );

        if (movieCol !== -1) {
          ticketsCol = findColumn(
            values,
            TICKETS_HEADERS
          );

          revenueCol = findColumn(
            values,
            REVENUE_HEADERS
          );

          continue;
        }
      }

      if (movieCol === -1) continue;

      const movie =
        values[movieCol]?.trim() || "";

      if (!movie) continue;

      if (isTotalRow(movie)) continue;

      result.push({
        cinema,
        movie,
        audience:
          ticketsCol >= 0
            ? values[ticketsCol]
            : 0,
        revenue:
          revenueCol >= 0
            ? values[revenueCol]
            : 0,
      });
    }
  }

  return result;
}