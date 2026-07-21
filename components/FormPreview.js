"use client";

function safeParseArray(value) {
  if (Array.isArray(value)) return value;
  try {
    const p = JSON.parse(value);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function FieldPreview({ field, index }) {
  const typeIcon = {
    text: "Aa",
    textarea: "¶",
    email: "@",
    number: "#",
    phone: "📞",
    date: "📅",
    radio: "◉",
    checkbox: "☐",
    dropdown: "▼",
    currency: "$",
    calculated: "∑",
    formattedtext: "F",
    parcelsearch: "🔍",
    "required-user": "👤",
    "select-contractor": "👥",
    table: "⊞",
    file: "📎",
  };

  const icon = typeIcon[field.type] || "•";
  const isRequired = field.required;
  const needsOptions = field.type && ["radio", "checkbox", "dropdown"].includes(field.type);
  const options = Array.isArray(field.options) ? field.options : [];

  const visConds = safeParseArray(field.conditionallyVisible);
  const isConditional = visConds.length > 0;

  return (
    <div className={`preview-field ${isConditional ? "preview-field-conditional" : ""}`}>
      <div className="preview-field-header">
        <span className="preview-field-type">{icon}</span>
        <span className="preview-field-label">
          {field.label || field.name || `Field ${index + 1}`}
          {isRequired && <span className="preview-required">*</span>}
        </span>
        <span className="preview-field-type-label">{field.type}</span>
      </div>

      {field.placeholder && (
        <div className="preview-placeholder">{field.placeholder}</div>
      )}

      {field.type === "textarea" && (
        <div className="preview-input preview-textarea">{field.placeholder || "Text area input..."}</div>
      )}

      {field.type === "text" && (
        <div className="preview-input">{field.placeholder || "Text input..."}</div>
      )}

      {field.type === "number" && (
        <div className="preview-input">{field.placeholder || "0"}</div>
      )}

      {field.type === "email" && (
        <div className="preview-input">{field.placeholder || "email@example.com"}</div>
      )}

      {field.type === "phone" && (
        <div className="preview-input">{field.placeholder || "(555) 000-0000"}</div>
      )}

      {field.type === "date" && (
        <div className="preview-input preview-date">Pick a date {field.placeholder ? `— ${field.placeholder}` : ""}</div>
      )}

      {field.type === "currency" && (
        <div className="preview-input">$ {field.placeholder || "0.00"}</div>
      )}

      {field.type === "dropdown" && (
        <div className="preview-input preview-dropdown">
          {options.length > 0 ? options[0]?.Label || options[0]?.Value || "Select..." : "No options"}
          <span className="preview-dropdown-arrow">▼</span>
        </div>
      )}

      {field.type === "radio" && (
        <div className="preview-options">
          {options.length > 0
            ? options.map((o, oi) => (
                <label key={oi} className="preview-radio">
                  <input type="radio" name={`preview-${index}`} disabled />
                  <span>{o.Label || o.Value || `Option ${oi + 1}`}</span>
                </label>
              ))
            : <span className="preview-no-options">No options defined</span>}
        </div>
      )}

      {field.type === "checkbox" && (
        <div className="preview-options">
          {options.length > 0
            ? options.map((o, oi) => (
                <label key={oi} className="preview-checkbox">
                  <input type="checkbox" disabled />
                  <span>{o.Label || o.Value || `Option ${oi + 1}`}</span>
                </label>
              ))
            : <span className="preview-no-options">No options defined</span>}
        </div>
      )}

      {field.type === "calculated" && (
        <div className="preview-input preview-calculated">
          {field.defaultValue || field.placeholder || "Auto-calculated"}
        </div>
      )}

      {field.type === "formattedtext" && (
        <div
          className="preview-html-content"
          dangerouslySetInnerHTML={{ __html: field.htmlContent || field.defaultValue || "<em>No content</em>" }}
        />
      )}

      {field.type === "file" && (
        <div className="preview-input preview-file">Choose file...</div>
      )}

      {field.type === "table" && (
        <div className="preview-input preview-table">📋 Table layout</div>
      )}

      {field.type === "parcelsearch" && (
        <div className="preview-input preview-parcelsearch">🔍 Search parcel...</div>
      )}

      {field.type === "select-contractor" && (
        <div className="preview-contractor-container">
          <div className="preview-input preview-contractor">
            <span className="preview-contractor-icon">👥</span>
            <span className="preview-contractor-text">
              {field.contractorTypes && field.contractorTypes.length > 0
                ? `Select contractor (${field.contractorTypes.length} types available)`
                : "Select contractor..."}
            </span>
            <span className="preview-dropdown-arrow">▼</span>
          </div>
          {field.contractorTypes && field.contractorTypes.length > 0 && (
            <div className="preview-contractor-types">
              {field.contractorTypes.map((type, ti) => (
                <span key={ti} className="preview-contractor-type-chip">
                  {type}
                </span>
              ))}
            </div>
          )}
          <div className="preview-contractor-options">
            {field.allowNotListedOption && (
              <span className="preview-contractor-option-badge">+ Not Listed</span>
            )}
            {field.allowRegisterRenewOption && (
              <span className="preview-contractor-option-badge">↻ Register/Renew</span>
            )}
          </div>
        </div>
      )}

      {isConditional && (
        <div className="preview-conditional-badge">
          Conditional ({visConds.length} condition{visConds.length !== 1 ? "s" : ""})
        </div>
      )}

      {field.defaultValue && (
        <div className="preview-default">Default: {field.defaultValue}</div>
      )}
    </div>
  );
}

function PreviewStepper({ activity }) {
  return (
    <div className="preview-activity-card">
      <div className="preview-activity-header">
        <div className="preview-activity-step">
          <span className="preview-step-number">{activity._stepNumber}</span>
          <div className="preview-activity-info">
            <strong>{activity.activityName || "Untitled Section"}</strong>
            {activity.type && <span className="preview-activity-type">{activity.type}</span>}
          </div>
        </div>
        {activity.description && (
          <p className="preview-activity-desc">{activity.description}</p>
        )}
        {activity.helpText && (
          <p className="preview-activity-help">{activity.helpText}</p>
        )}
        {activity.required !== false && (
          <span className="preview-required-section">Required section</span>
        )}
      </div>
      <div className="preview-fields">
        {activity.fields && activity.fields.length > 0 ? (
          activity.fields.map((field, fi) => (
            <FieldPreview key={fi} field={field} index={fi} />
          ))
        ) : (
          <p className="preview-no-fields">No fields in this section</p>
        )}
      </div>
    </div>
  );
}

export default function FormPreview({ formData }) {
  if (!formData) {
    return (
      <div className="preview-empty">
        <span className="preview-empty-icon">📋</span>
        <p>No workflow data to preview.</p>
        <p className="preview-empty-hint">Fill in the form or click "Load Example" to see a live preview.</p>
      </div>
    );
  }

  const activities = (formData.activities || []).map((a, i) => ({
    ...a,
    _stepNumber: i + 1,
  }));

  const routes = formData.activities?.map((a, i) => ({
    activityName: a.activityName || `Section ${i + 1}`,
    rawRoutes: safeParseArray(a.routes),
  })) || [];

  if (activities.length === 0) {
    return (
      <div className="preview-empty">
        <span className="preview-empty-icon">📋</span>
        <p>No activities defined yet.</p>
      </div>
    );
  }

  return (
    <div className="preview-container">
      <div className="preview-header">
        <h3 className="preview-title">{formData.workflowDescription || "Untitled Workflow"}</h3>
        {formData.department && (
          <span className="preview-department">{formData.department}</span>
        )}
        <span className="preview-version">v{formData.version || 1}</span>
      </div>

      {/* Route flow visualization */}
      {routes.some((r) => r.rawRoutes.length > 0) && (
        <div className="preview-flow">
          <div className="preview-flow-header">Route Flow</div>
          <div className="preview-flow-diagram">
            {routes.map((route, ri) => (
              <div key={ri} className="preview-flow-step">
                <div className="preview-flow-node">{route.activityName || `Section ${ri + 1}`}</div>
                {route.rawRoutes.map((r, rri) => (
                  <div key={rri} className="preview-flow-route">
                    <span className="preview-flow-arrow">→</span>
                    <span className="preview-flow-target">
                      {r.ToActivity || "?"}
                      {r.IsOtherwise ? " (otherwise)" : ""}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form sections */}
      <div className="preview-sections">
        {activities.map((activity, ai) => (
          <PreviewStepper key={ai} activity={activity} />
        ))}
      </div>
    </div>
  );
}
