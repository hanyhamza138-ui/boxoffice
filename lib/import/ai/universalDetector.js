/* ==========================================================
   UNIVERSAL IMPORT DETECTOR
========================================================== */

function clean(value) {

  return String(value ?? "")
    .trim()
    .toLowerCase();

}

const MOVIE_HEADERS = [

  "movie",
  "film",
  "title",
  "picture",

  "اسم الفيلم",
  "الفيلم",
  "العمل"

];

const TICKET_HEADERS = [

  "tickets",
  "ticket",
  "admissions",
  "attendance",
  "audience",

  "التذاكر",
  "الحضور",
  "عدد التذاكر"

];

const REVENUE_HEADERS = [

  "revenue",
  "gross",
  "sales",
  "box office",

  "الإيراد",
  "الايراد",
  "الإجمالي",
  "المبيعات"

];

const VERSION_HEADERS = [

  "version",
  "format",
  "screen",

  "نسخة",
  "نوع",
  "عرض"

];

function contains(text, list) {

  text = clean(text);

  return list.some(

    word =>

      text.includes(

        clean(word)

      )

  );

}

/* ========================================= */

export function detectColumns(row) {

  let movieCol = -1;

  let ticketsCol = -1;

  let revenueCol = -1;

  let versionCol = -1;

  row.forEach((cell, index) => {

    if (
      movieCol === -1 &&
      contains(cell, MOVIE_HEADERS)
    ) {

      movieCol = index;

    }

    if (
      ticketsCol === -1 &&
      contains(cell, TICKET_HEADERS)
    ) {

      ticketsCol = index;

    }

    if (
      revenueCol === -1 &&
      contains(cell, REVENUE_HEADERS)
    ) {

      revenueCol = index;

    }

    if (
      versionCol === -1 &&
      contains(cell, VERSION_HEADERS)
    ) {

      versionCol = index;

    }

  });

  return {

    movieCol,

    ticketsCol,

    revenueCol,

    versionCol,

    valid:

      movieCol >= 0 &&

      revenueCol >= 0

  };

}