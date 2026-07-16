const VALID_FIELD_TYPES = [
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

const TYPES_REQUIRING_OPTIONS = ["radio", "checkbox", "dropdown"];

const VALID_OPERATORS = [
  "IS",
  "EQUALS",
  "NOT_EQUALS",
  "EXISTS",
  "NOT_EXISTS",
  "CONTAINS",
  "GREATER_THAN",
  "LESS_THAN",
];

function safeParseArray(value) {
  if (Array.isArray(value)) return value;
  try {
    const p = JSON.parse(value);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function validateCondition(condition, fieldPath, knownFieldNames = []) {
  const issues = [];
  const idx = fieldPath;

  if (!condition.field || !condition.field.trim()) {
    issues.push({ type: "error", path: `${idx}.field`, message: "Condition field name is required." });
  } else if (knownFieldNames.length > 0 && !knownFieldNames.includes(condition.field.trim())) {
    issues.push({ type: "warning", path: `${idx}.field`, message: `Condition references field "${condition.field}" which doesn't exist in the current activity's fields.` });
  }

  if (!condition.operator || !VALID_OPERATORS.includes(condition.operator)) {
    issues.push({ type: "error", path: `${idx}.operator`, message: `Invalid operator "${condition.operator}". Must be one of: ${VALID_OPERATORS.join(", ")}.` });
  }

  return issues;
}

function validateField(field, activityIndex, fieldIndex, fieldNamesInActivity) {
  const issues = [];
  const base = `Activities[${activityIndex}].Fields[${fieldIndex}]`;

  if (!field.name || !field.name.trim()) {
    issues.push({ type: "error", path: `${base}.Name`, message: `Field #${fieldIndex + 1} in Section ${activityIndex + 1}: Name is required.` });
  }

  if (field.type && !VALID_FIELD_TYPES.includes(field.type)) {
    issues.push({ type: "warning", path: `${base}.Type`, message: `Field "${field.name || `#${fieldIndex + 1}`}": "${field.type}" is not a standard field type.` });
  }

  if (TYPES_REQUIRING_OPTIONS.includes(field.type)) {
    const opts = Array.isArray(field.options) ? field.options : [];
    if (opts.length === 0) {
      issues.push({ type: "warning", path: `${base}.Options`, message: `Field "${field.name || `#${fieldIndex + 1}`}" is type "${field.type}" but has no options defined.` });
    }
  }

  // Validate conditions — check field name exists in the activity
  const visConds = safeParseArray(field.conditionallyVisible);
  visConds.forEach((c, ci) => {
    issues.push(...validateCondition(c, `${base}.ConditionallyVisible[${ci}]`, fieldNamesInActivity));
  });

  const reqConds = safeParseArray(field.conditionallyRequired);
  reqConds.forEach((c, ci) => {
    issues.push(...validateCondition(c, `${base}.ConditionallyRequired[${ci}]`, fieldNamesInActivity));
  });

  // Validate formula outputs
  const formulas = safeParseArray(field.formulaOutputs);
  formulas.forEach((f, fi) => {
    const fBase = `${base}.FormulaOutputs[${fi}]`;
    if (!f.isOtherwise && (!f.value || !String(f.value).trim())) {
      issues.push({ type: "warning", path: `${fBase}.value`, message: `Formula output #${fi + 1} in field "${field.name || `#${fieldIndex + 1}`}" has no value.` });
    }
    const conds = Array.isArray(f.conditions) ? f.conditions : [];
    conds.forEach((c, ci) => {
      issues.push(...validateCondition(c, `${fBase}.conditions[${ci}]`, fieldNamesInActivity));
    });
  });

  return issues;
}

function validateRoute(route, routeIndex, activityIndex, activityNames) {
  const issues = [];
  const base = `Activities[${activityIndex}].Routes[${routeIndex}]`;

  if (!route.Name || !route.Name.trim()) {
    issues.push({ type: "error", path: `${base}.Name`, message: `Route #${routeIndex + 1} in Section ${activityIndex + 1}: Route name is required.` });
  }

  if (!route.IsOtherwise) {
    if (!route.ToActivity || !route.ToActivity.trim()) {
      issues.push({ type: "warning", path: `${base}.ToActivity`, message: `Route "${route.Name || `#${routeIndex + 1}`}" has no target activity.` });
    } else if (activityNames.length > 0 && !activityNames.includes(route.ToActivity)) {
      issues.push({ type: "warning", path: `${base}.ToActivity`, message: `Route "${route.Name || `#${routeIndex + 1}`}" targets "${route.ToActivity}" which doesn't match any activity name.` });
    }

    const conds = Array.isArray(route.Conditions) ? route.Conditions : [];
    if (conds.length === 0) {
      issues.push({ type: "info", path: `${base}.Conditions`, message: `Route "${route.Name || `#${routeIndex + 1}`}" has no conditions.` });
    }
    conds.forEach((c, ci) => {
      issues.push(...validateCondition(c, `${base}.Conditions[${ci}]`));
    });
  }

  return issues;
}

export function validateWorkflow(formData) {
  const issues = [];

  if (!formData.workflowDescription || !formData.workflowDescription.trim()) {
    issues.push({ type: "error", path: "WorkflowDescription", message: "Workflow Description is required." });
  }

  if (!formData.activities || formData.activities.length === 0) {
    issues.push({ type: "error", path: "Activities", message: "At least one activity/section is required." });
    return issues;
  }

  const activityNames = formData.activities.map((a) => a.activityName).filter(Boolean);

  formData.activities.forEach((activity, ai) => {
    const aBase = `Activities[${ai}]`;
    const fieldNamesInActivity = (activity.fields || [])
      .map((f) => f.name)
      .filter(Boolean);

    if (!activity.activityName || !activity.activityName.trim()) {
      issues.push({ type: "error", path: `${aBase}.ActivityName`, message: `Section ${ai + 1}: Activity name is required.` });
    }

    if (activity.activityName && activityNames.filter((n) => n === activity.activityName).length > 1) {
      issues.push({ type: "warning", path: `${aBase}.ActivityName`, message: `Duplicate activity name "${activity.activityName}".` });
    }

    // Validate routes
    const routes = safeParseArray(activity.routes);
    routes.forEach((route, ri) => {
      issues.push(...validateRoute(route, ri, ai, activityNames));
    });

    // Validate fields
    if (activity.fields && activity.fields.length > 0) {
      activity.fields.forEach((field, fi) => {
        issues.push(...validateField(field, ai, fi, fieldNamesInActivity));
      });
    }
  });

  return issues;
}
