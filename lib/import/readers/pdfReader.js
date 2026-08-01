import pdf from "pdf-parse";

export async function pdfReader(file) {
  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  const data = await pdf(buffer);

  const rows = data.text
    .split(/\r?\n/)
    .map((line) =>
      line
        .split(/\s{2,}/)
        .map((cell) => cell.trim())
    )
    .filter((row) => row.length);

  return {
    type: "pdf",

    sheets: [
      {
        sheetName: "PDF",
        rows,
      },
    ],
  };
}