import React, { useState, useEffect } from "react";

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
import AccountPanel from "./account/AccountPanel";
import SubscriptionPage from "./account/SubscriptionPage";

import FollowUpDashboard from "./followups/FollowUpDashboard";
import FollowUpCreatePanel from "./followups/FollowUpCreatePanel";

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
import useSubscriptionPreview from "../hooks/useSubscriptionPreview";
import useFollowUps from "../hooks/useFollowUps";
import useNotificationPreferences from "../hooks/useNotificationPreferences";
import useCloudTemplates from "../hooks/useCloudTemplates";

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

// Admin
import AdminPage from "./admin/AdminPage";
import useAdminCoupons from "../hooks/useAdminCoupons";

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

  // Admin
  const isAdmin = user?.role === "ADMIN";

  const {
    coupons: adminCoupons,
    couponForm,
    setCouponForm,
    editingCouponId,
    isAdminLoading,
    adminError,
    resetCouponForm,
    startEditingCoupon,
    saveCoupon,
    changeCouponStatus,
  } = useAdminCoupons({
    isAdmin,
    showToast,
    showBanner,
  });

  useEffect(() => {
    if (appView === "admin" && !isAdmin) {
      setAppView("main");
      resetCouponForm();
    }
  }, [appView, isAdmin, resetCouponForm]);

  const { usage, isUsageLoading, loadUsage, ensureCreditsAvailable, consumeAutomationCredit } =
    useUsageCredits({
      isAuthenticated,
      showToast,
      showBanner,
      addActivity,
    });

  const {
    followUps,
    followUpSummary,
    activeFollowUpBucket,
    isFollowUpsLoading,
    followUpsError,
    loadFollowUps,
    createFollowUpItem,
    markFollowUpResolved,
    snoozeFollowUpItem,
    reopenFollowUpItem,
    cancelFollowUpItem,
    reminderHistory,
    isReminderHistoryLoading,
    loadReminderHistory,
  } = useFollowUps({
    isAuthenticated,
    showToast,
    showBanner,
    addActivity,
  });

  const {
    plans,
    selectedPlanCode,
    setSelectedPlanCode,
    couponCode,
    setCouponCode,
    clearCoupon,
    preview,
    isPlansLoading,
    isPreviewLoading,
    generatePreview,
    previewError,
  } = useSubscriptionPreview({
    showBanner,
    showToast,
  });

  const [showOnboarding, setShowOnboarding] = useState(true);
  const [selectedWorkflowPreset, setSelectedWorkflowPreset] = useState("followup");
  const [showOptionalMappings, setShowOptionalMappings] = useState(false);

  const [appView, setAppView] = useState("main");

  const [accountOpenRequestKey, setAccountOpenRequestKey] = useState(0);
  const [isFollowUpCreateOpen, setIsFollowUpCreateOpen] = useState(false);

  const {
    cloudTemplates,
    selectedCloudTemplateId,
    setSelectedCloudTemplateId,
    isCloudTemplatesLoading,
    cloudTemplatesError,
    loadCloudTemplates,
  } = useCloudTemplates({
    isAuthenticated,
    showToast,
    showBanner,
    addActivity,
  });

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
    handleLoadCloudTemplate,
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
    cloudTemplates,
    selectedCloudTemplateId,
    setSelectedCloudTemplateId,
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

  const {
    notificationPreference,
    isNotificationPreferenceLoading,
    notificationPreferenceError,
    saveNotificationPreference,
  } = useNotificationPreferences({
    isAuthenticated,
    showToast,
    showBanner,
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

  function openAccountForFollowUps() {
    navigateToView("main");
    setAccountOpenRequestKey(Date.now());

    requestAnimationFrame(() => {
      setTimeout(() => {
        const accountPanel = document.querySelector(".account-panel");

        if (accountPanel) {
          accountPanel.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 80);
    });

    showBanner("info", "Sign in or create an account to save follow-ups and receive reminders.");
  }

  function handleOpenFollowUpCreate() {
    if (!isAuthenticated) {
      openAccountForFollowUps();
      return;
    }

    if (!rowData) {
      showBanner("warning", "Select an Excel row first before creating a follow-up.");
      return;
    }

    setIsFollowUpCreateOpen(true);
    navigateToView("followups");

    requestAnimationFrame(() => {
      setTimeout(() => {
        const createPanel = document.querySelector(".followup-create-card");

        if (createPanel) {
          createPanel.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 160);
    });
  }

  function renderValue(value) {
    const displayValue = renderDisplayValue(value);

    if (!displayValue) {
      return <span className="value-empty">Not available</span>;
    }

    return displayValue;
  }

  function navigateToView(view) {
    setAppView(view);

    requestAnimationFrame(() => {
      const mainElement = document.querySelector(".app-main");

      if (mainElement) {
        mainElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    });
  }

  function handleLogout() {
    logout();
    setAppView("main");
    resetCouponForm();
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

      <AccountPanel
        user={user}
        isAuthenticated={isAuthenticated}
        isAccountLoading={isAccountLoading}
        usage={usage}
        onLogin={login}
        onRegister={register}
        onLogout={handleLogout}
        onForgotPassword={sendForgotPasswordOtp}
        onResetPassword={resetPasswordWithOtp}
        onRefreshUsage={loadUsage}
        onOpenUpgrade={() => navigateToView("subscription")}
        onOpenAdmin={() => navigateToView("admin")}
        openRequestKey={accountOpenRequestKey}
        notificationPreference={notificationPreference}
        isNotificationPreferenceLoading={isNotificationPreferenceLoading}
        notificationPreferenceError={notificationPreferenceError}
        onSaveNotificationPreference={saveNotificationPreference}
      />

      <button
        className="followup-open-btn"
        type="button"
        onClick={() => navigateToView("followups")}
      >
        <span>Follow-up Center</span>
        <small>Due, overdue & reminder tracking</small>
      </button>

      <Toast toast={toast} onClose={clearToast} />

      <Banner banner={banner} onClose={clearBanner} />

      <main className="app-main">
        {appView === "subscription" ? (
          <SubscriptionPage
            onBack={() => navigateToView("main")}
            plans={plans}
            selectedPlanCode={selectedPlanCode}
            onSelectPlan={setSelectedPlanCode}
            couponCode={couponCode}
            onChangeCoupon={setCouponCode}
            onApplyCoupon={() => generatePreview()}
            onClearCoupon={() => {
              clearCoupon();
              generatePreview({
                planCode: selectedPlanCode,
                coupon: "",
              });
            }}
            preview={preview}
            previewError={previewError}
            isPlansLoading={isPlansLoading}
            isPreviewLoading={isPreviewLoading}
          />
        ) : appView === "admin" ? (
          <AdminPage
            onBack={() => navigateToView("main")}
            plans={plans}
            coupons={adminCoupons}
            couponForm={couponForm}
            setCouponForm={setCouponForm}
            editingCouponId={editingCouponId}
            isLoading={isAdminLoading}
            error={adminError}
            onSaveCoupon={saveCoupon}
            onResetCouponForm={resetCouponForm}
            onEditCoupon={startEditingCoupon}
            onChangeCouponStatus={changeCouponStatus}
          />
        ) : appView === "followups" ? (
          <FollowUpDashboard
            onBack={() => navigateToView("main")}
            isAuthenticated={isAuthenticated}
            onOpenAccount={openAccountForFollowUps}
            followUps={followUps}
            summary={followUpSummary}
            activeBucket={activeFollowUpBucket}
            isLoading={isFollowUpsLoading}
            error={followUpsError}
            onChangeBucket={(bucket) => loadFollowUps({ bucket })}
            onResolve={markFollowUpResolved}
            onSnooze={snoozeFollowUpItem}
            onReopen={reopenFollowUpItem}
            onCancel={cancelFollowUpItem}
            isCreateOpen={isFollowUpCreateOpen}
            onCloseCreate={() => setIsFollowUpCreateOpen(false)}
            rowData={rowData}
            mappings={mappings}
            selectedTable={selectedTable}
            rowIndex={rowIndex}
            onCreateFollowUp={createFollowUpItem}
            onOpenCreate={handleOpenFollowUpCreate}
            reminderHistory={reminderHistory}
            isReminderHistoryLoading={isReminderHistoryLoading}
            onRefreshReminderHistory={loadReminderHistory}
          />
        ) : (
          <>
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
              mappings={mappings}
              isReadingRow={isReadingRow}
              onDetectActiveRow={detectActiveRow}
              renderValue={renderValue}
            />

            {/* Template Editor */}
            <TemplateEditorSection
              rowData={rowData}
              selectedNamedTemplateId={selectedNamedTemplateId}
              namedTemplates={namedTemplates}
              selectedCloudTemplateId={selectedCloudTemplateId}
              cloudTemplates={cloudTemplates}
              isCloudTemplatesLoading={isCloudTemplatesLoading}
              cloudTemplatesError={cloudTemplatesError}
              templateName={templateName}
              subjectTemplate={subjectTemplate}
              bodyTemplate={bodyTemplate}
              templateMissingFields={templateMissingFields}
              onLoadNamedTemplate={handleLoadNamedTemplate}
              onLoadCloudTemplate={handleLoadCloudTemplate}
              onRefreshCloudTemplates={loadCloudTemplates}
              onChangeTemplateName={setTemplateName}
              onChangeSubjectTemplate={setSubjectTemplate}
              onChangeBodyTemplate={setBodyTemplate}
              onSaveNamedTemplate={handleSaveNamedTemplate}
              onDeleteNamedTemplate={handleDeleteNamedTemplate}
              onGenerateFromTemplate={handleGenerateFromTemplate}
              onWriteGeneratedEmailToRow={handleWriteGeneratedEmailToRow}
              onClearTemplate={handleClearTemplate}
            />

            {/* Available Placeholders */}
            <PlaceholderSection rowData={rowData} onCopyPlaceholder={handleCopyPlaceholder} />

            {/* Email Preview */}
            <EmailPreviewSection rowData={rowData} renderValue={renderValue} />

            {/* Actions */}
            <ActionSection
              onSyncWorkbook={() => syncWorkbookChanges({ manual: true })}
              onRefreshTables={loadTables}
              onReadRow={detectActiveRow}
              onCreateFollowUp={handleOpenFollowUpCreate}
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

            {/* Setup Checklist */}
            <SetupChecklistSection
              setupChecklist={setupChecklist}
              setupCompletedCount={setupCompletedCount}
              setupTotalCount={setupTotalCount}
              setupProgressPercent={setupProgressPercent}
              setupStatusText={setupStatusText}
              isDraftReady={isDraftReady}
            />

            {/* Headers Preview */}
            <HeaderPreviewSection
              headers={headers}
              showHeaders={showHeaders}
              onToggleShowHeaders={() => setShowHeaders((value) => !value)}
            />

            {/* Activity Log */}
            <ActivityLogSection activityLog={activityLog} onClear={clearActivityLog} />

            {/* Debug JSON */}
            <DebugSection
              rowData={rowData}
              showRawJson={showRawJson}
              onToggle={() => setShowRawJson((value) => !value)}
            />
          </>
        )}
      </main>

      <AppFooter onShowIntro={handleShowOnboardingAgain} />
    </div>
  );
}

export default App;
