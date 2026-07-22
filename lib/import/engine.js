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

  const result = [];

  for (const row of rows) {
    if (!row) continue;

    const cinemaText = String(
      row.cinema ??
      row.cinemaName ??
      ""
    ).trim();

    const movieText = String(
      row.movie ??
      row.movieName ??
      ""
    ).trim();

    if (!cinemaText && !movieText) {
      continue;
    }

    const cinema = await matchCinema(cinemaText);
    const movie = await matchMovie(movieText);

    result.push({
      ...row,

      cinema: cinemaText,
      movie: movieText,

      cinemaId: cinema?.id ?? null,
      cinemaName: cinema?.name ?? cinemaText,

      movieId: movie?.id ?? null,
      movieName: movie?.title ?? movieText,

      matchedCinema: Boolean(cinema),
      matchedMovie: Boolean(movie),

      tickets: Number(
        row.tickets ??
        row.audience ??
        0
      ),

      revenue: Number(
        row.revenue ??
        row.gross ??
        row.boxoffice ??
        0
      ),
    });
  }

  await validateData(result);

  console.log("===== IMPORT RESULT =====");
  console.table(result);

  return result;
}