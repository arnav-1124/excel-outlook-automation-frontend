import React, { useState } from "react";

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

import CreditsBadge from "./account/CreditsBadge";

// Hooks
import useNotifications from "../hooks/useNotifications";
import useActivityLog from "../hooks/useActivityLog";
import useWorkflowPreset from "../hooks/useWorkflowPreset";
import useSetupChecklist from "../hooks/useSetupChecklist";
import useTemplates from "../hooks/useTemplates";
import useEmailDraft from "../hooks/useEmailDraft";
import useActiveRow from "../hooks/useActiveRow";
import useWorkbookSync from "../hooks/useWorkbookSync";
import useAccount from "../hooks/useAccount";
import useUsageCredits from "../hooks/useUsageCredits";

// Constants
import { MAPPING_FIELDS } from "../constants/mappingFields";
import { WORKFLOW_PRESETS } from "../constants/workflowPresets";

// Utils
import { renderDisplayValue } from "../utils/textUtils";
import { getMappingFieldLabel } from "../utils/mappingUtils";

// Stores (state management)
import useTableStore from "../store/tableStore";
import useHeaderStore from "../store/headerStore";
import useMappingStore from "../store/mappingStore";
import useActiveRowStore from "../store/activeRowStore";

function App() {
  const { tables, selectedTable, setTables, setSelectedTable } = useTableStore();

  const { headers, setHeaders } = useHeaderStore();

  const { mappings, setMapping, loadSavedMappings } = useMappingStore();

  const { rowIndex, rowData, setRowIndex, setRowData } = useActiveRowStore();

  const { banner, toast, showBanner, showToast, clearBanner, clearToast } = useNotifications();

  const { activityLog, addActivity, clearActivityLog } = useActivityLog();

  const {
    user,
    isAuthenticated,
    isAccountLoading,
    login,
    register,
    logout,
    sendForgotPasswordOtp,
    resetPasswordWithOtp,
  } = useAccount({
    showToast,
    showBanner,
    addActivity,
  });

  const { usage, isUsageLoading, loadUsage, ensureCreditsAvailable, consumeAutomationCredit } =
    useUsageCredits({
      isAuthenticated,
      showToast,
      showBanner,
      addActivity,
    });

  const [showOnboarding, setShowOnboarding] = useState(true);
  const [selectedWorkflowPreset, setSelectedWorkflowPreset] = useState("followup");
  const [showOptionalMappings, setShowOptionalMappings] = useState(false);

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

  const { isReadingRow, detectActiveRow } = useActiveRow({
    selectedTable,
    mappings,
    bodyTemplate,
    setRowIndex,
    setRowData,
    showBanner,
    addActivity,
    autoLoadTemplateFromRow,
  });

  const { handleOpenOutlookWebDraft } = useEmailDraft({
    rowData,
    setRowData,
    selectedTable,
    rowIndex,
    mappings,
    showBanner,
    showToast,
    addActivity,
  });

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

  const {
    isLoadingTables,
    autoSyncEnabled,
    setAutoSyncEnabled,
    lastSyncText,
    loadTables,
    syncWorkbookChanges,
  } = useWorkbookSync({
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
  });

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

      <CreditsBadge
        usage={usage}
        isAuthenticated={isAuthenticated}
        user={user}
        isLoading={isUsageLoading}
        onRefresh={loadUsage}
      />

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
          onOpenOutlookDraft={async () => {
            const hasCredits = await ensureCreditsAvailable({ creditsRequired: 1 });

            if (!hasCredits) return;

            await handleOpenOutlookWebDraft();

            await consumeAutomationCredit({
              metadata: {
                selectedTable,
                rowIndex,
                recipientEmail: rowData?.recipientEmail || null,
              },
            });
          }}
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
