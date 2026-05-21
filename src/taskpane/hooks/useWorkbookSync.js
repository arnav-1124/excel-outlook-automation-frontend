import { useEffect, useRef, useState } from "react";

import { getWorkbookTables } from "../services/tableService";
import { getTableHeaders } from "../services/headerService";
import { getActiveRowIndex, getMappedRowData } from "../services/rowService";
import { suggestMappingsFromHeaders } from "../services/autoMappingService";
import { saveMappings, loadMappings } from "../services/settingsService";

import { getActivityTime } from "../utils/dateUtils";
import { areArraysEqual, cleanMappingsForHeaders } from "../utils/mappingUtils";
import { getRowDataSnapshot, mergeFreshRowDataSafely } from "../utils/rowDataUtils";

function useWorkbookSync({
  tables,
  selectedTable,
  setTables,
  setSelectedTable,

  headers,
  setHeaders,

  mappings,
  loadSavedMappings,

  rowIndex,
  rowData,
  setRowIndex,
  setRowData,

  bodyTemplate,

  showBanner,
  showToast,
  addActivity,
}) {
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastSyncText, setLastSyncText] = useState("");

  const isAutoSyncingRef = useRef(false);
  const initialRowSyncDoneRef = useRef(false);

  async function loadTables() {
    try {
      setIsLoadingTables(true);

      const foundTables = await getWorkbookTables();

      setTables(foundTables);

      if (foundTables.length > 0) {
        setSelectedTable(foundTables[0]);
        showBanner("success", `${foundTables.length} table(s) loaded successfully.`);
        addActivity("success", `${foundTables.length} table(s) loaded from workbook.`);
      } else {
        showBanner("warning", "No Excel tables found. Please create/select a table first.");
      }
    } catch (error) {
      console.error("Load tables error:", error);
      showBanner("error", "Could not load Excel tables. Please check the workbook and try again.");
    } finally {
      setIsLoadingTables(false);
    }
  }

  async function loadHeaders(tableName) {
    try {
      const foundHeaders = await getTableHeaders(tableName);

      console.log("Found headers:", foundHeaders);

      setHeaders(foundHeaders);

      if (foundHeaders.length === 0) {
        showBanner("warning", "Selected table has no headers.");
        return;
      }

      const suggestedMappings = suggestMappingsFromHeaders(foundHeaders, mappings);

      // Safer: build final mappings once instead of calling store repeatedly.
      const finalSuggestedMappings = {
        ...mappings,
      };

      Object.entries(suggestedMappings).forEach(([key, value]) => {
        if (value && !mappings[key]) {
          finalSuggestedMappings[key] = value;
        }
      });

      loadSavedMappings(finalSuggestedMappings);
      saveMappings(finalSuggestedMappings);

      showBanner("success", "Headers loaded and obvious columns auto-mapped.");
      addActivity("success", `Headers loaded for table: ${tableName}.`);
    } catch (error) {
      console.error("Load headers error:", error);
      showBanner("error", "Could not load table headers.");
    }
  }

  async function syncWorkbookChanges({ manual = false } = {}) {
    if (!selectedTable) return;

    if (isAutoSyncingRef.current) return;

    try {
      isAutoSyncingRef.current = true;

      const latestHeaders = await getTableHeaders(selectedTable);

      const headersChanged = !areArraysEqual(headers, latestHeaders);

      let finalMappings = mappings;

      if (headersChanged) {
        setHeaders(latestHeaders);

        const { cleanedMappings, removedMappings } = cleanMappingsForHeaders(
          mappings,
          latestHeaders
        );

        finalMappings = suggestMappingsFromHeaders(latestHeaders, cleanedMappings);

        loadSavedMappings(finalMappings);
        saveMappings(finalMappings);

        const removedText =
          removedMappings.length > 0
            ? ` Removed invalid mappings: ${removedMappings
                .map((item) => item.mappedHeader)
                .join(", ")}.`
            : "";

        showToast(
          "warning",
          "Workbook structure refreshed",
          `Headers and mapping dropdowns were updated.${removedText}`
        );

        addActivity(
          "warning",
          `Table structure changed. Headers and mappings refreshed.${removedText}`
        );
      }

      const latestActiveRowIndex = await getActiveRowIndex();

      if (latestActiveRowIndex !== null) {
        const activeRowChanged = latestActiveRowIndex !== rowIndex;

        if (activeRowChanged) {
          setRowIndex(latestActiveRowIndex);
        }

        const freshRowData = await getMappedRowData(
          selectedTable,
          latestActiveRowIndex,
          finalMappings
        );

        const safeFreshRowData = mergeFreshRowDataSafely(freshRowData, rowData);

        const currentSnapshot = getRowDataSnapshot(rowData);
        const freshSnapshot = getRowDataSnapshot(safeFreshRowData);

        if (currentSnapshot !== freshSnapshot || activeRowChanged) {
          setRowData(safeFreshRowData);

          if (activeRowChanged) {
            addActivity(
              "success",
              `Selected row changed to row ${latestActiveRowIndex + 1}. Preview refreshed.`
            );
          } else if (!headersChanged && manual) {
            addActivity("success", "Selected row preview refreshed.");
          }
        }
      }

      if (manual) {
        showToast("success", "Workbook synced", "Latest headers and row data were refreshed.");
        addActivity("success", "Manual workbook sync completed.");
      }

      setLastSyncText(getActivityTime());
    } catch (error) {
      console.error("Auto-sync failed:", error);

      if (manual) {
        showBanner("error", "Could not sync workbook changes.");
      }
    } finally {
      isAutoSyncingRef.current = false;
    }
  }

  // Initial load
  useEffect(() => {
    loadTables();

    const saved = loadMappings();
    loadSavedMappings(saved);
  }, []);

  // Load headers when table changes
  useEffect(() => {
    if (selectedTable) {
      initialRowSyncDoneRef.current = false;
      loadHeaders(selectedTable);
    }
  }, [selectedTable]);

  // Auto-save mappings
  useEffect(() => {
    saveMappings(mappings);
  }, [mappings]);

  // One-time quick sync when table + required setup are ready
  useEffect(() => {
    if (!selectedTable) return;
    if (headers.length === 0) return;

    const hasRecipientMapping = Boolean(mappings.recipientEmail);
    const hasBodySource = Boolean(mappings.body || bodyTemplate.trim());

    if (!hasRecipientMapping || !hasBodySource) return;
    if (initialRowSyncDoneRef.current) return;

    const timerId = setTimeout(() => {
      syncWorkbookChanges({ manual: false });
      initialRowSyncDoneRef.current = true;
    }, 400);

    return () => {
      clearTimeout(timerId);
    };
  }, [selectedTable, headers.length, mappings.recipientEmail, mappings.body, bodyTemplate]);

  // Full auto-sync workbook changes every 2 minutes
  useEffect(() => {
    if (!selectedTable || !autoSyncEnabled) return;

    const intervalId = setInterval(() => {
      syncWorkbookChanges();
    }, 120000);

    return () => {
      clearInterval(intervalId);
    };
  }, [selectedTable, autoSyncEnabled, headers, mappings, rowIndex, rowData]);

  return {
    isLoadingTables,
    autoSyncEnabled,
    setAutoSyncEnabled,
    lastSyncText,
    loadTables,
    loadHeaders,
    syncWorkbookChanges,
  };
}

export default useWorkbookSync;
