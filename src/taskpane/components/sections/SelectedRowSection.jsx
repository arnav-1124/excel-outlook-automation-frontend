import React from "react";

function SelectedRowSection({ rowIndex, rowData, isReadingRow, onDetectActiveRow, renderValue }) {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-number">04</span>
        <h2 className="section-title">Selected Row</h2>
      </div>

      <button className="btn-primary" onClick={onDetectActiveRow} disabled={isReadingRow}>
        {isReadingRow ? "Reading selected row..." : "Detect Selected Row"}
      </button>

      <p className="hint">Active Row: {rowIndex !== null ? rowIndex + 1 : "Not detected yet"}</p>

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
  );
}

export default SelectedRowSection;
