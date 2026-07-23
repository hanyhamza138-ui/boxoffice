import { similarity } from "./fuzzy";

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .trim()

    // Arabic Normalize
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")

    // Remove punctuation
    .replace(/[()]/g, "")
    .replace(/[-_]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")

    // Collapse spaces
    .replace(/\s+/g, " ")
    .trim();
}

export function baseMatcher(search, items = [], options = {}) {
  if (!search) return null;

  const {
    textField = "name",
    aliasField = "alias",
    aliasList = [],
    fuzzyThreshold = 80,
  } = options;

  const target = normalize(search);

  let bestItem = null;
  let bestScore = 0;

  //---------------------------------
  // Exact
  //---------------------------------

  for (const item of items) {
    const value = normalize(item[textField]);

    if (value === target) {
      return item;
    }
  }

  //---------------------------------
  // Alias Exact
  //---------------------------------

  for (const alias of aliasList) {
    const value = normalize(alias[aliasField]);

    if (value === target) {
      return alias.item;
    }
  }

  //---------------------------------
  // Contains
  //---------------------------------

  for (const item of items) {
    const value = normalize(item[textField]);

    if (
      value.includes(target) ||
      target.includes(value)
    ) {
      return item;
    }
  }

  //---------------------------------
  // Alias Contains
  //---------------------------------

  for (const alias of aliasList) {
    const value = normalize(alias[aliasField]);

    if (
      value.includes(target) ||
      target.includes(value)
    ) {
      return alias.item;
    }
  }

  //---------------------------------
  // Fuzzy Items
  //---------------------------------

  for (const item of items) {
    const score = similarity(
      target,
      normalize(item[textField])
    );

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  //---------------------------------
  // Fuzzy Alias
  //---------------------------------

  for (const alias of aliasList) {
    const score = similarity(
      target,
      normalize(alias[aliasField])
    );

    if (score > bestScore) {
      bestScore = score;
      bestItem = alias.item;
    }
  }

  //---------------------------------
  // Return Best Match
  //---------------------------------

  if (bestScore >= fuzzyThreshold) {
    return bestItem;
  }

  return null;
}