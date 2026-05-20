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

      const allFields = {};

      headers.forEach((header, index) => {
        allFields[header] = rowValues[index];
      });

      const result = {};

      Object.entries(mappings).forEach(([key, mappedHeader]) => {
        if (!mappedHeader) return;

        const colIndex = headers.indexOf(mappedHeader);

        if (colIndex !== -1) {
          result[key] = rowValues[colIndex];
        }
      });

      // Universal template support.
      // This keeps existing rowData.recipientEmail / rowData.subject / rowData.body working,
      // while also exposing every Excel column for placeholders.
      result.__allFields = allFields;

      console.log("All row fields:", allFields);
      console.log("Mapped row data:", result);

      return result;
    });
  } catch (error) {
    console.error("Failed to read row data:", error);

    return {};
  }
}

export async function updateMappedRowValues(
  tableName,
  worksheetRowIndex,
  mappings,
  valuesToUpdate
) {
  try {
    return await Excel.run(async (context) => {
      const table = context.workbook.tables.getItem(tableName);

      const dataRange = table.getDataBodyRange();

      dataRange.load(["values", "rowIndex"]);
      table.columns.load("items/name");

      await context.sync();

      const headers = table.columns.items.map((col) => col.name);
      const tableStartRow = dataRange.rowIndex;
      const relativeRowIndex = worksheetRowIndex - tableStartRow;

      console.log("Updating worksheet row:", worksheetRowIndex);
      console.log("Table starts at:", tableStartRow);
      console.log("Relative row:", relativeRowIndex);
      console.log("Values to update:", valuesToUpdate);

      if (relativeRowIndex < 0 || relativeRowIndex >= dataRange.values.length) {
        console.error("Selected row is outside table body. Cannot update row.");
        return false;
      }

      Object.entries(valuesToUpdate).forEach(([mappingKey, newValue]) => {
        const mappedHeader = mappings[mappingKey];

        if (!mappedHeader) {
          console.warn(`No mapped column found for: ${mappingKey}`);
          return;
        }

        const colIndex = headers.indexOf(mappedHeader);

        if (colIndex === -1) {
          console.warn(`Mapped header not found in table: ${mappedHeader}`);
          return;
        }

        const cell = dataRange.getCell(relativeRowIndex, colIndex);
        cell.values = [[newValue]];
      });

      await context.sync();

      console.log("Mapped row values updated successfully.");

      return true;
    });
  } catch (error) {
    console.error("Failed to update mapped row values:", error);

    return false;
  }
}
