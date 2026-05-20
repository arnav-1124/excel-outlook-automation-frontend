export function areArraysEqual(firstArray = [], secondArray = []) {
  if (firstArray.length !== secondArray.length) return false;

  return firstArray.every((item, index) => item === secondArray[index]);
}

export function cleanMappingsForHeaders(currentMappings, latestHeaders) {
  const cleanedMappings = { ...currentMappings };
  const removedMappings = [];

  Object.entries(cleanedMappings).forEach(([key, mappedHeader]) => {
    if (!mappedHeader) return;

    if (!latestHeaders.includes(mappedHeader)) {
      cleanedMappings[key] = "";
      removedMappings.push({
        key,
        mappedHeader,
      });
    }
  });

  return {
    cleanedMappings,
    removedMappings,
  };
}

export function getMappingFieldLabel(mappingFields, fieldKey) {
  const field = mappingFields.find((item) => item.key === fieldKey);

  return field?.label || fieldKey;
}