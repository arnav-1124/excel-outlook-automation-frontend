import React from "react";

function ActivityLogSection({ activityLog, onClear }) {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-number">LOG</span>
        <h2 className="section-title">Recent activity</h2>

        {activityLog.length > 0 && (
          <button className="btn-ghost" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      {activityLog.length === 0 && (
        <div className="empty-state compact">
          No activity yet. Row detection, template actions, reminders, and draft creation will
          appear here.
        </div>
      )}

      {activityLog.length > 0 && (
        <div className="activity-list">
          {activityLog.map((activity) => (
            <div className="activity-item" key={activity.id}>
              <div className={`activity-dot activity-dot-${activity.type}`}>
                {activity.type === "success" && "✓"}
                {activity.type === "error" && "!"}
                {activity.type === "warning" && "⚠"}
              </div>

              <div className="activity-content">
                <div className="activity-message">{activity.message}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ActivityLogSection;
