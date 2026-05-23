import React from "react";

function PlaceholderSection({ rowData, onCopyPlaceholder }) {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-number">05B</span>
        <h2 className="section-title">Available placeholders</h2>
      </div>

      {!rowData?.__allFields && (
        <div className="empty-state">
          Detect an active row to see placeholders generated from your source columns.
        </div>
      )}

      {rowData?.__allFields && (
        <>
          <p className="field-hint placeholder-hint">
            Use these placeholders in your message templates. They are generated from your detected
            source columns.
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
