import { useState } from "react";

import { getActiveRowIndex, getMappedRowData } from "../services/rowService";

function useActiveRow({
  selectedTable,
  mappings,
  bodyTemplate,
  setRowIndex,
  setRowData,
  showBanner,
  addActivity,
  autoLoadTemplateFromRow,
}) {
  const [isReadingRow, setIsReadingRow] = useState(false);

  async function detectActiveRow() {
    try {
      if (!selectedTable) {
        showBanner("error", "Please select an Excel table first.");
        return;
      }

      const hasRecipientMapping = Boolean(mappings.recipientEmail);
      const hasBodySource = Boolean(mappings.body || bodyTemplate.trim());

      if (!hasRecipientMapping) {
        showBanner("error", "Please map Recipient Email before reading the selected row.");
        return;
      }

      if (!hasBodySource) {
        showBanner(
          "error",
          "Please map Body column or enter a Body Template before reading the selected row."
        );
        return;
      }

      setIsReadingRow(true);

      const index = await getActiveRowIndex();

      setRowIndex(index);

      if (index !== null && selectedTable) {
        const data = await getMappedRowData(selectedTable, index, mappings);

        console.log("Fetched row data:", data);

        setRowData(data);

        autoLoadTemplateFromRow(data);

        showBanner("success", "Selected row loaded successfully.");
        addActivity("success", `Selected row ${index + 1} detected and preview loaded.`);
      } else {
        showBanner("warning", "Could not detect selected row. Please click inside the table row.");
      }
    } catch (error) {
      console.error("Detect active row error:", error);
      showBanner("error", "Could not read selected row. Please select a cell inside the table.");
    } finally {
      setIsReadingRow(false);
    }
  }

  return {
    isReadingRow,
    detectActiveRow,
  };
}

export default useActiveRow;
