import React, { useEffect, useState } from "react";

const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Dubai",
  "Asia/Singapore",
];

function NotificationToggle({ title, description, checked, onChange, disabled }) {
  return (
    <label className={`ds-notification-toggle ${checked ? "active" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />

      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </label>
  );
}

function NotificationPreferencesPanel({ isAuthenticated, preference, isLoading, error, onSave }) {
  const [form, setForm] = useState(
    preference || {
      emailEnabled: true,
      whatsappEnabled: false,
      inAppEnabled: true,
      whatsappPhoneNumber: "",
      dailyDigestEnabled: true,
      reminderHourLocal: 9,
      timezone: "Asia/Kolkata",
    }
  );
  const [localError, setLocalError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (preference) {
      setForm(preference);
    }
  }, [preference]);

  function updateField(key, value) {
    setLocalError("");

    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSave() {
    setLocalError("");

    if (form.whatsappEnabled && !form.whatsappPhoneNumber.trim()) {
      setLocalError("Add your WhatsApp phone number before enabling WhatsApp reminders.");
      return;
    }

    const saved = await onSave({
      emailEnabled: form.emailEnabled,
      whatsappEnabled: form.whatsappEnabled,
      inAppEnabled: form.inAppEnabled,
      whatsappPhoneNumber: form.whatsappPhoneNumber.trim() || null,
      dailyDigestEnabled: form.dailyDigestEnabled,
      reminderHourLocal: Number(form.reminderHourLocal),
      timezone: form.timezone,
    });

    if (!saved) {
      setLocalError("Could not save notification preferences.");
    }
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className={`ds-notification-panel ${isExpanded ? "expanded" : "collapsed"}`}>
      <button
        className="ds-notification-panel-toggle"
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
      >
        <div>
          <div className="ds-pill">Reminder settings</div>
          <h2>Notification preferences</h2>
          <p>Email, WhatsApp, in-app reminders, digest timing, and timezone.</p>
        </div>

        <span className={`ds-notification-collapse-icon ${isExpanded ? "open" : ""}`} />
      </button>

      {!isExpanded && (
        <div className="ds-notification-mini-summary">
          <span>{form.emailEnabled ? "Email on" : "Email off"}</span>
          <span>{form.whatsappEnabled ? "WhatsApp on" : "WhatsApp off"}</span>
          <span>{String(form.reminderHourLocal).padStart(2, "0")}:00</span>
        </div>
      )}

      {isExpanded && (
        <>
          <div className="ds-notification-section">
            <div className="ds-notification-section-head">
              <span>01</span>
              <div>
                <h3>Reminder channels</h3>
                <p>These settings control automatic follow-up reminders.</p>
              </div>
            </div>

            <div className="ds-notification-toggle-grid">
              <NotificationToggle
                title="Email reminders"
                description="Send due follow-up reminders to your account email."
                checked={form.emailEnabled}
                disabled={isLoading}
                onChange={(value) => updateField("emailEnabled", value)}
              />

              <NotificationToggle
                title="In-app reminders"
                description="Keep reminder activity visible inside the Follow-up Center."
                checked={form.inAppEnabled}
                disabled={isLoading}
                onChange={(value) => updateField("inAppEnabled", value)}
              />

              <NotificationToggle
                title="WhatsApp reminders"
                description="Send WhatsApp reminders using your WhatsApp reminder credits."
                checked={form.whatsappEnabled}
                disabled={isLoading}
                onChange={(value) => updateField("whatsappEnabled", value)}
              />
            </div>
          </div>

          <div className="ds-notification-section">
            <div className="ds-notification-section-head">
              <span>02</span>
              <div>
                <h3>WhatsApp setup</h3>
                <p>This number is used only for reminders sent to you.</p>
              </div>
            </div>

            <label className="account-field">
              <span>WhatsApp phone number</span>
              <input
                type="text"
                value={form.whatsappPhoneNumber}
                disabled={isLoading}
                onChange={(event) => updateField("whatsappPhoneNumber", event.target.value)}
                placeholder="+919876543210"
              />
            </label>

            <p className="ds-notification-note">
              In production, we’ll add phone verification before sending real WhatsApp reminders.
            </p>
          </div>

          <div className="ds-notification-section">
            <div className="ds-notification-section-head">
              <span>03</span>
              <div>
                <h3>Schedule</h3>
                <p>Set when reminder checks should target your local day.</p>
              </div>
            </div>

            <div className="ds-notification-form-grid">
              <label className="account-field">
                <span>Reminder hour</span>
                <select
                  className="admin-select"
                  value={form.reminderHourLocal}
                  disabled={isLoading}
                  onChange={(event) => updateField("reminderHourLocal", Number(event.target.value))}
                >
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <option key={hour} value={hour}>
                      {String(hour).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </label>

              <label className="account-field">
                <span>Timezone</span>
                <select
                  className="admin-select"
                  value={form.timezone}
                  disabled={isLoading}
                  onChange={(event) => updateField("timezone", event.target.value)}
                >
                  {TIMEZONE_OPTIONS.map((timezone) => (
                    <option key={timezone} value={timezone}>
                      {timezone}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <NotificationToggle
              title="Daily digest"
              description="Group reminder updates into a daily summary later."
              checked={form.dailyDigestEnabled}
              disabled={isLoading}
              onChange={(value) => updateField("dailyDigestEnabled", value)}
            />
          </div>

          {(localError || error) && (
            <div className="ds-alert error ds-notification-error">{localError || error}</div>
          )}

          <div className="ds-notification-footer">
            <button
              className="ds-button-primary"
              type="button"
              disabled={isLoading}
              onClick={handleSave}
            >
              {isLoading ? "Saving preferences..." : "Save reminder settings"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default NotificationPreferencesPanel;
