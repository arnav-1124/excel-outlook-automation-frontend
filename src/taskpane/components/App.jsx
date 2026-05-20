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

// Constants
import { MAPPING_FIELDS } from "../constants/mappingFields";
import { WORKFLOW_PRESETS } from "../constants/workflowPresets";

// Utils
import { getActivityTime, getCurrentDateTimeText } from "../utils/dateUtils";
import { normalizeTemplateName, renderDisplayValue } from "../utils/textUtils";
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
import { replaceTemplatePlaceholders, findMissingPlaceholders } from "../services/templateService";
import { getTableHeaders } from "../services/headerService";
import {
  saveMappings,
  loadMappings,
  saveTemplateSettings,
  loadTemplateSettings,
  saveNamedTemplates,
  loadNamedTemplates,
  saveOnboardingCompleted,
  loadOnboardingCompleted,
} from "../services/settingsService";

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

  const [subjectTemplate, setSubjectTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [templateMissingFields, setTemplateMissingFields] = useState([]);

  const [templateName, setTemplateName] = useState("");
  const [namedTemplates, setNamedTemplates] = useState([]);
  const [selectedNamedTemplateId, setSelectedNamedTemplateId] = useState("");

  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isReadingRow, setIsReadingRow] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const mappedCount = MAPPING_FIELDS.filter((field) => mappings?.[field.key]).length;

  const requiredMissingCount = MAPPING_FIELDS.filter(
    (field) => field.required && !mappings?.[field.key]
  ).length;

  const setupChecklist = [
    {
      key: "table",
      label: "Excel table selected",
      completed: Boolean(selectedTable),
      helpText: "Select the Excel table that contains your email workflow data.",
    },
    {
      key: "headers",
      label: "Headers loaded",
      completed: headers.length > 0,
      helpText: "Refresh tables or select a valid Excel table.",
    },
    {
      key: "recipientMapping",
      label: "Recipient Email mapped",
      completed: Boolean(mappings.recipientEmail),
      helpText: "Map the column that contains recipient email addresses.",
    },
    {
      key: "bodyMapping",
      label: "Email Body mapped or template available",
      completed: Boolean(mappings.body || bodyTemplate.trim()),
      helpText: "Map a Body column or enter a body template.",
    },
    {
      key: "rowDetected",
      label: "Selected row detected",
      completed: Boolean(rowData),
      helpText: "Click inside a table row and then click Detect Selected Row.",
    },
    {
      key: "recipientValue",
      label: "Selected row has recipient value",
      completed: Boolean(rowData?.recipientEmail),
      helpText:
        "The detected row should contain an email address in the mapped Recipient Email column.",
    },
    {
      key: "emailReady",
      label: "Subject/body ready",
      completed:
        Boolean(rowData?.subject || subjectTemplate.trim()) &&
        Boolean(rowData?.body || bodyTemplate.trim()),
      helpText: "Use mapped subject/body columns or generate preview from a template.",
    },
    {
      key: "tracking",
      label: "Tracking columns mapped",
      completed: Boolean(
        mappings.emailStatus && mappings.draftCreatedDate && mappings.draftModifiedDate
      ),
      helpText:
        "Map Email Status, Draft Created Date and Draft Modified Date for automatic tracking.",
    },
  ];

  const setupCompletedCount = setupChecklist.filter((item) => item.completed).length;
  const setupTotalCount = setupChecklist.length;
  const setupProgressPercent = Math.round((setupCompletedCount / setupTotalCount) * 100);

  const isDraftReady = Boolean(
    selectedTable &&
    mappings.recipientEmail &&
    rowData?.recipientEmail &&
    (rowData?.body || bodyTemplate.trim())
  );

  const setupStatusText = isDraftReady
    ? "Ready to create draft"
    : `${setupCompletedCount}/${setupTotalCount} complete`;

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

    const savedTemplateSettings = loadTemplateSettings();

    setSubjectTemplate(savedTemplateSettings.subjectTemplate || "");
    setBodyTemplate(savedTemplateSettings.bodyTemplate || "");

    const savedNamedTemplates = loadNamedTemplates();
    setNamedTemplates(savedNamedTemplates);
  }, []);

  // Load headers when table changes
  useEffect(() => {
    if (selectedTable) {
      loadHeaders(selectedTable);
    }
  }, [selectedTable]);

  // Auto-save mappings
  useEffect(() => {
    saveMappings(mappings);
  }, [mappings]);

  useEffect(() => {
    saveTemplateSettings({
      subjectTemplate,
      bodyTemplate,
    });
  }, [subjectTemplate, bodyTemplate]);

  // Auto-sync in every 3 minutes
  useEffect(() => {
    if (!selectedTable || !autoSyncEnabled) return;

    const intervalId = setInterval(() => {
      syncWorkbookChanges();
    }, 1800);

    return () => {
      clearInterval(intervalId);
    };
  }, [selectedTable, autoSyncEnabled, headers, mappings, rowIndex, rowData]);

  function autoLoadTemplateFromRow(rowDataFromExcel) {
    const templateTypeValue = rowDataFromExcel?.templateType;

    if (!templateTypeValue) {
      return;
    }

    const matchedTemplate = findMatchingNamedTemplate(templateTypeValue);

    if (!matchedTemplate) {
      showBanner("warning", `No saved template found for Template Type: ${templateTypeValue}`);

      addActivity("warning", `No saved template matched Template Type: ${templateTypeValue}`);

      return;
    }

    setSelectedNamedTemplateId(matchedTemplate.id);
    setTemplateName(matchedTemplate.name);
    setSubjectTemplate(matchedTemplate.subjectTemplate || "");
    setBodyTemplate(matchedTemplate.bodyTemplate || "");
    setTemplateMissingFields([]);

    showToast("success", "Template matched", `${matchedTemplate.name} loaded from Template Type.`);

    addActivity("success", `Template auto-loaded from row: ${matchedTemplate.name}`);
  }

  function findMatchingNamedTemplate(templateTypeValue) {
    if (!templateTypeValue) return null;

    const normalizedTemplateType = normalizeTemplateName(templateTypeValue);

    return namedTemplates.find(
      (template) => normalizeTemplateName(template.name) === normalizedTemplateType
    );
  }

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

      if (requiredMissingCount > 0) {
        showBanner("error", "Please map Recipient Email and Body before reading the selected row.");
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

  function handleGenerateFromTemplate() {
    try {
      if (!rowData?.__allFields) {
        showBanner("error", "Please detect a selected row before generating from template.");
        return;
      }

      if (!subjectTemplate.trim() && !bodyTemplate.trim()) {
        showBanner("error", "Please enter a subject template or body template first.");
        return;
      }

      const allFields = {
        ...rowData.__allFields,
        Recipient_Email: rowData.recipientEmail || "",
        Recipient_Name: rowData.recipientName || "",
        Sender_Email: rowData.senderEmail || "",
        Sender_Name: rowData.senderName || "",
      };

      const combinedTemplateText = `${subjectTemplate}\n${bodyTemplate}`;
      const missingFields = findMissingPlaceholders(combinedTemplateText, allFields);

      setTemplateMissingFields(missingFields);

      if (missingFields.length > 0) {
        showBanner(
          "warning",
          `Some placeholders were not found: ${missingFields
            .map((field) => `{{${field}}}`)
            .join(", ")}`
        );
      }

      const generatedSubject = subjectTemplate.trim()
        ? replaceTemplatePlaceholders(subjectTemplate, allFields)
        : rowData.subject || "";

      const generatedBody = bodyTemplate.trim()
        ? replaceTemplatePlaceholders(bodyTemplate, allFields)
        : rowData.body || "";

      const generatedRowData = {
        ...rowData,
        subject: generatedSubject,
        body: generatedBody,
        __templateApplied: true,
      };

      setRowData(generatedRowData);

      showToast(
        "success",
        "Template applied",
        "Subject and body preview were generated from your template."
      );

      addActivity("success", "Template applied to selected row.");
    } catch (error) {
      console.error("Template generation error:", error);
      showBanner("error", "Could not generate email from template.");
    }
  }

  function handleSaveNamedTemplate() {
    const cleanName = templateName.trim();

    if (!cleanName) {
      showBanner("error", "Please enter a template name before saving.");
      return;
    }

    if (!subjectTemplate.trim() && !bodyTemplate.trim()) {
      showBanner("error", "Please enter a subject or body template before saving.");
      return;
    }

    const existingTemplate = namedTemplates.find(
      (template) => template.name.toLowerCase() === cleanName.toLowerCase()
    );

    let updatedTemplates;

    if (existingTemplate) {
      updatedTemplates = namedTemplates.map((template) =>
        template.id === existingTemplate.id
          ? {
              ...template,
              name: cleanName,
              subjectTemplate,
              bodyTemplate,
              updatedAt: new Date().toISOString(),
            }
          : template
      );

      setSelectedNamedTemplateId(existingTemplate.id);

      showToast("success", "Template updated", `${cleanName} was updated.`);
      addActivity("success", `Template updated: ${cleanName}`);
    } else {
      const newTemplate = {
        id: `tpl_${Date.now()}`,
        name: cleanName,
        subjectTemplate,
        bodyTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      updatedTemplates = [newTemplate, ...namedTemplates];

      setSelectedNamedTemplateId(newTemplate.id);

      showToast("success", "Template saved", `${cleanName} was saved.`);
      addActivity("success", `Template saved: ${cleanName}`);
    }

    setNamedTemplates(updatedTemplates);
    saveNamedTemplates(updatedTemplates);
  }

  function handleLoadNamedTemplate(templateId) {
    setSelectedNamedTemplateId(templateId);

    if (!templateId) return;

    const selectedTemplate = namedTemplates.find((template) => template.id === templateId);

    if (!selectedTemplate) {
      showBanner("error", "Selected template was not found.");
      return;
    }

    setTemplateName(selectedTemplate.name);
    setSubjectTemplate(selectedTemplate.subjectTemplate || "");
    setBodyTemplate(selectedTemplate.bodyTemplate || "");
    setTemplateMissingFields([]);

    showToast("success", "Template loaded", `${selectedTemplate.name} loaded into editor.`);
    addActivity("success", `Template loaded: ${selectedTemplate.name}`);
  }

  function handleDeleteNamedTemplate() {
    if (!selectedNamedTemplateId) {
      showBanner("error", "Please select a template to delete.");
      return;
    }

    const selectedTemplate = namedTemplates.find(
      (template) => template.id === selectedNamedTemplateId
    );

    const updatedTemplates = namedTemplates.filter(
      (template) => template.id !== selectedNamedTemplateId
    );

    setNamedTemplates(updatedTemplates);
    saveNamedTemplates(updatedTemplates);

    setSelectedNamedTemplateId("");
    setTemplateName("");
    setSubjectTemplate("");
    setBodyTemplate("");
    setTemplateMissingFields([]);

    showToast(
      "success",
      "Template deleted",
      selectedTemplate ? `${selectedTemplate.name} was deleted.` : "Template was deleted."
    );

    addActivity(
      "success",
      selectedTemplate ? `Template deleted: ${selectedTemplate.name}` : "Template deleted."
    );
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

  async function handleWriteGeneratedEmailToRow() {
    try {
      if (!rowData) {
        showBanner("error", "Please detect a selected row first.");
        return;
      }

      if (!rowData.__templateApplied) {
        showBanner("error", "Please generate preview from template before writing to Excel.");
        return;
      }

      if (!rowData.subject && !rowData.body) {
        showBanner("error", "Generated subject/body is empty.");
        return;
      }

      if (!mappings.subject && !mappings.body) {
        showBanner("error", "Please map Subject or Body column before writing generated email.");
        return;
      }

      const valuesToUpdate = {};

      if (mappings.subject) {
        valuesToUpdate.subject = rowData.subject || "";
      }

      if (mappings.body) {
        valuesToUpdate.body = rowData.body || "";
      }

      const updated = await updateMappedRowValues(
        selectedTable,
        rowIndex,
        mappings,
        valuesToUpdate
      );

      if (!updated) {
        showBanner("error", "Could not write generated email to Excel row.");
        return;
      }

      const refreshedData = await getMappedRowData(selectedTable, rowIndex, mappings);

      setRowData({
        ...refreshedData,
        subject: rowData.subject,
        body: rowData.body,
        __templateApplied: true,
      });

      showToast(
        "success",
        "Generated email saved",
        "Subject and Body were written back to the selected Excel row."
      );

      showBanner("success", "Generated email written back to Excel row.");

      addActivity("success", "Generated subject/body written back to Excel row.");
    } catch (error) {
      console.error("Write generated email to row error:", error);
      showBanner("error", "Could not write generated email to Excel.");
    }
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

  function handleClearTemplate() {
    setSelectedNamedTemplateId("");
    setTemplateName("");
    setSubjectTemplate("");
    setBodyTemplate("");
    setTemplateMissingFields([]);

    saveTemplateSettings({
      subjectTemplate: "",
      bodyTemplate: "",
    });

    showToast("success", "Template cleared", "Template editor has been reset.");
    addActivity("success", "Template editor cleared.");
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
