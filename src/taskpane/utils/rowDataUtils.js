export function getRowDataSnapshot(data) {
  if (!data) return "";

  return JSON.stringify({
    ...data,
    __templateApplied: undefined,
  });
}

export function mergeFreshRowDataSafely(freshRowData, currentRowData) {
  if (!currentRowData?.__templateApplied) {
    return freshRowData;
  }

  return {
    ...freshRowData,
    subject: currentRowData.subject,
    body: currentRowData.body,
    __templateApplied: true,
  };
}
