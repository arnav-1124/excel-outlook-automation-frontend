import React from "react";

function OnboardingScreen({ showOnboarding, onComplete }) {
  if (!showOnboarding) return null;

  function scrollToFeatures() {
    const featureSection = document.getElementById("onboarding-features");

    if (featureSection) {
      featureSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  return (
    <div className="onboarding-screen ds-onboarding-screen">
      <section className="ds-onboarding-shell">
        <div className="ds-onboarding-nav">
          <div className="ds-onboarding-brand-row">
            <div className="ds-onboarding-logo">✦</div>

            <div>
              <div className="ds-onboarding-brand">Spreadsheet Follow-up Assistant</div>
              <div className="ds-onboarding-brand-sub">Follow-up Automation channel</div>
            </div>
          </div>

          <button
            className="ds-button-secondary ds-onboarding-skip"
            type="button"
            onClick={onComplete}
          >
            Skip intro
          </button>
        </div>

        <div className="ds-onboarding-hero-grid">
          <div className="ds-onboarding-copy">
            <div className="ds-pill">Spreadsheet-powered follow-up creation</div>

            <h1 className="ds-title large ds-onboarding-title">Never miss another follow-up.</h1>

            <p className="ds-subtitle ds-onboarding-subtitle">
              Turn workbook rows into email drafts, tracked follow-up tasks, and email/WhatsApp
              reminders while keeping the web control center connected.
            </p>

            <div className="ds-button-row">
              <button className="ds-button-primary" type="button" onClick={onComplete}>
                Start workflow
              </button>

              <button className="ds-button-secondary" type="button" onClick={scrollToFeatures}>
                Explore add-in
              </button>
            </div>

            <div className="ds-onboarding-proof-row">
              <div>
                <strong>Guest</strong>
                <span>draft trial</span>
              </div>

              <div>
                <strong>Account</strong>
                <span>usage credits</span>
              </div>

              <div>
                <strong>WhatsApp</strong>
                <span>reminder channel</span>
              </div>
            </div>
          </div>

          <div className="ds-product-mock ds-onboarding-mock">
            <div className="ds-mock-topbar">
              <span className="ds-mock-dot" />
              <span className="ds-mock-dot" />
              <span className="ds-mock-dot" />
              <span className="ds-mock-window-title">Follow-up Command Center</span>
            </div>

            <div className="ds-mock-body">
              <div className="ds-mock-status">● Auto-tracked</div>

              <div className="ds-mock-row">
                <span className="ds-mock-label">Source row</span>
                <span className="ds-mock-value">Client renewal - Acme Services</span>
              </div>

              <div className="ds-mock-row">
                <span className="ds-mock-label">Draft</span>
                <span className="ds-mock-value">Ready to review</span>
              </div>

              <div className="ds-mock-row">
                <span className="ds-mock-label">Reminder</span>
                <span className="ds-mock-value">Due in 3 days</span>
              </div>

              <div className="ds-mock-row">
                <span className="ds-mock-label">Channels</span>
                <span className="ds-mock-value">Email + WhatsApp</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ds-onboarding-flow">
          <div className="ds-onboarding-flow-card">
            <span>01</span>
            <h3>Connect your table</h3>
            <p>Load workbook tables and detect actual source columns automatically.</p>
          </div>

          <div className="ds-onboarding-flow-card">
            <span>02</span>
            <h3>Map your workflow</h3>
            <p>Choose which columns represent recipient, subject, body, status, and references.</p>
          </div>

          <div className="ds-onboarding-flow-card">
            <span>03</span>
            <h3>Create drafts</h3>
            <p>Generate professional email drafts directly from the selected source row.</p>
          </div>

          <div className="ds-onboarding-flow-card">
            <span>04</span>
            <h3>Track follow-ups</h3>
            <p>Save due dates and receive reminders so pending replies never disappear.</p>
          </div>
        </div>

        <section className="ds-section" id="onboarding-features">
          <div className="ds-section-header">
            <div>
              <h2 className="ds-section-title">Spreadsheet workflows, connected to your control center.</h2>
              <p className="ds-section-subtitle">
                Built for professionals who already manage source data inside spreadsheets.
              </p>
            </div>
          </div>

          <div className="ds-onboarding-feature-grid">
            <article className="ds-card padded ds-onboarding-feature">
              <div className="ds-feature-icon">✉</div>
              <h3>Email draft automation</h3>
              <p>
                Convert row data into clean, reusable email drafts using templates and placeholders.
              </p>
            </article>

            <article className="ds-card padded ds-onboarding-feature">
              <div className="ds-feature-icon">⏰</div>
              <h3>Follow-up command center</h3>
              <p>
                Track due, overdue, upcoming, and resolved follow-ups from one focused dashboard.
              </p>
            </article>

            <article className="ds-card padded ds-onboarding-feature dark-feature">
              <div className="ds-feature-icon dark">◆</div>
              <h3>Reminder intelligence</h3>
              <p>
                Use email and WhatsApp reminders so the user never has to remember manually again.
              </p>
            </article>
          </div>
        </section>

        <p className="ds-onboarding-footer">
          Designed for vendors, customers, suppliers, clients, internal teams, and any
          spreadsheet-powered communication workflow.
        </p>
      </section>
    </div>
  );
}

export default OnboardingScreen;
