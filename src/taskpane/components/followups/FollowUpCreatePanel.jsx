import React, { useMemo, useState } from "react";

function toDateInputValue(date = new Date()) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getValueFromMappedColumn(rowData, mappings, key) {
  const mappedColumn = mappings?.[key];

  if (!mappedColumn) return "";

  return rowData?.[key] || rowData?.[mappedColumn] || "";
}

function getValueBySimilarColumn(rowData, candidates = []) {
  if (!rowData) return "";

  const normalizedCandidates = candidates.map(normalizeText);

  const matchingKey = Object.keys(rowData).find((columnName) => {
    const normalizedColumn = normalizeText(columnName);

    return normalizedCandidates.some(
      (candidate) =>
        normalizedColumn === candidate ||
        normalizedColumn.includes(candidate) ||
        candidate.includes(normalizedColumn)
    );
  });

  return matchingKey ? rowData[matchingKey] : "";
}

function getSmartValue(rowData, mappings, key, candidates = []) {
  return (
    getValueFromMappedColumn(rowData, mappings, key) ||
    rowData?.[key] ||
    getValueBySimilarColumn(rowData, candidates) ||
    ""
  );
}

function normalizePriority(value) {
  const normalized = normalizeText(value);

  if (normalized.includes("urgent")) return "URGENT";
  if (normalized.includes("high")) return "HIGH";
  if (normalized.includes("low")) return "LOW";

  return "NORMAL";
}

function normalizeFollowUpDays(value) {
  const numberValue = Number(value);

  if (Number.isFinite(numberValue) && numberValue > 0) {
    return Math.min(365, Math.max(1, numberValue));
  }

  return 3;
}

function normalizeDateInput(value) {
  if (!value) return toDateInputValue();

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return toDateInputValue();
  }

  return toDateInputValue(parsed);
}

function buildSourceRowKey({ selectedTable, mappings, rowData, rowIndex }) {
  const referenceValue = getSmartValue(rowData, mappings, "referenceValue", [
    "reference",
    "ref",
    "po",
    "po number",
    "invoice",
    "invoice number",
    "deduction",
    "deduction id",
    "claim",
    "ticket",
  ]);

  const recipientEmail = getSmartValue(rowData, mappings, "recipientEmail", [
    "email",
    "mail",
    "recipient",
    "to",
  ]);

  if (referenceValue) {
    return `${selectedTable || "unknown_table"}::reference::${String(referenceValue).trim()}`;
  }

  if (recipientEmail) {
    return `${selectedTable || "unknown_table"}::email::${String(recipientEmail).trim()}`;
  }

  return `${selectedTable || "unknown_table"}::row::${rowIndex || "unknown"}`;
}

function buildInitialForm({ rowData, mappings, selectedTable, rowIndex }) {
  const recipientEmail = getSmartValue(rowData, mappings, "recipientEmail", [
    "email",
    "mail",
    "recipient",
    "to",
    "vendor email",
    "customer email",
  ]);

  const recipientName = getSmartValue(rowData, mappings, "recipientName", [
    "name",
    "recipient name",
    "customer",
    "vendor",
    "warehouse",
    "party",
  ]);

  const recipientPhone = getSmartValue(rowData, mappings, "recipientPhone", [
    "phone",
    "mobile",
    "whatsapp",
    "contact",
    "number",
  ]);

  const subject = getSmartValue(rowData, mappings, "subject", [
    "subject",
    "email subject",
    "mail subject",
  ]);

  const referenceType = getSmartValue(rowData, mappings, "referenceType", [
    "reference type",
    "ref type",
    "type",
  ]);

  const referenceValue = getSmartValue(rowData, mappings, "referenceValue", [
    "reference",
    "ref",
    "po",
    "po number",
    "invoice",
    "invoice number",
    "deduction",
    "deduction id",
    "claim",
    "ticket",
  ]);

  const sentDate = getSmartValue(rowData, mappings, "sentDate", [
    "sent date",
    "email sent date",
    "last email date",
    "mail date",
  ]);

  const followUpAfterDays = getSmartValue(rowData, mappings, "followUpAfterDays", [
    "follow up days",
    "follow-up days",
    "followup days",
    "days",
    "reminder days",
  ]);

  const followUpPriority = getSmartValue(rowData, mappings, "followUpPriority", [
    "priority",
    "urgency",
  ]);

  const followUpNote = getSmartValue(rowData, mappings, "followUpNote", [
    "note",
    "remark",
    "remarks",
    "comment",
    "latest response",
  ]);

  return {
    recipientEmail,
    recipientName,
    recipientPhone,
    subject,
    referenceType: referenceType || (referenceValue ? "Excel row reference" : ""),
    referenceValue,
    sourceTableName: selectedTable || "",
    sourceRowIndex: rowIndex || null,
    sourceRowKey: buildSourceRowKey({
      selectedTable,
      mappings,
      rowData,
      rowIndex,
    }),
    sentDate: normalizeDateInput(sentDate),
    followUpAfterDays: normalizeFollowUpDays(followUpAfterDays),
    priority: normalizePriority(followUpPriority),
    reminderEmailEnabled: true,
    reminderWhatsappEnabled: false,
    reminderInAppEnabled: true,
    latestNote: followUpNote || "",
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

  if (!isOpen) return null;

  return (
    <section className="ds-followup-create-panel">
      <div className="ds-followup-create-header">
        <div>
          <div className="ds-pill">Create reminder</div>
          <h2>Track this Excel row</h2>
          <p>
            Save a follow-up task linked to the selected row, then let reminders carry the memory.
          </p>
        </div>

        <button className="ds-followup-create-close" type="button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="ds-followup-linked-row">
        <div>
          <span>Linked source</span>
          <strong>{form.sourceTableName || "No table selected"}</strong>
        </div>

        <small>{form.sourceRowKey}</small>
      </div>

      <div className="ds-followup-create-section">
        <div className="ds-followup-create-section-head">
          <span>01</span>
          <div>
            <h3>Recipient</h3>
            <p>Who are you waiting to hear back from?</p>
          </div>
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

        <div className="ds-followup-form-grid">
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
            <span>WhatsApp phone</span>
            <input
              type="text"
              value={form.recipientPhone}
              onChange={(event) => updateField("recipientPhone", event.target.value)}
              placeholder="+91..."
            />
          </label>
        </div>
      </div>

      <div className="ds-followup-create-section">
        <div className="ds-followup-create-section-head">
          <span>02</span>
          <div>
            <h3>Reference</h3>
            <p>What should this follow-up be remembered by?</p>
          </div>
        </div>

        <label className="account-field">
          <span>Email subject / task title</span>
          <input
            type="text"
            value={form.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            placeholder="Follow-up regarding PO..."
          />
        </label>

        <div className="ds-followup-form-grid">
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
      </div>

      <div className="ds-followup-create-section">
        <div className="ds-followup-create-section-head">
          <span>03</span>
          <div>
            <h3>Reminder schedule</h3>
            <p>Choose when this task should come back to attention.</p>
          </div>
        </div>

        <div className="ds-followup-form-grid">
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
      </div>

      <div className="ds-followup-create-section">
        <div className="ds-followup-create-section-head">
          <span>04</span>
          <div>
            <h3>Reminder channels</h3>
            <p>Pick how this reminder should reach you.</p>
          </div>
        </div>

        <div className="ds-followup-channel-grid">
          <label className={form.reminderEmailEnabled ? "active" : ""}>
            <input
              type="checkbox"
              checked={form.reminderEmailEnabled}
              onChange={(event) => updateField("reminderEmailEnabled", event.target.checked)}
            />
            <div>
              <strong>Email</strong>
              <span>Reliable inbox reminder</span>
            </div>
          </label>

          <label className={form.reminderWhatsappEnabled ? "active" : ""}>
            <input
              type="checkbox"
              checked={form.reminderWhatsappEnabled}
              onChange={(event) => updateField("reminderWhatsappEnabled", event.target.checked)}
            />
            <div>
              <strong>WhatsApp</strong>
              <span>Credit-controlled instant reminder</span>
            </div>
          </label>

          <label className={form.reminderInAppEnabled ? "active" : ""}>
            <input
              type="checkbox"
              checked={form.reminderInAppEnabled}
              onChange={(event) => updateField("reminderInAppEnabled", event.target.checked)}
            />
            <div>
              <strong>In-app</strong>
              <span>Visible inside Follow-up Center</span>
            </div>
          </label>
        </div>
      </div>

      <div className="ds-followup-create-section">
        <div className="ds-followup-create-section-head">
          <span>05</span>
          <div>
            <h3>Note</h3>
            <p>Add context your future self should not forget.</p>
          </div>
        </div>

        <label className="account-field">
          <span>Follow-up note</span>
          <input
            type="text"
            value={form.latestNote}
            onChange={(event) => updateField("latestNote", event.target.value)}
            placeholder="Optional note for your future self"
          />
        </label>
      </div>

      {localError && <div className="ds-alert error ds-followup-create-error">{localError}</div>}

      <div className="ds-followup-create-footer">
        <button className="ds-button-secondary" type="button" onClick={onClose} disabled={isSaving}>
          Cancel
        </button>

        <button
          className="ds-button-primary"
          type="button"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving follow-up..." : "Save follow-up"}
        </button>
      </div>
    </section>
  );
}

export default FollowUpCreatePanel;
