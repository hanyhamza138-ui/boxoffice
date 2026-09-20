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
    .replace(/\s+/g, "");

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
      .replace(/\s+/g, "");

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
  const text = normalizeText(value);

  return (
    text === "الفيلم" ||
    text === "اسم الفيلم" ||
    text === "movie" ||
    text === "movie name" ||
    text === "التذاكر" ||
    text === "تذاكر" ||
    text === "tickets" ||
    text === "ticket" ||
    text === "الصافي" ||
    text === "صافي" ||
    text === "net" ||
    text === "net income" ||
    text === "revenue"
  );
}

/* ==========================================================
   CINEMA HEADER DETECTION
========================================================== */

function looksLikeCinemaTitle(value = "") {
  const text = clean(value);

  if (!text) return false;

  if (isTotalText(text)) {
    return false;
  }

  if (isTableHeader(text)) {
    return false;
  }

  /*
    صفوف الأرقام ليست سينمات.
  */
  if (
    /^[\d\s,.\-]+$/.test(text)
  ) {
    return false;
  }

  /*
    استبعاد عبارات التقرير العامة.
  */
  const ignored = [
    "report",
    "box office",
    "cinema report",
    "تقرير",
    "تقرير السينما",
    "تقرير الايرادات",
    "تقرير الإيرادات",
    "التاريخ",
    "date",
  ];

  const normalized =
    normalizeText(text);

  if (
    ignored.some(
      (word) =>
        normalized ===
          normalizeText(word) ||
        normalized.startsWith(
          normalizeText(word) + " "
        )
    )
  ) {
    return false;
  }

  return true;
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
   EXTRACT TABLE ROW
========================================================== */

/*
  PDF أحيانًا يرجع الصف بهذا الشكل:

  محمود التاني 672 99,321.60

  أو:

  672 99,321.60 محمود التاني

  لذلك نحاول استخراج الرقمين من نهاية السطر.
*/

function parseMovieLine(line = "") {
  const text = clean(line);

  if (!text) return null;

  if (isTotalText(text)) {
    return null;
  }

  if (isTableHeader(text)) {
    return null;
  }

  /*
    Tickets + Revenue في نهاية السطر
  */

  const endMatch = text.match(
    /^(.*?)\s+([\d,]+)\s+([\d,]+(?:[.,]\d+)?)$/
  );

  if (endMatch) {
    const movie = clean(endMatch[1]);

    if (!movie) return null;

    return {
      movie,
      tickets: toNumber(endMatch[2]),
      revenue: toNumber(
        endMatch[3]
      ),
    };
  }

  /*
    محاولة أخرى إذا كان الـ PDF فصل الأرقام بشكل مختلف.
  */

  const numbers = [
    ...text.matchAll(
      /(\d[\d,]*(?:[.,]\d+)?)/g
    ),
  ];

  if (numbers.length >= 2) {
    const first =
      numbers[numbers.length - 2];

    const second =
      numbers[numbers.length - 1];

    const movie = clean(
      text
        .slice(
          0,
          first.index
        )
    );

    if (movie) {
      return {
        movie,
        tickets: toNumber(
          first[1]
        ),
        revenue: toNumber(
          second[1]
        ),
      };
    }
  }

  return null;
}

/* ==========================================================
   BUILD SMART PDF ROWS
========================================================== */

function buildPdfRows(lines = []) {
  const rows = [];

  let currentCinema = "";

  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = clean(lines[i]);

    if (!line) {
      continue;
    }

    /*
      Total
    */

    if (isTotalText(line)) {
      inTable = false;
      continue;
    }

    /*
      Header:
      الفيلم / التذاكر / الصافي
    */

    if (
      isTableHeader(line)
    ) {
      /*
        لو السطر جزء من Header
      */
      if (
        normalizeText(line)
          .includes("فيلم") ||
        normalizeText(line)
          .includes("movie")
      ) {
        inTable = true;
      }

      continue;
    }

    /*
      محاولة قراءة فيلم.
    */

    const movieRow =
      parseMovieLine(line);

    if (movieRow) {
      /*
        مهم جدًا:
        لا نضيف الفيلم إلا إذا كانت
        هناك سينما حالية.
      */

      if (currentCinema) {
        rows.push({
          cinema:
            currentCinema,
          movie:
            movieRow.movie,
          version: "",
          tickets:
            movieRow.tickets,
          revenue:
            movieRow.revenue,
        });
      }

      inTable = true;
      continue;
    }

    /*
      لو لم يكن فيلمًا ولا Header ولا Total
      فغالبًا هو اسم سينما.

      لا نغير السينما أثناء الجدول
      إلا عندما يظهر اسم جديد واضح.
    */

    if (
      looksLikeCinemaTitle(line)
    ) {
      /*
        لا نعتبر السطر سينما إذا كان
        داخل فيلم لم نستطع تحليله.
      */

      if (!inTable || !currentCinema) {
        currentCinema = line;
        inTable = false;

        console.log(
          "🏢 PDF Cinema:",
          currentCinema
        );

        continue;
      }

      /*
        إذا كان لدينا سينما حالية
        والسطر ليس فيلمًا، فهذا غالبًا
        بداية سينما جديدة.
      */

      currentCinema = line;
      inTable = false;

      console.log(
        "🏢 PDF Cinema Changed:",
        currentCinema
      );
    }
  }

  return rows;
}

/* ==========================================================
   EXTRACT DATE
========================================================== */

function detectDate(text = "") {
  const source = String(text ?? "");

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

  for (
    let pageNo = 1;
    pageNo <= pdf.numPages;
    pageNo++
  ) {
    const page =
      await pdf.getPage(pageNo);

    const content =
      await page.getTextContent();

    /*
      نحاول الحفاظ على ترتيب النص
      الموجود في الصفحة.
    */

    const items =
      Array.isArray(
        content.items
      )
        ? content.items
        : [];

    const lines = [];

    let currentLine = [];

    let lastY = null;

    for (const item of items) {
      const text =
        clean(item?.str);

      if (!text) {
        continue;
      }

      /*
        PDF.js يعطي transform:
        [scaleX, skewX, skewY, scaleY, x, y]
      */

      const y =
        Array.isArray(
          item?.transform
        )
          ? item.transform[5]
          : null;

      /*
        إذا تغير Y بشكل واضح
        فهذا سطر جديد.
      */

      if (
        lastY !== null &&
        y !== null &&
        Math.abs(
          y - lastY
        ) > 3
      ) {
        if (
          currentLine.length
        ) {
          lines.push(
            currentLine.join(" ")
          );
        }

        currentLine = [];
      }

      currentLine.push(text);

      if (y !== null) {
        lastY = y;
      }
    }

    if (
      currentLine.length
    ) {
      lines.push(
        currentLine.join(" ")
      );
    }

    /*
      Fallback لو PDF لم يعطِ
      مواقع Y بشكل مفيد.
    */

    const pageText =
      lines.length
        ? lines.join("\n")
        : items
            .map(
              (item) =>
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

    /*
      نحول الصفحة إلى صفوف مؤقتة
      ونضيفها إلى Parser العام.
    */

    const pageRows =
      buildPdfRows(lines);

    allPdfRows.push(
      ...pageRows
    );
  }

  /*
    لو استخراج Y فشل،
    نجرب النص الكامل كسطور.
  */

  if (!allPdfRows.length) {
    const fallbackLines =
      splitPdfText(
        fullText
      );

    allPdfRows =
      buildPdfRows(
        fallbackLines
      );
  }

  const reportDate =
    detectDate(fullText);

  console.log(
    "===================================="
  );

  console.log(
    "📄 PDF READER"
  );

  console.log(
    "Pages:",
    pdf.numPages
  );

  console.log(
    "PDF Rows:",
    allPdfRows.length
  );

  console.log(
    "Report Date:",
    reportDate
  );

  console.log(
    "===================================="
  );

  return {
    type: "pdf",

    text: fullText,

    pages,

    reportDate,

    /*
      هذه هي البيانات المهمة
      التي سيستخدمها Smart Import.
    */

    parsedRows:
      allPdfRows,

    /*
      نحافظ على sheets
      حتى لا نكسر النظام الحالي.
    */

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
   DEFAULT EXPORT
========================================================== */

export default pdfReader;