import React from "react";

function AppHeader({ onRefreshTables }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-logo">✉</div>

        <div>
          <h1 className="header-title">Spreadsheet Follow-up Assistant</h1>
          <p className="header-sub">Part of Follow-up Automation</p>
        </div>
      </div>

      <button className="btn-ghost btn-icon" onClick={onRefreshTables} title="Refresh tables">
        ↻
      </button>
    </header>
  );
}

export default AppHeader;
