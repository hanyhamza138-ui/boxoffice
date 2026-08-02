/* =========================================================
   DOCUMENT CLASSIFIER
========================================================= */

function normalize(text) {

  return String(text ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

}

const KEYWORDS = {

  excel: [

    "movie",
    "cinema",
    "tickets",
    "revenue",
    "gross",

    "الفيلم",
    "التذاكر",
    "الإيراد"

  ],

  whatsapp: [

    "whatsapp",
    "forwarded",
    "pm",
    "am",

    "تمت إعادة التوجيه"

  ],

  pdf: [

    "page",
    "report",
    "generated",
    "summary"

  ],

  image: [

    "ocr"

  ]

};

function score(text, words) {

  let s = 0;

  for (const word of words) {

    if (
      text.includes(
        normalize(word)
      )
    ) {

      s++;

    }

  }

  return s;

}

export function classifyDocument(document) {

  let text = "";

  //-----------------------------------
  // OCR / TXT
  //-----------------------------------

  if (document.text) {

    text +=
      document.text;

  }

  //-----------------------------------
  // Excel
  //-----------------------------------

  if (document.sheets) {

    for (const sheet of document.sheets) {

      for (const row of sheet.rows) {

        text +=
          " " +
          row.join(" ");

      }

    }

  }

  text =
    normalize(text);

  const result = {

    excel:
      score(
        text,
        KEYWORDS.excel
      ),

    whatsapp:
      score(
        text,
        KEYWORDS.whatsapp
      ),

    pdf:
      score(
        text,
        KEYWORDS.pdf
      ),

    image:
      score(
        text,
        KEYWORDS.image
      ),

  };

  let best = "unknown";

  let bestScore = -1;

  Object.entries(result)

    .forEach(

      ([key, value]) => {

        if (
          value >
          bestScore
        ) {

          bestScore =
            value;

          best =
            key;

        }

      }

    );

  return {

    type: best,

    scores: result,

  };

}