function clean(value) {
  return String(value ?? "").trim();
}

function number(value) {
  if (value === null || value === undefined) return 0;

  const n = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  return Number(n) || 0;
}

function findIndex(header, keywords) {
  const headers = header.map((h) =>
    String(h).toLowerCase().trim()
  );

  for (const key of keywords) {
    const index = headers.findIndex((h) =>
      h.includes(key.toLowerCase())
    );

    if (index !== -1) return index;
  }

  return -1;
}

export function rowNormalizer(sections) {
  const output = [];

  for (const section of sections) {
    if (!section.header) continue;

    const movieCol = findIndex(section.header, [
      "الفيلم",
      "movie",
      "film",
      "title",
    ]);

    const ticketsCol = findIndex(section.header, [
      "التذاكر",
      "tickets",
      "audience",
      "attendance",
    ]);

    const revenueCol = findIndex(section.header, [
      "الإيراد",
      "الايراد",
      "الصافي",
      "revenue",
      "gross",
      "net",
      "boxoffice",
    ]);

    for (const row of section.rows) {
      if (!row[movieCol]) continue;

      output.push({
        cinema: section.cinema,
        movie: clean(row[movieCol]),
        tickets: number(row[ticketsCol]),
        revenue: number(row[revenueCol]),
      });
    }
  }

  return output;
}