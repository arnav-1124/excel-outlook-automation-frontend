import React from "react";

function TemplateEditorSection({
  rowData,
  selectedNamedTemplateId,
  namedTemplates,
  selectedCloudTemplateId,
  cloudTemplates,
  isCloudTemplatesLoading,
  cloudTemplatesError,
  templateName,
  subjectTemplate,
  bodyTemplate,
  templateMissingFields,
  onLoadNamedTemplate,
  onLoadCloudTemplate,
  onRefreshCloudTemplates,
  onChangeTemplateName,
  onChangeSubjectTemplate,
  onChangeBodyTemplate,
  onSaveNamedTemplate,
  onDeleteNamedTemplate,
  onGenerateFromTemplate,
  onWriteGeneratedEmailToRow,
  onClearTemplate,
}) {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-number">TMP</span>
        <h2 className="section-title">Build message</h2>

        {rowData?.__templateApplied && <span className="badge badge-ok">Applied</span>}
      </div>

      {!rowData?.__allFields && (
        <div className="empty-state">
          Detect a selected row first. Then you can use source columns as placeholders.
        </div>
      )}

      {rowData?.__allFields && (
        <>
          {rowData?.templateType && (
            <div className="template-type-hint">
              Template Type from row: <strong>{rowData.templateType}</strong>
            </div>
          )}

          <div className="template-manager">
            <div className="template-field-group">
              <label className="field-label">Local templates</label>

              <select
                className="select"
                value={selectedNamedTemplateId}
                onChange={(e) => onLoadNamedTemplate(e.target.value)}
              >
                <option value="">Select local template...</option>

                {namedTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="template-field-group">
              <div className="template-label-row">
                <label className="field-label">Cloud templates</label>

                <button className="btn-ghost tiny" type="button" onClick={onRefreshCloudTemplates}>
                  {isCloudTemplatesLoading ? "Syncing..." : "Sync from web"}
                </button>
              </div>

              <select
                className="select"
                value={selectedCloudTemplateId || ""}
                onChange={(e) => {
                  const templateId = e.target.value;

                  console.log("[Cloud Template Dropdown] selected:", {
                    templateId,
                    cloudTemplates,
                  });

                  onLoadCloudTemplate(templateId);
                }}
                disabled={isCloudTemplatesLoading || cloudTemplates.length === 0}
              >
                <option value="">
                  {isCloudTemplatesLoading
                    ? "Loading cloud templates..."
                    : "Select cloud template..."}
                </option>

                {cloudTemplates.map((template) => (
                  <option key={String(template.id)} value={String(template.id)}>
                    {template.name}
                  </option>
                ))}
              </select>

              {cloudTemplatesError && (
                <p className="field-hint template-cloud-error">{cloudTemplatesError}</p>
              )}
            </div>

            <div className="template-field-group">
              <label className="field-label">Template Name</label>

              <input
                className="input"
                value={templateName}
                onChange={(e) => onChangeTemplateName(e.target.value)}
                placeholder="Example: Initial Follow-up"
              />
            </div>

            <div className="template-manager-actions">
              <button className="btn-outline" onClick={onSaveNamedTemplate}>
                Save Template
              </button>

              <button
                className="btn-outline danger-outline"
                onClick={onDeleteNamedTemplate}
                disabled={!selectedNamedTemplateId}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="template-field-group">
            <label className="field-label">Subject Template</label>

            <input
              className="input"
              value={subjectTemplate}
              onChange={(e) => onChangeSubjectTemplate(e.target.value)}
              placeholder="Example: Follow-up for {{Invoice_Number}}"
            />
          </div>

          <div className="template-field-group">
            <label className="field-label">Body Template</label>

            <textarea
              className="textarea"
              value={bodyTemplate}
              onChange={(e) => onChangeBodyTemplate(e.target.value)}
              rows={7}
              placeholder={`Dear {{Customer_Name}},\n\nPlease check {{Invoice_Number}}.\n\nRegards,\n{{Sender_Name}}`}
            />
          </div>

          {templateMissingFields.length > 0 && (
            <div className="template-warning">
              <strong>Missing placeholders:</strong>{" "}
              {templateMissingFields.map((field) => `{{${field}}}`).join(", ")}
            </div>
          )}

          <div className="template-actions">
            <button className="btn-primary" onClick={onGenerateFromTemplate}>
              Generate Preview From Template
            </button>

            <button
              className="btn-outline"
              onClick={onWriteGeneratedEmailToRow}
              disabled={!rowData?.__templateApplied}
            >
              Write Generated Email to Row
            </button>

            <button className="btn-outline" onClick={onClearTemplate}>
              Clear Template
            </button>
          </div>

          <p className="field-hint template-note">
            Template output only updates the preview. It does not overwrite your Excel subject/body
            cells unless you click Write Generated Email to Row.
          </p>
        </>
      )}
    </section>
  );
}

export default TemplateEditorSection;
