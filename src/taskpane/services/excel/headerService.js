export async function getTableHeaders(tableName) {
  try {
    return await Excel.run(async (context) => {
      const table = context.workbook.tables.getItem(tableName);

      const headerRange = table.getHeaderRowRange();

      headerRange.load("values");

      await context.sync();

      console.log("Headers fetched:", headerRange.values);

      return headerRange.values[0];
    });
  } catch (error) {
    console.error("Failed to read headers:", error);

    return [];
  }
}
