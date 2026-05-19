export async function getActiveRowIndex() {
  try {
    return await Excel.run(async (context) => {
      const range = context.workbook.getSelectedRange();

      range.load("rowIndex");

      await context.sync();

      console.log("Selected row:", range.rowIndex);

      return range.rowIndex;
    });
  } catch (error) {
    console.error("Failed to get row:", error);

    return null;
  }
}

export async function getMappedRowData(tableName, worksheetRowIndex, mappings) {
  try {
    return await Excel.run(async (context) => {
      const table = context.workbook.tables.getItem(tableName);

      const dataRange = table.getDataBodyRange();

      // Load both values and where table starts
      dataRange.load(["values", "rowIndex"]);

      table.columns.load("items/name");

      await context.sync();

      const headers = table.columns.items.map((col) => col.name);

      const tableValues = dataRange.values;

      const tableStartRow = dataRange.rowIndex;

      const relativeRowIndex = worksheetRowIndex - tableStartRow;

      console.log("Worksheet row:", worksheetRowIndex);
      console.log("Table starts at:", tableStartRow);
      console.log("Relative row:", relativeRowIndex);
      console.log("Headers:", headers);
      console.log("Mappings:", mappings);

      // Safety check
      if (relativeRowIndex < 0 || relativeRowIndex >= tableValues.length) {
        console.error("Selected row is outside table body");
        return {};
      }

      const rowValues = tableValues[relativeRowIndex];

      console.log("Row values:", rowValues);

      const result = {};

      Object.entries(mappings).forEach(([key, mappedHeader]) => {
        if (!mappedHeader) return;

        const colIndex = headers.indexOf(mappedHeader);

        if (colIndex !== -1) {
          result[key] = rowValues[colIndex];
        }
      });

      console.log("Mapped row data:", result);

      return result;
    });
  } catch (error) {
    console.error("Failed to read row data:", error);

    return {};
  }
}
