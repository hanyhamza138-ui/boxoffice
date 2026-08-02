/* =========================================================
   SMART PARSER
   BoxOffice Import Engine
========================================================= */

function clean(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function toNumber(value) {
  return (
    Number(
      String(value ?? "")
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "")
    ) || 0
  );
}

function isEmptyRow(row) {
  if (!row) return true;

  return row.every(
    (c) => clean(c) === ""
  );
}

/* =========================================================
   DATE
========================================================= */

function detectDate(rows) {

  const patterns = [

    /\b\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\b/,

    /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{4}\b/,

    /\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/

  ];

  for (const row of rows) {

    for (const cell of row) {

      const text = clean(cell);

      for (const regex of patterns) {

        const match = text.match(regex);

        if (match) {

          return match[0]
            .replace(/\//g, "-");

        }

      }

    }

  }

  return "";

}

/* =========================================================
   COLUMN ALIASES
========================================================= */

const COLUMN_ALIASES = {

  movie: [

    "movie",
    "movie name",
    "film",
    "film name",
    "title",
    "picture",

    "الفيلم",
    "اسم الفيلم",
    "اسم الفلم"

  ],

  tickets: [

    "tickets",
    "ticket",
    "admissions",
    "attendance",
    "audience",
    "qty",
    "quantity",
    "count",

    "التذاكر",
    "عدد التذاكر",
    "الحضور"

  ],

  revenue: [

    "revenue",
    "gross",
    "net",
    "box office",
    "sales",
    "amount",

    "الإيراد",
    "الايراد",
    "الصافي",
    "المبيعات"

  ],

  version: [

    "version",
    "format",
    "type",
    "screen",

    "نسخة",
    "نوع"

  ]

};

/* =========================================================
   STRING SIMILARITY
========================================================= */

function similarity(a, b) {

  a = normalize(a);
  b = normalize(b);

  if (!a || !b)
    return 0;

  if (a === b)
    return 100;

  if (a.includes(b))
    return 90;

  if (b.includes(a))
    return 90;

  let score = 0;

  for (const word of b.split(" ")) {

    if (
      a.includes(word)
    ) {

      score += 25;

    }

  }

  return score;

}

function containsHeader(
  text,
  aliases
) {

  return aliases.some(

    alias =>

      similarity(
        text,
        alias
      ) >= 50

  );

}

/* =========================================================
   COLUMN DETECTION
========================================================= */

function bestColumn(
  row,
  aliases
) {

  let bestIndex = -1;

  let bestScore = 0;

  row.forEach(

    (cell, index) => {

      for (const alias of aliases) {

        const score =
          similarity(
            cell,
            alias
          );

        if (
          score > bestScore
        ) {

          bestScore =
            score;

          bestIndex =
            index;

        }

      }

    }

  );

  if (
    bestScore < 50
  ) {

    return -1;

  }

  return bestIndex;

}

function detectHeader(row) {

  const movieCol =
    bestColumn(
      row,
      COLUMN_ALIASES.movie
    );

  const ticketsCol =
    bestColumn(
      row,
      COLUMN_ALIASES.tickets
    );

  const revenueCol =
    bestColumn(
      row,
      COLUMN_ALIASES.revenue
    );

  const versionCol =
    bestColumn(
      row,
      COLUMN_ALIASES.version
    );

  if (

    movieCol === -1 ||

    ticketsCol === -1 ||

    revenueCol === -1

  ) {

    return null;

  }

  return {

    movieCol,

    ticketsCol,

    revenueCol,

    versionCol

  };

}

function guessColumns(
  rows
) {

  let best = null;

  let score = 0;

  for (
    const row of rows
  ) {

    const header =
      detectHeader(row);

    if (!header)
      continue;

    let s = 0;

    if (
      header.movieCol >= 0
    )
      s += 40;

    if (
      header.ticketsCol >= 0
    )
      s += 30;

    if (
      header.revenueCol >= 0
    )
      s += 30;

    if (
      s > score
    ) {

      score = s;

      best = header;

    }

  }

  return best;

}
/* =========================================================
   VERSION DETECTION
========================================================= */

function detectVersion(text) {

  text = normalize(text);

  if (text.includes("imax"))
    return "IMAX";

  if (text.includes("4dx"))
    return "4DX";

  if (text.includes("mx4d"))
    return "MX4D";

  if (text.includes("screenx"))
    return "SCREENX";

  if (text.includes("vip"))
    return "VIP";

  if (text.includes("dolby"))
    return "Dolby";

  if (text.includes("3d"))
    return "3D";

  if (text.includes("2d"))
    return "2D";

  return "";

}

/* =========================================================
   STOP WORDS
========================================================= */

const STOP_WORDS = [

  "grand total",
  "total",
  "subtotal",
  "total revenue",
  "total tickets",

  "الإجمالي",
  "الاجمالي",
  "اجمالي",
  "المجموع",
  "الإيراد الكلي",
  "إجمالي الإيراد"

];

function isStopRow(row) {

  const text =
    normalize(
      row.join(" ")
    );

  return STOP_WORDS.some(
    word =>
      text.includes(
        normalize(word)
      )
  );

}

/* =========================================================
   CINEMA DETECTION
========================================================= */

function detectCinema(
  rows,
  headerIndex
) {

  for (
    let i = headerIndex - 1;
    i >= 0;
    i--
  ) {

    const row = rows[i];

    if (
      isEmptyRow(row)
    ) {
      continue;
    }

    const text =
      clean(row[0]);

    if (!text)
      continue;

    if (

      containsHeader(
        text,
        COLUMN_ALIASES.movie
      ) ||

      containsHeader(
        text,
        COLUMN_ALIASES.tickets
      ) ||

      containsHeader(
        text,
        COLUMN_ALIASES.revenue
      )

    ) {

      continue;

    }

    if (
      /\d{4}[\/-]\d{1,2}[\/-]\d{1,2}/
      .test(text)
    ) {

      continue;

    }

    return text;

  }

  return "";

}

/* =========================================================
   MOVIE VALIDATION
========================================================= */

function isMovieRow(
  movie,
  tickets,
  revenue
) {

  if (!movie)
    return false;

  if (
    tickets === 0 &&
    revenue === 0
  ) {

    return false;

  }

  return true;

}
/* =========================================================
   SMART ROW EXTRACTION
========================================================= */

function extractRows(rows) {

  const result = [];

  const reportDate =
    detectDate(rows);

  let currentCinema = "";

  let header =
    guessColumns(
      rows.slice(0, 20)
    );

  let collecting = false;

  for (
    let i = 0;
    i < rows.length;
    i++
  ) {

    const row = rows[i];

    //----------------------------------
    // Empty Row
    //----------------------------------

    if (
      isEmptyRow(row)
    ) {
      continue;
    }

    //----------------------------------
    // Header Detection
    //----------------------------------

    const foundHeader =
      detectHeader(row);

    if (foundHeader) {

      header =
        foundHeader;

      currentCinema =
        detectCinema(
          rows,
          i
        );

      collecting = true;

      continue;

    }

    //----------------------------------
    // Skip Until Header
    //----------------------------------

    if (
      !collecting ||
      !header
    ) {
      continue;
    }

    //----------------------------------
    // Stop Row
    //----------------------------------

    if (
      isStopRow(row)
    ) {

      collecting = false;

      continue;

    }

    //----------------------------------
    // Read Movie
    //----------------------------------

    const movie =
      clean(
        row[
          header.movieCol
        ]
      );

    const tickets =
      toNumber(
        row[
          header.ticketsCol
        ]
      );

    const revenue =
      toNumber(
        row[
          header.revenueCol
        ]
      );

    //----------------------------------
    // Skip Invalid
    //----------------------------------

    if (
      !isMovieRow(
        movie,
        tickets,
        revenue
      )
    ) {

      continue;

    }

    //----------------------------------
    // Version
    //----------------------------------

    let version = "";

    if (
      header.versionCol >= 0
    ) {

      version =
        clean(
          row[
            header.versionCol
          ]
        );

    }

    if (!version) {

      version =
        detectVersion(
          movie
        );

    }

    //----------------------------------
    // Save Row
    //----------------------------------

    result.push({

      reportDate,

      cinema:
        currentCinema,

      movie,

      version,

      tickets,

      revenue,

    });

  }

  return result;

}
/* =========================================================
   SMART PARSER
========================================================= */

export function smartParser(document) {

  const allRows = [];

  //----------------------------------
  // Excel / CSV / PDF / Image
  //----------------------------------

  if (
    document?.sheets &&
    Array.isArray(document.sheets)
  ) {

    for (const sheet of document.sheets) {

      const rows =
        extractRows(
          sheet.rows || []
        );

      allRows.push(...rows);

    }

  }

  //----------------------------------
  // Text / WhatsApp
  //----------------------------------

  if (
    document?.text &&
    allRows.length === 0
  ) {

    const rows = document.text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line =>
        line.split(/\t| {2,}/)
      );

    allRows.push(
      ...extractRows(rows)
    );

  }

  //----------------------------------
  // Remove Duplicates
  //----------------------------------

  const unique = new Map();

  for (const row of allRows) {

    const key = [

      normalize(row.cinema),

      normalize(row.movie),

      normalize(row.version),

      row.tickets,

      row.revenue

    ].join("|");

    if (!unique.has(key)) {

      unique.set(key, row);

    }

  }

  const rows =
    Array.from(
      unique.values()
    );

  return {

    reportDate:
      rows[0]?.reportDate || "",

    rows,

  };

}
/* =========================================================
   SMART CLEANUP
========================================================= */

export function normalizeImportRows(rows) {

  const cleaned = [];

  const keys = new Set();

  for (const row of rows) {

    const movie =
      clean(row.movie);

    const cinema =
      clean(row.cinema);

    const version =
      clean(row.version);

    const tickets =
      toNumber(row.tickets);

    const revenue =
      toNumber(row.revenue);

    if (
      !movie ||
      !cinema
    ) {
      continue;
    }

    if (
      tickets === 0 &&
      revenue === 0
    ) {
      continue;
    }

    const key = [

      normalize(cinema),

      normalize(movie),

      normalize(version),

      tickets,

      revenue

    ].join("|");

    if (keys.has(key)) {
      continue;
    }

    keys.add(key);

    cleaned.push({

      ...row,

      movie,

      cinema,

      version,

      tickets,

      revenue,

    });

  }

  return cleaned;

}