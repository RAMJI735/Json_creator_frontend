"use client";

import { useId, useState } from "react";
import ConditionBuilder from "./ConditionBuilder";

export default function RouteBuilder({
  routes = [],
  onChange,
  activityNames = [],
  label = "Routes",
  fieldOptions = [],
}) {
  const uniqueId = useId();
  const [expandedRoute, setExpandedRoute] = useState(null);

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
    setExpandedRoute(list.length - 1);
  };

  const removeRoute = (index) => {
    const list = parsed.filter((_, i) => i !== index);
    update(list);
    if (expandedRoute === index) setExpandedRoute(null);
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

  const duplicateRoute = (index) => {
    const route = { ...parsed[index], Name: parsed[index].Name + " (copy)" };
    const list = [...parsed];
    list.splice(index + 1, 0, route);
    update(list);
    setExpandedRoute(index + 1);
  };

  const toggleExpand = (index) => {
    setExpandedRoute(expandedRoute === index ? null : index);
  };

  const getRouteSummary = (route) => {
    if (route.IsOtherwise) return "Fallback route";
    const condCount = Array.isArray(route.Conditions) ? route.Conditions.length : 0;
    return condCount === 0
      ? "Unconditional route"
      : `${condCount} condition${condCount !== 1 ? "s" : ""}`;
  };

  const routeCount = parsed.length;
  const conditionalCount = parsed.filter((r) => !r.IsOtherwise).length;
  const fallbackCount = parsed.filter((r) => r.IsOtherwise).length;

  return (
    <div className="builder-section route-builder">
      <div className="builder-header">
        <span className="builder-label">{label}</span>
        <div className="builder-header-actions">
          {routeCount > 0 && (
            <span className="route-stats">
              <span className="route-stat-badge conditional">
                {conditionalCount} cond.
              </span>
              {fallbackCount > 0 && (
                <span className="route-stat-badge fallback">
                  {fallbackCount} fallback
                </span>
              )}
            </span>
          )}
          <button type="button" className="mini-button" onClick={addRoute}>
            + Add Route
          </button>
        </div>
      </div>

      {parsed.length === 0 && (
        <p className="builder-empty">
          No routes defined. Add a route to navigate between sections.
        </p>
      )}

      <div className="route-list">
        {parsed.map((route, i) => {
          const isExpanded = expandedRoute === i;
          const matchingActivityIndex = activityNames.indexOf(route.ToActivity);
          const hasConditions =
            Array.isArray(route.Conditions) && route.Conditions.length > 0;

          return (
            <div
              key={i}
              className={`route-card ${isExpanded ? "expanded" : ""} ${
                route.IsOtherwise ? "fallback" : "conditional"
              }`}
            >
              {/* Collapsed view */}
              <div className="route-summary" onClick={() => toggleExpand(i)}>
                <div className="route-summary-left">
                  <span className="route-grip">⁝⁝</span>
                  <span
                    className={`route-type-badge ${
                      route.IsOtherwise ? "fallback" : "conditional"
                    }`}
                  >
                    {route.IsOtherwise ? "⤵ Fallback" : `#${i + 1}`}
                  </span>
                  <div className="route-path">
                    <span className="route-from">
                      {route.Name || "Unnamed"}
                    </span>
                    <span className="route-arrow">→</span>
                    <span
                      className={`route-to ${
                        matchingActivityIndex >= 0 ? "matched" : ""
                      }`}
                    >
                      {route.ToActivity || "?"}
                    </span>
                  </div>
                </div>
                <div className="route-summary-right">
                  {hasConditions && (
                    <span className="route-cond-indicator">
                      {route.Conditions.length} cond
                      {route.Conditions.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {route.IsOtherwise && (
                    <span className="route-otherwise-badge">Otherwise</span>
                  )}
                  <span className="route-expand-icon">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Expanded view */}
              {isExpanded && (
                <div className="route-editor">
                  <div className="route-fields">
                    <label className="mini-label">
                      Route Name
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
                          list={`route-to-${uniqueId}-${i}`}
                          value={route.ToActivity || ""}
                          onChange={(e) =>
                            changeRoute(i, "ToActivity", e.target.value)
                          }
                          placeholder="Target activity name"
                        />
                        <datalist id={`route-to-${uniqueId}-${i}`}>
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
                        onChange={(e) =>
                          changeRoute(i, "RouteActivity", e.target.value)
                        }
                        placeholder="e.g. Manual Contractor info or not"
                      />
                    </label>

                    <label className="mini-label check-inline">
                      <input
                        type="checkbox"
                        checked={Boolean(route.IsOtherwise)}
                        onChange={(e) =>
                          changeRoute(i, "IsOtherwise", e.target.checked)
                        }
                      />
                      Fallback route (when no other conditions match)
                    </label>
                  </div>

                  <div className="route-actions-row">
                    <button
                      type="button"
                      className="mini-button"
                      onClick={() => moveRoute(i, -1)}
                      disabled={i === 0}
                      title="Move up"
                    >
                      ↑ Move Up
                    </button>
                    <button
                      type="button"
                      className="mini-button"
                      onClick={() => moveRoute(i, 1)}
                      disabled={i === parsed.length - 1}
                      title="Move down"
                    >
                      ↓ Move Down
                    </button>
                    <button
                      type="button"
                      className="mini-button"
                      onClick={() => duplicateRoute(i)}
                      title="Duplicate route"
                    >
                      ⧉ Duplicate
                    </button>
                    <button
                      type="button"
                      className="mini-button danger"
                      onClick={() => removeRoute(i)}
                    >
                      × Remove
                    </button>
                  </div>

                  {!route.IsOtherwise && (
                    <ConditionBuilder
                      conditions={route.Conditions || []}
                      onChange={(json) => updateConditions(i, json)}
                      label="Route Conditions"
                      fieldOptions={fieldOptions}
                      compact={true}
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
