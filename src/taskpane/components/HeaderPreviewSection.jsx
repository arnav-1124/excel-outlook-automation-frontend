import React from "react";

function HeaderPreviewSection({ headers, showHeaders, onToggleShowHeaders }) {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-number">02</span>
        <h2 className="section-title">Available Headers</h2>

        <button className="btn-ghost" onClick={onToggleShowHeaders}>
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
  );
}

export default HeaderPreviewSection;