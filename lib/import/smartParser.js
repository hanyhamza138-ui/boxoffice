/* ==========================================================
   SMART PARSER
   BoxOffice Smart Import Engine

   الهدف:

   - قراءة تقارير Excel المختلفة
   - التعرف على الأعمدة حتى لو اختلف ترتيبها
   - دعم العربية والإنجليزية
   - تمييز Tickets عن Revenue/Net بشكل صارم
   - دعم Net / Net Income / Total Net / صافي
   - تجاهل Total / Grand Total / الإجمالي
   - جمع 2D / 3D لنفس الفيلم
   - عدم اعتبار صفوف العناوين والإجماليات أفلامًا

   IMPORTANT:
   يدعم الآن التقارير التي تكون بهذا الشكل:

   سان ستيفانو
   الفيلم | التذاكر | الصافي
   محمود التاني | 672 | 99,321.60
   Spider-Man | 511 | 70,480.69
   ...
   الاجمالي | 2621 | 370,537.34

   مدينتي
   الفيلم | التذاكر | الصافي
   محمود التاني | 694 | 149,533.07
   ...

   أي أن اسم السينما يكون في صف مستقل
   قبل جدول الأفلام.
   ========================================================== */


/* ==========================================================
   Helpers
========================================================== */

function clean(value = "") {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}


/* ==========================================================
   Arabic Normalization
========================================================== */

function normalizeArabic(value = "") {
  return clean(value)
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
}


/* ==========================================================
   Remove Decorations
========================================================== */

function removeDecorations(value = "") {
  return String(value ?? "")
    .replace(/ـ+/g, "")
    .replace(/[•●▪■◆◇★☆]+/g, " ")
    .replace(/[|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


/* ==========================================================
   Normalize Text
========================================================== */

function normalizeText(value = "") {
  return removeDecorations(
    normalizeArabic(value)
  )
    .replace(/[():،,.;|/\\_*]+/g, " ")
    .replace(/[-–—]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}


/* ==========================================================
   Normalize Header
========================================================== */

function normalizeHeader(value = "") {
  return normalizeText(value);
}


/* ==========================================================
   Date Detection
========================================================== */

export function detectReportDate(rows = []) {
  const dateRegex =
    /\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/;

  for (const row of rows) {
    if (!Array.isArray(row)) {
      continue;
    }

    for (const cell of row) {
      if (cell == null) {
        continue;
      }

      /* Excel Date */
      if (
        cell instanceof Date &&
        !isNaN(cell.getTime())
      ) {
        const year =
          cell.getFullYear();

        const month =
          String(
            cell.getMonth() + 1
          ).padStart(2, "0");

        const day =
          String(
            cell.getDate()
          ).padStart(2, "0");

        return `${year}-${month}-${day}`;
      }

      const text =
        String(cell).trim();

      const match =
        text.match(dateRegex);

      if (match) {
        const year = match[1];

        const month =
          String(match[2])
            .padStart(2, "0");

        const day =
          String(match[3])
            .padStart(2, "0");

        return `${year}-${month}-${day}`;
      }

      /* دعم DD/MM/YYYY */
      const reverseMatch =
        text.match(
          /\b(\d{1,2})[/.](\d{1,2})[/.](20\d{2})\b/
        );

      if (reverseMatch) {
        const day =
          String(reverseMatch[1])
            .padStart(2, "0");

        const month =
          String(reverseMatch[2])
            .padStart(2, "0");

        const year =
          reverseMatch[3];

        return `${year}-${month}-${day}`;
      }
    }
  }

  return "";
}


/* ==========================================================
   Backward-compatible alias
========================================================== */

export function detectDate(rows = []) {
  return detectReportDate(rows);
}


/* ==========================================================
   Header Aliases
========================================================== */

const HEADER_ALIASES = {
  cinema: [
    "cinema",
    "cinema name",
    "cinema names",
    "cinemas",
    "theater",
    "theatre",
    "location",
    "branch",
    "venue",

    "السينما",
    "اسم السينما",
    "السينما اسم",
    "فرع",
    "اسم الفرع",
    "المجمع",
    "مجمع السينما",
    "الدار",
  ],

  movie: [
    "movie",
    "movie name",
    "film",
    "film name",
    "title",
    "movie title",
    "name",

    "الفيلم",
    "اسم الفيلم",
    "فيلم",
    "اسم العمل",
    "العمل",
  ],

  version: [
    "version",
    "format",
    "type",
    "screen type",
    "version name",
    "show type",

    "النسخة",
    "نوع",
    "الصيغة",
    "نوع العرض",
    "نوع النسخة",
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
    "tickets count",
    "ticket count",
    "number of tickets",

    "التذاكر",
    "تذاكر",
    "عدد التذاكر",
    "الجمهور",
    "الحضور",
    "عدد الرواد",
    "الرواد",
    "عدد الجمهور",
    "العدد",
  ],

  revenue: [
    "revenue",
    "sales",
    "gross",
    "income",
    "amount",
    "box office",
    "boxoffice",

    "net",
    "net income",
    "net revenue",
    "total net",
    "net sales",

    "الصافي",
    "صافى",
    "صافي",
    "صافي الايراد",
    "صافي الإيراد",
    "صافي الإيرادات",
    "الايراد الصافي",
    "الإيراد الصافي",
    "الايرادات الصافية",
    "الإيرادات الصافية",
    "الإيراد",
    "الايراد",
    "الإيرادات",
    "الايرادات",
    "المبيعات",
    "إيراد",
  ],

  tax: [
    "tax",
    "taxes",
    "entry tax",
    "total entry tax",
    "vat",
    "total vat",

    "ضريبة",
    "الضريبة",
    "ضرائب",
    "ضريبة الدخول",
    "القيمة المضافة",
    "ضريبة القيمة المضافة",
  ],

  price: [
    "price",
    "ticket price",
    "unit price",
    "ticket value",

    "السعر",
    "سعر التذكرة",
    "قيمة التذكرة",
  ],
};


/* ==========================================================
   Generic Header Matching
========================================================== */

function aliasExact(
  value,
  aliases = []
) {
  const normalized =
    normalizeHeader(value);

  if (!normalized) {
    return false;
  }

  return aliases.some(
    (alias) =>
      normalized ===
      normalizeHeader(alias)
  );
}


/* ==========================================================
   Conservative Contains Matching
========================================================== */

function aliasContains(
  value,
  aliases = []
) {
  const normalized =
    normalizeHeader(value);

  if (!normalized) {
    return false;
  }

  return aliases.some((alias) => {
    const normalizedAlias =
      normalizeHeader(alias);

    if (!normalizedAlias) {
      return false;
    }

    return (
      normalized === normalizedAlias ||
      normalized.includes(normalizedAlias) ||
      normalizedAlias.includes(normalized)
    );
  });
}


/* ==========================================================
   Find Column
========================================================== */

function findColumn(
  row,
  aliases = []
) {
  if (!Array.isArray(row)) {
    return -1;
  }

  /* Exact pass */

  for (
    let i = 0;
    i < row.length;
    i++
  ) {
    if (
      aliasExact(
        row[i],
        aliases
      )
    ) {
      return i;
    }
  }

  /* Contains pass */

  for (
    let i = 0;
    i < row.length;
    i++
  ) {
    if (
      aliasContains(
        row[i],
        aliases
      )
    ) {
      return i;
    }
  }

  return -1;
}


/* ==========================================================
   Special Revenue Detection
========================================================== */

function findRevenueColumn(row) {
  if (!Array.isArray(row)) {
    return -1;
  }

  const headers =
    row.map((value) =>
      normalizeHeader(value)
    );

  /* --------------------------------------------------------
     Priority 1: Net Income
  -------------------------------------------------------- */

  const netIncomeAliases = [
    "net income",
    "net revenue",
    "net sales",
    "total net",

    "صافي الايراد",
    "صافي الإيراد",
    "الايراد الصافي",
    "الإيراد الصافي",
  ];

  const netIncomeIndex =
    headers.findIndex(
      (value) =>
        netIncomeAliases.includes(
          value
        )
    );

  if (netIncomeIndex >= 0) {
    return netIncomeIndex;
  }

  /* --------------------------------------------------------
     Priority 2: Net
  -------------------------------------------------------- */

  const netIndex =
    headers.findIndex(
      (value) =>
        value === "net" ||
        value === "الصافي" ||
        value === "صافى" ||
        value === "صافي"
    );

  if (netIndex >= 0) {
    return netIndex;
  }

  /* --------------------------------------------------------
     Priority 3: Revenue / Sales / Income
  -------------------------------------------------------- */

  const revenueAliases = [
    "revenue",
    "sales",
    "income",
    "box office",
    "boxoffice",

    "الايراد",
    "الإيراد",
    "الايرادات",
    "الإيرادات",
    "المبيعات",
  ];

  const revenueIndex =
    headers.findIndex(
      (value) =>
        revenueAliases.includes(
          value
        )
    );

  if (revenueIndex >= 0) {
    return revenueIndex;
  }

  /* --------------------------------------------------------
     Priority 4: Gross
  -------------------------------------------------------- */

  const grossIndex =
    headers.findIndex(
      (value) =>
        value === "gross" ||
        value === "gross revenue"
    );

  if (grossIndex >= 0) {
    return grossIndex;
  }

  return -1;
}


/* ==========================================================
   Header Detection
========================================================== */

export function detectHeader(row) {
  if (!Array.isArray(row)) {
    return null;
  }

  const cinemaCol =
    findColumn(
      row,
      HEADER_ALIASES.cinema
    );

  const movieCol =
    findColumn(
      row,
      HEADER_ALIASES.movie
    );

  const versionCol =
    findColumn(
      row,
      HEADER_ALIASES.version
    );

  const ticketsCol =
    findColumn(
      row,
      HEADER_ALIASES.tickets
    );

  const revenueCol =
    findRevenueColumn(row);

  /* Revenue cannot equal Tickets */

  const safeRevenueCol =
    revenueCol === ticketsCol
      ? -1
      : revenueCol;

  const detectedCount = [
    cinemaCol,
    movieCol,
    ticketsCol,
    safeRevenueCol,
  ].filter(
    (value) => value >= 0
  ).length;

  if (detectedCount < 2) {
    return null;
  }

  return {
    cinemaCol,
    movieCol,
    versionCol,
    ticketsCol,
    revenueCol:
      safeRevenueCol,
  };
}


/* ==========================================================
   Numeric Helpers
========================================================== */

function toNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  let text =
    String(value)
      .trim()
      .replace(/,/g, "")
      .replace(/٬/g, "")
      .replace(/٫/g, ".")
      .replace(/[^\d.-]/g, "");

  if (!text) {
    return 0;
  }

  const number =
    Number(text);

  return Number.isFinite(number)
    ? number
    : 0;
}


/* ==========================================================
   Total / Footer Detection
========================================================== */

function isTotalRow(row = []) {
  if (!Array.isArray(row)) {
    return false;
  }

  const text =
    row
      .map((value) =>
        normalizeText(value)
      )
      .filter(Boolean)
      .join(" ");

  if (!text) {
    return false;
  }

  const totalWords = [
    "total",
    "grand total",
    "subtotal",
    "total net",
    "total revenue",

    "الاجمالي",
    "الإجمالي",
    "اجمالي",
    "إجمالي",
    "المجموع",
    "مجموع",

    "اجمالي الايراد",
    "إجمالي الإيراد",
    "الاجمالي العام",
    "الإجمالي العام",

    "total attendance",
    "total tickets",
    "totals",
  ];

  return totalWords.some(
    (word) => {
      const normalizedWord =
        normalizeText(word);

      return (
        text === normalizedWord ||
        text.startsWith(
          normalizedWord + " "
        ) ||
        text.includes(
          " " +
            normalizedWord +
            " "
        )
      );
    }
  );
}


/* ==========================================================
   Metadata Row Detection
========================================================== */

function isMetadataRow(row = []) {
  if (!Array.isArray(row)) {
    return false;
  }

  const text =
    row
      .map((value) =>
        normalizeText(value)
      )
      .filter(Boolean)
      .join(" ");

  if (!text) {
    return true;
  }

  const metadataWords = [
    "report date",
    "date",
    "company",
    "cinema report",
    "box office report",

    "التاريخ",
    "تاريخ التقرير",
    "الشركة",
    "تقرير",
    "تقرير السينما",
    "تقرير الايرادات",
    "تقرير الإيرادات",
  ];

  return metadataWords.some(
    (word) => {
      const normalizedWord =
        normalizeText(word);

      return (
        text === normalizedWord ||
        text.startsWith(
          normalizedWord + " "
        )
      );
    }
  );
}


/* ==========================================================
   Detect Movie Header Row
========================================================== */

function isMovieHeaderRow(row = []) {
  if (!Array.isArray(row)) {
    return false;
  }

  const values =
    row
      .map((value) =>
        normalizeHeader(value)
      )
      .filter(Boolean);

  if (!values.length) {
    return false;
  }

  const hasMovie =
    values.some(
      (value) =>
        HEADER_ALIASES.movie.some(
          (alias) =>
            normalizeHeader(alias) ===
            value
        )
    );

  const hasTickets =
    values.some(
      (value) =>
        HEADER_ALIASES.tickets.some(
          (alias) =>
            normalizeHeader(alias) ===
            value
        )
    );

  const hasRevenue =
    values.some(
      (value) =>
        HEADER_ALIASES.revenue.some(
          (alias) =>
            normalizeHeader(alias) ===
            value
        )
    );

  return (
    hasMovie &&
    hasTickets &&
    hasRevenue
  );
}


/* ==========================================================
   Detect Cinema Section Row

   مهم جدًا:

   المثال:

   [ "سان ستيفانو", "", "" ]

   تعتبر سينما.

   لكن:

   [ "الفيلم", "التذاكر", "الصافي" ]

   ليست سينما.

   وكذلك:

   [ "الاجمالي", "2621", "370537.34" ]

   ليست سينما.
========================================================== */

function detectCinemaSectionRow(row = []) {
  if (!Array.isArray(row)) {
    return "";
  }

  const nonEmpty =
    row
      .map((value) =>
        String(value ?? "").trim()
      )
      .filter(Boolean);

  if (nonEmpty.length !== 1) {
    return "";
  }

  const value =
    nonEmpty[0];

  const normalized =
    normalizeText(value);

  if (!normalized) {
    return "";
  }

  /* Header */

  if (
    isMovieHeaderRow(row)
  ) {
    return "";
  }

  /* Total */

  if (
    isTotalRow(row)
  ) {
    return "";
  }

  /* Metadata */

  if (
    isMetadataRow(row)
  ) {
    return "";
  }

  /* كلمات لا يمكن أن تكون سينما */

  const invalidCinemaWords = [
    "الفيلم",
    "فيلم",
    "movie",
    "movie name",
    "film",
    "title",
    "التذاكر",
    "تذاكر",
    "tickets",
    "ticket",
    "الصافي",
    "صافي",
    "الصافي",
    "net",
    "revenue",
    "revenue",
    "sales",
    "version",
    "النسخة",
  ];

  if (
    invalidCinemaWords.some(
      (word) =>
        normalizeText(word) ===
        normalized
    )
  ) {
    return "";
  }

  return value;
}


/* ==========================================================
   Guess Columns
========================================================== */

export function guessColumns(rows = []) {
  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {
    return null;
  }

  /* Try headers first */

  for (const row of rows) {
    const detected =
      detectHeader(row);

    if (detected) {
      return detected;
    }
  }

  /* Find first non-empty row */

  const firstRow =
    rows.find(
      (row) =>
        Array.isArray(row) &&
        row.some(
          (value) =>
            String(
              value ?? ""
            ).trim() !== ""
        )
    );

  if (!firstRow) {
    return null;
  }

  const length =
    firstRow.length;

  /* Cinema | Movie | Version | Tickets | Revenue */

  if (length >= 5) {
    return {
      cinemaCol: 0,
      movieCol: 1,
      versionCol: 2,
      ticketsCol: 3,
      revenueCol: 4,
    };
  }

  /* Movie | Version | Tickets | Revenue */

  if (length === 4) {
    return {
      cinemaCol: -1,
      movieCol: 0,
      versionCol: 1,
      ticketsCol: 2,
      revenueCol: 3,
    };
  }

  /* Movie | Tickets | Revenue */

  if (length === 3) {
    return {
      cinemaCol: -1,
      movieCol: 0,
      versionCol: -1,
      ticketsCol: 1,
      revenueCol: 2,
    };
  }

  return null;
}


/* ==========================================================
   Normalize Imported Rows
========================================================== */

export function normalizeImportRows(
  rows = []
) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => ({
      cinema:
        row?.cinema ??
        row?.cinema_name ??
        row?.cinemaName ??
        "",

      movie:
        row?.movie ??
        row?.movie_name ??
        row?.movieName ??
        row?.title ??
        "",

      version:
        row?.version ??
        row?.format ??
        row?.type ??
        "",

      tickets:
        row?.tickets ??
        row?.ticket_count ??
        row?.attendance ??
        row?.audience ??
        "",

      revenue:
        row?.revenue ??
        row?.net ??
        row?.net_income ??
        row?.netIncome ??
        row?.total_net ??
        row?.sales ??
        row?.gross ??
        row?.amount ??
        "",
    }))
    .filter((row) => {
      return (
        clean(row.cinema) !== "" ||
        clean(row.movie) !== "" ||
        clean(row.version) !== "" ||
        clean(row.tickets) !== "" ||
        clean(row.revenue) !== ""
      );
    });
}


/* ==========================================================
   Validate Imported Row
========================================================== */

function isUsefulImportedRow(row) {
  if (!row) {
    return false;
  }

  const movie =
    normalizeText(row.movie);

  const cinema =
    normalizeText(row.cinema);

  const tickets =
    toNumber(row.tickets);

  const revenue =
    toNumber(row.revenue);

  /* Empty row */

  if (
    !movie &&
    !cinema &&
    tickets === 0 &&
    revenue === 0
  ) {
    return false;
  }

  /* Total row */

  if (
    isTotalRow([
      row.cinema,
      row.movie,
      row.version,
      row.tickets,
      row.revenue,
    ])
  ) {
    return false;
  }

  /* Movie is required */

  if (movie) {
    return true;
  }

  return false;
}


/* ==========================================================
   Merge Same Movie Versions

   السينما أصبحت جزءًا من المفتاح.

   لذلك:

   سان ستيفانو + محمود التاني
   و
   مدينتي + محمود التاني

   لا يتم دمجهم معًا.
========================================================== */

function mergeMovieRows(rows = []) {
  const map = new Map();

  for (const row of rows) {
    const cinema =
      normalizeText(
        row.cinema
      );

    const movie =
      normalizeText(
        row.movie
      );

    const key =
      `${cinema}|||${movie}`;

    if (!movie) {
      continue;
    }

    if (!map.has(key)) {
      map.set(key, {
        cinema:
          row.cinema ?? "",

        movie:
          row.movie ?? "",

        version:
          row.version ?? "",

        tickets:
          toNumber(
            row.tickets
          ),

        revenue:
          toNumber(
            row.revenue
          ),
      });

      continue;
    }

    const existing =
      map.get(key);

    existing.tickets +=
      toNumber(
        row.tickets
      );

    existing.revenue +=
      toNumber(
        row.revenue
      );

    if (
      !existing.version &&
      row.version
    ) {
      existing.version =
        row.version;
    }
  }

  return Array.from(
    map.values()
  );
}


/* ==========================================================
   SMART PARSER
========================================================== */

export function smartParser(document) {
  if (!document) {
    return {
      reportDate: "",
      rows: [],
    };
  }

  const sheets =
    Array.isArray(
      document.sheets
    )
      ? document.sheets
      : [];

  let reportDate = "";

  let allRows = [];

  console.log(
    "===================================="
  );

  console.log(
    "🧠 SMART PARSER START"
  );

  console.log(
    "Sheets:",
    sheets.length
  );

  /* ========================================================
     Sheets
  ======================================================== */

  for (
    let sheetIndex = 0;
    sheetIndex < sheets.length;
    sheetIndex++
  ) {
    const sheet =
      sheets[sheetIndex];

    const data =
      Array.isArray(
        sheet?.rows
      )
        ? sheet.rows
        : [];

    if (!data.length) {
      continue;
    }

    console.log(
      "📄 Sheet:",
      sheet?.name ??
        sheet?.sheetName ??
        sheetIndex,

      "Rows:",
      data.length
    );

    /* ------------------------------------------------------
       Date
    ------------------------------------------------------ */

    if (!reportDate) {
      reportDate =
        detectReportDate(data);
    }

    let header = null;

    let headerIndex = -1;

    /* ======================================================
       IMPORTANT:

       في التقرير الجديد لا نبحث عن Header مرة واحدة فقط.

       كل سينما لها:

       cinema name
       header
       movies
       total

       لذلك نبحث عن كل Header أثناء المرور.
    ====================================================== */

    let currentCinema = "";

    /* ------------------------------------------------------
       First pass:

       Find whether the sheet uses section cinema rows.
    ------------------------------------------------------ */

    let usesCinemaSections = false;

    for (
      let i = 0;
      i < Math.min(100, data.length);
      i++
    ) {
      const cinema =
        detectCinemaSectionRow(
          data[i]
        );

      if (cinema) {
        usesCinemaSections = true;
        break;
      }
    }

    console.log(
      "🏢 Cinema Sections:",
      usesCinemaSections
    );

    /* ======================================================
       SECTION-BASED PARSER

       هذا هو الإصلاح الأساسي.
    ====================================================== */

    if (usesCinemaSections) {
      for (
        let i = 0;
        i < data.length;
        i++
      ) {
        const row =
          data[i];

        if (
          !Array.isArray(row)
        ) {
          continue;
        }

        /* Empty row */

        if (
          row.every(
            (value) =>
              String(
                value ?? ""
              ).trim() === ""
          )
        ) {
          continue;
        }

        /* --------------------------------------------------
           Detect Cinema Section
        -------------------------------------------------- */

        const detectedCinema =
          detectCinemaSectionRow(
            row
          );

        if (detectedCinema) {
          currentCinema =
            detectedCinema;

          console.log(
            "🏢 CINEMA SECTION:",
            currentCinema
          );

          continue;
        }

        /* --------------------------------------------------
           Detect Header
        -------------------------------------------------- */

        const detectedHeader =
          detectHeader(row);

        if (
          detectedHeader &&
          isMovieHeaderRow(row)
        ) {
          header =
            detectedHeader;

          headerIndex =
            i;

          console.log(
            "✅ Header detected:",
            row
          );

          console.log(
            "📌 Columns:",
            header
          );

          console.log(
            "🏢 Current Cinema:",
            currentCinema || "(none)"
          );

          continue;
        }

        /* --------------------------------------------------
           No Header Yet
        -------------------------------------------------- */

        if (!header) {
          continue;
        }

        /* --------------------------------------------------
           Total
        -------------------------------------------------- */

        if (
          isTotalRow(row)
        ) {
          console.log(
            "⏭️ Skipping total row:",
            row
          );

          continue;
        }

        /* --------------------------------------------------
           Metadata
        -------------------------------------------------- */

        if (
          isMetadataRow(row)
        ) {
          continue;
        }

        /* --------------------------------------------------
           Build Imported Row
        -------------------------------------------------- */

        const imported = {
          cinema:
            currentCinema,

          movie:
            header.movieCol >= 0
              ? row[
                  header.movieCol
                ] ?? ""
              : "",

          version:
            header.versionCol >= 0
              ? row[
                  header.versionCol
                ] ?? ""
              : "",

          tickets:
            header.ticketsCol >= 0
              ? row[
                  header.ticketsCol
                ] ?? ""
              : "",

          revenue:
            header.revenueCol >= 0
              ? row[
                  header.revenueCol
                ] ?? ""
              : "",
        };

        /* ----------------------------------------------
           Revenue Protection
        ---------------------------------------------- */

        if (
          header.revenueCol ===
          header.ticketsCol
        ) {
          imported.revenue = "";
        }

        /* ----------------------------------------------
           Numbers
        ---------------------------------------------- */

        imported.tickets =
          toNumber(
            imported.tickets
          );

        imported.revenue =
          toNumber(
            imported.revenue
          );

        /* ----------------------------------------------
           Validate
        ---------------------------------------------- */

        if (
          !isUsefulImportedRow(
            imported
          )
        ) {
          continue;
        }

        /* ----------------------------------------------
           IMPORTANT DEBUG
        ---------------------------------------------- */

        console.log(
          "🎬 IMPORTED:",
          {
            cinema:
              imported.cinema,

            movie:
              imported.movie,

            tickets:
              imported.tickets,

            revenue:
              imported.revenue,
          }
        );

        allRows.push(
          imported
        );
      }

      continue;
    }

    /* ======================================================
       NORMAL TABLE PARSER

       يستخدم للتقارير القديمة التي يكون فيها Cinema
       عمودًا داخل الجدول.
    ====================================================== */

    for (
      let i = 0;
      i < Math.min(50, data.length);
      i++
    ) {
      const detected =
        detectHeader(
          data[i]
        );

      if (detected) {
        header =
          detected;

        headerIndex =
          i;

        console.log(
          "✅ Header detected:",
          data[i]
        );

        console.log(
          "📌 Columns:",
          header
        );

        break;
      }
    }

    /* ------------------------------------------------------
       Guess Header
    ------------------------------------------------------ */

    if (!header) {
      header =
        guessColumns(
          data.slice(0, 50)
        );

      if (header) {
        headerIndex = 0;

        console.log(
          "⚠️ Header guessed:",
          header
        );
      }
    }

    if (!header) {
      console.warn(
        "⚠️ Could not detect columns in sheet"
      );

      continue;
    }

    /* ------------------------------------------------------
       Revenue Protection
    ------------------------------------------------------ */

    if (
      header.revenueCol ===
      header.ticketsCol
    ) {
      console.error(
        "❌ Revenue column equals Tickets column. Rejecting revenue."
      );

      header.revenueCol = -1;
    }

    if (
      header.revenueCol < 0
    ) {
      console.warn(
        "⚠️ Revenue column not detected."
      );
    }

    /* ------------------------------------------------------
       Extract Rows
    ------------------------------------------------------ */

    for (
      let i =
        headerIndex + 1;
      i < data.length;
      i++
    ) {
      const row =
        data[i];

      if (
        !Array.isArray(row)
      ) {
        continue;
      }

      /* Empty row */

      if (
        row.every(
          (value) =>
            String(
              value ?? ""
            ).trim() === ""
        )
      ) {
        continue;
      }

      /* Total */

      if (
        isTotalRow(row)
      ) {
        console.log(
          "⏭️ Skipping total row:",
          row
        );

        continue;
      }

      /* Metadata */

      if (
        isMetadataRow(row)
      ) {
        continue;
      }

      /* Build Imported Row */

      const imported = {
        cinema:
          header.cinemaCol >= 0
            ? row[
                header.cinemaCol
              ] ?? ""
            : "",

        movie:
          header.movieCol >= 0
            ? row[
                header.movieCol
              ] ?? ""
            : "",

        version:
          header.versionCol >= 0
            ? row[
                header.versionCol
              ] ?? ""
            : "",

        tickets:
          header.ticketsCol >= 0
            ? row[
                header.ticketsCol
              ] ?? ""
            : "",

        revenue:
          header.revenueCol >= 0
            ? row[
                header.revenueCol
              ] ?? ""
            : "",
      };

      /* Revenue cannot be Tickets */

      if (
        header.revenueCol ===
        header.ticketsCol
      ) {
        imported.revenue = "";
      }

      /* Numbers */

      imported.tickets =
        toNumber(
          imported.tickets
        );

      imported.revenue =
        toNumber(
          imported.revenue
        );

      /* Validate */

      if (
        !isUsefulImportedRow(
          imported
        )
      ) {
        continue;
      }

      allRows.push(
        imported
      );
    }
  }

  /* ========================================================
     Normalize
  ======================================================== */

  let normalizedRows =
    normalizeImportRows(
      allRows
    );

  /* ========================================================
     Normalize Numbers
  ======================================================== */

  normalizedRows =
    normalizedRows.map(
      (row) => ({
        ...row,

        tickets:
          toNumber(
            row.tickets
          ),

        revenue:
          toNumber(
            row.revenue
          ),
      })
    );

  /* ========================================================
     Merge 2D / 3D

     السينما تدخل في مفتاح الدمج،
     لذلك لا تختلط بيانات السينمات.
  ======================================================== */

  normalizedRows =
    mergeMovieRows(
      normalizedRows
    );

  /* ========================================================
     Final Statistics
  ======================================================== */

  const totalTickets =
    normalizedRows.reduce(
      (sum, row) =>
        sum +
        toNumber(
          row.tickets
        ),
      0
    );

  const totalRevenue =
    normalizedRows.reduce(
      (sum, row) =>
        sum +
        toNumber(
          row.revenue
        ),
      0
    );

  console.log(
    "===================================="
  );

  console.log(
    "🧠 SMART PARSER RESULT"
  );

  console.log(
    "Report Date:",
    reportDate
  );

  console.log(
    "Rows:",
    normalizedRows.length
  );

  console.log(
    "Tickets:",
    totalTickets
  );

  console.log(
    "Revenue:",
    totalRevenue
  );

  console.log(
    "🏢 Cinemas:",
    [
      ...new Set(
        normalizedRows
          .map(
            (row) =>
              row.cinema
          )
          .filter(Boolean)
      ),
    ]
  );

  console.log(
    "===================================="
  );

  return {
    reportDate,

    rows:
      normalizedRows,
  };
}


/* ==========================================================
   Default Export
========================================================== */

export default smartParser;