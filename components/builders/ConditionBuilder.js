"use client";

import { useId, useState } from "react";

const OPERATORS = [
  "IS",
  "EQUALS",
  "NOT_EQUALS",
  "EXISTS",
  "NOT_EXISTS",
  "CONTAINS",
  "GREATER_THAN",
  "LESS_THAN",
];

const OPERATOR_COLORS = {
  IS: "var(--accent)",
  EQUALS: "var(--accent)",
  NOT_EQUALS: "#b42318",
  EXISTS: "#2563eb",
  NOT_EXISTS: "#9333ea",
  CONTAINS: "#0891b2",
  GREATER_THAN: "#d97706",
  LESS_THAN: "#d97706",
};

const OPERATOR_LABELS = {
  IS: "is",
  EQUALS: "equals",
  NOT_EQUALS: "is not",
  EXISTS: "exists",
  NOT_EXISTS: "not exists",
  CONTAINS: "contains",
  GREATER_THAN: ">",
  LESS_THAN: "<",
};

const QUICK_PRESETS = [
  { label: "Field IS", field: "", operator: "IS", value: "" },
  { label: "Field EXISTS", field: "", operator: "EXISTS", value: "" },
  { label: "Field NOT_EXISTS", field: "", operator: "NOT_EXISTS", value: "" },
  { label: "Field CONTAINS", field: "", operator: "CONTAINS", value: "" },
  { label: "Field EQUALS", field: "", operator: "EQUALS", value: "" },
];

export default function ConditionBuilder({
  conditions = [],
  onChange,
  label = "Conditions",
  fieldOptions = [],
  compact = false,
}) {
  const uid = useId();
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showPresets, setShowPresets] = useState(false);

  const parsed = Array.isArray(conditions)
    ? conditions
    : typeof conditions === "string"
      ? safeParse(conditions)
      : conditions || [];

  const update = (list) => {
    if (Array.isArray(list)) {
      onChange(JSON.stringify(list, null, 2));
    }
  };

  const addCondition = (preset) => {
    const list = [
      ...parsed,
      { field: preset?.field || "", operator: preset?.operator || "IS", value: preset?.value || "" },
    ];
    update(list);
    setExpandedIndex(list.length - 1);
    setShowPresets(false);
  };

  const removeCondition = (index) => {
    const list = parsed.filter((_, i) => i !== index);
    update(list);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const changeCondition = (index, key, val) => {
    const list = parsed.map((c, i) => (i === index ? { ...c, [key]: val } : c));
    update(list);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const datalistId = `cond-field-list-${uid}`;
  const condCount = parsed.length;

  const formatConditionReadable = (cond) => {
    const opLabel = OPERATOR_LABELS[cond.operator] || cond.operator;
    if (cond.operator === "EXISTS" || cond.operator === "NOT_EXISTS") {
      return `${cond.field || "?"} ${opLabel}`;
    }
    return `${cond.field || "?"} ${opLabel} ${cond.value || "?"}`;
  };

  const opColor = (op) => OPERATOR_COLORS[op] || "var(--muted)";

  return (
    <div className={`builder-section condition-builder ${compact ? "compact" : ""}`}>
      <div className="builder-header">
        <span className="builder-label">{label}</span>
        <div className="builder-header-actions">
          {condCount > 0 && (
            <span className="cond-count-badge">{condCount}</span>
          )}
          <div className="add-condition-dropdown">
            <button
              type="button"
              className="mini-button"
              onClick={() => setShowPresets(!showPresets)}
              title="Add condition"
            >
              + Add Condition
            </button>
            {showPresets && (
              <div className="presets-dropdown">
                <button
                  type="button"
                  className="preset-option"
                  onClick={() => addCondition(null)}
                >
                  <span className="preset-icon">✏️</span>
                  <span>Blank condition</span>
                </button>
                <div className="presets-divider" />
                {QUICK_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    className="preset-option"
                    onClick={() => addCondition(preset)}
                  >
                    <span className="preset-icon">
                      {preset.operator === "EXISTS" && "✅"}
                      {preset.operator === "NOT_EXISTS" && "❌"}
                      {preset.operator === "IS" && "🟰"}
                      {preset.operator === "CONTAINS" && "🔍"}
                      {preset.operator === "EQUALS" && "🟰"}
                    </span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {parsed.length === 0 && (
        <p className="builder-empty">
          No conditions. Click "+ Add Condition" to add one.
        </p>
      )}

      <div className="condition-list">
        {parsed.map((cond, i) => {
          const isExpanded = expandedIndex === i;
          const readable = formatConditionReadable(cond);

          return (
            <div
              key={i}
              className={`condition-row ${isExpanded ? "expanded" : ""}`}
            >
              {/* Collapsed view — readable summary */}
              <div
                className="condition-summary"
                onClick={() => toggleExpand(i)}
              >
                <span className="cond-drag-handle">⁝⁝</span>
                <span
                  className="cond-operator-badge"
                  style={{ background: opColor(cond.operator) }}
                >
                  {cond.operator}
                </span>
                <span className="cond-readable-text">{readable}</span>
                <span className="cond-expand-icon">
                  {isExpanded ? "▲" : "▼"}
                </span>
                <button
                  type="button"
                  className="mini-button danger cond-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCondition(i);
                  }}
                  title="Remove condition"
                >
                  ×
                </button>
              </div>

              {/* Expanded view — full editor */}
              {isExpanded && (
                <div className="condition-editor">
                  <div className="cond-field-wrapper">
                    <input
                      className="cond-field"
                      placeholder="Field name"
                      list={datalistId}
                      value={cond.field || ""}
                      onChange={(e) => changeCondition(i, "field", e.target.value)}
                    />
                    <datalist id={datalistId}>
                      {fieldOptions.map((opt) => (
                        <option key={opt} value={opt} />
                      ))}
                    </datalist>
                  </div>
                  <select
                    className="cond-operator"
                    value={cond.operator || "IS"}
                    onChange={(e) => changeCondition(i, "operator", e.target.value)}
                    style={{ borderColor: opColor(cond.operator) }}
                  >
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                  {cond.operator !== "EXISTS" && cond.operator !== "NOT_EXISTS" && (
                    <input
                      className="cond-value"
                      placeholder="Value"
                      value={cond.value !== null && cond.value !== undefined ? cond.value : ""}
                      onChange={(e) => changeCondition(i, "value", e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function safeParse(str) {
  try {
    const p = JSON.parse(str);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
