import React from "react";
import MappingRow from "../mapping/MappingRow";

function MappingSection({
  mappings,
  headers,
  mappedCount,
  totalMappingCount,
  requiredMissingCount,
  recommendedMappingFields,
  optionalMappingFields,
  activeWorkflowPreset,
  presetCompletedFields,
  showOptionalMappings,
  onToggleOptionalMappings,
  onSetMapping,
}) {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-number">03</span>
        <h2 className="section-title">Column Mapping</h2>

        <span className={`badge ${requiredMissingCount > 0 ? "badge-warn" : "badge-ok"}`}>
          {mappedCount}/{totalMappingCount}
        </span>
      </div>

      <div className="mapping-subtitle-row">
        <span>Recommended for: {activeWorkflowPreset.name}</span>
        <span>
          {presetCompletedFields.length}/{activeWorkflowPreset.recommendedFields.length} mapped
        </span>
      </div>

      <div className="mapping-grid">
        {recommendedMappingFields.map((field) => (
          <div className="mapping-row-wrap recommended-mapping" key={field.key}>
            <div className="mapping-recommend-badge">Recommended</div>

            <MappingRow
              label={field.label}
              required={field.required}
              value={mappings[field.key]}
              headers={headers}
              onChange={(value) => onSetMapping(field.key, value)}
            />
          </div>
        ))}
      </div>

      <div className="optional-mapping-header">
        <button className="btn-ghost" onClick={onToggleOptionalMappings}>
          {showOptionalMappings ? "Hide Optional Fields" : "Show Optional Fields"}
        </button>

        <span>{optionalMappingFields.length} optional</span>
      </div>

      {showOptionalMappings && (
        <div className="mapping-grid optional-mapping-grid">
          {optionalMappingFields.map((field) => (
            <div className="mapping-row-wrap" key={field.key}>
              <MappingRow
                label={field.label}
                required={field.required}
                value={mappings[field.key]}
                headers={headers}
                onChange={(value) => onSetMapping(field.key, value)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="save-note">
        <span>✓</span>
        <span>Configuration auto-saved locally</span>
      </div>
    </section>
  );
}

export default MappingSection;
