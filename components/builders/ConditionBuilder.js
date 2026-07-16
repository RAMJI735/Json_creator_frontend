"use client";

import { useId } from "react";

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

export default function ConditionBuilder({ conditions = [], onChange, label = "Conditions", fieldOptions = [] }) {
  const uid = useId();
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

  const addCondition = () => {
    const list = [...parsed, { field: "", operator: "IS", value: "" }];
    update(list);
  };

  const removeCondition = (index) => {
    const list = parsed.filter((_, i) => i !== index);
    update(list);
  };

  const changeCondition = (index, key, val) => {
    const list = parsed.map((c, i) => (i === index ? { ...c, [key]: val } : c));
    update(list);
  };

  const datalistId = `cond-field-list-${uid}`;

  return (
    <div className="builder-section">
      <div className="builder-header">
        <span className="builder-label">{label}</span>
        <button type="button" className="mini-button" onClick={addCondition}>
          + Add Condition
        </button>
      </div>

      {parsed.length === 0 && (
        <p className="builder-empty">No conditions. Add one to control visibility.</p>
      )}

      <div className="condition-list">
        {parsed.map((cond, i) => (
          <div key={i} className="condition-row">
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
            >
              {OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <input
              className="cond-value"
              placeholder="Value"
              value={cond.value !== null && cond.value !== undefined ? cond.value : ""}
              onChange={(e) => changeCondition(i, "value", e.target.value)}
            />
            <button
              type="button"
              className="mini-button danger"
              onClick={() => removeCondition(i)}
              title="Remove condition"
            >
              ×
            </button>
          </div>
        ))}
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
