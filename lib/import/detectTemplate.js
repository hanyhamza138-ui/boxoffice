import { templates } from "./templateEngine";

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function detectTemplate(document) {
  const sheet = document?.sheets?.[0];

  if (!sheet) return null;

  const content = sheet.rows
    .flat()
    .map(normalize)
    .join(" ");

  for (const template of templates) {
    const words = template.detect?.contains || [];

    const ok = words.every((word) =>
      content.includes(normalize(word))
    );

    if (ok) {
      return template;
    }
  }

  return null;
}