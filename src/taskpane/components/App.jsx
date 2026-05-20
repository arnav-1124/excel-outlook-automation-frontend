import React, { useEffect, useState } from "react";

import useTableStore from "../store/tableStore";
import useHeaderStore from "../store/headerStore";
import useMappingStore from "../store/mappingStore";
import useActiveRowStore from "../store/activeRowStore";

import { getActiveRowIndex, getMappedRowData } from "../services/rowService";
import { getWorkbookTables } from "../services/tableService";
import { getTableHeaders } from "../services/headerService";
import { saveMappings, loadMappings } from "../services/settingsService";
import { openOutlookWebDraft } from "../services/emailService";

import MappingRow from "./MappingRow";

const MAPPING_FIELDS = [
  {
    key: "recipientEmail",
    label: "Recipient Email",
    required: true,
  },
  {
    key: "recipientName",
    label: "Recipient Name",
  },
  {
    key: "cc",
    label: "CC",
  },
  {
    key: "bcc",
    label: "BCC",
  },
  {
    key: "subject",
    label: "Subject",
  },
  {
    key: "body",
    label: "Body",
    required: true,
  },
  {
    key: "draftCreatedDate",
    label: "Draft Created Date",
  },
  {
    key: "draftModifiedDate",
    label: "Draft Modified Date",
  },
  {
    key: "draftId",
    label: "Draft ID",
  },
  {
    key: "emailStatus",
    label: "Email Status",
  },
  {
    key: "templateType",
    label: "Template Type",
  },
  {
    key: "senderEmail",
    label: "Sender Email",
  },
  {
    key: "senderName",
    label: "Sender Name",
  },
];

function App() {
  const { tables, selectedTable, setTables, setSelectedTable } = useTableStore();

  const { headers, setHeaders } = useHeaderStore();

  const { mappings, setMapping, loadSavedMappings } = useMappingStore();

  const { rowIndex, rowData, setRowIndex, setRowData } = useActiveRowStore();

  const [banner, setBanner] = useState(null);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isReadingRow, setIsReadingRow] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const mappedCount = MAPPING_FIELDS.filter((field) => mappings?.[field.key]).length;

  const requiredMissingCount = MAPPING_FIELDS.filter(
    (field) => field.required && !mappings?.[field.key]
  ).length;

  // Initial load
  useEffect(() => {
    loadTables();

    const saved = loadMappings();
    loadSavedMappings(saved);
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

  function showBanner(type, message) {
    setBanner({ type, message });

    if (type !== "error") {
      setTimeout(() => {
        setBanner(null);
      }, 3500);
    }
  }

  async function loadTables() {
    try {
      setIsLoadingTables(true);

      const foundTables = await getWorkbookTables();

      setTables(foundTables);

      if (foundTables.length > 0) {
        setSelectedTable(foundTables[0]);
        showBanner("success", `${foundTables.length} table(s) loaded successfully.`);
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
      }
    } catch (error) {
      console.error("Load headers error:", error);
      showBanner("error", "Could not load table headers.");
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

        showBanner("success", "Selected row loaded successfully.");
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

  function handleOpenOutlookWebDraft() {
    try {
      if (!validateEmailDraftData()) return;

      openOutlookWebDraft(rowData);

      showBanner("success", "Outlook Web draft opened.");
    } catch (error) {
      console.error("Outlook Web draft creation error:", error);
      showBanner("error", "Could not open Outlook draft.");
    }
  }

  function renderValue(value) {
    if (value === null || value === undefined || value === "") {
      return <span className="value-empty">Not available</span>;
    }

    return String(value);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="header-logo">✉</div>

          <div>
            <h1 className="header-title">Excel Email Automation</h1>
            <p className="header-sub">Excel × Outlook</p>
          </div>
        </div>

        <button className="btn-ghost btn-icon" onClick={loadTables} title="Refresh tables">
          ↻
        </button>
      </header>

      {banner && (
        <div className="banner-container">
          <div className={`banner banner-${banner.type}`}>
            <span className="banner-icon">
              {banner.type === "success" && "✓"}
              {banner.type === "error" && "!"}
              {banner.type === "warning" && "⚠"}
              {banner.type === "info" && "i"}
            </span>

            <span className="banner-message">{banner.message}</span>

            <button className="banner-dismiss" onClick={() => setBanner(null)}>
              ×
            </button>
          </div>
        </div>
      )}

      <main className="app-main">
        {/* Table Selection */}
        <section className="section">
          <div className="section-header">
            <span className="section-number">01</span>
            <h2 className="section-title">Select Excel Table</h2>
          </div>

          <div className="field-group">
            <label className="field-label">Workbook Table</label>

            <select
              className="select"
              value={selectedTable || ""}
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              {tables.length === 0 && <option value="">No tables found</option>}

              {tables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>

            <p className="field-hint">
              Choose the Excel table that contains recipient, subject and body columns.
            </p>
          </div>

          <button className="btn-outline" onClick={loadTables} disabled={isLoadingTables}>
            {isLoadingTables ? "Loading..." : "Refresh Tables"}
          </button>
        </section>

        {/* Headers Preview */}
        <section className="section">
          <div className="section-header">
            <span className="section-number">02</span>
            <h2 className="section-title">Available Headers</h2>

            <button className="btn-ghost" onClick={() => setShowHeaders((value) => !value)}>
              {showHeaders ? "Hide" : "Show"}
            </button>
          </div>

          {!showHeaders && (
            <p className="empty-state compact">
              {headers.length > 0
                ? `${headers.length} header(s) detected. Open this section if you want to verify them.`
                : "No headers loaded yet."}
            </p>
          )}

          {showHeaders && (
            <div className="header-chip-list">
              {headers.map((header) => (
                <span className="header-chip" key={header}>
                  {header}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Mapping Section */}
        <section className="section">
          <div className="section-header">
            <span className="section-number">03</span>
            <h2 className="section-title">Column Mapping</h2>

            <span className={`badge ${requiredMissingCount > 0 ? "badge-warn" : "badge-ok"}`}>
              {mappedCount}/{MAPPING_FIELDS.length}
            </span>
          </div>

          <div className="mapping-grid">
            {MAPPING_FIELDS.map((field) => (
              <MappingRow
                key={field.key}
                label={field.label}
                required={field.required}
                value={mappings[field.key]}
                headers={headers}
                onChange={(value) => setMapping(field.key, value)}
              />
            ))}
          </div>

          <div className="save-note">
            <span>✓</span>
            <span>Configuration auto-saved locally</span>
          </div>
        </section>

        {/* Active Row Detection */}
        <section className="section">
          <div className="section-header">
            <span className="section-number">04</span>
            <h2 className="section-title">Selected Row</h2>
          </div>

          <button className="btn-primary" onClick={detectActiveRow} disabled={isReadingRow}>
            {isReadingRow ? "Reading selected row..." : "Detect Selected Row"}
          </button>

          <p className="hint">
            Active Row: {rowIndex !== null ? rowIndex + 1 : "Not detected yet"}
          </p>

          {!rowData && (
            <div className="empty-state">
              Select a cell inside your Excel table, then click Detect Selected Row.
            </div>
          )}

          {rowData && (
            <div className="row-preview-grid">
              <div className="preview-row">
                <span className="preview-label">To</span>
                <span className="preview-value">{renderValue(rowData.recipientEmail)}</span>
              </div>

              <div className="preview-row">
                <span className="preview-label">Name</span>
                <span className="preview-value">{renderValue(rowData.recipientName)}</span>
              </div>

              <div className="preview-row">
                <span className="preview-label">Subject</span>
                <span className="preview-value">{renderValue(rowData.subject)}</span>
              </div>

              <div className="preview-row">
                <span className="preview-label">Status</span>
                <span className="preview-value">{renderValue(rowData.emailStatus)}</span>
              </div>

              <div className="preview-row">
                <span className="preview-label">Template</span>
                <span className="preview-value">{renderValue(rowData.templateType)}</span>
              </div>
            </div>
          )}
        </section>

        {/* Email Preview */}
        <section className="section">
          <div className="section-header">
            <span className="section-number">05</span>
            <h2 className="section-title">Email Preview</h2>
          </div>

          {!rowData && (
            <div className="empty-state">
              Email preview will appear after detecting the selected row.
            </div>
          )}

          {rowData && (
            <div className="email-preview-box">
              <div className="email-preview-row">
                <span className="email-preview-label">To</span>
                <span className="email-preview-value email-preview-to">
                  {renderValue(rowData.recipientEmail)}
                </span>
              </div>

              {rowData.cc && (
                <div className="email-preview-row">
                  <span className="email-preview-label">CC</span>
                  <span className="email-preview-value">{renderValue(rowData.cc)}</span>
                </div>
              )}

              {rowData.bcc && (
                <div className="email-preview-row">
                  <span className="email-preview-label">BCC</span>
                  <span className="email-preview-value">{renderValue(rowData.bcc)}</span>
                </div>
              )}

              <div className="email-preview-row">
                <span className="email-preview-label">Subject</span>
                <span className="email-preview-value email-preview-subject">
                  {renderValue(rowData.subject)}
                </span>
              </div>

              <div className="email-preview-divider" />

              <div className="email-preview-body">
                {String(rowData.body || "")
                  .split("\n")
                  .map((line, index) => (
                    <p className="email-body-line" key={index}>
                      {line || "\u00A0"}
                    </p>
                  ))}
              </div>
            </div>
          )}
        </section>

        {/* Actions */}
        <section className="section section-actions">
          <div className="section-header">
            <span className="section-number">06</span>
            <h2 className="section-title">Actions</h2>
          </div>

          <div className="action-grid">
            <button className="btn-outline" onClick={loadTables}>
              Refresh Tables
            </button>

            <button className="btn-outline" onClick={detectActiveRow}>
              Read Row
            </button>

            <button className="btn-primary btn-lg" onClick={handleOpenOutlookWebDraft}>
              Open Outlook Web Draft
            </button>
          </div>

          <p className="action-hint">
            Desktop Outlook automation is skipped for now. This opens Outlook Web using your working
            email draft logic.
          </p>
        </section>

        {/* Debug JSON */}
        <section className="section debug-section">
          <div className="section-header">
            <span className="section-number">DBG</span>
            <h2 className="section-title">Debug Data</h2>

            <button className="btn-ghost" onClick={() => setShowRawJson((value) => !value)}>
              {showRawJson ? "Hide" : "Show"}
            </button>
          </div>

          {showRawJson && <pre className="debug-json">{JSON.stringify(rowData, null, 2)}</pre>}

          {!showRawJson && (
            <p className="empty-state compact">
              Hidden by default. Open this only while debugging.
            </p>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <span>Excel Email Automation</span>
        <span className="footer-tag">Local MVP</span>
      </footer>
    </div>
  );
}

export default App;
