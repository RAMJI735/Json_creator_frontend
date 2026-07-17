"use client";

import { useId, useRef, useEffect, useState } from "react";

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
                    <FieldCombobox
                      value={cond.field || ""}
                      onChange={(val) => changeCondition(i, "field", val)}
                      options={fieldOptions}
                      placeholder="Field name"
                    />
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

/* ─── Field Combobox ─── */

function FieldCombobox({ value, onChange, options = [], placeholder }) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sync input value when prop changes externally
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Normalize options to objects with name/label
  const items = (Array.isArray(options) ? options : []).map((opt) => {
    if (typeof opt === "string") return { name: opt, label: opt, section: "" };
    return { name: opt.name || "", label: opt.label || opt.name || "", section: opt.section || "" };
  }).filter((opt) => opt.name);

  // Filter options based on input
  const filtered = items.filter((opt) => {
    const q = inputValue.toLowerCase();
    if (!q) return true;
    return (
      opt.name.toLowerCase().includes(q) ||
      opt.label.toLowerCase().includes(q)
    );
  });

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [filtered.length]);

  const selectOption = (opt) => {
    onChange(opt.name);
    setInputValue(opt.name);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    if (!open) setOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(e.key === "ArrowDown" ? 0 : filtered.length - 1);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          selectOption(filtered[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll active option into view
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = dropdownRef.current?.querySelector(`.combobox-option:nth-child(${activeIndex + 1})`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, open]);

  return (
    <div className={`field-combobox ${open ? "open" : ""}`}>
      <input
        ref={inputRef}
        className="cond-field"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (!open) setOpen(true);
        }}
        aria-expanded={open}
        aria-autocomplete="list"
        role="combobox"
      />
      <button
        type="button"
        className="combobox-toggle"
        onClick={() => {
          setOpen(!open);
          if (!open) setActiveIndex(-1);
        }}
        tabIndex={-1}
        aria-label="Toggle field dropdown"
      >
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="combobox-dropdown" ref={dropdownRef} role="listbox">
          {filtered.map((opt, idx) => (
            <div
              key={`${opt.name}-${opt.section || idx}`}
              className={`combobox-option ${idx === activeIndex ? "active" : ""} ${opt.name === inputValue ? "selected" : ""}`}
              onClick={() => selectOption(opt)}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActiveIndex(idx)}
              role="option"
              aria-selected={idx === activeIndex}
            >
              <span className="combobox-option-label">{opt.label}</span>
              <span className="combobox-option-name">
                {opt.name}
                {opt.section && <span className="combobox-option-section"> · {opt.section}</span>}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="combobox-empty">
              {inputValue ? (
                <>
                  "<strong>{inputValue}</strong>" — custom value
                </>
              ) : (
                "No fields defined yet"
              )}
            </div>
          )}
          {items.length > 0 && filtered.length > 0 && (
            <div className="combobox-footer">
              {filtered.length} of {items.length} field{items.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
