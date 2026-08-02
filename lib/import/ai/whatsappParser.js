/* =========================================================
   WHATSAPP PARSER
========================================================= */

function clean(value) {

  return String(value ?? "")
    .replace(/\r/g, "")
    .trim();

}

function isNumber(text) {

  return /^[\d,.]+$/.test(
    clean(text)
  );

}

function detectVersion(text) {

  text =
    text.toUpperCase();

  if (text.includes("IMAX"))
    return "IMAX";

  if (text.includes("4DX"))
    return "4DX";

  if (text.includes("MX4D"))
    return "MX4D";

  if (text.includes("SCREENX"))
    return "SCREENX";

  if (text.includes("VIP"))
    return "VIP";

  if (text.includes("3D"))
    return "3D";

  return "2D";

}

export function parseWhatsApp(text) {

  const lines =

    text

      .split(/\n/)

      .map(clean)

      .filter(Boolean);

  const rows = [];

  let cinema = "";

  //-----------------------------------
  // أول سطر يعتبر السينما
  //-----------------------------------

  if (lines.length) {

    cinema = lines[0];

  }

  //-----------------------------------

  for (

    let i = 1;

    i < lines.length;

    i++

  ) {

    const movie =
      lines[i];

    if (!movie)
      continue;

    const tickets =
      lines[i + 1];

    const revenue =
      lines[i + 2];

    if (

      !isNumber(tickets) ||

      !isNumber(revenue)

    ) {

      continue;

    }

    rows.push({

      cinema,

      movie:
        movie
          .replace(
            /\b(2D|3D|IMAX|VIP|4DX|MX4D|SCREENX)\b/ig,
            ""
          )
          .trim(),

      version:
        detectVersion(movie),

      tickets,

      revenue,

    });

    i += 2;

  }

  return rows;

}