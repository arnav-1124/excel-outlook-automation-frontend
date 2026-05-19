export async function getWorkbookTables() {
    try {
        return Excel.run(async (context) => {
            const workbook = context.workbook;
            const tables = await workbook.tables;
            tables.load("items/name");
            await context.sync();

            // Get the names of the tables
            console.log(tables.items);
            
            return tables.items.map((table) => table.name);

        })
    } catch (error) {
        console.log(
            "Failed to load tables: ",
            error
        );
        return [];
    }
}