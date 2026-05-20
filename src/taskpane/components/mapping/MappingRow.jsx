import React from "react";

function MappingRow({ label, value, headers, onChange, required = false }) {
  return (
    <div className="mapping-row">
      <label className="mapping-label">
        {required && <span className="required-dot" />}
        <span>{label}</span>
      </label>

      <select
        className={`select select-compact ${required && !value ? "select-missing" : ""}`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select column...</option>

        {headers.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>
    </div>
  );
}

export default MappingRow;
