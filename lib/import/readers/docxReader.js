import mammoth from "mammoth";

export async function docxReader(file) {
  const buffer = await file.arrayBuffer();

  const result = await mammoth.extractRawText({
    arrayBuffer: buffer,
  });

  return {
    type: "docx",
    text: result.value,
    sheets: [],
  };
}