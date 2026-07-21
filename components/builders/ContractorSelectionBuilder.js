"use client";

import { useState } from "react";

const DEFAULT_CONTRACTOR_TYPES = [
  "Journeyman Electrician",
  "Master Electrician",
  "Tent/Temporary Sign",
];

export default function ContractorSelectionBuilder({
  contractorTypes = [],
  allowNotListedOption = false,
  allowRegisterRenewOption = false,
  onContractorTypesChange,
  onAllowNotListedOptionChange,
  onAllowRegisterRenewOptionChange,
  label = "Contractor Settings",
}) {
  const [newType, setNewType] = useState("");

  const types =
    Array.isArray(contractorTypes) && contractorTypes.length > 0
      ? contractorTypes
      : DEFAULT_CONTRACTOR_TYPES;

  const addType = () => {
    const trimmed = newType.trim();
    if (!trimmed || types.includes(trimmed)) return;
    onContractorTypesChange([...types, trimmed]);
    setNewType("");
  };

  const removeType = (index) => {
    onContractorTypesChange(types.filter((_, i) => i !== index));
  };

  const updateType = (index, value) => {
    onContractorTypesChange(
      types.map((t, i) => (i === index ? value : t))
    );
  };

  const moveType = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= types.length) return;
    const list = [...types];
    const [item] = list.splice(index, 1);
    list.splice(target, 0, item);
    onContractorTypesChange(list);
  };

  const resetToDefaults = () => {
    onContractorTypesChange([...DEFAULT_CONTRACTOR_TYPES]);
  };

  return (
    <div className="builder-section contractor-builder" style={{ backgroundColor: "#251010", padding: "10px", borderRadius: "5px" }}>
      <div className="builder-header">
        <span className="builder-label">{label}</span>
        <div className="builder-header-actions">
          <span className="cond-count-badge">{types.length} types</span>
          <button
            type="button"
            className="mini-button"
            onClick={resetToDefaults}
            title="Reset to default contractor types"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Contractor Types List */}
      <div className="contractor-types-list">
        {types.map((type, i) => (
          <div key={i} className="contractor-type-row">
            <button
              type="button"
              className="mini-button"
              onClick={() => moveType(i, -1)}
              disabled={i === 0}
              title="Move up"
              style={{backgroundColor:"black"}}
            >
              ↑
            </button>
            <button
              type="button"
              className="mini-button"
              onClick={() => moveType(i, 1)}
              disabled={i === types.length - 1}
              title="Move down"
               style={{backgroundColor:"black"}}
            >
              ↓
            </button>
            <input
            style={{ backgroundColor: "#e3a1a1", color: "#000", border: "1px solid #ccc", borderRadius: "3px", padding: "5px", marginLeft: "5px", flexGrow: 1 }}
              className="contractor-type-input"
              value={type}
              onChange={(e) => updateType(i, e.target.value)}
              placeholder="e.g. Journeyman Electrician"
            />
            <button
              type="button"
              className="mini-button danger"
              onClick={() => removeType(i)}
              title="Remove type"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add new type */}
      <div className="contractor-add-row">
        <input
          className="contractor-add-input"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addType();
            }
          }}
          placeholder="Add contractor type..."
        />
        <button
          type="button"
          className="mini-button"
          onClick={addType}
          disabled={!newType.trim()}
        >
          + Add
        </button>
      </div>

      {/* Toggle options */}
      <div className="contractor-toggles">
        <label className="mini-label check-inline">
          <input
            type="checkbox"
            checked={allowNotListedOption}
            onChange={(e) => onAllowNotListedOptionChange(e.target.checked)}
          />
          Allow "Not Listed" option (users can type custom contractor type)
        </label>

        <label className="mini-label check-inline">
          <input
            type="checkbox"
            checked={allowRegisterRenewOption}
            onChange={(e) => onAllowRegisterRenewOptionChange(e.target.checked)}
          />
          Allow Register/Renew option (users can register or renew a license)
        </label>
      </div>

      {/* Info box */}
      <div className="contractor-info-box">
        <span className="contractor-info-icon">ℹ</span>
        <span className="contractor-info-text">
          The <strong>select-contractor</strong> type shows a contractor picker. Users select from
          the listed types. Routes can check <code>CLICENSESELECTION_BUSINESS_NAME</code> to see if a
          contractor was actually selected, routing to manual entry otherwise.
        </span>
      </div>
    </div>
  );
}
