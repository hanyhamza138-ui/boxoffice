export async function validateData(rows = []) {
  const errors = [];

  rows.forEach((row, index) => {
    if (!row.movie) {
      errors.push({
        row: index + 1,
        field: "movie",
        message: "Movie is required",
      });
    }

    if (row.tickets < 0) {
      errors.push({
        row: index + 1,
        field: "tickets",
        message: "Tickets cannot be negative",
      });
    }

    if (row.revenue < 0) {
      errors.push({
        row: index + 1,
        field: "revenue",
        message: "Revenue cannot be negative",
      });
    }

    if (
      row.revenue === 0 &&
      row.tickets > 0
    ) {
      errors.push({
        row: index + 1,
        field: "revenue",
        message: "Revenue is missing",
      });
    }

    if (
      row.tickets === 0 &&
      row.revenue > 0
    ) {
      errors.push({
        row: index + 1,
        field: "tickets",
        message: "Tickets are missing",
      });
    }
  });

  if (errors.length) {
    throw {
      type: "IMPORT_VALIDATION",
      errors,
    };
  }

  return true;
}