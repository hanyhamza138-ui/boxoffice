import * as XLSX from "xlsx";

/* ============================
   Headers
============================ */

const MOVIE_HEADERS = [
  "الفيلم",
  "اسم الفيلم",
  "movie",
  "film",
  "movie name",
  "title",
];

const TICKETS_HEADERS = [
  "التذاكر",
  "tickets",
  "attendance",
  "audience",
  "admissions",
  "sold",
];

const REVENUE_HEADERS = [
  "الايراد",
  "الإيراد",
  "الصافي",
  "revenue",
  "gross",
  "net",
  "boxoffice",
];

/* ============================
   Helpers
============================ */

function clean(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[()]/g, "")
    .replace(/[-_]/g, " ");
}

function numberValue(value) {
  if (value === undefined || value === null)
    return 0;

  return Number(
    String(value)
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "")
  ) || 0;
}

function findColumn(headers, list) {
  return headers.findIndex((header) => {
    const h = clean(header);

    return list.some((item) =>
      h.includes(clean(item))
    );
  });
}

function looksLikeCinema(text) {
  if (!text) return false;

  const value = clean(text);

  if (value.length < 2) return false;

  if (
    value.includes("سينما") ||
    value.includes("cinema") ||
    value.includes("vox") ||
    value.includes("amc") ||
    value.includes("galaxy") ||
    value.includes("renaissance") ||
    value.includes("imax")
  ) {
    return true;
  }

  return false;
}

function ignoreMovie(movie) {
  const text = clean(movie);

  return (
    text.includes("total") ||
    text.includes("grand total") ||
    text.includes("الإجمالي") ||
    text.includes("الاجمالي") ||
    text.includes("المجموع") ||
    text.includes("subtotal")
  );
}

/* ============================
   Main Parser
============================ */

export async function parseExcel(file) {

  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: false,
  });

  const result = [];

  for (const sheetName of workbook.SheetNames) {

    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    let cinema = sheetName;

    let movieCol = -1;
    let ticketsCol = -1;
    let revenueCol = -1;

    let headerFound = false;

    /* ============================
       Search cinema + header
    ============================ */

    for (let i = 0; i < Math.min(rows.length, 20); i++) {

      const values = rows[i].map((v) =>
        String(v).trim()
      );

      if (!headerFound) {

        const movieIndex =
          findColumn(values, MOVIE_HEADERS);

        if (movieIndex !== -1) {

          movieCol = movieIndex;

          ticketsCol =
            findColumn(values, TICKETS_HEADERS);

          revenueCol =
            findColumn(values, REVENUE_HEADERS);

          headerFound = true;

          continue;
        }
      }

      for (const value of values) {

        if (looksLikeCinema(value)) {
          cinema = value;
          break;
        }

      }

    }

    if (!headerFound) {
      continue;
    }
        /* ============================
       Read data rows
    ============================ */

    let dataStarted = false;

    for (const row of rows) {

      const values = row.map((v) =>
        String(v).trim()
      );

      if (!dataStarted) {

        const movieIndex =
          findColumn(values, MOVIE_HEADERS);

        if (movieIndex !== -1) {
          dataStarted = true;
        }

        continue;
      }

      if (
        movieCol < 0 ||
        !values[movieCol]
      ) {
        continue;
      }

      const movie =
        values[movieCol].trim();

      if (!movie) continue;

      if (ignoreMovie(movie))
        continue;

      const tickets =
        ticketsCol >= 0
          ? numberValue(values[ticketsCol])
          : 0;

      const revenue =
        revenueCol >= 0
          ? numberValue(values[revenueCol])
          : 0;

      if (
        !movie &&
        tickets === 0 &&
        revenue === 0
      ) {
        continue;
      }

      result.push({
        cinema,
        movie,
        audience: tickets,
        tickets,
        revenue,
      });
    }
  }

  return result;
}