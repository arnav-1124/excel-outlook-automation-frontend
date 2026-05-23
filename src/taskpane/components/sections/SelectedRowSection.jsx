import React from "react";

import { MAPPING_FIELDS } from "../../constants/mappingFields";

function SelectedRowSection({
  rowIndex,
  rowData,
  mappings,
  isReadingRow,
  onDetectActiveRow,
  renderValue,
}) {
  const mappedPreviewFields = MAPPING_FIELDS.filter((field) => mappings?.[field.key]).slice(0, 8);

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

      {rowData && mappedPreviewFields.length === 0 && (
        <div className="empty-state">
          Row detected. Map your table columns above to preview useful values here.
        </div>
      )}

      {rowData && mappedPreviewFields.length > 0 && (
        <div className="row-preview-grid">
          {mappedPreviewFields.map((field) => {
            const selectedColumn = mappings[field.key];
            const value = rowData[field.key] ?? rowData[selectedColumn];

            return (
              <div className="preview-row" key={field.key}>
                <span className="preview-label">{field.label}</span>
                <span className="preview-value">{renderValue(value)}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default SelectedRowSection;
