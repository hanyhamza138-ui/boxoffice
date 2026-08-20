
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

export function baseMatcher(
  search,
  items = [],
  options = {}
) {
  if (!search) return null;

  const {
    textField = "name",
    aliasField = "alias",
    aliasList = [],
    fuzzyThreshold = 80,
  } = options;

  const target = normalize(search);

  if (!target) return null;

  let bestItem = null;
  let bestScore = 0;
  let bestMethod = null;

  // ---------------------------------
  // Exact Item
  // ---------------------------------

  for (const item of items) {
    if (!item) continue;

    const value = normalize(item[textField]);

    if (!value) continue;

    if (value === target) {
      return {
        item,
        score: 100,
        method: "exact",
      };
    }
  }

  // ---------------------------------
  // Exact Alias
  // ---------------------------------

  for (const alias of aliasList) {
    if (!alias) continue;

    const value = normalize(alias[aliasField]);

    if (!value) continue;

    if (value === target && alias.item) {
      return {
        item: alias.item,
        score: 100,
        method: "alias-exact",
      };
    }
  }

  // ---------------------------------
  // Contains Item
  // ---------------------------------

  for (const item of items) {
    if (!item) continue;

    const value = normalize(item[textField]);

    if (!value) continue;

    if (
      value.includes(target) ||
      target.includes(value)
    ) {
      const score =
        value === target
          ? 100
          : 90;

      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
        bestMethod = "contains";
      }
    }
  }

  // ---------------------------------
  // Contains Alias
  // ---------------------------------

  for (const alias of aliasList) {
    if (!alias || !alias.item) continue;

    const value = normalize(alias[aliasField]);

    if (!value) continue;

    if (
      value.includes(target) ||
      target.includes(value)
    ) {
      const score =
        value === target
          ? 100
          : 90;

      if (score > bestScore) {
        bestScore = score;
        bestItem = alias.item;
        bestMethod = "alias-contains";
      }
    }
  }

  // ---------------------------------
  // Fuzzy Items
  // ---------------------------------

  for (const item of items) {
    if (!item) continue;

    const value = normalize(item[textField]);

    if (!value) continue;

    const score = similarity(
      target,
      value
    );

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
      bestMethod = "fuzzy";
    }
  }

  // ---------------------------------
  // Fuzzy Aliases
  // ---------------------------------

  for (const alias of aliasList) {
    if (!alias || !alias.item) continue;

    const value = normalize(alias[aliasField]);

    if (!value) continue;

    const score = similarity(
      target,
      value
    );

    if (score > bestScore) {
      bestScore = score;
      bestItem = alias.item;
      bestMethod = "alias-fuzzy";
    }
  }

  // ---------------------------------
  // Return Best Match
  // ---------------------------------

  if (
    bestItem &&
    bestScore >= fuzzyThreshold
  ) {
    return {
      item: bestItem,
      score: bestScore,
      method: bestMethod,
    };
  }

  return null;
}

