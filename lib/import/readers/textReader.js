export async function textReader(file) {
  const text = await file.text();

  const rows = text
    .split(/\r?\n/)
    .map((line) => [line]);

  return {
    type: "text",

    sheets: [
      {
        sheetName: "TEXT",
        rows,
      },
    ],
  };
}