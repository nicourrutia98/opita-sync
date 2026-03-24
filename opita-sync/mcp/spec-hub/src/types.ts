export type Profile = "skill" | "mcp" | "app" | "api";
export type CoverageStatus = "cubierto" | "parcialmente_cubierto" | "no_cubierto" | "contradicho" | "inventado";
export type Verdict = "listo_para_desarrollar" | "listo_con_reservas" | "no_listo";

export interface Assumption {
  text: string;
  impact: "low" | "medium" | "high";
}

export interface RequirementItem {
  id: string;
  statement: string;
  priority?: "must" | "should" | "could";
}

export interface NonFunctionalRequirement {
  id: string;
  statement: string;
  category: "security" | "performance" | "reliability" | "observability" | "maintainability" | "cost";
}

export interface DomainEntity {
  name: string;
  fields?: string[];
  states?: string[];
}

export interface InterfaceContract {
  name: string;
  type: "api" | "event" | "file" | "ui" | "tool";
  input: string;
  output: string;
}

export interface ImplementationPhase {
  phase: string;
  tasks: string[];
  definition_of_done: string[];
}

export interface TraceabilityEntry {
  id: string;
  source_requirement: string;
  technical_interpretation: string;
  documentation_evidence: string;
  coverage_status: CoverageStatus;
  impact: "critical" | "important" | "minor";
  action: string;
}

export interface FidelityReport {
  omissions: string[];
  inventions: string[];
  distortions: string[];
  ambiguities: string[];
  implementation_blockers: string[];
  verdict: Verdict;
}

export interface SpecDocument {
  project_name: string;
  problem_statement: string;
  target_users: string[];
  goals: string[];
  non_goals: string[];
  constraints: string[];
  assumptions: Assumption[];
  functional_requirements: RequirementItem[];
  non_functional_requirements: NonFunctionalRequirement[];
  domain_entities: DomainEntity[];
  interfaces: InterfaceContract[];
  architecture: {
    style: string;
    components: string[];
    integrations: string[];
  };
  implementation_plan: ImplementationPhase[];
  acceptance_criteria: string[];
  traceability_matrix: TraceabilityEntry[];
  fidelity_report: FidelityReport;
  open_questions?: Array<{ question: string; impact: "critical" | "important" | "minor" }>;
}

export interface NormalizedRequirements {
  profile: Profile;
  source_text: string;
  requirements: RequirementItem[];
  constraints: string[];
  non_goals: string[];
  assumptions: Assumption[];
  open_questions: Array<{ question: string; impact: "critical" | "important" | "minor" }>;
}

export interface ContextArtifact {
  id: string;
  kind:
    | "normalized_requirement"
    | "architecture_decision"
    | "spec_snapshot"
    | "traceability_report"
    | "fidelity_report"
    | "session_state"
    | "repo_grounding";
  createdAt: string;
  updatedAt: string;
  sourceRefs: string[];
  payload: unknown;
}
