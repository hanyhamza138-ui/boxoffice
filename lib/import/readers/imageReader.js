import { ocrReader } from "./ocrReader";

export async function imageReader(file) {
  const ocr = await ocrReader(file);

  const lines = ocr.text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    type: "image",

    text: ocr.text,

    confidence: ocr.confidence,

    pages: [
      {
        page: 1,
        text: ocr.text,
      },
    ],

    sheets: [
      {
        name: "IMAGE",

        rows: lines.map((line) => [line]),
      },
    ],
  };
}