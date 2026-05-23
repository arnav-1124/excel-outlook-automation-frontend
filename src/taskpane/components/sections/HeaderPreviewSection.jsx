import React from "react";

function HeaderPreviewSection({ headers, showHeaders, onToggleShowHeaders }) {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-number">VC</span>
        <h2 className="section-title">Verify detected columns</h2>

        <button className="btn-ghost" onClick={onToggleShowHeaders}>
          {showHeaders ? "Hide" : "Show"}
        </button>
      </div>

      {!showHeaders && (
        <p className="empty-state compact">
          {headers.length > 0
            ? `${headers.length} column(s) detected. Open this section if you want to verify the source data.`
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
  );
}

export default HeaderPreviewSection;
