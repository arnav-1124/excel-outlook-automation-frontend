import React from "react";

function TableSelectorSection({
  tables,
  selectedTable,
  onSelectTable,
  onRefreshTables,
  isLoadingTables,
  autoSyncEnabled,
  onToggleAutoSync,
  lastSyncText,
}) {
  return (
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
          onChange={(e) => onSelectTable(e.target.value)}
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

      <button className="btn-outline" onClick={onRefreshTables} disabled={isLoadingTables}>
        {isLoadingTables ? "Loading..." : "Refresh Tables"}
      </button>

      <div className="sync-control">
        <label className="sync-toggle">
          <input
            type="checkbox"
            checked={autoSyncEnabled}
            onChange={(e) => onToggleAutoSync(e.target.checked)}
          />
          <span>Auto-sync workbook changes</span>
        </label>

        {lastSyncText && <span className="sync-time">Last sync: {lastSyncText}</span>}
      </div>
    </section>
  );
}

export default TableSelectorSection;