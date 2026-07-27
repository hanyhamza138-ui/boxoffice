import { excelReader } from "./readers/excelReader";
import { csvReader } from "./readers/csvReader";
import { pdfReader } from "./readers/pdfReader";
import { imageReader } from "./readers/imageReader";
import { textReader } from "./readers/textReader";

import { detectProfile } from "./profiles/profileDetector";

import { matchCinema } from "./matcher/cinemaMatcher";
import { matchMovie } from "./matcher/movieMatcher";

import { validateRows } from "./validator/validator";

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
  //----------------------------------
  // Read Document
  //----------------------------------

  const document = await read(file);

  //----------------------------------
  // Detect Profile
  //----------------------------------

  const profile = detectProfile(document);

  if (!profile) {
    throw new Error("Unknown report format.");
  }

  //----------------------------------
  // Parse Report
  //----------------------------------

  const rows = profile.parse(document);

  //----------------------------------
  // Validate
  //----------------------------------

  const cleanRows = validateRows(rows);

  //----------------------------------
  // Match Movies & Cinemas
  //----------------------------------

  const result = [];

  for (const row of cleanRows) {
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

  console.log("PROFILE =", profile.name);
  console.log("ROWS =", rows.length);
  console.log(result);

  return result;
}