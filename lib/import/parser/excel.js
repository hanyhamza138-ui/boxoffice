import * as XLSX from "xlsx";

export async function parseExcel(file) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const result = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    let currentCinema = "";

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row || row.length === 0) continue;

      // إزالة الخلايا الفارغة
      const cells = row
        .map((x) => String(x).trim())
        .filter(Boolean);

      if (!cells.length) continue;

      // تجاهل الإجمالي
      if (
        cells[0] === "الاجمالي" ||
        cells[0] === "الإجمالي"
      ) {
        continue;
      }

      // بداية جدول جديد
      if (cells[0] === "الفيلم") {
        continue;
      }

      // اسم السينما (سطر واحد فقط)
      if (
        cells.length === 1 &&
        cells[0] !== "الفيلم"
      ) {
        currentCinema = cells[0];
        continue;
      }

      // صف فيلم
      if (cells.length >= 3) {
        result.push({
          cinema: currentCinema,
          movie: cells[0],
          tickets: cells[1],
          revenue: cells[2],
        });
      }
    }
  }

  console.log("PARSED EXCEL =", result);

  return result;
}