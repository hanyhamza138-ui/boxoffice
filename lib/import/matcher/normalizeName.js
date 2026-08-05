/* ==========================================================
   LOCATION DICTIONARY
========================================================== */

const LOCATION_DICTIONARY = {

  "سان ستيفانو": "san stefano",
  "مدينتي": "madinaty",
  "مول مصر": "mall of egypt",
  "سيتي سنتر": "city center",
  "سيتي سنتر اسكندرية": "city center alexandria",
  "الرحاب": "rehab",
  "العلمين": "alamein",
  "التجمع": "new cairo",
  "الماظة": "almaza",

};

/* ==========================================================
   REMOVE WORDS
========================================================== */

const REMOVE_WORDS = [

  "cinema",
  "cinemas",
  "theatre",
  "theaters",
  "renaissance",
  "vox",
  "amc",
  "imax",
  "vip",

  "سينما",
  "سينمات",
  "فوكس",
  "ايماكس",
  "في اي بي",

  "mall",
  "city",
  "center",
  "centre",

  "مول",
  "سيتي",
  "سنتر",
  "مركز",

];

/* ==========================================================
   NORMALIZE
========================================================== */

export function normalizeName(value) {

  let text = String(value ?? "")
    .toLowerCase()
    .trim();

  //----------------------------------
  // Remove punctuation
  //----------------------------------

  text = text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  //----------------------------------
  // Arabic -> English locations
  //----------------------------------

  if (LOCATION_DICTIONARY[text]) {

    text = LOCATION_DICTIONARY[text];

  }

  //----------------------------------
  // Remove common words
  //----------------------------------

  for (const word of REMOVE_WORDS) {

    text = text.replace(

      new RegExp(`\\b${word}\\b`, "gi"),

      " "

    );

  }

  //----------------------------------
  // Normalize spaces
  //----------------------------------

  text = text
    .replace(/\s+/g, " ")
    .trim();

  return text;

}