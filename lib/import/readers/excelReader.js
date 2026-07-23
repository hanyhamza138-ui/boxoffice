import * as XLSX from "xlsx";

export async function excelReader(file) {
  if (!file) {
    throw new Error("No file selected");
  }

  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: false,
    cellFormula: false,
    cellHTML: false,
    cellNF: false,
    cellText: true,
  });

  const sheets = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      blankrows: false,
      defval: "",
    });

    sheets.push({
      sheetName,
      rows,
    });
  }

  return {
    type: "excel",
    sheets,
  };
}