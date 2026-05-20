import React from "react";

function PlaceholderSection({ rowData, onCopyPlaceholder }) {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-number">TPL</span>
        <h2 className="section-title">Available Placeholders</h2>
      </div>

      {!rowData?.__allFields && (
        <div className="empty-state">
          Detect a selected row to see all available placeholders from your Excel table.
        </div>
      )}

      {rowData?.__allFields && (
        <>
          <p className="field-hint placeholder-hint">
            Use these placeholders in future templates. They are generated directly from your Excel
            table headers.
          </p>

          <div className="placeholder-list">
            {Object.keys(rowData.__allFields).map((fieldName) => (
              <button
                key={fieldName}
                type="button"
                className="placeholder-chip"
                title={`{{${fieldName}}}`}
                onClick={() => onCopyPlaceholder(fieldName)}
              >
                {`{{${fieldName}}}`}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default PlaceholderSection;
