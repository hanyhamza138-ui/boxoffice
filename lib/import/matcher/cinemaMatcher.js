import { supabase } from "../../supabase";
import { similarity } from "./fuzzy";

/* ==========================================================
   CACHE
========================================================== */

let cinemaCache = null;
let aliasCache = null;

/* ==========================================================
   BASIC NORMALIZATION
========================================================== */

function clean(value = "") {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/* ==========================================================
   TOTAL ROW
========================================================== */

function isTotalRow(value = "") {
  const text = clean(value)
    .replace(/\s+/g, "");

  if (!text) {
    return false;
  }

  const totalWords = [
    "الإجمالي",
    "الاجمالي",
    "الأجمالي",
    "اجمالي",
    "إجمالى",
    "الاجمالى",
    "الأجمالى",
    "المجموع",
    "مجموع",
    "total",
    "grandtotal",
    "subtotal",
    "sum",
  ];

  return totalWords.some((word) => {
    const normalized =
      clean(word).replace(/\s+/g, "");

    return (
      text === normalized ||
      text.includes(normalized)
    );
  });
}

/* ==========================================================
   ARABIC NORMALIZATION
========================================================== */

function normalizeArabic(value = "") {
  return String(value ?? "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ـ+/g, "");
}

/* ==========================================================
   CINEMA NAME NORMALIZATION
========================================================== */

function normalizeCinemaName(value = "") {
  let text = normalizeArabic(value);

  text = text
    .toLowerCase()
    .trim();

  /*
    توحيد بعض الكلمات الشائعة
  */

  text = text
    .replace(/\bcinemas\b/g, "cinema")
    .replace(/\bcinema\b/g, "cinema")
    .replace(/\btheatres\b/g, "cinema")
    .replace(/\btheatre\b/g, "cinema")
    .replace(/\btheaters\b/g, "cinema")
    .replace(/\btheater\b/g, "cinema");

  /*
    عربي
  */

  text = text
    .replace(/السينمات/g, "سينما")
    .replace(/السينما/g, "سينما")
    .replace(/سينمات/g, "سينما");

  /*
    إزالة علامات الترقيم والرموز
  */

  text = text
    .replace(/[()[\]{}]/g, " ")
    .replace(/[-_–—]/g, " ")
    .replace(/[.,:;|/\\]+/g, " ")
    .replace(/[+*=#@!$%^&?]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ");

  /*
    توحيد المسافات
  */

  text = text
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

/* ==========================================================
   NORMALIZE WITHOUT GENERIC CINEMA WORD
========================================================== */

function normalizeCinemaCore(value = "") {
  return normalizeCinemaName(value)
    .replace(/\b(cinema)\b/g, " ")
    .replace(/\bسينما\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ==========================================================
   TOKENS
========================================================== */

function tokens(value = "") {
  return normalizeCinemaName(value)
    .split(" ")
    .map((x) => x.trim())
    .filter(Boolean);
}

/* ==========================================================
   LOAD DATA
========================================================== */

async function loadData() {
  /* --------------------------------------------------------
     CINEMAS
  -------------------------------------------------------- */

  if (!cinemaCache) {
    const { data, error } =
      await supabase
        .from("cinemas")
        .select("id,name")
        .order("name");

    if (error) {
      console.error(
        "Cinema Load Error:",
        error
      );

      cinemaCache = [];
    } else {
      cinemaCache = data || [];
    }

    console.log(
      "Cinema Matcher Loaded:",
      cinemaCache.length
    );
  }

  /* --------------------------------------------------------
     ALIASES
  -------------------------------------------------------- */

  if (!aliasCache) {
    const { data, error } =
      await supabase
        .from("cinema_aliases")
        .select("*");

    if (error) {
      console.error(
        "Cinema Alias Load Error:",
        error
      );

      aliasCache = [];
    } else {
      aliasCache = data || [];
    }

    console.log(
      "Cinema Aliases Loaded:",
      aliasCache.length
    );
  }
}

/* ==========================================================
   SAFE RESULT
========================================================== */

function result(
  item,
  score,
  method
) {
  if (!item || !item.id) {
    return null;
  }

  return {
    item,
    score,
    method,
  };
}

/* ==========================================================
   TOKEN SCORE
========================================================== */

function tokenScore(a, b) {
  const aa = tokens(a);
  const bb = tokens(b);

  if (!aa.length || !bb.length) {
    return 0;
  }

  let matched = 0;

  for (const word of aa) {
    if (word.length < 2) {
      continue;
    }

    const found = bb.some((other) => {
      if (other.length < 2) {
        return false;
      }

      return (
        word === other ||
        word.includes(other) ||
        other.includes(word)
      );
    });

    if (found) {
      matched++;
    }
  }

  return matched;
}

/* ==========================================================
   TOKEN COVERAGE
========================================================== */

function tokenCoverage(a, b) {
  const aa = tokens(a);
  const bb = tokens(b);

  const meaningful =
    aa.filter(
      (word) => word.length >= 2
    );

  if (!meaningful.length) {
    return 0;
  }

  let matched = 0;

  for (const word of meaningful) {
    const found = bb.some((other) => {
      if (other.length < 2) {
        return false;
      }

      return (
        word === other ||
        word.includes(other) ||
        other.includes(word)
      );
    });

    if (found) {
      matched++;
    }
  }

  return (
    matched /
    meaningful.length
  );
}

/* ==========================================================
   ALIAS CINEMA ID
========================================================== */

function getAliasCinemaId(alias) {
  if (!alias) {
    return null;
  }

  return (
    alias.cinema_id ??
    alias.cinemaId ??
    alias.target_id ??
    alias.targetId ??
    null
  );
}

/* ==========================================================
   FIND CINEMA BY ID
========================================================== */

function findCinemaById(id) {
  if (
    id === null ||
    id === undefined
  ) {
    return null;
  }

  return (
    cinemaCache?.find(
      (cinema) =>
        String(cinema.id) ===
        String(id)
    ) || null
  );
}

/* ==========================================================
   MATCH CINEMA
========================================================== */

export async function matchCinema(name) {
  await loadData();

  if (!name) {
    return null;
  }

  const original =
    String(name).trim();

  if (!original) {
    return null;
  }

  /*
    لا نحاول مطابقة صفوف الإجماليات.
  */

  if (isTotalRow(original)) {
    console.log(
      "Cinema Total Row Ignored:",
      original
    );

    return null;
  }

  const input =
    normalizeCinemaName(original);

  const inputCore =
    normalizeCinemaCore(original);

  if (!input) {
    return null;
  }

  console.log(
    `matchCinema("${original}") -> "${input}"`
  );

  /* ========================================================
     1. ALIAS EXACT
  ======================================================== */

  for (const alias of aliasCache || []) {
    if (!alias?.alias) {
      continue;
    }

    const aliasName =
      normalizeCinemaName(
        alias.alias
      );

    if (aliasName !== input) {
      continue;
    }

    const cinema =
      findCinemaById(
        getAliasCinemaId(alias)
      );

    if (cinema) {
      console.log(
        "Cinema Match:",
        original,
        "=>",
        cinema.name,
        "alias-exact"
      );

      return result(
        cinema,
        100,
        "alias-exact"
      );
    }
  }

  /* ========================================================
     2. EXACT DATABASE
  ======================================================== */

  for (const cinema of cinemaCache || []) {
    if (!cinema?.name) {
      continue;
    }

    const dbName =
      normalizeCinemaName(
        cinema.name
      );

    if (dbName === input) {
      console.log(
        "Cinema Match:",
        original,
        "=>",
        cinema.name,
        "exact"
      );

      return result(
        cinema,
        100,
        "exact"
      );
    }
  }

  /* ========================================================
     3. EXACT CORE
     
     مثال:
     Cinema Mall
     Mall
     
     أو:
     سينما سيتي ستارز
     سيتي ستارز
  ======================================================== */

  if (inputCore) {
    for (const cinema of cinemaCache || []) {
      if (!cinema?.name) {
        continue;
      }

      const dbCore =
        normalizeCinemaCore(
          cinema.name
        );

      if (
        dbCore &&
        dbCore === inputCore
      ) {
        console.log(
          "Cinema Match:",
          original,
          "=>",
          cinema.name,
          "core-exact"
        );

        return result(
          cinema,
          99,
          "core-exact"
        );
      }
    }
  }

  /* ========================================================
     4. ALIAS CORE
  ======================================================== */

  if (inputCore) {
    for (const alias of aliasCache || []) {
      if (!alias?.alias) {
        continue;
      }

      const aliasCore =
        normalizeCinemaCore(
          alias.alias
        );

      if (
        !aliasCore ||
        aliasCore !== inputCore
      ) {
        continue;
      }

      const cinema =
        findCinemaById(
          getAliasCinemaId(alias)
        );

      if (cinema) {
        console.log(
          "Cinema Match:",
          original,
          "=>",
          cinema.name,
          "alias-core"
        );

        return result(
          cinema,
          99,
          "alias-core"
        );
      }
    }
  }

  /* ========================================================
     5. CONTAINS
     
     لا نقبل contains للكلمات القصيرة.
  ======================================================== */

  let containsMatches = [];

  for (const cinema of cinemaCache || []) {
    if (!cinema?.name) {
      continue;
    }

    const dbName =
      normalizeCinemaName(
        cinema.name
      );

    const dbCore =
      normalizeCinemaCore(
        cinema.name
      );

    if (
      input.length >= 5 &&
      dbName.length >= 5 &&
      (
        dbName.includes(input) ||
        input.includes(dbName)
      )
    ) {
      containsMatches.push({
        cinema,
        score: 96,
      });

      continue;
    }

    if (
      inputCore.length >= 5 &&
      dbCore.length >= 5 &&
      (
        dbCore.includes(inputCore) ||
        inputCore.includes(dbCore)
      )
    ) {
      containsMatches.push({
        cinema,
        score: 95,
      });
    }
  }

  /*
    إذا وجدنا نتيجة واحدة فقط، نقبلها.
    لو أكثر من نتيجة، نتركها للمراحل التالية
    حتى لا نختار سينما غلط.
  */

  if (
    containsMatches.length === 1
  ) {
    const match =
      containsMatches[0];

    console.log(
      "Cinema Match:",
      original,
      "=>",
      match.cinema.name,
      "contains"
    );

    return result(
      match.cinema,
      match.score,
      "contains"
    );
  }

  /* ========================================================
     6. ALIAS CONTAINS
  ======================================================== */

  const aliasContains = [];

  for (const alias of aliasCache || []) {
    if (!alias?.alias) {
      continue;
    }

    const aliasName =
      normalizeCinemaName(
        alias.alias
      );

    const aliasCore =
      normalizeCinemaCore(
        alias.alias
      );

    let matched = false;

    if (
      aliasName.length >= 5 &&
      input.length >= 5 &&
      (
        aliasName.includes(input) ||
        input.includes(aliasName)
      )
    ) {
      matched = true;
    }

    if (
      !matched &&
      aliasCore.length >= 5 &&
      inputCore.length >= 5 &&
      (
        aliasCore.includes(inputCore) ||
        inputCore.includes(aliasCore)
      )
    ) {
      matched = true;
    }

    if (!matched) {
      continue;
    }

    const cinema =
      findCinemaById(
        getAliasCinemaId(alias)
      );

    if (cinema) {
      aliasContains.push({
        cinema,
        score: 94,
      });
    }
  }

  if (
    aliasContains.length === 1
  ) {
    const match =
      aliasContains[0];

    console.log(
      "Cinema Match:",
      original,
      "=>",
      match.cinema.name,
      "alias-contains"
    );

    return result(
      match.cinema,
      match.score,
      "alias-contains"
    );
  }

  /* ========================================================
     7. TOKEN MATCH
  ======================================================== */

  let bestToken = null;
  let bestTokenScore = 0;
  let bestCoverage = 0;

  for (const cinema of cinemaCache || []) {
    if (!cinema?.name) {
      continue;
    }

    const dbName =
      normalizeCinemaName(
        cinema.name
      );

    const score =
      tokenScore(
        input,
        dbName
      );

    const coverage =
      tokenCoverage(
        input,
        dbName
      );

    if (
      score > bestTokenScore ||
      (
        score === bestTokenScore &&
        coverage > bestCoverage
      )
    ) {
      bestToken = cinema;
      bestTokenScore = score;
      bestCoverage = coverage;
    }
  }

  /*
    مهم:
    لا نريد أن تتطابق سينما فقط بسبب كلمة
    عامة واحدة.
  */

  if (
    bestToken &&
    bestTokenScore >= 2 &&
    bestCoverage >= 0.5
  ) {
    const score =
      Math.min(
        93,
        Math.round(
          65 +
          bestCoverage * 25
        )
      );

    console.log(
      "Cinema Match:",
      original,
      "=>",
      bestToken.name,
      "token",
      score
    );

    return result(
      bestToken,
      score,
      "token"
    );
  }

  /* ========================================================
     8. FUZZY
  ======================================================== */

  let bestFuzzy = null;
  let bestFuzzyScore = 0;

  for (const cinema of cinemaCache || []) {
    if (!cinema?.name) {
      continue;
    }

    const dbName =
      normalizeCinemaName(
        cinema.name
      );

    if (!dbName) {
      continue;
    }

    const score =
      similarity(
        input,
        dbName
      );

    if (
      score > bestFuzzyScore
    ) {
      bestFuzzyScore = score;
      bestFuzzy = cinema;
    }
  }

  /*
    نقبل fuzzy فقط إذا كان قويًا.
  */

  if (
    bestFuzzy &&
    bestFuzzyScore >= 75
  ) {
    console.log(
      "Cinema Match:",
      original,
      "=>",
      bestFuzzy.name,
      "fuzzy",
      bestFuzzyScore
    );

    return result(
      bestFuzzy,
      bestFuzzyScore,
      "fuzzy"
    );
  }

  /* ========================================================
     DEBUG
  ======================================================== */

  console.warn(
    "❌ Cinema Not Matched:",
    original
  );

  console.warn(
    "Normalized:",
    input
  );

  console.warn(
    "Normalized Core:",
    inputCore
  );

  console.warn(
    "Loaded Cinemas:",
    cinemaCache?.length || 0
  );

  console.warn(
    "Available Cinemas:",
    (cinemaCache || [])
      .map(
        (cinema) =>
          `${cinema.id}: ${cinema.name}`
      )
      .join(" | ")
  );

  return null;
}

/* ==========================================================
   CLEAR CACHE
========================================================== */

export function clearCinemaMatcherCache() {
  cinemaCache = null;
  aliasCache = null;
}