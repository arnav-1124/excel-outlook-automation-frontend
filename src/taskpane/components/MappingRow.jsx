import React from "react";

function MappingRow({
  label,
  value,
  headers,
  onChange,
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label>
        {label}
      </label>

      <br />

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        <option value="">
          Select...
        </option>

        {headers.map((header) => (
          <option
            key={header}
            value={header}
          >
            {header}
          </option>
        ))}
      </select>
    </div>
  );
}

export default MappingRow;