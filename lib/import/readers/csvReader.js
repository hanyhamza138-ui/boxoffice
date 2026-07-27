import Papa from "papaparse";

export async function csvReader(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: true,

      complete(results) {
        resolve({
          type: "csv",
          sheets: [
            {
              sheetName: "CSV",
              rows: results.data,
            },
          ],
        });
      },

      error(err) {
        reject(err);
      },
    });
  });
}