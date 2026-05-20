import React, { useEffect, useRef, useState } from "react";

// Common Components
import Toast from "./common/Toast";
import Banner from "./common/Banner";

// Section Components
import ActivityLogSection from "./sections/ActivityLogSection";
import DebugSection from "./sections/DebugSection";
import TableSelectorSection from "./sections/TableSelectorSection";
import HeaderPreviewSection from "./sections/HeaderPreviewSection";
import SetupChecklistSection from "./sections/SetupChecklistSection";
import WorkflowPresetSection from "./sections/WorkflowPresetSection";
import MappingSection from "./sections/MappingSection";
import SelectedRowSection from "./sections/SelectedRowSection";
import PlaceholderSection from "./sections/PlaceholderSection";
import EmailPreviewSection from "./sections/EmailPreviewSection";
import ActionSection from "./sections/ActionSection";
import TemplateEditorSection from "./sections/TemplateEditorSection";
import OnboardingScreen from "./layout/OnboardingScreen";
import AppHeader from "./layout/AppHeader";
import AppFooter from "./layout/AppFooter";

// Hooks
import useNotifications from "../hooks/useNotifications";
import useActivityLog from "../hooks/useActivityLog";
import useWorkflowPreset from "../hooks/useWorkflowPreset";
import useSetupChecklist from "../hooks/useSetupChecklist";
import useTemplates from "../hooks/useTemplates";

// Constants
import { MAPPING_FIELDS } from "../constants/mappingFields";
import { WORKFLOW_PRESETS } from "../constants/workflowPresets";

// Utils
import { getActivityTime, getCurrentDateTimeText } from "../utils/dateUtils";
import { renderDisplayValue } from "../utils/textUtils";
import { getRowDataSnapshot, mergeFreshRowDataSafely } from "../utils/rowDataUtils";
import {
  areArraysEqual,
  cleanMappingsForHeaders,
  getMappingFieldLabel,
} from "../utils/mappingUtils";

// Stores (state management)
import useTableStore from "../store/tableStore";
import useHeaderStore from "../store/headerStore";
import useMappingStore from "../store/mappingStore";
import useActiveRowStore from "../store/activeRowStore";

// Services (external dependencies)
import { getActiveRowIndex, getMappedRowData, updateMappedRowValues } from "../services/rowService";
import { getWorkbookTables } from "../services/tableService";
import { openOutlookWebDraft } from "../services/emailService";
import { suggestMappingsFromHeaders } from "../services/autoMappingService";
import { getTableHeaders } from "../services/headerService";
import { saveMappings, loadMappings } from "../services/settingsService";

function App() {
  const { tables, selectedTable, setTables, setSelectedTable } = useTableStore();

  const { headers, setHeaders } = useHeaderStore();

  const { mappings, setMapping, loadSavedMappings } = useMappingStore();

  const { rowIndex, rowData, setRowIndex, setRowData } = useActiveRowStore();

  const { banner, toast, showBanner, showToast, clearBanner, clearToast } = useNotifications();

  const { activityLog, addActivity, clearActivityLog } = useActivityLog();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedWorkflowPreset, setSelectedWorkflowPreset] = useState("followup");
  const [showOptionalMappings, setShowOptionalMappings] = useState(false);

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [lastSyncText, setLastSyncText] = useState("");
  const isAutoSyncingRef = useRef(false);
  const initialRowSyncDoneRef = useRef(false);

  const {
    subjectTemplate,
    setSubjectTemplate,
    bodyTemplate,
    setBodyTemplate,
    templateMissingFields,

    templateName,
    setTemplateName,
    namedTemplates,
    selectedNamedTemplateId,

    handleSaveNamedTemplate,
    handleLoadNamedTemplate,
    handleDeleteNamedTemplate,
    handleGenerateFromTemplate,
    handleWriteGeneratedEmailToRow,
    handleClearTemplate,
    autoLoadTemplateFromRow,
  } = useTemplates({
    rowData,
    setRowData,
    selectedTable,
    rowIndex,
    mappings,
    showBanner,
    showToast,
    addActivity,
  });

  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isReadingRow, setIsReadingRow] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const mappedCount = MAPPING_FIELDS.filter((field) => mappings?.[field.key]).length;

  const requiredMissingCount = MAPPING_FIELDS.filter(
    (field) => field.required && !mappings?.[field.key]
  ).length;

  const {
    setupChecklist,
    setupCompletedCount,
    setupTotalCount,
    setupProgressPercent,
    isDraftReady,
    setupStatusText,
  } = useSetupChecklist({
    selectedTable,
    headers,
    mappings,
    rowData,
    subjectTemplate,
    bodyTemplate,
  });

  const {
    activeWorkflowPreset,
    presetCompletedFields,
    presetMissingFields,
    presetProgressPercent,
    recommendedMappingFields,
    optionalMappingFields,
  } = useWorkflowPreset({
    workflowPresets: WORKFLOW_PRESETS,
    selectedWorkflowPreset,
    mappings,
    mappingFields: MAPPING_FIELDS,
  });

  // Initial load
  useEffect(() => {
    setShowOnboarding(true);

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

  // Auto-save mappings
  useEffect(() => {
    saveMappings(mappings);
  }, [mappings]);

  // Auto-sync in every 3 minutes
  useEffect(() => {
    if (!selectedTable || !autoSyncEnabled) return;

    const intervalId = setInterval(
      () => {
        syncWorkbookChanges();
      },
      2 * 60 * 1000
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [selectedTable, autoSyncEnabled, headers, mappings, rowIndex, rowData]);

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

      Object.entries(suggestedMappings).forEach(([key, value]) => {
        if (value && !mappings[key]) {
          setMapping(key, value);
        }
      });

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

  // Detect Active Row
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

  function validateEmailDraftData() {
    console.log("rowData:", rowData);

    if (!rowData) {
      showBanner("error", "Please detect the selected row first.");
      return false;
    }

    if (!rowData?.recipientEmail) {
      showBanner("error", "Recipient email is missing in the selected row.");
      return false;
    }

    if (!rowData?.body) {
      showBanner("error", "Email body is missing in the selected row.");
      return false;
    }

    return true;
  }

  function handleCompleteOnboarding() {
    setShowOnboarding(false);

    showToast(
      "success",
      "Welcome aboard",
      "You can now connect your Excel table and start creating email drafts."
    );

    addActivity("success", "Onboarding completed for this session.");
  }

  function handleShowOnboardingAgain() {
    setShowOnboarding(true);
  }

  async function handleOpenOutlookWebDraft() {
    try {
      if (!validateEmailDraftData()) return;

      openOutlookWebDraft(rowData);

      const nowText = getCurrentDateTimeText();

      const valuesToUpdate = {
        emailStatus: "Draft Created",
        draftCreatedDate: rowData?.draftCreatedDate || nowText,
        draftModifiedDate: nowText,
      };

      const updated = await updateMappedRowValues(
        selectedTable,
        rowIndex,
        mappings,
        valuesToUpdate
      );

      if (updated) {
        const refreshedData = await getMappedRowData(selectedTable, rowIndex, mappings);
        setRowData(refreshedData);

        showBanner("success", "Outlook draft opened and Excel row updated.");

        addActivity("success", "Outlook Web draft opened.");
        addActivity("success", "Email Status updated to Draft Created.");
        addActivity("success", "Draft Created Date and Draft Modified Date updated.");

        showToast(
          "success",
          "Excel row updated",
          "Email Status, Draft Created Date and Draft Modified Date were updated."
        );
      } else {
        showBanner(
          "warning",
          "Draft opened, but Excel row was not updated. Please check status/date mappings."
        );
      }
    } catch (error) {
      console.error("Outlook Web draft creation error:", error);
      showBanner("error", "Could not open Outlook draft or update Excel row.");
    }
  }

  function handleCopyPlaceholder(fieldName) {
    navigator.clipboard?.writeText(`{{${fieldName}}}`);

    showToast("success", "Placeholder copied", `{{${fieldName}}} copied.`);
    addActivity("success", `Placeholder copied: {{${fieldName}}}`);
  }

  function renderValue(value) {
    const displayValue = renderDisplayValue(value);

    if (!displayValue) {
      return <span className="value-empty">Not available</span>;
    }

    return displayValue;
  }

  return (
    <div className="app">
      <OnboardingScreen showOnboarding={showOnboarding} onComplete={handleCompleteOnboarding} />

      <AppHeader onRefreshTables={loadTables} />

      <Toast toast={toast} onClose={clearToast} />

      <Banner banner={banner} onClose={clearBanner} />

      <main className="app-main">
        {/* Setup Checklist */}
        <SetupChecklistSection
          setupChecklist={setupChecklist}
          setupCompletedCount={setupCompletedCount}
          setupTotalCount={setupTotalCount}
          setupProgressPercent={setupProgressPercent}
          setupStatusText={setupStatusText}
          isDraftReady={isDraftReady}
        />

        {/* Workflow Preset */}
        <WorkflowPresetSection
          workflowPresets={WORKFLOW_PRESETS}
          selectedWorkflowPreset={selectedWorkflowPreset}
          onChangeWorkflowPreset={setSelectedWorkflowPreset}
          activeWorkflowPreset={activeWorkflowPreset}
          presetCompletedFields={presetCompletedFields}
          presetMissingFields={presetMissingFields}
          presetProgressPercent={presetProgressPercent}
          getFieldLabel={(fieldKey) => getMappingFieldLabel(MAPPING_FIELDS, fieldKey)}
        />

        {/* Table Selection */}
        <TableSelectorSection
          tables={tables}
          selectedTable={selectedTable}
          onSelectTable={setSelectedTable}
          onRefreshTables={loadTables}
          isLoadingTables={isLoadingTables}
          autoSyncEnabled={autoSyncEnabled}
          onToggleAutoSync={setAutoSyncEnabled}
          lastSyncText={lastSyncText}
        />

        {/* Headers Preview */}
        <HeaderPreviewSection
          headers={headers}
          showHeaders={showHeaders}
          onToggleShowHeaders={() => setShowHeaders((value) => !value)}
        />

        {/* Mapping Section */}
        <MappingSection
          mappings={mappings}
          headers={headers}
          mappedCount={mappedCount}
          totalMappingCount={MAPPING_FIELDS.length}
          requiredMissingCount={requiredMissingCount}
          recommendedMappingFields={recommendedMappingFields}
          optionalMappingFields={optionalMappingFields}
          activeWorkflowPreset={activeWorkflowPreset}
          presetCompletedFields={presetCompletedFields}
          showOptionalMappings={showOptionalMappings}
          onToggleOptionalMappings={() => setShowOptionalMappings((value) => !value)}
          onSetMapping={setMapping}
        />

        {/* Active Row Detection */}
        <SelectedRowSection
          rowIndex={rowIndex}
          rowData={rowData}
          isReadingRow={isReadingRow}
          onDetectActiveRow={detectActiveRow}
          renderValue={renderValue}
        />

        {/* Available Placeholders */}
        <PlaceholderSection rowData={rowData} onCopyPlaceholder={handleCopyPlaceholder} />

        {/* Template Editor */}
        <TemplateEditorSection
          rowData={rowData}
          selectedNamedTemplateId={selectedNamedTemplateId}
          namedTemplates={namedTemplates}
          templateName={templateName}
          subjectTemplate={subjectTemplate}
          bodyTemplate={bodyTemplate}
          templateMissingFields={templateMissingFields}
          onLoadNamedTemplate={handleLoadNamedTemplate}
          onChangeTemplateName={setTemplateName}
          onChangeSubjectTemplate={setSubjectTemplate}
          onChangeBodyTemplate={setBodyTemplate}
          onSaveNamedTemplate={handleSaveNamedTemplate}
          onDeleteNamedTemplate={handleDeleteNamedTemplate}
          onGenerateFromTemplate={handleGenerateFromTemplate}
          onWriteGeneratedEmailToRow={handleWriteGeneratedEmailToRow}
          onClearTemplate={handleClearTemplate}
        />

        {/* Email Preview */}
        <EmailPreviewSection rowData={rowData} renderValue={renderValue} />

        {/* Actions */}
        <ActionSection
          onSyncWorkbook={() => syncWorkbookChanges({ manual: true })}
          onRefreshTables={loadTables}
          onReadRow={detectActiveRow}
          onOpenOutlookDraft={handleOpenOutlookWebDraft}
          isDraftReady={isDraftReady}
        />

        {/* Activity Log */}
        <ActivityLogSection activityLog={activityLog} onClear={clearActivityLog} />

        {/* Debug JSON */}
        <DebugSection
          rowData={rowData}
          showRawJson={showRawJson}
          onToggle={() => setShowRawJson((value) => !value)}
        />
      </main>

      <AppFooter onShowIntro={handleShowOnboardingAgain} />
    </div>
  );
}

export default App;
