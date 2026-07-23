import { excelReader } from "./readers/excelReader";
import { csvReader } from "./readers/csvReader";
import { pdfReader } from "./readers/pdfReader";
import { imageReader } from "./readers/imageReader";
import { textReader } from "./readers/textReader";

import { layoutAnalyzer } from "./analyzer/layoutAnalyzer";
import { rowNormalizer } from "./normalizer/rowNormalizer";

import { matchCinema } from "./matcher/cinemaMatcher";
import { matchMovie } from "./matcher/movieMatcher";

function extension(file) {
  return file.name.split(".").pop().toLowerCase();
}

async function read(file) {
  const ext = extension(file);

  switch (ext) {
    case "xlsx":
    case "xls":
      return await excelReader(file);

    case "csv":
      return await csvReader(file);

    case "pdf":
      return await pdfReader(file);

    case "png":
    case "jpg":
    case "jpeg":
      return await imageReader(file);

    case "txt":
      return await textReader(file);

    default:
      throw new Error("Unsupported file");
  }
}

export async function importEngine(file) {
  // 1️⃣ Read
  const document = await read(file);

  // 2️⃣ Analyze Layout
  const sections = layoutAnalyzer(document);

  // 3️⃣ Normalize Rows
  const rows = rowNormalizer(sections);

  // 4️⃣ Match Movies & Cinemas
  const result = [];

  for (const row of rows) {
    const cinema = await matchCinema(row.cinema);
    const movie = await matchMovie(row.movie);

    result.push({
      ...row,

      cinemaId: cinema?.id || null,
      cinemaName: cinema?.name || row.cinema,
      matchedCinema: !!cinema,

      movieId: movie?.id || null,
      movieName: movie?.title || row.movie,
      matchedMovie: !!movie,
    });
  }

  return result;
}