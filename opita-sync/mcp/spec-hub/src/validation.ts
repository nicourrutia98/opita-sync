import type { FidelityReport, SpecDocument } from "./types.js";
import { clamp } from "./utils.js";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateSpec(spec: unknown): {
  errors: string[];
  warnings: string[];
  missing_fields: string[];
  completeness_score: number;
  preliminary_readiness: FidelityReport["verdict"];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];

  if (!isObject(spec)) {
    return {
      errors: ["spec must be an object"],
      warnings: [],
      missing_fields: ["spec"],
      completeness_score: 0,
      preliminary_readiness: "no_listo"
    };
  }

  const requiredFields = [
    "project_name",
    "problem_statement",
    "goals",
    "functional_requirements",
    "acceptance_criteria",
    "traceability_matrix",
    "fidelity_report"
  ] satisfies Array<keyof SpecDocument>;

  for (const field of requiredFields) {
    const value = spec[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0)
    ) {
      missingFields.push(field);
    }
  }

  if (spec.functional_requirements !== undefined && !Array.isArray(spec.functional_requirements)) {
    errors.push("functional_requirements must be an array");
  }
  if (spec.acceptance_criteria !== undefined && !Array.isArray(spec.acceptance_criteria)) {
    errors.push("acceptance_criteria must be an array");
  }
  if (spec.fidelity_report !== undefined && !isObject(spec.fidelity_report)) {
    errors.push("fidelity_report must be an object");
  }

  const score = clamp(100 - missingFields.length * 12 - errors.length * 20, 0, 100);
  if (missingFields.length > 0) {
    warnings.push(`missing ${missingFields.length} required field(s)`);
  }

  let preliminaryReadiness: FidelityReport["verdict"] = "listo_para_desarrollar";
  if (errors.length > 0 || missingFields.length >= 3) {
    preliminaryReadiness = "no_listo";
  } else if (missingFields.length > 0) {
    preliminaryReadiness = "listo_con_reservas";
  }

  return {
    errors,
    warnings,
    missing_fields: missingFields,
    completeness_score: score,
    preliminary_readiness: preliminaryReadiness
  };
}
