function percent(value, total) {
  if (!total) return 0;

  return Math.round(
    (value / total) * 100
  );
}

export function calculateConfidence({
  rows,
}) {

  let movie = 0;
  let cinema = 0;
  let version = 0;
  let revenue = 0;
  let tickets = 0;

  for (const row of rows) {

    if (row.matchedMovie)
      movie++;

    if (row.matchedCinema)
      cinema++;

    if (row.matchedVersion)
      version++;

    if (
      Number(row.revenue) > 0
    )
      revenue++;

    if (
      Number(row.tickets) > 0
    )
      tickets++;

  }

  const total =
    rows.length || 1;

  const result = {

    movie:
      percent(movie, total),

    cinema:
      percent(cinema, total),

    version:
      percent(version, total),

    revenue:
      percent(revenue, total),

    tickets:
      percent(tickets, total),

  };

  result.overall =
    Math.round(

      (

        result.movie +

        result.cinema +

        result.version +

        result.revenue +

        result.tickets

      ) / 5

    );

  return result;

}