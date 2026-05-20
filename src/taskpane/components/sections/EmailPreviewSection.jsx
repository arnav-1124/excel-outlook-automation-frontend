import React from "react";

function EmailPreviewSection({ rowData, renderValue }) {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-number">05</span>
        <h2 className="section-title">Email Preview</h2>
      </div>

      {!rowData && (
        <div className="empty-state">
          Email preview will appear after detecting the selected row.
        </div>
      )}

      {rowData && (
        <div className="email-preview-box">
          <div className="email-preview-row">
            <span className="email-preview-label">To</span>
            <span className="email-preview-value email-preview-to">
              {renderValue(rowData.recipientEmail)}
            </span>
          </div>

          {rowData.cc && (
            <div className="email-preview-row">
              <span className="email-preview-label">CC</span>
              <span className="email-preview-value">{renderValue(rowData.cc)}</span>
            </div>
          )}

          {rowData.bcc && (
            <div className="email-preview-row">
              <span className="email-preview-label">BCC</span>
              <span className="email-preview-value">{renderValue(rowData.bcc)}</span>
            </div>
          )}

          <div className="email-preview-row">
            <span className="email-preview-label">Subject</span>
            <span className="email-preview-value email-preview-subject">
              {renderValue(rowData.subject)}
            </span>
          </div>

          <div className="email-preview-divider" />

          <div className="email-preview-body">
            {String(rowData.body || "")
              .split("\n")
              .map((line, index) => (
                <p className="email-body-line" key={index}>
                  {line || "\u00A0"}
                </p>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default EmailPreviewSection;
