"use client";

import { useId } from "react";
import ConditionBuilder from "./ConditionBuilder";

export default function RouteBuilder({ routes = [], onChange, activityNames = [], label = "Routes", fieldOptions = [] }) {
  const uniqueId = useId();
  const parsed = Array.isArray(routes)
    ? routes
    : typeof routes === "string"
      ? safeParse(routes)
      : routes || [];

  const update = (list) => {
    if (Array.isArray(list)) {
      onChange(JSON.stringify(list, null, 2));
    }
  };

  const addRoute = () => {
    const list = [
      ...parsed,
      {
        Name: "",
        ToActivity: "",
        RouteActivity: "",
        IsOtherwise: false,
        Conditions: [],
      },
    ];
    update(list);
  };

  const removeRoute = (index) => {
    const list = parsed.filter((_, i) => i !== index);
    update(list);
  };

  const changeRoute = (index, key, val) => {
    const list = parsed.map((r, i) =>
      i === index ? { ...r, [key]: val } : r
    );
    update(list);
  };

  const updateConditions = (index, conditionsJson) => {
    const conds = safeParse(conditionsJson);
    const list = parsed.map((r, i) =>
      i === index ? { ...r, Conditions: conds } : r
    );
    update(list);
  };

  const moveRoute = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= parsed.length) return;
    const list = [...parsed];
    const [item] = list.splice(index, 1);
    list.splice(target, 0, item);
    update(list);
  };

  return (
    <div className="builder-section">
      <div className="builder-header">
        <span className="builder-label">{label}</span>
        <button type="button" className="mini-button" onClick={addRoute}>
          + Add Route
        </button>
      </div>

      {parsed.length === 0 && (
        <p className="builder-empty">No routes defined. Add a route to navigate between sections.</p>
      )}

      <div className="route-list">
        {parsed.map((route, i) => (
          <div key={i} className="route-card">
            <div className="route-header">
              <span className="route-index">Route #{i + 1}</span>
              <div className="route-actions">
                <button
                  type="button"
                  className="mini-button"
                  onClick={() => moveRoute(i, -1)}
                  disabled={i === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="mini-button"
                  onClick={() => moveRoute(i, 1)}
                  disabled={i === parsed.length - 1}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="mini-button danger"
                  onClick={() => removeRoute(i)}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="route-fields">
              <label className="mini-label">
                Name
                <input
                  value={route.Name || ""}
                  onChange={(e) => changeRoute(i, "Name", e.target.value)}
                  placeholder="e.g. Continue, Review Route"
                />
              </label>

              <label className="mini-label">
                To Activity
                <div className="input-with-suggestions">
                  <input
                    list={`route-to-${uniqueId}`}
                    value={route.ToActivity || ""}
                    onChange={(e) => changeRoute(i, "ToActivity", e.target.value)}
                    placeholder="Target activity name"
                  />
                  <datalist id={`route-to-${uniqueId}`}>
                    {activityNames.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
              </label>

              <label className="mini-label">
                Route Activity (optional)
                <input
                  value={route.RouteActivity || ""}
                  onChange={(e) => changeRoute(i, "RouteActivity", e.target.value)}
                  placeholder="e.g. Manual Contractor info or not"
                />
              </label>

              <label className="mini-label check-inline">
                <input
                  type="checkbox"
                  checked={Boolean(route.IsOtherwise)}
                  onChange={(e) => changeRoute(i, "IsOtherwise", e.target.checked)}
                />
                Otherwise (fallback/default route)
              </label>
            </div>

            {!route.IsOtherwise && (
              <ConditionBuilder
                conditions={route.Conditions || []}
                onChange={(json) => updateConditions(i, json)}
                label="Route Conditions"
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
