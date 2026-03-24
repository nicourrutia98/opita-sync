import type { NormalizedRequirements, SpecDocument, TraceabilityEntry, Verdict } from "./types.js";
import { scoreOverlap } from "./utils.js";

const inventionTerms = [
  "graphql",
  "kafka",
  "event sourcing",
  "blockchain",
  "voice",
  "fine-tuning",
  "microservices",
  "streamable http"
];

const vagueTerms = ["fast", "simple", "scalable", "robust", "user-friendly", "rapido", "escalable"];

export function checkDocFidelity(
  normalized: NormalizedRequirements,
  generatedDocumentation: string,
  spec?: SpecDocument
): {
  traceability_matrix: TraceabilityEntry[];
  omissions: string[];
  inventions: string[];
  distortions: string[];
  ambiguities: string[];
  implementation_blockers: string[];
  verdict: Verdict;
  recommended_corrections: string[];
} {
  const combinedDocumentation = `${generatedDocumentation}\n${spec ? JSON.stringify(spec) : ""}`.toLowerCase();
  const traceability: TraceabilityEntry[] = [];
  const omissions: string[] = [];
  const distortions: string[] = [];
  const ambiguities: string[] = [];

  normalized.requirements.forEach((requirement, index) => {
    const overlap = scoreOverlap(requirement.statement, combinedDocumentation);
    let coverage: TraceabilityEntry["coverage_status"] = "no_cubierto";
    if (overlap >= 0.6) {
      coverage = "cubierto";
    } else if (overlap >= 0.3) {
      coverage = "parcialmente_cubierto";
    }

    if (coverage === "no_cubierto") {
      omissions.push(requirement.statement);
    }

    if (/multi-tenant/i.test(requirement.statement) && /workspace/i.test(combinedDocumentation) && !/tenant/i.test(combinedDocumentation)) {
      distortions.push("multi-tenant was reduced to workspace language without tenant isolation");
      coverage = "contradicho";
    }

    traceability.push({
      id: `RT-${index + 1}`,
      source_requirement: requirement.statement,
      technical_interpretation: requirement.statement,
      documentation_evidence: coverage === "no_cubierto" ? "" : "matched in generated documentation",
      coverage_status: coverage,
      impact: coverage === "cubierto" ? "minor" : "critical",
      action: coverage === "cubierto" ? "keep" : "add explicit implementation detail"
    });
  });

  const inventions = inventionTerms.filter((term) => combinedDocumentation.includes(term) && !normalized.source_text.toLowerCase().includes(term));

  for (const term of vagueTerms) {
    if (combinedDocumentation.includes(term) && !/\b\d+(ms|s|users|req|requests|ops|%|seconds?)\b/i.test(combinedDocumentation)) {
      ambiguities.push(`vague term without measurable criteria: ${term}`);
    }
  }

  const implementationBlockers: string[] = [];
  if (omissions.length > 0) {
    implementationBlockers.push("missing source requirements in generated documentation");
  }
  if (ambiguities.length > 0) {
    implementationBlockers.push("documentation still contains ambiguous language");
  }
  if (spec && spec.acceptance_criteria.length === 0) {
    implementationBlockers.push("spec has no acceptance criteria");
  }

  let verdict: Verdict = "listo_para_desarrollar";
  if (implementationBlockers.length > 0 || distortions.length > 0) {
    verdict = "no_listo";
  } else if (inventions.length > 0) {
    verdict = "listo_con_reservas";
  }

  return {
    traceability_matrix: traceability,
    omissions,
    inventions,
    distortions,
    ambiguities,
    implementation_blockers: implementationBlockers,
    verdict,
    recommended_corrections: [
      ...omissions.map((item) => `cover missing requirement: ${item}`),
      ...inventions.map((item) => `remove or mark as proposal: ${item}`),
      ...ambiguities.map((item) => `rewrite with explicit criteria: ${item}`)
    ]
  };
}
