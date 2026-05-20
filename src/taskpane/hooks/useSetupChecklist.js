import { useMemo } from "react";

function useSetupChecklist({
  selectedTable,
  headers,
  mappings,
  rowData,
  subjectTemplate,
  bodyTemplate,
}) {
  const setupChecklist = useMemo(() => {
    return [
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
  }, [selectedTable, headers, mappings, rowData, subjectTemplate, bodyTemplate]);

  const setupCompletedCount = useMemo(() => {
    return setupChecklist.filter((item) => item.completed).length;
  }, [setupChecklist]);

  const setupTotalCount = setupChecklist.length;

  const setupProgressPercent = useMemo(() => {
    if (!setupTotalCount) return 0;

    return Math.round((setupCompletedCount / setupTotalCount) * 100);
  }, [setupCompletedCount, setupTotalCount]);

  const isDraftReady = useMemo(() => {
    return Boolean(
      selectedTable &&
      mappings.recipientEmail &&
      rowData?.recipientEmail &&
      (rowData?.body || bodyTemplate.trim())
    );
  }, [selectedTable, mappings, rowData, bodyTemplate]);

  const setupStatusText = isDraftReady
    ? "Ready to create draft"
    : `${setupCompletedCount}/${setupTotalCount} complete`;

  return {
    setupChecklist,
    setupCompletedCount,
    setupTotalCount,
    setupProgressPercent,
    isDraftReady,
    setupStatusText,
  };
}

export default useSetupChecklist;
