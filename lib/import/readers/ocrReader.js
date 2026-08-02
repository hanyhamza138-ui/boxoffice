import Tesseract from "tesseract.js";

export async function ocrReader(file) {
  const result = await Tesseract.recognize(
    file,
    "ara+eng",
    {
      logger(info) {
        if (info.status) {
          console.log(
            "OCR:",
            info.status,
            Math.round((info.progress || 0) * 100) + "%"
          );
        }
      },
    }
  );

  return {
    text: result.data.text || "",
    confidence: result.data.confidence || 0,
    words: result.data.words || [],
    lines: result.data.lines || [],
    paragraphs: result.data.paragraphs || [],
  };
}