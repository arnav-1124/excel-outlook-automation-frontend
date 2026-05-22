import React from "react";

import FollowUpCreatePanel from "./FollowUpCreatePanel";

function formatDate(dateValue) {
  if (!dateValue) return "No date";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));
  } catch {
    return "Invalid date";
  }
}

function getFollowUpTitle(item) {
  return item.referenceValue || item.subject || item.recipientEmail || "Untitled follow-up";
}

function FollowUpDashboard({
  onBack,
  isAuthenticated,
  onOpenAccount,
  followUps,
  summary,
  activeBucket,
  isLoading,
  error,
  onChangeBucket,
  onResolve,
  onSnooze,
  onReopen,
  onCancel,
  isCreateOpen,
  onCloseCreate,
  rowData,
  mappings,
  selectedTable,
  rowIndex,
  onCreateFollowUp,
}) {
  const buckets = [
    { key: "dueToday", label: "Due", count: summary?.dueToday || 0 },
    { key: "overdue", label: "Overdue", count: summary?.overdue || 0 },
    { key: "upcoming", label: "Upcoming", count: summary?.upcoming || 0 },
    { key: "resolved", label: "Resolved", count: summary?.resolved || 0 },
  ];

  if (!isAuthenticated) {
    return (
      <div className="followup-page">
        <button className="followup-back-btn" type="button" onClick={onBack}>
          ← Back to workflow
        </button>

        <section className="followup-auth-gate">
          <div className="followup-auth-icon">🔒</div>
          <p className="followup-kicker">Follow-up reminders</p>
          <h1>Never forget another follow-up</h1>
          <p>
            Sign in to save follow-up tasks, track due dates, and receive email/WhatsApp reminders.
          </p>

          <button className="followup-primary-btn" type="button" onClick={onOpenAccount}>
            Sign in or create account
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="followup-page">
      <div className="followup-hero">
        <button className="followup-back-btn" type="button" onClick={onBack}>
          ← Back to workflow
        </button>

        <div className="followup-hero-card">
          <div className="followup-hero-icon">⏰</div>

          <div>
            <h1>Track every pending reply</h1>
            <p>
              Monitor due, overdue, upcoming, and resolved follow-ups from one focused workspace.
            </p>
          </div>
        </div>
      </div>

      <FollowUpCreatePanel
        isOpen={isCreateOpen}
        onClose={onCloseCreate}
        rowData={rowData}
        mappings={mappings}
        selectedTable={selectedTable}
        rowIndex={rowIndex}
        isSaving={isLoading}
        onSave={onCreateFollowUp}
      />

      <div className="followup-summary-grid">
        <div className="followup-summary-card urgent">
          <span>Overdue</span>
          <strong>{summary?.overdue || 0}</strong>
        </div>

        <div className="followup-summary-card due">
          <span>Due today</span>
          <strong>{summary?.dueToday || 0}</strong>
        </div>

        <div className="followup-summary-card">
          <span>Upcoming</span>
          <strong>{summary?.upcoming || 0}</strong>
        </div>
      </div>

      <div className="followup-tabs">
        {buckets.map((bucket) => (
          <button
            key={bucket.key}
            type="button"
            className={`followup-tab ${activeBucket === bucket.key ? "active" : ""}`}
            onClick={() => onChangeBucket(bucket.key)}
          >
            <span>{bucket.label}</span>
            <strong>{bucket.count}</strong>
          </button>
        ))}
      </div>

      {error && <div className="followup-error">{error}</div>}

      <section className="followup-list-card">
        <div className="followup-list-header">
          <div>
            <p className="followup-kicker">Tasks</p>
            <h2>{isLoading ? "Loading follow-ups..." : "Follow-up queue"}</h2>
          </div>
        </div>

        {!isLoading && followUps.length === 0 && (
          <div className="followup-empty">
            <strong>No follow-ups here</strong>
            <span>This bucket is clean. That’s a good kind of boring.</span>
          </div>
        )}

        <div className="followup-list">
          {followUps.map((item) => (
            <article className="followup-card" key={item.id}>
              <div className="followup-card-top">
                <div>
                  <h3>{getFollowUpTitle(item)}</h3>
                  <p>{item.subject || item.recipientEmail || "No subject added."}</p>
                </div>

                <span className={`followup-priority ${item.priority.toLowerCase()}`}>
                  {item.priority}
                </span>
              </div>

              <div className="followup-meta-grid">
                <div>
                  <span>Due date</span>
                  <strong>{formatDate(item.dueDate)}</strong>
                </div>

                <div>
                  <span>Recipient</span>
                  <strong>{item.recipientName || item.recipientEmail || "Not added"}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>{item.status}</strong>
                </div>
              </div>

              {item.latestNote && <p className="followup-note">{item.latestNote}</p>}

              <div className="followup-actions">
                {item.status === "RESOLVED" ? (
                  <button
                    type="button"
                    className="followup-secondary-btn"
                    onClick={() => onReopen(item.id)}
                  >
                    Reopen
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="followup-success-btn"
                      onClick={() => onResolve(item.id)}
                    >
                      Resolve
                    </button>

                    <button
                      type="button"
                      className="followup-secondary-btn"
                      onClick={() => onSnooze(item.id, 2)}
                    >
                      Snooze 2d
                    </button>

                    <button
                      type="button"
                      className="followup-danger-btn"
                      onClick={() => onCancel(item.id)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FollowUpDashboard;
