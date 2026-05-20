import React from "react";

function DebugSection({ rowData, showRawJson, onToggle }) {
  return (
    <section className="section debug-section">
      <div className="section-header">
        <span className="section-number">DBG</span>
        <h2 className="section-title">Debug Data</h2>

        <button className="btn-ghost" onClick={onToggle}>
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
  );
}

export default DebugSection;