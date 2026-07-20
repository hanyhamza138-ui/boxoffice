import * as XLSX from "xlsx";

export async function parseExcel(file) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const result = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });

    for (const r of rows) {
      const movie =
        r["Movie"] ||
        r["Movie Name"] ||
        r["Film"] ||
        r["Title"] ||
        r["الفيلم"] ||
        "";

      if (
        !movie ||
        movie === "الاجمالي" ||
        movie === "الإجمالي"
      )
        continue;

      result.push({
        cinema:
          r["Cinema"] ||
          r["Cinema Name"] ||
          r["Site"] ||
          r["السينما"] ||
          "",

        movie,

        version:
          r["Version"] ||
          r["Format"] ||
          r["النسخة"] ||
          "",

        tickets: Number(
          r["Tickets"] ||
          r["Audience"] ||
          r["Admissions"] ||
          r["التذاكر"] ||
          0
        ),

        revenue: Number(
          String(
            r["Revenue"] ||
            r["Gross"] ||
            r["Box Office"] ||
            r["الصافي"] ||
            0
          ).replace(/,/g, "")
        ),
      });
    }
  }

  console.log(result);

  return result;
}