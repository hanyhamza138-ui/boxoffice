import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/* ==========================================================
   UNIVERSAL PDF IMPORT READER

   - لا يعتمد على MOV001 / CIN001
   - يكتشف الأعمدة من Header ومواقع X
   - يدعم اختلاف ترتيب الأعمدة
   - يدعم عربي / English
   - يحافظ على نفس output القديم
========================================================== */

const MOVIE_WORDS = [
  "movie",
  "film",
  "title",
  "movie name",
  "film name",
  "الفيلم",
  "اسم الفيلم",
  "اسم الفلم",
  "فيلم",
  "العمل",
];

const TICKET_WORDS = [
  "ticket",
  "tickets",
  "admission",
  "admissions",
  "attendance",
  "audience",
  "sold",
  "units",
  "تذكرة",
  "تذاكر",
  "الحضور",
  "الجمهور",
  "عدد التذاكر",
];

const REVENUE_WORDS = [
  "net income",
  "total net",
  "net revenue",
  "net",
  "revenue",
  "sales",
  "gross",
  "income",
  "amount",
  "الصافي",
  "صافي",
  "صافي الإيراد",
  "صافي الايراد",
  "الإيراد",
  "الايراد",
  "الإيرادات",
  "المبيعات",
  "دخل",
];

const VERSION_WORDS = [
  "version",
  "format",
  "type",
  "screen format",
  "projection",
  "النسخة",
  "نوع العرض",
  "الصيغة",
  "الفورمات",
  "نوع",
];

function clean(value = "") {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200e\u200f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeArabic(value = "") {
  return clean(value)
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ـ+/g, "");
}

function normalizeText(value = "") {
  return normalizeArabic(value)
    .replace(/[•●▪■◆◇★☆|]+/g, " ")
    .replace(/[(){}\[\],;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function compact(value = "") {
  return normalizeText(value).replace(/\s+/g, "");
}

function hasArabic(value = "") {
  return /[\u0600-\u06ff]/.test(
    String(value)
  );
}

function hasLetters(value = "") {
  return /[A-Za-z\u0600-\u06ff]/.test(
    String(value)
  );
}

function matchesAny(text, words) {
  const normalized = normalizeText(text);
  const compacted = compact(text);

  return words.some((word) => {
    const n = normalizeText(word);

    return (
      normalized === n ||
      normalized.includes(n) ||
      compacted.includes(compact(word))
    );
  });
}

function isTotalText(value = "") {
  const t = compact(value);

  if (!t) return false;

  return [
    "total",
    "grandtotal",
    "subtotal",
    "totals",
    "الإجمالي",
    "الاجمالي",
    "اجمالي",
    "إجمالي",
    "المجموع",
    "مجموع",
    "الاجماليالكلي",
    "الاجماليالعام",
  ].some(
    (word) =>
      t === compact(word) ||
      t.startsWith(compact(word))
  );
}

function isMetadataLine(value = "") {
  const t = normalizeText(value);

  if (!t) return true;

  const metadata = [
    "report",
    "box office",
    "boxoffice",
    "report date",
    "date",
    "generated",
    "printed",
    "page",
    "company",
    "branch",
    "period",

    "تقرير",
    "تقرير الايرادات",
    "تقرير الإيرادات",
    "التاريخ",
    "تاريخ التقرير",
    "الشركة",
    "الفرع",
    "الفترة",
    "صفحة",
  ];

  return metadata.some(
    (word) =>
      t === normalizeText(word) ||
      t.startsWith(
        normalizeText(word) + " "
      )
  );
}

function isHeaderText(value = "") {
  return matchesAny(value, [
    ...MOVIE_WORDS,
    ...TICKET_WORDS,
    ...REVENUE_WORDS,
    ...VERSION_WORDS,

    "cinema",
    "theater",
    "theatre",
    "branch",

    "السينما",
    "سينما",
    "المسرح",
    "الفرع",
  ]);
}

function toNumber(value) {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  let text = String(value ?? "")
    .replace(/[٬,]/g, "")
    .replace(/[٫]/g, ".")
    .replace(/[^\d.-]/g, "");

  if (
    !text ||
    text === "-" ||
    text === "."
  ) {
    return 0;
  }

  const n = Number(text);

  return Number.isFinite(n)
    ? n
    : 0;
}

function extractNumberTokens(text = "") {
  const result = [];

  const re =
    /-?\d+(?:[,.]\d{3})*(?:[.,]\d+)?/g;

  let match;

  while (
    (match = re.exec(String(text))) !== null
  ) {
    result.push({
      raw: match[0],
      number: toNumber(match[0]),
      index: match.index,
      end:
        match.index +
        match[0].length,
    });
  }

  return result;
}

function lineNumberTokens(line) {
  return (line.items || []).flatMap(
    (item) => {
      const matches =
        extractNumberTokens(item.text);

      return matches.map((m) => ({
        ...m,
        x: item.x,
        y: item.y,
        width: item.width,
        sourceText: item.text,
      }));
    }
  );
}

function textWithoutNumbers(line) {
  const parts = [];

  for (const item of line.items || []) {
    let value = item.text;

    value = value.replace(
      /-?\d+(?:[,.]\d{3})*(?:[.,]\d+)?/g,
      " "
    );

    value = clean(value);

    if (value) {
      parts.push(value);
    }
  }

  return clean(parts.join(" "));
}

/* ==========================================================
   PDF ITEMS -> VISUAL LINES
========================================================== */

function groupItemsIntoLines(items = []) {
  const valid = items
    .map((item) => {
      const text = clean(item?.str);

      const tr = Array.isArray(
        item?.transform
      )
        ? item.transform
        : [];

      if (!text) return null;

      return {
        text,
        x: Number(tr[4]) || 0,
        y: Number(tr[5]) || 0,
        width:
          Number(item?.width) || 0,
        height:
          Number(item?.height) || 0,
      };
    })
    .filter(Boolean);

  const groups = [];

  const Y_TOLERANCE = 4;

  for (const item of valid) {
    let best = null;
    let bestDistance = Infinity;

    for (const group of groups) {
      const distance = Math.abs(
        group.y - item.y
      );

      if (
        distance <= Y_TOLERANCE &&
        distance < bestDistance
      ) {
        best = group;
        bestDistance = distance;
      }
    }

    if (!best) {
      best = {
        y: item.y,
        items: [],
      };

      groups.push(best);
    }

    best.items.push(item);
  }

  groups.sort(
    (a, b) => b.y - a.y
  );

  return groups.map((group) => {
    group.items.sort(
      (a, b) => a.x - b.x
    );

    return {
      y: group.y,
      items: group.items,
      text: clean(
        group.items
          .map((item) => item.text)
          .join(" ")
      ),
    };
  });
}

/* ==========================================================
   HEADER / COLUMN DETECTION
========================================================== */

function classifyHeader(text) {
  if (
    matchesAny(
      text,
      MOVIE_WORDS
    )
  ) {
    return "movie";
  }

  if (
    matchesAny(
      text,
      TICKET_WORDS
    )
  ) {
    return "tickets";
  }

  if (
    matchesAny(
      text,
      REVENUE_WORDS
    )
  ) {
    return "revenue";
  }

  if (
    matchesAny(
      text,
      VERSION_WORDS
    )
  ) {
    return "version";
  }

  if (
    matchesAny(text, [
      "cinema",
      "theater",
      "theatre",
      "branch",
      "السينما",
      "سينما",
      "الفرع",
    ])
  ) {
    return "cinema";
  }

  return null;
}

function detectHeader(lineObjects = []) {
  const candidates = [];

  for (
    let i = 0;
    i < lineObjects.length;
    i++
  ) {
    const line =
      lineObjects[i];

    const fields = [];

    for (
      const item of
        line.items || []
    ) {
      const type =
        classifyHeader(
          item.text
        );

      if (type) {
        fields.push({
          type,
          x: item.x,
          width: item.width,
          text: item.text,
        });
      }
    }

    const types = new Set(
      fields.map(
        (f) => f.type
      )
    );

    const score =
      (types.has("movie")
        ? 3
        : 0) +
      (types.has("tickets")
        ? 2
        : 0) +
      (types.has("revenue")
        ? 3
        : 0) +
      (types.has("version")
        ? 1
        : 0) +
      (types.has("cinema")
        ? 1
        : 0);

    if (
      score >= 5 &&
      types.has("movie") &&
      types.has("revenue")
    ) {
      candidates.push({
        index: i,
        fields,
        score,
        y: line.y,
      });
    }
  }

  if (!candidates.length) {
    return null;
  }

  candidates.sort(
    (a, b) =>
      b.score - a.score ||
      b.y - a.y
  );

  const best =
    candidates[0];

  const columns = {};

  for (
    const field of best.fields
  ) {
    if (
      columns[field.type] ==
      null
    ) {
      columns[field.type] =
        field.x;
    }
  }

  return {
    lineIndex:
      best.index,

    columns,

    fields:
      best.fields,
  };
}

function nearestColumn(
  x,
  columns
) {
  let best = null;
  let distance = Infinity;

  for (
    const [type, columnX] of
      Object.entries(
        columns || {}
      )
  ) {
    const d = Math.abs(
      x - columnX
    );

    if (d < distance) {
      best = type;
      distance = d;
    }
  }

  return {
    type: best,
    distance,
  };
}

function numbersByColumns(
  line,
  header
) {
  const numbers =
    lineNumberTokens(line);

  if (
    !numbers.length ||
    !header?.columns
  ) {
    return null;
  }

  const result = {
    tickets: [],
    revenue: [],
    other: [],
  };

  const numericColumns = [
    "tickets",
    "revenue",
  ];

  for (
    const number of numbers
  ) {
    let nearest = null;
    let distance = Infinity;

    for (
      const type of
        numericColumns
    ) {
      if (
        header.columns[type] ==
        null
      ) {
        continue;
      }

      const d = Math.abs(
        number.x -
          header.columns[type]
      );

      if (d < distance) {
        nearest = type;
        distance = d;
      }
    }

    if (nearest) {
      result[nearest].push({
        ...number,
        distance,
      });
    } else {
      result.other.push(
        number
      );
    }
  }

  return result;
}
/* ==========================================================
   MOVIE TEXT EXTRACTION
========================================================== */

function extractMovieFromLine(
  line,
  header
) {
  if (!line?.items?.length) {
    return "";
  }

  const columnX =
    header?.columns?.movie;

  if (
    columnX == null
  ) {
    return "";
  }

  /*
    نأخذ النصوص الموجودة في منطقة
    عمود الفيلم، وليس مجرد النص
    الذي يسبق أول رقم.
  */

  const values = [];

  for (
    const item of line.items
  ) {
    const text =
      clean(item.text);

    if (!text) continue;

    /*
      لو كان العنصر نفسه Header
      أو رقمًا، لا ندخله كاسم فيلم.
    */

    if (
      isHeaderText(text) ||
      isTotalText(text)
    ) {
      continue;
    }

    if (
      extractNumberTokens(text)
        .length > 0
    ) {
      continue;
    }

    const center =
      item.x +
      item.width / 2;

    /*
      نسمح بمسافة كبيرة نسبيًا
      لأن بعض ملفات PDF تستخدم
      text boxes واسعة.
    */

    if (
      Math.abs(
        center - columnX
      ) <= 220
    ) {
      values.push({
        text,
        x: item.x,
      });
    }
  }

  if (!values.length) {
    return "";
  }

  values.sort(
    (a, b) =>
      a.x - b.x
  );

  return clean(
    values
      .map(
        (item) => item.text
      )
      .join(" ")
  );
}

/* ==========================================================
   CINEMA EXTRACTION
========================================================== */

function looksLikeCinemaTitle(
  value = ""
) {
  const text =
    clean(value);

  if (!text) {
    return false;
  }

  if (
    isTotalText(text) ||
    isHeaderText(text) ||
    isMetadataLine(text)
  ) {
    return false;
  }

  if (
    extractNumberTokens(text)
      .length > 0
  ) {
    return false;
  }

  if (!hasLetters(text)) {
    return false;
  }

  /*
    نستبعد الجمل الطويلة جدًا.
    اسم السينما عادة عنوان،
    وليس فقرة تقرير.
  */

  const words =
    normalizeText(text)
      .split(/\s+/)
      .filter(Boolean);

  if (
    words.length === 0 ||
    words.length > 10
  ) {
    return false;
  }

  return true;
}

/* ==========================================================
   CINEMA FROM HEADER / PAGE
========================================================== */

function detectCinemaFromLines(
  lines = [],
  start = 0,
  end = lines.length
) {
  const limit =
    Math.min(
      end,
      start + 12
    );

  for (
    let i = start;
    i < limit;
    i++
  ) {
    const line =
      lines[i];

    const text =
      clean(line?.text);

    if (!text) continue;

    /*
      لو السطر نفسه يحتوي كلمة Cinema
      نحاول أخذ الجزء الذي بعدها.
    */

    const match =
      text.match(
        /^(?:cinema|theater|theatre|branch)\s*[:\-]\s*(.+)$/i
      );

    if (
      match &&
      looksLikeCinemaTitle(
        match[1]
      )
    ) {
      return clean(
        match[1]
      );
    }

    const arabicMatch =
      text.match(
        /^(?:السينما|سينما|الفرع)\s*[:\-]\s*(.+)$/i
      );

    if (
      arabicMatch &&
      looksLikeCinemaTitle(
        arabicMatch[1]
      )
    ) {
      return clean(
        arabicMatch[1]
      );
    }
  }

  /*
    لو لا يوجد label واضح،
    نبحث عن عنوان قصير قبل Header.
  */

  for (
    let i = start;
    i < limit;
    i++
  ) {
    const text =
      clean(lines[i]?.text);

    if (!text) continue;

    if (
      isHeaderText(text) ||
      isMetadataLine(text)
    ) {
      continue;
    }

    if (
      looksLikeCinemaTitle(text)
    ) {
      return text;
    }
  }

  return "";
}

/* ==========================================================
   PARSE TABLE ROW USING HEADER POSITIONS
========================================================== */

function parseTableRow(
  line,
  header,
  currentCinema
) {
  if (!line) {
    return null;
  }

  const text =
    clean(line.text);

  if (!text) {
    return null;
  }

  if (
    isTotalText(text) ||
    isHeaderText(text)
  ) {
    return null;
  }

  const columnNumbers =
    numbersByColumns(
      line,
      header
    );

  /*
    يجب أن يكون عندنا Tickets
    و Revenue على الأقل.
  */

  let tickets = 0;
  let revenue = 0;

  if (
    columnNumbers?.tickets
      ?.length
  ) {
    tickets =
      columnNumbers.tickets
        .sort(
          (a, b) =>
            a.distance -
            b.distance
        )[0]
        .number;
  }

  if (
    columnNumbers?.revenue
      ?.length
  ) {
    revenue =
      columnNumbers.revenue
        .sort(
          (a, b) =>
            a.distance -
            b.distance
        )[0]
        .number;
  }

  /*
    لو الأعمدة لم تُحدد بدقة،
    fallback إلى آخر رقمين.
  */

  if (
    (!tickets &&
      !revenue) ||
    (tickets === 0 &&
      revenue === 0)
  ) {
    const numbers =
      extractNumberTokens(
        text
      );

    if (
      numbers.length >= 2
    ) {
      tickets =
        numbers[
          numbers.length - 2
        ].number;

      revenue =
        numbers[
          numbers.length - 1
        ].number;
    }
  }

  if (
    !Number.isFinite(
      tickets
    ) ||
    !Number.isFinite(
      revenue
    )
  ) {
    return null;
  }

  if (
    tickets === 0 &&
    revenue === 0
  ) {
    return null;
  }

  let movie =
    extractMovieFromLine(
      line,
      header
    );

  /*
    fallback:
    إزالة الأرقام من السطر
    ثم استخدام النص المتبقي.
  */

  if (!movie) {
    const stripped =
      clean(
        text.replace(
          /-?\d+(?:[,.]\d{3})*(?:[.,]\d+)?/g,
          " "
        )
      );

    if (
      stripped &&
      hasLetters(stripped) &&
      !isHeaderText(stripped) &&
      !isTotalText(stripped)
    ) {
      movie = stripped;
    }
  }

  if (!movie) {
    return null;
  }

  return {
    cinema:
      clean(currentCinema),
    movie:
      clean(movie),
    version: "",
    tickets,
    revenue,
  };
}

/* ==========================================================
   FALLBACK ROW PARSER

   يستخدم فقط عندما لا نستطيع اكتشاف
   Header واضح.

   لا يفترض أن الفيلم دائمًا قبل الأرقام.
========================================================== */

function parseFallbackRow(
  line,
  currentCinema
) {
  const text =
    clean(line?.text);

  if (!text) {
    return null;
  }

  if (
    isTotalText(text) ||
    isHeaderText(text)
  ) {
    return null;
  }

  const numbers =
    extractNumberTokens(text);

  if (
    numbers.length < 2
  ) {
    return null;
  }

  /*
    نستخدم الرقمين الأقرب لبعضهما
    في نهاية الصف.
  */

  const ticketToken =
    numbers[
      numbers.length - 2
    ];

  const revenueToken =
    numbers[
      numbers.length - 1
    ];

  let movie =
    clean(
      text.slice(
        0,
        ticketToken.index
      )
    );

  /*
    أحيانًا PDF يعكس ترتيب الأعمدة.
    إذا لم يوجد نص قبل الأرقام،
    نبحث بعد الرقم الأخير.
  */

  if (!movie) {
    movie =
      clean(
        text.slice(
          revenueToken.end
        )
      );
  }

  if (!movie) {
    return null;
  }

  if (
    !hasLetters(movie)
  ) {
    return null;
  }

  if (
    isHeaderText(movie) ||
    isTotalText(movie)
  ) {
    return null;
  }

  return {
    cinema:
      clean(currentCinema),
    movie,
    version: "",
    tickets:
      ticketToken.number,
    revenue:
      revenueToken.number,
  };
}

/* ==========================================================
   PAGE PARSER
========================================================== */

function parsePage(
  lines,
  state
) {
  const rows = [];

  let header = null;

  /*
    أولًا نبحث عن Header داخل الصفحة.
  */

  for (
    let i = 0;
    i < lines.length;
    i++
  ) {
    const detected =
      detectHeader(
        lines.slice(i)
      );

    if (detected) {
      header = {
        ...detected,
        lineIndex:
          i + detected.lineIndex,
      };

      break;
    }
  }

  /*
    اكتشاف السينما قبل الجدول.
  */

  const cinemaBeforeTable =
    detectCinemaFromLines(
      lines,
      0,
      header
        ? header.lineIndex
        : Math.min(
            lines.length,
            10
          )
    );

  if (
    cinemaBeforeTable
  ) {
    state.currentCinema =
      cinemaBeforeTable;

    console.log(
      "🏢 Cinema detected:",
      state.currentCinema
    );
  }

  /*
    لو وجد Header:
    نستخدم column-based parser.
  */

  if (header) {
    state.hasHeader = true;

    console.log(
      "📋 Header:",
      header.fields
    );

    console.log(
      "📐 Columns:",
      header.columns
    );

    for (
      let i =
        header.lineIndex + 1;
      i < lines.length;
      i++
    ) {
      const line =
        lines[i];

      const text =
        clean(line.text);

      if (!text) {
        continue;
      }

      /*
        Total ينهي الجدول،
        لكن لا ينهي السينما إلا
        إذا ظهر عنوان جديد بعده.
      */

      if (
        isTotalText(text)
      ) {
        state.inTable =
          false;

        state.afterTotal =
          true;

        continue;
      }

      /*
        Header جديد داخل نفس الصفحة.
      */

      if (
        isFullTableHeader(text) ||
        isTableHeaderLine(
          line
        )
      ) {
        state.inTable =
          true;

        state.afterTotal =
          false;

        continue;
      }

      /*
        احتمال وجود Cinema جديدة
        بعد Total.
      */

      if (
        state.afterTotal &&
        looksLikeCinemaTitle(text)
      ) {
        state.currentCinema =
          text;

        state.afterTotal =
          false;

        state.inTable =
          false;

        console.log(
          "🏢 New Cinema:",
          state.currentCinema
        );

        continue;
      }

      const row =
        parseTableRow(
          line,
          header,
          state.currentCinema
        );

      if (row) {
        rows.push(row);

        state.inTable =
          true;

        state.afterTotal =
          false;

        continue;
      }
    }

    return rows;
  }

  /*
    لا يوجد Header واضح:
    نستخدم fallback.
  */

  for (
    let i = 0;
    i < lines.length;
    i++
  ) {
    const line =
      lines[i];

    const text =
      clean(line.text);

    if (!text) {
      continue;
    }

    if (
      isTotalText(text)
    ) {
      state.afterTotal =
        true;

      state.inTable =
        false;

      continue;
    }

    if (
      state.afterTotal &&
      looksLikeCinemaTitle(text)
    ) {
      state.currentCinema =
        text;

      state.afterTotal =
        false;

      continue;
    }

    const row =
      parseFallbackRow(
        line,
        state.currentCinema
      );

    if (row) {
      rows.push(row);

      state.inTable =
        true;

      state.afterTotal =
        false;

      continue;
    }
  }

  return rows;
}

/* ==========================================================
   HEADER HELPERS
========================================================== */

function isTableHeaderLine(
  line
) {
  if (!line) {
    return false;
  }

  const text =
    clean(line.text);

  return (
    isHeaderText(text) ||
    isFullTableHeader(text)
  );
}

/* ==========================================================
   DATE DETECTION
========================================================== */

function detectReportDate(
  text = ""
) {
  const source =
    String(text);

  let match =
    source.match(
      /\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/
    );

  if (match) {
    return `${match[1]}-${String(
      match[2]
    ).padStart(2, "0")}-${String(
      match[3]
    ).padStart(2, "0")}`;
  }

  match =
    source.match(
      /\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/
    );

  if (match) {
    return `${match[3]}-${String(
      match[2]
    ).padStart(2, "0")}-${String(
      match[1]
    ).padStart(2, "0")}`;
  }

  return "";
}/* ==========================================================
   CLEAN / DEDUPLICATE ROWS
========================================================== */

function cleanRows(rows = []) {
  const result = [];
  const seen = new Set();

  for (const row of rows) {
    if (!row) continue;

    const cinema = clean(row.cinema);
    const movie = clean(row.movie);
    const version = clean(row.version);

    const tickets = Number(row.tickets);
    const revenue = Number(row.revenue);

    if (!cinema || !movie) {
      continue;
    }

    if (!Number.isFinite(tickets)) {
      continue;
    }

    if (!Number.isFinite(revenue)) {
      continue;
    }

    if (isTotalText(movie)) {
      continue;
    }

    if (isHeaderText(movie)) {
      continue;
    }

    const key = [
      normalizeText(cinema),
      normalizeText(movie),
      normalizeText(version),
      tickets,
      revenue,
    ].join("|");

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    result.push({
      cinema,
      movie,
      version,
      tickets,
      revenue,
    });
  }

  return result;
}

/* ==========================================================
   MERGE SAME MOVIE / CINEMA / VERSION

   لو نفس الفيلم ظهر أكثر من مرة:
   Tickets + Revenue يتم جمعهم.
========================================================== */

function mergeRows(rows = []) {
  const map = new Map();

  for (const row of rows) {
    const cinemaKey =
      normalizeText(row.cinema);

    const movieKey =
      normalizeText(row.movie);

    const versionKey =
      normalizeText(row.version);

    const key = [
      cinemaKey,
      movieKey,
      versionKey,
    ].join("|");

    if (!map.has(key)) {
      map.set(key, {
        cinema: row.cinema,
        movie: row.movie,
        version: row.version || "",
        tickets: 0,
        revenue: 0,
      });
    }

    const current =
      map.get(key);

    current.tickets +=
      Number(row.tickets || 0);

    current.revenue +=
      Number(row.revenue || 0);
  }

  return Array.from(
    map.values()
  );
}

/* ==========================================================
   PDF READER
========================================================== */

export async function pdfReader(
  file
) {
  if (!file) {
    throw new Error(
      "PDF file is required"
    );
  }

  const buffer =
    await file.arrayBuffer();

  const loadingTask =
    pdfjsLib.getDocument({
      data: buffer,
    });

  const pdf =
    await loadingTask.promise;

  const pages = [];

  const allRows = [];

  const state = {
    currentCinema: "",
    inTable: false,
    afterTotal: false,
    hasHeader: false,
  };

  let fullText = "";

  console.log(
    "======================================"
  );

  console.log(
    "📄 UNIVERSAL PDF IMPORT START"
  );

  console.log(
    "📄 Pages:",
    pdf.numPages
  );

  console.log(
    "======================================"
  );

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page =
      await pdf.getPage(
        pageNumber
      );

    const content =
      await page.getTextContent();

    const items =
      Array.isArray(
        content.items
      )
        ? content.items
        : [];

    const lines =
      groupItemsIntoLines(
        items
      );

    const pageText =
      lines
        .map(
          (line) =>
            line.text
        )
        .filter(Boolean)
        .join("\n");

    fullText +=
      pageText + "\n";

    pages.push({
      page: pageNumber,
      text: pageText,
      lines,
    });

    console.log(
      `📄 Page ${pageNumber}: ${lines.length} visual lines`
    );

    /*
      تحليل الصفحة.
    */

    const pageRows =
      parsePage(
        lines,
        state
      );

    if (pageRows.length) {
      allRows.push(
        ...pageRows
      );
    }

    console.log(
      `📊 Page ${pageNumber} rows:`,
      pageRows.length
    );

    console.log(
      `🏢 Current cinema:`,
      state.currentCinema
    );
  }

  /* ========================================================
     FINAL CLEANING
  ======================================================== */

  let parsedRows =
    cleanRows(allRows);

  parsedRows =
    mergeRows(parsedRows);

  /* ========================================================
     DATE
  ======================================================== */

  const reportDate =
    detectReportDate(
      fullText
    );

  /* ========================================================
     STATISTICS
  ======================================================== */

  const cinemas = [
    ...new Set(
      parsedRows
        .map(
          (row) =>
            row.cinema
        )
        .filter(Boolean)
    ),
  ];

  const movies = [
    ...new Set(
      parsedRows
        .map(
          (row) =>
            row.movie
        )
        .filter(Boolean)
    ),
  ];

  const totalTickets =
    parsedRows.reduce(
      (sum, row) =>
        sum +
        Number(
          row.tickets || 0
        ),
      0
    );

  const totalRevenue =
    parsedRows.reduce(
      (sum, row) =>
        sum +
        Number(
          row.revenue || 0
        ),
      0
    );

  /* ========================================================
     DEBUG
  ======================================================== */

  console.log(
    "======================================"
  );

  console.log(
    "📊 UNIVERSAL PDF RESULT"
  );

  console.log(
    "📄 Pages:",
    pdf.numPages
  );

  console.log(
    "🏢 Cinemas:",
    cinemas.length
  );

  console.log(
    "🎬 Movies:",
    movies.length
  );

  console.log(
    "🎟️ Tickets:",
    totalTickets
  );

  console.log(
    "💰 Revenue:",
    totalRevenue
  );

  console.log(
    "📅 Report date:",
    reportDate || "Not detected"
  );

  console.log(
    "📋 Rows:",
    parsedRows.length
  );

  console.log(
    "======================================"
  );

  console.table(
    parsedRows
  );

  /* ========================================================
     SAME OUTPUT EXPECTED BY SMART PARSER
  ======================================================== */

  return {
    type: "pdf",

    text: fullText,

    pages,

    reportDate,

    parsedRows,

    sheets: [
      {
        name: "PDF",

        rows:
          parsedRows.map(
            (row) => [
              row.cinema,
              row.movie,
              row.version,
              row.tickets,
              row.revenue,
            ]
          ),
      },
    ],
  };
}

/* ==========================================================
   OPTIONAL DEBUG EXPORT
========================================================== */

export function debugPdfRows(
  rows = []
) {
  console.log(
    "======================================"
  );

  console.log(
    "🔎 PDF ROW DEBUG"
  );

  console.log(
    "Rows:",
    rows.length
  );

  rows.forEach(
    (row, index) => {
      console.log(
        `${index + 1}.`,
        {
          cinema:
            row?.cinema || "",

          movie:
            row?.movie || "",

          version:
            row?.version || "",

          tickets:
            Number(
              row?.tickets || 0
            ),

          revenue:
            Number(
              row?.revenue || 0
            ),
        }
      );
    }
  );

  console.log(
    "======================================"
  );

  return rows;
}