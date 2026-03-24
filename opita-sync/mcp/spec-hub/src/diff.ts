import type { SpecDocument } from "./types.js";

export function diffRevision(base: SpecDocument, candidate: SpecDocument): {
  semantic_changes: string[];
  breaking_changes: string[];
  lost_coverage: string[];
  new_risks: string[];
} {
  const semanticChanges: string[] = [];
  const breakingChanges: string[] = [];
  const lostCoverage: string[] = [];
  const newRisks: string[] = [];

  if (base.architecture.style !== candidate.architecture.style) {
    semanticChanges.push(`architecture style changed from ${base.architecture.style} to ${candidate.architecture.style}`);
  }

  const baseCriteria = new Set(base.acceptance_criteria);
  for (const criterion of baseCriteria) {
    if (!candidate.acceptance_criteria.includes(criterion)) {
      lostCoverage.push(`missing acceptance criterion: ${criterion}`);
    }
  }

  const baseRequirements = new Set(base.functional_requirements.map((item) => item.id));
  for (const requirement of baseRequirements) {
    if (!candidate.functional_requirements.some((item) => item.id === requirement)) {
      breakingChanges.push(`removed functional requirement ${requirement}`);
    }
  }

  if (candidate.fidelity_report.verdict !== "listo_para_desarrollar") {
    newRisks.push(`candidate verdict is ${candidate.fidelity_report.verdict}`);
  }

  return {
    semantic_changes: semanticChanges,
    breaking_changes: breakingChanges,
    lost_coverage: lostCoverage,
    new_risks: newRisks
  };
}
