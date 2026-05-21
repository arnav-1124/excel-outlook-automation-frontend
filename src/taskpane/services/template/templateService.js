export function replaceTemplatePlaceholders(templateText, allFields = {}) {
  if (!templateText) return "";

  return String(templateText).replace(/\{\{(.*?)\}\}/g, (match, rawKey) => {
    const key = String(rawKey || "").trim();

    if (!key) return match;

    const exactValue = allFields[key];

    if (exactValue !== undefined && exactValue !== null && exactValue !== "") {
      return String(exactValue);
    }

    const matchedFieldName = Object.keys(allFields).find(
      (fieldName) => normalizePlaceholderKey(fieldName) === normalizePlaceholderKey(key)
    );

    if (!matchedFieldName) {
      return match;
    }

    const matchedValue = allFields[matchedFieldName];

    if (matchedValue === undefined || matchedValue === null || matchedValue === "") {
      return "";
    }

    return String(matchedValue);
  });
}

export function findMissingPlaceholders(templateText, allFields = {}) {
  if (!templateText) return [];

  const placeholders = [...String(templateText).matchAll(/\{\{(.*?)\}\}/g)].map((match) =>
    String(match[1] || "").trim()
  );

  const uniquePlaceholders = [...new Set(placeholders)].filter(Boolean);

  return uniquePlaceholders.filter((placeholder) => {
    const hasExactMatch = Object.prototype.hasOwnProperty.call(allFields, placeholder);

    if (hasExactMatch) return false;

    const hasNormalizedMatch = Object.keys(allFields).some(
      (fieldName) => normalizePlaceholderKey(fieldName) === normalizePlaceholderKey(placeholder)
    );

    return !hasNormalizedMatch;
  });
}

function normalizePlaceholderKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}
