function clean(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isHeader(row, template) {
  const movieTitle = normalize(template.columns.movie);

  return row.some(
    (cell) => normalize(cell) === movieTitle
  );
}

function findColumn(row, names) {
  if (!Array.isArray(names)) {
    names = [names];
  }

  const normalized = names.map(normalize);

  return row.findIndex((cell) =>
    normalized.some((name) =>
      normalize(cell).includes(name)
    )
  );
}

function isStop(row, template) {
  const text = normalize(row.join(" "));

  return (template.stopWords || []).some((word) =>
    text.includes(normalize(word))
  );
}

function findDate(rows) {
  const regex =
    /\b(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})\b/;

  for (const row of rows) {
    for (const cell of row) {
      const value = clean(cell);

      const match = value.match(regex);

      if (match) {
        return `${match[1]}-${match[2].padStart(
          2,
          "0"
        )}-${match[3].padStart(2, "0")}`;
      }
    }
  }

  return "";
}

export function parseByTemplate(
  document,
  template
) {
  const result = [];

  let reportDate = "";

  for (const sheet of document.sheets) {
    const rows = sheet.rows || [];

    if (!reportDate) {
      reportDate = findDate(rows);
    }

    let cinema = "";

    let collecting = false;

    let movieCol = -1;
    let ticketsCol = -1;
    let revenueCol = -1;
    let versionCol = -1;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (
        !row ||
        row.every(
          (c) => clean(c) === ""
        )
      ) {
        continue;
      }

      //------------------------------------
      // New Cinema Table
      //------------------------------------

      if (isHeader(row, template)) {
        cinema = clean(
          rows[i - 1]?.[0]
        );

        movieCol = findColumn(row, [
          "الفيلم",
          "movie",
          "film",
          "title",
        ]);

        ticketsCol = findColumn(row, [
          "التذاكر",
          "tickets",
          "audience",
        ]);

        revenueCol = findColumn(row, [
          "الصافي",
          "الإيراد",
          "الايراد",
          "revenue",
          "gross",
          "net",
        ]);

        versionCol = findColumn(row, [
          "version",
          "format",
          "type",
          "screen",
          "experience",
          "presentation",
          "نسخة",
          "الصالة",
          "القاعة",
        ]);

        collecting = true;

        continue;
      }

      //------------------------------------
      // End Current Cinema
      //------------------------------------

      if (
        collecting &&
        isStop(row, template)
      ) {
        collecting = false;
        continue;
      }

      //------------------------------------
      // Read Movies
      //------------------------------------

      if (collecting) {
        const movie = clean(
          row[movieCol]
        );

        if (!movie) {
          continue;
        }

        result.push({
          reportDate,
          cinema,
          movie,
          version:
            versionCol >= 0
              ? clean(
                  row[versionCol]
                )
              : "",
          tickets:
            ticketsCol >= 0
              ? row[ticketsCol]
              : 0,
          revenue:
            revenueCol >= 0
              ? row[revenueCol]
              : 0,
        });
      }
    }
  }

  return {
    reportDate,
    rows: result,
  };
}