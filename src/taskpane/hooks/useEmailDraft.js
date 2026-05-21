import { getCurrentDateTimeText } from "../utils/dateUtils";

import { openOutlookWebDraft } from "../services/emailService";
import { getMappedRowData, updateMappedRowValues } from "../services/rowService";

function useEmailDraft({
  rowData,
  setRowData,
  selectedTable,
  rowIndex,
  mappings,
  showBanner,
  showToast,
  addActivity,
}) {
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

  return {
    validateEmailDraftData,
    handleOpenOutlookWebDraft,
  };
}

export default useEmailDraft;
