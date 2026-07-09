"use client";

import { useEffect, useState } from "react";

const fieldTypes = [
  "text",
  "textarea",
  "email",
  "phone",
  "date",
  "radio",
  "checkbox",
  "dropdown",
  "currency",
  "calculated",
  "formattedtext",
  "parcelsearch",
  "required-user",
  "select-contractor",
  "table",
  "file",
];

const createField = () => ({
  label: "",
  name: "",
  type: "text",
  required: false,
  allowEdit: true,
  placeholder: "",
  defaultValue: "",
  optionsText: "",
  dbField: "",
  dbTable: "",
  matchedTemplateCode: "",
  minLength: "",
  maxLength: "",
  minValue: "",
  maxValue: "",
  conditionallyVisible: "[]",
  conditionallyRequired: "[]",
  formulaOutputs: "[]",
  tableLayout: '{\n  "Columns": []\n}',
});

const createActivity = () => ({
  activityName: "",
  type: "form",
  description: "",
  helpText: "",
  required: true,
  routes: "[]",
  fields: [createField()],
});

const createWorkflow = () => ({
  workflowDescription: "",
  applicationDescriptionTemplate: "",
  department: "",
  version: 1,
  isPublished: false,
  saveToDatabase: false,
  activities: [createActivity()],
});

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const examples = {
  conditions:
    '[\n  {\n    "field": "permitType",\n    "operator": "EQUALS",\n    "value": "Commercial"\n  }\n]',
  formulas:
    '[\n  {\n    "value": "250",\n    "isOtherwise": false,\n    "conditions": [\n      {\n        "field": "squareFootage",\n        "operator": "GREATER_THAN",\n        "value": 500\n      }\n    ]\n  }\n]',
  routes:
    '[\n  {\n    "Name": "Review Route",\n    "ToActivity": "Reviewer Approval",\n    "RouteActivity": "Applicant Details",\n    "IsOtherwise": false,\n    "Conditions": [\n      {\n        "field": "permitType",\n        "operator": "EQUALS",\n        "value": "Commercial"\n      }\n    ]\n  }\n]',
  tableLayout:
    '{\n  "Columns": [\n    {\n      "Label": "Name",\n      "Type": "text",\n      "Name": "Name",\n      "Required": false\n    },\n    {\n      "Label": "Hazard Type",\n      "Type": "text",\n      "Name": "HazardType",\n      "Required": false\n    }\n  ]\n}',
};

function FieldEditor({ field, index, activityIndex, onChange, onRemove }) {
  const key = (name, value) => onChange(activityIndex, index, name, value);

  return (
    <div className="card nested-card">
      <div className="row spread">
        <h4>Field {index + 1}</h4>
        <button type="button" className="ghost-button" onClick={() => onRemove(activityIndex, index)}>
          Remove Field
        </button>
      </div>

      <div className="grid">
        <label>
          Label
          <input value={field.label} onChange={(e) => key("label", e.target.value)} />
        </label>

        <label>
          Name
          <input value={field.name} onChange={(e) => key("name", e.target.value)} />
        </label>

        <label>
          Type
          <select value={field.type} onChange={(e) => key("type", e.target.value)}>
            {fieldTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Placeholder
          <input value={field.placeholder} onChange={(e) => key("placeholder", e.target.value)} />
        </label>

        <label>
          Default Value
          <input value={field.defaultValue} onChange={(e) => key("defaultValue", e.target.value)} />
        </label>

        <label>
          DB Field
          <input value={field.dbField} onChange={(e) => key("dbField", e.target.value)} />
        </label>

        <label>
          DB Table
          <input value={field.dbTable} onChange={(e) => key("dbTable", e.target.value)} />
        </label>

        <label>
          Matched Template Code
          <input
            value={field.matchedTemplateCode}
            onChange={(e) => key("matchedTemplateCode", e.target.value)}
          />
        </label>

        <label>
          Min Length
          <input value={field.minLength} onChange={(e) => key("minLength", e.target.value)} />
        </label>

        <label>
          Max Length
          <input value={field.maxLength} onChange={(e) => key("maxLength", e.target.value)} />
        </label>

        <label>
          Min Value
          <input value={field.minValue} onChange={(e) => key("minValue", e.target.value)} />
        </label>

        <label>
          Max Value
          <input value={field.maxValue} onChange={(e) => key("maxValue", e.target.value)} />
        </label>

        {field.type !== "table" ? (
          <label className="full-width">
            Options (comma separated)
            <input
              value={field.optionsText}
              onChange={(e) => key("optionsText", e.target.value)}
              placeholder="Pending, Approved, Rejected"
            />
          </label>
        ) : null}

        <label className="full-width">
          Conditionally Visible JSON
          <textarea
            value={field.conditionallyVisible}
            onChange={(e) => key("conditionallyVisible", e.target.value)}
            placeholder={examples.conditions}
          />
        </label>

        <label className="full-width">
          Conditionally Required JSON
          <textarea
            value={field.conditionallyRequired}
            onChange={(e) => key("conditionallyRequired", e.target.value)}
            placeholder={examples.conditions}
          />
        </label>

        <label className="full-width">
          Formula Outputs JSON
          <textarea
            value={field.formulaOutputs}
            onChange={(e) => key("formulaOutputs", e.target.value)}
            placeholder={examples.formulas}
          />
        </label>

        {field.type === "table" ? (
          <label className="full-width">
            Table Layout JSON
            <textarea
              value={field.tableLayout}
              onChange={(e) => key("tableLayout", e.target.value)}
              placeholder={examples.tableLayout}
            />
          </label>
        ) : null}
      </div>

      <div className="toggle-row">
        <label className="check-label">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => key("required", e.target.checked)}
          />
          Required
        </label>

        <label className="check-label">
          <input
            type="checkbox"
            checked={field.allowEdit}
            onChange={(e) => key("allowEdit", e.target.checked)}
          />
          Allow Edit
        </label>
      </div>
    </div>
  );
}

function ActivityEditor({
  activity,
  index,
  total,
  onChange,
  onAddField,
  onFieldChange,
  onFieldRemove,
  onRemove,
  onMove,
}) {
  const key = (name, value) => onChange(index, name, value);

  return (
    <section className="card activity-card">
      <div className="row spread">
        <div>
          <p className="eyebrow">Section {index + 1}</p>
          <h3>Activity / Section</h3>
        </div>
        <div className="row">
          <button type="button" className="ghost-button" onClick={() => onMove(index, -1)} disabled={index === 0}>
            Move Up
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
          >
            Move Down
          </button>
          <button type="button" className="ghost-button" onClick={() => onRemove(index)}>
            Remove Section
          </button>
        </div>
      </div>

      <div className="grid">
        <label>
          Activity Name
          <input value={activity.activityName} onChange={(e) => key("activityName", e.target.value)} />
        </label>

        <label>
          Type
          <input value={activity.type} onChange={(e) => key("type", e.target.value)} />
        </label>

        <label className="full-width">
          Description
          <textarea value={activity.description} onChange={(e) => key("description", e.target.value)} />
        </label>

        <label className="full-width">
          Help Text
          <textarea value={activity.helpText} onChange={(e) => key("helpText", e.target.value)} />
        </label>

        <label className="full-width">
          Routes JSON
          <textarea
            value={activity.routes}
            onChange={(e) => key("routes", e.target.value)}
            placeholder={examples.routes}
          />
        </label>
      </div>

      <label className="check-label">
        <input
          type="checkbox"
          checked={activity.required}
          onChange={(e) => key("required", e.target.checked)}
        />
        Required section
      </label>

      <div className="stack">
        {activity.fields.map((field, fieldIndex) => (
          <FieldEditor
            key={`${index}-${fieldIndex}`}
            field={field}
            index={fieldIndex}
            activityIndex={index}
            onChange={onFieldChange}
            onRemove={onFieldRemove}
          />
        ))}
      </div>

      <button type="button" className="secondary-button" onClick={() => onAddField(index)}>
        Add Field
      </button>
    </section>
  );
}

export default function WorkflowBuilder() {
  const [form, setForm] = useState(createWorkflow());
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const loadWorkflows = async () => {
    setListLoading(true);

    try {
      const result = await fetch(`${apiUrl}/api/workflows`, {
        cache: "no-store",
      });
      const payload = await result.json();

      if (!result.ok) {
        throw new Error(payload.message || "Failed to load workflows.");
      }

      setSavedWorkflows(payload.data || []);
      setDatabaseConnected(Boolean(payload.databaseConnected));
    } catch (requestError) {
      setDatabaseConnected(false);
      setSavedWorkflows([]);
      setError(requestError.message);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const updateWorkflow = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateActivity = (activityIndex, name, value) => {
    setForm((current) => ({
      ...current,
      activities: current.activities.map((activity, index) =>
        index === activityIndex ? { ...activity, [name]: value } : activity
      ),
    }));
  };

  const updateField = (activityIndex, fieldIndex, name, value) => {
    setForm((current) => ({
      ...current,
      activities: current.activities.map((activity, index) =>
        index === activityIndex
          ? {
              ...activity,
              fields: activity.fields.map((field, currentFieldIndex) =>
                currentFieldIndex === fieldIndex ? { ...field, [name]: value } : field
              ),
            }
          : activity
      ),
    }));
  };

  const addActivity = () => {
    setForm((current) => ({
      ...current,
      activities: [...current.activities, createActivity()],
    }));
  };

  const removeActivity = (activityIndex) => {
    setForm((current) => ({
      ...current,
      activities: current.activities.filter((_, index) => index !== activityIndex),
    }));
  };

  const moveActivity = (activityIndex, direction) => {
    setForm((current) => {
      const targetIndex = activityIndex + direction;

      if (targetIndex < 0 || targetIndex >= current.activities.length) {
        return current;
      }

      const activities = [...current.activities];
      const [item] = activities.splice(activityIndex, 1);
      activities.splice(targetIndex, 0, item);

      return {
        ...current,
        activities,
      };
    });
  };

  const addField = (activityIndex) => {
    setForm((current) => ({
      ...current,
      activities: current.activities.map((activity, index) =>
        index === activityIndex
          ? { ...activity, fields: [...activity.fields, createField()] }
          : activity
      ),
    }));
  };

  const removeField = (activityIndex, fieldIndex) => {
    setForm((current) => ({
      ...current,
      activities: current.activities.map((activity, index) =>
        index === activityIndex
          ? {
              ...activity,
              fields: activity.fields.filter((_, currentFieldIndex) => currentFieldIndex !== fieldIndex),
            }
          : activity
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await fetch(`${apiUrl}/api/workflows/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await result.json();

      if (!result.ok) {
        throw new Error(payload.message || "Request failed.");
      }

      setResponse(payload.data);
      if (payload.saved) {
        loadWorkflows();
      }
    } catch (requestError) {
      setResponse(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!response) {
      return;
    }

    const blob = new Blob([JSON.stringify(response, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "geopermit-workflow.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">GeoPermit Builder</p>
        <h1>Build sections and fields, then generate workflow JSON.</h1>
        <p className="hero-copy">
          Define each permit section as an activity, add fields, and send the structure to the backend
          for Mongoose validation and JSON generation.
        </p>
      </section>

      <div className="layout">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="card">
            <h2>Workflow Details</h2>
            <div className="grid">
              <label>
                Workflow Description
                <input
                  value={form.workflowDescription}
                  onChange={(e) => updateWorkflow("workflowDescription", e.target.value)}
                  required
                />
              </label>

              <label>
                Department
                <input value={form.department} onChange={(e) => updateWorkflow("department", e.target.value)} />
              </label>

              <label>
                Version
                <input
                  type="number"
                  min="1"
                  value={form.version}
                  onChange={(e) => updateWorkflow("version", e.target.value)}
                />
              </label>

              <label className="full-width">
                Application Description Template
                <textarea
                  value={form.applicationDescriptionTemplate}
                  onChange={(e) =>
                    updateWorkflow("applicationDescriptionTemplate", e.target.value)
                  }
                />
              </label>
            </div>

            <div className="toggle-row">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => updateWorkflow("isPublished", e.target.checked)}
                />
                Published
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  checked={form.saveToDatabase}
                  onChange={(e) => updateWorkflow("saveToDatabase", e.target.checked)}
                />
                Save to MongoDB when connected
              </label>
            </div>
          </div>

          <div className="stack">
            {form.activities.map((activity, index) => (
              <ActivityEditor
                key={index}
                activity={activity}
                index={index}
                total={form.activities.length}
                onChange={updateActivity}
                onAddField={addField}
                onFieldChange={updateField}
                onFieldRemove={removeField}
                onRemove={removeActivity}
                onMove={moveActivity}
              />
            ))}
          </div>

          <div className="actions">
            <button type="button" className="secondary-button" onClick={addActivity}>
              Add Section
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Generating..." : "Generate JSON"}
            </button>
          </div>
        </form>

        <aside className="panel output-panel">
          <div className="card">
            <div className="row spread">
              <h2>Generated JSON</h2>
              <button type="button" className="ghost-button" onClick={downloadJson} disabled={!response}>
                Download
              </button>
            </div>

            {error ? <p className="error-text">{error}</p> : null}
            <pre>{response ? JSON.stringify(response, null, 2) : "Generated workflow JSON will appear here."}</pre>
          </div>

          <div className="card">
            <div className="row spread">
              <h2>Saved Workflows</h2>
              <button type="button" className="ghost-button" onClick={loadWorkflows} disabled={listLoading}>
                {listLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <p className="status-text">
              {databaseConnected
                ? "MongoDB connected. Saved workflows are listed below."
                : "MongoDB not connected. Turn on MongoDB and enable save to database to persist workflows."}
            </p>

            <div className="saved-list">
              {savedWorkflows.length === 0 ? (
                <p className="muted-text">No saved workflows yet.</p>
              ) : (
                savedWorkflows.map((workflow) => (
                  <article key={workflow._id} className="saved-item">
                    <h3>{workflow.WorkflowDescription || workflow.workflowDescription}</h3>
                    <p>{workflow.Department || workflow.department || "No department"}</p>
                    <p>
                      Version {workflow.version} • {(workflow.isPublished || workflow.IsPublished) ? "Published" : "Draft"}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
