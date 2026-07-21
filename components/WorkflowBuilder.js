"use client";

import { useEffect, useRef, useState } from "react";
import ConditionBuilder from "./builders/ConditionBuilder";
import OptionsBuilder from "./builders/OptionsBuilder";
import FormulaBuilder from "./builders/FormulaBuilder";
import RouteBuilder from "./builders/RouteBuilder";
import TableLayoutEditor from "./builders/TableLayoutEditor";
import ContractorSelectionBuilder from "./builders/ContractorSelectionBuilder";
import FormPreview from "./FormPreview";
import RouteFlowDiagram from "./RouteFlowDiagram";
import ValidationReport from "./ValidationReport";
import { validateWorkflow } from "../utils/workflowValidator";

const fieldTypes = [
  "text",
  "textarea",
  "email",
  "number",
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

const TYPES_WITH_OPTIONS = ["radio", "checkbox", "dropdown"];

const createField = () => ({
  label: "",
  name: "",
  type: "text",
  required: false,
  allowEdit: true,
  placeholder: "",
  defaultValue: "",
  optionsText: "",
  options: [],
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
  htmlContent: "",
  contractorTypes: [],
  allowNotListedOption: false,
  allowRegisterRenewOption: false,
});

const createActivity = () => ({
  activityName: "",
  type: "form",
  description: "",
  helpText: "",
  required: true,
  routes: "[]",
  fields: [createField()],
  // Email activity fields
  roleRecipients: "[]",
  to: "[]",
  cc: "[]",
  bcc: "[]",
  subject: "",
  body: "",
  emailFooterName: "",
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

function FieldEditor({ field, index, activityIndex, onChange, onRemove, fieldOptions = [] }) {
  const key = (name, value) => onChange(activityIndex, index, name, value);
  const htmlTextareaRef = useRef(null);

  const needsOptions = TYPES_WITH_OPTIONS.includes(field.type);
  const isContractorType = field.type === "select-contractor";

  const insertFieldVariable = (fieldName) => {
    const textarea = htmlTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const variable = `\${${fieldName}}`;
    const current = field.htmlContent || "";
    const newValue = current.substring(0, start) + variable + current.substring(end);

    key("htmlContent", newValue);

    // Restore cursor position right after the inserted variable
    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + variable.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  };

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

        {field.type !== "table" && (
          <>
            <label>
              DB Field
              <input value={field.dbField} onChange={(e) => key("dbField", e.target.value)} />
            </label>

            <label>
              DB Table
              <input value={field.dbTable} onChange={(e) => key("dbTable", e.target.value)} />
            </label>
          </>
        )}

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
      </div>

      {needsOptions && (
        <OptionsBuilder
          options={field.options}
          onChange={(opts) => {
            key("options", opts);
            key(
              "optionsText",
              opts.map((o) => o.Label || o.Value).join(", ")
            );
          }}
          label={`Options (${field.type})`}
        />
      )}

      <div className="field-builders-grid">
        <div className="field-builder-col">
          <ConditionBuilder
            conditions={field.conditionallyVisible}
            onChange={(json) => key("conditionallyVisible", json)}
            label="Conditionally Visible"
            fieldOptions={fieldOptions}
          />
        </div>
        <div className="field-builder-col">
          <ConditionBuilder
            conditions={field.conditionallyRequired}
            onChange={(json) => key("conditionallyRequired", json)}
            label="Conditionally Required"
            fieldOptions={fieldOptions}
          />
        </div>
      </div>

      <FormulaBuilder
        formulaOutputs={field.formulaOutputs}
        onChange={(json) => key("formulaOutputs", json)}
        label="Formula Outputs (calculated fields)"
        fieldOptions={fieldOptions}
      />

      {field.type === "table" && (
        <TableLayoutEditor
          tableLayout={field.tableLayout}
          onChange={(json) => key("tableLayout", json)}
        />
      )}

      {isContractorType && (
        <ContractorSelectionBuilder
          contractorTypes={field.contractorTypes}
          allowNotListedOption={field.allowNotListedOption}
          allowRegisterRenewOption={field.allowRegisterRenewOption}
          onContractorTypesChange={(types) => key("contractorTypes", types)}
          onAllowNotListedOptionChange={(val) => key("allowNotListedOption", val)}
          onAllowRegisterRenewOptionChange={(val) => key("allowRegisterRenewOption", val)}
          label="Contractor Selection Settings"
        />
      )}

      {field.type === "formattedtext" && (
        <div className="html-editor">
          <label className="html-editor-label">
            HTML Content
            <span className="html-editor-hint">Raw HTML for rich text display</span>
          </label>
          <div className="html-editor-tabs">
            <button
              type="button"
              className={`html-tab ${field._htmlTab !== "preview" ? "active" : ""}`}
              onClick={() => key("_htmlTab", "edit")}
            >
              Edit HTML
            </button>
            <button
              type="button"
              className={`html-tab ${field._htmlTab === "preview" ? "active" : ""}`}
              onClick={() => key("_htmlTab", "preview")}
            >
              Preview
            </button>
          </div>
          {field._htmlTab === "preview" ? (
            <div
              className="html-content-preview"
              dangerouslySetInnerHTML={{ __html: field.htmlContent || "<em>No HTML content yet.</em>" }}
            />
          ) : (
            <>
              {fieldOptions.length > 0 && (
                <div className="html-variable-picker">
                  <span className="html-variable-label">Insert Variable:</span>
                  <div className="html-variable-chips">
                    {fieldOptions.map((opt, idx) => {
                      const name = typeof opt === "string" ? opt : opt.name;
                      const label = typeof opt === "string" ? opt : opt.label || opt.name;
                      return (
                        <button
                          key={`vc-${name}-${idx}`}
                          type="button"
                          className="html-variable-chip"
                          onClick={() => insertFieldVariable(name)}
                          title={`Insert \${${name}} — ${label}`}
                        >
                          {'${'}{name}{'}'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <textarea
                ref={htmlTextareaRef}
                className="html-textarea"
                value={field.htmlContent}
                onChange={(e) => key("htmlContent", e.target.value)}
                placeholder={'<p>Enter HTML content here...</p>'}
                rows={6}
                spellCheck={false}
              />
            </>
          )}
        </div>
      )}

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

function safeParseArray(value) {
  if (Array.isArray(value)) return value;
  try {
    const p = JSON.parse(value);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function EmailRecipientInput({ value, onChange, label, placeholder, hint, suggestions = [] }) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const items = safeParseArray(value);

  // Filter suggestions based on input, excluding already-added items
  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !items.includes(s)
  );

  const addItem = (item) => {
    const trimmed = (item || inputValue).trim();
    if (!trimmed) return;
    const updated = [...items, trimmed];
    onChange(JSON.stringify(updated));
    setInputValue("");
    setShowSuggestions(false);
    setActiveSuggestionIdx(-1);
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(JSON.stringify(updated));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestionIdx >= 0 && activeSuggestionIdx < filteredSuggestions.length) {
        addItem(filteredSuggestions[activeSuggestionIdx]);
      } else {
        addItem();
      }
    }
    if (e.key === "Backspace" && !inputValue && items.length > 0) {
      removeItem(items.length - 1);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIdx((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIdx((prev) => (prev > 0 ? prev - 1 : -1));
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestionIdx(-1);
    }
  };

  const handleFocus = () => {
    setShowSuggestions(filteredSuggestions.length > 0);
  };

  const handleBlur = () => {
    // Delay so click on suggestion registers before hiding
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestionIdx(-1);
    }, 180);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    setActiveSuggestionIdx(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    addItem(suggestion);
  };

  return (
    <label className="email-recipient-label">
      <div className="email-recipient-header">
        <span>{label}</span>
        {hint && <span className="email-recipient-hint">{hint}</span>}
      </div>
      <div className="email-recipient-input-wrap" ref={wrapperRef}>
        <div className="email-recipient-chips">
          {items.map((item, i) => (
            <span key={i} className="email-recipient-chip">
              <span className="email-recipient-chip-text">{item}</span>
              <button
                type="button"
                className="email-recipient-chip-remove"
                onClick={() => removeItem(i)}
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
          <input
            className="email-recipient-input"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={items.length === 0 ? placeholder : "Type or pick from list..."}
          />
        </div>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="email-recipient-suggestions">
            {filteredSuggestions.map((s, i) => (
              <button
                key={s}
                type="button"
                className={`email-recipient-suggestion ${i === activeSuggestionIdx ? "active" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(s);
                }}
              >
                <span className="email-suggestion-var">{'${'}</span>
                <span>{s}</span>
                <span className="email-suggestion-close">{'}'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
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
  activityNames,
  allFieldOptions = [],
}) {
  const key = (name, value) => onChange(index, name, value);

  // Build variable suggestions (plain field names) for email recipient dropdowns
  const variableSuggestions = allFieldOptions
    .map((opt) => {
      const name = typeof opt === "string" ? opt : opt.name;
      return name;
    })
    .filter(Boolean);
  const bodyTextareaRef = useRef(null);

  const insertBodyVariable = (fieldName) => {
    const textarea = bodyTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const variable = `\${${fieldName}}`;
    const current = activity.body || "";
    const newValue = current.substring(0, start) + variable + current.substring(end);

    key("body", newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + variable.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  };

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
          <select value={activity.type} onChange={(e) => key("type", e.target.value)}>
            <option value="form">form</option>
            <option value="email">email</option>
          </select>
        </label>

        <label className="full-width">
          Description
          <textarea value={activity.description} onChange={(e) => key("description", e.target.value)} />
        </label>

        <label className="full-width">
          Help Text
          <textarea value={activity.helpText} onChange={(e) => key("helpText", e.target.value)} />
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

      {activity.type === "email" && (
        <div className="email-activity-editor">
          <h4 className="email-editor-heading">✉ Email Settings</h4>

          <div className="email-field-grid">
            <label className="full-width">
              Subject
              <input
                value={activity.subject}
                onChange={(e) => key("subject", e.target.value)}
                placeholder="Enter email subject line"
              />
            </label>

            <label className="full-width">
              Body (HTML)
              <div className="email-body-editor">
                {allFieldOptions.length > 0 && (
                  <div className="email-variable-picker">
                    <span className="html-variable-label">Insert Variable:</span>
                    <div className="html-variable-chips">
                      {allFieldOptions.map((opt, idx) => {
                        const name = typeof opt === "string" ? opt : opt.name;
                        const label = typeof opt === "string" ? opt : opt.label || opt.name;
                        return (
                          <button
                            key={`evc-${name}-${idx}`}
                            type="button"
                            className="html-variable-chip"
                            onClick={() => insertBodyVariable(name)}
                            title={`Insert \${${name}} — ${label}`}
                          >
                            {'${'}{name}{'}'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <textarea
                  ref={bodyTextareaRef}
                  className="email-body-textarea"
                  value={activity.body}
                  onChange={(e) => key("body", e.target.value)}
                  placeholder={'<p>Dear ${OwnerName},</p><br/><p>...</p>'}
                  rows={8}
                  spellCheck={false}
                />
              </div>
            </label>

            <EmailRecipientInput
              value={activity.to}
              onChange={(v) => key("to", v)}
              label="To (Recipients)"
              placeholder={'e.g. ${OwnerEmail} or email@example.com'}
              hint="Select from variables below or type custom"
              suggestions={variableSuggestions}
            />

            <EmailRecipientInput
              value={activity.cc}
              onChange={(v) => key("cc", v)}
              label="CC (Carbon Copy)"
              placeholder="Add CC recipient..."
              suggestions={variableSuggestions}
            />

            <EmailRecipientInput
              value={activity.bcc}
              onChange={(v) => key("bcc", v)}
              label="BCC (Blind Carbon Copy)"
              placeholder="Add BCC recipient..."
              suggestions={variableSuggestions}
            />



            <EmailRecipientInput
              value={activity.roleRecipients}
              onChange={(v) => key("roleRecipients", v)}
              label="Role Recipients"
              placeholder="Add role..."
              suggestions={variableSuggestions}
            />

            <label className="full-width">
              Email Footer Name
              <input
                value={activity.emailFooterName}
                onChange={(e) => key("emailFooterName", e.target.value)}
                placeholder="e.g. Building Department Footer"
              />
            </label>
          </div>
        </div>
      )}

      <RouteBuilder
        routes={activity.routes}
        onChange={(json) => key("routes", json)}
        activityNames={activityNames}
        fieldOptions={allFieldOptions}
        label="Routes (navigation paths from this section)"
      />

      <div className="stack">
        {activity.fields.map((field, fieldIndex) => (
          <FieldEditor
            key={`${index}-${fieldIndex}`}
            field={field}
            index={fieldIndex}
            activityIndex={index}
            onChange={onFieldChange}
            onRemove={onFieldRemove}
            fieldOptions={allFieldOptions}
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
  const [jsonTab, setJsonTab] = useState("generated");
  const [validationIssues, setValidationIssues] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ percent: 0, phase: "" });
  const [importReport, setImportReport] = useState(null);
  const toastTimer = useRef(null);
  const fileInputRef = useRef(null);
  const importAbortRef = useRef(false);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

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

  const loadExample = () => {
    setForm({
      ...createWorkflow(),
      workflowDescription: "Apply for a Sign Permit (example)",
      department: "Building",
      applicationDescriptionTemplate: "${PARCEL_SEARCH_ADDRESS}|${OwnerName}|${ParcelID}",
      activities: [
        {
          ...createActivity(),
          activityName: "Parcel Search",
          type: "parcelsearch",
          description: "Search and select property parcel",
          helpText: "You may search for your parcel by entering any of the following information",
          fields: [],
          routes: JSON.stringify([
            {
              Name: "Continue",
              ToActivity: "Site Information",
              Conditions: [],
            },
          ]),
        },
        {
          ...createActivity(),
          activityName: "Site Information",
          description: "Property details",
          fields: [
            {
              ...createField(),
              label: "Site Address",
              name: "SiteAddress",
              type: "text",
              required: true,
              dbField: "SiteAddress",
              dbTable: "application",
            },
            {
              ...createField(),
              label: "City",
              name: "SiteCity",
              type: "calculated",
              allowEdit: true,
              formulaOutputs: JSON.stringify([
                { value: '"Huntington"', isOtherwise: true },
              ]),
            },
            {
              ...createField(),
              label: "Owner Notice",
              name: "OwnerText",
              type: "formattedtext",
              htmlContent:
                '<p>Dear <strong>\${SiteAddress}</strong>,</p><p>The owner/Licensee assumes responsibility for compliance with the <strong>state building code</strong> and all other applicable codes.</p><p>Failure to comply may result in <em>permits being revoked</em> and additional penalties.</p><p>Contact us at <strong>\${SiteCity}</strong> permit office for more information.</p>',
              matchedTemplateCode: "OwnerText",
            },
          ],
        },
      ],
    });
    setResponse(null);
    showToast("Example workflow loaded. Customize it or generate JSON.", "info");
  };

  const handleFileImport = (event) => {
    const file = event.target.files?.[0];
    if (!file || importing) return;
    runImport(file);
    event.target.value = "";
  };

  const cancelImport = () => {
    importAbortRef.current = true;
    showToast("Import cancelled.", "info");
  };

  const yieldToUI = () => new Promise((r) => setTimeout(r, 0));

  const runImport = async (file) => {
    if (!file.name.endsWith(".json")) {
      showToast("Please select a .json file.", "error");
      return;
    }

    importAbortRef.current = false;
    let wasAborted = false;

    setImporting(true);
    setImportReport(null);
    setImportProgress({ percent: 5, phase: "Reading file..." });

    // Read file
    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result);
      reader.onerror = () => reject(new Error("Error reading file."));
      reader.readAsText(file);
    }).catch(() => null);

    if (!text) {
      setImporting(false);
      showToast("Could not read the file. Please try again.", "error");
      return;
    }

    await yieldToUI();
    setImportProgress({ percent: 20, phase: "Parsing JSON..." });
    await yieldToUI();

    let json;
    try {
      json = JSON.parse(text);
    } catch (parseError) {
      setImporting(false);
      showToast(`Invalid JSON: ${parseError.message}`, "error");
      return;
    }

    await yieldToUI();
    setImportProgress({ percent: 40, phase: "Validating structure..." });
    await yieldToUI();

    if (!json || typeof json !== "object" || Array.isArray(json)) {
      setImporting(false);
      showToast("Invalid: expected a workflow object (not an array).", "error");
      return;
    }

    const hasWorkflowDesc = Boolean(json.WorkflowDescription || json.workflowDescription);
    const hasActivities = Boolean(json.Activities || json.activities);

    if (!hasWorkflowDesc && !hasActivities) {
      setImporting(false);
      showToast("Not a GeoPermit workflow. Expected 'WorkflowDescription' and 'Activities'.", "error");
      return;
    }

    // Convert activities and load into form in small batches
    // This prevents one massive setForm from freezing the UI
    const rawActivities = json.Activities || json.activities || [];
    const total = rawActivities.length;

    // Pre-count totals for the report
    const totalRawFields = rawActivities.reduce(
      (sum, a) => sum + (Array.isArray(a.Fields || a.fields) ? (a.Fields || a.fields).length : 0),
      0
    );
    const totalRawRoutes = rawActivities.reduce(
      (sum, a) => sum + (Array.isArray(a.Routes || a.routes) ? (a.Routes || a.routes).length : 0),
      0
    );

    // Set workflow metadata first
    setForm({
      ...createWorkflow(),
      workflowDescription: json.WorkflowDescription || json.workflowDescription || "",
      applicationDescriptionTemplate: json.ApplicationDescriptionTemplate || "",
      department: json.Department || "",
      version: Number(json.version) || 1,
      isPublished: Boolean(json.isPublished || json.IsPublished),
      saveToDatabase: false,
      activities: [],
    });
    await yieldToUI();

    const BATCH_SIZE = 3;
    let fieldCount = 0;
    let routeCount = 0;
    let formulaCount = 0;
    let conditionCount = 0;

    for (let start = 0; start < total; start += BATCH_SIZE) {
      // Check for abort before each batch
      if (importAbortRef.current) {
        wasAborted = true;
        break;
      }

      const end = Math.min(start + BATCH_SIZE, total);
      const batch = [];

      for (let j = start; j < end; j++) {
        // Quick abort check per-activity for responsive cancellation
        if (importAbortRef.current) break;

        const act = rawActivities[j];
        const convertedAct = convertActivity(act);
        batch.push(convertedAct);

        // Count stats incrementally
        fieldCount += convertedAct.fields.length;
        try {
          routeCount += JSON.parse(convertedAct.routes).length;
        } catch {}

        convertedAct.fields.forEach((f) => {
          if (f.formulaOutputs !== "[]") formulaCount++;
          try {
            const vis = JSON.parse(f.conditionallyVisible);
            const req = JSON.parse(f.conditionallyRequired);
            conditionCount +=
              (Array.isArray(vis) ? vis.length : 0) +
              (Array.isArray(req) ? req.length : 0);
          } catch {}
        });
      }

      // Append this batch to the form — one small re-render per batch
      setForm((prev) => ({
        ...prev,
        activities: [...prev.activities, ...batch],
      }));

      // Update progress: 60% → 100% as batches complete
      const pct = total === 0 ? 100 : 60 + Math.round((end / total) * 40);
      setImportProgress({
        percent: Math.min(pct, 99),
        phase: `Loading section ${end} of ${total}...`,
      });

      // Yield so React renders the batch before we continue
      await yieldToUI();
    }

    if (wasAborted) {
      // Reset form to clean state
      setForm(createWorkflow());
      setResponse(null);
      setImporting(false);
      setImportProgress({ percent: 0, phase: "" });
      return;
    }

    setResponse(null);
    await yieldToUI();

    setImportProgress({ percent: 100, phase: "Import complete!" });

    const report = {
      workflowName: json.WorkflowDescription || json.workflowDescription || "Untitled",
      activities: total,
      fields: fieldCount,
      routes: routeCount,
      formulas: formulaCount,
      conditions: conditionCount,
      totalRawActivities: total,
      totalRawFields,
      totalRawRoutes,
    };

    setImportReport(report);

    setTimeout(() => {
      setImporting(false);
      setImportProgress({ percent: 0, phase: "" });

      showToast(
        `Imported "${report.workflowName}" — ${report.activities} section${report.activities !== 1 ? "s" : ""}, ${report.fields} field${report.fields !== 1 ? "s" : ""}, ${report.routes} route${report.routes !== 1 ? "s" : ""}.`,
        "success"
      );
    }, 600);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer?.files?.[0];
    if (file && !importing) {
      runImport(file);
    }
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
      setValidationIssues(null);
      setJsonTab("generated");
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
    if (!response) return;

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

  const activityNames = form.activities.map((a) => a.activityName).filter(Boolean);

  const allFieldOptions = form.activities.flatMap((activity, ai) =>
    activity.fields
      .filter((f) => f.name)
      .map((f) => ({
        name: f.name,
        label: f.label || f.name,
        section: activity.activityName || `Section ${ai + 1}`,
      }))
  );

  return (
    <main
      className={`page-shell${dragOver ? " drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <section className="hero">
        <p className="eyebrow">GeoPermit Builder</p>
        <h1>Build permit workflows visually, generate production-ready JSON.</h1>
        <p className="hero-copy">
          Define activities (sections), add fields with visual condition editors, route builders, and
          formula designers — no raw JSON required.
        </p>
        <p className="hero-hint">
          Start fresh, load an example, or drag-and-drop an existing GeoPermit JSON file to edit it visually.
        </p>
        <div className="hero-actions">
          <button type="button" className="secondary-button" onClick={loadExample}>
            Load Example
          </button>
          <button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()}>
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={handleFileImport}
          />
        </div>

        {importing && (
          <div className="import-progress">
            <div className="import-progress-header">
              <span className="import-phase">{importProgress.phase}</span>
              <span className="import-percent">{importProgress.percent}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${importProgress.percent}%` }}
              />
            </div>
            <div className="import-progress-footer">
              <button
                type="button"
                className="cancel-import-button"
                onClick={cancelImport}
              >
                Cancel Import
              </button>
            </div>
          </div>
        )}

        {importReport && !importing && (
          <div className="import-report">
            <div className="import-report-header">
              <span className="import-report-icon">✓</span>
              <span className="import-report-title">Import Complete</span>
            </div>
            <div className="import-report-stats">
              <div className="stat-item">
                <span className="stat-value">{importReport.activities}</span>
                <span className="stat-label">of {importReport.totalRawActivities} sections</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{importReport.fields}</span>
                <span className="stat-label">of {importReport.totalRawFields} fields</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{importReport.routes}</span>
                <span className="stat-label">of {importReport.totalRawRoutes} routes</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{importReport.formulas}</span>
                <span className="stat-label">formula outputs</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{importReport.conditions}</span>
                <span className="stat-label">conditions</span>
              </div>
            </div>
            <p className="import-report-name">
              {importReport.workflowName}
            </p>
          </div>
        )}
      </section>

      <div className="layout">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header-row">
              <h2>Workflow Details</h2>
              <span className="badge">{form.activities.length} section{form.activities.length !== 1 ? "s" : ""}</span>
            </div>
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
                  placeholder="${PARCEL_SEARCH_ADDRESS}|${OwnerName}|${ParcelID}"
                  rows={2}
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
                activityNames={activityNames}
                allFieldOptions={allFieldOptions}
              />
            ))}
          </div>

          <div className="actions">
            <button type="button" className="secondary-button" onClick={addActivity}>
              + Add Section
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setValidationIssues(validateWorkflow(form));
                setJsonTab("validate");
              }}
            >
              Test
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Generating..." : "Generate JSON"}
            </button>
          </div>
        </form>

        <aside className="panel output-panel">
          <div className="card">
            <div className="row spread">
              <h2>Output</h2>
              <button type="button" className="ghost-button" onClick={downloadJson} disabled={!response}>
                Download
              </button>
            </div>

            <div className="output-tabs">
              <button
                type="button"
                className={`output-tab ${jsonTab === "generated" ? "active" : ""}`}
                onClick={() => setJsonTab("generated")}
              >
                Generated JSON
              </button>
              <button
                type="button"
                className={`output-tab ${jsonTab === "formdata" ? "active" : ""}`}
                onClick={() => setJsonTab("formdata")}
              >
                Current Data
              </button>
              <button
                type="button"
                className={`output-tab ${jsonTab === "validate" ? "active" : ""}`}
                onClick={() => {
                  setJsonTab("validate");
                  setValidationIssues(validateWorkflow(form));
                }}
              >
                Validate
              </button>
              <button
                type="button"
                className={`output-tab ${jsonTab === "flow" ? "active" : ""}`}
                onClick={() => setJsonTab("flow")}
              >
                Flow
              </button>
              <button
                type="button"
                className={`output-tab ${jsonTab === "preview" ? "active" : ""}`}
                onClick={() => setJsonTab("preview")}
              >
                Preview
              </button>
            </div>

            {error ? <p className="error-text">{error}</p> : null}

            {jsonTab === "validate" ? (
              <ValidationReport issues={validationIssues || []} />
            ) : jsonTab === "flow" ? (
              <RouteFlowDiagram formData={form} />
            ) : jsonTab === "preview" ? (
              <FormPreview formData={form} />
            ) : (
              <pre className="json-output">
                {jsonTab === "generated"
                  ? response
                    ? JSON.stringify(response, null, 2)
                    : "Click \"Generate JSON\" to build your workflow.\nOr click \"Load Example\" above to start with a sample."
                  : JSON.stringify(form, null, 2)}
              </pre>
            )}
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

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" && "✓"}
            {toast.type === "error" && "✗"}
            {toast.type === "info" && "ℹ"}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button type="button" className="toast-close" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}

      {dragOver && (
        <div className="drop-overlay">
          <div className="drop-content">
            <span className="drop-icon">📄</span>
            <h2>Drop your GeoPermit JSON here</h2>
            <p>File will be parsed and loaded into the visual editor</p>
          </div>
        </div>
      )}
    </main>
  );
}

function convertCondition(c) {
  return {
    field: c.Field || c.field || "",
    operator: c.Operator || c.operator || "IS",
    value: c.Value ?? c.value ?? "",
  };
}

function convertFormulaOutput(fo) {
  return {
    value: fo.Value ?? fo.value ?? "",
    isOtherwise: Boolean(fo.IsOtherwise || fo.isOtherwise),
    conditions: Array.isArray(fo.Conditions || fo.conditions)
      ? (fo.Conditions || fo.conditions).map(convertCondition)
      : [],
  };
}

function convertField(f) {
  return {
    label: f.Label || "",
    name: f.Name || "",
    type: (f.Type || "text").toLowerCase(),
    required: Boolean(f.Required),
    allowEdit: f.AllowEdit !== false,
    placeholder: f.Placeholder || "",
    defaultValue: f.Content ?? "",
    optionsText: (f.Options || []).map((o) => o.Label || o.Value).join(", "),
    options: f.Options || [],
    dbField: f.DBField || "",
    dbTable: f.DBTable || "",
    matchedTemplateCode: f.MatchedTemplateCode || "",
    minLength: f.MinLength ?? "",
    maxLength: f.MaxLength ?? "",
    minValue: f.MinValue ?? "",
    maxValue: f.MaxValue ?? "",
    conditionallyVisible: JSON.stringify((f.ConditionallyVisible || []).map(convertCondition), null, 2),
    conditionallyRequired: JSON.stringify((f.ConditionallyRequired || []).map(convertCondition), null, 2),
    formulaOutputs: JSON.stringify((f.FormulaOutputs || []).map(convertFormulaOutput), null, 2),
    tableLayout: JSON.stringify(f.TableLayout || { Columns: [] }, null, 2),
    htmlContent: f.HTMLContent || f.htmlContent || "",
    contractorTypes: f.ContractorTypes || f.contractorTypes || [],
    allowNotListedOption: f.AllowNotListedOption ?? f.allowNotListedOption ?? false,
    allowRegisterRenewOption: f.AllowRegisterRenewOption ?? f.allowRegisterRenewOption ?? false,
    _htmlTab: "edit",
  };
}

function convertRoute(route) {
  return {
    Name: route.Name || route.name || "",
    ToActivity: route.ToActivity || route.toActivity || "",
    RouteActivity: route.RouteActivity || route.routeActivity || "",
    IsOtherwise: Boolean(route.IsOtherwise || route.isOtherwise),
    Conditions: Array.isArray(route.Conditions || route.conditions)
      ? (route.Conditions || route.conditions).map(convertCondition)
      : [],
  };
}

function convertActivity(act) {
  return {
    activityName: act.ActivityName || "",
    type: act.Type || "form",
    description: act.Description || "",
    helpText: act.HelpText || "",
    required: act.Required !== false,
    routes: JSON.stringify((act.Routes || []).map(convertRoute), null, 2),
    fields: (act.Fields || []).map((f) => convertField(f)),
    // Email activity properties
    roleRecipients: JSON.stringify(act.RoleRecipients || [], null, 2),
    to: JSON.stringify(act.To || [], null, 2),
    cc: JSON.stringify(act.CC || [], null, 2),
    bcc: JSON.stringify(act.BCC || [], null, 2),
    subject: act.Subject || "",
    body: act.Body || "",
    emailFooterName: act.EmailFooterName || "",
  };
}
