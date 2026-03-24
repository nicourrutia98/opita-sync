import test from "node:test";
import assert from "node:assert/strict";
import { diffRevision } from "../src/diff.js";
import { exportSpec } from "../src/exporters.js";
import { checkDocFidelity } from "../src/fidelity.js";
import { normalizeRequirements } from "../src/normalization.js";
import { repoRoot } from "../src/paths.js";
import { groundWithRepo } from "../src/repo-grounding.js";
import type { SpecDocument } from "../src/types.js";
import { validateSpec } from "../src/validation.js";

function makeSpec(overrides: Partial<SpecDocument> = {}): SpecDocument {
  return {
    project_name: "Translator",
    problem_statement: "Turn ambiguous briefs into implementation-ready specs.",
    target_users: ["Engineering team"],
    goals: ["Normalize input", "Validate fidelity"],
    non_goals: ["Remote hosting"],
    constraints: ["Local only"],
    assumptions: [{ text: "Repo-local build tooling is available.", impact: "low" }],
    functional_requirements: [{ id: "FR-1", statement: "Normalize briefs", priority: "must" }],
    non_functional_requirements: [
      { id: "NFR-1", statement: "Keep repo grounding read-only", category: "security" }
    ],
    domain_entities: [{ name: "Spec", fields: ["id", "status"], states: ["draft", "ready"] }],
    interfaces: [{ name: "normalize_requirements", type: "tool", input: "text", output: "json" }],
    architecture: { style: "local mcp", components: ["skill", "mcp", "context-core"], integrations: [] },
    implementation_plan: [{ phase: "phase 1", tasks: ["build mcp"], definition_of_done: ["tests pass"] }],
    acceptance_criteria: ["Detect missing fidelity coverage"],
    traceability_matrix: [
      {
        id: "RT-1",
        source_requirement: "Normalize briefs",
        technical_interpretation: "Normalize briefs",
        documentation_evidence: "covered",
        coverage_status: "cubierto",
        impact: "minor",
        action: "keep"
      }
    ],
    fidelity_report: {
      omissions: [],
      inventions: [],
      distortions: [],
      ambiguities: [],
      implementation_blockers: [],
      verdict: "listo_para_desarrollar"
    },
    open_questions: [],
    ...overrides
  };
}

test("normalizeRequirements separates requirements, constraints, non-goals, and questions", () => {
  const normalized = normalizeRequirements(
    "Quiero una app multi-tenant. Only local deployment. Out of scope: voice support. How do we package the skill?"
  );
  assert.equal(normalized.requirements.length, 1);
  assert.deepEqual(normalized.constraints, ["Only local deployment"]);
  assert.deepEqual(normalized.non_goals, ["Out of scope: voice support"]);
  assert.equal(normalized.open_questions.length, 1);
});

test("validateSpec reports missing required fields", () => {
  const validation = validateSpec({ project_name: "Incomplete" });
  assert.equal(validation.preliminary_readiness, "no_listo");
  assert(validation.missing_fields.includes("functional_requirements"));
});

test("checkDocFidelity detects omissions and inventions", () => {
  const normalized = normalizeRequirements("Need multi-tenant support. Need audit trail.");
  const fidelity = checkDocFidelity(normalized, "This system uses GraphQL and only mentions audit trail.");
  assert.equal(fidelity.verdict, "no_listo");
  assert(fidelity.omissions.some((item) => item.includes("multi-tenant")));
  assert(fidelity.inventions.includes("graphql"));
});

test("diffRevision detects removed requirements and lost acceptance criteria", () => {
  const base = makeSpec();
  const candidate = makeSpec({
    functional_requirements: [],
    acceptance_criteria: [],
    fidelity_report: {
      omissions: [],
      inventions: [],
      distortions: [],
      ambiguities: [],
      implementation_blockers: ["missing acceptance criteria"],
      verdict: "no_listo"
    }
  });
  const diff = diffRevision(base, candidate);
  assert(diff.breaking_changes.some((item) => item.includes("FR-1")));
  assert(diff.lost_coverage.some((item) => item.includes("Detect missing fidelity coverage")));
});

test("exportSpec produces markdown and yaml", () => {
  const spec = makeSpec();
  const markdown = exportSpec(spec, "markdown");
  const yaml = exportSpec(spec, "yaml");
  assert(markdown.artifact_text.includes("# Translator"));
  assert(yaml.artifact_text.includes("project_name"));
});

test("groundWithRepo finds relevant repo evidence", () => {
  const grounding = groundWithRepo(repoRoot, "codex route config");
  assert(grounding.evidence_modules.length > 0);
});
