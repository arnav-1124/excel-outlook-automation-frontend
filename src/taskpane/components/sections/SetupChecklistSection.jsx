import React from "react";

function SetupChecklistSection({
  setupChecklist,
  setupCompletedCount,
  setupTotalCount,
  setupProgressPercent,
  setupStatusText,
  isDraftReady,
}) {
  return (
    <section className={`section setup-section ${isDraftReady ? "setup-ready" : ""}`}>
      <div className="setup-top">
        <div>
          <div className="setup-kicker">Setup health</div>
          <h2 className="setup-title">{setupStatusText}</h2>
        </div>

        <div className="setup-score">
          {setupCompletedCount}/{setupTotalCount}
        </div>
      </div>

      <div className="setup-progress-track">
        <div className="setup-progress-fill" style={{ width: `${setupProgressPercent}%` }} />
      </div>

      <div className="setup-checklist">
        {setupChecklist.map((item) => (
          <div
            className={`setup-check-item ${
              item.completed ? "setup-check-complete" : "setup-check-pending"
            }`}
            key={item.key}
          >
            <div className="setup-check-icon">{item.completed ? "✓" : "•"}</div>

            <div className="setup-check-content">
              <div className="setup-check-label">{item.label}</div>

              {!item.completed && <div className="setup-check-help">{item.helpText}</div>}
            </div>
          </div>
        ))}
      </div>

      {isDraftReady && (
        <div className="setup-ready-note">
          Everything important is ready. You can generate a preview, open a draft, or create a
          follow-up reminder.
        </div>
      )}
    </section>
  );
}

export default SetupChecklistSection;
