"use client";

export default function OptionsBuilder({ options = [], onChange, label = "Options" }) {
  const parsed = Array.isArray(options)
    ? options
    : typeof options === "string"
      ? safeParse(options)
      : [];

  const update = (list) => {
    if (Array.isArray(list)) {
      onChange(list);
    }
  };

  const addItem = () => {
    const list = [...parsed, { Label: "", Value: "" }];
    update(list);
  };

  const removeItem = (index) => {
    const list = parsed.filter((_, i) => i !== index);
    update(list);
  };

  const changeItem = (index, key, val) => {
    const list = parsed.map((item, i) =>
      i === index ? { ...item, [key]: val } : item
    );
    update(list);
  };

  return (
    <div className="builder-section">
      <div className="builder-header">
        <span className="builder-label">{label}</span>
        <button type="button" className="mini-button" onClick={addItem}>
          + Add Option
        </button>
      </div>

      {parsed.length === 0 && (
        <p className="builder-empty">No options defined.</p>
      )}

      <div className="options-list">
        {parsed.map((item, i) => (
          <div key={i} className="option-row">
            <input
              className="opt-label"
              placeholder="Label (display text)"
              value={item.Label || ""}
              onChange={(e) => changeItem(i, "Label", e.target.value)}
            />
            <input
              className="opt-value"
              placeholder="Value (stored value)"
              value={item.Value ?? ""}
              onChange={(e) => changeItem(i, "Value", e.target.value)}
            />
            <button
              type="button"
              className="mini-button danger"
              onClick={() => removeItem(i)}
              title="Remove option"
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
