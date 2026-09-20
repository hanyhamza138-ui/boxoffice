import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/* ==========================================================
   HELPERS
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

/* ==========================================================
   TOTAL DETECTION
========================================================== */

function isTotalText(value = "") {
  const text = normalizeText(value)
    .replace(/\s+/g, "")
    .toLowerCase();

  if (!text) return false;

  const words = [
    "الإجمالي",
    "الاجمالي",
    "إجمالي",
    "اجمالي",
    "المجموع",
    "مجموع",
    "total",
    "grandtotal",
    "subtotal",
    "totals",
  ];

  return words.some((word) => {
    const normalized = normalizeText(word)
      .replace(/\s+/g, "")
      .toLowerCase();

    return (
      text === normalized ||
      text.includes(normalized)
    );
  });
}

/* ==========================================================
   HEADER DETECTION
========================================================== */

function isTableHeader(value = "") {
  const text = normalizeText(value).toLowerCase();

  if (!text) return false;

  const headerWords = [
    "الفيلم",
    "اسم الفيلم",
    "movie",
    "movie name",
    "film",
    "title",

    "التذاكر",
    "تذاكر",
    "tickets",
    "ticket",
    "attendance",
    "audience",

    "الصافي",
    "صافي",
    "net",
    "net income",
    "net revenue",
    "revenue",
    "sales",
    "gross",
  ];

  return headerWords.some(
    (word) =>
      text === normalizeText(word).toLowerCase()
  );
}

function isFullTableHeader(value = "") {
  const text = normalizeText(value).toLowerCase();

  if (!text) return false;

  const hasMovie =
    text.includes("الفيلم") ||
    text.includes("اسم الفيلم") ||
    text.includes("movie") ||
    text.includes("film") ||
    text.includes("title");

  const hasTickets =
    text.includes("التذاكر") ||
    text.includes("تذاكر") ||
    text.includes("tickets") ||
    text.includes("ticket") ||
    text.includes("attendance") ||
    text.includes("audience");

  const hasRevenue =
    text.includes("الصافي") ||
    text.includes("صافي") ||
    text.includes("net") ||
    text.includes("revenue") ||
    text.includes("sales") ||
    text.includes("gross");

  return hasMovie && hasTickets && hasRevenue;
}

/* ==========================================================
   CINEMA TITLE DETECTION
========================================================== */

function looksLikeCinemaTitle(value = "") {
  const text = clean(value);

  if (!text) return false;

  if (isTotalText(text)) return false;

  if (
    isTableHeader(text) ||
    isFullTableHeader(text)
  ) {
    return false;
  }

  // أي سطر يحتوي أرقامًا يُعامل كبيانات وليس اسم سينما.
  if (extractNumbers(text).length > 0) {
    return false;
  }

  const normalized = normalizeText(text).toLowerCase();

  const ignored = [
    "report",
    "report date",
    "box office",
    "cinema report",
    "box office report",
    "date",
    "company",
    "theater",
    "theatre",
    "تقرير",
    "تقرير السينما",
    "تقرير الايرادات",
    "تقرير الإيرادات",
    "التاريخ",
    "تاريخ التقرير",
    "الشركة",
    "سينما",
    "السينما",
  ];

  if (
    ignored.some((word) => {
      const normalizedWord =
        normalizeText(word).toLowerCase();

      return normalized === normalizedWord;
    })
  ) {
    return false;
  }

  // عبارات الأعمدة لا يمكن أن تكون اسم سينما.
  const dataWords = [
    "movie", "movie name", "film", "title",
    "tickets", "ticket", "attendance", "audience",
    "net", "net income", "net revenue", "revenue",
    "sales", "gross",
    "الفيلم", "اسم الفيلم", "التذاكر", "تذاكر",
    "الحضور", "الجمهور", "الصافي", "صافي",
    "الإيراد", "الايراد", "الإيرادات", "المبيعات",
  ];

  if (
    dataWords.some((word) => {
      const normalizedWord =
        normalizeText(word).toLowerCase();

      return normalized === normalizedWord;
    })
  ) {
    return false;
  }

  return /[A-Za-z\u0600-\u06FF]/.test(text);
}

/* ==========================================================
   NUMBER
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

  let text = String(value)
    .trim()
    .replace(/,/g, "")
    .replace(/٬/g, "")
    .replace(/٫/g, ".")
    .replace(/[^\d.-]/g, "");

  if (!text) return 0;

  const number = Number(text);

  return Number.isFinite(number)
    ? number
    : 0;
}

/* ==========================================================
   NUMBER DETECTION

   يدعم:
   672
   99,321.60
   99321.60
   2,621
========================================================== */

function extractNumbers(text = "") {
  const source = String(text ?? "");

  const matches = [
    ...source.matchAll(
      /-?\d+(?:,\d{3})*(?:\.\d+)?/g
    ),
  ];

  return matches.map((match) => ({
    value: match[0],
    number: toNumber(match[0]),
    index: match.index ?? -1,
  }));
}

/* ==========================================================
   PDF LINE SPLITTING
========================================================== */

function splitPdfText(text = "") {
  return String(text ?? "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => clean(line))
    .filter(Boolean);
}

/* ==========================================================
   PARSE MOVIE LINE

   أمثلة:

   محمود التاني 672 99,321.60

   Spider-Man: Brand New Day 511 70,480.69

   672 99,321.60 محمود التاني
========================================================== */

function parseMovieLine(line = "") {
  const text = clean(line);

  if (!text) return null;

  if (isTotalText(text)) return null;

  if (
    isTableHeader(text) ||
    isFullTableHeader(text)
  ) {
    return null;
  }

  const numbers = extractNumbers(text);

  if (numbers.length < 2) {
    return null;
  }

  // نأخذ آخر رقمين دائمًا
  // لأنهم غالبًا Tickets + Revenue
  const first =
    numbers[numbers.length - 2];

  const second =
    numbers[numbers.length - 1];

  /* --------------------------------------------------------
     الفيلم قبل الأرقام
  -------------------------------------------------------- */

  const movieBeforeNumbers = clean(
    text.slice(0, first.index)
  );

  if (
    movieBeforeNumbers &&
    /[A-Za-z\u0600-\u06FF]/.test(
      movieBeforeNumbers
    )
  ) {
    return {
      movie: movieBeforeNumbers,
      tickets: first.number,
      revenue: second.number,
    };
  }

  /* --------------------------------------------------------
     الفيلم بعد الأرقام
  -------------------------------------------------------- */

  const secondEnd =
    second.index + second.value.length;

  const movieAfterNumbers = clean(
    text.slice(secondEnd)
  );

  if (
    movieAfterNumbers &&
    /[A-Za-z\u0600-\u06FF]/.test(
      movieAfterNumbers
    )
  ) {
    return {
      movie: movieAfterNumbers,
      tickets: first.number,
      revenue: second.number,
    };
  }

  return null;
}

/* ==========================================================
   GROUP PDF ITEMS INTO LINES

   PDF.js أحيانًا يرجع الأعمدة بترتيب غير صحيح.
   لذلك نستخدم X/Y.
========================================================== */

function groupItemsIntoLines(items = []) {
  const validItems = items
    .map((item) => {
      const text = clean(item?.str);

      if (!text) return null;

      const transform =
        Array.isArray(item?.transform)
          ? item.transform
          : [];

      return {
        text,
        x: Number(transform[4]) || 0,
        y: Number(transform[5]) || 0,
        width: Number(item?.width) || 0,
      };
    })
    .filter(Boolean);

  if (!validItems.length) {
    return [];
  }

  const lineGroups = [];

  const Y_TOLERANCE = 3;

  for (const item of validItems) {
    let group = null;

    for (const candidate of lineGroups) {
      if (
        Math.abs(candidate.y - item.y) <=
        Y_TOLERANCE
      ) {
        group = candidate;
        break;
      }
    }

    if (!group) {
      group = {
        y: item.y,
        items: [],
      };

      lineGroups.push(group);
    }

    group.items.push(item);
  }

  // أعلى الصفحة أولًا
  lineGroups.sort(
    (a, b) => b.y - a.y
  );

  return lineGroups.map((group) => {
    group.items.sort(
      (a, b) => a.x - b.x
    );

    return {
      text: clean(
        group.items
          .map((item) => item.text)
          .join(" ")
      ),
      items: group.items,
    };
  });
}
/* ==========================================================
   PARSE PDF PAGE LINES
========================================================== */

function parsePdfPageLines(lineObjects = []) {
  return lineObjects
    .map((lineObject) =>
      clean(lineObject.text)
    )
    .filter(Boolean);
}

/* ==========================================================
   DATE DETECTION
========================================================== */

function detectDate(text = "") {
  const source = String(text ?? "");

  let match = source.match(
    /\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/
  );

  if (match) {
    return `${match[1]}-${String(
      match[2]
    ).padStart(2, "0")}-${String(
      match[3]
    ).padStart(2, "0")}`;
  }

  match = source.match(
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
}

/* ==========================================================
   SMART PDF PARSER

   مهم جدًا:
   currentCinema يتم تمريره بين الصفحات.

   السينما لا تتغير بمجرد ظهور أي نص.
   السينما تتغير فقط عندما:
   - نبدأ بصفحة/قسم جديد
   - أو انتهى جدول السينما السابقة
   - ثم ظهر عنوان جديد واضح
========================================================== */

function buildPdfRows(lines = [], state = {}) {
  const rows = [];

  let currentCinema =
    state.currentCinema || "";

  let inTable =
    state.inTable || false;

  let afterTotal =
    state.afterTotal || false;

  for (let i = 0; i < lines.length; i++) {
    const line = clean(lines[i]);

    if (!line) continue;

    /* ------------------------------------------------------
       TOTAL
    ------------------------------------------------------ */

    if (isTotalText(line)) {
      console.log(
        "⏭️ PDF Total:",
        line
      );

      inTable = false;
      afterTotal = true;

      continue;
    }

    /* ------------------------------------------------------
       FULL HEADER
    ------------------------------------------------------ */

    if (isFullTableHeader(line)) {
      console.log(
        "📋 PDF Table Header:",
        line
      );

      inTable = true;
      afterTotal = false;

      continue;
    }

    /* ------------------------------------------------------
       SEPARATE HEADER
    ------------------------------------------------------ */

    if (isTableHeader(line)) {
      inTable = true;
      afterTotal = false;

      continue;
    }

    /* ------------------------------------------------------
       MOVIE
    ------------------------------------------------------ */

    const movieRow =
      parseMovieLine(line);

    if (movieRow) {
      if (currentCinema) {
        rows.push({
          cinema: currentCinema,
          movie: movieRow.movie,
          version: "",
          tickets: movieRow.tickets,
          revenue: movieRow.revenue,
        });

        console.log(
          "🎬 PDF Movie:",
          currentCinema,
          "=>",
          movieRow.movie,
          movieRow.tickets,
          movieRow.revenue
        );
      }

      inTable = true;
      afterTotal = false;

      continue;
    }

    /* ------------------------------------------------------
       CINEMA

       لا نغير السينما أثناء الجدول.
       بعد Total فقط نسمح بعنوان جديد.
    ------------------------------------------------------ */

    if (looksLikeCinemaTitle(line)) {
      if (!currentCinema) {
        currentCinema = line;
        inTable = false;
        afterTotal = false;

        console.log(
          "🏢 PDF Cinema:",
          currentCinema
        );

        continue;
      }

      /*
       إذا انتهى الجدول السابق ب Total
       فالنص التالي يمكن أن يكون Cinema جديدة.
      */

      if (afterTotal && !inTable) {
        currentCinema = line;
        inTable = false;
        afterTotal = false;

        console.log(
          "🏢 PDF Cinema Changed:",
          currentCinema
        );

        continue;
      }

      /*
       لو لم نكن داخل جدول،
       يمكن أن يكون عنوان سينما جديد.
      */

      if (!inTable && !afterTotal) {
        currentCinema = line;

        console.log(
          "🏢 PDF Cinema Changed:",
          currentCinema
        );

        continue;
      }

      /*
       داخل الجدول:
       لا نغير السينما.
      */
    }
  }

  state.currentCinema = currentCinema;
  state.inTable = inTable;
  state.afterTotal = afterTotal;

  return rows;
}

/* ==========================================================
   REMOVE DUPLICATES

   يمنع تكرار نفس الفيلم لنفس السينما
   إذا PDF.js كرر العناصر.
========================================================== */

function removeDuplicateRows(rows = []) {
  const seen = new Set();

  return rows.filter((row) => {
    const key = [
      normalizeText(row.cinema).toLowerCase(),
      normalizeText(row.movie).toLowerCase(),
      Number(row.tickets),
      Number(row.revenue),
    ].join("|");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

/* ==========================================================
   VALIDATE ROWS
========================================================== */

function validateRows(rows = []) {
  return rows.filter((row) => {
    if (!row) return false;

    if (
      !clean(row.cinema) ||
      !clean(row.movie)
    ) {
      return false;
    }

    if (isTotalText(row.movie)) {
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

    /*
      الإيراد يجب ألا يكون مساويًا للتذاكر
      في الملفات العادية.

      لكن لا نحذف الصف تلقائيًا هنا.
      لأن بعض الشركات قد يكون لديها
      أسعار/تنسيقات خاصة.
    */

    return true;
  });
}

/* ==========================================================
   PDF READER
========================================================== */

export async function pdfReader(file) {
  if (!file) {
    throw new Error(
      "PDF file is required"
    );
  }

  const buffer =
    await file.arrayBuffer();

  const pdf =
    await pdfjsLib.getDocument({
      data: buffer,
    }).promise;

  const pages = [];

  let fullText = "";

  let allPdfRows = [];

  /*
    الحالة مستمرة بين كل الصفحات.
  */

  const parserState = {
    currentCinema: "",
    inTable: false,
    afterTotal: false,
  };

  console.log(
    "===================================="
  );

  console.log(
    "📄 SMART PDF READER START"
  );

  console.log(
    "Pages:",
    pdf.numPages
  );

  console.log(
    "===================================="
  );

  for (
    let pageNo = 1;
    pageNo <= pdf.numPages;
    pageNo++
  ) {
    const page =
      await pdf.getPage(pageNo);

    const content =
      await page.getTextContent();

    const items =
      Array.isArray(content.items)
        ? content.items
        : [];

    const lineObjects =
      groupItemsIntoLines(items);

    const lines =
      parsePdfPageLines(
        lineObjects
      );

    const pageText =
      lines.length
        ? lines.join("\n")
        : items
            .map((item) =>
              clean(item?.str)
            )
            .filter(Boolean)
            .join(" ");

    pages.push({
      page: pageNo,
      text: pageText,
      lines,
    });

    fullText +=
      pageText + "\n";

    console.log(
      `📄 PDF Page ${pageNo}:`,
      lines.length,
      "lines"
    );

    /*
      نستخدم نفس state
      بين الصفحات.
    */

    const pageRows =
      buildPdfRows(
        lines,
        parserState
      );

    allPdfRows.push(
      ...pageRows
    );

    console.log(
      `📌 State after page ${pageNo}:`,
      parserState
    );
  }

  /* ========================================================
     FALLBACK
  ======================================================== */

  if (!allPdfRows.length) {
    console.warn(
      "⚠️ PDF primary parser returned 0 rows. Running fallback..."
    );

    const fallbackLines =
      splitPdfText(fullText);

    const fallbackState = {
      currentCinema: "",
      inTable: false,
      afterTotal: false,
    };

    allPdfRows =
      buildPdfRows(
        fallbackLines,
        fallbackState
      );
  }

  /* ========================================================
     CLEAN
  ======================================================== */

  allPdfRows =
    validateRows(allPdfRows);

  allPdfRows =
    removeDuplicateRows(allPdfRows);

  const reportDate =
    detectDate(fullText);

  /* ========================================================
     FINAL DEBUG
  ======================================================== */

  const cinemas = [
    ...new Set(
      allPdfRows.map(
        (row) => row.cinema
      )
    ),
  ];

  const tickets =
    allPdfRows.reduce(
      (sum, row) =>
        sum +
        Number(row.tickets || 0),
      0
    );

  const revenue =
    allPdfRows.reduce(
      (sum, row) =>
        sum +
        Number(row.revenue || 0),
      0
    );

  console.log(
    "===================================="
  );

  console.log(
    "📊 SMART PDF RESULT"
  );

  console.log(
    "Pages:",
    pdf.numPages
  );

  console.log(
    "Rows:",
    allPdfRows.length
  );

  console.log(
    "Report Date:",
    reportDate
  );

  console.log(
    "Cinemas:",
    cinemas
  );

  console.log(
    "Cinema Count:",
    cinemas.length
  );

  console.log(
    "Tickets:",
    tickets
  );

  console.log(
    "Revenue:",
    revenue
  );

  console.log(
    "===================================="
  );

  /* ========================================================
     RETURN
  ======================================================== */

  return {
    type: "pdf",

    text: fullText,

    pages,

    reportDate,

    parsedRows: allPdfRows,

    sheets: [
      {
        name: "PDF",

        rows: allPdfRows.map(
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
   END OF PDF READER
========================================================== */

/*
  ملاحظات مهمة:

  1. الملف يرجع:
     - type
     - text
     - pages
     - reportDate
     - parsedRows
     - sheets

  2. لا يوجد أي اعتماد على:
     MOV001
     CIN001

  3. الـ IDs الخاصة بقاعدة البيانات
     لا يتم تعديلها هنا.

  4. المطابقة مع movies / cinemas
     تظل مسؤولية مرحلة الـ Import التالية.

  5. الشكل النهائي لكل صف:

     {
       cinema: "...",
       movie: "...",
       version: "",
       tickets: 0,
       revenue: 0
     }
*/

/* ==========================================================
   OPTIONAL DEBUG HELPER
========================================================== */

export function debugPdfRows(rows = []) {
  const safeRows = Array.isArray(rows)
    ? rows
    : [];

  console.log(
    "===================================="
  );

  console.log(
    "🔎 PDF ROW DEBUG"
  );

  console.log(
    "Rows:",
    safeRows.length
  );

  safeRows.forEach((row, index) => {
    console.log(
      `${index + 1}.`,
      {
        cinema: row?.cinema || "",
        movie: row?.movie || "",
        version: row?.version || "",
        tickets: Number(row?.tickets || 0),
        revenue: Number(row?.revenue || 0),
      }
    );
  });

  console.log(
    "===================================="
  );

  return safeRows;
}