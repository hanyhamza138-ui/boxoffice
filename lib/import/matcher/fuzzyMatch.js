function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]/gu, "")
    .replace(/\s+/g, "");
}

function levenshtein(a, b) {
  a = normalize(a);
  b = normalize(b);

  const matrix = Array.from(
    { length: b.length + 1 },
    () => []
  );

  for (let i = 0; i <= b.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {

      const cost =
        a[j - 1] === b[i - 1]
          ? 0
          : 1;

      matrix[i][j] = Math.min(

        matrix[i - 1][j] + 1,

        matrix[i][j - 1] + 1,

        matrix[i - 1][j - 1] + cost

      );

    }
  }

  return matrix[b.length][a.length];
}

export function fuzzyMatch(
  input,
  list
) {

  if (!input)
    return null;

  let best = null;

  let bestScore = -1;

  for (const item of list) {

    const source =
      item.title ??
      item.name ??
      "";

    const distance =
      levenshtein(
        input,
        source
      );

    const max =
      Math.max(
        normalize(input).length,
        normalize(source).length
      );

    const score =
      (
        1 -
        distance / max
      ) * 100;

    if (
      score > bestScore
    ) {

      bestScore = score;

      best = item;

    }

  }

  if (
    bestScore < 70
  ) {

    return null;

  }

  return {

    item: best,

    score: Math.round(
      bestScore
    ),

  };

}