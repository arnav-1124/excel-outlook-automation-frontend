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

function getBucketLabel(bucket) {
  const labels = {
    dueToday: "Due today",
    overdue: "Overdue",
    upcoming: "Upcoming",
    resolved: "Resolved",
  };

  return labels[bucket] || "Follow-ups";
}

function formatDateTime(dateValue) {
  if (!dateValue) return "No time";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateValue));
  } catch {
    return "Invalid time";
  }
}

function getReminderHistoryTitle(log) {
  return (
    log.followUpItem?.referenceValue ||
    log.followUpItem?.subject ||
    log.followUpItem?.recipientEmail ||
    "Follow-up reminder"
  );
}

function getReminderStatusText(log) {
  if (log.status === "SENT") return "Sent";
  if (log.status === "SKIPPED") return "Skipped";
  if (log.status === "FAILED") return "Failed";
  if (log.status === "PENDING") return "Pending";

  return log.status;
}

function FollowUpDashboard({
  onBack,
  isAuthenticated,
  onOpenAccount,
  followUps,
  summary,
  reminderHistory = [],
  activeBucket,
  isLoading,
  isReminderHistoryLoading,
  error,
  onChangeBucket,
  onRefreshReminderHistory,
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
  onOpenCreate,
}) {
  const buckets = [
    {
      key: "dueToday",
      label: "Due today",
      count: summary?.dueToday || 0,
      icon: "!",
      help: "Needs action now",
    },
    {
      key: "overdue",
      label: "Overdue",
      count: summary?.overdue || 0,
      icon: "↯",
      help: "Past due date",
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: summary?.upcoming || 0,
      icon: "→",
      help: "Scheduled ahead",
    },
    {
      key: "resolved",
      label: "Resolved",
      count: summary?.resolved || 0,
      icon: "✓",
      help: "Closed follow-ups",
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="ds-page ds-followup-page">
        <button className="ds-back-btn" type="button" onClick={onBack}>
          ← Back to workflow
        </button>

        <section className="ds-hero ds-followup-auth-hero">
          <div className="ds-hero-content">
            <div className="ds-pill">Follow-up reminders</div>

            <h1 className="ds-title">Never let a pending reply disappear.</h1>

            <p className="ds-subtitle">
              Sign in to save follow-up tasks, track due dates, and receive email/WhatsApp reminders
              when action is needed.
            </p>

            <div className="ds-button-row">
              <button className="ds-button-primary" type="button" onClick={onOpenAccount}>
                Sign in or create account
              </button>

              <button className="ds-button-secondary" type="button" onClick={onBack}>
                Back to workflow
              </button>
            </div>
          </div>
        </section>

        <section className="ds-card padded ds-followup-auth-card">
          <div className="ds-feature-icon">⏰</div>
          <h3>Follow-ups need an account</h3>
          <p>
            Reminders are connected to your email, WhatsApp preference, credits, and saved task
            history. That’s why guests can preview the workflow, but signed-in users get tracking.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="ds-page ds-followup-page">
      <button className="ds-back-btn" type="button" onClick={onBack}>
        ← Back to workflow
      </button>

      <section className="ds-hero ds-followup-hero">
        <div className="ds-hero-content">
          <div className="ds-pill">Follow-up command center</div>

          <h1 className="ds-title">Every pending reply, under control.</h1>

          <p className="ds-subtitle">
            Track due, overdue, upcoming, and resolved follow-ups from one focused workspace — with
            reminders ready for email and WhatsApp.
          </p>

          <div className="ds-button-row">
            <button className="ds-button-primary" type="button" onClick={onOpenCreate}>
              Create follow-up
            </button>

            <button
              className="ds-button-secondary"
              type="button"
              onClick={() => {
                onChangeBucket("dueToday");

                requestAnimationFrame(() => {
                  const queuePanel = document.querySelector(".ds-dashboard-panel");

                  if (queuePanel) {
                    queuePanel.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                });
              }}
            >
              View due today
            </button>
          </div>
        </div>
      </section>

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

      <div className="ds-stat-grid ds-followup-stat-grid">
        {buckets.map((bucket) => (
          <button
            key={bucket.key}
            type="button"
            className={`ds-stat-card ds-followup-stat-card ${
              activeBucket === bucket.key ? "active" : ""
            }`}
            onClick={() => onChangeBucket(bucket.key)}
          >
            <div className="ds-stat-icon">{bucket.icon}</div>

            <div>
              <p className="ds-stat-label">{bucket.label}</p>

              <div className="ds-stat-value-row">
                <strong className="ds-stat-value">{bucket.count}</strong>
                <span className="ds-stat-help">{bucket.help}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {error && <div className="ds-alert error ds-followup-error">{error}</div>}

      <div className="ds-dashboard-grid ds-followup-dashboard-grid">
        <section className="ds-dashboard-panel">
          <div className="ds-dashboard-panel-header">
            <div>
              <p className="ds-dashboard-panel-title">{getBucketLabel(activeBucket)}</p>
              <h2 className="ds-followup-panel-heading">
                {isLoading ? "Loading follow-ups..." : "Follow-up queue"}
              </h2>
            </div>

            <button
              className="ds-button-ghost ds-followup-refresh-btn"
              type="button"
              onClick={() => onChangeBucket(activeBucket)}
            >
              Refresh
            </button>
          </div>

          <div className="ds-dashboard-panel-body">
            {!isLoading && followUps.length === 0 && (
              <div className="ds-empty-panel">No follow-ups here right now.</div>
            )}

            <div className="ds-followup-list">
              {followUps.map((item) => (
                <article className="ds-followup-task-card" key={item.id}>
                  <div className="ds-followup-task-top">
                    <div>
                      <h3>{getFollowUpTitle(item)}</h3>
                      <p>{item.subject || item.recipientEmail || "No subject added."}</p>
                    </div>

                    <span className={`ds-followup-priority ${item.priority.toLowerCase()}`}>
                      {item.priority}
                    </span>
                  </div>

                  <div className="ds-followup-task-meta">
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

                  {item.latestNote && <p className="ds-followup-note">{item.latestNote}</p>}

                  <div className="ds-followup-task-actions">
                    {item.status === "RESOLVED" ? (
                      <button
                        type="button"
                        className="ds-followup-secondary-action"
                        onClick={() => onReopen(item.id)}
                      >
                        Reopen
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="ds-followup-success-action"
                          onClick={() => onResolve(item.id)}
                        >
                          Resolve
                        </button>

                        <button
                          type="button"
                          className="ds-followup-secondary-action"
                          onClick={() => onSnooze(item.id, 2)}
                        >
                          Snooze 2d
                        </button>

                        <button
                          type="button"
                          className="ds-followup-danger-action"
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
          </div>
        </section>

        <section className="ds-dashboard-panel ds-followup-intel-panel">
          <div className="ds-dashboard-panel-header">
            <p className="ds-dashboard-panel-title">Reminder intelligence</p>
            <span className="ds-followup-live-pill">Live</span>
          </div>

          <div className="ds-dashboard-panel-body">
            <div className="ds-followup-intel-list">
              <div>
                <span>Email reminders</span>
                <strong>Ready</strong>
              </div>

              <div>
                <span>WhatsApp reminders</span>
                <strong>Credit controlled</strong>
              </div>

              <div>
                <span>Duplicate protection</span>
                <strong>Active</strong>
              </div>
            </div>

            <p className="ds-followup-intel-note">
              Follow-ups are linked to Excel row references, so the same active row cannot
              accidentally create duplicate reminder tasks.
            </p>
          </div>
        </section>

        <section className="ds-dashboard-panel ds-followup-history-panel">
          <div className="ds-dashboard-panel-header">
            <div>
              <p className="ds-dashboard-panel-title">Reminder history</p>
              <h2 className="ds-followup-panel-heading">
                {isReminderHistoryLoading ? "Loading activity..." : "Recent reminder activity"}
              </h2>
            </div>

            <button
              className="ds-button-ghost ds-followup-refresh-btn"
              type="button"
              onClick={onRefreshReminderHistory}
            >
              Refresh
            </button>
          </div>

          <div className="ds-dashboard-panel-body">
            {!isReminderHistoryLoading && reminderHistory.length === 0 && (
              <div className="ds-empty-panel">No reminder activity yet.</div>
            )}

            <div className="ds-followup-history-list">
              {reminderHistory.map((log) => (
                <article className="ds-followup-history-card" key={log.id}>
                  <div className="ds-followup-history-top">
                    <div>
                      <h3>{getReminderHistoryTitle(log)}</h3>
                      <p>{formatDateTime(log.createdAt)}</p>
                    </div>

                    <span className={`ds-reminder-status ${log.status.toLowerCase()}`}>
                      {getReminderStatusText(log)}
                    </span>
                  </div>

                  <div className="ds-followup-history-meta">
                    <div>
                      <span>Channel</span>
                      <strong>{log.channel}</strong>
                    </div>

                    <div>
                      <span>Type</span>
                      <strong>{log.reminderType}</strong>
                    </div>

                    <div>
                      <span>Recipient</span>
                      <strong>{log.recipient || "Not available"}</strong>
                    </div>
                  </div>

                  {log.errorMessage && (
                    <p className="ds-followup-history-error">{log.errorMessage}</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default FollowUpDashboard;
