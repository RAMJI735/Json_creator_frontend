"use client";

const COLUMN_TYPES = [
  "text",
  "number",
  "checkbox",
  "currency",
  "dropdown",
  "calculated",
  "date",
];

export default function TableLayoutEditor({ tableLayout = null, onChange, label = "Table Layout" }) {
  const parsed = parseLayout(tableLayout);
  const columns = extractColumns(parsed);

  const update = (cols) => {
    if (!Array.isArray(cols)) return;
    onChange(JSON.stringify({ Columns: cols }, null, 2));
  };

  const addColumn = () => {
    const list = [
      ...columns,
      { Label: "", Name: "", Type: "text", Required: false },
    ];
    update(list);
  };

  const removeColumn = (index) => {
    const list = columns.filter((_, i) => i !== index);
    update(list);
  };

  const changeColumn = (index, key, val) => {
    const list = columns.map((col, i) =>
      i === index ? { ...col, [key]: val } : col
    );
    update(list);
  };

  const moveColumn = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= columns.length) return;
    const list = [...columns];
    const [item] = list.splice(index, 1);
    list.splice(target, 0, item);
    update(list);
  };

  return (
    <div className="builder-section">
      <div className="builder-header">
        <span className="builder-label">{label}</span>
        <button type="button" className="mini-button" onClick={addColumn}>
          + Add Column
        </button>
      </div>

      {columns.length === 0 && (
        <p className="builder-empty">
          No columns defined. Add columns to define the table structure.
        </p>
      )}

      <div className="table-column-list">
        {columns.map((col, i) => (
          <div key={i} className="table-column-card">
            <div className="column-header">
              <span className="column-index">Column #{i + 1}</span>
              <div className="column-actions">
                <button
                  type="button"
                  className="mini-button"
                  onClick={() => moveColumn(i, -1)}
                  disabled={i === 0}
                  title="Move left"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="mini-button"
                  onClick={() => moveColumn(i, 1)}
                  disabled={i === columns.length - 1}
                  title="Move right"
                >
                  →
                </button>
                <button
                  type="button"
                  className="mini-button danger"
                  onClick={() => removeColumn(i)}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="column-fields">
              <label className="mini-label">
                Label
                <input
                  value={col.Label || ""}
                  onChange={(e) => changeColumn(i, "Label", e.target.value)}
                  placeholder="Column display label"
                />
              </label>

              <label className="mini-label">
                Name
                <input
                  value={col.Name || ""}
                  onChange={(e) => changeColumn(i, "Name", e.target.value)}
                  placeholder="Column field name"
                />
              </label>

              <label className="mini-label">
                Type
                <select
                  value={col.Type || "text"}
                  onChange={(e) => changeColumn(i, "Type", e.target.value)}
                >
                  {COLUMN_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mini-label check-inline">
                <input
                  type="checkbox"
                  checked={Boolean(col.Required)}
                  onChange={(e) => changeColumn(i, "Required", e.target.checked)}
                />
                Required
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function parseLayout(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === "object" && !Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(typeof value === "string" ? value : String(value));
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return parsed;
    return null;
  } catch {
    return null;
  }
}

function extractColumns(parsed) {
  if (!parsed) return [];

  // Format 1: { Columns: [...] }
  if (Array.isArray(parsed.Columns)) return parsed.Columns;

  // Format 2: bare array [...]
  if (Array.isArray(parsed)) return parsed;

  // Format 3: { Rows: [{ Cells: [...] }] } — extract headers from first row
  if (
    Array.isArray(parsed.Rows) &&
    parsed.Rows.length > 0 &&
    parsed.Rows[0].Cells
  ) {
    return parsed.Rows[0].Cells.map((cell, i) => ({
      Label: cell.StaticText || cell.Label || `Column ${i + 1}`,
      Name: cell.Entity?.Name || `col${i}`,
      Type: cell.Entity?.Type?.toLowerCase() || "text",
      Required: cell.Entity?.Required || false,
    }));
  }

  // Fallback: cannot determine columns
  return [];
}
