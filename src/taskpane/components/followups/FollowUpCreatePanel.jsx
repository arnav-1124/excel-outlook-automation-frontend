import React, { useMemo, useState } from "react";

function toDateInputValue(date = new Date()) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMappedValue(rowData, mappings, key) {
  const mappedColumn = mappings?.[key];

  if (!mappedColumn) return "";

  return rowData?.[key] || rowData?.[mappedColumn] || "";
}

function buildSourceRowKey({ selectedTable, mappings, rowData, rowIndex }) {
  const referenceKeys = [
    "referenceValue",
    "poNumber",
    "invoiceNumber",
    "deductionId",
    "customerName",
    "recipientEmail",
  ];

  for (const key of referenceKeys) {
    const value = getMappedValue(rowData, mappings, key);

    if (value) {
      return `${selectedTable || "unknown_table"}::${key}::${String(value).trim()}`;
    }
  }

  return `${selectedTable || "unknown_table"}::row::${rowIndex || "unknown"}`;
}

function buildInitialForm({ rowData, mappings, selectedTable, rowIndex }) {
  const recipientEmail =
    getMappedValue(rowData, mappings, "recipientEmail") || rowData?.recipientEmail || "";

  const recipientName =
    getMappedValue(rowData, mappings, "recipientName") ||
    getMappedValue(rowData, mappings, "customerName") ||
    getMappedValue(rowData, mappings, "warehouseName") ||
    "";

  const subject =
    rowData?.subject ||
    getMappedValue(rowData, mappings, "emailSubject") ||
    getMappedValue(rowData, mappings, "subject") ||
    "";

  const referenceValue =
    getMappedValue(rowData, mappings, "referenceValue") ||
    getMappedValue(rowData, mappings, "poNumber") ||
    getMappedValue(rowData, mappings, "invoiceNumber") ||
    getMappedValue(rowData, mappings, "deductionId") ||
    "";

  return {
    recipientEmail,
    recipientName,
    recipientPhone: "",
    subject,
    referenceType: referenceValue ? "Excel row reference" : "",
    referenceValue,
    sourceTableName: selectedTable || "",
    sourceRowIndex: rowIndex || null,
    sourceRowKey: buildSourceRowKey({
      selectedTable,
      mappings,
      rowData,
      rowIndex,
    }),
    sentDate: toDateInputValue(),
    followUpAfterDays: 3,
    priority: "NORMAL",
    reminderEmailEnabled: true,
    reminderWhatsappEnabled: false,
    reminderInAppEnabled: true,
    latestNote: "",
  };
}

function FollowUpCreatePanel({
  isOpen,
  onClose,
  rowData,
  mappings,
  selectedTable,
  rowIndex,
  isSaving,
  onSave,
}) {
  const initialForm = useMemo(
    () =>
      buildInitialForm({
        rowData,
        mappings,
        selectedTable,
        rowIndex,
      }),
    [rowData, mappings, selectedTable, rowIndex]
  );

  const [form, setForm] = useState(initialForm);
  const [localError, setLocalError] = useState("");

  function updateField(key, value) {
    setLocalError("");

    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSave() {
    setLocalError("");

    const payload = {
      recipientEmail: form.recipientEmail || null,
      recipientName: form.recipientName || null,
      recipientPhone: form.recipientPhone || null,

      subject: form.subject || null,

      referenceType: form.referenceType || null,
      referenceValue: form.referenceValue || null,

      sourceTableName: form.sourceTableName || null,
      sourceRowIndex: form.sourceRowIndex || null,
      sourceRowKey: form.sourceRowKey || null,

      sentDate: new Date(`${form.sentDate}T09:00:00`).toISOString(),
      followUpAfterDays: Number(form.followUpAfterDays || 1),

      priority: form.priority,

      reminderEmailEnabled: form.reminderEmailEnabled,
      reminderWhatsappEnabled: form.reminderWhatsappEnabled,
      reminderInAppEnabled: form.reminderInAppEnabled,

      latestNote: form.latestNote || null,

      metadata: {
        createdFrom: "excel_taskpane",
        selectedTable,
        rowIndex,
      },
    };

    try {
      const created = await onSave(payload);

      if (created) {
        onClose();
        setForm(initialForm);
        setLocalError("");
      }
    } catch (error) {
      setLocalError(error.message || "Could not save this follow-up.");
    }
  }

  if (!isOpen) return null;

  return (
    <section className="followup-create-card">
      <div className="followup-create-header">
        <div>
          <p className="followup-kicker">Create follow-up</p>
          <h2>Track this Excel row</h2>
        </div>

        <button className="followup-icon-btn" type="button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="followup-create-note">
        This follow-up will stay linked to the selected row, so you can track pending replies
        without remembering dates manually.
      </div>

      <label className="account-field">
        <span>Recipient email</span>
        <input
          type="email"
          value={form.recipientEmail}
          onChange={(event) => updateField("recipientEmail", event.target.value)}
          placeholder="vendor@example.com"
        />
      </label>

      <label className="account-field">
        <span>Recipient name</span>
        <input
          type="text"
          value={form.recipientName}
          onChange={(event) => updateField("recipientName", event.target.value)}
          placeholder="Vendor / customer name"
        />
      </label>

      <label className="account-field">
        <span>WhatsApp phone number</span>
        <input
          type="text"
          value={form.recipientPhone}
          onChange={(event) => updateField("recipientPhone", event.target.value)}
          placeholder="+91..."
        />
      </label>

      <label className="account-field">
        <span>Email subject / task title</span>
        <input
          type="text"
          value={form.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          placeholder="Follow-up regarding PO..."
        />
      </label>

      <div className="followup-form-grid">
        <label className="account-field">
          <span>Reference type</span>
          <input
            type="text"
            value={form.referenceType}
            onChange={(event) => updateField("referenceType", event.target.value)}
            placeholder="PO / Invoice / Deduction"
          />
        </label>

        <label className="account-field">
          <span>Reference value</span>
          <input
            type="text"
            value={form.referenceValue}
            onChange={(event) => updateField("referenceValue", event.target.value)}
            placeholder="PO-12345"
          />
        </label>
      </div>

      <div className="followup-form-grid">
        <label className="account-field">
          <span>Sent date</span>
          <input
            type="date"
            value={form.sentDate}
            onChange={(event) => updateField("sentDate", event.target.value)}
          />
        </label>

        <label className="account-field">
          <span>Follow-up after days</span>
          <input
            type="number"
            min="1"
            max="365"
            value={form.followUpAfterDays}
            onChange={(event) => updateField("followUpAfterDays", event.target.value)}
          />
        </label>
      </div>

      <label className="account-field">
        <span>Priority</span>
        <select
          className="admin-select"
          value={form.priority}
          onChange={(event) => updateField("priority", event.target.value)}
        >
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </label>

      <div className="followup-reminder-options">
        <label>
          <input
            type="checkbox"
            checked={form.reminderEmailEnabled}
            onChange={(event) => updateField("reminderEmailEnabled", event.target.checked)}
          />
          <span>Email reminder</span>
        </label>

        <label>
          <input
            type="checkbox"
            checked={form.reminderWhatsappEnabled}
            onChange={(event) => updateField("reminderWhatsappEnabled", event.target.checked)}
          />
          <span>WhatsApp reminder</span>
        </label>

        <label>
          <input
            type="checkbox"
            checked={form.reminderInAppEnabled}
            onChange={(event) => updateField("reminderInAppEnabled", event.target.checked)}
          />
          <span>In-app reminder</span>
        </label>
      </div>

      <label className="account-field">
        <span>Note</span>
        <input
          type="text"
          value={form.latestNote}
          onChange={(event) => updateField("latestNote", event.target.value)}
          placeholder="Optional note for your future self"
        />
      </label>

      <div className="followup-source-card">
        <span>Linked source</span>
        <strong>{form.sourceTableName || "No table selected"}</strong>
        <small>{form.sourceRowKey}</small>
      </div>

      {localError && (
        <div className="followup-save-error">
          <span>!</span>
          <p>{localError}</p>
        </div>
      )}

      <button
        className="followup-primary-btn"
        type="button"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving follow-up..." : "Save follow-up"}
      </button>
    </section>
  );
}

export default FollowUpCreatePanel;
