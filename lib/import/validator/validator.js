function clean(value) {
  return String(value ?? "").trim();
}

function number(value) {
  if (value === null || value === undefined) return 0;

  const n = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  return Number(n) || 0;
}

function isTotal(text) {
  const value = clean(text).toLowerCase();

  return (
    value.includes("total") ||
    value.includes("grand total") ||
    value.includes("subtotal") ||
    value.includes("الاجمالي") ||
    value.includes("الإجمالي") ||
    value.includes("اجمالي")
  );
}

export function validateRows(rows = []) {
  const valid = [];

  for (const row of rows) {
    // Movie Required
    if (!clean(row.movie)) continue;

    // Ignore Totals
    if (isTotal(row.movie)) continue;

    const tickets = number(
      row.tickets ?? row.audience
    );

    const revenue = number(row.revenue);

    valid.push({
      ...row,
      tickets,
      audience: tickets,
      revenue,
    });
  }

  return valid;
}