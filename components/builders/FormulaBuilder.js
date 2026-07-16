"use client";

import { useId } from "react";
import ConditionBuilder from "./ConditionBuilder";

export default function FormulaBuilder({ formulaOutputs = [], onChange, label = "Formula Outputs", fieldOptions = [] }) {
  const parsed = Array.isArray(formulaOutputs)
    ? formulaOutputs
    : typeof formulaOutputs === "string"
      ? safeParse(formulaOutputs)
      : formulaOutputs || [];

  const uid = useId();

  const update = (list) => {
    if (Array.isArray(list)) {
      onChange(JSON.stringify(list, null, 2));
    }
  };

  const addFormula = () => {
    const list = [
      ...parsed,
      { value: "", isOtherwise: false, conditions: [] },
    ];
    update(list);
  };

  const removeFormula = (index) => {
    const list = parsed.filter((_, i) => i !== index);
    update(list);
  };

  const changeFormula = (index, key, val) => {
    const list = parsed.map((f, i) =>
      i === index ? { ...f, [key]: val } : f
    );
    update(list);
  };

  const updateConditions = (index, conditionsJson) => {
    const conds = safeParse(conditionsJson);
    const list = parsed.map((f, i) =>
      i === index ? { ...f, conditions: conds } : f
    );
    update(list);
  };

  return (
    <div className="builder-section">
      <div className="builder-header">
        <span className="builder-label">{label}</span>
        <button type="button" className="mini-button" onClick={addFormula}>
          + Add Formula Output
        </button>
      </div>

      {parsed.length === 0 && (
        <p className="builder-empty">
          No formula outputs. Define what values this field should resolve to.
        </p>
      )}

      <div className="formula-list">
        {parsed.map((formula, i) => (
          <div key={i} className="formula-card">
            <div className="formula-header">
              <span className="formula-index">Output #{i + 1}</span>
              <button
                type="button"
                className="mini-button danger"
                onClick={() => removeFormula(i)}
              >
                ×
              </button>
            </div>

            <div className="formula-fields">
              <label className="mini-label">
                Value
                <input
                  value={formula.value || ""}
                  onChange={(e) => changeFormula(i, "value", e.target.value)}
                  placeholder='e.g. 250, ${OwnerName}, "Huntington"'
                  list={`formula-value-list-${uid}`}
                />
                <datalist id={`formula-value-list-${uid}`}>
                  {fieldOptions.map((opt) => (
                    <option key={opt} value={`\${${opt}}`} />
                  ))}
                </datalist>
              </label>

              <label className="mini-label check-inline">
                <input
                  type="checkbox"
                  checked={Boolean(formula.isOtherwise)}
                  onChange={(e) =>
                    changeFormula(i, "isOtherwise", e.target.checked)
                  }
                />
                Otherwise (fallback)
              </label>
            </div>

            {!formula.isOtherwise && (
              <ConditionBuilder
                conditions={formula.conditions || []}
                onChange={(json) => updateConditions(i, json)}
                label="Formula Conditions (when this output applies)"
                fieldOptions={fieldOptions}
              />
            )}
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
