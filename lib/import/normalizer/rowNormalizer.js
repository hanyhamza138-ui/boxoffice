function clean(value) {
  return String(value ?? "").trim();
}

function findColumn(header, keywords) {
  for (let i = 0; i < header.length; i++) {
    const text = clean(header[i]).toLowerCase();

    for (const key of keywords) {
      if (text.includes(key.toLowerCase())) {
        return i;
      }
    }
  }

  return -1;
}

export function rowNormalizer(sections) {

  const result = [];

  for (const section of sections) {

    const movieCol = findColumn(section.header, [
      "الفيلم",
      "movie",
      "film",
      "title",
    ]);

    const ticketsCol = findColumn(section.header, [
      "التذاكر",
      "tickets",
      "audience",
    ]);

    const revenueCol = findColumn(section.header, [
      "الصافي",
      "الايراد",
      "الإيراد",
      "revenue",
      "gross",
      "net",
    ]);

    for (const row of section.rows) {

      const movie = clean(row[movieCol]);

      if (!movie) continue;

      result.push({

        cinema: section.cinema,

        movie,

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

  return result;

}