/* ==========================================================
   OCR NORMALIZER
========================================================== */

const WORD_FIXES = [

  ["1MAX", "IMAX"],
  ["LMAX", "IMAX"],
  ["lMAX", "IMAX"],

  ["MX40", "MX4D"],
  ["MXAD", "MX4D"],

  ["SCREEMX", "SCREENX"],
  ["SCREEN X", "SCREENX"],

  ["VlP", "VIP"],
  ["V1P", "VIP"],

  ["2 O", "20"],
  ["3 O", "30"],
  ["4 O", "40"],
  ["5 O", "50"],
  ["6 O", "60"],
  ["7 O", "70"],
  ["8 O", "80"],
  ["9 O", "90"],

  ["O", "0"],

];

function fixWords(text) {

  let value =
    String(text ?? "");

  for (const [from, to] of WORD_FIXES) {

    value =
      value.replace(

        new RegExp(from, "gi"),

        to

      );

  }

  return value;

}

function fixSpaces(text) {

  return text

    .replace(/\s+/g, " ")

    .trim();

}

export function normalizeOCR(text) {

  return fixSpaces(

    fixWords(text)

  );

}