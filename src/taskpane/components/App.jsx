import React, { useEffect } from "react";

import useTableStore from "../store/tableStore";
import useHeaderStore from "../store/headerStore";
import useMappingStore from "../store/mappingStore";
import useActiveRowStore from "../store/activeRowStore";

import { getActiveRowIndex, getMappedRowData } from "../services/rowService";
import { getWorkbookTables } from "../services/tableService";
import { getTableHeaders } from "../services/headerService";
import { saveMappings, loadMappings } from "../services/settingsService";
import { openDraft } from "../services/emailService";

import MappingRow from "./MappingRow";

function App() {
  const { tables, selectedTable, setTables, setSelectedTable } = useTableStore();

  const { headers, setHeaders } = useHeaderStore();

  const { mappings, setMapping, loadSavedMappings } = useMappingStore();

  const { rowIndex, rowData, setRowIndex, setRowData } = useActiveRowStore();

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

  async function loadTables() {
    const foundTables = await getWorkbookTables();

    setTables(foundTables);

    if (foundTables.length > 0) {
      setSelectedTable(foundTables[0]);
    }
  }

  async function loadHeaders(tableName) {
    const foundHeaders = await getTableHeaders(tableName);

    console.log("Found headers:", foundHeaders);

    setHeaders(foundHeaders);
  }

  // Detect Active Row
  async function detectActiveRow() {
    const index = await getActiveRowIndex();

    setRowIndex(index);

    if (index !== null && selectedTable) {
      const data = await getMappedRowData(selectedTable, index, mappings);

      console.log("Fetched row data:", data);

      setRowData(data);
    }
  }

  // handling create draft
  function handleCreateDraft() {
    try {
      console.log("rowData:", rowData);

      if (!rowData?.recipientEmail) {
        console.error("Recipient email missing");
        return;
      }

      openDraft(rowData);
    } catch (error) {
      console.error("Draft creation error:", error);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Excel Email Automation</h1>

      {/* Table Selection */}
      <h3>1. Select Excel Table</h3>

      <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
        {tables.map((table) => (
          <option key={table} value={table}>
            {table}
          </option>
        ))}
      </select>

      <hr />

      {/* Headers Preview */}
      <h3>2. Available Headers</h3>

      <ul>
        {headers.map((header) => (
          <li key={header}>{header}</li>
        ))}
      </ul>

      <hr />

      {/* Mapping Section */}
      <h3>3. Column Mapping</h3>

      <MappingRow
        label="Recipient Email *"
        value={mappings.recipientEmail}
        headers={headers}
        onChange={(value) => setMapping("recipientEmail", value)}
      />

      <MappingRow
        label="Recipient Name"
        value={mappings.recipientName}
        headers={headers}
        onChange={(value) => setMapping("recipientName", value)}
      />

      <MappingRow
        label="CC"
        value={mappings.cc}
        headers={headers}
        onChange={(value) => setMapping("cc", value)}
      />

      <MappingRow
        label="BCC"
        value={mappings.bcc}
        headers={headers}
        onChange={(value) => setMapping("bcc", value)}
      />

      <MappingRow
        label="Subject"
        value={mappings.subject}
        headers={headers}
        onChange={(value) => setMapping("subject", value)}
      />

      <MappingRow
        label="Body *"
        value={mappings.body}
        headers={headers}
        onChange={(value) => setMapping("body", value)}
      />

      <MappingRow
        label="Draft Created Date"
        value={mappings.draftCreatedDate}
        headers={headers}
        onChange={(value) => setMapping("draftCreatedDate", value)}
      />

      <MappingRow
        label="Draft Modified Date"
        value={mappings.draftModifiedDate}
        headers={headers}
        onChange={(value) => setMapping("draftModifiedDate", value)}
      />

      <MappingRow
        label="Draft ID"
        value={mappings.draftId}
        headers={headers}
        onChange={(value) => setMapping("draftId", value)}
      />

      <MappingRow
        label="Email Status"
        value={mappings.emailStatus}
        headers={headers}
        onChange={(value) => setMapping("emailStatus", value)}
      />

      <MappingRow
        label="Template Type"
        value={mappings.templateType}
        headers={headers}
        onChange={(value) => setMapping("templateType", value)}
      />

      <MappingRow
        label="Sender Email"
        value={mappings.senderEmail}
        headers={headers}
        onChange={(value) => setMapping("senderEmail", value)}
      />

      <MappingRow
        label="Sender Name"
        value={mappings.senderName}
        headers={headers}
        onChange={(value) => setMapping("senderName", value)}
      />

      <hr />

      <p>✅ Configuration auto-saved</p>

      <hr />

      <h3>4. Active Row Detection</h3>

      <button onClick={detectActiveRow}>Detect Selected Row</button>

      <p>Active Row: {rowIndex !== null ? rowIndex + 1 : "Not detected"}</p>

      <h4>Mapped Row Data</h4>

      <pre>{JSON.stringify(rowData, null, 2)}</pre>

      <button onClick={handleCreateDraft}>Create Outlook Draft</button>
    </div>
  );
}

export default App;
