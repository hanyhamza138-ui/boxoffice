import { excelReader } from "./readers/excelReader";
import { csvReader } from "./readers/csvReader";
import { pdfReader } from "./readers/pdfReader";
import { imageReader } from "./readers/imageReader";
import { textReader } from "./readers/textReader";
import { docxReader } from "./readers/docxReader";
import { jsonReader } from "./readers/jsonReader";
import { xmlReader } from "./readers/xmlReader";
import {
  smartParser,
  normalizeImportRows,
} from "./smartParser";
import { runImportPipeline } from "./ai/importPipeline";

import { analyzeDocument } from "./ai/importAI";
import { calculateConfidence } from "./ai/confidenceEngine";

import { validateRows } from "./validator/validator";

import { matchMovie } from "./matcher/movieMatcher";
import { matchCinema } from "./matcher/cinemaMatcher";
import { matchVersion } from "./matcher/versionMatcher";

/* =====================================================
   File Extension
===================================================== */

function extension(file) {
  return file.name
    .split(".")
    .pop()
    .toLowerCase();
}

/* =====================================================
   Readers
===================================================== */

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
    case "docx":
  return await docxReader(file);

case "json":
  return await jsonReader(file);

case "xml":
  return await xmlReader(file);
    default:
      throw new Error(
        "Unsupported file type."
      );

  }

}

/* =====================================================
   Import Engine
===================================================== */

export async function importEngine(file) {

  //----------------------------------------
  // Read File
  //----------------------------------------

  const rawDocument =
await read(file);

const {

document,

classification,

} =

runImportPipeline(
rawDocument
);


  //----------------------------------------
  // AI Analyze
  //----------------------------------------

  const ai =
    analyzeDocument(
      document
    );

console.log(
  "AI SCORE",
  ai
);
  console.log(
    "AI SCORE",
    ai
  );

  //----------------------------------------
  // Parse
  //----------------------------------------

  const parsed =
    smartParser(
      document
    );

  //----------------------------------------
  // Validate
  //----------------------------------------

  const rows =
    normalizeImportRows(

      validateRows(

        parsed.rows || []

      )

    );

  //----------------------------------------
  // Matching
  //----------------------------------------

  const result = [];

  for (const row of rows) {

    const item = {

      ...row,

      matchedMovie: false,

      matchedCinema: false,

      matchedVersion: false,

    };

    //------------------------------------
    // Movie
    //------------------------------------

    try {

      const movie =
        await matchMovie(
          row.movie
        );

      if (movie) {

        item.movieId =
          movie.item.id;

        item.movieName =
          movie.item.title;

        item.movieScore =
          movie.score;

        item.movieMethod =
          movie.method;

        item.matchedMovie =
          true;

      }

    } catch (err) {

      console.error(
        "Movie Match Error",
        err
      );

    }

    //------------------------------------
    // Cinema
    //------------------------------------

    try {

      const cinema =
        await matchCinema(
          row.cinema
        );

      if (cinema) {

        item.cinemaId =
          cinema.item.id;

        item.cinemaName =
          cinema.item.name;

        item.cinemaScore =
          cinema.score;

        item.cinemaMethod =
          cinema.method;

        item.matchedCinema =
          true;

      }

    } catch (err) {

      console.error(
        "Cinema Match Error",
        err
      );

    }

    //------------------------------------
    // Version
    //------------------------------------

    try {

      const version =
        await matchVersion(
          row.version
        );

      if (version) {

        item.versionId =
          version.item.id;

        item.versionName =
          version.item.name;

        item.versionScore =
          version.score;

        item.versionMethod =
          version.method;

        item.matchedVersion =
          true;

      } else {

        item.matchedVersion =
          !row.version;

      }

    } catch (err) {

      console.error(
        "Version Match Error",
        err
      );

    }

    result.push(item);

  }

  //----------------------------------------
  // Confidence
  //----------------------------------------

  const confidence =
    calculateConfidence({

      rows: result,

    });

  //----------------------------------------
  // Return
  //----------------------------------------

  return {

  ai,

  classification,

  reportDate:
    parsed.reportDate || "",

  confidence,

  totalRows:
    result.length,

  matchedRows:
    result.filter(
      row =>
        row.matchedMovie &&
        row.matchedCinema
    ).length,

  unmatchedRows:
    result.filter(
      row =>
        !row.matchedMovie ||
        !row.matchedCinema
    ).length,

  rows: result,

};

}