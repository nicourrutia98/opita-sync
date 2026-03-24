import type { SpecDocument } from "./types.js";
import { toYaml } from "./yaml.js";

export function exportSpec(spec: SpecDocument, format: "markdown" | "json" | "yaml"): {
  artifact_text: string;
  metadata: { format: string; generated_at: string };
  warnings: string[];
} {
  const metadata = {
    format,
    generated_at: new Date().toISOString()
  };

  if (format === "json") {
    return {
      artifact_text: JSON.stringify(spec, null, 2),
      metadata,
      warnings: []
    };
  }

  if (format === "yaml") {
    return {
      artifact_text: toYaml(spec),
      metadata,
      warnings: []
    };
  }

  const markdown = [
    `# ${spec.project_name}`,
    "",
    "## Problem Statement",
    spec.problem_statement,
    "",
    "## Goals",
    ...spec.goals.map((goal) => `- ${goal}`),
    "",
    "## Functional Requirements",
    ...spec.functional_requirements.map((item) => `- ${item.id}: ${item.statement}`),
    "",
    "## Acceptance Criteria",
    ...spec.acceptance_criteria.map((criterion) => `- ${criterion}`),
    "",
    "## Fidelity Verdict",
    `- ${spec.fidelity_report.verdict}`
  ].join("\n");

  return {
    artifact_text: markdown,
    metadata,
    warnings: []
  };
}
