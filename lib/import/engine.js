import { excelReader } from "./readers/excelReader";
import { csvReader } from "./readers/csvReader";
import { pdfReader } from "./readers/pdfReader";
import { imageReader } from "./readers/imageReader";
import { textReader } from "./readers/textReader";

import { detectTemplate } from "./detectTemplate";
import { parseByTemplate } from "./parseByTemplate";

import { validateRows } from "./validator/validator";

import { matchMovie } from "./matcher/movieMatcher";
import { matchCinema } from "./matcher/cinemaMatcher";
import { matchVersion } from "./matcher/versionMatcher";

function extension(file) {
  return file.name.split(".").pop().toLowerCase();
}

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
      return await imageReader(file);

    case "txt":
      return await textReader(file);

    default:
      throw new Error("Unsupported file.");
  }
}

function detectVersion(row) {
  const text = [
    row.version,
    row.format,
    row.type,
    row.screenType,
    row.movie,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  if (text.includes("SCREENX")) return "SCREENX";
  if (text.includes("MX4D")) return "MX4D";
  if (text.includes("4DX")) return "4DX";
  if (text.includes("IMAX")) return "IMAX";
  if (text.includes("VIP")) return "VIP";
  if (text.includes("DOLBY")) return "Dolby";
  if (text.includes("ATMOS")) return "Dolby";
  if (text.includes("3D")) return "3D";
  if (text.includes("2D")) return "2D";

  return "";
}

export async function importEngine(file) {
  //--------------------------------------------------
  // Read File
  //--------------------------------------------------

  const document = await read(file);

  //--------------------------------------------------
  // Detect Template
  //--------------------------------------------------

  const template = detectTemplate(document);

  if (!template) {
    throw new Error(
      "Unsupported report layout."
    );
  }

  //--------------------------------------------------
  // Parse Template
  //--------------------------------------------------

  const parsed = parseByTemplate(
    document,
    template
  );

  //--------------------------------------------------
  // Validate
  //--------------------------------------------------

  const rows = validateRows(parsed.rows);

  //--------------------------------------------------
  // Match
  //--------------------------------------------------

  const result = [];

  for (const row of rows) {
    //---------------- Movie ----------------

    const movie =
      await matchMovie(row.movie);

    //---------------- Cinema ----------------

    const cinema =
      await matchCinema(row.cinema);

    //---------------- Version ----------------

    const versionText =
      detectVersion(row);

    const version =
      versionText
        ? await matchVersion(
            versionText
          )
        : null;

    result.push({
      ...row,

      //---------------- Movie ----------------

      movieId:
        movie?.item?.id ??
        movie?.id ??
        null,

      movieName:
        movie?.item?.title ??
        movie?.title ??
        row.movie,

      matchedMovie:
        !!movie,

      //---------------- Cinema ----------------

      cinemaId:
        cinema?.item?.id ??
        cinema?.id ??
        null,

      cinemaName:
        cinema?.item?.name ??
        cinema?.name ??
        row.cinema,

      matchedCinema:
        !!cinema,

      //---------------- Version ----------------

      version:
        versionText,

      versionId:
        version?.item?.id ??
        version?.id ??
        null,

      versionName:
        version?.item?.name ??
        version?.name ??
        versionText,

      matchedVersion:
        versionText === ""
          ? true
          : !!version,
    });
  }

  return {
    template:
      template.name,

    reportDate:
      parsed.reportDate,

    rows: result,
  };
}