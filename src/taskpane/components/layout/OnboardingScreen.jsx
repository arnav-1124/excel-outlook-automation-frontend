import React from "react";

function OnboardingScreen({ showOnboarding, onComplete }) {
  if (!showOnboarding) return null;

  return (
    <div className="onboarding-screen">
      <div className="onboarding-hero">
        <div className="onboarding-brand-row">
          <div className="onboarding-logo">✉</div>

          <div>
            <div className="onboarding-brand">Excel Email Automation</div>
            <div className="onboarding-kicker">Premium Workflow Add-in</div>
          </div>
        </div>

        <h1 className="onboarding-title">Turn Excel rows into polished Outlook drafts.</h1>

        <p className="onboarding-subtitle">
          Select a table, map your columns, preview the selected row, apply reusable templates, and
          open email drafts without leaving your Excel workflow.
        </p>

        <div className="onboarding-action-row">
          <button className="onboarding-primary-btn" onClick={onComplete}>
            Get Started
          </button>

          <button className="onboarding-secondary-btn" onClick={onComplete}>
            Skip Intro
          </button>
        </div>
      </div>

      <div className="onboarding-flow-card">
        <div className="onboarding-flow-item">
          <span className="onboarding-flow-number">01</span>
          <div>
            <h3>Connect your Excel table</h3>
            <p>Auto-detect workbook tables and load available headers instantly.</p>
          </div>
        </div>

        <div className="onboarding-flow-line" />

        <div className="onboarding-flow-item">
          <span className="onboarding-flow-number">02</span>
          <div>
            <h3>Map your email fields</h3>
            <p>Map recipient, subject, body, status and draft tracking columns.</p>
          </div>
        </div>

        <div className="onboarding-flow-line" />

        <div className="onboarding-flow-item">
          <span className="onboarding-flow-number">03</span>
          <div>
            <h3>Use universal templates</h3>
            <p>Use placeholders from any Excel column like {"{{Customer_Name}}"}.</p>
          </div>
        </div>

        <div className="onboarding-flow-line" />

        <div className="onboarding-flow-item">
          <span className="onboarding-flow-number">04</span>
          <div>
            <h3>Create draft and update Excel</h3>
            <p>Open Outlook Web drafts and automatically update row status/date fields.</p>
          </div>
        </div>
      </div>

      <div className="onboarding-feature-grid">
        <div className="onboarding-feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Auto Sync</h3>
          <p>Refresh headers, mappings and row previews when workbook structure changes.</p>
        </div>

        <div className="onboarding-feature-card">
          <div className="feature-icon">◆</div>
          <h3>Reusable Templates</h3>
          <p>Save named templates and match them using your Template Type column.</p>
        </div>

        <div className="onboarding-feature-card">
          <div className="feature-icon">✓</div>
          <h3>Activity Tracking</h3>
          <p>Toast notifications and activity logs show exactly what changed.</p>
        </div>
      </div>

      <p className="onboarding-footer-note">
        Built for universal Excel-based email workflows — vendors, customers, teams, projects,
        reminders and follow-ups.
      </p>
    </div>
  );
}

export default OnboardingScreen;
