export function normalizeTemplateName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function renderDisplayValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value);
}