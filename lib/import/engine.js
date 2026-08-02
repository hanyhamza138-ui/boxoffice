import { excelReader } from "./readers/excelReader";
import { csvReader } from "./readers/csvReader";
import { pdfReader } from "./readers/pdfReader";
import { imageReader } from "./readers/imageReader";
import { textReader } from "./readers/textReader";

import { smartParser, normalizeImportRows } from "./smartParser";

import { analyzeDocument } from "./ai/importAI";
import { calculateConfidence } from "./ai/confidenceEngine";

import { validateRows } from "./validator/validator";

import { matchMovie } from "./matcher/movieMatcher";
import { matchCinema } from "./matcher/cinemaMatcher";
import { matchVersion } from "./matcher/versionMatcher";

/* =========================================================
   File Extension
========================================================= */

function extension(file) {
  return file.name
    .split(".")
    .pop()
    .toLowerCase();
}

/* =========================================================
   Readers
========================================================= */

async function read(file) {

  switch (extension(file)) {

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
    case "webp":
      return await imageReader(file);

    case "txt":
      return await textReader(file);

    default:
      throw new Error(
        "Unsupported file type."
      );

  }

}

/* =========================================================
   Import Engine
========================================================= */

export async function importEngine(file) {

  //----------------------------------
  // Read File
  //----------------------------------

  const document =
    await read(file);

  //----------------------------------
  // AI Analyze
  //----------------------------------

  const ai =
    analyzeDocument(document);

  console.log(
    "AI SCORE",
    ai
  );

  //----------------------------------
  // Smart Parser
  //----------------------------------

  const parsed =
    smartParser(document);

  //----------------------------------
  // Validate
  //----------------------------------

  const rows =
    normalizeImportRows(
      validateRows(
        parsed.rows || []
      )
    );

  //----------------------------------
  // Matching
  //----------------------------------

  const result = [];

  for (const row of rows) {

    let movie = null;
    let cinema = null;
    let version = null;

    try {

      movie =
        await matchMovie(
          row.movie
        );

    } catch (e) {

      console.error(
        "Movie Match Error",
        e
      );

    }

    try {

      cinema =
        await matchCinema(
          row.cinema
        );

    } catch (e) {

      console.error(
        "Cinema Match Error",
        e
      );

    }

    try {

      version =
        await matchVersion(
          row.version
        );

    } catch (e) {

      console.error(
        "Version Match Error",
        e
      );

    }

    result.push({

      ...row,

      movieId:
        movie?.item?.id ??
        null,

      movieName:
        movie?.item?.title ??
        row.movie,

      matchedMovie:
        !!movie,

      movieScore:
        movie?.score ?? 0,

      movieMethod:
        movie?.method ?? "",

      cinemaId:
        cinema?.item?.id ??
        null,

      cinemaName:
        cinema?.item?.name ??
        row.cinema,

      matchedCinema:
        !!cinema,

      cinemaScore:
        cinema?.score ?? 0,

      cinemaMethod:
        cinema?.method ?? "",

      versionId:
        version?.item?.id ??
        null,

      versionName:
        version?.item?.name ??
        row.version,

      matchedVersion:
        row.version
          ? !!version
          : true,

      versionScore:
        version?.score ?? 100,

      versionMethod:
        version?.method ?? "",

    });

  }

  //----------------------------------
  // Confidence
  //----------------------------------

  const confidence =
    calculateConfidence({

      rows: result,

    });

  //----------------------------------
  // Return
  //----------------------------------

  return {

    reportDate:
      parsed.reportDate || "",

    ai,

    confidence,

    totalRows:
      result.length,

    matchedRows:
      result.filter(

        r =>
          r.matchedMovie &&
          r.matchedCinema

      ).length,

    rows: result,

  };

}