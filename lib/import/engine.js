import { parseExcel } from "./parser/excel";
import { parseCsv } from "./parser/csv";
import { parsePdf } from "./parser/pdf";
import { parseImage } from "./parser/image";
import { parseText } from "./parser/text";

import { normalizeData } from "./normalizer";
import { validateData } from "./validator";

import { movieMatcher } from "./matcher/movieMatcher";
import { versionMatcher } from "./matcher/versionMatcher";
import { cinemaMatcher } from "./matcher/cinemaMatcher";

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

  rows = normalizeData(rows);

  await validateData(rows);

  rows = await movieMatcher(rows);
  rows = await versionMatcher(rows);
  rows = await cinemaMatcher(rows);

  return rows;
}