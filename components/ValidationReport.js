"use client";

function IssueIcon({ type }) {
  const icons = {
    error: "✗",
    warning: "⚠",
    info: "ℹ",
  };
  return <span className={`validate-icon validate-icon-${type}`}>{icons[type] || "•"}</span>;
}

export default function ValidationReport({ issues = [] }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="validate-empty">
        <span className="validate-empty-icon">✓</span>
        <p className="validate-empty-title">All checks passed!</p>
        <p className="validate-empty-hint">
          Your workflow structure looks valid. Click "Generated JSON" to view the output, or "Preview" to
          see a visual representation.
        </p>
      </div>
    );
  }

  const errors = issues.filter((i) => i.type === "error");
  const warnings = issues.filter((i) => i.type === "warning");
  const infos = issues.filter((i) => i.type === "info");

  return (
    <div className="validate-container">
      <div className="validate-summary">
        <div className="validate-stat validate-stat-error">
          <span className="validate-stat-count">{errors.length}</span>
          <span className="validate-stat-label">Errors</span>
        </div>
        <div className="validate-stat validate-stat-warning">
          <span className="validate-stat-count">{warnings.length}</span>
          <span className="validate-stat-label">Warnings</span>
        </div>
        <div className="validate-stat validate-stat-info">
          <span className="validate-stat-count">{infos.length}</span>
          <span className="validate-stat-label">Info</span>
        </div>
      </div>

      <div className="validate-list">
        {issues.map((issue, i) => (
          <div key={i} className={`validate-item validate-item-${issue.type}`}>
            <div className="validate-item-header">
              <IssueIcon type={issue.type} />
              <span className="validate-item-type">{issue.type.toUpperCase()}</span>
              <span className="validate-item-path">{issue.path}</span>
            </div>
            <p className="validate-item-message">{issue.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
