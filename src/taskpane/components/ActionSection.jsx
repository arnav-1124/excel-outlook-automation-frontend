import React from "react";

function ActionSection({
  onSyncWorkbook,
  onRefreshTables,
  onReadRow,
  onOpenOutlookDraft,
  isDraftReady,
}) {
  return (
    <section className="section section-actions">
      <div className="section-header">
        <span className="section-number">06</span>
        <h2 className="section-title">Actions</h2>
      </div>

      <div className="action-grid">
        <button className="btn-outline" onClick={onSyncWorkbook}>
          Sync Workbook
        </button>

        <button className="btn-outline" onClick={onRefreshTables}>
          Refresh Tables
        </button>

        <button className="btn-outline" onClick={onReadRow}>
          Read Row
        </button>

        <button className="btn-primary btn-lg" onClick={onOpenOutlookDraft} disabled={!isDraftReady}>
          Open Outlook Web Draft
        </button>
      </div>

      <p className="action-hint">
        Desktop Outlook automation is skipped for now. This opens Outlook Web using your working
        email draft logic.
      </p>
    </section>
  );
}

export default ActionSection;