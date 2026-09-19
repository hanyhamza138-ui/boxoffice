import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/* ==========================================================
   UNIVERSAL PDF IMPORT READER
   ----------------------------------------------------------
   الهدف:
   - لا يعتمد على MOV001 / CIN001.
   - لا يعتمد على ترتيب ثابت للأعمدة.
   - يقرأ PDF عربي / English.
   - يكتشف الأعمدة من الـ X positions.
   - يميز Movie / Tickets / Revenue(Net) / Distribution Company.
   - يحافظ على Cinema عبر الصفحات.
   - يدعم Cinema كعنوان للتقرير أو كقسم داخل التقرير.
========================================================== */

/* ==========================================================
   BASIC HELPERS
========================================================== */

function clean(value = "") {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeArabic(value = "") {
  return clean(value)
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي");
}

function normalizeText(value = "") {
  return normalizeArabic(value)
    .replace(/ـ+/g, "")
    .replace(/[•●▪■◆◇★☆]+/g, " ")
    .replace(/[|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lower(value = "") {
  return normalizeText(value).toLowerCase();
}

function hasLetters(value = "") {
  return /[A-Za-z\u0600-\u06FF]/.test(String(value ?? ""));
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const text = String(value)
    .trim()
    .replace(/,/g, "")
    .replace(/٬/g, "")
    .replace(/٫/g, ".")
    .replace(/[^\d.-]/g, "");

  if (!text) {
    return 0;
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : 0;
}

function extractNumbers(text = "") {
  const source = String(text ?? "");

  const matches = [
    ...source.matchAll(/-?\d+(?:,\d{3})*(?:\.\d+)?/g)
  ];

  return matches.map((match) => ({
    value: match[0],
    number: toNumber(match[0]),
    index: match.index ?? -1
  }));
}

function isTotalText(value = "") {
  const text = lower(value);

  if (!text) {
    return false;
  }

  const totalPatterns = [
    /^total$/,
    /^grand total$/,
    /^overall total$/,
    /^subtotal$/,
    /^net total$/,
    /^totals$/,
    /^grandtotal$/,

    /^الإجمالي$/,
    /^الاجمالي$/,
    /^المجموع$/,
    /^اجمالي$/,
    /^إجمالي$/,
    /^المجموع الكلي$/,
    /^اجمالي الكل$/,
    /^الاجمالي الكلي$/
  ];

  return totalPatterns.some((pattern) => pattern.test(text));
}

function isTableHeader(value = "") {
  const text = lower(value);

  if (!text) {
    return false;
  }

  const movie =
    /\b(movie|film|title|movie name)\b/.test(text) ||
    /(الفيلم|اسم الفيلم|الافلام|الأفلام|عنوان الفيلم)/.test(text);

  const tickets =
    /\b(tickets?|attendance|audience|adm|admissions?)\b/.test(text) ||
    /(التذاكر|تذاكر|الحضور|الجمهور)/.test(text);

  const revenue =
    /\b(net|net income|net revenue|revenue|sales|gross|total entry|income)\b/.test(text) ||
    /(الصافي|صافي|الإيراد|الايراد|الإيرادات|المبيعات|دخل|اجمالي الدخول|إجمالي الدخول)/.test(text);

  return movie || tickets || revenue;
}

function isFullTableHeader(value = "") {
  const text = lower(value);

  const movie =
    /\b(movie|film|title)\b/.test(text) ||
    /(الفيلم|اسم الفيلم|عنوان الفيلم)/.test(text);

  const tickets =
    /\b(tickets?|attendance|audience|admissions?)\b/.test(text) ||
    /(التذاكر|الحضور|الجمهور)/.test(text);

  const revenue =
    /\b(net|net income|net revenue|revenue|sales|gross|income)\b/.test(text) ||
    /(الصافي|صافي|الإيراد|الايراد|الإيرادات|المبيعات|الدخل)/.test(text);

  return movie && tickets && revenue;
}

function isReportNoise(value = "") {
  const text = lower(value);

  if (!text) {
    return true;
  }

  if (isTotalText(text)) {
    return true;
  }

  const exact = [
    "cinematic",
    "movie overall analysis",
    "movie overall",
    "analysis",
    "dates",
    "date",
    "from",
    "to",
    "report",
    "box office",
    "box office report",
    "daily report",
    "daily box office",
    "sales report",
    "revenue report",
    "report date",
    "company",
    "distribution company",
    "movie",
    "film",
    "title",
    "tickets",
    "attendance",
    "audience",
    "net",
    "net income",
    "revenue",
    "sales",
    "gross",
    "total entry",
    "tax",
    "vat",

    "الإجمالي",
    "الاجمالي",
    "المجموع",
    "تقرير",
    "التاريخ",
    "تاريخ التقرير",
    "الفيلم",
    "التذاكر",
    "الحضور",
    "الصافي",
    "الإيرادات",
    "الإيراد",
    "المبيعات",
    "الضريبة",
    "الشركة"
  ];

  return exact.includes(text);
}

/* ==========================================================
   DATE
========================================================== */

function detectDate(text = "") {
  const source = String(text ?? "");

  let match = source.match(
    /\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/
  );

  if (match) {
    return `${match[1]}-${String(match[2]).padStart(2, "0")}-${String(match[3]).padStart(2, "0")}`;
  }

  match = source.match(
    /\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/
  );

  if (match) {
    return `${match[3]}-${String(match[2]).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
  }

  const monthNames = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12"
  };

  const monthPattern = Object.keys(monthNames).join("|");

  match = source.match(
    new RegExp(
      `\\b(${monthPattern})\\s+(\\d{1,2}),?\\s+(20\\d{2})\\b`,
      "i"
    )
  );

  if (match) {
    return `${match[3]}-${monthNames[match[1].toLowerCase()]}-${String(match[2]).padStart(2, "0")}`;
  }

  match = source.match(
    new RegExp(
      `\\b(\\d{1,2})\\s+(${monthPattern})\\s+(20\\d{2})\\b`,
      "i"
    )
  );

  if (match) {
    return `${match[3]}-${monthNames[match[2].toLowerCase()]}-${String(match[1]).padStart(2, "0")}`;
  }

  return "";
}

/* ==========================================================
   COLUMN CLASSIFICATION
========================================================== */

const COLUMN_TYPES = {
  MOVIE: "movie",
  DISTRIBUTION: "distribution",
  CINEMA: "cinema",
  TICKETS: "tickets",
  REVENUE: "revenue",
  GROSS: "gross",
  ENTRY: "entry",
  TAX: "tax",
  VAT: "vat",
  SCREENS: "screens",
  PRICE: "price",
  UNKNOWN: "unknown"
};

function normalizeHeaderToken(value = "") {
  return lower(value)
    .replace(/[()[\]{}:;,|/\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function headerScore(text = "", aliases = []) {
  const normalized = normalizeHeaderToken(text);

  if (!normalized) {
    return 0;
  }

  let score = 0;

  for (const alias of aliases) {
    const a = normalizeHeaderToken(alias);

    if (!a) {
      continue;
    }

    if (normalized === a) {
      score = Math.max(score, 100);
      continue;
    }

    if (normalized.includes(a)) {
      score = Math.max(score, 70);
      continue;
    }

    const words = a.split(" ").filter(Boolean);

    if (
      words.length > 1 &&
      words.every((word) => normalized.includes(word))
    ) {
      score = Math.max(score, 60);
    }
  }

  return score;
}

const HEADER_ALIASES = {
  movie: [
    "movie",
    "movie name",
    "film",
    "film name",
    "title",
    "movie title",
    "film title",
    "name",
    "الفيلم",
    "اسم الفيلم",
    "اسم الفلم",
    "عنوان الفيلم",
    "الفلم"
  ],

  distribution: [
    "distribution",
    "distribution company",
    "distributor",
    "distributor company",
    "company",
    "movie distribution company",
    "شركة التوزيع",
    "شركه التوزيع",
    "الموزع",
    "شركة",
    "شركه"
  ],

  cinema: [
    "cinema",
    "cinemas",
    "theater",
    "theatre",
    "cinema name",
    "cinema title",
    "سينما",
    "السينما",
    "اسم السينما",
    "صالة",
    "دار العرض"
  ],

  tickets: [
    "tickets",
    "ticket",
    "attendance",
    "audience",
    "admissions",
    "admission",
    "adm",
    "sold tickets",
    "ticket count",
    "عدد التذاكر",
    "التذاكر",
    "تذاكر",
    "الحضور",
    "الجمهور",
    "عدد الحضور"
  ],

  revenue: [
    "net",
    "net income",
    "net revenue",
    "total net",
    "net total",
    "income",
    "revenue",
    "sales",
    "gross revenue",
    "الصافي",
    "صافي",
    "صافي الدخل",
    "صافي الإيراد",
    "صافي الايراد",
    "إجمالي صافي",
    "اجمالي صافي",
    "الإيراد",
    "الايراد",
    "الإيرادات",
    "المبيعات",
    "الدخل"
  ],

  gross: [
    "gross",
    "gross sales",
    "gross revenue",
    "box office",
    "total entry",
    "entry",
    "total",
    "إجمالي الدخول",
    "اجمالي الدخول",
    "الدخول",
    "الإجمالي",
    "الاجمالي"
  ],

  tax: [
    "tax",
    "taxes",
    "entry tax",
    "total entry tax",
    "ضريبة",
    "الضريبة",
    "ضريبة الدخول",
    "اجمالي ضريبة الدخول",
    "إجمالي ضريبة الدخول"
  ],

  vat: [
    "vat",
    "total vat",
    "value added tax",
    "ضريبة القيمة المضافة",
    "ضريبة مضافة",
    "vat tax"
  ],

  screens: [
    "screens",
    "screen",
    "screen count",
    "عدد الشاشات",
    "الشاشات",
    "شاشه",
    "شاشة"
  ],

  price: [
    "ticket price",
    "price",
    "ticket value",
    "average price",
    "سعر التذكرة",
    "سعر التذاكر",
    "السعر"
  ]
};

function classifyHeader(text = "") {
  const scores = {};

  for (const [type, aliases] of Object.entries(HEADER_ALIASES)) {
    scores[type] = headerScore(text, aliases);
  }

  let bestType = COLUMN_TYPES.UNKNOWN;
  let bestScore = 0;

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestType = type;
    }
  }

  return {
    type: bestType,
    score: bestScore,
    scores
  };
}

function isRevenueHeader(text = "") {
  const result = classifyHeader(text);

  return (
    result.type === COLUMN_TYPES.REVENUE &&
    result.score >= 60
  );
}

function isTicketHeader(text = "") {
  const result = classifyHeader(text);

  return (
    result.type === COLUMN_TYPES.TICKETS &&
    result.score >= 60
  );
}

function isMovieHeader(text = "") {
  const result = classifyHeader(text);

  return (
    result.type === COLUMN_TYPES.MOVIE &&
    result.score >= 60
  );
}

function isDistributionHeader(text = "") {
  const result = classifyHeader(text);

  return (
    result.type === COLUMN_TYPES.DISTRIBUTION &&
    result.score >= 60
  );
}

function isCinemaHeader(text = "") {
  const result = classifyHeader(text);

  return (
    result.type === COLUMN_TYPES.CINEMA &&
    result.score >= 60
  );
}

/* ==========================================================
   PDF ITEM NORMALIZATION
========================================================== */

function normalizePdfItem(item = {}) {
  const text = clean(item?.str);

  const transform = Array.isArray(item?.transform)
    ? item.transform
    : [];

  const x = Number(transform[4]) || 0;
  const y = Number(transform[5]) || 0;

  const width = Number(item?.width) || 0;
  const height = Number(item?.height) || 0;

  return {
    text,
    x,
    y,
    width,
    height,
    xEnd: x + width,
    yEnd: y + height
  };
}

function sortItemsByReadingOrder(items = []) {
  return [...items].sort((a, b) => {
    const yDiff = b.y - a.y;

    if (Math.abs(yDiff) > 3) {
      return yDiff;
    }

    return a.x - b.x;
  });
}

/* ==========================================================
   LINE GROUPING
========================================================== */

function groupItemsIntoLines(items = []) {
  const normalizedItems = items
    .map(normalizePdfItem)
    .filter((item) => item.text);

  if (!normalizedItems.length) {
    return [];
  }

  const lineGroups = [];

  const Y_TOLERANCE = 3;

  for (const item of normalizedItems) {
    let target = null;

    for (const group of lineGroups) {
      if (Math.abs(group.y - item.y) <= Y_TOLERANCE) {
        target = group;
        break;
      }
    }

    if (!target) {
      target = {
        y: item.y,
        items: []
      };

      lineGroups.push(target);
    }

    target.items.push(item);
  }

  lineGroups.sort((a, b) => b.y - a.y);

  return lineGroups.map((group) => {
    group.items.sort((a, b) => a.x - b.x);

    return {
      y: group.y,
      items: group.items,
      text: clean(
        group.items
          .map((item) => item.text)
          .join(" ")
      )
    };
  });
}

/* ==========================================================
   HEADER DETECTION FROM X/Y
========================================================== */

function findHeaderLineIndex(lineObjects = []) {
  let bestIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < lineObjects.length; i++) {
    const line = lineObjects[i];

    if (!line?.text) {
      continue;
    }

    const text = line.text;

    let score = 0;

    if (isMovieHeader(text)) {
      score += 5;
    }

    if (isTicketHeader(text)) {
      score += 5;
    }

    if (isRevenueHeader(text)) {
      score += 5;
    }

    if (isDistributionHeader(text)) {
      score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex;
}

/* ==========================================================
   HEADER COLUMN EXTRACTION
========================================================== */

function splitHeaderItems(lineObject = {}) {
  if (!Array.isArray(lineObject.items)) {
    return [];
  }

  return lineObject.items
    .map((item) => ({
      text: clean(item.text),
      x: Number(item.x) || 0,
      xEnd: Number(item.xEnd) || Number(item.x) || 0
    }))
    .filter((item) => item.text);
}

function buildColumnMapFromHeader(lineObject = {}) {
  const items = splitHeaderItems(lineObject);

  if (!items.length) {
    return {
      columns: [],
      confidence: 0
    };
  }

  const columns = [];

  for (const item of items) {
    const classification = classifyHeader(item.text);

    if (
      classification.type === COLUMN_TYPES.UNKNOWN ||
      classification.score < 50
    ) {
      continue;
    }

    columns.push({
      type: classification.type,
      header: item.text,
      x: item.x,
      xEnd: item.xEnd,
      center: (item.x + item.xEnd) / 2,
      score: classification.score
    });
  }

  columns.sort((a, b) => a.x - b.x);

  const unique = [];

  for (const column of columns) {
    const existing = unique.find(
      (item) =>
        item.type === column.type &&
        Math.abs(item.center - column.center) < 8
    );

    if (!existing) {
      unique.push(column);
      continue;
    }

    if (column.score > existing.score) {
      Object.assign(existing, column);
    }
  }

  const hasMovie = unique.some(
    (column) => column.type === COLUMN_TYPES.MOVIE
  );

  const hasTickets = unique.some(
    (column) => column.type === COLUMN_TYPES.TICKETS
  );

  const hasRevenue = unique.some(
    (column) => column.type === COLUMN_TYPES.REVENUE
  );

  let confidence = 0;

  if (hasMovie) {
    confidence += 35;
  }

  if (hasTickets) {
    confidence += 30;
  }

  if (hasRevenue) {
    confidence += 35;
  }

  return {
    columns: unique,
    confidence
  };
}

/* ==========================================================
   COLUMN POSITION HELPERS
========================================================== */

function distanceToColumn(item, column) {
  if (!item || !column) {
    return Infinity;
  }

  const center =
    Number(item.x) +
    Number(item.width || 0) / 2;

  return Math.abs(center - column.center);
}

function nearestColumn(item, columns = []) {
  if (!columns.length) {
    return null;
  }

  let best = null;
  let bestDistance = Infinity;

  for (const column of columns) {
    const distance = distanceToColumn(item, column);

    if (distance < bestDistance) {
      bestDistance = distance;
      best = column;
    }
  }

  return best;
}

function getColumnByType(columns = [], type) {
  return columns.find(
    (column) => column.type === type
  ) || null;
}

/* ==========================================================
   REVENUE PRIORITY
========================================================== */

function revenueColumnPriority(type) {
  switch (type) {
    case COLUMN_TYPES.REVENUE:
      return 100;

    case COLUMN_TYPES.GROSS:
      return 20;

    case COLUMN_TYPES.ENTRY:
      return 15;

    case COLUMN_TYPES.TAX:
      return 0;

    case COLUMN_TYPES.VAT:
      return 0;

    default:
      return 0;
  }
}

function chooseRevenueColumn(columns = []) {
  const candidates = columns.filter(
    (column) =>
      [
        COLUMN_TYPES.REVENUE,
        COLUMN_TYPES.GROSS,
        COLUMN_TYPES.ENTRY
      ].includes(column.type)
  );

  if (!candidates.length) {
    return null;
  }

  candidates.sort((a, b) => {
    const priorityDiff =
      revenueColumnPriority(b.type) -
      revenueColumnPriority(a.type);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return b.score - a.score;
  });

  return candidates[0];
}

/* ==========================================================
   MOVIE / CINEMA TEXT HELPERS
========================================================== */

function looksLikeMovieTitle(value = "") {
  const text = clean(value);

  if (!text) {
    return false;
  }

  if (isReportNoise(text)) {
    return false;
  }

  if (isTableHeader(text)) {
    return false;
  }

  if (isTotalText(text)) {
    return false;
  }

  if (!hasLetters(text)) {
    return false;
  }

  return true;
}

function looksLikeCinemaTitle(value = "") {
  const text = clean(value);

  if (!text) {
    return false;
  }

  if (isReportNoise(text)) {
    return false;
  }

  if (isTableHeader(text)) {
    return false;
  }

  if (isTotalText(text)) {
    return false;
  }

  if (extractNumbers(text).length > 0) {
    return false;
  }

  if (!hasLetters(text)) {
    return false;
  }

  const normalized = lower(text);

  const ignored = [
    "cinematic",
    "movie overall analysis",
    "movie overall",
    "analysis",
    "dates",
    "date",
    "from",
    "to",
    "report",
    "box office",
    "box office report",
    "daily report",
    "daily box office",
    "sales report",
    "revenue report",
    "report date",
    "company",
    "distribution company",
    "movie",
    "film",
    "title",
    "tickets",
    "attendance",
    "audience",
    "net",
    "net income",
    "revenue",
    "sales",
    "gross",
    "total entry",
    "tax",
    "vat"
  ];

  if (ignored.includes(normalized)) {
    return false;
  }

  return true;
}

/* ==========================================================
   ROW ITEM CLASSIFICATION
========================================================== */

function classifyNumericItem(item, columns = []) {
  const column = nearestColumn(item, columns);

  if (!column) {
    return {
      type: COLUMN_TYPES.UNKNOWN,
      column: null,
      distance: Infinity
    };
  }

  return {
    type: column.type,
    column,
    distance: distanceToColumn(item, column)
  };
}

function isNumericText(text = "") {
  const value = clean(text);

  if (!value) {
    return false;
  }

  const numbers = extractNumbers(value);

  if (numbers.length !== 1) {
    return false;
  }

  return clean(
    value
      .replace(numbers[0].value, "")
  ) === "";
}

/* ==========================================================
   SMART ROW PARSER
========================================================== */

function parseStructuredRow(lineObject = {}, columnMap = {}) {
  const items = Array.isArray(lineObject.items)
    ? lineObject.items
    : [];

  if (!items.length) {
    return null;
  }

  const columns = Array.isArray(columnMap.columns)
    ? columnMap.columns
    : [];

  if (!columns.length) {
    return null;
  }

  const movieColumn =
    getColumnByType(columns, COLUMN_TYPES.MOVIE);

  const distributionColumn =
    getColumnByType(columns, COLUMN_TYPES.DISTRIBUTION);

  const ticketsColumn =
    getColumnByType(columns, COLUMN_TYPES.TICKETS);

  const revenueColumn =
    chooseRevenueColumn(columns);

  if (!movieColumn || !ticketsColumn || !revenueColumn) {
    return null;
  }

  let movieParts = [];
  let distributionParts = [];

  let tickets = null;
  let revenue = null;

  for (const item of items) {
    const text = clean(item.text);

    if (!text) {
      continue;
    }

    const numeric = extractNumbers(text);

    if (numeric.length === 1 && isNumericText(text)) {
      const classification = classifyNumericItem(
        item,
        columns
      );

      if (
        classification.type === COLUMN_TYPES.TICKETS &&
        tickets === null
      ) {
        tickets = numeric[0].number;
        continue;
      }

      if (
        classification.type === COLUMN_TYPES.REVENUE &&
        revenue === null
      ) {
        revenue = numeric[0].number;
        continue;
      }

      if (
        classification.type === COLUMN_TYPES.GROSS ||
        classification.type === COLUMN_TYPES.ENTRY
      ) {
        continue;
      }

      if (
        classification.type === COLUMN_TYPES.TAX ||
        classification.type === COLUMN_TYPES.VAT
      ) {
        continue;
      }
    }

    const center =
      Number(item.x) +
      Number(item.width || 0) / 2;

    const movieDistance =
      Math.abs(center - movieColumn.center);

    const distributionDistance =
      distributionColumn
        ? Math.abs(
            center - distributionColumn.center
          )
        : Infinity;

    if (
      movieDistance <=
      Math.min(
        100,
        Math.max(
          35,
          Math.abs(
            movieColumn.center -
            (distributionColumn?.center ??
              movieColumn.center + 100)
          ) / 2
        )
      )
    ) {
      movieParts.push(text);
      continue;
    }

    if (
      distributionColumn &&
      distributionDistance <
        movieDistance
    ) {
      distributionParts.push(text);
      continue;
    }

    if (center < ticketsColumn.center) {
      movieParts.push(text);
    }
  }

  const movie = clean(movieParts.join(" "));
  const distribution = clean(
    distributionParts.join(" ")
  );

  if (!movie || !looksLikeMovieTitle(movie)) {
    return null;
  }

  if (
    tickets === null ||
    revenue === null
  ) {
    return null;
  }

  if (!Number.isFinite(tickets)) {
    return null;
  }

  if (!Number.isFinite(revenue)) {
    return null;
  }

  return {
    movie,
    distribution,
    tickets,
    revenue,
    version: ""
  };
}
/* ==========================================================
   FALLBACK ROW PARSER
   ----------------------------------------------------------
   يستخدم عندما لا نستطيع بناء خريطة أعمدة موثوقة.
========================================================== */

function parseFallbackMovieLine(line = "") {
  const text = clean(line);

  if (!text) {
    return null;
  }

  if (isTotalText(text)) {
    return null;
  }

  if (isReportNoise(text)) {
    return null;
  }

  const numbers = extractNumbers(text);

  if (numbers.length < 2) {
    return null;
  }

  /*
     نبحث عن Tickets بشكل ذكي:

     في التقارير المختلفة قد نجد:
       Movie 146 19650 3983.72 922.2 14744.08

     أو:
       Movie 33 4900 286.335

     أو:
       Movie 33 4900 286.335 4500

     القاعدة الأساسية:
       - Tickets غالباً عدد صحيح صغير نسبياً.
       - Revenue / Net غالباً آخر قيمة مالية.
       - لا نستخدم ثاني رقم مباشرة كـRevenue.
  */

  let ticketIndex = -1;

  for (let i = 0; i < numbers.length; i++) {
    const value = numbers[i].number;

    if (
      Number.isFinite(value) &&
      value >= 0 &&
      Number.isInteger(value) &&
      value <= 100000
    ) {
      /*
         نفضل الرقم الصحيح الأول قبل القيم المالية
         ذات الكسور.
      */
      ticketIndex = i;
      break;
    }
  }

  if (ticketIndex === -1) {
    return null;
  }

  const ticketToken = numbers[ticketIndex];

  const revenueCandidates = numbers
    .slice(ticketIndex + 1)
    .filter(
      (item) =>
        Number.isFinite(item.number) &&
        item.number >= 0
    );

  if (!revenueCandidates.length) {
    return null;
  }

  /*
     في وجود Net واضح لا نملكه هنا،
     آخر رقم هو أفضل مرشح للـNet.
  */
  const revenueToken =
    revenueCandidates[revenueCandidates.length - 1];

  const movieBeforeTickets = clean(
    text.slice(0, ticketToken.index)
  );

  let movie = movieBeforeTickets;

  /*
     بعض ملفات PDF قد تأتي بهذا الشكل:
       146 19650 ... 14600 Movie Name

     لذلك ندعم Movie بعد الأرقام أيضاً.
  */
  if (!movie || !hasLetters(movie)) {
    const end =
      revenueToken.index +
      revenueToken.value.length;

    const afterNumbers = clean(
      text.slice(end)
    );

    if (hasLetters(afterNumbers)) {
      movie = afterNumbers;
    }
  }

  if (!movie || !looksLikeMovieTitle(movie)) {
    return null;
  }

  return {
    movie,
    distribution: "",
    tickets: ticketToken.number,
    revenue: revenueToken.number,
    version: ""
  };
}

/* ==========================================================
   CINEMA DETECTION
========================================================== */

const CINEMA_WORDS = [
  "cinema",
  "cinemas",
  "theater",
  "theatre",
  "cinematic",
  "سينما",
  "السينما",
  "سينمات",
  "صالة",
  "دار العرض"
];

const NON_CINEMA_WORDS = [
  "movie",
  "film",
  "title",
  "tickets",
  "attendance",
  "audience",
  "revenue",
  "net",
  "income",
  "gross",
  "sales",
  "tax",
  "vat",
  "distribution",
  "company",
  "report",
  "total",
  "analysis",

  "الفيلم",
  "التذاكر",
  "الحضور",
  "الجمهور",
  "الإيرادات",
  "الايرادات",
  "الصافي",
  "المبيعات",
  "الضريبة",
  "التوزيع",
  "الشركة",
  "تقرير",
  "الإجمالي",
  "الاجمالي"
];

function hasCinemaWord(value = "") {
  const text = lower(value);

  return CINEMA_WORDS.some(
    (word) =>
      text.includes(
        normalizeText(word).toLowerCase()
      )
  );
}

function hasNonCinemaWord(value = "") {
  const text = lower(value);

  return NON_CINEMA_WORDS.some(
    (word) =>
      text.includes(
        normalizeText(word).toLowerCase()
      )
  );
}

function scoreCinemaCandidate(
  line = "",
  context = {}
) {
  const text = clean(line);

  if (!text) {
    return -999;
  }

  if (isTotalText(text)) {
    return -999;
  }

  if (isTableHeader(text)) {
    return -999;
  }

  if (isReportNoise(text)) {
    return -999;
  }

  if (extractNumbers(text).length > 0) {
    return -999;
  }

  if (!hasLetters(text)) {
    return -999;
  }

  let score = 0;

  /*
     Cinema name explicitly contains Cinema.
  */
  if (hasCinemaWord(text)) {
    score += 70;
  }

  /*
     بعد Total غالباً يبدأ Cinema جديد.
  */
  if (context.afterTotal) {
    score += 40;
  }

  /*
     قبل بداية جدول جديد.
  */
  if (!context.inTable) {
    score += 25;
  }

  /*
     إذا كان السطر قصيراً نسبياً،
     فهو أقرب لأن يكون اسم Cinema.
  */
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length <= 8) {
    score += 10;
  }

  if (words.length > 14) {
    score -= 20;
  }

  /*
     Distribution Company ليست Cinema.
  */
  if (
    /\bdistribution\b/i.test(text) ||
    /\bdistributor\b/i.test(text) ||
    /(التوزيع|الموزع)/.test(text)
  ) {
    score -= 80;
  }

  /*
     Movie title لا يصبح Cinema لمجرد أنه نص.
     نستخدم وجود Cinema أو موقع السطر والسياق.
  */
  if (hasNonCinemaWord(text)) {
    score -= 50;
  }

  /*
     اسم السينما غالباً لا يحتوي أرقاماً.
  */
  if (/\d/.test(text)) {
    score -= 100;
  }

  return score;
}

function detectCinemaCandidate(
  line = "",
  context = {}
) {
  const score = scoreCinemaCandidate(
    line,
    context
  );

  if (score < 40) {
    return null;
  }

  return {
    cinema: clean(line),
    score
  };
}

/* ==========================================================
   CINEMA CONTEXT
========================================================== */

function isLikelyCinemaHeading(
  lineObjects = [],
  index = 0
) {
  const current =
    clean(lineObjects[index]?.text);

  if (!current) {
    return false;
  }

  if (
    hasCinemaWord(current) &&
    extractNumbers(current).length === 0
  ) {
    return true;
  }

  /*
     Cinema name may be followed immediately
     by a table header.
  */
  const next =
    clean(lineObjects[index + 1]?.text);

  if (
    next &&
    isFullTableHeader(next) &&
    extractNumbers(current).length === 0 &&
    hasLetters(current)
  ) {
    return true;
  }

  /*
     Some PDFs put the header first and Cinema
     directly above/below it.
  */
  const previous =
    clean(lineObjects[index - 1]?.text);

  if (
    previous &&
    isFullTableHeader(previous) &&
    extractNumbers(current).length === 0 &&
    hasLetters(current)
  ) {
    return true;
  }

  return false;
}

/* ==========================================================
   STRUCTURED PAGE ANALYSIS
========================================================== */

function analyzePageStructure(
  lineObjects = []
) {
  const result = {
    headerIndex: -1,
    columnMap: {
      columns: [],
      confidence: 0
    },
    cinemaCandidates: [],
    rows: []
  };

  const headerIndex =
    findHeaderLineIndex(lineObjects);

  result.headerIndex = headerIndex;

  if (headerIndex >= 0) {
    result.columnMap =
      buildColumnMapFromHeader(
        lineObjects[headerIndex]
      );
  }

  for (
    let index = 0;
    index < lineObjects.length;
    index++
  ) {
    const lineObject =
      lineObjects[index];

    const text =
      clean(lineObject?.text);

    if (!text) {
      continue;
    }

    if (
      isLikelyCinemaHeading(
        lineObjects,
        index
      )
    ) {
      result.cinemaCandidates.push({
        index,
        text
      });
    }

    const structured =
      parseStructuredRow(
        lineObject,
        result.columnMap
      );

    if (structured) {
      result.rows.push({
        index,
        ...structured
      });
    }
  }

  return result;
}

/* ==========================================================
   VERSION DETECTION
========================================================== */

function detectVersion(text = "") {
  const value = clean(text);

  if (!value) {
    return "";
  }

  const normalized =
    value.toUpperCase();

  if (
    /\b3D\b/.test(normalized) ||
    /\(3D\)/.test(normalized)
  ) {
    return "3D";
  }

  if (
    /\b2D\b/.test(normalized) ||
    /\(2D\)/.test(normalized)
  ) {
    return "2D";
  }

  if (
    /\bVIP\b/.test(normalized)
  ) {
    return "VIP";
  }

  if (
    /\bIMAX\b/.test(normalized)
  ) {
    return "IMAX";
  }

  return "";
}

function cleanMovieTitle(
  movie = ""
) {
  let value = clean(movie);

  if (!value) {
    return "";
  }

  /*
     Remove duplicated whitespace.
  */
  value = value.replace(/\s+/g, " ");

  /*
     Keep version information available separately.
     We remove only obvious standalone version tokens
     from the movie title.
  */
  value = value
    .replace(/\s+\(3D\)\s*$/i, "")
    .replace(/\s+\(2D\)\s*$/i, "")
    .replace(/\s+\b3D\b\s*$/i, "")
    .replace(/\s+\b2D\b\s*$/i, "")
    .trim();

  return value;
}

/* ==========================================================
   ROW NORMALIZATION
========================================================== */

function normalizeParsedRow(
  row = {},
  cinema = ""
) {
  const rawMovie =
    clean(row.movie || "");

  const movie =
    cleanMovieTitle(rawMovie);

  const version =
    clean(
      row.version ||
      detectVersion(rawMovie)
    );

  const tickets =
    toNumber(row.tickets);

  const revenue =
    toNumber(row.revenue);

  return {
    cinema: clean(
      row.cinema || cinema || ""
    ),
    movie,
    version,
    tickets,
    revenue,
    distribution: clean(
      row.distribution || ""
    )
  };
}

/* ==========================================================
   CINEMA / MOVIE SEPARATION
========================================================== */

function shouldAcceptCinemaChange(
  candidate,
  context = {}
) {
  if (!candidate) {
    return false;
  }

  const score =
    Number(candidate.score || 0);

  if (score < 40) {
    return false;
  }

  if (!context.currentCinema) {
    return true;
  }

  if (context.afterTotal) {
    return true;
  }

  /*
     Do not change cinema in the middle of a table
     just because a movie title happens to look like text.
  */
  if (context.inTable) {
    return false;
  }

  return true;
}

/* ==========================================================
   PAGE ROW PARSING
========================================================== */

function parsePageRows(
  lineObjects = [],
  state = {}
) {
  const rows = [];

  let currentCinema =
    clean(state.currentCinema || "");

  let inTable =
    Boolean(state.inTable);

  let afterTotal =
    Boolean(state.afterTotal);

  const structure =
    analyzePageStructure(
      lineObjects
    );

  const columnMap =
    structure.columnMap;

  const hasReliableColumns =
    columnMap.confidence >= 70 &&
    columnMap.columns.length >= 2;

  for (
    let index = 0;
    index < lineObjects.length;
    index++
  ) {
    const lineObject =
      lineObjects[index];

    const line =
      clean(lineObject?.text);

    if (!line) {
      continue;
    }

    /* ------------------------------------------
       REPORT NOISE
    ------------------------------------------ */

    if (isReportNoise(line)) {
      continue;
    }

    /* ------------------------------------------
       TOTAL
    ------------------------------------------ */

    if (isTotalText(line)) {
      inTable = false;
      afterTotal = true;

      continue;
    }

    /* ------------------------------------------
       TABLE HEADER
    ------------------------------------------ */

    if (isFullTableHeader(line)) {
      inTable = true;
      afterTotal = false;

      continue;
    }

    if (isTableHeader(line)) {
      inTable = true;
      afterTotal = false;

      continue;
    }

    /* ------------------------------------------
       CINEMA EXPLICIT HEADER
    ------------------------------------------ */

    if (
      isLikelyCinemaHeading(
        lineObjects,
        index
      )
    ) {
      const candidate =
        detectCinemaCandidate(
          line,
          {
            afterTotal,
            inTable
          }
        );

      if (
        candidate &&
        shouldAcceptCinemaChange(
          candidate,
          {
            currentCinema,
            afterTotal,
            inTable
          }
        )
      ) {
        currentCinema =
          candidate.cinema;

        inTable = false;
        afterTotal = false;

        continue;
      }
    }

    /* ------------------------------------------
       STRUCTURED ROW
    ------------------------------------------ */

    if (hasReliableColumns) {
      const structured =
        parseStructuredRow(
          lineObject,
          columnMap
        );

      if (structured) {
        const normalized =
          normalizeParsedRow(
            structured,
            currentCinema
          );

        if (
          normalized.cinema &&
          normalized.movie
        ) {
          rows.push(normalized);

          inTable = true;
          afterTotal = false;

          continue;
        }
      }
    }

    /* ------------------------------------------
       FALLBACK MOVIE ROW
    ------------------------------------------ */

    const fallback =
      parseFallbackMovieLine(line);

    if (fallback) {
      const normalized =
        normalizeParsedRow(
          fallback,
          currentCinema
        );

      if (
        normalized.cinema &&
        normalized.movie
      ) {
        rows.push(normalized);

        inTable = true;
        afterTotal = false;

        continue;
      }
    }

    /* ------------------------------------------
       POSSIBLE CINEMA CHANGE
    ------------------------------------------ */

    const candidate =
      detectCinemaCandidate(
        line,
        {
          afterTotal,
          inTable,
          currentCinema
        }
      );

    if (
      candidate &&
      shouldAcceptCinemaChange(
        candidate,
        {
          currentCinema,
          afterTotal,
          inTable
        }
      )
    ) {
      currentCinema =
        candidate.cinema;

      inTable = false;
      afterTotal = false;

      continue;
    }
  }

  state.currentCinema =
    currentCinema;

  state.inTable =
    inTable;

  state.afterTotal =
    afterTotal;

  return {
    rows,
    state,
    structure
  };
}

/* ==========================================================
   DUPLICATE HANDLING
========================================================== */

function rowKey(row = {}) {
  return [
    lower(row.cinema),
    lower(row.movie),
    lower(row.version),
    Number(row.tickets || 0),
    Number(row.revenue || 0)
  ].join("|");
}

function removeDuplicateRows(
  rows = []
) {
  const seen = new Set();
  const result = [];

  for (const row of rows) {
    const key =
      rowKey(row);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(row);
  }

  return result;
}

/* ==========================================================
   ROW VALIDATION
========================================================== */

function validateRows(
  rows = []
) {
  return rows.filter((row) => {
    if (!row) {
      return false;
    }

    if (
      !clean(row.cinema) ||
      !clean(row.movie)
    ) {
      return false;
    }

    if (
      isTotalText(row.movie)
    ) {
      return false;
    }

    if (
      isReportNoise(row.movie)
    ) {
      return false;
    }

    const tickets =
      Number(row.tickets);

    const revenue =
      Number(row.revenue);

    if (
      !Number.isFinite(tickets) ||
      !Number.isFinite(revenue)
    ) {
      return false;
    }

    if (tickets < 0) {
      return false;
    }

    if (revenue < 0) {
      return false;
    }

    return true;
  });
}

/* ==========================================================
   MOVIE MERGING
========================================================== */

function movieMergeKey(row = {}) {
  return [
    lower(row.cinema),
    lower(row.movie)
  ].join("|");
}

function mergeMovieVersions(
  rows = []
) {
  const map = new Map();

  for (const row of rows) {
    const key =
      movieMergeKey(row);

    if (!map.has(key)) {
      map.set(key, {
        ...row
      });

      continue;
    }

    const existing =
      map.get(key);

    /*
       Same movie can appear as 2D / 3D / VIP.
       We combine tickets and revenue while
       retaining a useful version label.
    */
    existing.tickets =
      Number(existing.tickets || 0) +
      Number(row.tickets || 0);

    existing.revenue =
      Number(existing.revenue || 0) +
      Number(row.revenue || 0);

    const versions = [
      existing.version,
      row.version
    ]
      .filter(Boolean)
      .filter(
        (value, index, array) =>
          array.indexOf(value) === index
      );

    existing.version =
      versions.join(" / ");
  }

  return [...map.values()];
}

/* ==========================================================
   REPORT TOTALS
========================================================== */

function calculateTotals(
  rows = []
) {
  let tickets = 0;
  let revenue = 0;

  for (const row of rows) {
    tickets +=
      Number(row.tickets || 0);

    revenue +=
      Number(row.revenue || 0);
  }

  const cinemas = [
    ...new Set(
      rows
        .map((row) =>
          clean(row.cinema)
        )
        .filter(Boolean)
    )
  ];

  const movies = [
    ...new Set(
      rows
        .map((row) =>
          clean(row.movie)
        )
        .filter(Boolean)
    )
  ];

  return {
    tickets,
    revenue,
    cinemaCount: cinemas.length,
    movieCount: movies.length,
    cinemas,
    movies
  };
}
    "distribution company",
    "سينما",
    "السينما",
    "تقرير",
    "التاريخ"
  ];

  if (badExact.includes(normalized)) return false;

  return true;
}

function extractExplicitCinema(line = "") {
  const raw = clean(line);

  const patterns = [
    /^(?:cinema|cinemas|theater|theatre)\s*[:\-]\s*(.+)$/i,
    /^(?:cinema name|theater name)\s*[:\-]\s*(.+)$/i,
    /^(?:سينما|السينما|اسم السينما)\s*[:\-]\s*(.+)$/
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);

    if (match && isLikelyCinemaName(match[1])) {
      return clean(match[1]);
    }
  }

  return "";
}

function detectReportCinema(lines = []) {
  /*
    Prefer explicit labels.
  */
  for (const line of lines.slice(0, 30)) {
    const explicit = extractExplicitCinema(line.text);

    if (explicit) return explicit;
  }

  /*
    A title like "Suncity Cinemas" is often the report cinema.
    We deliberately look before the table header only.
  */
  for (let i = 0; i < Math.min(lines.length, 40); i++) {
    const text = clean(lines[i].text);

    if (!text) continue;

    if (isFullTableHeader(text)) {
      break;
    }

    const normalized = lower(text);

    if (
      /\b(cinemas?|theaters?|theatres?)\b/i.test(text) ||
      /(سينما|السينما)/.test(text)
    ) {
      if (
        !/\b(cinematic|movie overall|analysis|report|date)\b/i.test(text) &&
        !isReportNoise(text)
      ) {
        return text;
      }
    }
  }

  return "";
}

/* ==========================================================
   TABLE ROW PARSING BY X POSITION
========================================================== */

function reconstructColumnText(items = []) {
  if (!items.length) return "";

  return reconstructLineText(
    [...items].sort((a, b) => a.x - b.x)
  );
}

function numericValueFromItems(items = []) {
  const text = reconstructColumnText(items);

  const numbers = extractNumbers(text);

  if (!numbers.length) return null;

  return numbers[numbers.length - 1].number;
}

function parseStructuredMovieRow(line, structure) {
  if (!line || !structure) return null;

  const items = line.items || [];

  if (!items.length) return null;

  const text = clean(line.text);

  if (!text) return null;
  if (isTotalText(text)) return null;
  if (isTableHeader(text)) return null;
  if (isReportNoise(text)) return null;

  const { columns, boundaries } = structure;

  const movieItems = [];
  const ticketItems = [];
  const revenueItems = [];

  for (const item of items) {
    if (
      columns.movie &&
      xInColumn(item.centerX, columns.movie, boundaries)
    ) {
      movieItems.push(item);
      continue;
    }

    if (
      columns.tickets &&
      xInColumn(item.centerX, columns.tickets, boundaries)
    ) {
      ticketItems.push(item);
      continue;
    }

    if (
      columns.revenue &&
      xInColumn(item.centerX, columns.revenue, boundaries)
    ) {
      revenueItems.push(item);
      continue;
    }
  }

  const movie = reconstructColumnText(movieItems);
  const tickets = numericValueFromItems(ticketItems);
  const revenue = numericValueFromItems(revenueItems);

  if (!movie || !hasLetters(movie)) return null;

  if (
    tickets === null ||
    revenue === null
  ) {
    return null;
  }

  if (!Number.isFinite(tickets) || !Number.isFinite(revenue)) {
    return null;
  }

  /*
    Do not accept rows where the movie column accidentally contains
    only a company name / metadata.
  */
  if (isTotalText(movie) || isReportNoise(movie)) {
    return null;
  }

  return {
    movie: clean(movie),
    version: detectVersion(movie),
    tickets,
    revenue,
    distributionCompany: columns.distribution
      ? reconstructColumnText(
          items.filter(item =>
            xInColumn(item.centerX, columns.distribution, boundaries)
          )
        )
      : ""
  };
}

/* ==========================================================
   FALLBACK ROW PARSER
========================================================== */

function parseFallbackMovieLine(line = "") {
  const text = clean(line);

  if (!text) return null;
  if (isTotalText(text)) return null;
  if (isTableHeader(text)) return null;
  if (isReportNoise(text)) return null;

  const numbers = extractNumbers(text);

  if (numbers.length < 2) return null;

  /*
    Generic fallback:
    - Tickets usually appear before money.
    - Revenue is preferably a Net / Net Income value if labels exist.
    - Otherwise use last numeric value.
  */
  const tickets = numbers[0].number;
  const revenue = numbers[numbers.length - 1].number;

  const firstNumberIndex = numbers[0].index;

  const movie = clean(
    text.slice(0, firstNumberIndex)
  );

  if (!movie || !hasLetters(movie)) {
    return null;
  }

  if (isTotalText(movie) || isReportNoise(movie)) {
    return null;
  }

  return {
    movie,
    version: detectVersion(movie),
    tickets,
    revenue,
    distributionCompany: ""
  };
}

/* ==========================================================
   VERSION
========================================================== */

function detectVersion(movie = "") {
  const text = clean(movie);

  const match = text.match(
    /\b(2D|3D|IMAX|VIP|4DX|MX4D)\b/i
  );

  return match ? match[1].toUpperCase() : "";
}

/* ==========================================================
   PAGE / REPORT STATE
========================================================== */

function looksLikeSectionHeader(line = "", structure = null) {
  const text = clean(line.text);

  if (!text) return false;
  if (isTotalText(text)) return false;
  if (isTableHeader(text)) return false;
  if (parseStructuredMovieRow(line, structure)) return false;

  const explicit = extractExplicitCinema(text);

  if (explicit) {
    return {
      cinema: explicit,
      explicit: true
    };
  }

  /*
    A new cinema section often appears after Total and before a new header.
    Do not accept arbitrary movie/distributor text as cinema while inside a table.
  */
  if (isLikelyCinemaName(text)) {
    return {
      cinema: text,
      explicit: false
    };
  }

  return false;
}

function processPage(lines, state) {
  const pageRows = [];

  /*
    1. Discover table structure on this page.
  */
  const structure =
    detectColumns(lines) ||
    state.structure ||
    null;

  if (structure) {
    state.structure = structure;

    console.log(
      "📐 PDF Columns:",
      Object.fromEntries(
        Object.entries(structure.columns)
          .filter(([, value]) => value)
          .map(([key, value]) => [key, value.text])
      )
    );
  }

  /*
    2. Detect report-level cinema on the first page.
  */
  if (!state.currentCinema) {
    const reportCinema = detectReportCinema(lines);

    if (reportCinema) {
      state.currentCinema = reportCinema;
      console.log("🏢 PDF Report Cinema:", reportCinema);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const text = clean(line.text);

    if (!text) continue;

    /*
      Total ends current table.
    */
    if (isTotalText(text)) {
      state.inTable = false;
      state.afterTotal = true;

      console.log("⏭️ PDF Total:", text);
      continue;
    }

    /*
      Header starts a table.
    */
    if (isTableHeader(text)) {
      state.inTable = true;
      state.afterTotal = false;

      /*
        Re-detect structure at every header.
      */
      const detected = detectColumns(
        lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2))
      );

      if (detected) {
        state.structure = detected;
      }

      console.log("📋 PDF Table Header:", text);
      continue;
    }

    /*
      Structured row first.
    */
    const structuredRow = parseStructuredMovieRow(
      line,
      state.structure
    );

    if (structuredRow) {
      if (!state.currentCinema) {
        console.warn(
          "⚠️ PDF Movie Without Cinema:",
          structuredRow.movie
        );
      } else {
        pageRows.push({
          cinema: state.currentCinema,
          movie: structuredRow.movie,
          version: structuredRow.version || "",
          tickets: structuredRow.tickets,
          revenue: structuredRow.revenue,
          distributionCompany:
            structuredRow.distributionCompany || ""
        });

        console.log(
          "🎬 PDF Movie:",
          state.currentCinema,
          "=>",
          structuredRow.movie,
          "Tickets:",
          structuredRow.tickets,
          "Revenue:",
          structuredRow.revenue
        );
      }

      state.inTable = true;
      state.afterTotal = false;
      continue;
    }

    /*
      If a row has a cinema marker after Total / outside table,
      accept it as a section.
    */
    if (!state.inTable || state.afterTotal) {
      const section = looksLikeSectionHeader(
        line,
        state.structure
      );

      if (section) {
        state.currentCinema = section.cinema;
        state.inTable = false;
        state.afterTotal = false;

        console.log(
          "🏢 PDF Cinema Changed:",
          state.currentCinema
        );

        continue;
      }
    }

    /*
      Explicit cinema labels can appear while table state is active.
    */
    const explicitCinema = extractExplicitCinema(text);

    if (explicitCinema) {
      state.currentCinema = explicitCinema;
      state.inTable = false;
      state.afterTotal = false;

      console.log(
        "🏢 PDF Explicit Cinema:",
        explicitCinema
      );

      continue;
    }

    /*
      Last-resort fallback only for rows where no column structure exists.
      We DO NOT use it when a reliable structure exists, because that would
      reintroduce the old "first number / last number" bug.
    */
    if (!state.structure) {
      const fallback = parseFallbackMovieLine(text);

      if (fallback && state.currentCinema) {
        pageRows.push({
          cinema: state.currentCinema,
          movie: fallback.movie,
          version: fallback.version || "",
          tickets: fallback.tickets,
          revenue: fallback.revenue,
          distributionCompany: ""
        });

        state.inTable = true;
        state.afterTotal = false;

        console.log(
          "🎬 PDF Fallback Movie:",
          state.currentCinema,
          "=>",
          fallback.movie
        );

        continue;
      }
    }

    /*
      Ignore report/footer noise.
    */
    if (
      isReportNoise(text) ||
      isTotalText(text) ||
      !hasLetters(text)
    ) {
      continue;
    }

    console.log("⏭️ PDF Ignored:", text);
  }

  return pageRows;
}

/* ==========================================================
   VALIDATION / DEDUPLICATION
========================================================== */

function validateRows(rows = []) {
  return rows.filter(row => {
    if (!row) return false;

    const cinema = clean(row.cinema);
    const movie = clean(row.movie);

    if (!cinema || !movie) return false;

    if (isTotalText(movie)) return false;
    if (isReportNoise(movie)) return false;

    const tickets = Number(row.tickets);
    const revenue = Number(row.revenue);

    if (!Number.isFinite(tickets)) return false;
    if (!Number.isFinite(revenue)) return false;

    if (tickets < 0 || revenue < 0) return false;

    /*
      A movie row should not have an absurd text-only cinema value.
    */
    if (!hasLetters(cinema)) return false;

    return true;
  });
}

function removeDuplicateRows(rows = []) {
  const seen = new Set();

  return rows.filter(row => {
    const key = [
      lower(row?.cinema),
      lower(row?.movie),
      Number(row?.tickets),
      Number(row?.revenue)
    ].join("|");

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

/* ==========================================================
   PDF READER
========================================================== */

export async function pdfReader(file) {
  if (!file) {
    throw new Error("PDF file is required");
  }

  const buffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: buffer
  }).promise;

  const pages = [];
  let fullText = "";
  let allPdfRows = [];

  const state = {
    currentCinema: "",
    inTable: false,
    afterTotal: false,
    structure: null
  };

  console.log("====================================");
  console.log("📄 UNIVERSAL PDF READER START");
  console.log("Pages:", pdf.numPages);
  console.log("====================================");

  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);

    const content = await page.getTextContent();

    const items = Array.isArray(content.items)
      ? content.items
      : [];

    const lineObjects = groupItemsIntoLines(items);

    const lines = lineObjects.map(line => ({
      text: clean(line.text),
      items: line.items,
      y: line.y
    }));

    const pageText = lines.length
      ? lines.map(line => line.text).join("\n")
      : items
          .map(item => clean(item?.str))
          .filter(Boolean)
          .join(" ");

    pages.push({
      page: pageNo,
      text: pageText,
      lines
    });

    fullText += pageText + "\n";

    console.log(
      `📄 PDF Page ${pageNo}:`,
      lines.length,
      "lines"
    );

    const pageRows = processPage(lines, state);

    allPdfRows.push(...pageRows);

    console.log(
      `📌 State after page ${pageNo}:`,
      {
        currentCinema: state.currentCinema,
        inTable: state.inTable,
        afterTotal: state.afterTotal,
        rows: pageRows.length
      }
    );
  }

  /*
    Fallback only if structured parser found nothing.
    This keeps support for unusual/simple PDFs without allowing the
    fallback to overwrite successful structured extraction.
  */
  if (!allPdfRows.length) {
    console.warn(
      "⚠️ Universal PDF parser returned 0 rows. Running text fallback..."
    );

    const fallbackLines = fullText
      .split("\n")
      .map(clean)
      .filter(Boolean);

    const fallbackState = {
      currentCinema: detectReportCinema(
        fallbackLines.map(text => ({ text, items: [] }))
      ),
      inTable: false,
      afterTotal: false,
      structure: null
    };

    for (const line of fallbackLines) {
      if (isTotalText(line)) {
        fallbackState.inTable = false;
        fallbackState.afterTotal = true;
        continue;
      }

      if (isTableHeader(line)) {
        fallbackState.inTable = true;
        fallbackState.afterTotal = false;
        continue;
      }

      const row = parseFallbackMovieLine(line);

      if (
        row &&
        fallbackState.currentCinema
      ) {
        allPdfRows.push({
          cinema: fallbackState.currentCinema,
          movie: row.movie,
          version: row.version || "",
          tickets: row.tickets,
          revenue: row.revenue,
          distributionCompany: ""
        });
      }
    }
  }

  allPdfRows = validateRows(allPdfRows);
  allPdfRows = removeDuplicateRows(allPdfRows);

  const reportDate = detectDate(fullText);

  const cinemas = [
    ...new Set(
      allPdfRows
        .map(row => clean(row.cinema))
        .filter(Boolean)
    )
  ];

  const tickets = allPdfRows.reduce(
    (sum, row) =>
      sum + Number(row.tickets || 0),
    0
  );

  const revenue = allPdfRows.reduce(
    (sum, row) =>
      sum + Number(row.revenue || 0),
    0
  );

  console.log("====================================");
  console.log("📊 UNIVERSAL PDF RESULT");
  console.log("Pages:", pdf.numPages);
  console.log("Rows:", allPdfRows.length);
  console.log("Report Date:", reportDate);
  console.log("Cinemas:", cinemas);
  console.log("Cinema Count:", cinemas.length);
  console.log("Tickets:", tickets);
  console.log("Revenue:", revenue);
  console.log("====================================");

  /*
    Keep compatibility with the existing import pipeline.
    parsedRows is preserved, and rows is also supplied so an engine that
    expects parsed.rows can consume PDF results without special casing.
  */
  const rows = allPdfRows.map(row => ({
    cinema: row.cinema,
    movie: row.movie,
    version: row.version || "",
    tickets: Number(row.tickets || 0),
    revenue: Number(row.revenue || 0),
    distributionCompany:
      row.distributionCompany || ""
  }));

  return {
    type: "pdf",
    text: fullText,
    pages,
    reportDate,

    parsedRows: rows,
    rows,

    sheets: [
      {
        name: "PDF",
        rows: rows.map(row => [
          row.cinema,
          row.movie,
          row.version,
          row.tickets,
          row.revenue
        ])
      }
    ]
  };
}

/* ==========================================================
   DEBUG
========================================================== */

export function debugPdfRows(rows = []) {
  const safeRows = Array.isArray(rows)
    ? rows
    : [];

  console.log("====================================");
  console.log("🔎 UNIVERSAL PDF ROW DEBUG");
  console.log("Rows:", safeRows.length);

  safeRows.forEach((row, index) => {
    console.log(`${index + 1}.`, {
      cinema: row?.cinema || "",
      movie: row?.movie || "",
      version: row?.version || "",
      tickets: Number(row?.tickets || 0),
      revenue: Number(row?.revenue || 0),
      distributionCompany:
        row?.distributionCompany || ""
    });
  });

  console.log("====================================");

  return safeRows;
}
/* ==========================================================
   EXPORT HELPERS
========================================================== */

export function getPdfImportSummary(result = {}) {
  const rows = Array.isArray(result?.rows)
    ? result.rows
    : Array.isArray(result?.parsedRows)
      ? result.parsedRows
      : [];

  const totalTickets = rows.reduce(
    (sum, row) => sum + Number(row?.tickets || 0),
    0
  );

  const totalRevenue = rows.reduce(
    (sum, row) => sum + Number(row?.revenue || 0),
    0
  );

  const cinemaSet = new Set();

  rows.forEach(row => {
    const cinema = clean(row?.cinema);

    if (cinema) {
      cinemaSet.add(cinema);
    }
  });

  const movieSet = new Set();

  rows.forEach(row => {
    const movie = clean(row?.movie);

    if (movie) {
      movieSet.add(movie);
    }
  });

  return {
    rows: rows.length,
    movies: movieSet.size,
    cinemas: cinemaSet.size,
    tickets: totalTickets,
    revenue: totalRevenue,
    reportDate: result?.reportDate || ""
  };
}

/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default pdfReader;