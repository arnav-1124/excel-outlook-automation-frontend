import React from "react";

function WorkflowPresetSection({
  workflowPresets,
  selectedWorkflowPreset,
  onChangeWorkflowPreset,
  activeWorkflowPreset,
  presetCompletedFields,
  presetMissingFields,
  presetProgressPercent,
  getFieldLabel,
}) {
  return (
    <section className="section preset-section">
      <div className="section-header">
        <span className="section-number">01</span>
        <h2 className="section-title">Choose workflow</h2>
      </div>

      <div className="field-group">
        <label className="field-label">Workflow type</label>

        <select
          className="select"
          value={selectedWorkflowPreset}
          onChange={(e) => onChangeWorkflowPreset(e.target.value)}
        >
          {workflowPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>

        <p className="field-hint">{activeWorkflowPreset.description}</p>
      </div>

      <div className="preset-progress-row">
        <span>
          Recommended mappings: {presetCompletedFields.length}/
          {activeWorkflowPreset.recommendedFields.length}
        </span>

        <span>{presetProgressPercent}%</span>
      </div>

      <div className="preset-progress-track">
        <div className="preset-progress-fill" style={{ width: `${presetProgressPercent}%` }} />
      </div>

      <div className="preset-chip-list">
        {activeWorkflowPreset.recommendedFields.map((fieldKey) => {
          const isMapped = presetCompletedFields.includes(fieldKey);

          return (
            <span
              className={`preset-chip ${isMapped ? "preset-chip-complete" : "preset-chip-missing"}`}
              key={fieldKey}
            >
              {isMapped ? "✓" : "•"} {getFieldLabel(fieldKey)}
            </span>
          );
        })}
      </div>

      {presetMissingFields.length > 0 && (
        <div className="preset-warning">
          Missing recommended mappings:{" "}
          {presetMissingFields.map((fieldKey) => getFieldLabel(fieldKey)).join(", ")}
        </div>
      )}

      {presetMissingFields.length === 0 && (
        <div className="preset-ready-note">This workflow is ready. Next, select your source table.</div>
      )}
    </section>
  );
}

export default WorkflowPresetSection;
