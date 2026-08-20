
/* ==========================================================
   SMART PARSER
   BoxOffice Smart Import Engine
   ----------------------------------------------------------
   الهدف:
   - قراءة تقارير Excel المختلفة
   - التعرف على الأعمدة حتى لو اختلف ترتيبها
   - دعم العربية والإنجليزية
   - تمييز Tickets عن Revenue/Net بشكل صارم
   - دعم Net / Net Income / Total Net / صافي
   - تجاهل Total / Grand Total / الإجمالي
   - جمع 2D / 3D لنفس الفيلم
   - عدم اعتبار صفوف العناوين والإجماليات أفلامًا
   ========================================================== */

/* ==========================================================
   Helpers
   ========================================================== */

function clean(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/*
  تطبيع عربي قوي:
  أ / إ / آ  -> ا
  ة           -> ه
  ى           -> ي
  ي / ى       -> ي
*/

function normalizeArabic(value = "") {
  return clean(value)
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
}

/*
  إزالة علامات التمديد العربية ـــــــــ
  وكذلك التكرارات غير المفيدة.
*/

function removeDecorations(value = "") {
  return String(value ?? "")
    .replace(/ـ+/g, "")
    .replace(/[•●▪■◆◇★☆]+/g, " ")
    .replace(/[|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
  تطبيع النص المستخدم للمقارنة.
*/

function normalizeText(value = "") {
  return removeDecorations(
    normalizeArabic(value)
  )
    .replace(/[():،,.;|/\\_]+/g, " ")
    .replace(/[-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/*
  تطبيع اسم العمود.
*/

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
    if (!Array.isArray(row)) continue;

    for (const cell of row) {
      if (cell == null) continue;

      if (
        cell instanceof Date &&
        !isNaN(cell.getTime())
      ) {
        const year = cell.getFullYear();

        const month = String(
          cell.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
          cell.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
      }

      const text = String(cell).trim();

      const match = text.match(dateRegex);

      if (match) {
        const year = match[1];

        const month = String(
          match[2]
        ).padStart(2, "0");

        const day = String(
          match[3]
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
      }
    }
  }

  return "";
}

/*
  Backward-compatible alias
*/

export function detectDate(rows = []) {
  return detectReportDate(rows);
}

/* ==========================================================
   Header Aliases
   ========================================================== */

/*
  مهم جدًا:
  لا نضع "net" ضمن tickets.
  ولا نسمح بأن revenue يتعرف على أي عمود لمجرد
  أنه يحتوي كلمة مشابهة.

  الإيراد له مجموعة مستقلة وصريحة.
*/

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
    "movie name",
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

  /*
    أعمدة الضرائب لا يجب أن تعتبر Revenue.
  */

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

  /*
    أعمدة الأسعار لا يجب أن تعتبر Revenue.
  */

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

function aliasExact(value, aliases = []) {
  const normalized = normalizeHeader(value);

  if (!normalized) return false;

  return aliases.some(
    (alias) =>
      normalized === normalizeHeader(alias)
  );
}

/*
  Match أكثر تحفظًا من includes المباشر.
*/

function aliasContains(value, aliases = []) {
  const normalized = normalizeHeader(value);

  if (!normalized) return false;

  return aliases.some((alias) => {
    const normalizedAlias =
      normalizeHeader(alias);

    if (!normalizedAlias) return false;

    return (
      normalized === normalizedAlias ||
      normalized.includes(
        normalizedAlias
      ) ||
      normalizedAlias.includes(
        normalized
      )
    );
  });
}

/* ==========================================================
   Find Column
   ========================================================== */

function findColumn(row, aliases = []) {
  if (!Array.isArray(row)) {
    return -1;
  }

  /*
    Exact pass أولًا.
  */

  for (let i = 0; i < row.length; i++) {
    if (
      aliasExact(
        row[i],
        aliases
      )
    ) {
      return i;
    }
  }

  /*
    Contains pass ثانيًا.
  */

  for (let i = 0; i < row.length; i++) {
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

/*
  بعض التقارير تحتوي:

  Tickets
  Total Entry Tax
  Total VAT
  Net Income

  وبعضها:

  Tickets
  Total Net

  وبعضها:

  Tickets
  Gross
  Net

  نحتاج تمييز الإيراد الحقيقي.
*/

function findRevenueColumn(row) {
  if (!Array.isArray(row)) {
    return -1;
  }

  const headers = row.map(
    (value) =>
      normalizeHeader(value)
  );

  /*
    أولوية 1:
    Net Income
  */

  const netIncomeIndex =
    headers.findIndex((value) =>
      [
        "net income",
        "net revenue",
        "net sales",
        "total net",
        "صافي الايراد",
        "صافي الإيراد",
        "الايراد الصافي",
        "الإيراد الصافي",
      ].includes(value)
    );

  if (netIncomeIndex >= 0) {
    return netIncomeIndex;
  }

  /*
    أولوية 2:
    Net
  */

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

  /*
    أولوية 3:
    Revenue / Sales / Income
  */

  const revenueIndex =
    headers.findIndex((value) =>
      [
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
      ].includes(value)
    );

  if (revenueIndex >= 0) {
    return revenueIndex;
  }

  /*
    أولوية 4:
    Gross
    فقط إذا لم نجد Net.
  */

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

  /*
    الإيراد يتم اكتشافه بشكل منفصل
    لمنع اختيار عمود خاطئ.
  */

  const revenueCol =
    findRevenueColumn(row);

  /*
    لا نسمح أن يكون revenue هو tickets.
  */

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

  /*
    السيناريو الطبيعي:

    Movie + Tickets + Revenue

    أو

    Cinema + Movie + Tickets + Revenue

    وبالتالي 3 أعمدة على الأقل.
  */

  if (detectedCount < 2) {
    return null;
  }

  /*
    لو وجدنا Movie وTickets لكن Revenue
    غير واضح، نسمح بالهيدر.
    وسيتم التعامل مع revenue لاحقًا.
  */

  return {
    cinemaCol,
    movieCol,
    versionCol,
    ticketsCol,
    revenueCol: safeRevenueCol,
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

  /*
    Excel قد يعيد أرقامًا فعلية.
  */

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

  if (!text) return 0;

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

  if (!text) return false;

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
   Header / Metadata Row Detection
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

  if (!text) return true;

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
   Guess Columns
   ========================================================== */

export function guessColumns(rows = []) {
  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {
    return null;
  }

  /*
    أولًا:
    حاول كل صف كهيدر.
  */

  for (const row of rows) {
    const detected =
      detectHeader(row);

    if (detected) {
      return detected;
    }
  }

  /*
    لو لا يوجد Header،
    نحاول معرفة الشكل من عدد الأعمدة.
  */

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

  /*
    الشكل الشائع:

    Cinema | Movie | Version | Tickets | Revenue
  */

  if (length >= 5) {
    return {
      cinemaCol: 0,
      movieCol: 1,
      versionCol: 2,
      ticketsCol: 3,
      revenueCol: 4,
    };
  }

  /*
    Movie | Version | Tickets | Revenue
  */

  if (length === 4) {
    return {
      cinemaCol: -1,
      movieCol: 0,
      versionCol: 1,
      ticketsCol: 2,
      revenueCol: 3,
    };
  }

  /*
    Movie | Tickets | Revenue
  */

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
  if (!row) return false;

  const movie =
    normalizeText(row.movie);

  const cinema =
    normalizeText(row.cinema);

  const tickets =
    toNumber(row.tickets);

  const revenue =
    toNumber(row.revenue);

  /*
    صف فارغ.
  */

  if (
    !movie &&
    !cinema &&
    tickets === 0 &&
    revenue === 0
  ) {
    return false;
  }

  /*
    صف إجمالي.
  */

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

  /*
    لو فيه فيلم نعتبره صف بيانات.
  */

  if (movie) {
    return true;
  }

  /*
    لو لا يوجد فيلم لكن فيه أرقام،
    لا نعتبره فيلمًا.
  */

  return false;
}

/* ==========================================================
   Merge Same Movie Versions
   ========================================================== */

/*
  مثال:

  Spider-Man
  2D
  100 tickets
  1000 revenue

  Spider-Man
  3D
  50 tickets
  700 revenue

  يتحول إلى:

  Spider-Man
  150 tickets
  1700 revenue

  وهذا مهم جدًا لتقارير الشركات.
*/

function mergeMovieRows(rows = []) {
  const map =
    new Map();

  for (const row of rows) {
    const cinema =
      normalizeText(row.cinema);

    const movie =
      normalizeText(row.movie);

    const key =
      `${cinema}|||${movie}`;

    if (!movie) continue;

    if (!map.has(key)) {
      map.set(key, {
        cinema:
          row.cinema ?? "",

        movie:
          row.movie ?? "",

        version:
          row.version ?? "",

        tickets:
          toNumber(row.tickets),

        revenue:
          toNumber(row.revenue),
      });

      continue;
    }

    const existing =
      map.get(key);

    existing.tickets +=
      toNumber(row.tickets);

    existing.revenue +=
      toNumber(row.revenue);

    /*
      نحتفظ باسم النسخة إذا لم يكن موجودًا.
    */

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
   Smart Parser
   ========================================================== */

export function smartParser(
  document
) {
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

  /*
    Debug information
  */

  console.log(
    "🧠 SMART PARSER START"
  );

  console.log(
    "Sheets:",
    sheets.length
  );

  for (
    let sheetIndex = 0;
    sheetIndex < sheets.length;
    sheetIndex++
  ) {
    const sheet =
      sheets[sheetIndex];

    const data =
      Array.isArray(sheet?.rows)
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

    /*
      Date
    */

    if (!reportDate) {
      reportDate =
        detectReportDate(data);
    }

    let header = null;

    let headerIndex = -1;

    /*
      ابحث في أول 50 صف.
    */

    for (
      let i = 0;
      i <
        Math.min(
          50,
          data.length
        );
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

    /*
      إذا لم نجد Header
    */

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

    /*
      حماية مهمة:

      Revenue لا يمكن أن يكون Tickets.
    */

    if (
      header.revenueCol ===
      header.ticketsCol
    ) {
      console.error(
        "❌ Revenue column equals Tickets column. Rejecting revenue."
      );

      header.revenueCol = -1;
    }

    /*
      لو لم نجد Revenue بالهيدر،
      نحاول تحديده من الصفوف التالية
      باستخدام أسماء الأعمدة فقط.
    */

    if (
      header.revenueCol < 0
    ) {
      console.warn(
        "⚠️ Revenue column not detected."
      );
    }

    /*
      Extract rows
    */

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

      /*
        تجاهل الصفوف الفارغة
      */

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

      /*
        تجاهل Total / Grand Total
      */

      if (
        isTotalRow(row)
      ) {
        console.log(
          "⏭️ Skipping total row:",
          row
        );

        continue;
      }

      /*
        تجاهل metadata
      */

      if (
        isMetadataRow(row)
      ) {
        continue;
      }

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

      /*
        مهم:
        لو revenue هو نفسه tickets
        لا ندخل الإيراد.
      */

      if (
        header.revenueCol ===
        header.ticketsCol
      ) {
        imported.revenue = "";
      }

      /*
        تحويل الأرقام.
      */

      imported.tickets =
        toNumber(
          imported.tickets
        );

      imported.revenue =
        toNumber(
          imported.revenue
        );

      /*
        لا تدخل صفًا بدون Movie.
      */

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

  /*
    Normalize
  */

  let normalizedRows =
    normalizeImportRows(
      allRows
    );

  /*
    تحويل الأرقام مرة أخرى
    بعد normalization.
  */

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

  /*
    Merge 2D / 3D
  */

  normalizedRows =
    mergeMovieRows(
      normalizedRows
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
    normalizedRows.reduce(
      (sum, row) =>
        sum +
        toNumber(
          row.tickets
        ),
      0
    )
  );

  console.log(
    "Revenue:",
    normalizedRows.reduce(
      (sum, row) =>
        sum +
        toNumber(
          row.revenue
        ),
      0
    )
  );

  return {
    reportDate,
    rows: normalizedRows,
  };
}

/* ==========================================================
   Default Export
   ========================================================== */

export default smartParser;

