const MOVIE_WORDS = [
  "movie",
  "film",
  "title",
  "picture",
  "اسم الفيلم",
  "الفيلم",
];

const CINEMA_WORDS = [
  "cinema",
  "سينما",
  "mall",
  "مول",
  "vox",
  "amc",
];

const REVENUE_WORDS = [
  "revenue",
  "gross",
  "box office",
  "sales",
  "الإيراد",
  "الايراد",
  "الصافي",
];

const TICKET_WORDS = [
  "tickets",
  "admissions",
  "attendance",
  "audience",
  "الحضور",
  "التذاكر",
];

function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .trim();
}

function containsAny(text, words) {

  text = normalize(text);

  return words.some(
    word =>
      text.includes(
        normalize(word)
      )
  );

}

export function analyzeDocument(document) {

  let score = {

    movie: 0,

    cinema: 0,

    revenue: 0,

    tickets: 0,

  };

  const lines = [];

  //----------------------------------
  // Excel / CSV
  //----------------------------------

  if (document.sheets) {

    for (const sheet of document.sheets) {

      for (const row of sheet.rows) {

        lines.push(
          row.join(" ")
        );

      }

    }

  }

  //----------------------------------
  // Text / OCR
  //----------------------------------

  if (document.text) {

    lines.push(
      ...document.text.split(/\r?\n/)
    );

  }

  //----------------------------------
  // Analyze
  //----------------------------------

  for (const line of lines) {

    if (
      containsAny(
        line,
        MOVIE_WORDS
      )
    ) {

      score.movie++;

    }

    if (
      containsAny(
        line,
        CINEMA_WORDS
      )
    ) {

      score.cinema++;

    }

    if (
      containsAny(
        line,
        REVENUE_WORDS
      )
    ) {

      score.revenue++;

    }

    if (
      containsAny(
        line,
        TICKET_WORDS
      )
    ) {

      score.tickets++;

    }

  }

  return score;

}