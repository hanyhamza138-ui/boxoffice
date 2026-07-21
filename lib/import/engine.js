import { parseExcel } from "./parser/excel";
import { parseCsv } from "./parser/csv";
import { parsePdf } from "./parser/pdf";
import { parseImage } from "./parser/image";
import { parseText } from "./parser/text";

import { normalizeData } from "./normalizer";
import { validateData } from "./validator";

import { matchCinema } from "./matcher/cinemaMatcher";
import { matchMovie } from "./matcher/movieMatcher";

export async function importEngine(file) {
  if (!file) {
    throw new Error("No file selected");
  }

  const extension = file.name
    .split(".")
    .pop()
    .toLowerCase();

  let rows = [];

  switch (extension) {
    case "xlsx":
    case "xls":
      rows = await parseExcel(file);
      break;

    case "csv":
      rows = await parseCsv(file);
      break;

    case "pdf":
      rows = await parsePdf(file);
      break;

    case "png":
    case "jpg":
    case "jpeg":
      rows = await parseImage(file);
      break;

    case "txt":
      rows = await parseText(file);
      break;

    default:
      throw new Error("Unsupported file type");
  }

  rows = await normalizeData(rows);

  const matchedRows = [];

  for (const row of rows) {
    const cinema = await matchCinema(row.cinema);
    const movie = await matchMovie(row.movie);

    matchedRows.push({
      ...row,

      cinemaId: cinema?.id || null,
      cinemaName: cinema?.name || row.cinema,

      movieId: movie?.id || null,
      movieName: movie?.title || row.movie,

      matchedCinema: !!cinema,
      matchedMovie: !!movie,
    });
  }

  await validateData(matchedRows);

  return matchedRows;
}