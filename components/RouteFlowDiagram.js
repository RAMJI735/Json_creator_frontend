"use client";

import { useState } from "react";

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

export default function RouteFlowDiagram({ formData }) {
  const activities = formData?.activities || [];
  const [collapsedSections, setCollapsedSections] = useState(new Set());

  if (activities.length === 0) {
    return (
      <div className="flow-empty">
        <p>No sections defined yet. Add sections and routes to see the flow diagram.</p>
      </div>
    );
  }

  // Parse routes for each activity
  const nodes = activities.map((act, i) => ({
    index: i,
    name: act.activityName || `Section ${i + 1}`,
    type: act.type || "form",
    routes: parseRoutes(act.routes),
    fieldCount: act.fields?.length || 0,
  }));

  // Build target map and find terminal nodes
  const targetMap = {};
  nodes.forEach((n) => {
    n.routes.forEach((r) => {
      if (r.ToActivity) {
        targetMap[r.ToActivity] = (targetMap[r.ToActivity] || 0) + 1;
      }
    });
  });

  const toggleSection = (name) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const totalRoutes = nodes.reduce((sum, n) => sum + n.routes.length, 0);

  return (
    <div className="flow-diagram">
      <div className="flow-header">
        <div className="flow-header-left">
          <span className="flow-title">Workflow Flow</span>
          <span className="flow-subtitle">
            {nodes.length} sections · {totalRoutes} routes
          </span>
        </div>
        <div className="flow-legend">
          <span className="flow-legend-item">
            <span className="flow-legend-line conditional" /> Conditional
          </span>
          <span className="flow-legend-item">
            <span className="flow-legend-line fallback" /> Fallback
          </span>
          <span className="flow-legend-item">
            <span className="flow-legend-line unconditional" /> Unconditional
          </span>
        </div>
      </div>

      <div className="flow-canvas">
        {nodes.map((node, i) => {
          const isCollapsed = collapsedSections.has(node.name);
          const isReferenced = targetMap[node.name] > 0;
          const hasRoutes = node.routes.length > 0;

          // Separate conditional and fallback routes
          const conditionalRoutes = node.routes.filter((r) => !r.IsOtherwise);
          const fallbackRoutes = node.routes.filter((r) => r.IsOtherwise);

          return (
            <div key={i} className="flow-node-group">
              {/* ─── Section Node ─── */}
              <div className="flow-node-wrapper">
                {i > 0 && <div className="flow-vertical-line" />}

                <div className="flow-node-row">
                  {/* Incoming indicator */}
                  {i > 0 && (
                    <div className="flow-incoming-dot">
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <circle cx="7" cy="7" r="4" fill="var(--accent)" opacity="0.4" />
                      </svg>
                    </div>
                  )}

                  {/* Main node card */}
                  <div
                    className={`flow-node ${getTypeClass(node.type)}`}
                    onClick={() => hasRoutes && toggleSection(node.name)}
                    style={{ cursor: hasRoutes ? "pointer" : "default" }}
                  >
                    <div className="flow-node-top">
                      <span className="flow-node-index">{i + 1}</span>
                      <span className="flow-node-type">{node.type}</span>
                      {isReferenced && (
                        <span className="flow-node-incoming" title="Has incoming routes">
                          ←
                        </span>
                      )}
                    </div>
                    <span className="flow-node-name">{node.name}</span>
                    <div className="flow-node-meta">
                      <span>{node.fieldCount} field{node.fieldCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Route branches fanning out to the right */}
                  {hasRoutes && !isCollapsed && (
                    <div className="flow-branches">
                      {/* Conditional routes */}
                      {conditionalRoutes.length > 0 && (
                        <div className="flow-branch-group">
                          <div className="flow-branch-header">
                            <span className="flow-branch-type">Routes</span>
                            <span className="flow-branch-count">{conditionalRoutes.length}</span>
                          </div>
                          <div className="flow-branch-list">
                            {conditionalRoutes.map((route, ri) => (
                              <RouteBranch
                                key={ri}
                                route={route}
                                type="conditional"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fallback routes */}
                      {fallbackRoutes.length > 0 && (
                        <div className="flow-branch-group fallback-group">
                          <div className="flow-branch-header">
                            <span className="flow-branch-type">Fallback</span>
                            <span className="flow-branch-count">{fallbackRoutes.length}</span>
                          </div>
                          <div className="flow-branch-list">
                            {fallbackRoutes.map((route, ri) => (
                              <RouteBranch
                                key={ri}
                                route={route}
                                type="fallback"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Collapsed indicator */}
                  {hasRoutes && isCollapsed && (
                    <div className="flow-collapsed-badge" onClick={() => toggleSection(node.name)}>
                      <span>{node.routes.length} route{node.routes.length !== 1 ? "s" : ""} ▲</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Terminal end marker */}
        <div className="flow-node-wrapper">
          <div className="flow-vertical-line" />
          <div className="flow-node-row">
            <div className="flow-end-marker">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="7" fill="none" stroke="var(--muted)" strokeWidth="2" />
                <circle cx="8" cy="8" r="3" fill="var(--muted)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Single Route Branch ─── */

function RouteBranch({ route, type }) {
  const [showDetails, setShowDetails] = useState(false);
  const hasConditions =
    Array.isArray(route.Conditions) && route.Conditions.length > 0;

  const formatCondition = (cond) => {
    const op = OPERATOR_LABELS[cond.operator] || cond.operator;
    if (cond.operator === "EXISTS" || cond.operator === "NOT_EXISTS") {
      return `${cond.field} ${op}`;
    }
    return `${cond.field} ${op} ${cond.value}`;
  };

  return (
    <div
      className={`flow-branch ${type}`}
      onMouseEnter={() => hasConditions && setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Branch line connector */}
      <div className="flow-branch-line">
        <div className="flow-branch-dot" />
        <div className={`flow-branch-arm ${type}`} />
      </div>

      {/* Branch content */}
      <div className="flow-branch-content">
        <div className="flow-branch-info">
          <span className="flow-branch-name">{route.Name || "Unnamed route"}</span>
          <span className="flow-branch-arrow">→</span>
          <span className="flow-branch-target">{route.ToActivity || "?"}</span>
          {hasConditions && (
            <span className="flow-branch-cond-badge">
              {route.Conditions.length} cond{route.Conditions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Condition details on hover */}
        {showDetails && hasConditions && (
          <div className="flow-branch-conditions">
            {route.Conditions.map((cond, ci) => (
              <div key={ci} className="flow-branch-condition">
                <span className="flow-cond-bullet">▸</span>
                <span>{formatCondition(cond)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function getTypeClass(type) {
  switch (type) {
    case "email": return "email-type";
    case "parcelsearch": return "parcel-type";
    case "printtemplate": return "print-type";
    case "payment": return "payment-type";
    case "callworkflow": return "call-type";
    case "complete":
    case "End": return "end-type";
    default: return "form-type";
  }
}

function parseRoutes(routes) {
  if (Array.isArray(routes)) return routes;
  if (typeof routes === "string") {
    try {
      const parsed = JSON.parse(routes);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
