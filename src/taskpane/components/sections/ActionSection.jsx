import React from "react";

function ActionSection({
  onSyncWorkbook,
  onRefreshTables,
  onReadRow,
  onCreateFollowUp,
  onOpenOutlookDraft,
  isDraftReady,
}) {
  return (
    <section className="section section-actions">
      <div className="section-header">
        <span className="section-number">07</span>
        <h2 className="section-title">Send or save next step</h2>
      </div>

      <div className="action-primary-panel">
        <div>
          <h3>Ready to create the draft?</h3>
          <p>
            Open a web draft using the generated message preview and selected recipient details.
          </p>
        </div>

        <button
          className="btn-primary btn-lg action-main-btn"
          onClick={onOpenOutlookDraft}
          disabled={!isDraftReady}
        >
          Open Outlook web draft
        </button>
      </div>

      <div className="action-secondary-panel">
        <div>
          <h3>Need to track this later?</h3>
          <p>Create a follow-up reminder so this message does not get forgotten.</p>
        </div>

        <button
          className="btn-outline action-followup-btn"
          type="button"
          onClick={onCreateFollowUp}
        >
          Create follow-up reminder
        </button>
      </div>

      <div className="action-utility-panel">
        <div className="action-utility-header">
          <span>Utility actions</span>
          <small>Use these when your workbook data changes.</small>
        </div>

        <div className="action-utility-grid">
          <button className="btn-outline" onClick={onSyncWorkbook}>
            Sync workbook
          </button>

          <button className="btn-outline" onClick={onRefreshTables}>
            Refresh tables
          </button>

          <button className="btn-outline" onClick={onReadRow}>
            Read active row
          </button>
        </div>
      </div>
    </section>
  );
}

export default ActionSection;
