import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function pdfReader(file) {
  const buffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: buffer,
  }).promise;

  const pages = [];

  let fullText = "";

  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);

    const content =
      await page.getTextContent();

    const text = content.items
      .map((item) => item.str)
      .join(" ");

    pages.push({
      page: pageNo,
      text,
    });

    fullText += text + "\n";
  }

  return {
    type: "pdf",
    text: fullText,
    pages,
    sheets: [
      {
        name: "PDF",
        rows: fullText
          .split(/\r?\n/)
          .filter((line) => line.trim())
          .map((line) => [line]),
      },
    ],
  };
}